import type { TravelerState } from '../../../../models/skyroute/planner.types';
import {
  LAST_TRAVELER_STATE_KEY,
  normalizeTravelerState,
} from '../../../../services/skyroute/travelerState';

export function readStoredTravelerState(): TravelerState | null {
  try {
    const rawState = localStorage.getItem(LAST_TRAVELER_STATE_KEY);

    if (!rawState) {
      return null;
    }

    const parsedState = JSON.parse(rawState) as Partial<TravelerState>;
    return normalizeTravelerState(parsedState);
  } catch (error) {
    console.warn('No fue posible leer el estado final guardado.', error);
    return null;
  }
}

export function saveStoredTravelerState(state: TravelerState): void {
  try {
    localStorage.setItem(LAST_TRAVELER_STATE_KEY, JSON.stringify(state));
  } catch (error) {
    console.warn('No fue posible guardar el estado final del viajero.', error);
  }
}

export function clearStoredTravelerState(): void {
  try {
    localStorage.removeItem(LAST_TRAVELER_STATE_KEY);
  } catch (error) {
    console.warn('No fue posible limpiar el estado final del viajero.', error);
  }
}
