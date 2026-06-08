const numberFormatter = new Intl.NumberFormat('es-CO', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

const moneyFormatter = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

export function formatNumber(value: number | null | undefined): string {
  return numberFormatter.format(value ?? 0);
}

export function formatMoney(value: number | null | undefined): string {
  return moneyFormatter.format(value ?? 0);
}

export function formatMinutes(value: number | null | undefined): string {
  return `${formatNumber(value)} min`;
}

export function formatHoursFromMinutes(
  value: number | null | undefined,
): string {
  const minutes = value ?? 0;
  const hours = minutes / 60;

  return `${formatNumber(hours)} h`;
}

export function formatNullableNumber(
  value: number | null | undefined,
  fallback = 'N/D',
): string {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return fallback;
  }

  return formatNumber(value);
}

export function formatNullableDistance(
  value: number | null | undefined,
): string {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return 'N/D';
  }

  return `${formatNumber(value)} km`;
}
