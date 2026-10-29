/**
 * Typed message protocol between popup ⇄ background ⇄ content script.
 *
 * Keeping the union in one module means a renamed message is a compile error
 * instead of a silent no-op at runtime.
 */

import type { PromptRecord, Settings } from './lib/storage';

export type Request =
  | { type: 'ping' }
  | { type: 'library:list' }
  | { type: 'library:save'; record: PromptRecord }
  | { type: 'library:delete'; id: string }
  | { type: 'settings:get' }
  | { type: 'settings:save'; patch: Partial<Settings> }
  | { type: 'page:apply'; field: 'style' | 'lyrics' | 'title' | 'exclude'; value: string }
  | { type: 'page:fill'; record: PromptRecord }
  | { type: 'page:capture' };

export type Response =
  | { ok: true; data?: unknown }
  | { ok: false; error: string };

export function send<T extends Response>(request: Request): Promise<T> {
  return new Promise((resolve, reject) => {
    try {
      chrome.runtime.sendMessage(request, (response: T) => {
        const error = chrome.runtime.lastError;
        if (error) reject(new Error(error.message));
        else resolve(response);
      });
    } catch (error) {
      reject(error instanceof Error ? error : new Error(String(error)));
    }
  });
}
