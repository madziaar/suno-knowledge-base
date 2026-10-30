/**
 * Content script: minimal DOM presence on suno.com.
 *
 * It adds one floating button and answers three messages (fill / apply /
 * capture). All real parsing happens in the pure library; this file only reads
 * and writes the page.
 */

import { defineContentScript } from 'wxt/sandbox';

import { extractSongFromHtml } from '../../src/lib/htmlMeta';
import { buildCapture } from '../../src/lib/capture';
import { findField, isCreatePage, setFieldValue } from '../../src/selectors';
import { emit, send, type Request, type Response } from '../../src/messages';
import { bestTarget, explainMissingTracks, findMediaTargets, type MediaTarget } from '../../src/lib/mediaTargets';

const BUTTON_ID = 'suno-helper-capture';
const MEDIA_BUTTON_ID = 'suno-helper-media';

export default defineContentScript({
  matches: ['https://suno.com/*', 'https://www.suno.com/*'],
  runAt: 'document_idle',
  main() {
    registerMessageHandler();
    mountMediaButton();
    if (!isCreatePage()) {
      // The page is a SPA: wait for the create form instead of giving up.
      const observer = new MutationObserver(() => {
        if (isCreatePage()) {
          observer.disconnect();
          mount();
        }
      });
      observer.observe(document.body, { childList: true, subtree: true });
      window.setTimeout(() => observer.disconnect(), 30_000);
      return;
    }
    mount();
  },
});

function readField(name: 'style' | 'lyrics' | 'title' | 'exclude' | 'simplePrompt'): string {
  const element = findField(name);
  if (!element) return '';
  if (element instanceof HTMLTextAreaElement || element instanceof HTMLInputElement) return element.value;
  return element.textContent ?? '';
}

function readForm(): { style: string; lyrics: string; title: string; exclude: string } {
  return {
    style: readField('style') || readField('simplePrompt'),
    lyrics: readField('lyrics'),
    title: readField('title'),
    exclude: readField('exclude'),
  };
}

/** Read the current page as a capture. Uses the same parser as the batch job. */
function capturePage() {
  const html = document.documentElement.outerHTML;
  return buildCapture(extractSongFromHtml(html, location.href));
}

function mount(): void {
  if (document.getElementById(BUTTON_ID)) return;
  const button = document.createElement('button');
  button.id = BUTTON_ID;
  button.type = 'button';
  button.textContent = '⚡ Save to Helper';
  Object.assign(button.style, {
    position: 'fixed',
    right: '16px',
    bottom: '88px',
    zIndex: '2147483000',
    padding: '8px 12px',
    borderRadius: '9999px',
    border: '1px solid rgba(255,255,255,0.16)',
    background: 'rgba(17,17,19,0.92)',
    color: '#f5f5f4',
    font: '600 12px/1.2 system-ui, sans-serif',
    cursor: 'pointer',
    boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
  } satisfies Partial<CSSStyleDeclaration>);

  button.addEventListener('click', () => {
    const form = readForm();
    const now = Date.now();
    // Persist through the background worker: it is the single storage writer.
    chrome.runtime.sendMessage(
      {
        type: 'library:save',
        record: {
          id: `capture-${now}`,
          title: form.title || form.style.slice(0, 40) || 'Captured from Suno',
          style: form.style,
          lyrics: form.lyrics,
          exclude: form.exclude,
          tags: [],
          model: 'v5.5',
          notes: 'captured from the create page',
        },
      },
      () => {
        button.textContent = '✓ Saved';
        window.setTimeout(() => {
          button.textContent = '⚡ Save to Helper';
        }, 1400);
      },
    );
  });
  document.body.appendChild(button);
}

function registerMessageHandler(): void {
  chrome.runtime.onMessage.addListener((request: Request, _sender, sendResponse) => {
    if (request.type === 'page:apply') {
      const element = findField(request.field);
      if (!element) {
        sendResponse({ ok: false, error: `field not found: ${request.field}` });
        return false;
      }
      const ok = setFieldValue(element, request.value);
      sendResponse(ok ? { ok: true } : { ok: false, error: 'field is not editable' });
      return false;
    }
    if (request.type === 'page:fill') {
      const record = request.record;
      const results = {
        style: record.style ? setFieldValue(findField('style') ?? document.body, record.style) : false,
        lyrics: record.lyrics ? setFieldValue(findField('lyrics') ?? document.body, record.lyrics) : false,
        title: record.title ? setFieldValue(findField('title') ?? document.body, record.title) : false,
      };
      sendResponse({ ok: true, data: results });
      return false;
    }
    if (request.type === 'page:capture') {
      const capture = capturePage();
      emit({ type: 'capture:page', capture });
      sendResponse({ ok: true, data: { style: readForm().style, lyrics: readForm().lyrics, title: readForm().title } });
      return false;
    }
    return false;
  });
}

/**
 * "Save" on a song page.
 *
 * Reads the page the user is already looking at — no extra request — and hands
 * the URL the page itself published to `chrome.downloads`. One click, one file.
 * Playlists and profiles render client-side, so there we explain rather than
 * pretend.
 */
function mountMediaButton(): void {
  const path = location.pathname;
  const isSong = /^\/song\//.test(path);
  const isPlaylist = /^\/playlist\//.test(path);
  const isProfile = /^\/@/.test(path);
  if (!isSong && !isPlaylist && !isProfile) return;
  if (document.getElementById(MEDIA_BUTTON_ID)) return;

  const button = document.createElement('button');
  button.id = MEDIA_BUTTON_ID;
  button.type = 'button';
  button.textContent = isSong ? '⬇ Save audio' : isPlaylist ? '⬇ Playlist' : '⬇ Profile';
  Object.assign(button.style, {
    position: 'fixed',
    right: '16px',
    bottom: '140px',
    zIndex: '2147483000',
    padding: '8px 12px',
    borderRadius: '9999px',
    border: '1px solid rgba(255,255,255,0.16)',
    background: 'rgba(17,17,19,0.92)',
    color: '#f5f5f4',
    font: '600 12px/1.2 system-ui, sans-serif',
    cursor: 'pointer',
    boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
  } satisfies Partial<CSSStyleDeclaration>);

  let busy = false;
  button.addEventListener('click', () => {
    if (busy) return;
    if (isPlaylist || isProfile) {
      button.textContent = 'client-rendered';
      button.title = explainMissingTracks(isPlaylist ? 'playlist' : 'profile');
      window.setTimeout(() => {
        button.textContent = isPlaylist ? '⬇ Playlist' : '⬇ Profile';
      }, 2600);
      return;
    }

    busy = true;
    button.textContent = 'reading…';
    const targets = findMediaTargets(document.documentElement.outerHTML, location.href, document.title);
    const audio = bestTarget(targets, 'audio');
    if (!audio) {
      busy = false;
      button.textContent = 'no audio on page';
      window.setTimeout(() => {
        button.textContent = '⬇ Save audio';
      }, 2600);
      return;
    }
    saveTarget(audio, button);
  });

  document.body.appendChild(button);
}

function saveTarget(target: MediaTarget, button: HTMLButtonElement): void {
  void send<Response>({ type: 'media:save', url: target.url, filename: target.filename })
    .then((response) => {
      button.textContent = response.ok ? '✓ saving' : '✗ failed';
    })
    .catch(() => {
      button.textContent = '✗ failed';
    })
    .finally(() => {
      window.setTimeout(() => {
        button.textContent = '⬇ Save audio';
      }, 2000);
    });
}
