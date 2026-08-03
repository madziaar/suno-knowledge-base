import requests
import threading

# Configuration
VERSION_URL = "https://gist.githubusercontent.com/sunsetsacoustic/8e1e343e6c99b7487e5aa293f9b1e16a/raw/version.json"
CURRENT_VERSION = "2.1.3"

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
                    
                    if latest_version:
                        try:
                            # Semantic version comparison
                            current_parts = [int(x) for x in CURRENT_VERSION.split('.')]
                            latest_parts = [int(x) for x in latest_version.split('.')]
                            
                            if latest_parts > current_parts:
                                callback(latest_version, download_url)
                        except Exception as e:
                            print(f"[Updater] Version compare error: {e}")
            except Exception as e:
                print(f"[Updater] Check failed: {e}")

        threading.Thread(target=_check, daemon=True).start()
