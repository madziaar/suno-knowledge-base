/**
 * Every DOM selector the content script uses lives here.
 *
 * A Suno UI change should be a one-file fix. Each selector is tried in order;
 * the first match wins. `version` records when the list was last verified.
 *
 * NOTE: these are best-effort and intentionally resilient (aria-label and
 * placeholder text change less often than class names, and class names are
 * hashed by the bundler). Verify against the live page before relying on a
 * selector, and prefer a `textarea` fallback over guessing a wrapper.
 */

export const SELECTOR_VERSION = '2026-10-29';

export interface FieldSelector {
  readonly name: 'style' | 'lyrics' | 'title' | 'exclude' | 'simplePrompt';
  readonly candidates: readonly string[];
  readonly description: string;
}

export const FIELDS: readonly FieldSelector[] = [
  {
    name: 'style',
    description: 'Custom-mode Style field',
    candidates: [
      'textarea[placeholder*="style" i]',
      'textarea[aria-label*="style" i]',
      'div[role="textbox"][aria-label*="style" i]',
      'textarea[placeholder*="Describe" i]',
    ],
  },
  {
    name: 'lyrics',
    description: 'Custom-mode Lyrics field',
    candidates: [
      'textarea[placeholder*="lyric" i]',
      'textarea[aria-label*="lyric" i]',
      'div[role="textbox"][aria-label*="lyric" i]',
      'textarea[placeholder*="Write" i]',
    ],
  },
  {
    name: 'title',
    description: 'Song title input',
    candidates: ['input[placeholder*="title" i]', 'input[aria-label*="title" i]'],
  },
  {
    name: 'exclude',
    description: 'Exclude Styles field',
    candidates: ['input[placeholder*="exclude" i]', 'textarea[placeholder*="exclude" i]', 'input[aria-label*="exclude" i]'],
  },
  {
    name: 'simplePrompt',
    description: 'Simple-mode single prompt box',
    candidates: ['textarea[placeholder*="song" i]', 'textarea[aria-label*="describe" i]'],
  },
];

export const ANCHORS = {
  /** Where to mount the floating companion button. */
  toolbar: ['form', 'main', '[role="main"]'],
  /** Where the create form lives; absent means we are not on the create page. */
  createForm: ['form', 'textarea'],
} as const;

export function findField(name: FieldSelector['name']): HTMLElement | null {
  const field = FIELDS.find((item) => item.name === name);
  if (!field) return null;
  for (const selector of field.candidates) {
    const element = document.querySelector<HTMLElement>(selector);
    if (element && isEditable(element)) return element;
  }
  return null;
}

export function isEditable(element: HTMLElement): boolean {
  if (element instanceof HTMLTextAreaElement || element instanceof HTMLInputElement) {
    return !element.disabled && !element.readOnly;
  }
  return element.isContentEditable || element.getAttribute('role') === 'textbox';
}

/**
 * Set a field's value in a way React/Vue actually notice.
 * Uses the native setter so the framework's value tracker is bypassed, then
 * dispatches the events a controlled input listens for.
 */
export function setFieldValue(element: HTMLElement, value: string): boolean {
  if (element instanceof HTMLTextAreaElement || element instanceof HTMLInputElement) {
    const prototype = element instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
    const setter = Object.getOwnPropertyDescriptor(prototype, 'value')?.set;
    if (setter) setter.call(element, value);
    else element.value = value;
  } else if (element.isContentEditable) {
    element.textContent = value;
  } else {
    return false;
  }
  element.dispatchEvent(new Event('input', { bubbles: true }));
  element.dispatchEvent(new Event('change', { bubbles: true }));
  return true;
}

export function isCreatePage(): boolean {
  if (!/suno\.com/.test(location.hostname)) return false;
  return findField('style') !== null || findField('simplePrompt') !== null;
}
