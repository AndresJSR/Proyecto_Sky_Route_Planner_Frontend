import { Card } from '../../../../components/ui';
import type { RouteDto } from '../../../../models/skyroute/graph.types';

interface RouteDetailsPanelProps {
  route: RouteDto | null;
}

const AIRCRAFT_RATES: Record<
  string,
  {
    costPerKm: number;
    minutesPerKm: number;
    description: string;
  }
> = {
  'Avión Comercial': {
    costPerKm: 0.18,
    minutesPerKm: 0.7,
    description: 'Rápido y eficiente',
  },
  'Avión Regional': {
    costPerKm: 0.25,
    minutesPerKm: 1.1,
    description: 'Flexible',
  },
  Hélice: {
    costPerKm: 0.12,
    minutesPerKm: 2.5,
    description: 'Económico',
  },
};

function getNumberValue(source: unknown, keys: string[]): number | null {
  if (!source || typeof source !== 'object') return null;

  const data = source as Record<string, unknown>;

  for (const key of keys) {
    const value = data[key];

    if (typeof value === 'number') {
      return value;
    }
  }

  return null;
}

function getBooleanValue(source: unknown, keys: string[]): boolean {
  if (!source || typeof source !== 'object') return false;

  const data = source as Record<string, unknown>;

  for (const key of keys) {
    const value = data[key];

    if (typeof value === 'boolean') {
      return value;
    }
  }

  return false;
}

function formatNumber(value: number | null, suffix = ''): string {
  if (value === null || Number.isNaN(value)) return 'N/A';

  return `${value.toFixed(2).replace(/\.00$/, '')}${suffix}`;
}

function formatMoney(value: number | null): string {
  if (value === null || Number.isNaN(value)) return 'N/A';

  return `$${formatNumber(value)} USD`;
}

function getAircraftOptions(route: RouteDto): string[] {
  const aircraft = route.aeronaves ?? [];

  return aircraft.filter((item): item is string => typeof item === 'string');
}

function getEstimatedCost(
  distance: number | null,
  aircraft: string,
  isSubsidized: boolean,
): number | null {
  if (distance === null) return null;

  if (isSubsidized) {
    return 0;
  }

  const rate = AIRCRAFT_RATES[aircraft];

  if (!rate) return null;

  return distance * rate.costPerKm;
}

function getEstimatedTime(
  distance: number | null,
  aircraft: string,
): number | null {
  if (distance === null) return null;

  const rate = AIRCRAFT_RATES[aircraft];

  if (!rate) return null;

  return distance * rate.minutesPerKm;
}

function getMinimumValue(values: Array<number | null>): number | null {
  const validValues = values.filter(
    (value): value is number => typeof value === 'number',
  );

  if (validValues.length === 0) {
    return null;
  }

  return Math.min(...validValues);
}

export function RouteDetailsPanel({ route }: RouteDetailsPanelProps) {
  if (!route) {
    return (
      <Card className="sr-panel sr-panel--details">
        <div className="sr-panel__header">
          <h2>Detalles de la ruta</h2>
        </div>

        <p className="text-gray-500">
          Haz clic en una ruta del grafo para ver su información completa.
        </p>
      </Card>
    );
  }

  const distance = getNumberValue(route, ['distanciaKm', 'distancia_km']);

  const minimumStay = getNumberValue(route, [
    'estanciaMinima',
    'estancia_minima',
    'estancia_minima_min',
  ]);

  const costBase = getNumberValue(route, ['costoBase', 'costo_base']);
  const isBlocked = getBooleanValue(route, ['bloqueada']);
  const isSubsidized = getBooleanValue(route, ['subsidiada']) || costBase === 0;

  const aircraftOptions = getAircraftOptions(route);

  const estimatedCosts = aircraftOptions.map((aircraft) =>
    getEstimatedCost(distance, aircraft, isSubsidized),
  );

  const estimatedTimes = aircraftOptions.map((aircraft) =>
    getEstimatedTime(distance, aircraft),
  );

  const minimumEstimatedCost = getMinimumValue(estimatedCosts);
  const minimumEstimatedTime = getMinimumValue(estimatedTimes);

  return (
    <Card className="sr-panel sr-panel--details">
      <div className="sr-panel__header">
        <div>
          <h2 className="flex items-center gap-3">
            <span className="text-lg font-bold text-primary">
              {route.origen}
            </span>
            <span className="text-gray-400">→</span>
            <span className="text-lg font-bold text-primary">
              {route.destino}
            </span>
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Información completa de la arista seleccionada.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              isBlocked
                ? 'bg-red-100 text-red-700'
                : 'bg-green-100 text-green-700'
            }`}
          >
            {isBlocked ? 'Bloqueada' : 'Activa'}
          </span>

          {isSubsidized && (
            <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
              Subsidiada
            </span>
          )}
        </div>
      </div>

      <div className="space-y-5">
        <section>
          <h3 className="mb-2 text-sm font-semibold text-gray-600">
            Métricas principales
          </h3>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
              <span className="text-xs font-semibold text-gray-500">
                Distancia
              </span>
              <p className="mt-1 text-lg font-bold text-primary">
                {formatNumber(distance, ' km')}
              </p>
            </div>

            <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
              <span className="text-xs font-semibold text-gray-500">
                Estancia mínima
              </span>
              <p className="mt-1 text-lg font-bold text-primary">
                {formatNumber(minimumStay, ' min')}
              </p>
            </div>

            <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
              <span className="text-xs font-semibold text-gray-500">
                Costo estimado desde
              </span>
              <p className="mt-1 text-lg font-bold text-primary">
                {formatMoney(minimumEstimatedCost)}
              </p>
            </div>

            <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
              <span className="text-xs font-semibold text-gray-500">
                Tiempo mínimo estimado
              </span>
              <p className="mt-1 text-lg font-bold text-primary">
                {formatNumber(minimumEstimatedTime, ' min')}
              </p>
            </div>
          </div>
        </section>

        <section>
          <h3 className="mb-2 text-sm font-semibold text-gray-600">
            Aeronaves disponibles
          </h3>

          {aircraftOptions.length > 0 ? (
            <div className="grid gap-2">
              {aircraftOptions.map((aircraft) => {
                const estimatedCost = getEstimatedCost(
                  distance,
                  aircraft,
                  isSubsidized,
                );

                const estimatedTime = getEstimatedTime(distance, aircraft);
                const aircraftInfo = AIRCRAFT_RATES[aircraft];

                return (
                  <div
                    key={aircraft}
                    className="rounded-lg border border-blue-100 bg-blue-50 p-3"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm font-semibold text-blue-900">
                        {aircraft}
                      </span>

                      <span className="text-xs font-medium text-blue-600">
                        {aircraftInfo?.description ?? 'Disponible'}
                      </span>
                    </div>

                    <div className="mt-2 grid grid-cols-1 gap-2 text-xs text-blue-700 md:grid-cols-2">
                      <span>Costo estimado: {formatMoney(estimatedCost)}</span>
                      <span>
                        Tiempo estimado: {formatNumber(estimatedTime, ' min')}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-gray-500">
              No hay aeronaves registradas para esta ruta.
            </p>
          )}
        </section>

        {isSubsidized && (
          <section>
            <div className="rounded-lg border border-green-200 bg-green-50 p-3">
              <div className="flex items-start gap-3">
                <span className="text-lg font-bold text-green-600">✓</span>

                <div>
                  <p className="text-sm font-semibold text-green-900">
                    Ruta subsidiada
                  </p>
                  <p className="text-xs text-green-700">
                    Esta ruta tiene costo estimado cero. Recuerda validar la
                    restricción del 20% de la distancia total del viaje.
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}

        {isBlocked && (
          <section>
            <div className="rounded-lg border border-red-200 bg-red-50 p-3">
              <p className="text-sm font-semibold text-red-900">
                Ruta bloqueada
              </p>
              <p className="mt-1 text-xs text-red-700">
                Esta arista no debe ser considerada por los algoritmos de
                planificación mientras permanezca bloqueada.
              </p>
            </div>
          </section>
        )}
      </div>
    </Card>
  );
}
