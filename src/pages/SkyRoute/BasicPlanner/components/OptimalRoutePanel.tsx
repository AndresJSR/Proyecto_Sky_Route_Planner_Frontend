import type { FormEvent } from 'react';
import { Button, Card, Select } from '../../../../components/ui';
import type {
  PlannerCriterionInput,
  RouteResult,
} from '../../../../models/skyroute/planner.types';
import {
  CRITERIA_OPTIONS,
  CRITERION_LABELS,
} from '../constants/plannerOptions';
import { RouteResultCard } from './RouteResultCard';

interface OptimalRoutePanelProps {
  criterio: PlannerCriterionInput;
  result: RouteResult | null | undefined;
  loading: boolean;
  onCriterioChange: (value: PlannerCriterionInput) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}

export function OptimalRoutePanel({
  criterio,
  result,
  loading,
  onCriterioChange,
  onSubmit,
}: OptimalRoutePanelProps) {
  return (
    <Card className="sr-panel">
      <div className="sr-panel__header">
        <div>
          <h2>Ruta óptima</h2>
          <p>Calcula una ruta por costo, tiempo o distancia.</p>
        </div>
      </div>

      <form onSubmit={onSubmit} className="sr-form-stack">
        <Select
          label="Criterio"
          value={criterio}
          onChange={(event) =>
            onCriterioChange(event.target.value as PlannerCriterionInput)
          }
          options={CRITERIA_OPTIONS.map((option) => ({
            value: option,
            label: CRITERION_LABELS[option],
          }))}
        />

        <Button type="submit" loading={loading} disabled={loading}>
          Calcular ruta óptima
        </Button>
      </form>

      {result !== undefined && (
        <RouteResultCard title="Resultado de ruta óptima" result={result} />
      )}
    </Card>
  );
}
