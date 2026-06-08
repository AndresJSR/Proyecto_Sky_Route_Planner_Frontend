import { Card } from '../../../../components/ui';
import type { DetailedSummary } from '../types/reportView.types';
import { formatMinutes, formatMoney } from '../utils/reportFormatters';

interface ReportSummaryCardsProps {
  summary: DetailedSummary | null;
}

export function ReportSummaryCards({ summary }: ReportSummaryCardsProps) {
  if (!summary) {
    return null;
  }

  return (
    <section className="sr-reports-kpis">
      <Card className="sr-reports-kpi-card">
        <span>Presupuesto inicial</span>
        <strong>{formatMoney(summary.presupuesto_inicial)}</strong>
      </Card>

      <Card className="sr-reports-kpi-card">
        <span>Total gastado</span>
        <strong>{formatMoney(summary.total_gastado)}</strong>
      </Card>

      <Card className="sr-reports-kpi-card">
        <span>Total ganado</span>
        <strong>{formatMoney(summary.total_ganado)}</strong>
      </Card>

      <Card className="sr-reports-kpi-card">
        <span>Saldo final</span>
        <strong>{formatMoney(summary.saldo_final)}</strong>
      </Card>

      <Card className="sr-reports-kpi-card">
        <span>Tiempo total</span>
        <strong>{formatMinutes(summary.tiempo_total_min)}</strong>
      </Card>

      <Card className="sr-reports-kpi-card">
        <span>Tiempo restante</span>
        <strong>{formatMinutes(summary.tiempo_restante_min)}</strong>
      </Card>
    </section>
  );
}

export default ReportSummaryCards;
