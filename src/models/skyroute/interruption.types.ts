import type { RouteResult, TravelerState } from './planner.types';

export interface BlockedRoute {
  origen: string;
  destino: string;
  distancia_km: number;
}

export interface RecalculationResult {
  recalculado: boolean;
  mensaje: string;
  origen_actual?: string;
  destino_final?: string;
  nuevo_itinerario?: RouteResult;
}

export interface InterruptionInfo {
  rutas_bloqueadas_total: number;
  aeropuertos_afectados: string[];
}

export interface RecalculateItineraryRequest {
  estado_viajero: TravelerState;
  destino_final: string;
  criterio: 'costo' | 'tiempo' | 'distancia';
  incluir_secundarios: boolean;
  tipos_transporte?: string[];
}
