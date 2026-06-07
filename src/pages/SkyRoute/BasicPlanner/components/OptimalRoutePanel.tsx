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
import type { TransportUsageValidation } from '../utils/transportValidation';
import { RouteResultCard } from './RouteResultCard';

interface OptimalRoutePanelProps {
  criterio: PlannerCriterionInput;
  result: RouteResult | null | undefined;
  loading: boolean;
  transportValidation: TransportUsageValidation;
  exigirTodosLosTransportes: boolean;
  onToggleExigirTodosLosTransportes: () => void;
  onCriterioChange: (value: PlannerCriterionInput) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}

export function OptimalRoutePanel({
  criterio,
  result,
  loading,
  transportValidation,
  exigirTodosLosTransportes,
  onToggleExigirTodosLosTransportes,
  onCriterioChange,
  onSubmit,
}: OptimalRoutePanelProps) {
  return (
    <Card className="sr-panel">
      <div className="sr-panel__header">
        <div>
          <h2>2. Ruta óptima entre origen y destino</h2>
          <p>
            Calcula la mejor ruta usando un único criterio de optimización:
            costo, tiempo o distancia.
          </p>
        </div>
      </div>

      <form onSubmit={onSubmit} className="sr-form-stack">
        <Select
          label="Criterio de optimización"
          value={criterio}
          onChange={(event) =>
            onCriterioChange(event.target.value as PlannerCriterionInput)
          }
          options={CRITERIA_OPTIONS.map((option) => ({
            value: option,
            label: CRITERION_LABELS[option],
          }))}
        />

        <TransportRequirementToggle
          checked={exigirTodosLosTransportes}
          disabled={loading}
          onChange={onToggleExigirTodosLosTransportes}
        />

        <TransportValidationNotice
          validation={transportValidation}
          isRequirementEnabled={exigirTodosLosTransportes}
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

interface TransportRequirementToggleProps {
  checked: boolean;
  disabled: boolean;
  onChange: () => void;
}

function TransportRequirementToggle({
  checked,
  disabled,
  onChange,
}: TransportRequirementToggleProps) {
  return (
    <label className="sr-transport-requirement">
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={onChange}
      />

      <span>
        <strong>Exigir uso de todos los tipos de aeronave seleccionados</strong>
        <small>
          Obliga al backend a buscar una ruta que utilice al menos una vez cada
          tipo de aeronave marcado en los filtros comunes.
        </small>
      </span>
    </label>
  );
}

interface TransportValidationNoticeProps {
  validation: TransportUsageValidation;
  isRequirementEnabled: boolean;
}

function TransportValidationNotice({
  validation,
  isRequirementEnabled,
}: TransportValidationNoticeProps) {
  if (!validation.isRequired) {
    return (
      <div className="sr-transport-validation sr-transport-validation--neutral">
        <strong>Restricción de tipos de aeronave</strong>
        <p>
          No se seleccionaron tipos de aeronave específicos. El sistema podrá
          usar cualquier aeronave disponible en la red.
        </p>
      </div>
    );
  }

  const statusClass = validation.isSatisfied
    ? 'sr-transport-validation--success'
    : 'sr-transport-validation--warning';

  return (
    <div className={`sr-transport-validation ${statusClass}`}>
      <strong>
        {isRequirementEnabled
          ? 'Restricción obligatoria de aeronaves'
          : 'Validación de aeronaves usadas'}
      </strong>

      <p>
        {isRequirementEnabled
          ? 'El backend calculará una ruta que intente usar todos los tipos de aeronave seleccionados.'
          : validation.message}
      </p>

      <div className="sr-transport-validation__grid">
        <div>
          <span>Seleccionadas</span>
          <p>{validation.required.join(', ') || 'Ninguna'}</p>
        </div>

        <div>
          <span>Usadas en la ruta</span>
          <p>{validation.used.join(', ') || 'Pendiente de cálculo'}</p>
        </div>

        <div>
          <span>Faltantes</span>
          <p>{validation.missing.join(', ') || 'Ninguna'}</p>
        </div>
      </div>
    </div>
  );
}
