import shutil
import os

src = r"e:\SunoSync-main"
dst = r"e:\SunoSync-main\SunoSyncMac"

ignore_list = ['.git', 'dist', 'build', '__pycache__', 'SunoSyncMac', 'SunoSync-Mac', '.github', '.vscode', '.idea']

print(f"Copying from {src} to {dst}...")

for item in os.listdir(src):
    if item in ignore_list:
        continue
    
    s = os.path.join(src, item)
    d = os.path.join(dst, item)
    
    try:
        if os.path.isdir(s):
            if os.path.exists(d):
                shutil.rmtree(d)
            shutil.copytree(s, d)
            print(f"Copied dir: {item}")
        else:
            shutil.copy2(s, d)
            print(f"Copied file: {item}")
    except Exception as e:
        print(f"Error copying {item}: {e}")

print("Copy complete.")
