# Troubleshooting Guide

> **System Status**: ONLINE
> **Support Protocol**: User Self-Service

## Common Issues

### 1. "CORE OVERLOAD (429)" / API Rate Limits
**Symptom**: You see a red toast message saying "CORE OVERLOAD".
**Cause**: You have exceeded the request quota for the Google Gemini API.
**Solution**:
- Wait 60 seconds and try again.
- If using the Free Tier (Gemini API), you are limited to 15 requests per minute.
- Switch to a paid Pay-as-you-go API key if you are a power user.

### 2. Audio Visualizer is Flat (No Movement)
**Symptom**: The background visualizer is a flat line, even when sound is playing.
**Cause**: The browser's `AudioContext` is suspended or privacy settings block audio access.
**Solution**:
- **Interact with the page**: Browsers block audio until you click or tap something. Click anywhere.
- **Check Mute**: Ensure the global mute button (Speaker icon) in the navbar is not active.

### 3. PWA / Offline Mode Not Working
**Symptom**: "Add to Home Screen" doesn't appear or the app doesn't load offline.
**Cause**: The Service Worker might be waiting to activate.
**Solution**:
- Refresh the page once to allow the new Service Worker to claim the client.
- Ensure you are serving the app over **HTTPS** (or `localhost`). Service Workers do not work on insecure HTTP connections.

### 4. "Safety Lockout"
**Symptom**: The generation fails with a "Safety Filters Triggered" message.
**Cause**: Your prompt contained content that triggered Google's safety classifiers (Hate speech, extreme violence, or sexually explicit content).
**Solution**:
- Soften the language. Use metaphors instead of explicit descriptions.
- **Pyrite Mode** loosens the *system instructions*, but the hard API filters are enforced by Google and cannot be fully disabled.

### 5. Sonic Mirror (Audio Upload) Fails
**Symptom**: "File too large" or infinite loading.
**Cause**:
- The file exceeds 10MB (Client-side limit).
- The file is not a valid MP3/WAV.
**Solution**:
- Compress the audio file or trim it to a 30-second clip. The AI only needs a snippet to analyze the vibe.

### 6. Mobile Drawer Won't Open
**Symptom**: Tapping "Expert Protocol" does nothing on mobile.
**Cause**: Z-index conflict or JavaScript error.
**Solution**:
- Refresh the page.
- Ensure no other overlays (like the Chat window) are blocking the button.

---

## Hard Reset
If the application state becomes corrupted (e.g., stuck loading):
1. Open Developer Tools (F12) -> Application -> Storage.
2. Click **Clear Site Data**.
3. Reload the page.
