import type { DetailedReportData } from '../types/reportView.types';
import { formatNullableDistance, formatNumber } from './reportFormatters';

function escapeCsvValue(value: string | number | null | undefined): string {
  const text = String(value ?? '');
  return `"${text.replace(/"/g, '""')}"`;
}

function normalizePdfText(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ñ/g, 'n')
    .replace(/Ñ/g, 'N')
    .replace(/→/g, '->')
    .replace(/\$/g, 'USD')
    .replace(/[^\x20-\x7E]/g, '');
}

function sanitizePdfText(text: string): string {
  return normalizePdfText(text)
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)');
}

function formatPdfMoney(value: number | null | undefined): string {
  return `USD ${formatNumber(value ?? 0)}`;
}

function createPdfBlob(lines: string[]): Blob {
  const visibleLines = lines.slice(0, 70);
  const contentLines = visibleLines.map(
    (line) => `(${sanitizePdfText(line)}) Tj T*`,
  );

  const stream = `BT\n/F1 10 Tf\n42 790 Td\n13 TL\n${contentLines.join(
    '\n',
  )}\nET`;

  const streamLength = new TextEncoder().encode(stream).length;

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
    offsets.push(new TextEncoder().encode(pdf).length);
    pdf += object;
  }

  const xrefOffset = new TextEncoder().encode(pdf).length;

  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += '0000000000 65535 f \n';

  offsets.forEach((offset) => {
    pdf += `${offset.toString().padStart(10, '0')} 00000 n \n`;
  });

  pdf += `trailer\n<< /Size ${
    objects.length + 1
  } /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  return new Blob([pdf], { type: 'application/pdf' });
}

export function createReportCsvBlob(report: DetailedReportData): Blob {
  const lines: string[] = [];

  const pushRow = (values: Array<string | number | null | undefined>) => {
    lines.push(values.map(escapeCsvValue).join(','));
  };

  lines.push('"SkyRoute - Reporte Final"');
  lines.push('');

  lines.push('"Resumen"');
  pushRow(['Presupuesto inicial', report.resumen.presupuesto_inicial]);
  pushRow(['Total gastado', report.resumen.total_gastado]);
  pushRow(['Total ganado', report.resumen.total_ganado]);
  pushRow(['Saldo final', report.resumen.saldo_final]);
  pushRow(['Tiempo total min', report.resumen.tiempo_total_min]);
  pushRow(['Tiempo restante min', report.resumen.tiempo_restante_min]);

  lines.push('');
  lines.push('"Destinos visitados"');
  pushRow([
    'Aeropuerto',
    'Nombre',
    'Ciudad',
    'Pais',
    'Tiempo estadia min',
    'Costo alojamiento',
    'Costo alimentacion',
    'Costo total incurrido',
  ]);

  report.destinos.forEach((destination) => {
    pushRow([
      destination.aeropuerto,
      destination.nombreAeropuerto,
      destination.ciudad,
      destination.pais,
      destination.tiempoEstadiaMin,
      destination.alojamiento,
      destination.alimentacion,
      destination.costoTotal,
    ]);
  });

  lines.push('');
  lines.push('"Tramos volados"');
  pushRow([
    'Origen',
    'Destino',
    'Aeronave',
    'Distancia km',
    'Tiempo vuelo min',
    'Costo tramo',
  ]);

  report.vuelos.forEach((flight) => {
    pushRow([
      flight.origen,
      flight.destino,
      flight.aeronave,
      flight.distanciaKm ?? 'N/D',
      flight.tiempoVueloMin,
      flight.costoTramo,
    ]);
  });

  lines.push('');
  lines.push('"Actividades realizadas"');
  pushRow(['Nombre', 'Tipo', 'Aeropuerto', 'Tiempo min', 'Costo']);

  report.actividades.forEach((activity) => {
    pushRow([
      activity.nombre,
      activity.tipo,
      activity.aeropuerto ?? 'N/D',
      activity.tiempoMin,
      activity.costo,
    ]);
  });

  lines.push('');
  lines.push('"Trabajos realizados"');
  pushRow(['Nombre del trabajo', 'Horas trabajadas', 'Ingreso obtenido']);

  report.trabajos.forEach((job) => {
    pushRow([job.nombre, job.horasTrabajadas, job.ingresoObtenido]);
  });

  return new Blob([`\uFEFF${lines.join('\n')}`], {
    type: 'text/csv;charset=utf-8',
  });
}

export function createReportPdfBlob(report: DetailedReportData): Blob {
  const lines = createReportPdfLines(report);
  return createPdfBlob(lines);
}

export function createReportPdfLines(report: DetailedReportData): string[] {
  return [
    'SkyRoute - Reporte Final',
    '',
    'Resumen',
    `Presupuesto inicial: ${formatPdfMoney(
      report.resumen.presupuesto_inicial,
    )}`,
    `Total gastado: ${formatPdfMoney(report.resumen.total_gastado)}`,
    `Total ganado: ${formatPdfMoney(report.resumen.total_ganado)}`,
    `Saldo final: ${formatPdfMoney(report.resumen.saldo_final)}`,
    `Tiempo total: ${formatNumber(report.resumen.tiempo_total_min)} min`,
    `Tiempo restante: ${formatNumber(report.resumen.tiempo_restante_min)} min`,
    '',
    'Destinos visitados',
    ...report.destinos.map(
      (destination) =>
        `- ${destination.aeropuerto} | ${destination.nombreAeropuerto} | ${
          destination.ciudad
        }, ${destination.pais} | estadia ${formatNumber(
          destination.tiempoEstadiaMin,
        )} min | costo ${formatPdfMoney(destination.costoTotal)}`,
    ),
    '',
    'Tramos volados',
    ...report.vuelos.map(
      (flight) =>
        `- ${flight.origen} -> ${flight.destino} | ${
          flight.aeronave
        } | distancia ${formatNullableDistance(
          flight.distanciaKm,
        )} | tiempo ${formatNumber(
          flight.tiempoVueloMin,
        )} min | costo ${formatPdfMoney(flight.costoTramo)}`,
    ),
    '',
    'Actividades realizadas',
    ...report.actividades.map(
      (activity) =>
        `- ${activity.nombre} | tipo ${activity.tipo} | aeropuerto ${
          activity.aeropuerto ?? 'N/D'
        } | ${formatNumber(activity.tiempoMin)} min | costo ${formatPdfMoney(
          activity.costo,
        )}`,
    ),
    '',
    'Trabajos realizados',
    ...report.trabajos.map(
      (job) =>
        `- ${job.nombre} | ${formatNumber(
          job.horasTrabajadas,
        )} h | ingreso ${formatPdfMoney(job.ingresoObtenido)}`,
    ),
  ];
}

export function downloadBlob(blob: Blob, fileName: string): void {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = fileName;

  document.body.appendChild(link);
  link.click();
  link.remove();

  window.URL.revokeObjectURL(url);
}
