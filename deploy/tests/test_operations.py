import importlib.util
import json
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch

spec = importlib.util.spec_from_file_location('operations', Path(__file__).parents[1] / 'operate.py')
ops = importlib.util.module_from_spec(spec)
spec.loader.exec_module(ops)


class Backups(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        self.root = Path(self.tmp.name)

    def copy(self, name='daily-20261109T000000Z'):
        path = self.root / name
        path.mkdir()
        (path / 'database.dump').write_bytes(b'postgres dump')
        (path / 'files.tar').write_bytes(b'files')
        ops.write_manifest(path, {'format': 1, 'kind': 'daily', 'project': 'source',
                                  'origin': 'https://source.test', 'commit': 'a' * 40,
                                  'version': 'test', 'createdAt': '2026-11-09T00:00:00Z'})
        return path

    def test_tampering_and_missing_files_are_rejected(self):
        path = self.copy()
        ops.verify_backup(path)
        (path / 'files.tar').write_bytes(b'changed')
        with self.assertRaises(ValueError):
            ops.verify_backup(path)
        (path / 'files.tar').unlink()
        with self.assertRaises((ValueError, FileNotFoundError)):
            ops.verify_backup(path)

    def test_rotation_only_removes_verified_daily_copies(self):
        for day in range(1, 10):
            self.copy(f'daily-202611{day:02}T000000Z')
        before = self.copy('pre-update-20261001T000000Z')
        broken = self.root / 'daily-20261001T000000Z'
        broken.mkdir()
        ops.rotate_daily(self.root)
        self.assertEqual(len([p for p in self.root.glob('daily-*') if (p / 'manifest.json').exists()]), 7)
        self.assertTrue(before.exists())
        self.assertTrue(broken.exists())

    def test_restoration_rejects_same_project_origin_or_commit(self):
        manifest = ops.verify_backup(self.copy())
        for project, origin, commit in [('source', 'https://restore.test', 'a' * 40),
                                       ('restore', 'https://source.test', 'a' * 40),
                                       ('restore', 'https://restore.test', 'b' * 40)]:
            with self.assertRaises(ValueError):
                ops.validate_restore(manifest, project, origin, commit)

    def test_failed_dump_never_promotes_or_rotates_and_resumes_daily(self):
        class Deployment:
            project = 'source'
            origin = 'https://source.test'
            commit = 'a' * 40
            version = 'test'
            def pause(inner): return ['api', 'caddy']
            def resume(inner, services): self.resumed = services
            def dump(inner, target): raise RuntimeError('dump failed')
        self.resumed = []
        with patch.object(ops, 'rotate_daily') as rotate:
            with self.assertRaises(RuntimeError):
                ops.backup(Deployment(), self.root, 'daily')
            rotate.assert_not_called()
        self.assertEqual(self.resumed, ['api', 'caddy'])
        self.assertEqual(list(self.root.iterdir()), [])

    def test_pre_update_does_not_reopen_service_even_on_failure(self):
        class Deployment:
            def pause(inner): return ['api', 'caddy']
            def resume(inner, services): self.fail('must remain stopped')
            def dump(inner, target): raise RuntimeError('dump failed')
        with self.assertRaises(RuntimeError):
            ops.backup(Deployment(), self.root, 'pre-update')

    def test_manifest_cannot_select_arbitrary_paths(self):
        path = self.copy()
        manifest = json.loads((path / 'manifest.json').read_text())
        manifest['checksums']['../outside'] = 'x'
        (path / 'manifest.json').write_text(json.dumps(manifest))
        with self.assertRaises(ValueError):
            ops.verify_backup(path)


class RecoveryGate(unittest.TestCase):
    def test_partial_or_unreconciled_restore_never_opens(self):
        with tempfile.TemporaryDirectory() as tmp, patch.object(ops, 'ROOT', Path(tmp)):
            d = ops.Deployment.__new__(ops.Deployment)
            d.project = 'restore'
            d.verify_images = lambda: None
            d.compose = lambda *args: self.fail('must not start any service')
            d.recovery_marker.parent.mkdir(parents=True)
            marker = {'backupManifestSha256': 'sha', 'origin': 'https://restore.test',
                      'commit': 'a' * 40, 'restored': False}
            d.recovery_marker.write_text(json.dumps(marker))
            record = Path(tmp) / 'record.json'
            record.write_text(json.dumps({**marker, 'operator': 'operator', 'evidence': 'ref',
                                          'checksPassed': True, 'revocationsReconciled': True}))
            with self.assertRaises(ValueError):
                d.open(record)
            marker['restored'] = True
            d.recovery_marker.write_text(json.dumps(marker))
            with self.assertRaises(ValueError):
                d.open()
            invalid = json.loads(record.read_text())
            invalid['revocationsReconciled'] = False
            record.write_text(json.dumps(invalid))
            with self.assertRaises(ValueError):
                d.open(record)


if __name__ == '__main__':
    unittest.main()
