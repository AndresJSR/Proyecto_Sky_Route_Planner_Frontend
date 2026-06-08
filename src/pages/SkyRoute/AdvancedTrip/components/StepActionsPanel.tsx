import { useState } from 'react';
import { Button, Card, Select } from '../../../../components/ui';
import type {
  AirportDetail,
  RouteDto,
} from '../../../../models/skyroute/graph.types';
import type { TravelerState } from '../../../../models/skyroute/planner.types';

interface Props {
  estado: TravelerState | null;
  neighbors: RouteDto[];
  airportDetail: AirportDetail | null;
  recommendation: {
    aeropuerto_recomendado: string;
    razon: string;
    beneficios: string[];
  } | null;
  loading?: boolean;
  onRecommend: (criterio: 'costo' | 'tiempo' | 'destinos') => void;
  onAdvance: (destino: string, aeronave: string) => void;
  onReloadNeighbors: () => void;
}

type RecommendationCriterion = 'costo' | 'tiempo' | 'destinos';

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

const numberFormatter = new Intl.NumberFormat('es-CO', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

const moneyFormatter = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

function formatNumber(value: number | null | undefined): string {
  return numberFormatter.format(value ?? 0);
}

function formatMoney(value: number | null | undefined): string {
  return moneyFormatter.format(value ?? 0);
}

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

function getRouteDistance(route: RouteDto): number {
  return getNumberValue(route, ['distanciaKm', 'distancia_km']);
}

function getRouteCostBase(route: RouteDto): number {
  return getNumberValue(route, ['costoBase', 'costo_base']);
}

function isSubsidizedRoute(route: RouteDto): boolean {
  return getRouteCostBase(route) === 0;
}

function getRouteAircraft(route: RouteDto): string[] {
  const aircraft = route.aeronaves ?? [];
  return aircraft.filter((item): item is string => typeof item === 'string');
}

function getEstimatedCost(route: RouteDto, aircraft: string): number {
  if (isSubsidizedRoute(route)) {
    return 0;
  }

  const rate = AIRCRAFT_RATES[aircraft];

  if (!rate) return 0;

  return getRouteDistance(route) * rate.costPerKm;
}

function getEstimatedTime(route: RouteDto, aircraft: string): number {
  const rate = AIRCRAFT_RATES[aircraft];

  if (!rate) return 0;

  return getRouteDistance(route) * rate.minutesPerKm;
}

function getMinimumEstimatedCost(route: RouteDto): number {
  const aircraftOptions = getRouteAircraft(route);

  if (aircraftOptions.length === 0) {
    return 0;
  }

  return Math.min(
    ...aircraftOptions.map((aircraft) => getEstimatedCost(route, aircraft)),
  );
}

function getMinimumEstimatedTime(route: RouteDto): number {
  const aircraftOptions = getRouteAircraft(route);

  if (aircraftOptions.length === 0) {
    return 0;
  }

  return Math.min(
    ...aircraftOptions.map((aircraft) => getEstimatedTime(route, aircraft)),
  );
}

function buildAircraftLabel(route: RouteDto, aircraft: string): string {
  const cost = getEstimatedCost(route, aircraft);
  const time = getEstimatedTime(route, aircraft);

  return `${aircraft} · ${formatMoney(cost)} · ${formatNumber(time)} min`;
}

function getRecommendationTitle(criterion: RecommendationCriterion | null) {
  if (criterion === 'costo') {
    return 'Recomendación por menor costo estimado';
  }

  if (criterion === 'tiempo') {
    return 'Recomendación por menor tiempo estimado';
  }

  if (criterion === 'destinos') {
    return 'Recomendación para avanzar a más destinos';
  }

  return 'Recomendación';
}

function getRecommendationRoute(
  recommendation: Props['recommendation'],
  neighbors: RouteDto[],
): RouteDto | null {
  if (!recommendation) return null;

  return (
    neighbors.find(
      (route) => route.destino === recommendation.aeropuerto_recomendado,
    ) ?? null
  );
}

function getCleanBenefits(benefits: string[]): string[] {
  return benefits.filter((benefit) => {
    const normalized = benefit.toLowerCase();

    if (normalized.includes('costo base')) return false;
    if (/aeronaves:\s*\d+/.test(normalized)) return false;

    return true;
  });
}

export function StepActionsPanel({
  estado,
  neighbors,
  recommendation,
  loading,
  onRecommend,
  onAdvance,
  onReloadNeighbors,
}: Props) {
  const [selectedRouteIdx, setSelectedRouteIdx] = useState<number | null>(null);
  const [selectedAircraft, setSelectedAircraft] = useState<string | null>(null);
  const [recommendationCriterion, setRecommendationCriterion] =
    useState<RecommendationCriterion | null>(null);

  const selectedRoute =
    selectedRouteIdx === null ? null : neighbors[selectedRouteIdx] ?? null;

  const recommendedRoute = getRecommendationRoute(recommendation, neighbors);

  const canAdvance =
    selectedRoute !== null && getRouteAircraft(selectedRoute).length > 0;

  const handleRecommend = (criterion: RecommendationCriterion) => {
    setRecommendationCriterion(criterion);
    onRecommend(criterion);
  };

  const handleAdvance = () => {
    if (!selectedRoute) return;

    const aircraftOptions = getRouteAircraft(selectedRoute);
    const aircraft = selectedAircraft || aircraftOptions[0] || '';

    if (!aircraft) return;

    onAdvance(selectedRoute.destino, aircraft);
  };

  if (!estado) {
    return (
      <Card className="sr-panel">
        <div className="sr-panel__header">
          <div>
            <h2>Acciones paso a paso</h2>
            <p>Inicia un viaje para seleccionar rutas y aeronaves.</p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="sr-panel">
      <div className="sr-panel__header">
        <div>
          <h2>Acciones paso a paso</h2>
          <p>Selecciona un destino y una aeronave para avanzar el viaje.</p>
        </div>
      </div>

      <div className="space-y-4">
        <section>
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <Button onClick={() => handleRecommend('costo')}>
              Recomendar por costo
            </Button>

            <Button onClick={() => handleRecommend('tiempo')}>
              Recomendar por tiempo
            </Button>

            <Button onClick={() => handleRecommend('destinos')}>
              Recomendar por destinos
            </Button>

            <Button variant="secondary" onClick={onReloadNeighbors}>
              Refrescar rutas
            </Button>
          </div>

          {recommendation && (
            <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-950/70">
              <p className="font-semibold text-slate-900 dark:text-white">
                {getRecommendationTitle(recommendationCriterion)}:{' '}
                {recommendation.aeropuerto_recomendado}
              </p>

              {recommendedRoute ? (
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-600 dark:text-slate-300">
                  <li>
                    Distancia:{' '}
                    {formatNumber(getRouteDistance(recommendedRoute))} km
                  </li>

                  <li>
                    {isSubsidizedRoute(recommendedRoute)
                      ? 'Ruta subsidiada · costo $0 USD'
                      : `Costo estimado desde ${formatMoney(
                          getMinimumEstimatedCost(recommendedRoute),
                        )}`}
                  </li>

                  <li>
                    Tiempo mínimo estimado:{' '}
                    {formatNumber(getMinimumEstimatedTime(recommendedRoute))}{' '}
                    min
                  </li>

                  <li>
                    Aeronaves disponibles:{' '}
                    {getRouteAircraft(recommendedRoute).join(', ') ||
                      'No registradas'}
                  </li>
                </ul>
              ) : (
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-600 dark:text-slate-300">
                  {getCleanBenefits(recommendation.beneficios).map(
                    (benefit) => (
                      <li key={benefit}>{benefit}</li>
                    ),
                  )}
                </ul>
              )}
            </div>
          )}
        </section>

        <section>
          <h3 className="mb-2 text-lg font-semibold text-slate-900 dark:text-white">
            Rutas desde {estado.aeropuerto_actual}
          </h3>

          {neighbors.length === 0 ? (
            <p className="text-sm text-slate-600 dark:text-slate-300">
              No hay rutas disponibles desde este aeropuerto.
            </p>
          ) : (
            <div className="grid gap-2">
              {neighbors.map((route, idx) => {
                const aircraftOptions = getRouteAircraft(route);
                const isSelected = selectedRouteIdx === idx;
                const distance = getRouteDistance(route);
                const subsidized = isSubsidizedRoute(route);

                return (
                  <div
                    key={`${route.origen}-${route.destino}-${idx}`}
                    className={`flex flex-col gap-4 rounded-2xl border p-4 sm:flex-row sm:items-center sm:justify-between ${
                      isSelected
                        ? 'border-primary bg-violet-50 dark:bg-slate-800'
                        : 'border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900'
                    }`}
                  >
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white">
                        {route.origen} → {route.destino}
                      </p>

                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {formatNumber(distance)} km ·{' '}
                        {subsidized
                          ? 'ruta subsidiada · costo $0 USD'
                          : 'costo calculado por aeronave'}
                      </p>
                    </div>

                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                      <Select
                        value={isSelected ? selectedAircraft || '' : ''}
                        onChange={(event) => {
                          setSelectedRouteIdx(idx);
                          setSelectedAircraft(event.target.value || null);
                        }}
                        options={aircraftOptions.map((aircraft) => ({
                          value: aircraft,
                          label: buildAircraftLabel(route, aircraft),
                        }))}
                        placeholder={
                          aircraftOptions[0]
                            ? buildAircraftLabel(route, aircraftOptions[0])
                            : 'Sin aeronaves'
                        }
                        disabled={aircraftOptions.length === 0}
                      />

                      <Button
                        onClick={() => {
                          setSelectedRouteIdx(idx);
                          setSelectedAircraft(aircraftOptions[0] ?? '');
                        }}
                        disabled={aircraftOptions.length === 0}
                      >
                        Seleccionar
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <div className="flex items-center gap-3">
          <Button
            onClick={handleAdvance}
            loading={loading}
            disabled={!canAdvance}
          >
            Avanzar
          </Button>
        </div>
      </div>
    </Card>
  );
}

export default StepActionsPanel;
