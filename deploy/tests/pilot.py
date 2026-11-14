"""Private Alpha 1 pilot helpers. Never print operator configuration or credentials."""
import argparse
import contextlib
from datetime import datetime, timezone
import fcntl
import hashlib
import http.cookiejar
import importlib.util
import json
import os
from pathlib import Path
import socket
import ssl
import subprocess
import time
import traceback
import uuid
import urllib.parse
import urllib.request
import urllib.error


def operations(candidate):
    spec = importlib.util.spec_from_file_location('pilot_operations', candidate / 'deploy/operate.py')
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def save(path, value):
    path.write_text(json.dumps(value, indent=2) + '\n')
    path.chmod(0o600)


@contextlib.contextmanager
def locked(deployment):
    deployment.recovery_marker.parent.mkdir(mode=0o700, exist_ok=True)
    with (deployment.recovery_marker.parent / f'{deployment.project}.lock').open('w') as lock:
        fcntl.flock(lock, fcntl.LOCK_EX | fcntl.LOCK_NB)
        yield


class Client:
    def __init__(self, deployment, certificate):
        self.origin = deployment.origin
        self.client = urllib.request.build_opener(
            urllib.request.ProxyHandler({}),
            urllib.request.HTTPSHandler(context=ssl.create_default_context(cafile=certificate)),
            urllib.request.HTTPCookieProcessor(http.cookiejar.CookieJar()))

    def request(self, path, data=None, method=None, status=200, key=None):
        headers = {'Origin': self.origin}
        if key is not None:
            headers['Idempotency-Key'] = key
        if data is not None:
            headers['Content-Type'] = 'application/json'
        request = urllib.request.Request(self.origin + path,
            data=None if data is None else json.dumps(data).encode(), headers=headers, method=method)
        try:
            response = self.client.open(request, timeout=15)
        except urllib.error.HTTPError as error:
            response = error
        if response.status != status:
            raise ValueError(f'Resposta inesperada: {method or "GET"} {path} ({response.status}).')
        body = response.read()
        return json.loads(body) if body and path.startswith('/api') else None


def identity(directory, deployment, username, certificate='pilot-root.crt'):
    account = json.loads((directory / 'accounts.json').read_text())
    client = Client(deployment, directory / certificate)
    client.request('/api/auth/login', {'username': username, 'password': account[username]}, 'POST')
    return client


def relay(deployment, credentials, requests, cookie=None):
    # Secrets travel via stdin only. No host port is published for this pre-opening check.
    script = '''import {readFileSync} from 'node:fs';
const input=JSON.parse(readFileSync(0,'utf8'));
let cookie=input.cookie||'';
if(input.credentials){
 const login=await fetch('http://127.0.0.1:4304/api/auth/login',{
  method:'POST',headers:{origin:input.origin,'content-type':'application/json'},body:JSON.stringify(input.credentials)});
 if(login.status!==200) throw new Error('Private validation login failed');
 cookie=login.headers.getSetCookie().map(v=>v.split(';')[0]).join('; ');
}
const results=[];
for(const request of input.requests){
 const response=await fetch('http://127.0.0.1:4304'+request.path,{
  method:request.method||'GET',headers:{origin:input.origin,cookie,
   ...(request.data===undefined?{}:{'content-type':'application/json'}),
   ...(request.key?{'idempotency-key':request.key}:{})},
  ...(request.data===undefined?{}:{body:JSON.stringify(request.data)})});
 const text=await response.text();
 results.push({status:response.status,body:text?JSON.parse(text):null});
}
process.stdout.write(JSON.stringify(results));'''
    payload = {'origin': deployment.origin, 'credentials': credentials,
               'requests': requests, 'cookie': cookie}
    return json.loads(deployment.compose('exec', '-T', 'api', 'node', '--input-type=module',
                      '-e', script, input=json.dumps(payload).encode()).stdout)


def credentials(directory, username):
    return {'username': username,
            'password': json.loads((directory / 'accounts.json').read_text())[username]}


def reconciliation_operations(fixture):
    people = {p['username']: p['id'] for p in fixture['people']}
    return [
        {'path': f'/api/kitanda/lists/{fixture["backupShareListId"]}/shares/{fixture["memberAccessId"]}', 'method': 'DELETE'},
        {'path': f'/api/platform/cores/{fixture["revocationCoreId"]}/members/{people["piloto-beto"]}', 'method': 'DELETE'},
        {'path': f'/api/platform/residences/{fixture["revokeResidenceId"]}/accesses/{people["piloto-caio"]}', 'method': 'DELETE'},
        {'path': f'/api/platform/residences/{fixture["downgradeResidenceId"]}/accesses/{people["piloto-caio"]}', 'method': 'PUT', 'data': {'role': 'viewer'}},
    ]


def backup_and_revoke(directory, ops):
    source = ops.Deployment(directory / 'pilot.env')
    fixture = json.loads((directory / 'fixture.json').read_text())
    client = identity(directory, source, 'piloto-ana')
    expected = client.request(f'/api/kitanda/lists/{fixture["listId"]}/items')
    source.compose('exec', '-T', 'api', 'node', '-e',
        "require('node:fs').writeFileSync('/var/lib/kafofo/pilot-sentinel.txt','kafofo17-fictional-file\\n')")
    # Keep an unused invitation and recovery in the snapshot to verify invalidation on restore.
    invitation = client.request(f'/api/platform/cores/{fixture["coreId"]}/invitations', {}, 'POST', 201)
    recovery = client.request('/api/auth/recovery/issue', {'username': 'piloto-caio'}, 'POST', 201)
    save(directory / 'temporary-links.json', {'invitation': invitation['link'].split('#invite=')[1],
                                             'recovery': recovery['link'].split('#recover=')[1]})
    started = time.monotonic()
    with locked(source):
        backup = ops.backup(source, directory / 'backups', 'daily')
    elapsed = round(time.monotonic() - started, 2)
    ops.verify_backup(backup)
    save(directory / 'backup-reference.json', {'path': str(backup), 'expected': expected})
    changes = reconciliation_operations(fixture)
    for change in changes:
        client.request(change['path'], change.get('data'), change['method'], 204)
    save(directory / 'revocations-after-backup.json', {
        'cutoff': datetime.now(timezone.utc).isoformat(), 'operations': changes,
        'source': 'Explicit API mutations in the private pilot, after the validated snapshot.',
    })
    save(directory / 'evidence-backup.json', {
        'scenario': 'H10 — backup consistente', 'result': 'passed',
        'maintenanceSeconds': elapsed, 'manifestSha256': ops.checksum(backup / 'manifest.json'),
        'databaseAndFilesVerified': True, 'postBackupChanges': 4,
        'commit': source.commit, 'version': source.version,
    })
    print(f'Backup validado em {elapsed}s; quatro alterações posteriores registradas para reconciliação.')


def require_status(results, statuses):
    if [r['status'] for r in results] != statuses:
        raise ValueError('Verificação privada de autorização falhou.')


def restore(directory, ops):
    reference = json.loads((directory / 'backup-reference.json').read_text())
    fixture = json.loads((directory / 'fixture.json').read_text())
    links = json.loads((directory / 'temporary-links.json').read_text())
    restored = ops.Deployment(directory / 'restore.env')
    source = ops.Deployment(directory / 'pilot.env')
    started = time.monotonic()
    with locked(restored):
        restored.restore(Path(reference['path']))
    for action in (restored.open, restored.install):
        try:
            action()
        except ValueError:
            pass
        else:
            raise ValueError('Checkpoint de reconciliação foi contornado.')
    if 'caddy' in restored.running():
        raise ValueError('Proxy abriu antes da reconciliação.')
    restored.compose('up', '-d', '--wait', 'api')
    old_cookie = '; '.join(f'{c["name"]}={c["value"]}' for c in fixture['oldCookies'])
    require_status(relay(restored, None, [{'path': '/api/auth/session'}], old_cookie), [401])
    invalid = relay(restored, None, [
        {'path': '/api/platform/invitations/preview', 'method': 'POST', 'data': {'token': links['invitation']}},
        {'path': '/api/auth/recovery/preview', 'method': 'POST', 'data': {'token': links['recovery']}},
    ])
    require_status(invalid, [404, 404])
    before = relay(restored, credentials(directory, 'piloto-beto'), [
        {'path': f'/api/kitanda/lists/{fixture["backupShareListId"]}/items'}])
    require_status(before, [200])
    ledger = json.loads((directory / 'revocations-after-backup.json').read_text())
    changes = relay(restored, credentials(directory, 'piloto-ana'), ledger['operations'])
    require_status(changes, [204] * 4)

    # Simulate elapsed retention only in this isolated restored copy, with the entry closed.
    # The pilot's wall clock and timestamps are never changed.
    removed, expired = fixture['removedItemId'], fixture['expiredListId']
    for value in (removed, expired):
        uuid.UUID(value)
    restored.sql(f'''update kitanda.items set "deletedAt"=clock_timestamp()-interval '720 hours' where id='{removed}';
        update kitanda.lists set "deletedAt"=clock_timestamp()-interval '720 hours' where id='{expired}';
        update platform.recovery_events set "createdAt"=clock_timestamp()-interval '2160 hours' where action='used';''')
    if restored.sql(f"select count(*) from kitanda.items where id='{removed}';").decode().strip() != '1':
        raise ValueError('Fixture removida ausente antes do expurgo.')
    pre_purge = relay(restored, credentials(directory, 'piloto-ana'), [
        {'path': f'/api/kitanda/lists/{expired}/history'},
        {'path': f'/api/kitanda/lists/{fixture["listId"]}/history?limit=50'},
        {'path': '/api/account/export', 'method': 'POST', 'data': {'password': credentials(directory, 'piloto-ana')['password']}},
    ])
    require_status(pre_purge, [404, 200, 200])
    residual = [t for e in pre_purge[1]['body']['events'] for t in e['targets'] if t['itemId'] == removed]
    if not residual or any(t['details'] is not None for t in residual):
        raise ValueError('Conteúdo vencido apareceu no histórico antes do expurgo.')
    restored.pause()
    restored.compose('run', '--rm', '--no-deps', 'api', 'node', 'dist/operations/recover.js')
    counts = restored.sql(f'''select
      (select count(*) from platform."user"),
      (select count(*) from kitanda.items where id='{removed}'),
      (select count(*) from kitanda.lists where id='{expired}'),
      (select count(*) from kitanda.history_events where "listId"='{expired}'),
      (select count(*) from platform.recovery_events where action='used');''').decode().strip()
    if counts != '3|0|0|0|0':
        raise ValueError('Contas ou expurgos divergiram na cópia restaurada.')
    restored.compose('up', '-d', '--wait', 'api')
    owner = relay(restored, credentials(directory, 'piloto-ana'), [
        {'path': f'/api/kitanda/lists/{fixture["listId"]}/items'},
        {'path': f'/api/kitanda/lists/{fixture["listId"]}/history?limit=50'},
        {'path': '/api/auth/setup'},
    ])
    require_status(owner, [200, 200, 200])
    if owner[0]['body'] != reference['expected'] or owner[2]['body']['configured'] is not True:
        raise ValueError('Lista, itens ou configuração não foram preservados.')
    residual = [t for e in owner[1]['body']['events'] for t in e['targets'] if t['itemId'] == removed]
    if not residual or any(t['details'] is not None for t in residual):
        raise ValueError('Histórico residual divergiu após expurgo.')
    member = relay(restored, credentials(directory, 'piloto-beto'), [
        {'path': f'/api/kitanda/lists/{fixture["backupShareListId"]}/items'},
        {'path': f'/api/kitanda/lists/{fixture["backupShareListId"]}/history'},
        {'path': '/api/platform/contexts'},
    ])
    require_status(member, [404, 404, 200])
    if any(c['id'] == fixture['revocationCoreId'] for c in member[2]['body']['cores']):
        raise ValueError('Vínculo de núcleo revogado ressuscitou.')
    viewer = relay(restored, credentials(directory, 'piloto-caio'), [{'path': '/api/platform/contexts'}])
    require_status(viewer, [200])
    homes = viewer[0]['body']['residences']
    if any(r['id'] == fixture['revokeResidenceId'] for r in homes):
        raise ValueError('Acesso residencial revogado ressuscitou.')
    if not any(r['id'] == fixture['downgradeResidenceId'] and r['role'] == 'viewer' for r in homes):
        raise ValueError('Rebaixamento posterior ao backup não foi reconciliado.')
    sentinel = restored.compose('exec', '-T', 'api', 'node', '-e',
        "process.stdout.write(require('node:fs').readFileSync('/var/lib/kafofo/pilot-sentinel.txt'))").stdout
    if sentinel != b'kafofo17-fictional-file\n':
        raise ValueError('Arquivo persistente restaurado divergiu.')
    restored.pause()
    marker = json.loads(restored.recovery_marker.read_text())
    marker.pop('restored')
    marker.update({'revocationsReconciled': True, 'checksPassed': True,
                   'operator': 'operador do piloto #17', 'evidence': 'evidence-restoration.json / issue #17'})
    save(directory / 'reconciliation.json', marker)
    with locked(restored):
        restored.open(directory / 'reconciliation.json')
    restored.compose('cp', 'caddy:/data/caddy/pki/authorities/local/root.crt', str(directory / 'restore-root.crt'))
    for username in ('piloto-ana', 'piloto-beto', 'piloto-caio'):
        client = identity(directory, restored, username, 'restore-root.crt')
        client.request('/api/platform/contexts')
    source_volumes = {v['name'] for v in source.config['volumes'].values()}
    restore_volumes = {v['name'] for v in restored.config['volumes'].values()}
    if source_volumes & restore_volumes or source.origin == restored.origin:
        raise ValueError('Restauração compartilhou volumes ou origem.')
    save(directory / 'evidence-restoration.json', {
        'scenario': 'H11 — restauração isolada e reconciliação', 'result': 'passed',
        'restoreSeconds': round(time.monotonic() - started, 2), 'accounts': 3,
        'sessionsAndTemporaryLinksInvalidated': True, 'postBackupRevocationsReconciled': 4,
        'mainListAndItemsPreserved': True, 'expiredListAndHistoryPurged': True,
        'expiredItemPurgedResidualHistoryPreserved': True, 'expiredSecurityPurged': True,
        'sentinelSha256': hashlib.sha256(sentinel).hexdigest(), 'volumesAndOriginIsolated': True,
        'clockControl': 'Only tombstone/recovery timestamps in the isolated restored copy; pilot unchanged.',
        'privateValidationBeforeOpening': True, 'threeHttpsLoginsAfterOpening': True,
        'project': restored.project, 'origin': restored.origin, 'commit': restored.commit,
    })
    print('Restauração, expurgos e quatro revogações reconciliados; três logins HTTPS conferidos.')


def clock_check(directory, ops):
    """Use a third disposable clone. Never change the host clock or the pilot's timestamps."""
    reference = json.loads((directory / 'backup-reference.json').read_text())
    fixture = json.loads((directory / 'fixture.json').read_text())
    clock = ops.Deployment(directory / 'clock.env')
    if clock.project != 'kafofo17-clock':
        raise ValueError('Relógio controlado exige o clone descartável exclusivo.')
    with locked(clock):
        clock.restore(Path(reference['path']))
    clock.compose('up', '-d', '--wait', 'api')
    item_id, list_id = fixture['removedItemId'], fixture['expiredListId']
    uuid.UUID(item_id)
    uuid.UUID(list_id)
    account = credentials(directory, 'piloto-ana')
    clock.sql(f'''update kitanda.lists set "deletedAt"=clock_timestamp()-interval '719 hours 59 minutes' where id='{list_id}';
        update kitanda.items set "deletedAt"=clock_timestamp()-interval '719 hours 59 minutes' where id='{item_id}';''')
    before = relay(clock, account, [
        {'path': f'/api/kitanda/lists/{fixture["listId"]}/history?limit=50'},
        {'path': f'/api/kitanda/lists/{list_id}/restore', 'method': 'POST',
         'data': {'expectedRevision': 2}, 'key': str(uuid.uuid4())},
    ])
    require_status(before, [200, 200])
    targets = [t for e in before[0]['body']['events'] for t in e['targets'] if t['itemId'] == item_id]
    if not targets or not any(t['details'] is not None for t in targets):
        raise ValueError('Conteúdo ainda recuperável foi redigido antes do prazo.')
    deleted = relay(clock, account, [
        {'path': f'/api/kitanda/lists/{list_id}', 'method': 'DELETE',
         'data': {'expectedRevision': before[1]['body']['version']}, 'key': str(uuid.uuid4())},
    ])
    require_status(deleted, [200])
    clock.sql(f'''update kitanda.lists set "deletedAt"=clock_timestamp()-interval '720 hours' where id='{list_id}';
        update kitanda.items set "deletedAt"=clock_timestamp()-interval '720 hours' where id='{item_id}';
        update platform.security_events set "createdAt"=clock_timestamp()-interval '2160 hours';
        update platform.recovery_events set "createdAt"=clock_timestamp()-interval '2160 hours';''')
    physical_security = int(clock.sql('select (select count(*) from platform.security_events)+(select count(*) from platform.recovery_events);').decode())
    if physical_security == 0:
        raise ValueError('Fixture de auditoria ausente antes do expurgo.')
    limit = relay(clock, account, [
        {'path': f'/api/kitanda/lists/{list_id}/restore', 'method': 'POST',
         'data': {'expectedRevision': deleted[0]['body']['version']}, 'key': str(uuid.uuid4())},
        {'path': f'/api/kitanda/lists/{list_id}/history'},
        {'path': f'/api/kitanda/lists/{fixture["listId"]}/history?limit=50'},
        {'path': '/api/account/export', 'method': 'POST', 'data': {'password': account['password']}},
    ])
    require_status(limit, [404, 404, 200, 200])
    targets = [t for e in limit[2]['body']['events'] for t in e['targets'] if t['itemId'] == item_id]
    exported = limit[3]['body']
    if (not targets or any(t['details'] is not None for t in targets)
            or exported['securityEvents'] or any(e['listId'] == list_id for e in exported['kitandaActions'])):
        raise ValueError('Dados vencidos apareceram antes do expurgo físico.')
    if clock.sql(f"select count(*) from kitanda.items where id='{item_id}';").decode().strip() != '1':
        raise ValueError('Fixture não comprovou separação entre filtro e expurgo.')
    clock.pause()
    clock.compose('run', '--rm', '--no-deps', 'api', 'node', 'dist/operations/recover.js')
    counts = clock.sql(f'''select
      (select count(*) from kitanda.items where id='{item_id}'),
      (select count(*) from kitanda.lists where id='{list_id}'),
      (select count(*) from kitanda.history_events where "listId"='{list_id}'),
      (select count(*) from platform.security_events),
      (select count(*) from platform.recovery_events);''').decode().strip()
    if counts != '0|0|0|0|0':
        raise ValueError('Expurgo não drenou os candidatos vencidos.')
    clock.compose('down', '--volumes', '--remove-orphans')
    save(directory / 'evidence-clock.json', {
        'scenario': 'H12 — limites e expurgos com tempo controlado', 'result': 'passed',
        'before720hRestoreStatus': 200, 'at720hRestoreStatus': 404,
        'itemContentBeforeLimit': True, 'itemContentRedactedAtLimitBeforePhysicalPurge': True,
        'expiredAuditPhysicallyPresentBeforePurge': physical_security,
        'expiredAuditVisibleInExport': 0, 'expiredListActionsInExport': 0,
        'purgeCounts': counts, 'project': clock.project, 'resourcesRemoved': True,
        'control': 'Only fixture timestamps in a third disposable clone; host/pilot clocks unchanged.',
        'commit': clock.commit,
    })
    print('Limites 720h/2160h e expurgos conferidos; clone de relógio removido.')


def prepare(candidate, directory, ops):
    source = ops.Deployment(directory / 'pilot.env')
    source.verify_images()
    source.compose('cp', 'caddy:/data/caddy/pki/authorities/local/root.crt',
                   str(directory / 'pilot-root.crt'))
    origin = urllib.parse.urlsplit(source.origin)
    context = ssl.create_default_context(cafile=directory / 'pilot-root.crt')
    with socket.create_connection((origin.hostname, origin.port or 443), timeout=15) as raw:
        with context.wrap_socket(raw, server_hostname=origin.hostname) as secure:
            tls = {'protocol': secure.version(), 'chainAndNameVerified': True,
                   'leafSha256': hashlib.sha256(secure.getpeercert(binary_form=True)).hexdigest()}
    client = urllib.request.build_opener(urllib.request.ProxyHandler({}),
                                        urllib.request.HTTPSHandler(context=context))
    for path in ('/', '/api/health', '/api/ready', '/api/auth/setup'):
        with client.open(source.origin + path, timeout=15) as response:
            if response.status != 200:
                raise ValueError('Frontend/saúde indisponível.')
            if path.endswith('/setup') and json.load(response)['configured']:
                raise ValueError('Piloto já configurado; não repetir instalação inicial.')
    code = source.compose('run', '--rm', '--no-deps', 'api', 'node',
                          'dist/modules/platform/auth/operator.js').stdout.decode().strip()
    (directory / 'setup-code').write_text(code)
    (directory / 'setup-code').chmod(0o600)
    save(directory / 'config.json', {
        'directory': str(directory), 'candidateRoot': str(candidate), 'project': source.project,
        'origin': source.origin, 'commit': source.commit, 'version': source.version,
    })
    save(directory / 'evidence-tls.json', tls)
    print('TLS 1.3/cadeia/nome e instalação inicial verificados; configuração restrita pronta.')


def inventory(directory, ops):
    source = ops.Deployment(directory / 'pilot.env')
    source.verify_images()
    images = {}
    for service in ('api', 'caddy', 'db'):
        image = source.config['services'][service]['image']
        info = json.loads(subprocess.check_output(['docker', 'image', 'inspect', image]))[0]
        images[service] = {
            'reference': image, 'configDigest': info['Id'], 'architecture': info['Architecture'],
            'repoDigests': info.get('RepoDigests', []),
            'revision': info['Config'].get('Labels', {}).get('org.opencontainers.image.revision'),
        }
    ids = source.compose('ps', '-a', '-q').stdout.decode().split()
    containers = json.loads(subprocess.check_output(['docker', 'inspect', *ids]))
    services = []
    for info in containers:
        service = info['Config']['Labels']['com.docker.compose.service']
        ports = [p['HostPort'] for values in (info['NetworkSettings'].get('Ports') or {}).values()
                 for p in (values or [])]
        if service != 'caddy' and ports:
            raise ValueError('Serviço interno publicou porta no host.')
        if service in ('api', 'caddy') and info['Image'] != images[service]['configDigest']:
            raise ValueError('Container diverge da imagem candidata.')
        services.append({'service': service, 'imageConfigDigest': info['Image'],
                         'publishedPorts': ports, 'status': info['State']['Status']})
    save(directory / 'evidence-inventory.json', {
        'commit': source.commit, 'version': source.version, 'platform': 'linux/amd64',
        'project': source.project, 'origin': source.origin, 'tlsMode': 'internal',
        'postgresVersion': source.sql('show server_version;').decode().strip(),
        'images': images, 'services': services,
        'digestScope': 'Local image configuration SHA-256; registry digests only where present.',
    })
    print('Inventário sanitizado salvo; imagens e portas em execução conferidas.')


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--candidate-root', required=True, type=Path)
    parser.add_argument('--private-directory', required=True, type=Path)
    parser.add_argument('command', choices=('prepare', 'restart', 'inventory', 'backup-and-revoke', 'restore', 'clock'))
    args = parser.parse_args()
    os.umask(0o077)
    candidate, directory = args.candidate_root.resolve(), args.private_directory.resolve()
    if not directory.is_dir() or directory.stat().st_mode & 0o077:
        raise ValueError('Diretório operacional deve ser restrito (0700).')
    ops = operations(candidate)
    source = ops.Deployment(directory / 'pilot.env')
    if not source.project.startswith('kafofo17-'):
        raise ValueError('Somente projetos dedicados da #17 são permitidos.')
    head = subprocess.check_output(['git', '-C', str(candidate), 'rev-parse', 'HEAD']).decode().strip()
    if head != source.commit:
        raise ValueError('Checkout difere do candidato configurado.')
    try:
        if args.command == 'prepare':
            prepare(candidate, directory, ops)
        elif args.command == 'inventory':
            inventory(directory, ops)
        elif args.command == 'backup-and-revoke':
            backup_and_revoke(directory, ops)
        elif args.command == 'restore':
            restore(directory, ops)
        elif args.command == 'clock':
            clock_check(directory, ops)
        else:
            source.compose('restart', 'db', 'logs', 'api', 'caddy')
            source.compose('up', '-d', '--wait', 'api', 'caddy')
            print('Serviços do piloto reiniciados e saudáveis.')
    except Exception:
        with (directory / 'diagnostic.log').open('a') as log:
            traceback.print_exc(file=log)
        raise SystemExit('Verificação interrompida; consulte diagnóstico operacional restrito.')


if __name__ == '__main__':
    main()
