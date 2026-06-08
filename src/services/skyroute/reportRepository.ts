import type { TravelerState } from '../../models/skyroute/planner.types';
import type {
  GenerateReportRequest,
  TravelReport,
  TravelReportActivity,
  TravelReportFlight,
  TravelReportJob,
  TravelStatistics,
} from '../../models/skyroute/report.types';
import { api } from './api';

function formatMoney(value: number): string {
  return `$${value.toFixed(2)}`;
}

function buildReportFromTravelerState(estadoFinal: TravelerState): TravelReport {
  return {
    resumen: {
      presupuesto_inicial: estadoFinal.presupuesto_inicial ?? 0,
      total_gastado: estadoFinal.gasto_total ?? 0,
      total_ganado: estadoFinal.ganancia_total ?? 0,
      saldo_final: estadoFinal.presupuesto_actual ?? 0,
      tiempo_total_min: estadoFinal.tiempo_total_min ?? 0,
      tiempo_restante_min: estadoFinal.tiempo_restante_min ?? 0,
    },
    destinos_visitados: {
      cantidad: estadoFinal.destinos_visitados?.length ?? 0,
      destinos: estadoFinal.destinos_visitados ?? [],
    },
    vuelos: {
      cantidad: estadoFinal.vuelos?.length ?? 0,
      detalle: estadoFinal.vuelos ?? [],
    },
    actividades: {
      cantidad: estadoFinal.actividades?.length ?? 0,
      detalle: estadoFinal.actividades ?? [],
    },
    trabajos: {
      cantidad: estadoFinal.trabajos?.length ?? 0,
      detalle: estadoFinal.trabajos ?? [],
    },
  };
}

function createCsvBlob(report: TravelReport): Blob {
  const rows: string[] = [];

  const pushCsvRow = (values: Array<string | number>) => {
    const escaped = values.map((value) => {
      const text = String(value ?? '');
      return `"${text.replace(/"/g, '""')}"`;
    });

    rows.push(escaped.join(','));
  };

  rows.push('"SkyRoute Reporte Final"');
  rows.push('');
  rows.push('"Resumen"');
  pushCsvRow(['Presupuesto inicial', report.resumen.presupuesto_inicial]);
  pushCsvRow(['Total gastado', report.resumen.total_gastado]);
  pushCsvRow(['Total ganado', report.resumen.total_ganado]);
  pushCsvRow(['Saldo final', report.resumen.saldo_final]);
  pushCsvRow(['Tiempo total min', report.resumen.tiempo_total_min]);
  pushCsvRow(['Tiempo restante min', report.resumen.tiempo_restante_min]);

  rows.push('');
  rows.push('"Destinos visitados"');
  pushCsvRow(['Cantidad', report.destinos_visitados.cantidad]);
  pushCsvRow(['Destino']);
  report.destinos_visitados.destinos.forEach((destino) => {
    pushCsvRow([destino]);
  });

  rows.push('');
  rows.push('"Tramos"');
  pushCsvRow(['Origen', 'Destino', 'Aeronave', 'Costo', 'Tiempo min']);
  report.vuelos.detalle.forEach((flight: TravelReportFlight) => {
    pushCsvRow([
      flight.origen,
      flight.destino,
      flight.aeronave,
      flight.costo,
      flight.tiempo_min,
    ]);
  });

  rows.push('');
  rows.push('"Actividades"');
  pushCsvRow(['ID', 'Nombre', 'Duracion min', 'Costo']);
  report.actividades.detalle.forEach((activity: TravelReportActivity) => {
    pushCsvRow([
      activity.id,
      activity.nombre,
      activity.duracion_min,
      activity.costo,
    ]);
  });

  rows.push('');
  rows.push('"Trabajos"');
  pushCsvRow(['ID', 'Descripcion', 'Duracion min', 'Pago']);
  report.trabajos.detalle.forEach((job: TravelReportJob) => {
    pushCsvRow([job.id, job.descripcion, job.duracion_min, job.pago]);
  });

  const csvContent = `\uFEFF${rows.join('\n')}`;
  return new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
}

function sanitizePdfText(text: string): string {
  return text.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
}

function createSimplePdfBlob(lines: string[]): Blob {
  const maxLines = 50;
  const visibleLines = lines.slice(0, maxLines);
  const contentLines = visibleLines.map((line) => `(${sanitizePdfText(line)}) Tj T*`);

  const stream = `BT\n/F1 11 Tf\n50 790 Td\n14 TL\n${contentLines.join('\n')}\nET`;
  const streamLength = stream.length;

  const objects = [
    '1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n',
    '2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n',
    '3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>\nendobj\n',
    '4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n',
    `5 0 obj\n<< /Length ${streamLength} >>\nstream\n${stream}\nendstream\nendobj\n`,
  ];

  let pdf = '%PDF-1.4\n';
  const offsets: number[] = [];

  for (const object of objects) {
    offsets.push(pdf.length);
    pdf += object;
  }

  const xrefOffset = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += '0000000000 65535 f \n';

  offsets.forEach((offset) => {
    pdf += `${offset.toString().padStart(10, '0')} 00000 n \n`;
  });

  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  return new Blob([pdf], { type: 'application/pdf' });
}

function createPdfBlobFromReport(report: TravelReport): Blob {
  const lines: string[] = [
    'SkyRoute - Reporte Final',
    '',
    'Resumen',
    `Presupuesto inicial: ${formatMoney(report.resumen.presupuesto_inicial)}`,
    `Total gastado: ${formatMoney(report.resumen.total_gastado)}`,
    `Total ganado: ${formatMoney(report.resumen.total_ganado)}`,
    `Saldo final: ${formatMoney(report.resumen.saldo_final)}`,
    `Tiempo total (min): ${report.resumen.tiempo_total_min}`,
    `Tiempo restante (min): ${report.resumen.tiempo_restante_min}`,
    '',
    `Destinos visitados (${report.destinos_visitados.cantidad})`,
    ...report.destinos_visitados.destinos.map((destino) => `- ${destino}`),
    '',
    `Tramos (${report.vuelos.cantidad})`,
    ...report.vuelos.detalle.map(
      (flight) =>
        `- ${flight.origen} -> ${flight.destino} | ${flight.aeronave} | Costo ${formatMoney(flight.costo)} | ${flight.tiempo_min} min`,
    ),
    '',
    `Actividades (${report.actividades.cantidad})`,
    ...report.actividades.detalle.map(
      (activity) =>
        `- ${activity.nombre} | ${activity.duracion_min} min | Costo ${formatMoney(activity.costo)}`,
    ),
    '',
    `Trabajos (${report.trabajos.cantidad})`,
    ...report.trabajos.detalle.map(
      (job) =>
        `- ${job.descripcion} | ${job.duracion_min} min | Pago ${formatMoney(job.pago)}`,
    ),
  ];

  return createSimplePdfBlob(lines);
}

function isNotFoundError(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'response' in error &&
    typeof (error as { response?: { status?: number } }).response?.status ===
      'number' &&
    (error as { response?: { status?: number } }).response?.status === 404
  );
}

export const reportRepository = {
  generateReport: async (estadoFinal: TravelerState): Promise<TravelReport> => {
    const body: GenerateReportRequest = {
      estado_final: estadoFinal,
    };

    try {
      const response = await api.post<TravelReport>(
        '/reports/generar-reporte',
        body,
      );

      return response.data;
    } catch (error) {
      if (isNotFoundError(error)) {
        return buildReportFromTravelerState(estadoFinal);
      }

      throw error;
    }
  },

  exportReportPDF: async (estadoFinal: TravelerState): Promise<Blob> => {
    const body: GenerateReportRequest = {
      estado_final: estadoFinal,
    };

    try {
      const response = await api.post('/reports/exportar-pdf', body, {
        responseType: 'blob',
      });

      return response.data;
    } catch (error) {
      if (!isNotFoundError(error)) {
        throw error;
      }

      let report: TravelReport;
      try {
        report = await reportRepository.generateReport(estadoFinal);
      } catch {
        report = buildReportFromTravelerState(estadoFinal);
      }
      return createPdfBlobFromReport(report);
    }
  },

  exportReportCSV: async (estadoFinal: TravelerState): Promise<Blob> => {
    const body: GenerateReportRequest = {
      estado_final: estadoFinal,
    };

    try {
      const response = await api.post('/reports/exportar-csv', body, {
        responseType: 'blob',
      });

      return response.data;
    } catch (error) {
      if (!isNotFoundError(error)) {
        throw error;
      }

      let report: TravelReport;
      try {
        report = await reportRepository.generateReport(estadoFinal);
      } catch {
        report = buildReportFromTravelerState(estadoFinal);
      }
      return createCsvBlob(report);
    }
  },

  getStatistics: async (): Promise<TravelStatistics> => {
    const response = await api.get<TravelStatistics>('/reports/estadisticas');

    return response.data;
  },
};
