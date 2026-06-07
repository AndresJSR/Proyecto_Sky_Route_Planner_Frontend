import { PageHeader } from './components/PageHeader';
import { GraphVisualizationPanel } from './components/GraphVisualizationPanel';
import { GraphSummaryPanel } from './components/GraphSummaryPanel';
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
    <div className="sr-graph-viewer-page">
      <PageHeader />

      <section className="sr-content">
        <div className="sr-graph-container">
          <div className="sr-graph-main">
            <GraphVisualizationPanel
              airports={airports}
              routes={routes}
              loading={loading}
              error={error}
              onAirportSelect={setSelectedAirport}
              onRouteSelect={setSelectedRoute}
            />
          </div>

          <aside className="sr-graph-sidebar">
            <div className="sr-sidebar-controls">
              <Button
                variant={filterHubsOnly ? 'primary' : 'secondary'}
                size="sm"
                onClick={handleToggleHubsFilter}
              >
                {filterHubsOnly ? '✓ Mostrar Solo Hubs' : 'Mostrar Solo Hubs'}
              </Button>
              <Button variant="secondary" size="sm" onClick={handleResetSelection}>
                Limpiar selección
              </Button>
            </div>

            {selectedRoute ? (
              <RouteDetailsPanel route={selectedRoute} />
            ) : (
              <AirportDetailsPanel airport={selectedAirport} />
            )}
          </aside>
        </div>

        <GraphSummaryPanel
          summary={summary}
          airports={airports}
          routes={routes}
          loading={loading}
          error={error}
        />
      </section>
    </div>
  );
}