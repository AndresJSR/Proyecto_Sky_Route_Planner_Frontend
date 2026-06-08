import './AdvancedTripPage.css';

import { useState } from 'react';
import { Button, Card, Input, Spinner } from '../../../components/ui';
import { GraphVisualizationPanel } from '../GraphViewer/components/GraphVisualizationPanel';
import StepActionsPanel from './components/StepActionsPanel';
import { TripStatePanel } from './components/TripStatePanel';
import { useAdvancedTripPage } from './hooks/useAdvancedTripPage';

export function AdvancedTripPage() {
  const [originInput, setOriginInput] = useState('BOG');
  const [presupuestoInput, setPresupuestoInput] = useState(700);
  const [tiempoInput, setTiempoInput] = useState(120);

  const {
    estado,
    loading,
    actionLoading,
    recommendation,
    neighbors,
    airportDetail,

    graphAirports,
    graphRoutes,
    graphLoading,
    graphError,

    traveledRoutes,
    lastTraveledRoute,
    highlightRoute,

    startTrip,
    getRecommendation,
    advanceTo,
    registerLocalJob,
    performLocalActivity,
    reloadNeighbors,
  } = useAdvancedTripPage();

  return (
    <main className="sr-page sr-advanced-trip-page">
      <section className="mb-6">
        <span className="block text-sm font-semibold uppercase tracking-wide text-primary">
          SkyRoute Planner
        </span>

        <h1 className="text-3xl font-bold">Simulación avanzada de viaje</h1>

        <p className="mt-2 text-sm text-body">
          Ejecuta el viaje paso a paso: inicia, solicita recomendaciones y
          avanza seleccionando aeronaves y destinos.
        </p>
      </section>

      <section className="sr-two-columns">
        <Card className="sr-panel">
          <div className="sr-panel__header">
            <div>
              <h2>Iniciar viaje</h2>
              <p>
                Define origen, presupuesto inicial y tiempo total disponible.
              </p>
            </div>

            {loading && <Spinner size="sm" />}
          </div>

          <div className="sr-form-grid">
            <Input
              label="Origen"
              value={originInput}
              onChange={(event) =>
                setOriginInput(event.target.value.toUpperCase())
              }
            />

            <Input
              label="Presupuesto USD"
              type="number"
              value={String(presupuestoInput)}
              onChange={(event) =>
                setPresupuestoInput(Number(event.target.value))
              }
            />

            <Input
              label="Tiempo total (horas)"
              type="number"
              value={String(tiempoInput)}
              onChange={(event) => setTiempoInput(Number(event.target.value))}
            />

            <Button
              onClick={() =>
                startTrip(originInput, presupuestoInput, tiempoInput)
              }
              loading={loading}
            >
              Iniciar viaje
            </Button>
          </div>
        </Card>

        <TripStatePanel
          estado={estado}
          airportDetail={airportDetail}
          onRegisterJob={registerLocalJob}
          onPerformActivity={performLocalActivity}
        />
      </section>

      <section className="mt-6">
        <StepActionsPanel
          estado={estado}
          neighbors={neighbors}
          airportDetail={airportDetail}
          recommendation={recommendation}
          loading={actionLoading}
          onRecommend={getRecommendation}
          onAdvance={advanceTo}
          onReloadNeighbors={reloadNeighbors}
        />
      </section>

      <section className="mt-6">
        <GraphVisualizationPanel
          airports={graphAirports}
          routes={graphRoutes}
          loading={graphLoading}
          error={graphError}
          traveledRoutes={traveledRoutes}
          highlightRoute={lastTraveledRoute ?? highlightRoute}
          onAirportSelect={() => undefined}
          onRouteSelect={() => undefined}
        />
      </section>
    </main>
  );
}

export default AdvancedTripPage;
