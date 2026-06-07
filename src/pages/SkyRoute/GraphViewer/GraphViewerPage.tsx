import { GraphVisualizationPanel } from './components/GraphVisualizationPanel';
import { AirportDetailsPanel } from './components/AirportDetailsPanel';
import { RouteDetailsPanel } from './components/RouteDetailsPanel';
import { useGraphViewer } from './hooks/useGraphViewer';
import { Button } from '../../../components/ui';
import './GraphViewerPage.css';

export default function GraphViewerPage() {
  const {
    summary,
    airports,
    routes,
    loading,
    error,
    selectedAirport,
    selectedRoute,
    setSelectedAirport,
    setSelectedRoute,
    filterHubsOnly,
    setFilterHubsOnly,
  } = useGraphViewer();

  const handleToggleHubsFilter = () => {
    setFilterHubsOnly(!filterHubsOnly);
    setSelectedAirport(null);
    setSelectedRoute(null);
  };

  const handleResetSelection = () => {
    setSelectedAirport(null);
    setSelectedRoute(null);
  };

  return (
    <main className="sr-graph-viewer-page">
      <section className="sr-graph-toolbar">
        <div>
          <span>SkyPlanner</span>
          <h1>Visualización de la red aérea</h1>
        </div>

        <div className="sr-graph-toolbar__stats">
          <div>
            <small>Aeropuertos</small>
            <strong>{summary?.total_aeropuertos ?? airports.length}</strong>
          </div>

          <div>
            <small>Rutas</small>
            <strong>{summary?.total_rutas ?? routes.length}</strong>
          </div>

          <div>
            <small>Hubs</small>
            <strong>{summary?.total_hubs ?? 0}</strong>
          </div>
        </div>
      </section>

      <section className="sr-graph-area">
        <GraphVisualizationPanel
          airports={airports}
          routes={routes}
          loading={loading}
          error={error}
          onAirportSelect={setSelectedAirport}
          onRouteSelect={setSelectedRoute}
        />
      </section>

      <section className="sr-graph-details-row">
        <div className="sr-graph-actions">
          <Button
            variant={filterHubsOnly ? 'primary' : 'secondary'}
            size="sm"
            onClick={handleToggleHubsFilter}
          >
            {filterHubsOnly ? 'Mostrando hubs' : 'Mostrar solo hubs'}
          </Button>

          <Button variant="secondary" size="sm" onClick={handleResetSelection}>
            Limpiar selección
          </Button>
        </div>

        <div className="sr-graph-details-content">
          {selectedRoute ? (
            <RouteDetailsPanel route={selectedRoute} />
          ) : (
            <AirportDetailsPanel airport={selectedAirport} />
          )}
        </div>
      </section>
    </main>
  );
}
