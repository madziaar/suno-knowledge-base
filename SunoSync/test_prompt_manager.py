import unittest
import os
import shutil
import tempfile
import sys

# Add parent directory to path so we can import modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.append("e:\\SunoSync-main")

from prompt_vault import PromptManager

class TestPromptManager(unittest.TestCase):
    def setUp(self):
        # Create a temporary directory
        self.test_dir = tempfile.mkdtemp()
        self.filename = "test_prompts.json"
        
        # Patch appdirs to return our temp dir (or just override filepath in instance if possible)
        # Looking at PromptManager code:
        # data_dir = appdirs.user_data_dir("SunoSync", "SunoSync")
        # self.filepath = os.path.join(data_dir, filename)
        
        # We can't easily patch appdirs without mock, but we can modify the instance after init 
        # or subclass. Or better, let's just instantiate and then overwrite filepath.
        # But __init__ calls load(), so it tries to load from real path.
        # Let's mock appdirs.user_data_dir using unittest.mock
        
    def test_add_and_get_prompt(self):
        # We need to mock appdirs before importing or during init
        # Since we already imported, let's use patch
        from unittest.mock import patch
        
        with patch('appdirs.user_data_dir', return_value=self.test_dir):
            manager = PromptManager(self.filename)
            
            # Test Add
            uid = manager.add_prompt("Test Title", "Test Content", "tag1, tag2")
            self.assertTrue(uid)
            
            # Test Get
            all_prompts = manager.get_all()
            self.assertIn(uid, all_prompts)
            self.assertEqual(all_prompts[uid]['title'], "Test Title")
            self.assertEqual(all_prompts[uid]['text'], "Test Content")
            self.assertEqual(all_prompts[uid]['tags'], ["tag1", "tag2"])

    def test_delete_prompt(self):
        from unittest.mock import patch
        with patch('appdirs.user_data_dir', return_value=self.test_dir):
            manager = PromptManager(self.filename)
            uid = manager.add_prompt("For Delete", "Content", "")
            
            # verify added
            self.assertIn(uid, manager.prompts)
            
            # delete
            result = manager.delete_prompt(uid)
            self.assertTrue(result)
            self.assertNotIn(uid, manager.prompts)

    def tearDown(self):
        shutil.rmtree(self.test_dir)

if __name__ == '__main__':
    unittest.main()
