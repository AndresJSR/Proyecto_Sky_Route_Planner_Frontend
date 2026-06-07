import type { FormEvent } from 'react';
import { Button, Card, Input } from '../../../../components/ui';
import type { ItineraryAlternative } from '../../../../models/skyroute/planner.types';
import { ItineraryCard } from './ItineraryCard';

interface ItinerariesPanelProps {
  presupuesto: number;
  tiempoHoras: number;
  result: ItineraryAlternative[];
  loading: boolean;
  onPresupuestoChange: (value: number) => void;
  onTiempoHorasChange: (value: number) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}

export function ItinerariesPanel({
  presupuesto,
  tiempoHoras,
  result,
  loading,
  onPresupuestoChange,
  onTiempoHorasChange,
  onSubmit,
}: ItinerariesPanelProps) {
  return (
    <Card className="sr-panel">
      <div className="sr-panel__header">
        <div>
          <h2>Itinerarios con restricciones</h2>
          <p>
            Propone alternativas respetando simultáneamente presupuesto y tiempo
            disponible.
          </p>
        </div>
      </div>

      <form onSubmit={onSubmit} className="sr-form-grid">
        <Input
          label="Presupuesto USD"
          type="number"
          min="0"
          value={String(presupuesto)}
          onChange={(event) => onPresupuestoChange(Number(event.target.value))}
        />

        <Input
          label="Tiempo disponible en horas"
          type="number"
          min="0"
          value={String(tiempoHoras)}
          onChange={(event) => onTiempoHorasChange(Number(event.target.value))}
        />

        <Button type="submit" loading={loading} disabled={loading}>
          Proponer itinerarios
        </Button>
      </form>

      {result.length > 0 && (
        <div className="sr-results-stack">
          {result.map((alternative) => (
            <ItineraryCard
              key={`${alternative.criterio}-${alternative.ruta.ruta.join('-')}`}
              alternative={alternative}
            />
          ))}
        </div>
      )}
    </Card>
  );
}
