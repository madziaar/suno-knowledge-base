/**
 * Saving files from the extension UI.
 *
 * Two different mechanisms, on purpose:
 *  - **Text we generated** (LRC, SRT, CSV, a style bundle) never leaves the
 *    page: a Blob URL and an `<a download>` click. No permission, no network.
 *  - **Media a site published** (audio, cover art) goes through
 *    `chrome.downloads` so the browser shows its own download UI and the
 *    user's own cookies/session are irrelevant — we pass a URL and nothing
 *    else.
 */

export interface DownloadResult {
  readonly ok: boolean
  readonly error?: string
}

/** Slug a filename: no path separators, no colons, no trailing dots. */
export function safeDownloadName(name: string, fallback = 'suno-helper'): string {
  const cleaned = name
    .replace(/[<>:"/\\|?*\u0000-\u001f]/g, '-')
    .replace(/\s+/g, ' ')
    .replace(/^\.+/, '')
    .trim()
    .slice(0, 120);
  return cleaned || fallback;
}

/** Save text the extension produced. Synchronous-ish; returns when the click fires. */
export function downloadText(filename: string, text: string, mime = 'text/plain'): DownloadResult {
  try {
    const blob = new Blob([text], { type: `${mime};charset=utf-8` });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = safeDownloadName(filename);
    anchor.rel = 'noopener';
    document.body.append(anchor);
    anchor.click();
    anchor.remove();
    // Give the browser a moment to start the download before the URL dies.
    window.setTimeout(() => URL.revokeObjectURL(url), 10_000);
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : String(error) };
  }
}

/** A timestamped default filename, so two exports never overwrite each other. */
export function stampedName(base: string, extension: string, now = new Date()): string {
  const pad = (value: number) => String(value).padStart(2, '0');
  const stamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}`;
  return `${base}-${stamp}.${extension}`;
}
