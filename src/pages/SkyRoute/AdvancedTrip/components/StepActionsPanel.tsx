import { Card, Button, Select } from '../../../../components/ui';
import type { TravelerState } from '../../../../models/skyroute/planner.types';
import type { RouteDto, AirportDetail } from '../../../../models/skyroute/graph.types';
import { useState } from 'react';

interface Props {
  estado: TravelerState | null;
  neighbors: RouteDto[];
  airportDetail: AirportDetail | null;
  recommendation: { aeropuerto_recomendado: string; razon: string; beneficios: string[] } | null;
  loading?: boolean;
  onRecommend: (criterio: 'costo' | 'tiempo' | 'destinos') => void;
  onAdvance: (destino: string, aeronave: string) => void;
  onReloadNeighbors: () => void;
}

export function StepActionsPanel({ estado, neighbors, airportDetail, recommendation, loading, onRecommend, onAdvance, onReloadNeighbors }: Props) {
  const [selectedRouteIdx, setSelectedRouteIdx] = useState<number | null>(null);
  const [selectedAircraft, setSelectedAircraft] = useState<string | null>(null);

  const handleAdvance = () => {
    if (selectedRouteIdx === null) return;
    const route = neighbors[selectedRouteIdx];
    const aeronave = selectedAircraft || route.aeronaves[0] || '';
    onAdvance(route.destino, aeronave);
  };

  return (
    <Card className="sr-panel">
      <div className="sr-panel__header">
        <div>
          <h2>Acciones paso a paso</h2>
          <p>Selecciona un destino y aeronave para avanzar el viaje.</p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Button onClick={() => onRecommend('costo')}>Recomendar (costo)</Button>
            <Button onClick={() => onRecommend('tiempo')}>Recomendar (tiempo)</Button>
            <Button onClick={() => onRecommend('destinos')}>Recomendar (destinos)</Button>
            <Button variant="secondary" onClick={onReloadNeighbors}>Refrescar rutas</Button>
          </div>

          {recommendation && (
            <div className="rounded-3xl border border-slate-700 bg-slate-950/70 p-4">
              <p className="font-semibold text-white">Recomendación: {recommendation.aeropuerto_recomendado}</p>
              <p className="text-sm text-slate-300">Razón: {recommendation.razon}</p>
            </div>
          )}
        </div>

        <div>
          <h3 className="mb-2">Rutas desde el aeropuerto actual</h3>

          {neighbors.length === 0 ? (
            <p>No hay rutas desde este aeropuerto.</p>
          ) : (
            <div className="grid gap-2">
              {neighbors.map((route, idx) => (
                <div
                  key={`${route.origen}-${route.destino}-${idx}`}
                  className={`rounded-2xl border p-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between ${selectedRouteIdx === idx ? 'border-primary bg-slate-800' : 'border-slate-700 bg-slate-900'}`}
                >
                  <div>
                    <p className="font-semibold text-white">{route.origen} → {route.destino}</p>
                    <p className="text-xs text-slate-400">{route.distanciaKm} km · costo base: ${route.costoBase}</p>
                  </div>

                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <Select
                      value={selectedRouteIdx === idx ? (selectedAircraft || '') : ''}
                      onChange={(e) => {
                        setSelectedRouteIdx(idx);
                        setSelectedAircraft(e.target.value || null);
                      }}
                      options={route.aeronaves.map((a) => ({ value: a, label: a }))}
                      placeholder={route.aeronaves[0] ?? 'N/A'}
                    />
                    <Button onClick={() => { setSelectedRouteIdx(idx); setSelectedAircraft(route.aeronaves[0] ?? ''); }}>Seleccionar</Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          <Button onClick={handleAdvance} loading={loading} disabled={selectedRouteIdx === null}>Avanzar</Button>
        </div>
      </div>
    </Card>
  );
}

export default StepActionsPanel;
