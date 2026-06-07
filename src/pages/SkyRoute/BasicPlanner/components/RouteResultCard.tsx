import { Badge, Card } from '../../../../components/ui';
import type { RouteResult } from '../../../../models/skyroute/planner.types';
import { formatNumber } from '../utils/plannerFormatters';
import { RouteLegsTable } from './RouteLegsTable';

interface RouteResultCardProps {
  title: string;
  result: RouteResult | null;
}

export function RouteResultCard({ title, result }: RouteResultCardProps) {
  if (!result) {
    return (
      <Card className="sr-result-card sr-result-card--empty">
        <h3>{title}</h3>
        <p>No se encontró una ruta posible con los filtros seleccionados.</p>
      </Card>
    );
  }

  return (
    <Card className="sr-result-card">
      <div className="sr-result-card__header">
        <div>
          <h3>{title}</h3>
          <p>{result.ruta.join(' → ')}</p>
        </div>

        <Badge
          variant="info"
          label={`${result.cantidad_destinos} destino${
            result.cantidad_destinos === 1 ? '' : 's'
          }`}
          className="sr-badge"
        />
      </div>

      <div className="sr-metrics-grid">
        <div>
          <span>Distancia</span>
          <strong>{formatNumber(result.total_distancia_km)} km</strong>
        </div>

        <div>
          <span>Costo</span>
          <strong>${formatNumber(result.total_costo_usd)} USD</strong>
        </div>

        <div>
          <span>Tiempo</span>
          <strong>{formatNumber(result.total_tiempo_min)} min</strong>
        </div>
      </div>

      <RouteLegsTable legs={result.tramos} />
    </Card>
  );
}
