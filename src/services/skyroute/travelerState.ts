import type { TravelerState } from '../../models/skyroute/planner.types';

export const LAST_TRAVELER_STATE_KEY = 'skyroute:last-traveler-state';

type TravelerStateRecord = Partial<TravelerState> & Record<string, unknown>;

function getNumber(
  source: TravelerStateRecord,
  key: string,
  fallback = 0,
): number {
  const value = source[key];

  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  return fallback;
}

function getBoolean(
  source: TravelerStateRecord,
  key: string,
  fallback = false,
): boolean {
  const value = source[key];

  if (typeof value === 'boolean') {
    return value;
  }

  return fallback;
}

function getArray<T = unknown>(source: TravelerStateRecord, key: string): T[] {
  const value = source[key];

  if (Array.isArray(value)) {
    return value as T[];
  }

  return [];
}

function getObjectRecord(
  source: TravelerStateRecord,
  key: string,
): Record<string, unknown> {
  const value = source[key];

  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }

  return {};
}

export function normalizeTravelerState(
  state: Partial<TravelerState> | null | undefined,
): TravelerState | null {
  if (
    !state ||
    typeof state.aeropuerto_actual !== 'string' ||
    !state.aeropuerto_actual
  ) {
    return null;
  }

  const source = state as TravelerStateRecord;

  return {
    aeropuerto_actual: state.aeropuerto_actual,

    presupuesto_inicial: getNumber(source, 'presupuesto_inicial'),
    presupuesto_actual: getNumber(source, 'presupuesto_actual'),

    tiempo_total_min: getNumber(source, 'tiempo_total_min'),
    tiempo_restante_min: getNumber(source, 'tiempo_restante_min'),

    minutos_desde_comida: getNumber(source, 'minutos_desde_comida'),
    minutos_desde_alojamiento: getNumber(source, 'minutos_desde_alojamiento'),

    distancia_total: getNumber(source, 'distancia_total'),
    distancia_subsidiada: getNumber(source, 'distancia_subsidiada'),

    tiempo_en_aeropuerto_actual: getNumber(
      source,
      'tiempo_en_aeropuerto_actual',
    ),
    estancia_minima_requerida: getNumber(source, 'estancia_minima_requerida'),
    tiempo_libre: getNumber(source, 'tiempo_libre'),

    en_transito: getBoolean(source, 'en_transito'),
    vuelo_en_curso: source.vuelo_en_curso ?? null,

    destinos_visitados: getArray<string>(source, 'destinos_visitados'),

    detalle_por_destino: getObjectRecord(source, 'detalle_por_destino'),

    vuelos: getArray(source, 'vuelos'),
    actividades: getArray(source, 'actividades'),
    trabajos: getArray(source, 'trabajos'),

    gasto_total: getNumber(source, 'gasto_total'),
    ganancia_total: getNumber(source, 'ganancia_total'),
  } as TravelerState;
}
