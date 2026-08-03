import json
import os
import appdirs
import datetime

class ConfigManager:
    def __init__(self, config_filename="config.json"):
        # Use appdirs to get the standard user data directory
        # AppName: SunoSync, AppAuthor: InternetThot
        self.data_dir = appdirs.user_data_dir("SunoSync", "InternetThot")
        
        # Ensure the directory exists
        if not os.path.exists(self.data_dir):
            try:
                os.makedirs(self.data_dir)
            except OSError as e:
                print(f"Error creating config directory: {e}")
        
        # store full path
        self.config_file = os.path.join(self.data_dir, config_filename)
        self.config = {}
        self.load_config()

    def load_config(self):
        if os.path.exists(self.config_file):
            try:
                with open(self.config_file, 'r') as f:
                    self.config = json.load(f)
            except:
                self.config = {}
        else:
            self.config = {}

    def save_config(self):
        try:
            with open(self.config_file, 'w') as f:
                json.dump(self.config, f, indent=4)
        except Exception as e:
            print(f"Error saving config: {e}")

    def get(self, key, default=None):
        return self.config.get(key, default)

    def set(self, key, value):
        self.config[key] = value
        self.save_config()



    def get_data_dir(self):
        """Return the directory where data should be stored"""
        return self.data_dir
