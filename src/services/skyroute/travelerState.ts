import type { TravelerState } from '../../models/skyroute/planner.types';

export const LAST_TRAVELER_STATE_KEY = 'skyroute:last-traveler-state';

export function normalizeTravelerState(
	state: Partial<TravelerState> | null | undefined,
): TravelerState | null {
	if (!state || typeof state.aeropuerto_actual !== 'string' || !state.aeropuerto_actual) {
		return null;
	}

	return {
		aeropuerto_actual: state.aeropuerto_actual,
		presupuesto_inicial: state.presupuesto_inicial ?? 0,
		presupuesto_actual: state.presupuesto_actual ?? 0,
		tiempo_total_min: state.tiempo_total_min ?? 0,
		tiempo_restante_min: state.tiempo_restante_min ?? 0,
		minutos_desde_comida: state.minutos_desde_comida ?? 0,
		minutos_desde_alojamiento: state.minutos_desde_alojamiento ?? 0,
		destinos_visitados: Array.isArray(state.destinos_visitados)
			? state.destinos_visitados
			: [],
		vuelos: Array.isArray(state.vuelos) ? state.vuelos : [],
		actividades: Array.isArray(state.actividades) ? state.actividades : [],
		trabajos: Array.isArray(state.trabajos) ? state.trabajos : [],
		gasto_total: state.gasto_total ?? 0,
		ganancia_total: state.ganancia_total ?? 0,
	};
}