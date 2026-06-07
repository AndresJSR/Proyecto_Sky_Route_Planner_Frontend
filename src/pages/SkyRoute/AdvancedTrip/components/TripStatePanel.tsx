import { Card, Button } from '../../../../components/ui';
import type { TravelerState } from '../../../../models/skyroute/planner.types';
import type { AirportDetail } from '../../../../models/skyroute/graph.types';
import { useState } from 'react';

interface Props {
  estado: TravelerState | null;
  airportDetail: AirportDetail | null;
  onRegisterJob: (jobName: string, hours: number) => Promise<void> | void;
  onPerformActivity: (activityName: string) => Promise<void> | void;
}

export function TripStatePanel({ estado, airportDetail, onRegisterJob, onPerformActivity }: Props) {
  const [jobHours, setJobHours] = useState<Record<string, number>>({});
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  if (!estado) {
    return (
      <Card className="sr-panel">
        <div className="sr-panel__header">
          <h2>Estado del viajero</h2>
        </div>

        <p>Inicia un viaje para ver el estado paso a paso.</p>
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
        <div className="rounded-3xl border border-slate-700 bg-slate-950/70 p-4 shadow-sm">
          <span className="text-xs uppercase tracking-wide text-slate-400">Aeropuerto actual</span>
          <strong className="mt-3 block text-2xl font-semibold text-white">{estado.aeropuerto_actual}</strong>
        </div>

        <div className="rounded-3xl border border-slate-700 bg-slate-950/70 p-4 shadow-sm">
          <span className="text-xs uppercase tracking-wide text-slate-400">Presupuesto</span>
          <strong className="mt-3 block text-2xl font-semibold text-white">${estado.presupuesto_actual} USD</strong>
        </div>

        <div className="rounded-3xl border border-slate-700 bg-slate-950/70 p-4 shadow-sm">
          <span className="text-xs uppercase tracking-wide text-slate-400">Tiempo restante</span>
          <strong className="mt-3 block text-2xl font-semibold text-white">{estado.tiempo_restante_min} min</strong>
        </div>
      </div>

      {airportDetail && (
        <div className="mt-4 space-y-4">
          <section>
            <h3 className="mb-2">Trabajos disponibles</h3>

            {airportDetail.trabajos.length === 0 ? (
              <p>No hay trabajos disponibles.</p>
            ) : (
              <div className="grid gap-2">
                {airportDetail.trabajos.map((job) => (
                  <div key={job.nombre} className="rounded-2xl border border-slate-700 bg-slate-900 p-4">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="font-semibold text-white">{job.nombre}</p>
                        <p className="text-xs text-slate-400">${job.tarifaHora}/h · máx. {job.maxHoras} h</p>
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min={1}
                          max={job.maxHoras}
                          value={jobHours[job.nombre] ?? 1}
                          onChange={(e) => setJobHours((prev) => ({
                            ...prev,
                            [job.nombre]: Number(e.target.value) || 1,
                          }))}
                          className="w-20 rounded-lg border border-slate-700 bg-slate-900 px-2 py-1 text-sm text-black outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                        />
                        <Button onClick={async () => {
                          setActionError(null);
                          try {
                            setActionLoading(true);
                            await onRegisterJob(job.nombre, jobHours[job.nombre] ?? 1);
                          } catch (err) {
                            setActionError(err instanceof Error ? err.message : String(err));
                          } finally {
                            setActionLoading(false);
                          }
                        }} loading={actionLoading}>Aceptar</Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section>
            <h3 className="mb-2">Actividades</h3>

            {airportDetail.actividades.length === 0 ? (
              <p>No hay actividades registradas.</p>
            ) : (
              <div className="grid gap-2">
                {airportDetail.actividades.map((act) => (
                  <div key={act.nombre} className="rounded-2xl border border-slate-700 bg-slate-900 p-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-semibold text-white">{act.nombre}</p>
                      <p className="text-xs text-slate-400">{act.duracionMin} min · ${act.costoUSD}</p>
                    </div>

                    <Button onClick={async () => {
                      setActionError(null);
                      try {
                        setActionLoading(true);
                        await onPerformActivity(act.nombre);
                      } catch (err) {
                        setActionError(err instanceof Error ? err.message : String(err));
                      } finally {
                        setActionLoading(false);
                      }
                    }} loading={actionLoading}>Realizar</Button>
                  </div>
                ))}
              </div>
            )}
          </section>
          {actionError && (<div className="mt-2 text-sm text-danger">{actionError}</div>)}
        </div>
      )}
    </Card>
  );
}

export default TripStatePanel;
