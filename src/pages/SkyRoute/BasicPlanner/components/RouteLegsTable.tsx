import { Table } from '../../../../components/ui';
import type { FlightLeg } from '../../../../models/skyroute/planner.types';
import { formatNumber } from '../utils/plannerFormatters';

interface RouteLegsTableProps {
  legs: FlightLeg[];
}

interface RouteLegRow extends Record<string, unknown> {
  tramo: string;
  origen: string;
  destino: string;
  aeronave: string;
  distancia: string;
  costo: string;
  costoAcumulado: string;
  tiempo: string;
  tiempoAcumulado: string;
  subsidiada: string;
}

const STRING_KEYS = {
  origen: ['origen', 'origin'],
  destino: ['destino', 'destination'],
  aeronave: [
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
  ],
};

const NUMBER_KEYS = {
  distancia: ['distancia_km', 'distanciaKm', 'distance_km', 'distanceKm'],
  costo: ['costo_usd', 'costoUsd', 'costo', 'cost_usd', 'costUsd', 'cost'],
  tiempo: ['tiempo_min', 'tiempoMin', 'time_min', 'timeMin'],
};

const BOOLEAN_KEYS = {
  subsidiada: ['subsidiada', 'subsidized'],
};

function getStringValue(source: unknown, keys: string[], fallback = 'N/A') {
  if (!source || typeof source !== 'object') return fallback;

  const data = source as Record<string, unknown>;

  for (const key of keys) {
    const value = data[key];

    if (typeof value === 'string' && value.trim()) {
      return value;
    }
  }

  return fallback;
}

function getNumberValue(source: unknown, keys: string[]) {
  if (!source || typeof source !== 'object') return 0;

  const data = source as Record<string, unknown>;

  for (const key of keys) {
    const value = data[key];

    if (typeof value === 'number') {
      return value;
    }
  }

  return 0;
}

function getBooleanValue(source: unknown, keys: string[]) {
  if (!source || typeof source !== 'object') return false;

  const data = source as Record<string, unknown>;

  for (const key of keys) {
    const value = data[key];

    if (typeof value === 'boolean') {
      return value;
    }
  }

  return false;
}

export function RouteLegsTable({ legs }: RouteLegsTableProps) {
  let costoAcumulado = 0;
  let tiempoAcumulado = 0;

  const rows: RouteLegRow[] = legs.map((leg, index) => {
    const origen = getStringValue(leg, STRING_KEYS.origen);
    const destino = getStringValue(leg, STRING_KEYS.destino);
    const aeronave = getStringValue(leg, STRING_KEYS.aeronave);

    const distancia = getNumberValue(leg, NUMBER_KEYS.distancia);
    const costo = getNumberValue(leg, NUMBER_KEYS.costo);
    const tiempo = getNumberValue(leg, NUMBER_KEYS.tiempo);
    const subsidiada = getBooleanValue(leg, BOOLEAN_KEYS.subsidiada);

    costoAcumulado += costo;
    tiempoAcumulado += tiempo;

    return {
      tramo: `${index + 1}`,
      origen,
      destino,
      aeronave,
      distancia: `${formatNumber(distancia)} km`,
      costo: `$${formatNumber(costo)} USD`,
      costoAcumulado: `$${formatNumber(costoAcumulado)} USD`,
      tiempo: `${formatNumber(tiempo)} min`,
      tiempoAcumulado: `${formatNumber(tiempoAcumulado)} min`,
      subsidiada: subsidiada ? 'Sí' : 'No',
    };
  });

  return (
    <Table<RouteLegRow>
      className="sr-table-wrapper"
      data={rows}
      keyExtractor={(row, index) => `${row.origen}-${row.destino}-${index}`}
      columns={[
        { key: 'tramo', label: '#' },
        { key: 'origen', label: 'Origen' },
        { key: 'destino', label: 'Destino' },
        { key: 'aeronave', label: 'Aeronave usada' },
        { key: 'distancia', label: 'Distancia' },
        { key: 'costo', label: 'Costo tramo' },
        { key: 'costoAcumulado', label: 'Costo acumulado' },
        { key: 'tiempo', label: 'Tiempo tramo' },
        { key: 'tiempoAcumulado', label: 'Tiempo acumulado' },
        { key: 'subsidiada', label: 'Subsidiada' },
      ]}
    />
  );
}
