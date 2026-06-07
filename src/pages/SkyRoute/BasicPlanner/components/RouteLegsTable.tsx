import { Table } from '../../../../components/ui';
import type { FlightLeg } from '../../../../models/skyroute/planner.types';
import { formatNumber } from '../utils/plannerFormatters';

interface RouteLegsTableProps {
  legs: FlightLeg[];
}

interface RouteLegRow extends Record<string, unknown> {
  origen: string;
  destino: string;
  aeronave: string;
  distancia: string;
  costo: string;
  tiempo: string;
  subsidiada: string;
}

export function RouteLegsTable({ legs }: RouteLegsTableProps) {
  const rows: RouteLegRow[] = legs.map((leg) => ({
    origen: leg.origen,
    destino: leg.destino,
    aeronave: leg.aeronave,
    distancia: `${formatNumber(leg.distancia_km)} km`,
    costo: `$${formatNumber(leg.costo_usd)} USD`,
    tiempo: `${formatNumber(leg.tiempo_min)} min`,
    subsidiada: leg.subsidiada ? 'Sí' : 'No',
  }));

  return (
    <Table<RouteLegRow>
      className="sr-table-wrapper"
      data={rows}
      keyExtractor={(row, index) => `${row.origen}-${row.destino}-${index}`}
      columns={[
        { key: 'origen', label: 'Origen' },
        { key: 'destino', label: 'Destino' },
        { key: 'aeronave', label: 'Aeronave' },
        { key: 'distancia', label: 'Distancia' },
        { key: 'costo', label: 'Costo' },
        { key: 'tiempo', label: 'Tiempo' },
        { key: 'subsidiada', label: 'Subsidiada' },
      ]}
    />
  );
}
