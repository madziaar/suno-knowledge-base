/**
 * Background service worker (Manifest V3).
 *
 * Responsibilities, deliberately narrow:
 *   - be the single writer of `chrome.storage.local`
 *   - answer popup requests
 *   - route "apply this prompt to the page" messages to the active tab
 *
 * It never parses a user's lyrics, never calls an API and never logs content.
 * Text transforms happen in the popup/content script; this file only moves
 * records.
 */

import { PromptStore, chromeStorage } from '../src/lib/storage';
import type { Request, Response } from '../src/messages';

export default defineBackground(() => {
  // Instantiated inside main(): WXT forbids module-level side effects.
  const store = new PromptStore(chromeStorage());

  chrome.runtime.onInstalled.addListener(async () => {
    // Seed settings on first run so the UI never has to guess.
    const settings = await store.getSettings();
    await store.saveSettings(settings);
  });

  chrome.runtime.onMessage.addListener((request: Request, sender, sendResponse: (response: Response) => void) => {
    handle(request, sender, store)
      .then(sendResponse)
      .catch((error: unknown) => sendResponse({ ok: false, error: error instanceof Error ? error.message : String(error) }));
    // Keep the channel open for the async handler.
    return true;
  });
});

async function handle(
  request: Request,
  sender: chrome.runtime.MessageSender,
  store: PromptStore,
): Promise<Response> {
  switch (request.type) {
    case 'ping':
      return { ok: true, data: { version: chrome.runtime.getManifest().version } };

    case 'library:list':
      return { ok: true, data: await store.getLibrary() };

    case 'library:save':
      return { ok: true, data: await store.savePrompt(request.record) };

    case 'library:delete':
      return { ok: true, data: { deleted: await store.deletePrompt(request.id) } };

    case 'settings:get':
      return { ok: true, data: await store.getSettings() };

    case 'settings:save':
      return { ok: true, data: await store.saveSettings(request.patch) };

    case 'page:apply': {
      const tabId = sender.tab?.id ?? (await activeTabId());
      if (tabId === undefined) return { ok: false, error: 'no active tab' };
      await chrome.tabs.sendMessage(tabId, request);
      return { ok: true };
    }

    case 'page:fill': {
      const tabId = await activeTabId();
      if (tabId === undefined) return { ok: false, error: 'no active tab' };
      await chrome.tabs.sendMessage(tabId, request);
      return { ok: true };
    }

    case 'page:capture': {
      const tabId = await activeTabId();
      if (tabId === undefined) return { ok: false, error: 'no active tab' };
      const captured = (await chrome.tabs.sendMessage(tabId, request)) as { style?: string; lyrics?: string; title?: string } | undefined;
      return { ok: true, data: captured ?? {} };
    }

    default:
      return { ok: false, error: `unknown request: ${(request as { type?: string }).type ?? '?'}` };
  }
}

async function activeTabId(): Promise<number | undefined> {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab?.id;
}
