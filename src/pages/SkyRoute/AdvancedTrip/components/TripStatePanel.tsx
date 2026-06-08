import { useState } from 'react';
import { Button, Card } from '../../../../components/ui';
import type { AirportDetail } from '../../../../models/skyroute/graph.types';
import type { TravelerState } from '../../../../models/skyroute/planner.types';

interface Props {
  estado: TravelerState | null;
  airportDetail: AirportDetail | null;
  onRegisterJob: (jobName: string, hours: number) => Promise<void> | void;
  onPerformActivity: (activityName: string) => Promise<void> | void;
}

const JOB_TRIGGER_PERCENTAGE = 0.35;

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

function formatMinutes(value: number | null | undefined): string {
  return `${formatNumber(value)} min`;
}

function getSafeHours(value: number, maxHours: number): number {
  if (!Number.isFinite(value) || value < 1) {
    return 1;
  }

  return Math.min(value, maxHours);
}

function getActivityRestrictionMessage(
  activityDurationMin: number,
  activityCost: number,
  estado: TravelerState,
): string | null {
  if (estado.tiempo_restante_min <= 0) {
    return 'No hay tiempo disponible para realizar actividades.';
  }

  if (activityDurationMin > estado.tiempo_restante_min) {
    return 'Tiempo insuficiente para esta actividad.';
  }

  if (activityCost > estado.presupuesto_actual) {
    return 'Presupuesto insuficiente para esta actividad.';
  }

  return null;
}

function getJobRestrictionMessage(
  selectedHours: number,
  estado: TravelerState,
): string | null {
  const selectedMinutes = selectedHours * 60;

  if (estado.tiempo_restante_min <= 0) {
    return 'No hay tiempo disponible para aceptar trabajos.';
  }

  if (selectedMinutes > estado.tiempo_restante_min) {
    return 'Tiempo insuficiente para trabajar esas horas.';
  }

  return null;
}

export function TripStatePanel({
  estado,
  airportDetail,
  onRegisterJob,
  onPerformActivity,
}: Props) {
  const [jobHours, setJobHours] = useState<Record<string, number>>({});
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  if (!estado) {
    return (
      <Card className="sr-panel">
        <div className="sr-panel__header">
          <h2>Estado del viajero</h2>
        </div>

        <p className="text-slate-600 dark:text-slate-300">
          Inicia un viaje para ver el estado paso a paso.
        </p>
      </Card>
    );
  }

  const jobThreshold = estado.presupuesto_inicial * JOB_TRIGGER_PERCENTAGE;
  const canShowJobs =
    estado.presupuesto_actual < jobThreshold && estado.tiempo_restante_min > 0;

  const hasNoTime = estado.tiempo_restante_min <= 0;

  return (
    <Card className="sr-panel">
      <div className="sr-panel__header">
        <div>
          <h2>Estado del viajero</h2>
          <p>Información resumen del estado actual del viaje.</p>
        </div>
      </div>

      <div className="sr-metrics-grid">
        <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-950/70">
          <span className="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Aeropuerto actual
          </span>

          <strong className="mt-3 block text-2xl font-semibold text-slate-900 dark:text-white">
            {estado.aeropuerto_actual}
          </strong>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-950/70">
          <span className="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Presupuesto actual
          </span>

          <strong className="mt-3 block text-2xl font-semibold text-slate-900 dark:text-white">
            {formatMoney(estado.presupuesto_actual)}
          </strong>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-950/70">
          <span className="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Tiempo restante
          </span>

          <strong className="mt-3 block text-2xl font-semibold text-slate-900 dark:text-white">
            {formatMinutes(estado.tiempo_restante_min)}
          </strong>
        </div>
      </div>

      {hasNoTime && (
        <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800 dark:border-amber-500/40 dark:bg-amber-950/40 dark:text-amber-200">
          El viajero no tiene tiempo restante. No puede realizar más
          actividades, trabajos ni desplazamientos.
        </div>
      )}

      {airportDetail && (
        <div className="mt-4 space-y-4">
          <section>
            <h3 className="mb-2 text-lg font-semibold text-slate-900 dark:text-white">
              Trabajos disponibles
            </h3>

            {!canShowJobs ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
                {hasNoTime
                  ? 'No puedes aceptar trabajos porque no queda tiempo disponible.'
                  : `Los trabajos se habilitan cuando el presupuesto baja del 35% del presupuesto inicial. Umbral actual: ${formatMoney(
                      jobThreshold,
                    )}.`}
              </div>
            ) : airportDetail.trabajos.length === 0 ? (
              <p className="text-sm text-slate-600 dark:text-slate-300">
                No hay trabajos disponibles.
              </p>
            ) : (
              <div className="grid gap-2">
                {airportDetail.trabajos.map((job) => {
                  const selectedHours = getSafeHours(
                    jobHours[job.nombre] ?? 1,
                    job.maxHoras,
                  );

                  const restrictionMessage = getJobRestrictionMessage(
                    selectedHours,
                    estado,
                  );

                  const isDisabled =
                    Boolean(restrictionMessage) || actionLoading;

                  return (
                    <div
                      key={job.nombre}
                      className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900"
                    >
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-white">
                            {job.nombre}
                          </p>

                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {formatMoney(job.tarifaHora)}/h · máx.{' '}
                            {formatNumber(job.maxHoras)} h
                          </p>

                          {restrictionMessage && (
                            <p className="mt-1 text-xs font-semibold text-amber-700 dark:text-amber-300">
                              {restrictionMessage}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min={1}
                            max={job.maxHoras}
                            value={selectedHours}
                            disabled={actionLoading}
                            onChange={(event) =>
                              setJobHours((prev) => ({
                                ...prev,
                                [job.nombre]: getSafeHours(
                                  Number(event.target.value),
                                  job.maxHoras,
                                ),
                              }))
                            }
                            className="w-20 rounded-lg border border-slate-300 bg-white px-2 py-1 text-sm text-slate-900 outline-none focus:border-primary focus:ring-1 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                          />

                          <Button
                            disabled={isDisabled}
                            onClick={async () => {
                              if (restrictionMessage) {
                                setActionError(restrictionMessage);
                                return;
                              }

                              setActionError(null);

                              try {
                                setActionLoading(true);
                                await onRegisterJob(job.nombre, selectedHours);
                              } catch (err) {
                                setActionError(
                                  err instanceof Error
                                    ? err.message
                                    : String(err),
                                );
                              } finally {
                                setActionLoading(false);
                              }
                            }}
                            loading={actionLoading}
                          >
                            Aceptar
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          <section>
            <h3 className="mb-2 text-lg font-semibold text-slate-900 dark:text-white">
              Actividades
            </h3>

            {airportDetail.actividades.length === 0 ? (
              <p className="text-sm text-slate-600 dark:text-slate-300">
                No hay actividades registradas.
              </p>
            ) : (
              <div className="grid gap-2">
                {airportDetail.actividades.map((activity) => {
                  const restrictionMessage = getActivityRestrictionMessage(
                    activity.duracionMin,
                    activity.costoUSD,
                    estado,
                  );

                  const isDisabled =
                    Boolean(restrictionMessage) || actionLoading;

                  return (
                    <div
                      key={activity.nombre}
                      className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white">
                          {activity.nombre}
                        </p>

                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {formatMinutes(activity.duracionMin)} ·{' '}
                          {formatMoney(activity.costoUSD)}
                        </p>

                        {restrictionMessage && (
                          <p className="mt-1 text-xs font-semibold text-amber-700 dark:text-amber-300">
                            {restrictionMessage}
                          </p>
                        )}
                      </div>

                      <Button
                        disabled={isDisabled}
                        onClick={async () => {
                          if (restrictionMessage) {
                            setActionError(restrictionMessage);
                            return;
                          }

                          setActionError(null);

                          try {
                            setActionLoading(true);
                            await onPerformActivity(activity.nombre);
                          } catch (err) {
                            setActionError(
                              err instanceof Error ? err.message : String(err),
                            );
                          } finally {
                            setActionLoading(false);
                          }
                        }}
                        loading={actionLoading}
                      >
                        Realizar
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {actionError && (
            <div className="mt-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 dark:border-red-500/40 dark:bg-red-950/40 dark:text-red-200">
              {actionError}
            </div>
          )}
        </div>
      )}
    </Card>
  );
}

export default TripStatePanel;
