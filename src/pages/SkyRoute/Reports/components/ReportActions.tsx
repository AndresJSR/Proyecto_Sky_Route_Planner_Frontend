import { Button } from '../../../../components/ui';
import type { ReportExportFormat } from '../types/reportView.types';

interface ReportActionsProps {
  hasTravelerState: boolean;
  loadingDetails: boolean;
  exporting: ReportExportFormat | null;
  onRefreshState: () => void;
  onExportReport: (format: ReportExportFormat) => void;
}

export function ReportActions({
  hasTravelerState,
  loadingDetails,
  exporting,
  onRefreshState,
  onExportReport,
}: ReportActionsProps) {
  return (
    <div className="sr-reports-actions">
      <Button variant="secondary" onClick={onRefreshState}>
        Refrescar estado
      </Button>

      <Button
        variant="success"
        onClick={() => onExportReport('pdf')}
        loading={exporting === 'pdf'}
        disabled={!hasTravelerState || loadingDetails}
      >
        Exportar PDF
      </Button>

      <Button
        variant="success"
        onClick={() => onExportReport('csv')}
        loading={exporting === 'csv'}
        disabled={!hasTravelerState || loadingDetails}
      >
        Exportar CSV
      </Button>
    </div>
  );
}

export default ReportActions;
