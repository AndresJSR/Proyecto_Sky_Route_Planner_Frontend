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
          <h2>4. Propuesta de itinerarios con restricciones</h2>
          <p>
            Genera alternativas desde el aeropuerto de origen seleccionado,
            usando el presupuesto inicial y el tiempo disponible. A diferencia
            de la ruta óptima, este cálculo busca visitar la mayor cantidad de
            destinos posibles y no llegar a un destino final específico.
          </p>
        </div>
      </div>

      <form onSubmit={onSubmit} className="sr-form-grid">
        <Input
          label="Presupuesto inicial en USD"
          type="number"
          min="0"
          value={String(presupuesto)}
          onChange={(event) => onPresupuestoChange(Number(event.target.value))}
        />

        <Input
          label="Tiempo total disponible en horas"
          type="number"
          min="0"
          value={String(tiempoHoras)}
          onChange={(event) => onTiempoHorasChange(Number(event.target.value))}
        />

        <Button type="submit" loading={loading} disabled={loading}>
          Generar itinerarios
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
