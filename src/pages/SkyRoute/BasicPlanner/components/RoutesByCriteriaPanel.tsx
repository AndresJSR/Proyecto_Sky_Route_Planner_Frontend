import type { FormEvent } from 'react';
import { Button, Card } from '../../../../components/ui';
import type {
  PlannerCriterionInput,
  RoutesByCriteriaData,
} from '../../../../models/skyroute/planner.types';
import {
  CRITERIA_OPTIONS,
  CRITERION_LABELS,
} from '../constants/plannerOptions';
import { RouteResultCard } from './RouteResultCard';

interface RoutesByCriteriaPanelProps {
  selectedCriteria: PlannerCriterionInput[];
  result: RoutesByCriteriaData | null;
  loading: boolean;
  onToggleCriterion: (criterion: PlannerCriterionInput) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}

export function RoutesByCriteriaPanel({
  selectedCriteria,
  result,
  loading,
  onToggleCriterion,
  onSubmit,
}: RoutesByCriteriaPanelProps) {
  return (
    <Card className="sr-panel">
      <div className="sr-panel__header">
        <div>
          <h2>Rutas por criterios</h2>
          <p>Calcula varias rutas en una sola consulta.</p>
        </div>
      </div>

      <form onSubmit={onSubmit} className="sr-form-stack">
        <div className="sr-filter-row sr-filter-row--compact">
          {CRITERIA_OPTIONS.map((option) => (
            <label className="sr-check-card" key={option}>
              <input
                type="checkbox"
                checked={selectedCriteria.includes(option)}
                onChange={() => onToggleCriterion(option)}
              />
              {CRITERION_LABELS[option]}
            </label>
          ))}
        </div>

        <Button type="submit" loading={loading} disabled={loading}>
          Calcular por criterios
        </Button>
      </form>

      {result && (
        <div className="sr-results-stack">
          {Object.entries(result.resultados).map(([key, value]) => (
            <RouteResultCard
              key={key}
              title={`Resultado por ${CRITERION_LABELS[key] ?? key}`}
              result={value}
            />
          ))}
        </div>
      )}
    </Card>
  );
}
