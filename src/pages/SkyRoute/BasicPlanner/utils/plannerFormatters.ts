import type { TransportType } from '../../../../models/skyroute/planner.types';

export function selectedTransportsOrNull(
  selected: TransportType[],
): TransportType[] | null {
  return selected.length > 0 ? selected : null;
}

export function formatNumber(
  value: number | undefined | null,
  decimals = 2,
): string {
  if (value === undefined || value === null || Number.isNaN(value)) {
    return '0';
  }

  return Number(value).toFixed(decimals).replace(/\.00$/, '');
}

export function getNumberValue(source: unknown, keys: string[]): number {
  if (!source || typeof source !== 'object') {
    return 0;
  }

  const data = source as Record<string, unknown>;

  for (const key of keys) {
    const value = data[key];

    if (typeof value === 'number') {
      return value;
    }
  }

  return 0;
}
