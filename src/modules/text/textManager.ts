import { TEXTS } from './data/texts';

const getRandomText = (): string => TEXTS[Math.floor(Math.random() * TEXTS.length)] ?? '';

export { getRandomText };
