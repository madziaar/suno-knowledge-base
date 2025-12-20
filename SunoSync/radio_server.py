import http.server
import socketserver
import threading
import os
import random
import shutil
import json
import logging
import time
import uuid
from pyngrok import ngrok, conf

# Global State
PLAYLIST_QUEUE = []
CURRENT_TRACK = None # Dict or None
RADIO_REQUESTS_DIR = "Radio_Requests"
LIBRARY_DIR = "Suno_Downloads"

# Ensure directories exist
os.makedirs(RADIO_REQUESTS_DIR, exist_ok=True)
os.makedirs(LIBRARY_DIR, exist_ok=True)

# Logger setup
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(message)s')
logger = logging.getLogger("SunoRadio")

class RadioHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        global CURRENT_TRACK
        
        if self.path == "/":
            self.send_response(200)
            self.send_header("Content-type", "text/html")
            self.end_headers()
            self.wfile.write(self.get_html().encode("utf-8"))
            
        elif self.path.startswith("/stream.mp3"):
            if CURRENT_TRACK and os.path.exists(CURRENT_TRACK["path"]):
                self.send_response(200)
                self.send_header("Content-type", "audio/mpeg")
                # Add headers to tell browser not to cache too aggressively
                self.send_header("Cache-Control", "no-cache, no-store, must-revalidate")
                self.send_header("Pragma", "no-cache")
                self.send_header("Expires", "0")
                self.end_headers()
                try:
                    with open(CURRENT_TRACK["path"], "rb") as f:
                        shutil.copyfileobj(f, self.wfile)
                except BrokenPipeError:
                    pass
            else:
                self.send_error(404, "No track playing")
                
        elif self.path == "/status":
            self.send_response(200)
            self.send_header("Content-type", "application/json")
            self.end_headers()
            
            title = "Nothing Playing"
            artist = "Suno Radio"
            user = ""
            track_id = ""
            
            if CURRENT_TRACK:
                if CURRENT_TRACK.get("title"):
                    title = CURRENT_TRACK["title"]
                else:
                    filename = os.path.basename(CURRENT_TRACK["path"])
                    parts = os.path.splitext(filename)[0].split(" - ", 1)
                    if len(parts) == 2:
                        artist, title = parts
                    else:
                        title = filename
                
                if CURRENT_TRACK.get("user"):
                    user = f"Requested by {CURRENT_TRACK['user']}"
                
                track_id = CURRENT_TRACK.get("id", "")
            
            status = {
                "title": title,
                "artist": artist,
                "user": user,
                "id": track_id,
                "listeners": threading.active_count() - 2
            }
            self.wfile.write(json.dumps(status).encode("utf-8"))
            
        else:
            self.send_error(404)

    def do_POST(self):
        if self.path == "/upload":
            content_type = self.headers.get("Content-Type")
            if not content_type or "multipart/form-data" not in content_type:
                self.send_error(400, "Content-Type must be multipart/form-data")
                return
            
            import cgi
            form = cgi.FieldStorage(
                fp=self.rfile,
                headers=self.headers,
                environ={'REQUEST_METHOD': 'POST',
                         'CONTENT_TYPE': self.headers['Content-Type'],
                         }
            )
            
            if "file" in form:
                fileitem = form["file"]
                username = form.getvalue("username", "Anonymous")
                
                if fileitem.filename:
                    fn = os.path.basename(fileitem.filename)
                    save_path = os.path.join(RADIO_REQUESTS_DIR, fn)
                    
                    with open(save_path, 'wb') as f:
                        f.write(fileitem.file.read())
                    
                    # Add to queue as dict
                    item = {
                        "path": save_path,
                        "user": username,
                        "title": fn,
                        # ID is generated when played, but we could pre-gen if needed
                        # But for consistency, let's leave it until played so it's fresh
                    }
                    PLAYLIST_QUEUE.append(item)
                    logger.info(f"New request from {username}: {fn}")
                    
                    self.send_response(200)
                    self.send_header("Content-type", "text/plain")
                    self.end_headers()
                    self.wfile.write(b"Track added to queue!")
                    return
            
            self.send_error(400, "Upload failed")

    def get_html(self):
        return """
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Suno Live Radio</title>
            <style>
                body { background-color: #121212; color: #ffffff; font-family: 'Segoe UI', sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; }
                .container { text-align: center; max-width: 600px; padding: 20px; background: #1e1e1e; border-radius: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
                h1 { margin-bottom: 5px; color: #bb86fc; }
                .now-playing { font-size: 1.2em; color: #aaaaaa; margin-bottom: 20px; }
                audio { width: 100%; margin: 20px 0; outline: none; }
                .upload-section { margin-top: 30px; border-top: 1px solid #333; padding-top: 20px; }
                input[type="file"] { margin-bottom: 10px; }
                input[type="text"] { padding: 8px; border-radius: 5px; border: 1px solid #555; background: #333; color: white; margin-bottom: 10px; width: 60%; }
                button { background-color: #bb86fc; border: none; padding: 10px 20px; color: black; font-weight: bold; cursor: pointer; border-radius: 5px; }
                button:hover { background-color: #a370db; }
                #status-user { color: #bb86fc; font-size: 0.8em; }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>Suno On-Air</h1>
                <div class="now-playing">
                    Now Playing:
                    <span id="status-title" style="display:block; font-weight:bold; font-size:1.3em; margin-top:5px;">Loading...</span>
                    <span id="status-artist" style="display:block; font-size: 0.9em; margin-top:5px; color:#888;"></span>
                    <span id="status-user" style="display:block; margin-top:5px;"></span>
                </div>
                
                <audio id="player" controls autoplay>
                    <source src="/stream.mp3" type="audio/mpeg">
                    Your browser does not support the audio element.
                </audio>
                
                <div class="upload-section">
                    <h3>Request a Song</h3>
                    <form action="/upload" method="post" enctype="multipart/form-data" target="dummyframe" onsubmit="saveUsername()">
                        <input type="text" name="username" id="username" placeholder="Your Name" required>
                        <br>
                        <input type="file" name="file" accept=".mp3" required>
                        <br>
                        <button type="submit" onclick="setTimeout(()=>alert('Upload started!'), 100)">Upload MP3</button>
                    </form>
                    <iframe name="dummyframe" id="dummyframe" style="display: none;"></iframe>
                </div>
            </div>
            
            <script>
                const savedUser = localStorage.getItem('suno_radio_username');
                if (savedUser) document.getElementById('username').value = savedUser;
                
                function saveUsername() {
                    const val = document.getElementById('username').value;
                    if(val) localStorage.setItem('suno_radio_username', val);
                }

                let currentTrackId = null;
                const audio = document.getElementById('player');
                audio.volume = 0.5;

                setInterval(async () => {
                    try {
                        const res = await fetch('/status');
                        const data = await res.json();
                        
                        document.getElementById('status-title').textContent = data.title;
                        document.getElementById('status-artist').textContent = data.artist;
                        document.getElementById('status-user').textContent = data.user;
                        
                        // Check if track changed by ID
                        if (data.id && currentTrackId !== null && data.id !== currentTrackId) {
                            console.log("Track changed! Reloading audio...");
                            currentTrackId = data.id;
                            // Reload audio source with timestamp to prevent cache
                            const newSrc = '/stream.mp3?t=' + Date.now();
                            audio.src = newSrc;
                            audio.play().catch(e => console.log("Auto-play blocked:", e));
                        } else if (data.id && currentTrackId === null) {
                            currentTrackId = data.id;
                        }
                        
                    } catch (e) {
                        console.error("Status fetch error", e);
                    }
                }, 3000); // Polling every 3s
            </script>
        </body>
        </html>
        """

class RadioStation:
    def __init__(self):
        self.server = None
        self.thread = None
        self.running = False
        self.public_url = None
        self.dj_thread = None
        self.skip_event = threading.Event()
        
    def start_broadcast(self):
        if self.running: return self.public_url
        self.running = True
        self.skip_event.clear()
        
        # Allow reuse address
        socketserver.TCPServer.allow_reuse_address = True
        self.server = socketserver.TCPServer(("", 8085), RadioHandler)
        self.thread = threading.Thread(target=self.server.serve_forever)
        self.thread.daemon = True
        self.thread.start()
        
        try:
            self.public_url = ngrok.connect(8085).public_url
        except Exception as e:
            logger.error(f"Ngrok error: {e}")
            if getattr(e, 'errno', None) == 10048:
                logger.info("Port 8085 busy")
            
        logger.info(f"Radio Live at: {self.public_url}")
        
        self.dj_thread = threading.Thread(target=self.dj_loop)
        self.dj_thread.daemon = True
        self.dj_thread.start()
        
        return self.public_url
        
    def stop_broadcast(self):
        self.running = False
        self.skip_event.set()
        if self.server:
            self.server.shutdown()
            self.server.server_close()
        try:
            ngrok.kill()
        except:
            pass
        self.public_url = None
        
    def play_track_at(self, index):
        global CURRENT_TRACK
        if 0 <= index < len(PLAYLIST_QUEUE):
            track = PLAYLIST_QUEUE.pop(index)
            PLAYLIST_QUEUE.insert(0, track)
            self.skip_event.set()
            
    def dj_loop(self):
        global CURRENT_TRACK
        
        while self.running:
            self.skip_event.clear()
            
            if not CURRENT_TRACK:
                if PLAYLIST_QUEUE:
                    CURRENT_TRACK = PLAYLIST_QUEUE.pop(0)
                    CURRENT_TRACK["id"] = str(uuid.uuid4())
                else:
                    local_songs = []
                    for root, dirs, files in os.walk(LIBRARY_DIR):
                        for file in files:
                            if file.lower().endswith('.mp3'):
                                local_songs.append(os.path.join(root, file))
                    
                    if local_songs:
                        path = random.choice(local_songs)
                        CURRENT_TRACK = {
                            "path": path,
                            "user": "Auto-DJ",
                            "title": os.path.basename(path),
                            "id": str(uuid.uuid4())
                        }
                    else:
                        time.sleep(5)
                        continue
            
            logger.info(f"Now playing: {CURRENT_TRACK['title']} (ID: {CURRENT_TRACK['id']})")
            
            from mutagen.mp3 import MP3
            try:
                audio = MP3(CURRENT_TRACK["path"])
                duration = audio.info.length
            except:
                duration = 180 
            
            start_time = time.time()
            while time.time() - start_time < duration:
                if not self.running: break
                if self.skip_event.is_set(): 
                    break
                time.sleep(0.5)
            
            CURRENT_TRACK = None

station = RadioStation()
