export interface DetailedSummary {
  presupuesto_inicial: number;
  total_gastado: number;
  total_ganado: number;
  saldo_final: number;
  tiempo_total_min: number;
  tiempo_restante_min: number;
}

export interface DetailedDestinationRow extends Record<string, unknown> {
  aeropuerto: string;
  nombreAeropuerto: string;
  ciudad: string;
  pais: string;
  tiempoEstadiaMin: number;
  alojamiento: number;
  alimentacion: number;
  costoTotal: number;
}

export interface DetailedFlightRow extends Record<string, unknown> {
  origen: string;
  destino: string;
  aeronave: string;
  distanciaKm: number | null;
  tiempoVueloMin: number;
  costoTramo: number;
}

export interface DetailedActivityRow extends Record<string, unknown> {
  nombre: string;
  tipo: string;
  tiempoMin: number;
  costo: number;
  aeropuerto?: string;
}

export interface DetailedJobRow extends Record<string, unknown> {
  nombre: string;
  horasTrabajadas: number;
  ingresoObtenido: number;
}

export interface DetailedReportData {
  resumen: DetailedSummary;
  destinos: DetailedDestinationRow[];
  vuelos: DetailedFlightRow[];
  actividades: DetailedActivityRow[];
  trabajos: DetailedJobRow[];
}

export type ReportExportFormat = 'pdf' | 'csv';

export interface ReportActionState {
  loadingReport: boolean;
  loadingDetails: boolean;
  loadingStats: boolean;
  exporting: ReportExportFormat | null;
  error: string | null;
}
