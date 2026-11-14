import json
from pathlib import Path
import subprocess
import tempfile
import unittest

MODULE = (Path(__file__).parents[1] / 'logs.mjs').resolve().as_uri()
DAY = 86400000


class TechnicalLogs(unittest.TestCase):
    def test_idle_age_expiry_copytruncate_and_space_cap(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            for directory in ['api', 'postgres', 'caddy', 'archive']:
                (root / directory).mkdir()
            live = root / 'api/server.log'
            live.write_text('structured log\n')
            now = 1800000000000
            (root / 'rotation.json').write_text(json.dumps({'since': now - DAY}))
            old = root / 'archive' / f'{now - 30 * DAY}-old.log'
            old.write_text('expired')
            script = f'''import {{ maintainLogs }} from {json.dumps(MODULE)};
                maintainLogs({json.dumps(tmp)}, {now}, 1024);'''
            subprocess.run(['node', '--input-type=module', '-e', script], check=True)
            self.assertEqual(live.read_text(), '')
            self.assertFalse(old.exists())
            archives = list((root / 'archive').iterdir())
            self.assertEqual(len(archives), 1)
            self.assertEqual(archives[0].read_text(), 'structured log\n')
            # No new messages are needed to expire archives by age.
            script = f'''import {{ maintainLogs }} from {json.dumps(MODULE)};
                maintainLogs({json.dumps(tmp)}, {now + 30 * DAY}, 1024);'''
            subprocess.run(['node', '--input-type=module', '-e', script], check=True)
            self.assertEqual(list((root / 'archive').iterdir()), [])
            (root / 'archive' / f'{now + 30 * DAY}-large.log').write_bytes(b'x' * 2048)
            subprocess.run(['node', '--input-type=module', '-e', script], check=True)
            self.assertEqual(list((root / 'archive').iterdir()), [])


if __name__ == '__main__':
    unittest.main()
