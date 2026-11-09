"""Real installation/recovery contract. Only disposable projects created by this test."""
import contextlib
import http.cookiejar
import importlib.util
import json
import os
from pathlib import Path
import secrets
import ssl
import subprocess
import tempfile
import time
import urllib.error
import urllib.request
import uuid

ROOT = Path(__file__).resolve().parents[2]
spec = importlib.util.spec_from_file_location('operations', ROOT / 'deploy/operate.py')
ops = importlib.util.module_from_spec(spec)
spec.loader.exec_module(ops)


def main():
    with tempfile.TemporaryDirectory(prefix='kafofo-smoke-') as tmp:
        directory = Path(tmp)
        (directory / 'password').write_text(secrets.token_hex(32))
        (directory / 'auth').write_text(secrets.token_hex(32))
        commit = os.environ['SOURCE_COMMIT']
        deployments = []
        owned = []
        try:
            for suffix, port in [('source', 18443), ('restore', 19443)]:
                env = directory / f'{suffix}.env'
                env.write_text(f'''COMPOSE_PROJECT_NAME=kafofo16-{suffix}
SOURCE_COMMIT={commit}
APP_VERSION=validation
API_IMAGE=kafofo-api:smoke
WEB_IMAGE=kafofo-web:smoke
DEPLOY_PLATFORM={os.environ.get('DEPLOY_PLATFORM', 'linux/amd64')}
AUTH_BASE_URL=https://localhost:{port}
SITE_ADDRESS=https://localhost
TLS_MODE=internal
PROXY_SUBNET=172.29.{216 if suffix == 'source' else 217}.0/24
PROXY_ADDRESS=172.29.{216 if suffix == 'source' else 217}.2
PROXY_DYNAMIC_RANGE=172.29.{216 if suffix == 'source' else 217}.128/25
HTTP_PORT={port - 1}
HTTPS_PORT={port}
BIND_ADDRESS=127.0.0.1
DB_PASSWORD_FILE={directory / 'password'}
AUTH_SECRET_FILE={directory / 'auth'}
''')
                deployments.append(ops.Deployment(env))
            source, restored = deployments
            for deployment in deployments:
                for resource in ('container', 'volume'):
                    previous = subprocess.check_output(['docker', resource, 'ls', '-q',
                        *(['-a'] if resource == 'container' else []), '--filter',
                        f'label=com.docker.compose.project={deployment.project}'])
                    if previous.strip():
                        raise ValueError('Smoke recusado: projeto já possui recursos. Nada será removido.')
            owned = deployments[:]
            public_env = directory / 'public.env'
            public_env.write_text(source.env_file.read_text().replace('TLS_MODE=internal', 'TLS_MODE=public'))
            assert ops.Deployment(public_env).config['services']['caddy']['environment']['TLS_DIRECTIVE'] == ''
            assert all(not service.get('ports') for name, service in source.config['services'].items()
                       if name != 'caddy')
            source.install()
            # Trust the generated CA; this also verifies persisted Caddy data.
            cert = source.compose('cp', 'caddy:/data/caddy/pki/authorities/local/root.crt',
                                  str(directory / 'root.crt'))
            del cert
            jar = http.cookiejar.CookieJar()
            client = urllib.request.build_opener(
                urllib.request.HTTPSHandler(context=ssl.create_default_context(cafile=directory / 'root.crt')),
                urllib.request.HTTPCookieProcessor(jar))

            def request(path, body=None, status=200, origin=None, extra=None, target=source,
                        actor=None, method=None):
                headers = {'Origin': origin or target.origin, 'Content-Type': 'application/json',
                           **(extra or {})}
                req = urllib.request.Request(target.origin + path,
                    data=json.dumps(body).encode() if body is not None else None, headers=headers,
                    method=method)
                try:
                    response = (actor or client).open(req, timeout=15)
                except urllib.error.HTTPError as error:
                    response = error
                assert response.status == status, (path, response.status, status)
                payload = response.read()
                return json.loads(payload) if payload and path.startswith('/api') else payload

            assert b'<html' in request('/')
            assert request('/api/ready')['status'] == 'ready'
            assert request('/api/auth/setup')['configured'] is False
            code = source.compose('run', '--rm', '--no-deps', 'api', 'node',
                                  'dist/modules/platform/auth/operator.js').stdout.decode().strip()
            password = secrets.token_hex(16)
            request('/api/auth/setup', {'code': code, 'username': 'operator', 'password': password}, 201)
            person = request('/api/auth/login', {'username': 'operator', 'password': password})
            core = request('/api/platform/cores', {'name': 'Smoke'}, 201)
            residence = request(f'/api/platform/cores/{core["id"]}/residences',
                                {'name': 'Smoke', 'responsibleUserId': person['id']}, 201)
            receipt = request(f'/api/kitanda/residences/{residence["id"]}/lists', {'name': 'Saved'}, 201,
                              extra={'Idempotency-Key': str(uuid.uuid4())})
            list_id = receipt['resourceId']
            request(f'/api/kitanda/lists/{list_id}/items', {'name': 'Saved item'}, 201,
                    extra={'Idempotency-Key': str(uuid.uuid4())})
            invitation = request(f'/api/platform/cores/{core["id"]}/invitations', {}, 201)
            request('/api/platform/invitations/register', {
                'token': invitation['link'].split('#invite=')[1], 'username': 'viewer', 'password': password}, 201)
            viewer = urllib.request.build_opener(
                urllib.request.HTTPSHandler(context=ssl.create_default_context(cafile=directory / 'root.crt')),
                urllib.request.HTTPCookieProcessor(http.cookiejar.CookieJar()))
            member = request('/api/auth/login', {'username': 'viewer', 'password': password}, actor=viewer)
            request(f'/api/platform/residences/{residence["id"]}/accesses/{member["id"]}',
                    {'role': 'viewer'}, 204, method='PUT')
            access = next(a for a in request(f'/api/platform/residences/{residence["id"]}/accesses')
                          if a['userId'] == member['id'])
            request(f'/api/kitanda/lists/{list_id}/shares/{access["id"]}', {}, 204, method='PUT')
            assert request(f'/api/kitanda/lists/{list_id}', actor=viewer)['canWrite'] is False
            request(f'/api/kitanda/lists/{list_id}/items', {'name': 'Forbidden'}, 403,
                    extra={'Idempotency-Key': str(uuid.uuid4())}, actor=viewer)
            expired = request(f'/api/kitanda/lists/{list_id}/items', {'name': 'Expired content'}, 201,
                              extra={'Idempotency-Key': str(uuid.uuid4())})['resourceId']
            # Forged proxy headers cannot alter Origin policy or split IP quotas.
            request('/api/auth/login', {'username': 'operator', 'password': password}, 403,
                    origin='https://forged.test', extra={'X-Forwarded-Host': 'localhost'})
            for index in range(31):
                request('/api/auth/recovery/preview', {'token': 'invalid'}, 429 if index == 30 else 404,
                        extra={'X-Forwarded-For': f'198.51.100.{index + 1}'})
            source.compose('restart', 'api', 'caddy')
            time.sleep(4)
            assert request('/api/auth/setup')['configured'] is True
            assert request(f'/api/kitanda/lists/{list_id}/history')['events']
            source.compose('run', '--rm', '--no-deps', '--user', 'root', 'api', 'sh', '-c',
                           'echo persistent > /var/lib/kafofo/sentinel')
            start = time.monotonic()
            backup = ops.backup(source, directory / 'backups', 'daily')
            print(f'Maintenance seconds: {time.monotonic() - start:.2f}')
            assert request('/api/ready')['status'] == 'ready'
            # Freeze an overdue row into the pre-update snapshot, before startup purges run.
            source.pause()
            source.sql(f'''update kitanda.items set "deletedAt"=clock_timestamp()-interval '721 hours'
                           where id='{expired}' ''')
            pre = ops.backup(source, directory / 'backups', 'pre-update')
            assert not {'api', 'caddy'} & set(source.running())
            source.sql('delete from drizzle.__drizzle_migrations')
            try:
                source.migrate()
                raise AssertionError('broken migration unexpectedly passed')
            except RuntimeError:
                pass
            assert not {'api', 'caddy'} & set(source.running())
            ops.verify_backup(pre)
            restored.restore(pre)
            assert restored.sql('select count(*) from platform.session').strip() == b'0'
            assert restored.sql('select count(*) from kitanda.history_events').strip() != b'0'
            assert restored.sql('select configured from platform.auth_setup').strip() == b't'
            assert restored.sql(f"select count(*) from kitanda.items where id='{expired}'").strip() == b'0'
            assert restored.sql(f"select role from platform.residence_accesses where id='{access['id']}'").strip() == b'viewer'
            restored.compose('run', '--rm', '--no-deps', 'api', 'sh', '-c',
                             'test "$(cat /var/lib/kafofo/sentinel)" = persistent')
            # Restore never starts public entry; repeated restore cannot overwrite volumes.
            assert 'caddy' not in restored.running()
            try:
                restored.open()
                raise AssertionError('unreconciled restore opened')
            except ValueError:
                pass
            # An operational revocation after the snapshot must be reapplied before opening.
            restored.sql(f'''update platform.residence_accesses set "revokedAt"=clock_timestamp()
                             where id='{access["id"]}' ''')
            # Verify login and authorization on the private network before certifying reopening.
            restored.compose('up', '-d', '--wait', 'api')
            def private(path, body=None, cookie=None):
                script = '''let raw=''; for await (const chunk of process.stdin) raw+=chunk;
                  const input=JSON.parse(raw);
                  const headers={Origin:process.env.AUTH_BASE_URL,'Content-Type':'application/json'};
                  if(input.cookie) headers.Cookie=input.cookie;
                  const response=await fetch('http://127.0.0.1:4304'+input.path,{
                    method:input.body?'POST':'GET',headers,
                    ...(input.body?{body:JSON.stringify(input.body)}:{})});
                  process.stdout.write(JSON.stringify({status:response.status,
                    body:await response.json(),cookies:response.headers.getSetCookie()}));'''
                return json.loads(restored.compose('exec', '-T', 'api', 'node', '--input-type=module',
                    '-e', script, input=json.dumps({'path':path,'body':body,'cookie':cookie}).encode()).stdout)
            login = private('/api/auth/login', {'username':'viewer','password':password})
            assert login['status'] == 200
            cookie = '; '.join(value.split(';')[0] for value in login['cookies'])
            assert private(f'/api/kitanda/lists/{list_id}', cookie=cookie)['status'] == 404
            assert private(f'/api/kitanda/lists/{list_id}/history', cookie=cookie)['status'] == 404
            login = private('/api/auth/login', {'username':'operator','password':password})
            assert login['status'] == 200
            cookie = '; '.join(value.split(';')[0] for value in login['cookies'])
            history = private(f'/api/kitanda/lists/{list_id}/history', cookie=cookie)
            assert history['status'] == 200 and 'Expired content' not in json.dumps(history['body'])
            assert 'caddy' not in restored.running()
            record = json.loads(restored.recovery_marker.read_text())
            record.update(revocationsReconciled=True, checksPassed=True,
                          operator='smoke', evidence='disposable-fixture')
            reconciliation = directory / 'reconciliation.json'
            reconciliation.write_text(json.dumps(record))
            restored.open(reconciliation)
            restored.compose('cp', 'caddy:/data/caddy/pki/authorities/local/root.crt',
                             str(directory / 'restored-root.crt'))
            recovered_client = urllib.request.build_opener(
                urllib.request.HTTPSHandler(context=ssl.create_default_context(cafile=directory / 'restored-root.crt')),
                urllib.request.HTTPCookieProcessor(http.cookiejar.CookieJar()))
            request('/api/auth/session', status=401, actor=recovered_client, target=restored)
            request('/api/auth/login', {'username': 'viewer', 'password': password},
                    actor=recovered_client, target=restored)
            request(f'/api/kitanda/lists/{list_id}', status=404, actor=recovered_client, target=restored)
            request(f'/api/kitanda/lists/{list_id}/history', status=404, actor=recovered_client, target=restored)
            request('/api/auth/login', {'username': 'operator', 'password': password},
                    actor=recovered_client, target=restored)
            history = request(f'/api/kitanda/lists/{list_id}/history', actor=recovered_client,
                              target=restored)['events']
            assert history and 'Expired content' not in json.dumps(history)
            try:
                restored.restore(backup)
                raise AssertionError('non-empty restore accepted')
            except ValueError:
                pass
            print('PASS: TLS, proxy, setup, persistence, data recovery and maintenance gates')
        except Exception:
            # Only disposable credentials/data exist in this test. Preserve diagnostics locally.
            diagnostic = Path('/tmp/kafofo16-smoke-diagnostics.tar')
            for deployment in deployments:
                if hasattr(deployment, 'last_error'):
                    print(deployment.last_error.decode(), flush=True)
            with contextlib.suppress(RuntimeError):
                if not owned:
                    raise RuntimeError('No disposable resources to inspect')
                with diagnostic.open('wb') as output:
                    os.chmod(diagnostic, 0o600)
                    source.compose('run', '--rm', '--no-deps', '-T', '--user', 'root',
                                   '--entrypoint', 'tar', 'api', '-C', '/logs', '-cf', '-', '.', stdout=output)
            raise
        finally:
            for deployment in owned:
                deployment.compose('down', '--volumes', '--remove-orphans')
                deployment.recovery_marker.unlink(missing_ok=True)
                deployment.recovery_marker.with_suffix('.verified.json').unlink(missing_ok=True)


if __name__ == '__main__':
    main()
