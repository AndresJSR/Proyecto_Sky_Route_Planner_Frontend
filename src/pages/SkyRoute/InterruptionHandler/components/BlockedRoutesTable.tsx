import { Button, Card, Table } from '../../../../components/ui';
import type { BlockedRoute } from '../../../../models/skyroute/interruption.types';

interface BlockedRoutesTableProps {
  routes: BlockedRoute[];
  loading: boolean;
  actionLoading: boolean;
  onUnblockRoute: (origen: string, destino: string) => void;
}

interface BlockedRouteRow extends Record<string, unknown> {
  origen: string;
  destino: string;
  distancia: string;
  acciones: string;
}

export function BlockedRoutesTable({
  routes,
  loading,
  actionLoading,
  onUnblockRoute,
}: BlockedRoutesTableProps) {
  const rows: BlockedRouteRow[] = routes.map((route) => ({
    origen: route.origen,
    destino: route.destino,
    distancia: `${route.distancia_km} km`,
    acciones: 'acciones',
  }));

  return (
    <Card>
      <div className="mb-5">
        <h2 className="text-xl font-bold text-black dark:text-white">
          Rutas bloqueadas
        </h2>
        <p className="mt-1 text-sm text-body dark:text-bodydark">
          Listado de rutas actualmente afectadas por interrupciones.
        </p>
      </div>

      <Table<BlockedRouteRow>
        data={rows}
        loading={loading}
        emptyMessage="No hay rutas bloqueadas."
        keyExtractor={(row, index) => `${row.origen}-${row.destino}-${index}`}
        columns={[
          { key: 'origen', label: 'Origen' },
          { key: 'destino', label: 'Destino' },
          { key: 'distancia', label: 'Distancia' },
          {
            key: 'acciones',
            label: 'Acciones',
            render: (_, row) => (
              <Button
                type="button"
                variant="secondary"
                size="sm"
                loading={actionLoading}
                disabled={actionLoading}
                onClick={() => onUnblockRoute(row.origen, row.destino)}
              >
                Desbloquear
              </Button>
            ),
          },
        ]}
      />
    </Card>
  );
}
