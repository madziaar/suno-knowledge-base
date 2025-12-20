# -*- mode: python ; coding: utf-8 -*-
import sys
import os
from PyInstaller.utils.hooks import collect_data_files

block_cipher = None

# Collect CustomTkinter assets
ctk_datas = collect_data_files('customtkinter')

# Helper to find resources
def get_resource_path(relative_path):
    return os.path.join(os.getcwd(), relative_path)

# Data files to bundle
# Format: (source_path, dest_folder)
added_files = [
    ('resources', 'resources'),
    ('config.json', '.'),  # Default config template if needed, or rely on app creating it
    ('window_state.json', '.'),
]

# Add CustomTkinter data
added_files.extend(ctk_datas)

a = Analysis(
    ['main.py'],
    pathex=[],
    binaries=[],
    datas=added_files,
    hiddenimports=['PIL', 'PIL._tkinter_finder', 'babel.numbers', 'vlc'],
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=[],
    win_no_prefer_redirects=False,
    win_private_assemblies=False,
    cipher=block_cipher,
    noarchive=False,
)
pyz = PYZ(a.pure, a.zipped_data, cipher=block_cipher)

exe = EXE(
    pyz,
    a.scripts,
    [],
    exclude_binaries=True,
    name='SunoSync',
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=True,
    console=False,
    disable_windowed_traceback=False,
    argv_emulation=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
    icon='resources/icon.ico',
)

coll = COLLECT(
    exe,
    a.binaries,
    a.zipfiles,
    a.datas,
    strip=False,
    upx=True,
    upx_exclude=[],
    name='SunoSync',
)
