import type { ApiResponse } from '../skyroute/api.types';

export type PlannerCriterionInput = 'costo' | 'tiempo' | 'distancia';

export type PlannerCriterion = 'cost' | 'time' | 'distance';

export type TransportType = string;

export interface FlightLeg {
  origen: string;
  destino: string;
  aeronave: string;
  distancia_km: number;
  costo_usd: number;
  tiempo_min: number;
  estancia_minima_min: number;
  subsidiada: boolean;
}

export interface RouteResult {
  ruta: string[];
  tramos: FlightLeg[];
  cantidad_destinos: number;
  total_distancia_km: number;
  total_costo_usd: number;
  total_tiempo_min: number;
}

export interface OptimalRouteRequest {
  origen: string;
  destino: string;
  criterio: PlannerCriterionInput;
  incluir_secundarios: boolean;
  tipos_transporte: TransportType[] | null;
}

export type OptimalRouteResponse = ApiResponse<RouteResult | null>;

export interface RoutesByCriteriaRequest {
  origen: string;
  destino: string;
  criterios: PlannerCriterionInput[];
  incluir_secundarios: boolean;
  tipos_transporte: TransportType[] | null;
}

export interface RoutesByCriteriaData {
  origen: string;
  destino: string;
  criterios: PlannerCriterion[];
  resultados: Partial<Record<PlannerCriterion, RouteResult | null>>;
}

export type RoutesByCriteriaResponse = ApiResponse<RoutesByCriteriaData>;

export interface ItinerariesRequest {
  origen: string;
  presupuesto: number;
  tiempo_disponible_horas: number;
  incluir_secundarios: boolean;
  tipos_transporte: TransportType[] | null;
}

export interface ItineraryRestrictions {
  presupuesto_usd: number;
  tiempo_disponible_horas: number;
  tiempo_disponible_min: number;
  incluir_secundarios: boolean;
  tipos_transporte: TransportType[] | 'todos';
}

export interface ItineraryAlternatives {
  mayor_cantidad_destinos_por_presupuesto: RouteResult;
  mayor_cantidad_destinos_por_tiempo: RouteResult;
}

export interface ItinerariesData {
  origen: string;
  restricciones: ItineraryRestrictions;
  alternativas: ItineraryAlternatives;
}

export type ItinerariesResponse = ApiResponse<ItinerariesData>;

export interface ItineraryAlternative {
  alternativa: string;
  criterio: 'presupuesto' | 'tiempo';
  destinos_visitados: number;
  tiempo_requerido_min: number;
  costo_total: number;
  ruta: RouteResult;
}

export interface TravelerState {
  aeropuerto_actual: string;
  presupuesto_inicial: number;
  presupuesto_actual: number;
  tiempo_total_min: number;
  tiempo_restante_min: number;
  minutos_desde_comida: number;
  minutos_desde_alojamiento: number;
  destinos_visitados: string[];

  vuelos: Array<{
    origen: string;
    destino: string;
    aeronave: string;
    costo: number;
    tiempo_min: number;
  }>;

  actividades: Array<{
    id: string;
    nombre: string;
    duracion_min: number;
    costo: number;
  }>;

  trabajos: Array<{
    id: string;
    descripcion: string;
    duracion_min: number;
    pago: number;
  }>;

  gasto_total: number;
  ganancia_total: number;
}

export interface StepAdvanceResult {
  estado_actualizado: TravelerState;

  vuelo: {
    origen: string;
    destino: string;
    aeronave: string;
    costo: number;
    tiempo_min: number;
  };

  mensaje: string;
}