import requests
import threading

# Configuration
VERSION_URL = "https://raw.githubusercontent.com/sunsetsacoustic/SunoSyncV2/main/version.json"
CURRENT_VERSION = "2.0.0"

class Updater:
    @staticmethod
    def check_for_updates(callback):
        """
        Runs the update check in a background thread.
        callback: function(latest_version, download_url) -> None
        """
        def _check():
            try:
                response = requests.get(VERSION_URL, timeout=5)
                if response.status_code == 200:
                    data = response.json()
                    latest_version = data.get("latest_version")
                    download_url = data.get("download_url")
                    
                    if latest_version and latest_version != CURRENT_VERSION:
                         # Simple version comparison check (inexact if versions aren't simple strings, but works for !=)
                         # A better semantic check could be added if needed.
                         callback(latest_version, download_url)
            except Exception as e:
                print(f"[Updater] Check failed: {e}")

        threading.Thread(target=_check, daemon=True).start()
