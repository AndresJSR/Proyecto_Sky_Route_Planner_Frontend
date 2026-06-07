import { Badge, Card, Spinner } from '../../../../components/ui';
import type {
  AirportSummary,
  NetworkSummary,
  RouteDto,
} from '../../../../models/skyroute/graph.types';
import { formatNumber, getNumberValue } from '../../BasicPlanner/utils/plannerFormatters';

interface GraphSummaryPanelProps {
  summary: NetworkSummary | null;
  airports: AirportSummary[];
  routes: RouteDto[];
  loading: boolean;
  error: string | null;
}

function getRouteValue(route: RouteDto, keys: string[]): number {
  return getNumberValue(route, keys);
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
          <p>Información de la red aérea cargada desde los endpoints de Graph.</p>
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
            {(getNumberValue(summary, ['total_aeropuertos', 'total_airports', 'airports']) || 0) - 
             (getNumberValue(summary, ['total_hubs', 'hubs']) || 0)}
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
              {routes.slice(0, 6).map((route, index) => (
                <div key={`${route.origen}-${route.destino}-${index}`}>
                  <strong>
                    {route.origen} → {route.destino}
                  </strong>

                  <span>
                    {formatNumber(
                      getRouteValue(route, ['distanciaKm', 'distancia_km']),
                    )}{' '}
                    km · costo ${
                      formatNumber(
                        getRouteValue(route, ['costoBase', 'costo_base']),
                      )
                    }
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
