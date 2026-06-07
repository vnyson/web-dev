import { describe, it, expect } from 'vitest';
import { getRacketImage, getRacketImageForText } from '../lib/racket-images';

const DEFAULT_IMAGE = 'assets/images/rackets/Wilson Pro Staff.png';

describe('getRacketImage', () => {
  it('returns default image for empty brand and model', () => {
    expect(getRacketImage(null, null)).toBe(DEFAULT_IMAGE);
    expect(getRacketImage('', '')).toBe(DEFAULT_IMAGE);
    expect(getRacketImage(undefined, undefined)).toBe(DEFAULT_IMAGE);
  });

  it('returns default image for brand only (no exact match)', () => {
    // Dunlop fuzzy-matches nothing in our map
    expect(getRacketImage('Dunlop', null)).toBe(DEFAULT_IMAGE);
  });

  it('returns exact match for known racket', () => {
    expect(getRacketImage('Wilson', 'Pro Staff')).toBe(
      'assets/images/rackets/Wilson Pro Staff.png',
    );
  });

  it('returns exact match for Babolat Pure Aero', () => {
    expect(getRacketImage('Babolat', 'Pure Aero')).toBe(
      'assets/images/rackets/Babolat Pure Aero.png',
    );
  });

  it('returns exact match for Babolat Pure Drive', () => {
    expect(getRacketImage('Babolat', 'Pure Drive')).toBe(
      'assets/images/rackets/Babolat Pure Drive.png',
    );
  });

  it('returns exact match for Babolat Pure Strike', () => {
    expect(getRacketImage('Babolat', 'Pure Strike')).toBe(
      'assets/images/rackets/Babolat Pure Strike.png',
    );
  });

  it('returns exact match for Head Gravity', () => {
    expect(getRacketImage('Head', 'Gravity')).toBe('assets/images/rackets/Head Gravity.png');
  });

  it('returns exact match for Head Radical', () => {
    expect(getRacketImage('Head', 'Radical')).toBe('assets/images/rackets/Head Radical.png');
  });

  it('returns exact match for Head Speed', () => {
    expect(getRacketImage('Head', 'Speed')).toBe('assets/images/rackets/Head Speed.png');
  });

  it('returns exact match for Wilson Blade', () => {
    expect(getRacketImage('Wilson', 'Blade')).toBe('assets/images/rackets/Wilson Blade.png');
  });

  it('returns exact match for Wilson Redline', () => {
    expect(getRacketImage('Wilson', 'Redline')).toBe('assets/images/rackets/Wilson Redline.png');
  });

  it('returns exact match for Yonex Ezone', () => {
    expect(getRacketImage('Yonex', 'Ezone')).toBe('assets/images/rackets/Yonex Ezone.png');
  });

  it('returns exact match for Yonex VCORE', () => {
    expect(getRacketImage('Yonex', 'VCORE')).toBe('assets/images/rackets/Yonex VCORE.png');
  });

  it('returns fuzzy match for partial key', () => {
    // 'wilson pro staff v13' fuzzy matches 'wilson pro staff'
    const result = getRacketImage('Wilson', 'Pro Staff v13');
    expect(result).toBe('assets/images/rackets/Wilson Pro Staff.png');
  });

  it('returns default for completely unknown racket', () => {
    expect(getRacketImage('Dunlop', 'CX 200')).toBe(DEFAULT_IMAGE);
  });
});

describe('getRacketImageForText', () => {
  const mockRackets = [
    { brand: 'Wilson', model: 'Pro Staff' },
    { brand: 'Babolat', model: 'Pure Aero' },
  ];

  it('returns default for empty text and no rackets', () => {
    expect(getRacketImageForText('', [])).toBe(DEFAULT_IMAGE);
    expect(getRacketImageForText(null, [])).toBe(DEFAULT_IMAGE);
    expect(getRacketImageForText(undefined, [])).toBe(DEFAULT_IMAGE);
  });

  it('returns first racket image when text is empty', () => {
    const result = getRacketImageForText('', mockRackets);
    expect(result).toBe('assets/images/rackets/Wilson Pro Staff.png');
  });

  it('matches racket text to player rackets by fullName', () => {
    const result = getRacketImageForText('Wilson Pro Staff', mockRackets);
    expect(result).toBe('assets/images/rackets/Wilson Pro Staff.png');
  });

  it('matches racket text to player rackets by model', () => {
    const result = getRacketImageForText('Pure Aero', mockRackets);
    expect(result).toBe('assets/images/rackets/Babolat Pure Aero.png');
  });

  it('returns fuzzy match from known map when no racket match', () => {
    const result = getRacketImageForText('head gravity', []);
    expect(result).toBe('assets/images/rackets/Head Gravity.png');
  });

  it('returns first racket image as fallback', () => {
    const result = getRacketImageForText('completely unknown racket', mockRackets);
    expect(result).toBe('assets/images/rackets/Wilson Pro Staff.png');
  });

  it('returns default when text is unknown and no rackets', () => {
    expect(getRacketImageForText('random text', [])).toBe(DEFAULT_IMAGE);
  });
});
