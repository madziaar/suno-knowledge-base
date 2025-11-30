import os
import sys

repo_path = r"e:\SunoSync-main\SunoSyncMac"

def update_file(filename, updates):
    path = os.path.join(repo_path, filename)
    try:
        with open(path, "r", encoding="utf-8") as f:
            content = f.read()
        
        for old, new in updates:
            if old in content:
                content = content.replace(old, new)
            else:
                # Try to be smarter about imports if exact match fails
                if old == "import uuid" and "import os" in content:
                     if "import platform" not in content:
                        content = content.replace("import os", "import os\nimport platform\nimport subprocess")
                else:
                    print(f"Warning: Could not find '{old}' in {filename}")
        
        with open(path, "w", encoding="utf-8") as f:
            f.write(content)
        print(f"Updated {filename}")
    except Exception as e:
        print(f"Error updating {filename}: {e}")

# 1. suno_utils.py
utils_updates = [
    ("import uuid", "import uuid\nimport platform\nimport subprocess"),
    ("def get_uuid_from_file(filepath):", """def open_file(path):
    \"\"\"Open file or folder with default system application.\"\"\"
    try:
        if platform.system() == 'Windows':
            os.startfile(path)
        elif platform.system() == 'Darwin':  # macOS
            subprocess.call(('open', path))
        else:  # Linux
            subprocess.call(('xdg-open', path))
    except Exception as e:
        print(f"Error opening file: {e}")

def get_uuid_from_file(filepath):""")
]
update_file("suno_utils.py", utils_updates)

# 2. library_tab.py
# (Already updated, but safe to run again as replace won't match)
lib_updates = [
    ("from suno_utils import read_song_metadata, save_lyrics_to_file", "from suno_utils import read_song_metadata, save_lyrics_to_file, open_file"),
    ("os.startfile(self.download_path)", "open_file(self.download_path)"),
    ("os.startfile(folder)", "open_file(folder)")
]
update_file("library_tab.py", lib_updates)

# 3. downloader_tab.py
dl_updates = [
    ("from suno_utils import blend_colors, truncate_path, create_tooltip", "from suno_utils import blend_colors, truncate_path, create_tooltip, open_file"),
    ("os.startfile(folder)", "open_file(folder)")
]
update_file("downloader_tab.py", dl_updates)
