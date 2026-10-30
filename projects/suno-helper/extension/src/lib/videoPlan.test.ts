import { describe, expect, it } from 'vitest';

import type { Cue } from './timestamps';
import { THEMES, activeCue, clock, planLyricVideo, wrapLine } from './videoPlan';

const cue = (index: number, start: number, end: number, text: string, estimated = false): Cue => ({
  index,
  start,
  end,
  text,
  estimated,
});

const CUES = [cue(1, 0, 2, 'hello world', true), cue(2, 2, 4, 'second line')];

describe('wrapLine', () => {
  it('wraps at the character budget', () => {
    expect(wrapLine('aaa bbb ccc', 7)).toEqual(['aaa bbb', 'ccc']);
  });

  it('keeps an over-long word on its own line', () => {
    expect(wrapLine('supercalifragilistic ok', 4)).toEqual(['supercalifragilistic', 'ok']);
  });

  it('returns nothing for blank input', () => {
    expect(wrapLine('   ', 10)).toEqual([]);
  });
});

describe('activeCue', () => {
  it('finds the cue covering a time', () => {
    expect(activeCue(CUES, 1)?.index).toBe(1);
    expect(activeCue(CUES, 2.5)?.index).toBe(2);
  });

  it('returns null in a gap', () => {
    expect(activeCue(CUES, 9)).toBeNull();
  });
});

describe('planLyricVideo', () => {
  it('uses the last cue end as the duration', () => {
    const plan = planLyricVideo(CUES, { fps: 10 });
    expect(plan.durationSeconds).toBe(4);
    expect(plan.totalFrames).toBe(40);
  });

  it('emits keyframes plus cue changes', () => {
    const plan = planLyricVideo(CUES, { fps: 10 });
    expect(plan.frames.length).toBeGreaterThan(0);
    expect(plan.frames[0]!.cueIndex).toBe(1);
    expect(plan.frames.some((frame) => frame.cueIndex === 2)).toBe(true);
  });

  it('warns when timings are estimated', () => {
    expect(planLyricVideo(CUES).warnings.join(' ')).toContain('estimated');
  });

  it('warns when there is nothing to render', () => {
    expect(planLyricVideo([]).warnings).toContain('No cues — nothing to render.');
  });

  it('caps absurd frame counts', () => {
    const long = [cue(1, 0, 4000, 'x')];
    const plan = planLyricVideo(long, { fps: 60, maxFrames: 500 });
    expect(plan.totalFrames).toBe(500);
    expect(plan.warnings.join(' ')).toContain('capped');
  });

  it('wraps the text to the target width', () => {
    const wide = [cue(1, 0, 2, 'a '.repeat(60).trim())];
    const plan = planLyricVideo(wide, { width: 640, height: 360, fps: 10 });
    expect(plan.frames[0]!.lines.length).toBeGreaterThan(1);
  });

  it('defaults to a 1280x720 frame and a known theme', () => {
    const plan = planLyricVideo(CUES);
    expect(plan.width).toBe(1280);
    expect(plan.height).toBe(720);
    expect(THEMES.map((theme) => theme.id)).toContain(plan.theme.id);
  });
});

describe('clock', () => {
  it('writes m:ss', () => {
    expect(clock(65)).toBe('1:05');
    expect(clock(-1)).toBe('0:00');
  });
});
