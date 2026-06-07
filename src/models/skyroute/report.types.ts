import type { TravelerState } from './planner.types';

export interface TravelReportSummary {
  presupuesto_inicial: number;
  total_gastado: number;
  total_ganado: number;
  saldo_final: number;
  tiempo_total_min: number;
  tiempo_restante_min: number;
}

export interface TravelReportFlight {
  origen: string;
  destino: string;
  aeronave: string;
  costo: number;
  tiempo_min: number;
}

export interface TravelReportActivity {
  id: string;
  nombre: string;
  duracion_min: number;
  costo: number;
}

export interface TravelReportJob {
  id: string;
  descripcion: string;
  duracion_min: number;
  pago: number;
}

export interface TravelReport {
  resumen: TravelReportSummary;

  destinos_visitados: {
    cantidad: number;
    destinos: string[];
  };

  vuelos: {
    cantidad: number;
    detalle: TravelReportFlight[];
  };

  actividades: {
    cantidad: number;
    detalle: TravelReportActivity[];
  };

  trabajos: {
    cantidad: number;
    detalle: TravelReportJob[];
  };
}

export interface TravelStatistics {
  viajes_completados: number;
  presupuesto_promedio: number;
  tiempo_promedio_horas: number;
  destino_mas_popular: string;
}

export interface GenerateReportRequest {
  estado_final: TravelerState;
}
