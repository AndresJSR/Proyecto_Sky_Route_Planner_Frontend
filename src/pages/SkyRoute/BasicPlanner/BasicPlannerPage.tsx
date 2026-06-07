import './BasicPlannerPage.css';

import { CommonPlannerFilters } from './components/CommonPlannerFilters';
import { GraphSummaryPanel } from './components/GraphSummaryPanel';
import { ItinerariesPanel } from './components/ItinerariesPanel';
import { OptimalRoutePanel } from './components/OptimalRoutePanel';
import { PageHeader } from './components/PageHeader';
import { PlannerErrorAlert } from './components/PlannerErrorAlert';
import { RoutesByCriteriaPanel } from './components/RoutesByCriteriaPanel';
import { useBasicPlannerPage } from './hooks/useBasicPlannerPage';

export function BasicPlannerPage() {
  const {
    summary,
    airports,
    routes,
    graphLoading,
    graphError,

    origen,
    destino,
    criterio,
    incluirSecundarios,
    selectedTransports,
    exigirTodosLosTransportes,
    selectedCriteria,
    presupuesto,
    tiempoHoras,

    optimalResult,
    criteriaResult,
    itineraryResult,
    optimalTransportValidation,

    loadingSection,
    plannerError,
    airportCodes,

    setOrigen,
    setDestino,
    setCriterio,
    setIncluirSecundarios,
    setPresupuesto,
    setTiempoHoras,

    toggleTransport,
    toggleCriterion,
    toggleExigirTodosLosTransportes,
    handleOptimalRoute,
    handleRoutesByCriteria,
    handleItineraries,
  } = useBasicPlannerPage();

  return (
    <main className="sr-page">
      <PageHeader />

      <GraphSummaryPanel
        summary={summary}
        airports={airports}
        routes={routes}
        loading={graphLoading}
        error={graphError}
      />

      <CommonPlannerFilters
        airportCodes={airportCodes}
        origen={origen}
        destino={destino}
        incluirSecundarios={incluirSecundarios}
        selectedTransports={selectedTransports}
        onOrigenChange={setOrigen}
        onDestinoChange={setDestino}
        onIncluirSecundariosChange={setIncluirSecundarios}
        onToggleTransport={toggleTransport}
      />

      <PlannerErrorAlert message={plannerError} />

      <section className="sr-two-columns">
        <OptimalRoutePanel
          criterio={criterio}
          result={optimalResult}
          loading={loadingSection === 'optimal'}
          transportValidation={optimalTransportValidation}
          exigirTodosLosTransportes={exigirTodosLosTransportes}
          onToggleExigirTodosLosTransportes={toggleExigirTodosLosTransportes}
          onCriterioChange={setCriterio}
          onSubmit={handleOptimalRoute}
        />

        <RoutesByCriteriaPanel
          selectedCriteria={selectedCriteria}
          result={criteriaResult}
          loading={loadingSection === 'criteria'}
          onToggleCriterion={toggleCriterion}
          onSubmit={handleRoutesByCriteria}
        />
      </section>

      <ItinerariesPanel
        presupuesto={presupuesto}
        tiempoHoras={tiempoHoras}
        result={itineraryResult}
        loading={loadingSection === 'itineraries'}
        onPresupuestoChange={setPresupuesto}
        onTiempoHorasChange={setTiempoHoras}
        onSubmit={handleItineraries}
      />
    </main>
  );
}

export default BasicPlannerPage;
