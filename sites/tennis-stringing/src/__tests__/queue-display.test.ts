import { describe, it, expect, vi } from 'vitest';
import { getQueueImageName, getQueueText, getQueueImageSrc } from '../lib/queue-display';

describe('getQueueImageName', () => {
  it('returns Pokemon Hospital-0.png for count 0', () => {
    expect(getQueueImageName(0)).toBe('Pokemon Hospital-0.png');
  });

  it('returns Pokemon Hospital-1.png for count 1', () => {
    expect(getQueueImageName(1)).toBe('Pokemon Hospital-1.png');
  });

  it('returns Pokemon Hospital-2.png for count 2', () => {
    expect(getQueueImageName(2)).toBe('Pokemon Hospital-2.png');
  });

  it('returns Pokemon Hospital-3.png for count 3', () => {
    expect(getQueueImageName(3)).toBe('Pokemon Hospital-3.png');
  });

  it('returns Pokemon Hospital-4.png for count 4', () => {
    expect(getQueueImageName(4)).toBe('Pokemon Hospital-4.png');
  });

  it('returns Pokemon Hospital-5.png for count 5', () => {
    expect(getQueueImageName(5)).toBe('Pokemon Hospital-5.png');
  });

  it('returns Pokemon Hospital-6.png for count 6', () => {
    expect(getQueueImageName(6)).toBe('Pokemon Hospital-6.png');
  });

  it('returns FULL image for count 7+', () => {
    expect(getQueueImageName(7)).toBe('Pokemon Hospital-FULL.png');
    expect(getQueueImageName(10)).toBe('Pokemon Hospital-FULL.png');
    expect(getQueueImageName(99)).toBe('Pokemon Hospital-FULL.png');
  });

  it('returns FULL image for negative count', () => {
    expect(getQueueImageName(-1)).toBe('Pokemon Hospital-FULL.png');
  });
});

describe('getQueueText', () => {
  it('returns EST. 1-2 days for count 0', () => {
    expect(getQueueText(0)).toBe('EST. 1-2 days');
  });

  it('returns EST. 1-2 days for count 1', () => {
    expect(getQueueText(1)).toBe('EST. 1-2 days');
  });

  it('returns EST. 2-3 days for count 2', () => {
    expect(getQueueText(2)).toBe('EST. 2-3 days');
  });

  it('returns EST. 2-3 days for count 3', () => {
    expect(getQueueText(3)).toBe('EST. 2-3 days');
  });

  it('returns EST. 4-5 days for count 4', () => {
    expect(getQueueText(4)).toBe('EST. 4-5 days');
  });

  it('returns EST. 6-7 days for count 5', () => {
    expect(getQueueText(5)).toBe('EST. 6-7 days');
  });

  it('returns EST. 6-7 days for count 6', () => {
    expect(getQueueText(6)).toBe('EST. 6-7 days');
  });

  it('returns EST. 1-2 weeks for count 7+', () => {
    expect(getQueueText(7)).toBe('EST. 1-2 weeks');
    expect(getQueueText(100)).toBe('EST. 1-2 weeks');
  });

  it('returns EST. 1-2 weeks for negative count', () => {
    expect(getQueueText(-1)).toBe('EST. 1-2 weeks');
  });
});

describe('getQueueImageSrc', () => {
  it('returns full path for count 0', () => {
    expect(getQueueImageSrc(0)).toBe('assets/images/queue/Pokemon Hospital-0.png');
  });

  it('returns full path for count 3', () => {
    expect(getQueueImageSrc(3)).toBe('assets/images/queue/Pokemon Hospital-3.png');
  });

  it('returns full path for count 7 (FULL)', () => {
    expect(getQueueImageSrc(7)).toBe('assets/images/queue/Pokemon Hospital-FULL.png');
  });
});
