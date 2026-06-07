import type {
  RouteResult,
  TransportType,
} from '../../../../models/skyroute/planner.types';

export interface TransportUsageValidation {
  required: TransportType[];
  used: TransportType[];
  missing: TransportType[];
  isRequired: boolean;
  isSatisfied: boolean;
  message: string;
}

const TRANSPORT_TYPES: TransportType[] = [
  'Avión Comercial',
  'Avión Regional',
  'Hélice',
];

const LEG_TRANSPORT_KEYS = [
  'aeronave',
  'aeronave_usada',
  'tipo_aeronave',
  'tipoAeronave',
  'tipo_transporte',
  'tipoTransporte',
  'transporte',
  'aircraft',
  'aircraft_type',
  'aircraftType',
];

const LEG_COLLECTION_KEYS = [
  'tramos',
  'legs',
  'segmentos',
  'route_legs',
  'routeLegs',
  'detalle_tramos',
  'detalleTramos',
];

function normalizeText(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function normalizeTransport(value: unknown): TransportType | null {
  if (typeof value !== 'string') return null;

  const normalized = normalizeText(value);

  if (normalized.includes('comercial')) {
    return 'Avión Comercial';
  }

  if (normalized.includes('regional')) {
    return 'Avión Regional';
  }

  if (normalized.includes('helice') || normalized.includes('hélice')) {
    return 'Hélice';
  }

  return null;
}

function getObjectRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object') return null;

  return value as Record<string, unknown>;
}

function getLegsFromRouteResult(
  result: RouteResult | null | undefined,
): unknown[] {
  const data = getObjectRecord(result);

  if (!data) return [];

  for (const key of LEG_COLLECTION_KEYS) {
    const value = data[key];

    if (Array.isArray(value)) {
      return value;
    }
  }

  const nestedRoute = getObjectRecord(data.ruta);

  if (nestedRoute) {
    for (const key of LEG_COLLECTION_KEYS) {
      const value = nestedRoute[key];

      if (Array.isArray(value)) {
        return value;
      }
    }
  }

  return [];
}

function getTransportFromLeg(leg: unknown): TransportType | null {
  const data = getObjectRecord(leg);

  if (!data) return null;

  for (const key of LEG_TRANSPORT_KEYS) {
    const transport = normalizeTransport(data[key]);

    if (transport) {
      return transport;
    }
  }

  return null;
}

function uniqueTransports(transports: TransportType[]): TransportType[] {
  return TRANSPORT_TYPES.filter((transport) => transports.includes(transport));
}

export function getUsedTransportsFromRouteResult(
  result: RouteResult | null | undefined,
): TransportType[] {
  const legs = getLegsFromRouteResult(result);

  const used = legs
    .map(getTransportFromLeg)
    .filter((transport): transport is TransportType => Boolean(transport));

  return uniqueTransports(used);
}

export function buildTransportUsageValidation(
  requiredTransports: TransportType[],
  result: RouteResult | null | undefined,
): TransportUsageValidation {
  const required = uniqueTransports(requiredTransports);
  const used = getUsedTransportsFromRouteResult(result);

  const missing = required.filter((transport) => !used.includes(transport));

  const isRequired = required.length > 0;
  const isSatisfied = !isRequired || missing.length === 0;

  let message = 'No se exigió el uso de transportes específicos.';

  if (isRequired && !result) {
    message =
      'Cuando se calcule una ruta, se validará si usa todos los transportes seleccionados.';
  }

  if (isRequired && result && isSatisfied) {
    message = 'La ruta usa todos los transportes seleccionados.';
  }

  if (isRequired && result && !isSatisfied) {
    message = `La ruta no usa todos los transportes seleccionados. Faltan: ${missing.join(
      ', ',
    )}.`;
  }

  return {
    required,
    used,
    missing,
    isRequired,
    isSatisfied,
    message,
  };
}
