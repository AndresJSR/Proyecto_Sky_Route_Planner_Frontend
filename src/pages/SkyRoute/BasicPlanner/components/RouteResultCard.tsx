import { Badge, Card } from '../../../../components/ui';
import type {
  RouteResult,
  TransportType,
} from '../../../../models/skyroute/planner.types';
import { formatNumber } from '../utils/plannerFormatters';
import { RouteLegsTable } from './RouteLegsTable';

interface RouteResultCardProps {
  title: string;
  result: RouteResult | null;
}

const TRANSPORT_ORDER: TransportType[] = [
  'Avión Comercial',
  'Avión Regional',
  'Hélice',
];

const TRANSPORT_KEYS = [
  'aeronave',
  'aeronave_usada',
  'tipo_aeronave',
  'tipoAeronave',
  'tipo_transporte',
  'tipoTransporte',
  'transporte',
  'aircraft',
  'aircraft_type',
  'aircraftType',
];

function normalizeText(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function normalizeTransport(value: unknown): TransportType | null {
  if (typeof value !== 'string') return null;

  const normalized = normalizeText(value);

  if (normalized.includes('comercial')) {
    return 'Avión Comercial';
  }

  if (normalized.includes('regional')) {
    return 'Avión Regional';
  }

  if (normalized.includes('helice')) {
    return 'Hélice';
  }

  return null;
}

function getLegTransport(leg: unknown): TransportType | null {
  if (!leg || typeof leg !== 'object') return null;

  const data = leg as Record<string, unknown>;

  for (const key of TRANSPORT_KEYS) {
    const transport = normalizeTransport(data[key]);

    if (transport) {
      return transport;
    }
  }

  return null;
}

function getUsedTransports(result: RouteResult): TransportType[] {
  const used = result.tramos
    .map(getLegTransport)
    .filter((transport): transport is TransportType => Boolean(transport));

  return TRANSPORT_ORDER.filter((transport) => used.includes(transport));
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

  const usedTransports = getUsedTransports(result);

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

      <div className="sr-route-transport-summary">
        <div>
          <span>Transportes usados en la ruta</span>

          {usedTransports.length > 0 ? (
            <div className="sr-route-transport-summary__chips">
              {usedTransports.map((transport) => (
                <span key={transport}>{transport}</span>
              ))}
            </div>
          ) : (
            <p>No se identificaron transportes en los tramos.</p>
          )}
        </div>
      </div>

      <RouteLegsTable legs={result.tramos} />
    </Card>
  );
}
