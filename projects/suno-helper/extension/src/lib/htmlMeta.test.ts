import { describe, expect, it } from 'vitest';

import { decodeEntities, extractSongFromHtml, idFromUrl, parseDuration, parseMetaTags } from './htmlMeta';

const SONG = '1a2b3c4d-5e6f-4a7b-8c9d-0e1f2a3b4c5d';

const page = `<!doctype html>
<html><head>
<title>Night Drive | Suno</title>
<meta property="og:title" content="Night Drive" />
<meta property="og:description" content="An indie pop track about driving home." />
<meta property="og:image" content="https://cdn1.suno.ai/image_abc.png" />
<meta property="og:url" content="https://suno.com/song/${SONG}" />
<meta name="twitter:title" content="Night Drive" />
</head><body><h1>Night Drive</h1></body></html>`;

describe('decodeEntities', () => {
  it('decodes named and numeric entities', () => {
    expect(decodeEntities('a &amp; b &quot;c&quot; &#39;d&#x27;')).toBe('a & b "c" \'d\'');
  });

  it('leaves unknown entities alone', () => {
    expect(decodeEntities('&notreal;')).toBe('&notreal;');
  });
});

describe('parseMetaTags', () => {
  it('reads property and name attributes', () => {
    const tags = parseMetaTags(page);
    expect(tags['og:title']).toBe('Night Drive');
    expect(tags['twitter:title']).toBe('Night Drive');
  });

  it('handles single quotes and unquoted values', () => {
    const tags = parseMetaTags(`<meta property='og:title' content='X'><meta name=description content=Y>`);
    expect(tags['og:title']).toBe('X');
    expect(tags.description).toBe('Y');
  });

  it('returns an empty map for html without metas', () => {
    expect(parseMetaTags('<p>hi</p>')).toEqual({});
  });
});

describe('parseDuration', () => {
  it('parses ISO 8601 durations', () => {
    expect(parseDuration('PT3M12S')).toBe(192);
    expect(parseDuration('PT1H2M3S')).toBe(3723);
  });

  it('parses bare seconds', () => {
    expect(parseDuration(192)).toBe(192);
    expect(parseDuration('192')).toBe(192);
    expect(parseDuration('192s')).toBe(192);
  });

  it('returns null for nonsense', () => {
    expect(parseDuration('soon')).toBeNull();
    expect(parseDuration(undefined)).toBeNull();
    expect(parseDuration('PT0S')).toBeNull();
  });
});

describe('idFromUrl', () => {
  it('pulls the song uuid out of a canonical url', () => {
    expect(idFromUrl(`https://suno.com/song/${SONG}?sh=x`)).toBe(SONG);
  });

  it('returns empty for a non-song url', () => {
    expect(idFromUrl('https://suno.com/@someone')).toBe('');
  });
});

describe('extractSongFromHtml', () => {
  it('reads open graph data', () => {
    const meta = extractSongFromHtml(page, `https://suno.com/song/${SONG}`);
    expect(meta).toMatchObject({
      found: true,
      source: 'og',
      title: 'Night Drive',
      id: SONG,
      imageUrl: 'https://cdn1.suno.ai/image_abc.png',
      description: 'An indie pop track about driving home.',
    });
  });

  it('prefers JSON-LD when present', () => {
    const html = `${page}<script type="application/ld+json">${JSON.stringify({
      '@type': 'MusicRecording',
      name: 'Night Drive (Remaster)',
      duration: 'PT3M12S',
      byArtist: { '@type': 'MusicGroup', name: 'nightrider' },
      audio: 'https://cdn1.suno.ai/song_abc.mp3',
      genre: 'indie pop, dream pop',
      datePublished: '2026-03-01',
    })}</script>`;
    const meta = extractSongFromHtml(html, `https://suno.com/song/${SONG}`);
    expect(meta.source).toBe('jsonld');
    expect(meta.title).toBe('Night Drive (Remaster)');
    expect(meta.creator).toBe('nightrider');
    expect(meta.durationSeconds).toBe(192);
    expect(meta.audioUrl).toBe('https://cdn1.suno.ai/song_abc.mp3');
    expect(meta.tags).toEqual(['indie pop', 'dream pop']);
    expect(meta.publishedAt).toBe('2026-03-01');
  });

  it('handles an array of JSON-LD blocks', () => {
    const html = `<script type="application/ld+json">[{"@type":"WebSite","name":"Suno"},{"@type":"Song","name":"Solo Song"}]</script>`;
    expect(extractSongFromHtml(html, 'https://suno.com/song/x').title).toBe('Solo Song');
  });

  it('survives malformed JSON-LD', () => {
    const html = `${page}<script type="application/ld+json">{not json}</script>`;
    expect(extractSongFromHtml(html, 'https://suno.com/song/x').title).toBe('Night Drive');
  });

  it('falls back to the title tag, stripped of the Suno suffix', () => {
    const html = '<html><head><title>Quiet Hours | Suno</title></head></html>';
    const meta = extractSongFromHtml(html, 'https://suno.com/@x');
    expect(meta.title).toBe('Quiet Hours');
    expect(meta.source).toBe('title');
  });

  it('reports found: false when the page has nothing', () => {
    const meta = extractSongFromHtml('<html><body>nope</body></html>', 'https://suno.com/song/x');
    expect(meta.found).toBe(false);
    expect(meta.source).toBe('none');
    expect(meta.title).toBe('');
  });

  it('keeps the url it was given when og:url is absent', () => {
    const meta = extractSongFromHtml('<title>X</title>', 'https://suno.com/song/abc');
    expect(meta.url).toBe('https://suno.com/song/abc');
  });

  it('handles an empty document', () => {
    expect(extractSongFromHtml('', 'https://suno.com/song/x').found).toBe(false);
  });
});
