export function parseCommaSeparated(value: string): string[] {
  return value.split(',').map((s) => s.trim()).filter(Boolean);
}

export function toCommaSeparated(arr: string[] | undefined): string {
  return arr?.join(', ') || '';
}
