/**
 * Content script: minimal DOM presence on suno.com.
 *
 * It adds one floating button and answers two messages (capture / fill).
 * All text handling is delegated to the pure library — this file never
 * reformats a user's lyrics.
 */

import { findField, isCreatePage, setFieldValue } from '../../src/selectors';
import type { Request } from '../../src/messages';

const BUTTON_ID = 'suno-helper-capture';

export default defineContentScript({
  matches: ['https://suno.com/*', 'https://www.suno.com/*'],
  runAt: 'document_idle',
  main() {
    registerMessageHandler();
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
    const captured = capture();
    const now = Date.now();
    // Persist through the background worker: it is the single storage writer.
    chrome.runtime.sendMessage(
      {
        type: 'library:save',
        record: {
          id: `capture-${now}`,
          title: captured.title || captured.style.slice(0, 40) || 'Captured from Suno',
          style: captured.style,
          lyrics: captured.lyrics,
          tags: [],
          model: 'v5.5',
          createdAt: now,
          updatedAt: now,
          schemaVersion: 1,
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

function capture(): { style: string; lyrics: string; title: string } {
  const read = (name: 'style' | 'lyrics' | 'title' | 'exclude' | 'simplePrompt'): string => {
    const element = findField(name) as HTMLTextAreaElement | HTMLInputElement | null;
    if (!element) return '';
    return 'value' in element ? element.value : (element.textContent ?? '');
  };
  const style = read('style') || read('simplePrompt');
  return { style, lyrics: read('lyrics'), title: read('title') };
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
      const record = (request as { record?: { style?: string; lyrics?: string; title?: string } }).record ?? {};
      const results = {
        style: record.style ? setFieldValue(findField('style') ?? document.body, record.style) : false,
        lyrics: record.lyrics ? setFieldValue(findField('lyrics') ?? document.body, record.lyrics) : false,
        title: record.title ? setFieldValue(findField('title') ?? document.body, record.title) : false,
      };
      sendResponse({ ok: true, data: results });
      return false;
    }
    if (request.type === 'page:capture') {
      sendResponse({ ok: true, data: capture() });
      return false;
    }
    return false;
  });
}
