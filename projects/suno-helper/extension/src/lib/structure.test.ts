import { describe, expect, it } from 'vitest';

import { INSTRUMENTAL_SECTIONS, TEMPLATES, applyTemplate, detectSections, suggestTemplate } from './structure';

const pop = TEMPLATES.find((template) => template.id === 'pop')!;
const folk = TEMPLATES.find((template) => template.id === 'folk')!;

const LYRICS = Array.from({ length: 20 }, (_, i) => `line ${i + 1}`).join('\n');

describe('applyTemplate', () => {
  it('inserts section headings', () => {
    const result = applyTemplate(LYRICS, pop);
    expect(result.text).toContain('[Verse 1]');
    expect(result.text).toContain('[Chorus]');
    expect(result.text).toContain('[Bridge]');
    expect(result.sectionsUsed).toBeGreaterThan(5);
  });

  it('keeps every lyric line exactly once', () => {
    const result = applyTemplate(LYRICS, pop);
    for (let i = 1; i <= 20; i += 1) {
      expect(result.text.split('\n').filter((line) => line === `line ${i}`)).toHaveLength(1);
    }
  });

  it('leaves an already-tagged lyric alone', () => {
    const tagged = '[Verse 1]\nhello\n[Chorus]\nworld';
    const result = applyTemplate(tagged, pop);
    expect(result.text).toBe(tagged);
    expect(result.warnings[0]).toContain('already tagged');
  });

  it('warns when there are more sections than lines', () => {
    const result = applyTemplate('only one line', pop);
    expect(result.warnings.join(' ')).toContain('left empty');
    expect(result.emptySections.length).toBeGreaterThan(0);
  });

  it('handles an empty lyric without throwing', () => {
    expect(applyTemplate('', pop).warnings).toEqual(['Nothing to tag.']);
  });

  it('never leaves a singable section without lines when there are enough', () => {
    const result = applyTemplate(LYRICS, folk);
    const singable = folk.sections.filter((section) => !INSTRUMENTAL_SECTIONS.has(section));
    expect(result.emptySections.filter((section) => singable.includes(section))).toEqual([]);
  });

  it('keeps instrumental sections empty', () => {
    const edm = TEMPLATES.find((template) => template.id === 'edm')!;
    const result = applyTemplate(LYRICS, edm);
    expect(result.text).toContain('[Drop]');
  });
});

describe('detectSections', () => {
  it('lists unique tags in order', () => {
    expect(detectSections('[Intro]\na\n[Chorus]\nb\n[Chorus]\nc')).toEqual(['Intro', 'Chorus']);
  });

  it('finds CJK and paren tags', () => {
    expect(detectSections('【副歌】\na\n(Verse)')).toEqual(['副歌', 'Verse']);
  });

  it('returns nothing for untagged text', () => {
    expect(detectSections('just words')).toEqual([]);
  });
});

describe('suggestTemplate', () => {
  it('picks shorter shapes for shorter lyrics', () => {
    expect(suggestTemplate(8).id).toBe('folk');
    expect(suggestTemplate(20).id).toBe('rock');
    expect(suggestTemplate(40).id).toBe('pop');
  });
});
