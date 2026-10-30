/**
 * Popup UI state (zustand).
 *
 * Only genuinely shared state lives here: the model, the pillar builder, and the
 * free-text style box that the library hands back to the builder. Panel-local
 * state (a query, a tab, a toast) stays in the component.
 */

import { create } from 'zustand';

import { EMPTY_STYLE_STATE, buildStyle, rollStyle, toggleLock, type PillarId, type StyleState } from '../lib/buildStyle';
import { DEFAULT_MODEL, type ModelId } from '../lib/limits';

export interface BuilderStore {
  readonly model: ModelId;
  readonly style: StyleState;
  readonly styleText: string;
  readonly excluded: readonly PillarId[];
  setModel(model: ModelId): void;
  roll(seed?: number): void;
  toggle(pillar: PillarId): void;
  setStyleText(text: string): void;
  loadStyle(text: string): void;
  toggleExclude(pillar: PillarId): void;
  reset(): void;
  rendered(): string;
}

export const useBuilder = create<BuilderStore>((set, get) => ({
  model: DEFAULT_MODEL,
  style: rollStyle(EMPTY_STYLE_STATE, { seed: 7 }),
  styleText: '',
  excluded: [],

  setModel: (model) => set({ model }),

  roll: (seed) => set({ style: rollStyle(get().style, seed === undefined ? {} : { seed }) }),

  toggle: (pillar) => set({ style: toggleLock(get().style, pillar) }),

  setStyleText: (styleText) => set({ styleText }),

  // A saved prompt has no pillar structure — put it in the text box and let the
  // cleaner turn it back into tags, rather than guessing which pillar is which.
  loadStyle: (text) => set({ styleText: text }),

  toggleExclude: (pillar) =>
    set({
      excluded: get().excluded.includes(pillar)
        ? get().excluded.filter((item) => item !== pillar)
        : [...get().excluded, pillar],
    }),

  reset: () => set({ style: rollStyle(EMPTY_STYLE_STATE, { seed: get().style.seed + 1 }), styleText: '', excluded: [] }),

  rendered: () => buildStyle(get().style, { exclude: get().excluded }),
}));
