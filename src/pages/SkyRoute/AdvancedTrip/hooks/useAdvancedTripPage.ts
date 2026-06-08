import { useCallback, useEffect, useState } from 'react';
import type { AirportDetail, AirportSummary, RouteDto } from '../../../../models/skyroute/graph.types';
import type { TravelerState } from '../../../../models/skyroute/planner.types';
import { graphRepository } from '../../../../services/skyroute/graphRepository';
import { plannerRepository } from '../../../../services/skyroute/plannerRepository';
import {
    LAST_TRAVELER_STATE_KEY,
    normalizeTravelerState,
} from '../../../../services/skyroute/travelerState';

export function useAdvancedTripPage() {
  const [estado, setEstado] = useState<TravelerState | null>(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [neighbors, setNeighbors] = useState<RouteDto[]>([]);
  const [airportDetail, setAirportDetail] = useState<AirportDetail | null>(null);
  const [recommendation, setRecommendation] = useState<null | { aeropuerto_recomendado: string; razon: string; beneficios: string[] }>(null);
  const [graphAirports, setGraphAirports] = useState<AirportSummary[]>([]);
  const [graphRoutes, setGraphRoutes] = useState<RouteDto[]>([]);
  const [graphLoading, setGraphLoading] = useState(false);
  const [graphError, setGraphError] = useState<string | null>(null);
  const [highlightRoute, setHighlightRoute] = useState<RouteDto | null>(null);

  const loadGraphData = useCallback(async () => {
    if (graphAirports.length > 0 && graphRoutes.length > 0) return;

    setGraphLoading(true);
    try {
      const [airports, routes] = await Promise.all([
        graphRepository.listAirports(false),
        graphRepository.listRoutes(true),
      ]);

      setGraphAirports(airports);
      setGraphRoutes(routes);
      setGraphError(null);
    } catch (err) {
      console.error('loadGraphData error', err);
      setGraphError(err instanceof Error ? err.message : String(err));
    } finally {
      setGraphLoading(false);
    }
  }, [graphAirports.length, graphRoutes.length]);

  const startTrip = useCallback(async (origen: string, presupuesto: number, tiempoHoras: number) => {
    try {
      setLoading(true);
      await loadGraphData();

      const result = await plannerRepository.initializeTrip(origen.trim().toUpperCase(), presupuesto, tiempoHoras);
        setEstado(normalizeTravelerState(result) ?? result);

      // load neighbors and airport detail
      const [routes, detail] = await Promise.all([
        graphRepository.getRoutesFrom(result.aeropuerto_actual, true),
        graphRepository.getAirportInfo(result.aeropuerto_actual),
      ]);

      setNeighbors(routes);
      setAirportDetail(detail);
      setRecommendation(null);
      setHighlightRoute(null);
    } catch (error) {
      console.error('startTrip error', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [loadGraphData]);

  const reloadNeighbors = useCallback(async () => {
    if (!estado) return;
    try {
      const routes = await graphRepository.getRoutesFrom(estado.aeropuerto_actual, true);
      setNeighbors(routes);
    } catch (err) {
      console.error('reloadNeighbors', err);
    }
  }, [estado]);

  const getRecommendation = useCallback(async (criterio: 'costo' | 'tiempo' | 'destinos') => {
    if (!estado) return;

    try {
      setActionLoading(true);
      const routes = await graphRepository.getRoutesFrom(
        estado.aeropuerto_actual,
        true,
      );

      if (routes.length === 0) {
        setRecommendation({
          aeropuerto_recomendado: '',
          razon: 'No hay rutas disponibles desde este aeropuerto.',
          beneficios: [],
        });
        return;
      }

      let mejorRuta = routes[0];
      let razon = '';

      if (criterio === 'costo') {
        mejorRuta = routes.reduce((a, b) =>
          a.costoBase < b.costoBase ? a : b,
        );
        razon = 'Costo base más bajo';
      } else if (criterio === 'tiempo') {
        mejorRuta = routes.reduce((a, b) =>
          a.distanciaKm < b.distanciaKm ? a : b,
        );
        razon = 'Distancia más corta';
      } else {
        mejorRuta = routes.reduce((a, b) =>
          a.aeronaves.length > b.aeronaves.length ? a : b,
        );
        razon = 'Mayor número de opciones de aeronaves';
      }

      setRecommendation({
        aeropuerto_recomendado: mejorRuta.destino,
        razon,
        beneficios: [
          `Costo base: $${mejorRuta.costoBase}`,
          `Distancia: ${mejorRuta.distanciaKm} km`,
          `Aeronaves: ${mejorRuta.aeronaves.length}`,
        ],
      });
    } catch (err) {
      console.error('getRecommendation', err);
    } finally {
      setActionLoading(false);
    }
  }, [estado]);

  const advanceTo = useCallback(async (destino: string, aeronave: string) => {
    if (!estado) return;

    try {
      setActionLoading(true);
      const updatedState = await plannerRepository.advanceStep(estado, destino, aeronave);
        setEstado(normalizeTravelerState(updatedState) ?? updatedState);
      setHighlightRoute(neighbors.find((route) => route.destino === destino) ?? null);

      // refresh neighbors and airport detail
      const [routes, detail] = await Promise.all([
        graphRepository.getRoutesFrom(updatedState.aeropuerto_actual, true),
        graphRepository.getAirportInfo(updatedState.aeropuerto_actual),
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
  }, [estado, neighbors]);

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

        await loadGraphData();

        const [routes, detail] = await Promise.all([
            graphRepository.getRoutesFrom(normalizedState.aeropuerto_actual, true),
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

  // Local helpers to record jobs/activities in client-side state (not persisted)
  const registerLocalJob = useCallback(async (jobName: string, hours: number) => {
    if (!estado || !airportDetail) return;

    const job = airportDetail.trabajos.find((j) => j.nombre === jobName);
    if (!job) return;

    // Try to persist on backend first; if it fails, update local state as fallback
    try {
      const updated = await plannerRepository.acceptJob(estado, jobName, hours);
      setEstado(normalizeTravelerState(updated) ?? updated);
      return;
    } catch (err) {
      console.warn('acceptJob failed, falling back to local update', err);
    }

    const pago = job.tarifaHora * Math.min(hours, job.maxHoras);

    const updated: TravelerState = {
      ...estado,
      presupuesto_actual: estado.presupuesto_actual + pago,
      tiempo_restante_min: Math.max(0, estado.tiempo_restante_min - Math.round(hours * 60)),
      trabajos: [
        ...estado.trabajos,
        { id: `${job.nombre}-${Date.now()}`, descripcion: job.nombre, duracion_min: Math.round(hours * 60), pago },
      ],
      ganancia_total: (estado.ganancia_total || 0) + pago,
    } as TravelerState;

      setEstado(normalizeTravelerState(updated) ?? updated);
  }, [estado, airportDetail]);

  const performLocalActivity = useCallback(async (activityName: string) => {
    if (!estado || !airportDetail) return;

    const activity = airportDetail.actividades.find((a) => a.nombre === activityName);
    if (!activity) return;

    try {
      const updated = await plannerRepository.performActivity(estado, activityName);
      setEstado(updated);
      return;
    } catch (err) {
      console.warn('performActivity failed, falling back to local update', err);
    }

    const updated: TravelerState = {
      ...estado,
      tiempo_restante_min: Math.max(0, estado.tiempo_restante_min - activity.duracionMin),
      actividades: [
        ...estado.actividades,
        { id: `${activity.nombre}-${Date.now()}`, nombre: activity.nombre, duracion_min: activity.duracionMin, costo: activity.costoUSD },
      ],
      gasto_total: (estado.gasto_total || 0) + activity.costoUSD,
      presupuesto_actual: estado.presupuesto_actual - activity.costoUSD,
    } as TravelerState;

    setEstado(updated);
  }, [estado, airportDetail]);

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
