const QUEUE_IMAGES: Record<number, string> = {
  0: 'Pokemon Hospital-0.png',
  1: 'Pokemon Hospital-1.png',
  2: 'Pokemon Hospital-2.png',
  3: 'Pokemon Hospital-3.png',
  4: 'Pokemon Hospital-4.png',
  5: 'Pokemon Hospital-5.png',
  6: 'Pokemon Hospital-6.png',
};

const QUEUE_TEXTS: Record<number, string> = {
  0: 'EST. 1-2 days',
  1: 'EST. 1-2 days',
  2: 'EST. 2-3 days',
  3: 'EST. 2-3 days',
  4: 'EST. 4-5 days',
  5: 'EST. 6-7 days',
  6: 'EST. 6-7 days',
};

const QUEUE_FULL_IMAGE = 'Pokemon Hospital-FULL.png';
const QUEUE_FULL_TEXT = 'EST. 1-2 weeks';
const QUEUE_IMAGE_PATH = 'assets/images/queue/';

export function getQueueImageName(count: number): string {
  return QUEUE_IMAGES[count] ?? QUEUE_FULL_IMAGE;
}

export function getQueueText(count: number): string {
  return QUEUE_TEXTS[count] ?? QUEUE_FULL_TEXT;
}

export function getQueueImageSrc(count: number): string {
  return `${QUEUE_IMAGE_PATH}${getQueueImageName(count)}`;
}

export function updateQueueDisplayElements(
  images: NodeListOf<HTMLImageElement>,
  texts: NodeListOf<HTMLElement>,
  count: number,
): void {
  const src = getQueueImageSrc(count);
  const text = getQueueText(count);

  images.forEach((img) => {
    img.src = src;
  });
  texts.forEach((el) => {
    el.textContent = text;
  });
}
