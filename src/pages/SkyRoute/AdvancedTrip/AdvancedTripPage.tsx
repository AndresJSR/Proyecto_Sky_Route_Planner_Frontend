import './AdvancedTripPage.css';

import { useMemo, useRef, useState } from 'react';
import { Button, Card, Input, Select, Spinner } from '../../../components/ui';
import { GraphVisualizationPanel } from '../GraphViewer/components/GraphVisualizationPanel';
import StepActionsPanel from './components/StepActionsPanel';
import { TripStatePanel } from './components/TripStatePanel';
import { useAdvancedTripPage } from './hooks/useAdvancedTripPage';

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

const GRAPH_SCROLL_OFFSET_PX = 88;
const GRAPH_SCROLL_EXTRA_DOWN_PX = 320;
const WAIT_BEFORE_ADVANCE_MS = 2500;

function getScrollableParent(element: HTMLElement | null): HTMLElement {
  let parent = element?.parentElement ?? null;

  while (parent) {
    const style = window.getComputedStyle(parent);
    const canScroll =
      style.overflowY === 'auto' ||
      style.overflowY === 'scroll' ||
      style.overflow === 'auto' ||
      style.overflow === 'scroll';

    if (canScroll && parent.scrollHeight > parent.clientHeight) {
      return parent;
    }

    parent = parent.parentElement;
  }

  return document.scrollingElement as HTMLElement;
}

function scrollToGraphSection(element: HTMLElement | null): void {
  if (!element) return;

  const scrollParent = getScrollableParent(element);

  if (scrollParent === document.scrollingElement) {
    const targetTop =
      element.getBoundingClientRect().top +
      window.scrollY -
      GRAPH_SCROLL_OFFSET_PX +
      GRAPH_SCROLL_EXTRA_DOWN_PX;

    window.scrollTo({
      top: targetTop,
      behavior: 'auto',
    });

    return;
  }

  const parentRect = scrollParent.getBoundingClientRect();
  const elementRect = element.getBoundingClientRect();

  const targetTop =
    scrollParent.scrollTop +
    elementRect.top -
    parentRect.top -
    GRAPH_SCROLL_OFFSET_PX +
    GRAPH_SCROLL_EXTRA_DOWN_PX;

  scrollParent.scrollTo({
    top: targetTop,
    behavior: 'auto',
  });
}

export function AdvancedTripPage() {
  const [originInput, setOriginInput] = useState('BOG');
  const [presupuestoInput, setPresupuestoInput] = useState(700);
  const [tiempoInput, setTiempoInput] = useState(120);
  const [advanceDelayLoading, setAdvanceDelayLoading] = useState(false);

  const graphSectionRef = useRef<HTMLElement | null>(null);

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

  const originOptions = useMemo(
    () =>
      graphAirports.map((airport) => ({
        value: airport.id,
        label: `${airport.id} — ${airport.ciudad}, ${airport.pais}`,
      })),
    [graphAirports],
  );

  const isAdvancing = actionLoading || advanceDelayLoading;

  async function handleAdvanceWithGraphFocus(
    destino: string,
    aeronave: string,
  ) {
    try {
      setAdvanceDelayLoading(true);

      scrollToGraphSection(graphSectionRef.current);

      await wait(WAIT_BEFORE_ADVANCE_MS);

      await advanceTo(destino, aeronave);
    } finally {
      setAdvanceDelayLoading(false);
    }
  }

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

            {(loading || graphLoading) && <Spinner size="sm" />}
          </div>

          <div className="sr-form-grid">
            <Select
              label="Origen"
              value={originInput}
              onChange={(event) =>
                setOriginInput(String(event.target.value).toUpperCase())
              }
              options={originOptions}
              placeholder={
                graphLoading
                  ? 'Cargando aeropuertos...'
                  : 'Selecciona un aeropuerto de origen'
              }
              disabled={graphLoading || originOptions.length === 0}
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
              disabled={loading || graphLoading || !originInput}
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
          loading={isAdvancing}
          onRecommend={getRecommendation}
          onAdvance={handleAdvanceWithGraphFocus}
          onReloadNeighbors={reloadNeighbors}
        />
      </section>

      <section ref={graphSectionRef} className="mt-6">
        <GraphVisualizationPanel
          airports={graphAirports}
          routes={graphRoutes}
          loading={graphLoading}
          error={graphError}
          traveledRoutes={traveledRoutes}
          highlightRoute={lastTraveledRoute ?? highlightRoute}
          showTravelAnimation
          onAirportSelect={() => undefined}
          onRouteSelect={() => undefined}
        />
      </section>
    </main>
  );
}

export default AdvancedTripPage;
