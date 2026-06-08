import { useCallback, useEffect, useState } from 'react';
import type {
  AirportDetail,
  AirportSummary,
  RouteDto,
} from '../../../../models/skyroute/graph.types';
import type { TravelerState } from '../../../../models/skyroute/planner.types';
import { graphRepository } from '../../../../services/skyroute/graphRepository';
import { plannerRepository } from '../../../../services/skyroute/plannerRepository';
import {
  LAST_TRAVELER_STATE_KEY,
  normalizeTravelerState,
} from '../../../../services/skyroute/travelerState';

type Recommendation = {
  aeropuerto_recomendado: string;
  razon: string;
  beneficios: string[];
};

const AIRCRAFT_RATES: Record<
  string,
  {
    costPerKm: number;
    minutesPerKm: number;
  }
> = {
  'Avión Comercial': {
    costPerKm: 0.18,
    minutesPerKm: 0.7,
  },
  'Avión Regional': {
    costPerKm: 0.25,
    minutesPerKm: 1.1,
  },
  Hélice: {
    costPerKm: 0.12,
    minutesPerKm: 2.5,
  },
};

function getNumberValue(source: unknown, keys: string[]): number {
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

function getStringValue(source: unknown, keys: string[]): string {
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

function getArrayValue(source: unknown, keys: string[]): unknown[] {
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

function getRouteDistance(route: RouteDto): number {
  return getNumberValue(route, ['distanciaKm', 'distancia_km']);
}

function getRouteCostBase(route: RouteDto): number {
  return getNumberValue(route, ['costoBase', 'costo_base']);
}

function isSubsidizedRoute(route: RouteDto): boolean {
  return getRouteCostBase(route) === 0;
}

function isBlockedRoute(route: RouteDto): boolean {
  return Boolean((route as unknown as Record<string, unknown>).bloqueada);
}

function getRouteAircraft(route: RouteDto): string[] {
  const aircraft = route.aeronaves ?? [];

  return aircraft.filter((item): item is string => typeof item === 'string');
}

function getEstimatedCost(route: RouteDto, aircraft: string): number {
  if (isSubsidizedRoute(route)) {
    return 0;
  }

  const rate = AIRCRAFT_RATES[aircraft];

  if (!rate) return 0;

  return getRouteDistance(route) * rate.costPerKm;
}

function getEstimatedTime(route: RouteDto, aircraft: string): number {
  const rate = AIRCRAFT_RATES[aircraft];

  if (!rate) return 0;

  return getRouteDistance(route) * rate.minutesPerKm;
}

function getMinimumEstimatedCost(route: RouteDto): number {
  const aircraftOptions = getRouteAircraft(route);

  if (aircraftOptions.length === 0) {
    return Number.POSITIVE_INFINITY;
  }

  return Math.min(
    ...aircraftOptions.map((aircraft) => getEstimatedCost(route, aircraft)),
  );
}

function getMinimumEstimatedTime(route: RouteDto): number {
  const aircraftOptions = getRouteAircraft(route);

  if (aircraftOptions.length === 0) {
    return Number.POSITIVE_INFINITY;
  }

  return Math.min(
    ...aircraftOptions.map((aircraft) => getEstimatedTime(route, aircraft)),
  );
}

function getVisitedAirports(estado: TravelerState): string[] {
  const values = getArrayValue(estado, [
    'destinos_visitados',
    'destinosVisitados',
    'visited_airports',
  ]);

  return values.filter((item): item is string => typeof item === 'string');
}

function isRouteAvailableForTraveler(
  route: RouteDto,
  estado: TravelerState,
): boolean {
  if (isBlockedRoute(route)) {
    return false;
  }

  if (getRouteAircraft(route).length === 0) {
    return false;
  }

  const visitedAirports = getVisitedAirports(estado);

  if (visitedAirports.includes(route.destino)) {
    return false;
  }

  const minimumCost = getMinimumEstimatedCost(route);
  const minimumTime = getMinimumEstimatedTime(route);

  if (minimumCost > estado.presupuesto_actual) {
    return false;
  }

  if (minimumTime > estado.tiempo_restante_min) {
    return false;
  }

  return true;
}

function getRouteFromFlight(
  flight: unknown,
  allRoutes: RouteDto[],
): RouteDto | null {
  const origen = getStringValue(flight, ['origen', 'origin']);
  const destino = getStringValue(flight, ['destino', 'destination']);

  if (!origen || !destino) {
    return null;
  }

  return (
    allRoutes.find(
      (route) => route.origen === origen && route.destino === destino,
    ) ?? null
  );
}

function buildTraveledRoutesFromState(
  estado: TravelerState,
  allRoutes: RouteDto[],
): RouteDto[] {
  const flights = getArrayValue(estado, ['vuelos', 'flights']);

  return flights
    .map((flight) => getRouteFromFlight(flight, allRoutes))
    .filter((route): route is RouteDto => route !== null);
}

function findRouteByDestination(
  routes: RouteDto[],
  destino: string,
  aeronave?: string,
): RouteDto | null {
  return (
    routes.find((route) => {
      const sameDestination = route.destino === destino;

      if (!sameDestination) {
        return false;
      }

      if (!aeronave) {
        return true;
      }

      return getRouteAircraft(route).includes(aeronave);
    }) ?? null
  );
}

export function useAdvancedTripPage() {
  const [estado, setEstado] = useState<TravelerState | null>(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [neighbors, setNeighbors] = useState<RouteDto[]>([]);
  const [airportDetail, setAirportDetail] = useState<AirportDetail | null>(
    null,
  );
  const [recommendation, setRecommendation] = useState<Recommendation | null>(
    null,
  );

  const [graphAirports, setGraphAirports] = useState<AirportSummary[]>([]);
  const [graphRoutes, setGraphRoutes] = useState<RouteDto[]>([]);
  const [graphLoading, setGraphLoading] = useState(false);
  const [graphError, setGraphError] = useState<string | null>(null);

  // Azul: todas las rutas ya tomadas.
  const [traveledRoutes, setTraveledRoutes] = useState<RouteDto[]>([]);

  // Verde: última ruta recorrida.
  const [lastTraveledRoute, setLastTraveledRoute] = useState<RouteDto | null>(
    null,
  );

  // Se mantiene por compatibilidad con GraphVisualizationPanel actual.
  const [highlightRoute, setHighlightRoute] = useState<RouteDto | null>(null);

  const loadGraphData = useCallback(async () => {
    if (graphAirports.length > 0 && graphRoutes.length > 0) {
      return {
        airports: graphAirports,
        routes: graphRoutes,
      };
    }

    setGraphLoading(true);

    try {
      const [airports, routes] = await Promise.all([
        graphRepository.listAirports(false),
        graphRepository.listRoutes(true),
      ]);

      setGraphAirports(airports);
      setGraphRoutes(routes);
      setGraphError(null);

      return {
        airports,
        routes,
      };
    } catch (err) {
      console.error('loadGraphData error', err);
      setGraphError(err instanceof Error ? err.message : String(err));

      return {
        airports: [],
        routes: [],
      };
    } finally {
      setGraphLoading(false);
    }
  }, [graphAirports, graphRoutes]);

  const startTrip = useCallback(
    async (origen: string, presupuesto: number, tiempoHoras: number) => {
      try {
        setLoading(true);

        await loadGraphData();

        const result = await plannerRepository.initializeTrip(
          origen.trim().toUpperCase(),
          presupuesto,
          tiempoHoras,
        );

        const normalizedState = normalizeTravelerState(result) ?? result;

        setEstado(normalizedState);

        const [routes, detail] = await Promise.all([
          graphRepository.getRoutesFrom(
            normalizedState.aeropuerto_actual,
            true,
          ),
          graphRepository.getAirportInfo(normalizedState.aeropuerto_actual),
        ]);

        setNeighbors(routes);
        setAirportDetail(detail);
        setRecommendation(null);

        setTraveledRoutes([]);
        setLastTraveledRoute(null);
        setHighlightRoute(null);
      } catch (error) {
        console.error('startTrip error', error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [loadGraphData],
  );

  const reloadNeighbors = useCallback(async () => {
    if (!estado) return;

    try {
      const routes = await graphRepository.getRoutesFrom(
        estado.aeropuerto_actual,
        true,
      );

      setNeighbors(routes);
    } catch (err) {
      console.error('reloadNeighbors', err);
    }
  }, [estado]);

  const getRecommendation = useCallback(
    async (criterio: 'costo' | 'tiempo' | 'destinos') => {
      if (!estado) return;

      try {
        setActionLoading(true);

        const routes = await graphRepository.getRoutesFrom(
          estado.aeropuerto_actual,
          true,
        );

        const availableRoutes = routes.filter((route) =>
          isRouteAvailableForTraveler(route, estado),
        );

        const candidateRoutes =
          availableRoutes.length > 0 ? availableRoutes : routes;

        if (candidateRoutes.length === 0) {
          setRecommendation({
            aeropuerto_recomendado: '',
            razon: 'No hay rutas disponibles desde este aeropuerto.',
            beneficios: [],
          });
          return;
        }

        let bestRoute = candidateRoutes[0];
        let reason = '';

        if (criterio === 'costo') {
          bestRoute = candidateRoutes.reduce((currentBest, route) =>
            getMinimumEstimatedCost(route) <
            getMinimumEstimatedCost(currentBest)
              ? route
              : currentBest,
          );

          reason = 'Menor costo estimado por aeronave.';
        } else if (criterio === 'tiempo') {
          bestRoute = candidateRoutes.reduce((currentBest, route) =>
            getMinimumEstimatedTime(route) <
            getMinimumEstimatedTime(currentBest)
              ? route
              : currentBest,
          );

          reason = 'Menor tiempo estimado de vuelo.';
        } else {
          bestRoute = candidateRoutes.reduce((currentBest, route) =>
            getRouteAircraft(route).length >
            getRouteAircraft(currentBest).length
              ? route
              : currentBest,
          );

          reason = 'Mayor cantidad de opciones de aeronave disponibles.';
        }

        setRecommendation({
          aeropuerto_recomendado: bestRoute.destino,
          razon: reason,
          beneficios: [
            `Distancia: ${getRouteDistance(bestRoute)} km`,
            isSubsidizedRoute(bestRoute)
              ? 'Ruta subsidiada: costo $0 USD'
              : `Costo estimado mínimo: ${getMinimumEstimatedCost(
                  bestRoute,
                ).toFixed(2)} USD`,
            `Tiempo mínimo estimado: ${getMinimumEstimatedTime(
              bestRoute,
            ).toFixed(2)} min`,
            `Aeronaves disponibles: ${getRouteAircraft(bestRoute).join(', ')}`,
          ],
        });
      } catch (err) {
        console.error('getRecommendation', err);
      } finally {
        setActionLoading(false);
      }
    },
    [estado],
  );

  const advanceTo = useCallback(
    async (destino: string, aeronave: string) => {
      if (!estado) return;

      const routeToTravel = findRouteByDestination(
        neighbors,
        destino,
        aeronave,
      );

      try {
        setActionLoading(true);

        const updatedState = await plannerRepository.advanceStep(
          estado,
          destino,
          aeronave,
        );

        const normalizedState =
          normalizeTravelerState(updatedState) ?? updatedState;

        setEstado(normalizedState);

        if (routeToTravel) {
          setTraveledRoutes((current) => [...current, routeToTravel]);
          setLastTraveledRoute(routeToTravel);
          setHighlightRoute(routeToTravel);
        }

        const [routes, detail] = await Promise.all([
          graphRepository.getRoutesFrom(
            normalizedState.aeropuerto_actual,
            true,
          ),
          graphRepository.getAirportInfo(normalizedState.aeropuerto_actual),
        ]);

        setNeighbors(routes);
        setAirportDetail(detail);
        setRecommendation(null);
      } catch (err) {
        console.error('advanceTo', err);
        throw err;
      } finally {
        setActionLoading(false);
      }
    },
    [estado, neighbors],
  );

  const registerLocalJob = useCallback(
    async (jobName: string, hours: number) => {
      if (!estado || !airportDetail) return;

      const job = airportDetail.trabajos.find(
        (item) => item.nombre === jobName,
      );

      if (!job) return;

      try {
        const updated = await plannerRepository.acceptJob(
          estado,
          jobName,
          hours,
        );
        setEstado(normalizeTravelerState(updated) ?? updated);
        return;
      } catch (err) {
        console.warn('acceptJob failed, falling back to local update', err);
      }

      const safeHours = Math.min(hours, job.maxHoras);
      const durationMin = Math.round(safeHours * 60);
      const payment = job.tarifaHora * safeHours;

      const updated: TravelerState = {
        ...estado,
        presupuesto_actual: estado.presupuesto_actual + payment,
        tiempo_restante_min: Math.max(
          0,
          estado.tiempo_restante_min - durationMin,
        ),
        trabajos: [
          ...estado.trabajos,
          {
            id: `${job.nombre}-${Date.now()}`,
            descripcion: job.nombre,
            duracion_min: durationMin,
            pago: payment,
          },
        ],
        ganancia_total: (estado.ganancia_total || 0) + payment,
      } as TravelerState;

      setEstado(normalizeTravelerState(updated) ?? updated);
    },
    [estado, airportDetail],
  );

  const performLocalActivity = useCallback(
    async (activityName: string) => {
      if (!estado || !airportDetail) return;

      const activity = airportDetail.actividades.find(
        (item) => item.nombre === activityName,
      );

      if (!activity) return;

      try {
        const updated = await plannerRepository.performActivity(
          estado,
          activityName,
        );
        setEstado(normalizeTravelerState(updated) ?? updated);
        return;
      } catch (err) {
        console.warn(
          'performActivity failed, falling back to local update',
          err,
        );
      }

      const updated: TravelerState = {
        ...estado,
        tiempo_restante_min: Math.max(
          0,
          estado.tiempo_restante_min - activity.duracionMin,
        ),
        actividades: [
          ...estado.actividades,
          {
            id: `${activity.nombre}-${Date.now()}`,
            nombre: activity.nombre,
            duracion_min: activity.duracionMin,
            costo: activity.costoUSD,
          },
        ],
        gasto_total: (estado.gasto_total || 0) + activity.costoUSD,
        presupuesto_actual: estado.presupuesto_actual - activity.costoUSD,
      } as TravelerState;

      setEstado(normalizeTravelerState(updated) ?? updated);
    },
    [estado, airportDetail],
  );

  useEffect(() => {
    let cancelled = false;

    const hydrateTravelerState = async () => {
      try {
        const rawState = localStorage.getItem(LAST_TRAVELER_STATE_KEY);

        if (!rawState) return;

        const parsedState = JSON.parse(rawState) as TravelerState;
        const normalizedState = normalizeTravelerState(parsedState);

        if (!normalizedState) return;
        if (cancelled) return;

        setEstado(normalizedState);

        const graphData = await loadGraphData();

        const recoveredTraveledRoutes = buildTraveledRoutesFromState(
          normalizedState,
          graphData.routes,
        );

        const recoveredLastRoute =
          recoveredTraveledRoutes[recoveredTraveledRoutes.length - 1] ?? null;

        if (cancelled) return;

        setTraveledRoutes(recoveredTraveledRoutes);
        setLastTraveledRoute(recoveredLastRoute);
        setHighlightRoute(recoveredLastRoute);

        const [routes, detail] = await Promise.all([
          graphRepository.getRoutesFrom(
            normalizedState.aeropuerto_actual,
            true,
          ),
          graphRepository.getAirportInfo(normalizedState.aeropuerto_actual),
        ]);

        if (cancelled) return;

        setNeighbors(routes);
        setAirportDetail(detail);
      } catch (error) {
        console.warn('No se pudo restaurar el estado del viaje.', error);
      }
    };

    void hydrateTravelerState();

    return () => {
      cancelled = true;
    };
  }, [loadGraphData]);

  useEffect(() => {
    if (!estado) return;

    try {
      localStorage.setItem(LAST_TRAVELER_STATE_KEY, JSON.stringify(estado));
    } catch (error) {
      console.warn('No se pudo persistir el estado del viaje.', error);
    }
  }, [estado]);

  return {
    estado,
    loading,
    actionLoading,
    neighbors,
    airportDetail,
    recommendation,

    graphAirports,
    graphRoutes,
    graphLoading,
    graphError,

    traveledRoutes,
    lastTraveledRoute,
    highlightRoute,

    startTrip,
    getRecommendation,
    advanceTo,
    registerLocalJob,
    performLocalActivity,
    reloadNeighbors,
  };
}

export default useAdvancedTripPage;
