import { Badge, Card, Spinner } from '../../../../components/ui';
import type {
  AirportSummary,
  NetworkSummary,
  RouteDto,
} from '../../../../models/skyroute/graph.types';

interface GraphSummaryPanelProps {
  summary: NetworkSummary | null;
  airports: AirportSummary[];
  routes: RouteDto[];
  loading: boolean;
  error: string | null;
}

const AIRCRAFT_OPTIONS = ['Avión Comercial', 'Avión Regional', 'Hélice'];

const AIRCRAFT_RATES: Record<
  string,
  {
    costPerKm: number;
    minutesPerKm: number;
  }
> = {
  'Avión Comercial': {
    costPerKm: 0.18,
    minutesPerKm: 0.7,
  },
  'Avión Regional': {
    costPerKm: 0.25,
    minutesPerKm: 1.1,
  },
  Hélice: {
    costPerKm: 0.12,
    minutesPerKm: 2.5,
  },
};

function getNumberValue(source: unknown, keys: string[]): number {
  if (!source || typeof source !== 'object') return 0;

  const data = source as Record<string, unknown>;

  for (const key of keys) {
    const value = data[key];

    if (typeof value === 'number') {
      return value;
    }
  }

  return 0;
}

function formatNumber(value: number, decimals = 2): string {
  return new Intl.NumberFormat('es-CO', {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  }).format(value ?? 0);
}

function getRouteValue(route: RouteDto, keys: string[]): number {
  return getNumberValue(route, keys);
}

function getRouteAircraft(route: RouteDto): string[] {
  const data = route as unknown as Record<string, unknown>;
  const aircraft = data.aeronaves;

  if (Array.isArray(aircraft) && aircraft.length > 0) {
    return aircraft.filter((item): item is string => typeof item === 'string');
  }

  return AIRCRAFT_OPTIONS;
}

function isSubsidizedRoute(route: RouteDto): boolean {
  const costBase = getRouteValue(route, ['costoBase', 'costo_base']);
  return costBase === 0;
}

function getMinimumEstimatedCost(route: RouteDto): number {
  if (isSubsidizedRoute(route)) {
    return 0;
  }

  const distance = getRouteValue(route, ['distanciaKm', 'distancia_km']);
  const aircraftOptions = getRouteAircraft(route);

  const costs = aircraftOptions
    .map((aircraft) => AIRCRAFT_RATES[aircraft])
    .filter(Boolean)
    .map((rate) => distance * rate.costPerKm);

  return costs.length > 0 ? Math.min(...costs) : 0;
}

function getMinimumEstimatedTime(route: RouteDto): number {
  const distance = getRouteValue(route, ['distanciaKm', 'distancia_km']);
  const aircraftOptions = getRouteAircraft(route);

  const times = aircraftOptions
    .map((aircraft) => AIRCRAFT_RATES[aircraft])
    .filter(Boolean)
    .map((rate) => distance * rate.minutesPerKm);

  return times.length > 0 ? Math.min(...times) : 0;
}

export function GraphSummaryPanel({
  summary,
  airports,
  routes,
  loading,
  error,
}: GraphSummaryPanelProps) {
  const airportCodes = airports.map((airport) => airport.id);

  return (
    <Card className="sr-panel sr-panel--graph">
      <div className="sr-panel__header">
        <div>
          <h2>Resumen del grafo</h2>
          <p>
            Información de la red aérea cargada desde los endpoints de Graph.
          </p>
        </div>

        {loading && <Spinner size="sm" />}
      </div>

      {error && <div className="sr-alert sr-alert--error">{error}</div>}

      <div className="sr-summary-grid">
        <div>
          <span>Aeropuertos</span>
          <strong>
            {getNumberValue(summary, [
              'total_aeropuertos',
              'total_airports',
              'airports',
            ])}
          </strong>
        </div>

        <div>
          <span>Rutas</span>
          <strong>
            {getNumberValue(summary, ['total_rutas', 'total_routes', 'routes'])}
          </strong>
        </div>

        <div>
          <span>Hubs</span>
          <strong>{getNumberValue(summary, ['total_hubs', 'hubs'])}</strong>
        </div>

        <div>
          <span>Secundarios</span>
          <strong>
            {(getNumberValue(summary, [
              'total_aeropuertos',
              'total_airports',
              'airports',
            ]) || 0) - (getNumberValue(summary, ['total_hubs', 'hubs']) || 0)}
          </strong>
        </div>
      </div>

      <div className="sr-mini-grid">
        <div className="sr-mini-card">
          <h3>Aeropuertos disponibles</h3>

          {airportCodes.length === 0 ? (
            <p>No hay aeropuertos disponibles.</p>
          ) : (
            <div className="sr-chip-list">
              {airportCodes.slice(0, 20).map((code) => (
                <Badge
                  key={code}
                  label={code}
                  variant="info"
                  size="sm"
                  className="sr-chip"
                />
              ))}

              {airportCodes.length > 20 && (
                <Badge
                  label={`+${airportCodes.length - 20} más`}
                  variant="info"
                  size="sm"
                  className="sr-chip"
                />
              )}
            </div>
          )}
        </div>

        <div className="sr-mini-card">
          <h3>Primeras rutas</h3>

          {routes.length === 0 ? (
            <p>No hay rutas disponibles.</p>
          ) : (
            <div className="sr-routes-list">
              {routes.slice(0, 6).map((route, index) => {
                const distance = getRouteValue(route, [
                  'distanciaKm',
                  'distancia_km',
                ]);

                const stay = getRouteValue(route, [
                  'estanciaMinima',
                  'estancia_minima',
                  'estancia_minima_min',
                ]);

                const aircraft = getRouteAircraft(route);
                const estimatedCost = getMinimumEstimatedCost(route);
                const estimatedTime = getMinimumEstimatedTime(route);
                const subsidized = isSubsidizedRoute(route);

                return (
                  <div key={`${route.origen}-${route.destino}-${index}`}>
                    <strong>
                      {route.origen} → {route.destino}
                    </strong>

                    <span>
                      {formatNumber(distance, 0)} km · estancia{' '}
                      {formatNumber(stay, 0)} min
                    </span>

                    <span>Aeronaves: {aircraft.join(', ')}</span>

                    <span>
                      {subsidized
                        ? 'Ruta subsidiada · costo estimado $0 USD'
                        : `Costo estimado desde $${formatNumber(
                            estimatedCost,
                          )} USD`}{' '}
                      · tiempo mínimo {formatNumber(estimatedTime, 0)} min
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
