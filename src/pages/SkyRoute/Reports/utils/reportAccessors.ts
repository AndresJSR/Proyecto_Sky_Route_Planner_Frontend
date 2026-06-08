import type {
  AirportDetail,
  RouteDto,
} from '../../../../models/skyroute/graph.types';
import type { TravelerState } from '../../../../models/skyroute/planner.types';

export function getNumberValue(source: unknown, keys: string[]): number {
  if (!source || typeof source !== 'object') return 0;

  const data = source as Record<string, unknown>;

  for (const key of keys) {
    const value = data[key];

    if (typeof value === 'number' && Number.isFinite(value)) {
      return value;
    }
  }

  return 0;
}

export function getNullableNumberValue(
  source: unknown,
  keys: string[],
): number | null {
  if (!source || typeof source !== 'object') return null;

  const data = source as Record<string, unknown>;

  for (const key of keys) {
    const value = data[key];

    if (typeof value === 'number' && Number.isFinite(value)) {
      return value;
    }
  }

  return null;
}

export function getStringValue(source: unknown, keys: string[]): string {
  if (!source || typeof source !== 'object') return '';

  const data = source as Record<string, unknown>;

  for (const key of keys) {
    const value = data[key];

    if (typeof value === 'string') {
      return value;
    }
  }

  return '';
}

export function getArrayValue(source: unknown, keys: string[]): unknown[] {
  if (!source || typeof source !== 'object') return [];

  const data = source as Record<string, unknown>;

  for (const key of keys) {
    const value = data[key];

    if (Array.isArray(value)) {
      return value;
    }
  }

  return [];
}

export function getRouteDistance(route: RouteDto): number | null {
  return getNullableNumberValue(route, ['distanciaKm', 'distancia_km']);
}

export function getRouteMinimumStay(route: RouteDto): number {
  return getNumberValue(route, [
    'estanciaMinima',
    'estancia_minima',
    'estancia_minima_min',
  ]);
}

export function getRouteCostBase(route: RouteDto): number {
  return getNumberValue(route, ['costoBase', 'costo_base']);
}

export function getAirportCostValue(
  airport: AirportDetail | undefined,
  keys: string[],
): number {
  return getNumberValue(airport, keys);
}

export function getVisitedAirportCodes(estado: TravelerState): string[] {
  const values = getArrayValue(estado, [
    'destinos_visitados',
    'destinosVisitados',
    'visited_airports',
  ]);

  return values.filter((item): item is string => typeof item === 'string');
}

export function getTravelerFlights(estado: TravelerState): unknown[] {
  return getArrayValue(estado, ['vuelos', 'flights']);
}

export function getTravelerActivities(estado: TravelerState): unknown[] {
  return getArrayValue(estado, ['actividades', 'activities']);
}

export function getTravelerJobs(estado: TravelerState): unknown[] {
  return getArrayValue(estado, ['trabajos', 'jobs']);
}

export function buildRouteKey(origen: string, destino: string): string {
  return `${origen}-${destino}`;
}

export function findRouteByFlight(
  flight: unknown,
  routes: RouteDto[],
): RouteDto | null {
  const origen = getStringValue(flight, ['origen', 'origin']);
  const destino = getStringValue(flight, ['destino', 'destination']);

  if (!origen || !destino) {
    return null;
  }

  return (
    routes.find(
      (route) => route.origen === origen && route.destino === destino,
    ) ?? null
  );
}

export function findAirportByCode(
  airportCode: string,
  airportDetails: AirportDetail[],
): AirportDetail | undefined {
  return airportDetails.find((airport) => airport.id === airportCode);
}
