import { Badge, Card } from '../../../../components/ui';
import type { ItineraryAlternative } from '../../../../models/skyroute/planner.types';
import { formatNumber } from '../utils/plannerFormatters';
import { RouteResultCard } from './RouteResultCard';

interface ItineraryCardProps {
  alternative: ItineraryAlternative;
}

function getAlternativeTitle(alternative: ItineraryAlternative): string {
  if (alternative.criterio === 'presupuesto') {
    return 'Alternativa por presupuesto';
  }

  if (alternative.criterio === 'tiempo') {
    return 'Alternativa por tiempo';
  }

  return alternative.alternativa;
}

function getAlternativeDescription(alternative: ItineraryAlternative): string {
  if (alternative.criterio === 'presupuesto') {
    return 'Busca visitar la mayor cantidad de destinos sin exceder el presupuesto inicial.';
  }

  if (alternative.criterio === 'tiempo') {
    return 'Busca visitar la mayor cantidad de destinos en el menor tiempo posible sin exceder el tiempo disponible.';
  }

  return alternative.alternativa;
}

export function ItineraryCard({ alternative }: ItineraryCardProps) {
  const routeText = alternative.ruta.ruta.join(' → ');

  return (
    <Card className="sr-result-card">
      <div className="sr-result-card__header">
        <div>
          <h3>{getAlternativeTitle(alternative)}</h3>
          <p>{getAlternativeDescription(alternative)}</p>
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
          <span>Costo total del itinerario</span>
          <strong>${formatNumber(alternative.costo_total)} USD</strong>
        </div>

        <div>
          <span>Tiempo total requerido</span>
          <strong>{formatNumber(alternative.tiempo_requerido_min)} min</strong>
        </div>

        <div>
          <span>Secuencia de viaje</span>
          <strong>{routeText}</strong>
        </div>
      </div>

      <RouteResultCard
        title="Detalle de vuelos del itinerario"
        result={alternative.ruta}
      />
    </Card>
  );
}
