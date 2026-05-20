import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

let counter = 0;
export function generateId(): string {
  counter += 1;
  return `n${counter}_${Date.now().toString(36)}`;
}

export function calculateLayout(entityNames: string[]): Map<string, { x: number; y: number }> {
  const positions = new Map<string, { x: number; y: number }>();
  const cols = Math.max(1, Math.ceil(Math.sqrt(entityNames.length)));
  const nodeW = 280;
  const nodeH = 200;
  const gapX = 60;
  const gapY = 60;

  entityNames.forEach((name, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    positions.set(name, {
      x: col * (nodeW + gapX) + 40,
      y: row * (nodeH + gapY) + 40,
    });
  });

  return positions;
}
