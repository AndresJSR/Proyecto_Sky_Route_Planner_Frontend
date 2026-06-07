import { Badge, Card } from '../../../../components/ui';
import type { ItineraryAlternative } from '../../../../models/skyroute/planner.types';
import { formatNumber } from '../utils/plannerFormatters';
import { RouteResultCard } from './RouteResultCard';

interface ItineraryCardProps {
  alternative: ItineraryAlternative;
}

export function ItineraryCard({ alternative }: ItineraryCardProps) {
  return (
    <Card className="sr-result-card">
      <div className="sr-result-card__header">
        <div>
          <h3>{alternative.alternativa}</h3>
          <p>Criterio de desempate: {alternative.criterio}</p>
        </div>

        <Badge
          variant="info"
          label={`${alternative.destinos_visitados} destino${
            alternative.destinos_visitados === 1 ? '' : 's'
          }`}
          className="sr-badge"
        />
      </div>

      <div className="sr-metrics-grid">
        <div>
          <span>Costo total</span>
          <strong>${formatNumber(alternative.costo_total)} USD</strong>
        </div>

        <div>
          <span>Tiempo requerido</span>
          <strong>{formatNumber(alternative.tiempo_requerido_min)} min</strong>
        </div>

        <div>
          <span>Ruta</span>
          <strong>{alternative.ruta.ruta.join(' → ')}</strong>
        </div>
      </div>

      <RouteResultCard
        title="Detalle del itinerario"
        result={alternative.ruta}
      />
    </Card>
  );
}
