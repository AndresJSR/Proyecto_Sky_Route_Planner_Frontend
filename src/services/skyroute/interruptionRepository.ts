import { api } from './api';
import { graphRepository } from './graphRepository';
import type {
  BlockedRoute,
  InterruptionInfo,
  RecalculationResult,
  RecalculateItineraryRequest,
} from '../../models/skyroute/interruption.types';
import type { TravelerState } from '../../models/skyroute/planner.types';

function unwrapApiResponse<T>(response: {
  ok: boolean;
  data: T | null;
  error: { type: string; message: string } | null;
}): T {
  if (!response.ok) {
    throw new Error(
      response.error?.message || 'Error en la petición al backend.',
    );
  }

  if (response.data === null) {
    throw new Error(
      'El backend respondió correctamente, pero no devolvió datos.',
    );
  }

  return response.data;
}

export const interruptionRepository = {
  blockRoute: async (origen: string, destino: string): Promise<void> => {
    const response = await api.post<{
      ok: boolean;
      data: {
        bloqueada: boolean;
        origen: string;
        destino: string;
      } | null;
      error: { type: string; message: string } | null;
    }>('/interruption/block', {
      origen,
      destino,
    });

    unwrapApiResponse(response.data);
  },

  unblockRoute: async (origen: string, destino: string): Promise<void> => {
    const response = await api.post<{
      ok: boolean;
      data: {
        desbloqueada: boolean;
        origen: string;
        destino: string;
      } | null;
      error: { type: string; message: string } | null;
    }>('/interruption/unblock', {
      origen,
      destino,
    });

    unwrapApiResponse(response.data);
  },

  listBlockedRoutes: async (): Promise<BlockedRoute[]> => {
    const routes = await graphRepository.getBlockedRoutes();

    return routes.map((route) => ({
      origen: route.origen,
      destino: route.destino,
      distancia_km: route.distanciaKm ?? route.distanciaKm ?? 0,
    }));
  },

  recalculateItinerary: async (
    estado: TravelerState,
    destinoFinal: string,
    criterio: 'costo' | 'tiempo' | 'distancia' = 'distancia',
    incluirSecundarios: boolean = true,
    tiposTransporte?: string[],
  ): Promise<RecalculationResult> => {
    const body: RecalculateItineraryRequest = {
      estado_viajero: estado,
      destino_final: destinoFinal,
      criterio,
      incluir_secundarios: incluirSecundarios,
      tipos_transporte: tiposTransporte,
    };

    const response = await api.post<{
      ok: boolean;
      data: RecalculationResult | null;
      error: { type: string; message: string } | null;
    }>('/interruption/recalculate', body);

    return unwrapApiResponse(response.data);
  },

  handleTransitInterruption: async (
    estado: TravelerState,
  ): Promise<unknown> => {
    const response = await api.post<{
      ok: boolean;
      data: unknown | null;
      error: { type: string; message: string } | null;
    }>('/interruption/handle-transit', {
      estado,
    });

    return unwrapApiResponse(response.data);
  },

  getInterruptionInfo: async (): Promise<InterruptionInfo> => {
    const blockedRoutes = await interruptionRepository.listBlockedRoutes();

    const affectedAirports = new Set<string>();

    blockedRoutes.forEach((route) => {
      affectedAirports.add(route.origen);
      affectedAirports.add(route.destino);
    });

    return {
      rutas_bloqueadas_total: blockedRoutes.length,
      aeropuertos_afectados: Array.from(affectedAirports),
    };
  },
};
