import hashlib
import importlib.util
from pathlib import Path
import subprocess
import tempfile
import unittest

spec=importlib.util.spec_from_file_location('foundation',Path(__file__).parents[1]/'scripts/prepare_foundation.py')
foundation=importlib.util.module_from_spec(spec);spec.loader.exec_module(foundation)


class FoundationTests(unittest.TestCase):
    def fixture(self,root):
        source=root/'source';source.mkdir()
        for args in [('init','-q'),('config','user.name','Fixture'),('config','user.email','fixture@example.invalid')]:foundation.git(source,*args)
        (source/'LICENSE').write_text('test fixture')
        foundation.git(source,'add','.');foundation.git(source,'commit','-qm','fixture')
        return source,{'repository':str(source),'commit':foundation.git(source,'rev-parse','HEAD'),'files':{'LICENSE':hashlib.sha256(b'test fixture').hexdigest()}}

    def test_exact_checkout_and_repeat(self):
        with tempfile.TemporaryDirectory() as d:
            root=Path(d);source,lock=self.fixture(root);target=root/'target'
            foundation.prepare(target,lock);foundation.prepare(target,lock)
            self.assertEqual(foundation.git(target,'rev-parse','HEAD'),lock['commit'])

    def test_dirty_work_is_preserved(self):
        with tempfile.TemporaryDirectory() as d:
            root=Path(d);source,lock=self.fixture(root);target=root/'target'
            foundation.prepare(target,lock);(target/'work.txt').write_text('keep me')
            with self.assertRaisesRegex(ValueError,'dirty'):foundation.prepare(target,lock)
            self.assertEqual((target/'work.txt').read_text(),'keep me')

    def test_manifest_hash_mismatch_fails(self):
        with tempfile.TemporaryDirectory() as d:
            root=Path(d);source,lock=self.fixture(root);lock['files']['LICENSE']='0'*64
            with self.assertRaisesRegex(ValueError,'differs'):foundation.prepare(root/'target',lock)
