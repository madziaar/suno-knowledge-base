import { describe, expect, it } from 'vitest';

import { bestTarget, explainMissingTracks, findMediaTargets, isTrustedHost, safeFilename } from './mediaTargets';

const PAGE = 'https://suno.com/song/abc';

const html = (meta: string) => `<!doctype html><html><head>${meta}</head><body></body></html>`;

describe('isTrustedHost', () => {
  it('accepts Suno and its CDNs', () => {
    expect(isTrustedHost('cdn1.suno.ai')).toBe(true);
    expect(isTrustedHost('suno.com')).toBe(true);
  });

  it('rejects everything else', () => {
    expect(isTrustedHost('evil.example.com')).toBe(false);
    expect(isTrustedHost('suno.ai.evil.com')).toBe(false);
  });
});

describe('findMediaTargets', () => {
  it('reads og:audio and og:image', () => {
    const page = html(
      '<meta property="og:audio" content="https://cdn1.suno.ai/abc.mp3">' +
        '<meta property="og:image" content="https://cdn1.suno.ai/abc.jpeg">',
    );
    const targets = findMediaTargets(page, PAGE, 'My Song');
    expect(targets.map((target) => target.kind)).toEqual(['audio', 'cover']);
    expect(targets[0]!.filename).toBe('my-song.mp3');
    expect(targets[0]!.trusted).toBe(true);
  });

  it('reads JSON-LD contentUrl', () => {
    const page = html(
      '<script type="application/ld+json">{"audio":{"contentUrl":"https://cdn1.suno.ai/x.mp3"}}</script>',
    );
    expect(findMediaTargets(page, PAGE).some((target) => target.kind === 'audio')).toBe(true);
  });

  it('reads a bare <audio src>', () => {
    const targets = findMediaTargets('<audio src="https://cdn1.suno.ai/y.mp3"></audio>', PAGE);
    expect(targets[0]!.source).toBe('tag');
  });

  it('de-duplicates the same file linked with different query strings', () => {
    const page = html(
      '<meta property="og:audio" content="https://cdn1.suno.ai/a.mp3?utm=x">' +
        '<meta property="og:audio:url" content="https://cdn1.suno.ai/a.mp3?utm=y">',
    );
    expect(findMediaTargets(page, PAGE)).toHaveLength(1);
  });

  it('drops non-http schemes', () => {
    const page = html('<meta property="og:audio" content="javascript:alert(1)">');
    expect(findMediaTargets(page, PAGE)).toEqual([]);
  });

  it('resolves relative URLs against the page', () => {
    const targets = findMediaTargets('<audio src="/clips/z.mp3"></audio>', PAGE);
    expect(targets[0]!.url).toBe('https://suno.com/clips/z.mp3');
  });

  it('returns nothing for a page with no media', () => {
    expect(findMediaTargets('<html><body>hi</body></html>', PAGE)).toEqual([]);
  });

  it('sorts trusted hosts first', () => {
    const page = html(
      '<meta property="og:audio" content="https://evil.example/a.mp3">' +
        '<meta property="og:video" content="https://cdn1.suno.ai/a.mp4">',
    );
    expect(findMediaTargets(page, PAGE)[0]!.kind).toBe('video');
  });
});

describe('safeFilename', () => {
  it('slugifies the title and keeps the extension', () => {
    expect(safeFilename('Héllo, World!', 'audio', 'https://x/y.mp3')).toBe('hello-world.mp3');
  });

  it('falls back by kind when the URL has no extension', () => {
    expect(safeFilename('Track', 'cover', 'https://x/y')).toBe('track.jpg');
  });

  it('never returns an empty name', () => {
    expect(safeFilename('', 'audio', 'https://x/y.mp3')).toBe('suno-track.mp3');
  });
});

describe('bestTarget', () => {
  it('picks the first matching kind', () => {
    const targets = findMediaTargets(
      html('<meta property="og:audio" content="https://cdn1.suno.ai/a.mp3">'),
      PAGE,
    );
    expect(bestTarget(targets, 'audio')?.url).toContain('a.mp3');
    expect(bestTarget(targets, 'video')).toBeNull();
  });
});

describe('explainMissingTracks', () => {
  it('explains client-side rendering instead of returning an empty list', () => {
    expect(explainMissingTracks('playlist')).toContain('client');
    expect(explainMissingTracks('profile')).toContain('batch capture');
  });
});
