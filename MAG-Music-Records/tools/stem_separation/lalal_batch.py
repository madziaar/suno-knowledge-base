# Lalal.ai Stem Separation Tool
# Batch process audio files for vocal/instrumental separation

import os
import requests
import time
import json
import sys

API_KEY = os.getenv('LALAL_API_KEY')
API_URL = 'https://www.lalal.ai/api/'

def upload_file(file_path, stem_type='vocals'):
    """
    Upload audio file to Lalal.ai
    stem_type options: 'vocals', 'drums', 'bass', 'piano'
    """
    if not API_KEY:
        print("❌ LALAL_API_KEY environment variable not set!")
        print("Set it with: [System.Environment]::SetEnvironmentVariable('LALAL_API_KEY', 'your-key', 'User')")
        return None
    
    headers = {
        'Authorization': f'Bearer {API_KEY}'
    }
    
    files = {
        'file': open(file_path, 'rb')
    }
    
    data = {
        'stem': stem_type,
        'filter': 1  # 0 = mild, 1 = normal, 2 = aggressive
    }
    
    try:
        response = requests.post(
            f'{API_URL}upload/',
            headers=headers,
            files=files,
            data=data
        )
        return response.json()
    except Exception as e:
        print(f"❌ Upload error: {e}")
        return None

def check_status(task_id):
    """Check processing status"""
    headers = {
        'Authorization': f'Bearer {API_KEY}'
    }
    
    try:
        response = requests.get(
            f'{API_URL}check/',
            headers=headers,
            params={'id': task_id}
        )
        return response.json()
    except Exception as e:
        print(f"❌ Status check error: {e}")
        return None

def download_stems(task_id, output_dir):
    """Download processed stems"""
    headers = {
        'Authorization': f'Bearer {API_KEY}'
    }
    
    # Get download URLs
    status = check_status(task_id)
    
    if not status or status.get('status') != 'success':
        return False
    
    try:
        # Download vocal stem
        vocal_url = status['split']['vocal_path']
        vocal_response = requests.get(vocal_url)
        
        with open(os.path.join(output_dir, 'vocals.wav'), 'wb') as f:
            f.write(vocal_response.content)
        
        # Download instrumental stem
        inst_url = status['split']['instrumental_path']
        inst_response = requests.get(inst_url)
        
        with open(os.path.join(output_dir, 'instrumental.wav'), 'wb') as f:
            f.write(inst_response.content)
        
        print(f"✅ Stems saved to {output_dir}")
        return True
    except Exception as e:
        print(f"❌ Download error: {e}")
        return False

def process_track(audio_file, output_dir):
    """Complete workflow: upload → wait → download"""
    
    print(f"📤 Uploading: {os.path.basename(audio_file)}")
    result = upload_file(audio_file)
    
    if not result or 'id' not in result:
        print(f"❌ Upload failed: {result}")
        return False
    
    task_id = result['id']
    print(f"⏳ Processing (Task ID: {task_id})...")
    
    # Poll for completion
    max_wait = 300  # 5 minutes max
    start_time = time.time()
    
    while True:
        if time.time() - start_time > max_wait:
            print("❌ Timeout: Processing took too long")
            return False
        
        status = check_status(task_id)
        
        if not status:
            print("❌ Failed to check status")
            return False
        
        if status.get('status') == 'success':
            print("✅ Processing complete!")
            break
        elif status.get('status') == 'error':
            print(f"❌ Error: {status.get('error', 'Unknown error')}")
            return False
        
        progress = status.get('progress', 0)
        print(f"⏳ Status: {status.get('status', 'processing')} ({progress}%)")
        time.sleep(10)  # Check every 10 seconds
    
    # Download stems
    os.makedirs(output_dir, exist_ok=True)
    return download_stems(task_id, output_dir)

def batch_process_project(project_path):
    """Process all audio files in project"""
    
    audio_dir = os.path.join(project_path, '03_audio_exports')
    
    if not os.path.exists(audio_dir):
        print(f"❌ Audio directory not found: {audio_dir}")
        return
    
    # Find all audio files
    audio_files = []
    for file in os.listdir(audio_dir):
        if file.endswith(('.wav', '.mp3')) and not file.startswith('.'):
            # Skip if stems folder already exists
            stem_dir = os.path.join(audio_dir, f"{os.path.splitext(file)[0]}_stems")
            if not os.path.exists(stem_dir):
                audio_files.append(os.path.join(audio_dir, file))
    
    if not audio_files:
        print("✅ All tracks already processed!")
        return
    
    print(f"Found {len(audio_files)} tracks to process\n")
    
    for i, audio_file in enumerate(audio_files, 1):
        print(f"\n--- Track {i}/{len(audio_files)} ---")
        
        # Create output directory
        output_dir = os.path.join(
            audio_dir,
            f"{os.path.splitext(os.path.basename(audio_file))[0]}_stems"
        )
        
        # Process
        success = process_track(audio_file, output_dir)
        
        if success:
            print(f"✅ Track {i} complete: {os.path.basename(audio_file)}")
        else:
            print(f"❌ Track {i} failed: {os.path.basename(audio_file)}")
        
        # Rate limit: wait 5 seconds between tracks
        if i < len(audio_files):
            print("⏳ Waiting 5 seconds before next track...")
            time.sleep(5)
    
    print("\n✨ Batch processing complete!")

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Usage: python lalal_batch.py <project_path>")
        print("\nExample:")
        print("  python lalal_batch.py \"C:\\Giquina-Projects\\MAG Music Records\\projects\\mixtapes\\MAG_Hardcore_Drill_Vol_1\"")
        print("\nMake sure to set LALAL_API_KEY environment variable first!")
        sys.exit(1)
    
    project_path = sys.argv[1]
    
    if not os.path.exists(project_path):
        print(f"❌ Project path not found: {project_path}")
        sys.exit(1)
    
    batch_process_project(project_path)
