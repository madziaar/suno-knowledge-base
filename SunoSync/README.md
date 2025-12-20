# SunoSync V3.0

**Your World, Your Music. Seamlessly Synced.**

SunoSync is the ultimate desktop ecosystem for your Suno AI music generation. It combines a powerful bulk downloader, a rich music library, a prompt vault, live radio broadcasting, and a mobile bridge into one seamless application.

![SunoSync Splash](resources/splash.png)

**Get the official build or compile yourself below for free:**

- https://ko-fi.com/s/374c24251c - PayPal accepted here  [$3 or pay what you want]
- https://justinmurray99.gumroad.com/l/rrxty  [$3 or pay what you want]

**Discord Support and Community:** https://discord.gg/kZSc8sKUZR

## 🌟 Key Features

### 📥 Smart Downloader
*   **Bulk Downloading:** Download your entire Suno library in one click.
*   **Smart Sync:** Only downloads new songs, skipping existing files.
*   **Format Choice:** **MP3** (Compact) or **WAV** (Lossless).
*   **Metadata Embedding:** Automatically embeds Title, Artist, **Lyrics**, and Cover Art into audio tags.
*   **Smart Resume:** Intelligently stops scanning when no new songs are found.
*   **Organization:** Auto-sorts downloads into `Year-Month` folders.
*   **Preload Mode:** Preview songs before downloading to curate your list.

### 📚 Ultimate Music Library
*   **Visual Browser:** Browse your collection with a clean, dark-themed grid.
*   **Clean Titles:** Automatically sanitizes messy raw titles into readable text.
*   **Tag System:** Organize with Like 👍, Star ⭐, and Trash 🗑️.
*   **Stats Dashboard:** View detailed analytics of your library (Top Genres, Monthly Activity, etc.).
*   **Maintenance Tools:** Built-in cache cleaner and force-rescan options.

### 📻 Suno On-Air & Mobile Bridge
*   **Live Radio:** Broadcast your library as a live web radio station to share with friends.
*   **Request Queue:** Listeners can request songs via the public web link.
*   **Mobile Bridge:** Scan a QR code to stream your library directly to your phone browser.

### 🔐 Prompt Vault
*   **Save Your Prompts:** Never lose a great prompt again. Save and organize your best prompts.
*   **One-Click Copy:** Quickly copy prompts to clipboard for reuse in Suno.

### � Built-in Player
*   **Seamless Playback:** Play songs directly within the app.
*   **Mini Player:** Collapse the app into a sleek floating bar for background listening.
*   **Lyrics View:** Sing along with synchronized lyrics (if available) or view static lyrics.

## 🚀 Getting Started

1.  **Download:** Get the latest `SunoSync.exe`.
2.  **Install VLC:** Ensure [VLC Media Player](https://www.videolan.org/) is installed (required for audio engine).
3.  **Run:** Double-click `SunoSync.exe`.
4.  **Get Token:**
    *   Click "Get Token" in the Downloader tab.
    *   Log in to Suno.com.
    *   Open Developer Tools (F12) -> Application -> Cookies.
    *   Copy the `__client` cookie value.
5.  **Sync:** Paste your token and click **Start Download**.

## 🔒 Transparency

We believe in 100% transparency. SunoSync is an indie tool built with Python.
*   **Crash Shield:** Built-in error reporting (Sentry) helps us fix bugs faster.
*   **False Positives:** Some antivirus software may flag the app because it is not digitally signed by a corporation. This is normal for open-source Python tools.

## ☕ Support

Created by **@InternetThot**

If you love SunoSync, consider buying me a coffee to support future updates!
👉 [buymeacoffee.com/audioalchemy](https://buymeacoffee.com/audioalchemy)

---
*SunoSync is an unofficial tool and is not affiliated with Suno AI.*

## 🛠️ Building from Source

### Prerequisites
*   **Python 3.10+**
*   **Git**
*   **VLC Media Player**

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/sunsetsacoustic/SunoSyncV2.git
    cd SunoSyncV2
    ```

2.  **Install dependencies:**
    ```bash
    pip install -r requirements.txt
    ```

3.  **Run the application:**
    ```bash
    python main.py
    ```

### Compiling
To build the standalone `.exe` file:

```bash
pyinstaller SunoApi.spec
```
The executable will be in the `dist/` folder.
