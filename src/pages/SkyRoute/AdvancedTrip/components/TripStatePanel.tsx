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
  const [jobHours, setJobHours] = useState(1);
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
        <div>
          <span>Aeropuerto actual</span>
          <strong>{estado.aeropuerto_actual}</strong>
        </div>

        <div>
          <span>Presupuesto</span>
          <strong>${estado.presupuesto_actual} USD</strong>
        </div>

        <div>
          <span>Tiempo restante</span>
          <strong>{estado.tiempo_restante_min} min</strong>
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
                  <div key={job.nombre} className="rounded-lg border p-3 bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{job.nombre}</p>
                        <p className="text-xs text-gray-500">${job.tarifaHora}/h · máx. {job.maxHoras} h</p>
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min={1}
                          max={job.maxHoras}
                          value={jobHours}
                          onChange={(e) => setJobHours(Number(e.target.value))}
                          className="w-20 rounded border border-slate-300 bg-white px-2 py-1 text-sm text-bodydark1 outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                        />
                        <Button onClick={async () => {
                          setActionError(null);
                          try {
                            setActionLoading(true);
                            await onRegisterJob(job.nombre, jobHours);
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
                  <div key={act.nombre} className="rounded-lg border p-3 bg-gray-50 flex items-center justify-between">
                    <div>
                      <p className="font-medium">{act.nombre}</p>
                      <p className="text-xs text-gray-500">{act.duracionMin} min · ${act.costoUSD}</p>
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
