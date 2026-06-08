import type {
  AirportDetail,
  RouteDto,
} from '../../../../models/skyroute/graph.types';
import type { TravelerState } from '../../../../models/skyroute/planner.types';
import type {
  DetailedActivityRow,
  DetailedDestinationRow,
  DetailedFlightRow,
  DetailedJobRow,
  DetailedReportData,
  DetailedSummary,
} from '../types/reportView.types';
import {
  buildRouteKey,
  getArrayValue,
  getNullableNumberValue,
  getNumberValue,
  getRouteDistance,
  getRouteMinimumStay,
  getStringValue,
  getTravelerActivities,
  getTravelerFlights,
  getTravelerJobs,
  getVisitedAirportCodes,
} from './reportAccessors';

function getAirportId(airport: AirportDetail): string {
  return getStringValue(airport, ['id', 'codigo', 'iata']);
}

function buildAirportDetailsMap(
  airportDetailsById: Record<string, AirportDetail>,
): Record<string, AirportDetail> {
  const result: Record<string, AirportDetail> = {};

  Object.entries(airportDetailsById).forEach(([key, value]) => {
    result[key] = value;

    const airportId = getAirportId(value);

    if (airportId) {
      result[airportId] = value;
    }
  });

  return result;
}

function buildRouteLookup(routes: RouteDto[]): Map<string, RouteDto> {
  const routeLookup = new Map<string, RouteDto>();

  routes.forEach((route) => {
    routeLookup.set(buildRouteKey(route.origen, route.destino), route);
  });

  return routeLookup;
}

function getVisitedAirportSequence(state: TravelerState): string[] {
  const flights = getTravelerFlights(state);

  if (flights.length > 0) {
    const firstOrigin = getStringValue(flights[0], ['origen', 'origin']);

    return [
      firstOrigin,
      ...flights.map((flight) =>
        getStringValue(flight, ['destino', 'destination']),
      ),
    ].filter(Boolean);
  }

  const visitedAirports = getVisitedAirportCodes(state);

  if (visitedAirports.length > 0) {
    return visitedAirports;
  }

  return [state.aeropuerto_actual].filter(Boolean);
}

function getDestinationLedgerEntry(
  state: TravelerState,
  airportId: string,
): Record<string, unknown> | null {
  if (!state || typeof state !== 'object') {
    return null;
  }

  const data = state as unknown as Record<string, unknown>;
  const detail = data.detalle_por_destino ?? data.detallePorDestino;

  if (!detail || typeof detail !== 'object') {
    return null;
  }

  const entry = (detail as Record<string, unknown>)[airportId];

  if (!entry || typeof entry !== 'object') {
    return null;
  }

  return entry as Record<string, unknown>;
}

function getAirportLodgingCost(airport: AirportDetail | undefined): number {
  return getNumberValue(airport, ['costoAlojamiento', 'costo_alojamiento']);
}

function getAirportFoodCost(airport: AirportDetail | undefined): number {
  return getNumberValue(airport, ['costoAlimentacion', 'costo_alimentacion']);
}

function buildDestinationRows(
  state: TravelerState,
  airportDetailsById: Record<string, AirportDetail>,
  routeLookup: Map<string, RouteDto>,
): DetailedDestinationRow[] {
  const sequence = getVisitedAirportSequence(state);
  const detailsMap = buildAirportDetailsMap(airportDetailsById);

  return sequence.map((airportId, index) => {
    const airport = detailsMap[airportId];
    const previousAirportId = index > 0 ? sequence[index - 1] : null;

    const incomingRoute = previousAirportId
      ? routeLookup.get(buildRouteKey(previousAirportId, airportId))
      : null;

    const ledgerEntry = getDestinationLedgerEntry(state, airportId);

    const ledgerTime = getNullableNumberValue(ledgerEntry, [
      'tiempo_total_min',
      'tiempoTotalMin',
    ]);

    const ledgerCost = getNullableNumberValue(ledgerEntry, [
      'costo_total',
      'costoTotal',
    ]);

    const fallbackStayMinutes =
      index === 0 ? 0 : getRouteMinimumStay(incomingRoute as RouteDto);
    const stayMinutes = ledgerTime ?? fallbackStayMinutes;

    const lodgingCost =
      stayMinutes > 0
        ? Math.ceil(stayMinutes / 1440) * getAirportLodgingCost(airport)
        : 0;

    const foodCost =
      stayMinutes > 0
        ? Math.ceil(stayMinutes / 480) * getAirportFoodCost(airport)
        : 0;

    const fallbackTotalCost = lodgingCost + foodCost;

    return {
      aeropuerto: airportId,
      nombreAeropuerto: getStringValue(airport, ['nombre']) || airportId,
      ciudad: getStringValue(airport, ['ciudad']) || 'N/D',
      pais: getStringValue(airport, ['pais']) || 'N/D',
      tiempoEstadiaMin: stayMinutes,
      alojamiento: lodgingCost,
      alimentacion: foodCost,
      costoTotal: ledgerCost ?? fallbackTotalCost,
    };
  });
}

function buildFlightRows(
  state: TravelerState,
  routeLookup: Map<string, RouteDto>,
): DetailedFlightRow[] {
  return getTravelerFlights(state).map((flight) => {
    const origen = getStringValue(flight, ['origen', 'origin']);
    const destino = getStringValue(flight, ['destino', 'destination']);
    const route = routeLookup.get(buildRouteKey(origen, destino));

    const distanceFromFlight = getNullableNumberValue(flight, [
      'distancia_km',
      'distanciaKm',
      'distance_km',
    ]);

    return {
      origen,
      destino,
      aeronave: getStringValue(flight, ['aeronave', 'aircraft']),
      distanciaKm:
        distanceFromFlight ?? (route ? getRouteDistance(route) : null),
      tiempoVueloMin: getNumberValue(flight, ['tiempo_min', 'tiempoMin']),
      costoTramo: getNumberValue(flight, ['costo', 'cost']),
    };
  });
}

function buildActivityCatalog(
  airportDetailsById: Record<string, AirportDetail>,
): Array<{
  aeropuerto: string;
  nombre: string;
  tipo: string;
  duracionMin: number;
  costoUSD: number;
}> {
  return Object.values(airportDetailsById).flatMap((detail) => {
    const airportId = getAirportId(detail);
    const activities = getArrayValue(detail, ['actividades', 'activities']);

    return activities.map((activity) => ({
      aeropuerto: airportId,
      nombre: getStringValue(activity, ['nombre', 'name']),
      tipo: getStringValue(activity, ['tipo', 'type']) || 'N/D',
      duracionMin: getNumberValue(activity, ['duracionMin', 'duracion_min']),
      costoUSD: getNumberValue(activity, ['costoUSD', 'costo_usd', 'costo']),
    }));
  });
}

function buildActivityRows(
  state: TravelerState,
  airportDetailsById: Record<string, AirportDetail>,
): DetailedActivityRow[] {
  const activityCatalog = buildActivityCatalog(airportDetailsById);

  return getTravelerActivities(state).map((activity) => {
    const name = getStringValue(activity, ['nombre', 'name']);

    const duration = getNumberValue(activity, [
      'duracion_min',
      'duracionMin',
      'tiempoMin',
    ]);

    const cost = getNumberValue(activity, ['costo', 'costoUSD', 'costo_usd']);

    const matchedActivity =
      activityCatalog.find(
        (entry) =>
          entry.nombre === name &&
          entry.duracionMin === duration &&
          entry.costoUSD === cost,
      ) ?? activityCatalog.find((entry) => entry.nombre === name);

    return {
      nombre: name,
      tipo:
        matchedActivity?.tipo ?? getStringValue(activity, ['tipo']) ?? 'N/D',
      tiempoMin: duration,
      costo: cost,
      aeropuerto:
        getStringValue(activity, ['aeropuerto', 'airport']) ||
        matchedActivity?.aeropuerto,
    };
  });
}

function buildJobRows(state: TravelerState): DetailedJobRow[] {
  return getTravelerJobs(state).map((job) => {
    const hours = getNullableNumberValue(job, ['horas', 'hours']);
    const durationMin =
      getNullableNumberValue(job, ['duracion_min', 'duracionMin']) ??
      (hours ?? 0) * 60;

    const name =
      getStringValue(job, ['descripcion', 'nombre', 'name']) ||
      'Trabajo registrado';

    const payment = getNumberValue(job, ['pago', 'ingreso', 'payment']);

    return {
      nombre: name,
      horasTrabajadas: durationMin / 60,
      ingresoObtenido: payment,
    };
  });
}

function buildSummary(state: TravelerState): DetailedSummary {
  return {
    presupuesto_inicial: state.presupuesto_inicial ?? 0,
    total_gastado: state.gasto_total ?? 0,
    total_ganado: state.ganancia_total ?? 0,
    saldo_final: state.presupuesto_actual ?? 0,
    tiempo_total_min: state.tiempo_total_min ?? 0,
    tiempo_restante_min: state.tiempo_restante_min ?? 0,
  };
}

export function buildDetailedReport(
  travelerState: TravelerState,
  airportDetailsById: Record<string, AirportDetail>,
  routes: RouteDto[],
): DetailedReportData {
  const routeLookup = buildRouteLookup(routes);

  return {
    resumen: buildSummary(travelerState),
    destinos: buildDestinationRows(
      travelerState,
      airportDetailsById,
      routeLookup,
    ),
    vuelos: buildFlightRows(travelerState, routeLookup),
    actividades: buildActivityRows(travelerState, airportDetailsById),
    trabajos: buildJobRows(travelerState),
  };
}
