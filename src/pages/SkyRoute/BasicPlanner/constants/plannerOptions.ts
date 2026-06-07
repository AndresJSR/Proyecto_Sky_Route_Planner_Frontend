import type {
  PlannerCriterionInput,
  TransportType,
} from '../../../../models/skyroute/planner.types';

export const AIRCRAFT_OPTIONS: TransportType[] = [
  'Avión Comercial',
  'Avión Regional',
  'Hélice',
];

export const CRITERIA_OPTIONS: PlannerCriterionInput[] = [
  'costo',
  'tiempo',
  'distancia',
];

export const CRITERION_LABELS: Record<string, string> = {
  costo: 'Costo',
  tiempo: 'Tiempo',
  distancia: 'Distancia',
  cost: 'Costo',
  time: 'Tiempo',
  distance: 'Distancia',
};
