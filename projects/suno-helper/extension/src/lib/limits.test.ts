import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

import {
  DEFAULT_MODEL,
  FIELD_LIMITS,
  MODEL_LIMITS,
  charCount,
  checkBudget,
  isModelId,
  modelLimits,
  tagCountStatus,
  truncateGraphemes,
} from './limits';

const canonicalPath = resolve(__dirname, '../../../../../docs/suno-limits.json');

describe('limits mirror', () => {
  it('matches docs/suno-limits.json (drift guard)', () => {
    const canonical = JSON.parse(readFileSync(canonicalPath, 'utf8')) as {
      fields: Record<string, number>;
      models: Record<string, { style_chars: number; lyrics_chars: number }>;
    };

    for (const [model, spec] of Object.entries(canonical.models)) {
      expect(isModelId(model), model).toBe(true);
      const local = MODEL_LIMITS[model as keyof typeof MODEL_LIMITS];
      expect(local.styleChars, `${model} style`).toBe(spec.style_chars);
      expect(local.lyricsChars, `${model} lyrics`).toBe(spec.lyrics_chars);
    }

    expect(FIELD_LIMITS.simplePromptChars).toBe(canonical.fields.simple_prompt_chars);
    expect(FIELD_LIMITS.titleChars).toBe(canonical.fields.title_chars);
    expect(FIELD_LIMITS.titleCharsApi).toBe(canonical.fields.title_chars_api);
    expect(FIELD_LIMITS.excludeStylesChars).toBe(canonical.fields.exclude_styles_chars);
  });

  it('has sane v5 limits', () => {
    expect(modelLimits('v5')).toMatchObject({ styleChars: 1000, lyricsChars: 5000 });
  });

  it('falls back to the default model for an unknown id', () => {
    expect(modelLimits('v9' as never)).toBe(MODEL_LIMITS[DEFAULT_MODEL]);
  });

  it('marks old models as legacy', () => {
    expect(MODEL_LIMITS.v4.status).toBe('legacy');
    expect(MODEL_LIMITS['v5.5'].status).toBe('current');
  });
});

describe('charCount', () => {
  it('counts plain text', () => {
    expect(charCount('hello')).toBe(5);
    expect(charCount('')).toBe(0);
  });

  it('counts an emoji once, not twice', () => {
    expect(charCount('🎵')).toBe(1);
    expect(charCount('a🎵b')).toBe(3);
  });

  it('counts a combining mark as part of its base character', () => {
    expect(charCount('e\u0301')).toBe(1);
  });

  it('counts a lone surrogate once instead of throwing', () => {
    expect(charCount('\ud800')).toBe(1);
  });
});

describe('truncateGraphemes', () => {
  it('is a no-op under budget', () => {
    expect(truncateGraphemes('abc', 10)).toEqual({ value: 'abc', truncated: false, originalChars: 3, keptChars: 3 });
  });

  it('cuts to the budget and says so', () => {
    const result = truncateGraphemes('abcdef', 3);
    expect(result.value).toBe('abc');
    expect(result.truncated).toBe(true);
    expect(result.originalChars).toBe(6);
  });

  it('never splits a surrogate pair', () => {
    const result = truncateGraphemes('a🎵b🎵', 2);
    expect([...result.value]).toHaveLength(2);
    // No lone surrogates: a split pair would show up as one unmatched code unit.
    expect(/[\uD800-\uDBFF](?![\uDC00-\uDFFF])/.test(result.value)).toBe(false);
  });

  it('treats a negative budget as zero', () => {
    expect(truncateGraphemes('abc', -1).value).toBe('');
  });
});

describe('checkBudget', () => {
  it('reports a clean fit', () => {
    const report = checkBudget('style', 'indie pop', 'v5.5');
    expect(report.ok).toBe(true);
    expect(report.over).toBe(0);
    expect(report.limit).toBe(1000);
  });

  it('reports overflow with the exact excess', () => {
    const text = 'x'.repeat(1010);
    const report = checkBudget('style', text, 'v5.5');
    expect(report.ok).toBe(false);
    expect(report.over).toBe(10);
    expect(report.ratio).toBe(1);
  });

  it('applies the legacy budget for legacy models', () => {
    const report = checkBudget('style', 'x'.repeat(300), 'v4');
    expect(report.ok).toBe(false);
    expect(report.limit).toBe(200);
  });

  it('uses field limits for title and exclude', () => {
    expect(checkBudget('title', 'x'.repeat(101)).limit).toBe(100);
    expect(checkBudget('exclude', 'x'.repeat(1001)).limit).toBe(1000);
    expect(checkBudget('simplePrompt', 'x'.repeat(501)).limit).toBe(500);
  });
});

describe('tagCountStatus', () => {
  it('classifies tag counts against the sweet spot', () => {
    expect(tagCountStatus(3)).toBe('thin');
    expect(tagCountStatus(8)).toBe('good');
    expect(tagCountStatus(15)).toBe('dense');
    expect(tagCountStatus(20)).toBe('overloaded');
  });
});
