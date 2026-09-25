#!/usr/bin/env python3
"""Materialize the reviewed Paperclip source pin without installing or launching code."""
import argparse
import hashlib
import json
from pathlib import Path
import subprocess

ROOT = Path(__file__).resolve().parents[1]


def git(target, *args):
    return subprocess.run(['git', '-C', str(target), *args], check=True, text=True, capture_output=True).stdout.strip()


def prepare(target: Path, lock: dict, source=None):
    if target.exists():
        if not (target / '.git').is_dir():
            raise ValueError('existing target is not an owned checkout; use a new path')
        if git(target, 'status', '--porcelain', '--untracked-files=all'):
            raise ValueError('preserving dirty checkout; use a new path')
        if git(target, 'rev-parse', 'HEAD') != lock['commit']:
            raise ValueError('preserving checkout at another revision; use a new path')
    else:
        target.parent.mkdir(parents=True, exist_ok=True)
        target.mkdir()
        git(target, 'init', '--quiet')
        git(target, 'remote', 'add', 'origin', source or lock['repository'])
        git(target, 'fetch', '--depth=1', 'origin', lock['commit'])
        git(target, 'checkout', '--detach', lock['commit'])
    if git(target, 'rev-parse', 'HEAD') != lock['commit']:
        raise ValueError('unexpected upstream revision')
    for name, expected in lock['files'].items():
        actual = hashlib.sha256((target / name).read_bytes()).hexdigest()
        if actual != expected:
            raise ValueError('pinned upstream file differs: ' + name)
    return target


if __name__ == '__main__':
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('target',type=Path)
    parser.add_argument('--source',help='optional local Git mirror; pinned commit and file checks still apply')
    args=parser.parse_args()
    lock=json.loads((ROOT/'upstream/paperclip.lock.json').read_text())
    print(prepare(args.target.resolve(),lock,args.source))
    print('Source verified. Dependency installation, migrations, credentials and service launch have not run.')
