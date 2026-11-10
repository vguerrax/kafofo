#!/usr/bin/env python3
"""Operator-only Compose orchestration. No shell evaluation of configuration or secrets."""
import argparse
from datetime import datetime, timezone
import fcntl
import hashlib
import json
import os
from pathlib import Path
import re
import shutil
import subprocess
import sys
import tarfile
import tempfile
import time

ROOT = Path(__file__).resolve().parents[1]
PAYLOADS = {'database.dump', 'files.tar'}


def checksum(path):
    with path.open('rb') as stream:
        return hashlib.file_digest(stream, 'sha256').hexdigest()


def write_manifest(path, metadata):
    metadata = {**metadata, 'checksums': {name: checksum(path / name) for name in sorted(PAYLOADS)}}
    (path / 'manifest.json').write_text(json.dumps(metadata, indent=2) + '\n')


def verify_backup(path):
    if path.is_symlink():
        raise ValueError('Cópia não pode ser link simbólico.')
    metadata = json.loads((path / 'manifest.json').read_text())
    if metadata.get('format') != 1 or set(metadata.get('checksums', {})) != PAYLOADS:
        raise ValueError('Manifesto incompatível.')
    for name in PAYLOADS:
        file = path / name
        if file.is_symlink() or checksum(file) != metadata['checksums'][name]:
            raise ValueError('Cópia incompleta ou checksum divergente.')
    return metadata


def rotate_daily(destination):
    valid = []
    for path in sorted(destination.glob('daily-*')):
        try:
            metadata = verify_backup(path)
            if metadata['kind'] == 'daily':
                valid.append(path)
        except (ValueError, OSError, KeyError):
            continue
    for path in valid[:-7]:
        shutil.rmtree(path)


def validate_restore(metadata, project, origin, commit):
    if (metadata['project'] == project or metadata['origin'] == origin
            or metadata['commit'] != commit):
        raise ValueError('Restauração exige projeto/origem próprios e o commit da cópia.')


def backup(deployment, destination, kind):
    destination.mkdir(parents=True, exist_ok=True, mode=0o700)
    stamp = datetime.now(timezone.utc).strftime('%Y%m%dT%H%M%S%fZ')
    final = destination / f'{kind}-{stamp}'
    temporary = Path(tempfile.mkdtemp(prefix='.incomplete-', dir=destination))
    started = time.monotonic()
    running = []
    try:
        running = deployment.pause()
        deployment.dump(temporary)
        write_manifest(temporary, {
            'format': 1, 'kind': kind, 'createdAt': datetime.now(timezone.utc).isoformat(),
            'project': deployment.project, 'origin': deployment.origin,
            'version': deployment.version, 'commit': deployment.commit,
        })
        verify_backup(temporary)
        # Ensure payloads reach the filesystem before atomic publication/rotation.
        for path in temporary.iterdir():
            with path.open('rb') as stream:
                os.fsync(stream.fileno())
        directory_fd = os.open(temporary, os.O_RDONLY)
        try:
            os.fsync(directory_fd)
        finally:
            os.close(directory_fd)
        temporary.rename(final)
        fd = os.open(destination, os.O_RDONLY)
        try:
            os.fsync(fd)
        finally:
            os.close(fd)
        if kind == 'daily':
            rotate_daily(destination)
        print(f'Cópia validada: {final.name}')
        return final
    finally:
        if temporary.exists():
            shutil.rmtree(temporary)
        if kind == 'daily':
            deployment.resume(running)
            print(f'Janela de manutenção: {time.monotonic() - started:.2f}s')
        else:
            print(f'Cópia pré-atualização: {time.monotonic() - started:.2f}s; entrada permanece parada.')


class Deployment:
    def __init__(self, env_file):
        self.env_file = Path(env_file).resolve(strict=True)
        self.environment = os.environ.copy()
        keys = [line.partition('=')[0] for line in (ROOT / 'deploy/.env.example').read_text().splitlines()
                if line and not line.startswith('#')]
        for key in [*keys, 'TLS_DIRECTIVE', 'COMPOSE_PROFILES', 'COMPOSE_ENV_FILES']:
            self.environment.pop(key, None)
        # Do not let unrelated development/shell variables override operator config.
        for line in self.env_file.read_text().splitlines():
            if line and not line.lstrip().startswith('#'):
                key, separator, value = line.partition('=')
                if not separator or not re.fullmatch(r'[A-Z][A-Z0-9_]*', key):
                    raise ValueError('Use configuração KEY=value literal, sem shell.')
                self.environment[key] = value
        self.project = self.environment.get('COMPOSE_PROJECT_NAME', '')
        self.origin = self.environment.get('AUTH_BASE_URL', '')
        self.commit = self.environment.get('SOURCE_COMMIT', '')
        self.version = self.environment.get('APP_VERSION', '')
        if (not re.fullmatch(r'[a-z0-9][a-z0-9-]{1,50}', self.project)
                or not re.fullmatch(r'[a-f0-9]{40}', self.commit) or not self.version
                or not self.origin.startswith('https://')):
            raise ValueError('Configure projeto, origem HTTPS, versão e commit completo.')
        mode = self.environment.get('TLS_MODE', '')
        if mode not in ('public', 'internal'):
            raise ValueError('TLS_MODE deve ser public ou internal.')
        self.environment['TLS_DIRECTIVE'] = 'tls internal' if mode == 'internal' else ''
        self.base = ['docker', 'compose', '--env-file', str(self.env_file), '-p', self.project,
                     '-f', str(ROOT / 'deploy/compose.yaml')]
        self.config = json.loads(self.compose('config', '--format', 'json').stdout)

    def compose(self, *args, input=None, stdin=None, stdout=subprocess.PIPE):
        # Capture stderr: tools can print connection strings/configuration on failure.
        result = subprocess.run([*self.base, *args], env=self.environment,
                                input=input, stdin=stdin, stdout=stdout, stderr=subprocess.PIPE)
        if result.returncode:
            self.last_error = result.stderr
            raise RuntimeError(f'Compose falhou ({args[0]}). Consulte logs locais protegidos.')
        return result

    @property
    def recovery_marker(self):
        return ROOT / 'deploy/state' / f'{self.project}.recovery.json'

    def verify_images(self):
        for service in ('api', 'caddy'):
            image = self.config['services'][service]['image']
            result = subprocess.run(['docker', 'image', 'inspect', image],
                                    capture_output=True, check=True)
            info = json.loads(result.stdout)[0]
            if (info['Config'].get('Labels', {}).get('org.opencontainers.image.revision') != self.commit or
                    info['Config'].get('Labels', {}).get('org.opencontainers.image.version') != self.version):
                raise ValueError('Imagem local não corresponde ao SOURCE_COMMIT configurado.')
            platform = self.environment['DEPLOY_PLATFORM'].split('/')[-1]
            if info['Architecture'] != platform:
                raise ValueError('Arquitetura da imagem não corresponde à configuração.')

    def sql(self, statement):
        return self.compose('exec', '-T', 'db', 'psql', '-X', '-v', 'ON_ERROR_STOP=1',
                            '-U', 'kafofo', '-d', 'kafofo', '-At', input=statement.encode()).stdout

    def running(self):
        return self.compose('ps', '--services', '--status', 'running').stdout.decode().split()

    def pause(self):
        running = [name for name in self.running() if name in ('caddy', 'api')]
        self.compose('stop', 'caddy')
        self.compose('stop', 'api')
        if {'api', 'caddy'} & set(self.running()):
            raise RuntimeError('Escritores ainda ativos; cópia cancelada.')
        one_off = subprocess.check_output(['docker', 'ps', '-q', '--filter',
            f'label=com.docker.compose.project={self.project}', '--filter',
            'label=com.docker.compose.service=api']).strip()
        if one_off:
            raise RuntimeError('Há comando temporário da API ativo; mantenha a entrada bloqueada.')
        return running

    def resume(self, services):
        for service in ('api', 'caddy'):
            if service in services:
                self.compose('up', '-d', '--wait', service)

    def database(self):
        self.compose('up', '-d', '--wait', 'db', 'logs')

    def migrate(self):
        self.verify_images()
        self.database()
        self.compose('run', '--rm', '--no-deps', 'api', 'node', 'dist/database/migrate.js')

    def install(self):
        if self.recovery_marker.exists():
            raise ValueError('Restauração aguarda reconciliação; use open com registro operacional.')
        self.pause()
        self.migrate()
        self.compose('up', '-d', '--wait', 'api', 'caddy')

    def dump(self, target):
        self.verify_images()
        container = self.compose('ps', '-a', '-q', 'api').stdout.decode().strip()
        if container:
            info = json.loads(subprocess.check_output(['docker', 'inspect', container]))[0]
            labels = info['Config'].get('Labels', {})
            if (labels.get('org.opencontainers.image.revision') != self.commit or
                    labels.get('org.opencontainers.image.version') != self.version):
                raise ValueError('Configuração diverge da API instalada; não é possível identificar a cópia.')
        with (target / 'database.dump').open('wb') as output:
            self.compose('exec', '-T', 'db', 'pg_dump', '-U', 'kafofo', '-d', 'kafofo',
                         '--format=custom', '--no-owner', '--no-acl', stdout=output)
        # The app owns this volume; API server and all its timers are stopped.
        with (target / 'files.tar').open('wb') as output:
            self.compose('run', '--rm', '--no-deps', '-T', '--entrypoint', 'tar', 'api',
                         '-C', '/var/lib/kafofo', '-cf', '-', '.', stdout=output)
        with (target / 'database.dump').open('rb') as stream:
            self.compose('exec', '-T', 'db', 'pg_restore', '--list', stdin=stream)
        with tarfile.open(target / 'files.tar') as archive:
            for member in archive:
                # Data volume is regular files/directories only; never restore device/link entries.
                if (member.name.startswith('/') or '..' in Path(member.name).parts
                        or not (member.isfile() or member.isdir())):
                    raise ValueError('Arquivo de dados contém caminho ou tipo não permitido.')

    def restore(self, path):
        metadata = verify_backup(path)
        validate_restore(metadata, self.project, self.origin, self.commit)
        self.verify_images()
        with tarfile.open(path / 'files.tar') as archive:
            if any(m.name.startswith('/') or '..' in Path(m.name).parts or
                   not (m.isfile() or m.isdir()) for m in archive):
                raise ValueError('Arquivo de dados inseguro.')
        # Reject even stopped previous installations. No implicit overwrite or shared volumes.
        existing = subprocess.run(['docker', 'volume', 'ls', '-q', '--filter',
                                  f'label=com.docker.compose.project={self.project}'],
                                 capture_output=True, check=True).stdout.strip()
        if existing or self.running():
            raise ValueError('Projeto de restauração deve estar vazio, sem volumes anteriores.')
        self.recovery_marker.parent.mkdir(exist_ok=True, mode=0o700)
        self.recovery_marker.write_text(json.dumps({
            'backupManifestSha256': checksum(path / 'manifest.json'), 'origin': self.origin,
            'commit': self.commit, 'restored': False,
        }))
        self.database()
        with (path / 'database.dump').open('rb') as stream:
            self.compose('exec', '-T', 'db', 'pg_restore', '-U', 'kafofo', '-d', 'kafofo',
                         '--exit-on-error', '--single-transaction', '--no-owner', '--no-acl',
                         stdin=stream)
        with (path / 'files.tar').open('rb') as stream:
            self.compose('run', '--rm', '--no-deps', '-T', '--user', 'root', '--entrypoint',
                         'tar', 'api', '-C', '/var/lib/kafofo', '--no-same-owner', '-xf', '-',
                         stdin=stream)
        self.compose('run', '--rm', '--no-deps', '--user', 'root', '--entrypoint', 'chown',
                     'api', '-R', '1000:1000', '/var/lib/kafofo')
        self.compose('run', '--rm', '--no-deps', 'api', 'node', 'dist/operations/recover.js')
        marker = json.loads(self.recovery_marker.read_text())
        marker['restored'] = True
        self.recovery_marker.write_text(json.dumps(marker))
        print('Dados restaurados; acesso permanece bloqueado. Reconcilie revogações e valide antes de abrir.')

    def open(self, reconciliation=None):
        self.verify_images()
        if self.recovery_marker.exists():
            if reconciliation is None:
                raise ValueError('Reabertura exige registro de revogações reconciliadas e validações.')
            record = json.loads(reconciliation.read_text())
            expected = json.loads(self.recovery_marker.read_text())
            if expected.pop('restored', False) is not True:
                raise ValueError('Restauração incompleta; não pode abrir a entrada.')
            if (any(record.get(key) != value for key, value in expected.items()) or
                    record.get('revocationsReconciled') is not True or
                    record.get('checksPassed') is not True or not record.get('operator') or
                    not record.get('evidence')):
                raise ValueError('Registro operacional incompleto ou de outra restauração.')
            self.pause()
            self.compose('run', '--rm', '--no-deps', 'api', 'node', 'dist/operations/recover.js')
        self.compose('up', '-d', '--wait', 'api', 'caddy')
        if self.recovery_marker.exists():
            self.recovery_marker.rename(self.recovery_marker.with_suffix('.verified.json'))


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--env-file', required=True, type=Path)
    commands = parser.add_subparsers(dest='command', required=True)
    for name in ('build', 'install', 'migrate', 'pause', 'status'):
        commands.add_parser(name)
    reopen = commands.add_parser('open')
    reopen.add_argument('--reconciliation', type=Path)
    copy = commands.add_parser('backup')
    copy.add_argument('--destination', required=True, type=Path)
    copy.add_argument('--kind', choices=('daily', 'pre-update'), default='daily')
    restore = commands.add_parser('restore')
    restore.add_argument('copy', type=Path)
    args = parser.parse_args()
    os.umask(0o077)
    deployment = Deployment(args.env_file)
    state = ROOT / 'deploy/state'
    state.mkdir(exist_ok=True, mode=0o700)
    with (state / f'{deployment.project}.lock').open('w') as lock:
        fcntl.flock(lock, fcntl.LOCK_EX | fcntl.LOCK_NB)
        if args.command == 'build':
            head = subprocess.check_output(['git', '-C', str(ROOT), 'rev-parse', 'HEAD']).decode().strip()
            dirty = subprocess.check_output(['git', '-C', str(ROOT), 'status', '--porcelain']).strip()
            if head != deployment.commit or dirty:
                raise ValueError('Build exige checkout limpo no SOURCE_COMMIT informado.')
            deployment.compose('build', 'api', 'caddy')
        elif args.command == 'install':
            deployment.install()
        elif args.command == 'migrate':
            deployment.pause()
            deployment.migrate()
        elif args.command == 'pause':
            deployment.pause()
        elif args.command == 'open':
            deployment.open(args.reconciliation)
        elif args.command == 'backup':
            backup(deployment, args.destination.resolve(), args.kind)
        elif args.command == 'restore':
            deployment.restore(args.copy.resolve())
        elif args.command == 'status':
            print('Serviços ativos: ' + ', '.join(deployment.running()))


if __name__ == '__main__':
    try:
        main()
    except (ValueError, RuntimeError, OSError, subprocess.SubprocessError) as error:
        # Never print subprocess output, arbitrary SQL, or configuration values.
        print(str(error) if isinstance(error, (ValueError, RuntimeError)) else
              'Operação falhou. Confira ambiente, lock e permissões locais.', file=sys.stderr)
        sys.exit(1)
