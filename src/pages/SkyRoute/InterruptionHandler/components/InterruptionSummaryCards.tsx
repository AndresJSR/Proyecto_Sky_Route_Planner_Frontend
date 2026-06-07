import { Card, Spinner } from '../../../../components/ui';
import type { InterruptionInfo } from '../../../../models/skyroute/interruption.types';

interface InterruptionSummaryCardsProps {
  info: InterruptionInfo | null;
  loading: boolean;
}

export function InterruptionSummaryCards({
  info,
  loading,
}: InterruptionSummaryCardsProps) {
  if (loading) {
    return (
      <Card className="mb-6">
        <Spinner />
      </Card>
    );
  }

  return (
    <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
      <Card>
        <p className="text-sm font-medium text-body dark:text-bodydark">
          Rutas bloqueadas
        </p>
        <h3 className="mt-2 text-3xl font-bold text-black dark:text-white">
          {info?.rutas_bloqueadas_total ?? 0}
        </h3>
      </Card>

      <Card>
        <p className="text-sm font-medium text-body dark:text-bodydark">
          Aeropuertos afectados
        </p>
        <h3 className="mt-2 text-3xl font-bold text-black dark:text-white">
          {info?.aeropuertos_afectados.length ?? 0}
        </h3>

        {info && info.aeropuertos_afectados.length > 0 && (
          <p className="mt-2 text-sm text-body dark:text-bodydark">
            {info.aeropuertos_afectados.join(', ')}
          </p>
        )}
      </Card>
    </div>
  );
}
