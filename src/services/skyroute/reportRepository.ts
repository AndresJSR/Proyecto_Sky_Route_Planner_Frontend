import { api } from './api';
import type {
  GenerateReportRequest,
  TravelReport,
  TravelStatistics,
} from '../../models/skyroute/report.types';
import type { TravelerState } from '../../models/skyroute/planner.types';

export const reportRepository = {
  generateReport: async (estadoFinal: TravelerState): Promise<TravelReport> => {
    const body: GenerateReportRequest = {
      estado_final: estadoFinal,
    };

    const response = await api.post<TravelReport>(
      '/reports/generar-reporte',
      body,
    );

    return response.data;
  },

  exportReportPDF: async (estadoFinal: TravelerState): Promise<Blob> => {
    const body: GenerateReportRequest = {
      estado_final: estadoFinal,
    };

    const response = await api.post('/reports/exportar-pdf', body, {
      responseType: 'blob',
    });

    return response.data;
  },

  exportReportCSV: async (estadoFinal: TravelerState): Promise<Blob> => {
    const body: GenerateReportRequest = {
      estado_final: estadoFinal,
    };

    const response = await api.post('/reports/exportar-csv', body, {
      responseType: 'blob',
    });

    return response.data;
  },

  getStatistics: async (): Promise<TravelStatistics> => {
    const response = await api.get<TravelStatistics>('/reports/estadisticas');

    return response.data;
  },
};
