
import os
import socket
import threading
import http.server
import socketserver
import qrcode
from PIL import Image
import urllib.parse
from datetime import datetime

class MobileServer:
    def __init__(self, download_folder):
        self.download_folder = download_folder
        self.port = 8080
        self.server_thread = None
        self.httpd = None
        self.is_running = False
        self.qr_image = None
        self.url = ""

    def find_local_ip(self):
        """Find the local network IP address."""
        try:
            # Connect to a public DNS to find the interface used for internet traffic
            s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
            s.connect(("8.8.8.8", 80))
            ip = s.getsockname()[0]
            s.close()
            return ip
        except Exception:
            return "127.0.0.1"

    def find_free_port(self):
        """Find a free port starting from 8080."""
        port = 8080
        while port < 8100:
            try:
                # Try to bind to the port
                with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
                    s.bind(("", port))
                    return port
            except OSError:
                port += 1
        return 8080

    def generate_index_html(self):
        """Generate the mobile-friendly index.html"""
        songs = []
        if os.path.exists(self.download_folder):
             for root, dirs, files in os.walk(self.download_folder):
                for filename in files:
                    if filename.lower().endswith('.mp3'):
                        # Clean filename for display
                        display_name = os.path.splitext(filename)[0].replace('_', ' ')
                        
                        # Calculate relative path for URL
                        full_path = os.path.join(root, filename)
                        rel_path = os.path.relpath(full_path, self.download_folder)
                        
                        # URL encode properly
                        # We need to replace backslashes with slashes for web URLs if on Windows
                        rel_path_web = rel_path.replace(os.sep, '/')
                        file_url = urllib.parse.quote(rel_path_web)
                        
                        songs.append({"name": display_name, "url": file_url})
        
        # Sort songs alphabetically
        songs.sort(key=lambda x: x['name'])

        html = """
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SunoSync Mobile</title>
    <style>
        body {
            background-color: #121212;
            color: #ffffff;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            margin: 0;
            padding: 0;
            padding-bottom: 120px; /* Space for sticky player */
        }
        .header {
            background-color: #1e1e1e;
            padding: 15px;
            position: sticky;
            top: 0;
            z-index: 100;
            box-shadow: 0 2px 10px rgba(0,0,0,0.5);
        }
        }
        .search-container {
            display: flex;
            gap: 10px;
        }
        .search-bar {
            flex-grow: 1;
            padding: 12px;
            border-radius: 8px;
            border: none;
            background-color: #333;
            color: white;
            font-size: 16px;
            box-sizing: border-box;
        }
        .icon-btn {
            background: #333;
            border: none;
            border-radius: 8px;
            color: white;
            font-size: 20px;
            width: 44px;
            cursor: pointer;
        }
        .icon-btn.active {
            background: #1DB954;
            color: black;
        }
        .song-list {
            list-style: none;
            padding: 0;
            margin: 0;
        }
        .song-item {
            padding: 15px;
            border-bottom: 1px solid #333;
            cursor: pointer;
            transition: background 0.2s;
        }
        .song-item:active {
            background-color: #333;
        }
        .song-title {
            font-size: 16px;
            font-weight: 500;
        }
        .now-playing {
            color: #1DB954; /* Spotify Green */
        }
        
        .player-bar {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            background-color: #1e1e1e;
            padding: 15px;
            border-top: 1px solid #333;
            display: flex;
            flex-direction: column;
            gap: 10px;
            z-index: 200;
        }
        .current-track-info {
            font-size: 14px;
            color: #ccc;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            text-align: center;
        }
        audio {
            width: 100%;
            outline: none;
        }
    </style>
</head>
<body>

<div class="header">
    <div class="search-container">
        <input type="text" id="searchInput" class="search-bar" placeholder="Search songs..." onkeyup="filterSongs()">
        <button id="shuffleBtn" class="icon-btn" onclick="toggleShuffle()">🔀</button>
    </div>
</div>

<ul class="song-list" id="songList">
"""
        for song in songs:
             html += f'    <li class="song-item" onclick="playSong(\'{song["url"]}\', this)">\n'
             html += f'        <div class="song-title">{song["name"]}</div>\n'
             html += f'    </li>\n'
             
        html += """
</ul>

<div class="player-bar">
    <div class="current-track-info" id="trackInfo">Select a song to play</div>
    <audio id="audioPlayer" controls loop>
        Your browser does not support the audio element.
    </audio>
</div>

<script>
    const audio = document.getElementById('audioPlayer');
    const trackInfo = document.getElementById('trackInfo');
    const songList = document.getElementById('songList');
    let currentSongItem = null;

    function playSong(url, element) {
        // Reset previous active item
        if (currentSongItem) {
            currentSongItem.classList.remove('now-playing');
        }
        
        // formatting url back for display if needed involves decodeURI, 
        // but we just grab innerText for display name
        const songName = element.innerText;
        
        audio.src = url;
        audio.play();
        
        trackInfo.innerText = "Now Playing: " + songName;
        
        element.classList.add('now-playing');
        currentSongItem = element;
    }

    // Auto-play next song (simple implementation, goes to next LI in list)

    
    // Shuffle Logic
    let isShuffle = false;
    
    function toggleShuffle() {
        isShuffle = !isShuffle;
        const btn = document.getElementById('shuffleBtn');
        if (isShuffle) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    }

    audio.addEventListener('ended', function() {
        if (isShuffle) {
            playRandom();
        } else {
            if (currentSongItem) {
                const nextItem = currentSongItem.nextElementSibling;
                if (nextItem) {
                    nextItem.click();
                }
            }
        }
    });
    
    function playRandom() {
        const li = songList.getElementsByTagName('li');
        // Filter visible only? Or any? Let's do any for now, or filtered if user wants smart shuffle
        // Standard shuffle usually implies current context. Let's pick from visible (filtered) songs
        const visibleItems = [];
        for (let item of li) {
            if (item.style.display !== 'none') {
                 visibleItems.push(item);
            }
        }
        
        if (visibleItems.length > 0) {
            const randomIndex = Math.floor(Math.random() * visibleItems.length);
            visibleItems[randomIndex].click();
        }
    }

    function filterSongs() {
        const input = document.getElementById('searchInput');
        const filter = input.value.toLowerCase();
        const li = songList.getElementsByTagName('li');

        for (let i = 0; i < li.length; i++) {
            const title = li[i].getElementsByClassName('song-title')[0];
            const txtValue = title.textContent || title.innerText;
            if (txtValue.toLowerCase().indexOf(filter) > -1) {
                li[i].style.display = "";
            } else {
                li[i].style.display = "none";
            }
        }
    }
</script>

</body>
</html>
"""
        with open(os.path.join(self.download_folder, "index.html"), "w", encoding="utf-8") as f:
            f.write(html)

    def start_server(self):
        """Start the HTTP server in a background thread."""
        if self.is_running:
            return self.get_connection_info()

        self.generate_index_html()
        
        # Change to download folder so http.server serves from there
        # NOTE: Changing CWD globally is risky in a running app. 
        # Better to pass directory to SimpleHTTPRequestHandler if possible, 
        # but SimpleHTTPRequestHandler defaults to CWD.
        # Alternative: We can use `partial` to pass directory to handler
        
        from functools import partial
        
        Handler = partial(http.server.SimpleHTTPRequestHandler, directory=self.download_folder)
        
        self.port = self.find_free_port()
        self.ip = self.find_local_ip()
        self.url = f"http://{self.ip}:{self.port}"
        
        try:
            self.httpd = socketserver.TCPServer(("", self.port), Handler)
            self.is_running = True
            
            self.server_thread = threading.Thread(target=self.httpd.serve_forever)
            self.server_thread.daemon = True
            self.server_thread.start()
            
            print(f"Mobile server started at {self.url}")
            
        except Exception as e:
            print(f"Failed to start server: {e}")
            self.is_running = False
            return None, None

        return self.get_connection_info()

    def get_connection_info(self):
        """Return the URL and QR Code image."""
        if not self.is_running:
            self.start_server()
            
        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_L,
            box_size=10,
            border=2,
        )
        qr.add_data(self.url)
        qr.make(fit=True)
        img = qr.make_image(fill_color="black", back_color="white")
        
        return self.url, img

    def stop_server(self):
        """Stop the server."""
        if self.httpd:
            self.httpd.shutdown()
            self.httpd.server_close()
            self.is_running = False
            print("Mobile server stopped.")
