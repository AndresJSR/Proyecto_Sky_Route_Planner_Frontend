import { Card, Spinner } from '../../../../components/ui';
import type { TravelStatistics } from '../../../../models/skyroute/report.types';
import { formatMoney, formatNumber } from '../utils/reportFormatters';

interface ReportStatisticsCardProps {
  statistics: TravelStatistics | null;
  loading: boolean;
}

export function ReportStatisticsCard({
  statistics,
  loading,
}: ReportStatisticsCardProps) {
  return (
    <Card title="Estadísticas globales" className="sr-reports-stats-card">
      {loading ? (
        <Spinner size="md" />
      ) : statistics ? (
        <div className="sr-reports-stats-grid">
          <div>
            <span>Viajes completados</span>
            <strong>{formatNumber(statistics.viajes_completados)}</strong>
          </div>

          <div>
            <span>Presupuesto promedio</span>
            <strong>{formatMoney(statistics.presupuesto_promedio)}</strong>
          </div>

          <div>
            <span>Tiempo promedio</span>
            <strong>{formatNumber(statistics.tiempo_promedio_horas)} h</strong>
          </div>

          <div>
            <span>Destino más popular</span>
            <strong>{statistics.destino_mas_popular || '-'}</strong>
          </div>
        </div>
      ) : (
        <p className="text-sm text-body">No hay estadísticas disponibles.</p>
      )}
    </Card>
  );
}

export default ReportStatisticsCard;
