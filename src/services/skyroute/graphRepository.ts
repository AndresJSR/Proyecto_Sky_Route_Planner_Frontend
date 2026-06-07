import { api } from './api';
import type { ApiResponse } from '../../models/skyroute/api.types';
import type {
  AirportDetail,
  AirportSummary,
  NetworkSummary,
  RouteDto,
} from '../../models/skyroute/graph.types';

function unwrapApiResponse<T>(response: ApiResponse<T>): T {
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

export const graphRepository = {
  getNetworkSummary: async (): Promise<NetworkSummary> => {
    const response = await api.get<ApiResponse<NetworkSummary>>(
      '/graph/summary',
    );

    return unwrapApiResponse(response.data);
  },

  listAirports: async (
    hubsOnly: boolean = false,
  ): Promise<AirportSummary[]> => {
    const response = await api.get<ApiResponse<AirportSummary[]>>(
      '/graph/airports',
      {
        params: { hubs_only: hubsOnly },
      },
    );

    return unwrapApiResponse(response.data);
  },

  getAirportInfo: async (airportId: string): Promise<AirportDetail> => {
    const response = await api.get<ApiResponse<AirportDetail>>(
      `/graph/airports/${airportId}`,
    );

    return unwrapApiResponse(response.data);
  },

  listRoutes: async (includeBlocked: boolean = false): Promise<RouteDto[]> => {
    const response = await api.get<ApiResponse<RouteDto[]>>('/graph/routes', {
      params: { include_blocked: includeBlocked },
    });

    return unwrapApiResponse(response.data);
  },

  getRoutesFrom: async (
    airportId: string,
    includeBlocked: boolean = false,
  ): Promise<RouteDto[]> => {
    const response = await api.get<ApiResponse<RouteDto[]>>(
      `/graph/airports/${airportId}/neighbors`,
      {
        params: { include_blocked: includeBlocked },
      },
    );

    return unwrapApiResponse(response.data);
  },

  getBlockedRoutes: async (): Promise<RouteDto[]> => {
    const response = await api.get<ApiResponse<RouteDto[]>>(
      '/graph/blocked-routes',
    );

    return unwrapApiResponse(response.data);
  },

  airportExists: async (airportId: string): Promise<boolean> => {
    const response = await api.get<ApiResponse<{ exists: boolean }>>(
      `/graph/airports/${airportId}/exists`,
    );

    const data = unwrapApiResponse(response.data);

    return data.exists;
  },
};
