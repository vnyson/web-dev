export interface Racket {
  brand?: string;
  model?: string;
  [key: string]: unknown;
}

const RACKET_IMAGE_MAP: Record<string, string> = {
  'babolat pure aero': 'assets/images/rackets/Babolat Pure Aero.png',
  'babolat pure drive': 'assets/images/rackets/Babolat Pure Drive.png',
  'babolat pure strike': 'assets/images/rackets/Babolat Pure Strike.png',
  'head gravity': 'assets/images/rackets/Head Gravity.png',
  'head radical': 'assets/images/rackets/Head Radical.png',
  'head speed': 'assets/images/rackets/Head Speed.png',
  'wilson blade': 'assets/images/rackets/Wilson Blade.png',
  'wilson pro staff': 'assets/images/rackets/Wilson Pro Staff.png',
  'wilson redline': 'assets/images/rackets/Wilson Redline.png',
  'yonex ezone': 'assets/images/rackets/Yonex Ezone.png',
  'yonex vcore': 'assets/images/rackets/Yonex VCORE.png',
};

const DEFAULT_RACKET_IMAGE = 'assets/images/rackets/Wilson Pro Staff.png';

export function getRacketImage(
  brand: string | null | undefined,
  model: string | null | undefined,
): string {
  const fullKey = `${brand || ''} ${model || ''}`.trim().toLowerCase();
  if (!fullKey) return DEFAULT_RACKET_IMAGE;

  if (RACKET_IMAGE_MAP[fullKey]) return RACKET_IMAGE_MAP[fullKey];

  let bestMatch: string | null = null;
  let bestLength = 0;
  for (const [key, path] of Object.entries(RACKET_IMAGE_MAP)) {
    if (fullKey.includes(key) || key.includes(fullKey)) {
      if (key.length > bestLength) {
        bestLength = key.length;
        bestMatch = path;
      }
    }
  }

  return bestMatch || DEFAULT_RACKET_IMAGE;
}

export function getRacketImageForText(
  racquetText: string | null | undefined,
  playerRackets: Racket[] = [],
): string {
  const text = (racquetText || '').trim().toLowerCase();

  for (const racket of playerRackets) {
    const fullName = `${racket.brand || ''} ${racket.model || ''}`.trim().toLowerCase();
    if (!fullName) continue;

    if (
      (text && (text.includes(fullName) || fullName.includes(text))) ||
      (racket.model && text.includes(racket.model.toLowerCase()))
    ) {
      return getRacketImage(racket.brand, racket.model);
    }
  }

  if (text) {
    let bestMatch: string | null = null;
    let bestLength = 0;
    for (const [key, path] of Object.entries(RACKET_IMAGE_MAP)) {
      if (text.includes(key) || key.includes(text)) {
        if (key.length > bestLength) {
          bestLength = key.length;
          bestMatch = path;
        }
      }
    }
    if (bestMatch) return bestMatch;
  }

  if (playerRackets.length > 0) {
    return getRacketImage(playerRackets[0].brand, playerRackets[0].model);
  }

  return DEFAULT_RACKET_IMAGE;
}

export const RACKET_INVENTORY_SLOTS = [
  { left: '16%', bottom: '6%', width: '16%' },
  { left: '32%', bottom: '6%', width: '16%' },
  { left: '48%', bottom: '6%', width: '16%' },
  { left: '64%', bottom: '6%', width: '16%' },
  { left: '80%', bottom: '6%', width: '16%' },
];
