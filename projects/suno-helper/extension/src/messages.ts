/**
 * Typed message protocol between popup ⇄ background ⇄ content script.
 *
 * Keeping the union in one module means a renamed message is a compile error
 * instead of a silent no-op at runtime.
 */

import type { SongCapture } from './lib/capture';
import type { PromptRecord, Settings } from './lib/storage';
import type { SongRef } from './lib/parseLinks';

export interface BatchProgress {
  readonly jobId: string;
  readonly total: number;
  readonly done: number;
  readonly failed: number;
  readonly queued: number;
  readonly running: number;
  readonly manual: number;
  readonly complete: boolean;
  readonly errors: readonly { readonly url: string; readonly error: string }[];
}

export type Request =
  | { type: 'ping' }
  | { type: 'library:list' }
  | { type: 'library:save'; record: PromptRecord }
  | { type: 'library:delete'; id: string }
  | { type: 'settings:get' }
  | { type: 'settings:save'; patch: Partial<Settings> }
  | { type: 'page:apply'; field: 'style' | 'lyrics' | 'title' | 'exclude'; value: string }
  | { type: 'page:fill'; record: PromptRecord }
  | { type: 'page:capture' }
  | { type: 'batch:start'; refs: readonly SongRef[] }
  | { type: 'batch:status' }
  | { type: 'batch:cancel' }
  | { type: 'captures:list' }
  | { type: 'captures:clear' };

/** Pushed from the background worker to any open popup/options page. */
export type Event =
  | { type: 'batch:progress'; progress: BatchProgress }
  | { type: 'batch:done'; progress: BatchProgress }
  | { type: 'capture:page'; capture: SongCapture };

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

/** Fire-and-forget event to the popup. Silent when no listener is attached. */
export function emit(event: Event): void {
  try {
    chrome.runtime.sendMessage(event, () => void chrome.runtime.lastError);
  } catch {
    // No popup open — that is the normal case in a cron-free browser.
  }
}
