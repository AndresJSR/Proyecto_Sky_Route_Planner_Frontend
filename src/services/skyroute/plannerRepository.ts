import { api } from './api';
import type { ApiResponse } from '../../models/skyroute/api.types';
import type {
  ItinerariesData,
  ItinerariesRequest,
  ItinerariesResponse,
  ItineraryAlternative,
  OptimalRouteRequest,
  OptimalRouteResponse,
  PlannerCriterionInput,
  RouteResult,
  RoutesByCriteriaData,
  RoutesByCriteriaRequest,
  RoutesByCriteriaResponse,
  StepAdvanceResult,
  TravelerState,
  TransportType,
} from '../../models/skyroute/planner.types';

export type {
  ItineraryAlternative,
  RouteResult,
  StepAdvanceResult,
  TravelerState,
} from '../../models/skyroute/planner.types';

type OptimalRouteRequestWithTransportRequirement = OptimalRouteRequest & {
  exigir_todos_los_transportes?: boolean;
};

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

function mapItinerariesToList(data: ItinerariesData): ItineraryAlternative[] {
  const porPresupuesto =
    data.alternativas.mayor_cantidad_destinos_por_presupuesto;

  const porTiempo = data.alternativas.mayor_cantidad_destinos_por_tiempo;

  return [
    {
      alternativa: 'Mayor cantidad de destinos por presupuesto',
      criterio: 'presupuesto',
      destinos_visitados: porPresupuesto.cantidad_destinos,
      tiempo_requerido_min: porPresupuesto.total_tiempo_min,
      costo_total: porPresupuesto.total_costo_usd,
      ruta: porPresupuesto,
    },
    {
      alternativa: 'Mayor cantidad de destinos por tiempo',
      criterio: 'tiempo',
      destinos_visitados: porTiempo.cantidad_destinos,
      tiempo_requerido_min: porTiempo.total_tiempo_min,
      costo_total: porTiempo.total_costo_usd,
      ruta: porTiempo,
    },
  ];
}

export const plannerRepository = {
  calculateOptimalRoute: async (
    origen: string,
    destino: string,
    criterio: PlannerCriterionInput,
    incluirSecundarios: boolean = true,
    tiposTransporte?: TransportType[] | null,
    exigirTodosLosTransportes: boolean = false,
  ): Promise<RouteResult | null> => {
    const body: OptimalRouteRequestWithTransportRequirement = {
      origen,
      destino,
      criterio,
      incluir_secundarios: incluirSecundarios,
      tipos_transporte: tiposTransporte ?? null,
      exigir_todos_los_transportes: exigirTodosLosTransportes,
    };

    const response = await api.post<OptimalRouteResponse>(
      '/planner/optimal-route',
      body,
    );

    if (!response.data.ok) {
      throw new Error(
        response.data.error?.message || 'No se pudo calcular la ruta óptima.',
      );
    }

    return response.data.data;
  },

  calculateRoutesByCriteria: async (
    origen: string,
    destino: string,
    criterios: PlannerCriterionInput[],
    incluirSecundarios: boolean = true,
    tiposTransporte?: TransportType[] | null,
  ): Promise<RoutesByCriteriaData> => {
    const body: RoutesByCriteriaRequest = {
      origen,
      destino,
      criterios,
      incluir_secundarios: incluirSecundarios,
      tipos_transporte: tiposTransporte ?? null,
    };

    const response = await api.post<RoutesByCriteriaResponse>(
      '/planner/routes-by-criteria',
      body,
    );

    return unwrapApiResponse(response.data);
  },

  proposeItineraries: async (
    origen: string,
    presupuesto: number,
    tiempoDisponibleHoras: number,
    incluirSecundarios: boolean = true,
    tiposTransporte?: TransportType[] | null,
  ): Promise<ItineraryAlternative[]> => {
    const body: ItinerariesRequest = {
      origen,
      presupuesto,
      tiempo_disponible_horas: tiempoDisponibleHoras,
      incluir_secundarios: incluirSecundarios,
      tipos_transporte: tiposTransporte ?? null,
    };

    const response = await api.post<ItinerariesResponse>(
      '/planner/itineraries',
      body,
    );

    const data = unwrapApiResponse(response.data);
    return mapItinerariesToList(data);
  },

  proposeItinerariesRaw: async (
    origen: string,
    presupuesto: number,
    tiempoDisponibleHoras: number,
    incluirSecundarios: boolean = true,
    tiposTransporte?: TransportType[] | null,
  ): Promise<ItinerariesData> => {
    const body: ItinerariesRequest = {
      origen,
      presupuesto,
      tiempo_disponible_horas: tiempoDisponibleHoras,
      incluir_secundarios: incluirSecundarios,
      tipos_transporte: tiposTransporte ?? null,
    };

    const response = await api.post<ItinerariesResponse>(
      '/planner/itineraries',
      body,
    );

    return unwrapApiResponse(response.data);
  },

  initializeTrip: async (
    origen: string,
    presupuesto: number,
    tiempoTotalHoras: number = 120,
  ): Promise<TravelerState> => {
    const response = await api.post<ApiResponse<TravelerState>>(
      '/planner/advanced/start',
      {
        origen,
        presupuesto_inicial: presupuesto,
        tiempo_total_horas: tiempoTotalHoras,
      },
    );

    return unwrapApiResponse(response.data);
  },

  advanceStep: async (
    estado: TravelerState,
    destino: string,
    aeronave: string,
  ): Promise<TravelerState> => {
    const response = await api.post<ApiResponse<TravelerState>>(
      '/planner/advanced/step',
      {
        estado,
        destino,
        aeronave,
      },
    );

    return unwrapApiResponse(response.data);
  },

  getStepRecommendation: async (
    estado: TravelerState,
    criterio: 'costo' | 'tiempo' | 'destinos',
  ): Promise<{
    aeropuerto_recomendado: string;
    razon: string;
    beneficios: string[];
  }> => {
    const response = await api.post<
      ApiResponse<{
        aeropuerto_recomendado: string;
        razon: string;
        beneficios: string[];
      }>
    >('/planner/recomendacion-paso', {
      estado,
      criterio,
    });

    return unwrapApiResponse(response.data);
  },

  acceptJob: async (
    estado: TravelerState,
    trabajo: string,
    horas: number,
  ): Promise<TravelerState> => {
    const response = await api.post<ApiResponse<TravelerState>>(
      '/planner/advanced/job',
      {
        estado,
        trabajo_nombre: trabajo,
        horas,
      },
    );

    return unwrapApiResponse(response.data);
  },

  performActivity: async (
    estado: TravelerState,
    actividad: string,
  ): Promise<TravelerState> => {
    const response = await api.post<ApiResponse<TravelerState>>(
      '/planner/advanced/activity',
      {
        estado,
        actividad_nombre: actividad,
      },
    );

    return unwrapApiResponse(response.data);
  },
};
