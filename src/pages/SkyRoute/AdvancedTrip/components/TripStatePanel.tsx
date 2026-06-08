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

      {airportDetail && (
        <div className="mt-4 space-y-4">
          <section>
            <h3 className="mb-2 text-lg font-semibold text-slate-900 dark:text-white">
              Trabajos disponibles
            </h3>

            {airportDetail.trabajos.length === 0 ? (
              <p className="text-sm text-slate-600 dark:text-slate-300">
                No hay trabajos disponibles.
              </p>
            ) : (
              <div className="grid gap-2">
                {airportDetail.trabajos.map((job) => (
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
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min={1}
                          max={job.maxHoras}
                          value={jobHours[job.nombre] ?? 1}
                          onChange={(event) =>
                            setJobHours((prev) => ({
                              ...prev,
                              [job.nombre]: Number(event.target.value) || 1,
                            }))
                          }
                          className="w-20 rounded-lg border border-slate-300 bg-white px-2 py-1 text-sm text-slate-900 outline-none focus:border-primary focus:ring-1 focus:ring-primary dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                        />

                        <Button
                          onClick={async () => {
                            setActionError(null);

                            try {
                              setActionLoading(true);
                              await onRegisterJob(
                                job.nombre,
                                jobHours[job.nombre] ?? 1,
                              );
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
                ))}
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
                {airportDetail.actividades.map((activity) => (
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
                    </div>

                    <Button
                      onClick={async () => {
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
                ))}
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
