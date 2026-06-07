import { Card, Spinner } from '../../../../components/ui';
import type { AirportDetail } from '../../../../models/skyroute/graph.types';

interface AirportDetailsPanelProps {
  airport: AirportDetail | null;
  loading?: boolean;
  error?: string | null;
}

function formatMoney(value: number | undefined | null): string {
  if (value === undefined || value === null) return 'N/A';

  return `$${value}`;
}

function formatNumber(value: number | undefined | null): string {
  if (value === undefined || value === null) return 'N/A';

  return String(value);
}

export function AirportDetailsPanel({
  airport,
  loading = false,
  error = null,
}: AirportDetailsPanelProps) {
  if (loading) {
    return (
      <Card className="sr-panel sr-panel--details">
        <div className="sr-panel__header">
          <h2>Detalles del aeropuerto</h2>
        </div>

        <Spinner />
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="sr-panel sr-panel--details">
        <div className="sr-panel__header">
          <h2>Detalles del aeropuerto</h2>
        </div>

        <div className="sr-alert sr-alert--error">{error}</div>
      </Card>
    );
  }

  if (!airport) {
    return (
      <Card className="sr-panel sr-panel--details">
        <div className="sr-panel__header">
          <h2>Detalles del aeropuerto</h2>
        </div>

        <p className="text-gray-500">
          Selecciona un aeropuerto en el grafo para ver su información completa.
        </p>
      </Card>
    );
  }

  return (
    <Card className="sr-panel sr-panel--details">
      <div className="sr-panel__header">
        <div>
          <h2 className="flex items-center gap-2">
            <span className="text-2xl font-bold text-primary">
              {airport.id}
            </span>

            {airport.esHub && (
              <span className="inline-block rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-800">
                HUB
              </span>
            )}
          </h2>

          <p className="mt-1 text-sm text-gray-500">{airport.nombre}</p>
        </div>
      </div>

      <div className="space-y-5">
        <section>
          <h3 className="mb-2 text-sm font-semibold text-gray-600">
            Ubicación
          </h3>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
              <span className="text-xs font-semibold text-gray-500">
                Ciudad
              </span>
              <p className="mt-1 font-medium text-gray-900">{airport.ciudad}</p>
            </div>

            <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
              <span className="text-xs font-semibold text-gray-500">País</span>
              <p className="mt-1 font-medium text-gray-900">{airport.pais}</p>
            </div>

            <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
              <span className="text-xs font-semibold text-gray-500">
                Zona horaria
              </span>
              <p className="mt-1 font-medium text-gray-900">
                {airport.zonaHoraria}
              </p>
            </div>
          </div>
        </section>

        <section>
          <h3 className="mb-2 text-sm font-semibold text-gray-600">
            Costos y conectividad
          </h3>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
              <span className="text-xs font-semibold text-gray-500">
                Alojamiento
              </span>
              <p className="mt-1 font-bold text-primary">
                {formatMoney(airport.costoAlojamiento)}/noche
              </p>
            </div>

            <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
              <span className="text-xs font-semibold text-gray-500">
                Alimentación
              </span>
              <p className="mt-1 font-bold text-primary">
                {formatMoney(airport.costoAlimentacion)}/comida
              </p>
            </div>

            <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
              <span className="text-xs font-semibold text-gray-500">
                Grado entrada
              </span>
              <p className="mt-1 font-bold text-gray-900">
                {formatNumber(airport.gradoEntrada)}
              </p>
            </div>

            <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
              <span className="text-xs font-semibold text-gray-500">
                Grado salida
              </span>
              <p className="mt-1 font-bold text-gray-900">
                {formatNumber(airport.gradoSalida)}
              </p>
            </div>
          </div>
        </section>

        <section>
          <h3 className="mb-2 text-sm font-semibold text-gray-600">
            Aerolíneas disponibles
          </h3>

          {airport.aerolineas.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {airport.aerolineas.map((airline) => (
                <span
                  key={airline}
                  className="inline-block rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700"
                >
                  {airline}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">
              No hay aerolíneas registradas.
            </p>
          )}
        </section>

        <section>
          <h3 className="mb-2 text-sm font-semibold text-gray-600">
            Actividades
          </h3>

          {airport.actividades.length > 0 ? (
            <div className="grid max-h-52 gap-2 overflow-y-auto">
              {airport.actividades.map((activity) => (
                <div
                  key={`${activity.nombre}-${activity.duracionMin}-${activity.costoUSD}`}
                  className="rounded-lg border border-gray-200 bg-gray-50 p-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-gray-900">
                        {activity.nombre}
                      </p>
                      <p className="text-xs text-gray-500">{activity.tipo}</p>
                    </div>

                    <p className="text-sm font-semibold text-primary">
                      {activity.duracionMin} min · ${activity.costoUSD}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">
              No hay actividades registradas.
            </p>
          )}
        </section>

        <section>
          <h3 className="mb-2 text-sm font-semibold text-gray-600">
            Trabajos disponibles
          </h3>

          {airport.trabajos.length > 0 ? (
            <div className="grid max-h-52 gap-2 overflow-y-auto">
              {airport.trabajos.map((job) => (
                <div
                  key={`${job.nombre}-${job.tarifaHora}-${job.maxHoras}`}
                  className="rounded-lg border border-gray-200 bg-gray-50 p-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-medium text-gray-900">{job.nombre}</p>

                    <p className="text-sm font-semibold text-primary">
                      ${job.tarifaHora}/h · máx. {job.maxHoras} h
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">
              No hay trabajos registrados.
            </p>
          )}
        </section>
      </div>
    </Card>
  );
}
