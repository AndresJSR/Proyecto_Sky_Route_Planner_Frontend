import { useEffect, useRef } from 'react';
import ForceGraph from 'force-graph';
import { Card, Spinner } from '../../../../components/ui';
import type {
  AirportSummary,
  RouteDto,
} from '../../../../models/skyroute/graph.types';
import './GraphVisualization.css';

interface GraphVisualizationPanelProps {
  airports: AirportSummary[];
  routes: RouteDto[];
  loading: boolean;
  error: string | null;
  onAirportSelect: (airport: AirportSummary | null) => void;
  onRouteSelect: (route: RouteDto | null) => void;
}

interface GraphNode {
  id: string;
  name: string;
  isHub: boolean;
  val: number;
  color: string;
}

interface GraphLink {
  source: string;
  target: string;
  distance: number;
  cost: number;
}

export function GraphVisualizationPanel({
  airports,
  routes,
  loading,
  error,
  onAirportSelect,
  onRouteSelect,
}: GraphVisualizationPanelProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const graphRef = useRef<any>(null);

  useEffect(() => {
    if (!containerRef.current || airports.length === 0) return;

    const container = containerRef.current;
    container.innerHTML = '';

    const nodes: GraphNode[] = airports.map((airport) => ({
      id: airport.id,
      name: airport.nombre ?? airport.id,
      isHub: airport.esHub ?? false,
      val: airport.esHub ? 7 : 4,
      color: airport.esHub ? '#f59e0b' : '#4f46e5',
    }));

    const links: GraphLink[] = routes.map((route) => ({
      source: route.origen,
      target: route.destino,
      distance: route.distanciaKm ?? route.distanciaKm ?? 0,
      cost: route.costoBase ?? route.costoBase ?? 0,
    }));

    const graph = ForceGraph()(container)
      .width(container.clientWidth)
      .height(520)
      .backgroundColor('#f8fafc')
      .graphData({ nodes, links })
      .nodeId('id')
      .nodeVal('val')
      .nodeColor((node: any) => node.color)
      .nodeLabel((node: any) =>
        node.isHub ? `${node.id} · Hub` : `${node.id} · Secundario`,
      )
      .linkSource('source')
      .linkTarget('target')
      .linkLabel((link: any) => `${link.distance} km · $${link.cost}`)
      .linkWidth(0.7)
      .linkColor(() => 'rgba(100, 116, 139, 0.25)')
      .linkDirectionalParticles(0)
      .linkDirectionalArrowLength(0)
      .onNodeClick((node: any) => {
        const airport = airports.find((item) => item.id === node.id);
        onAirportSelect(airport ?? null);
        onRouteSelect(null);
      })
      .onLinkClick((link: any) => {
        const sourceId =
          typeof link.source === 'object' ? link.source.id : link.source;
        const targetId =
          typeof link.target === 'object' ? link.target.id : link.target;

        const route = routes.find(
          (item) => item.origen === sourceId && item.destino === targetId,
        );

        onRouteSelect(route ?? null);
        onAirportSelect(null);
      })
      .onBackgroundClick(() => {
        onAirportSelect(null);
        onRouteSelect(null);
      });

    graph.d3Force('charge')?.strength(-80);
    graph.d3Force('link')?.distance(90);

    setTimeout(() => {
      graph.zoomToFit(500, 40);
    }, 600);

    graphRef.current = graph;

    return () => {
      container.innerHTML = '';
      graphRef.current = null;
    };
  }, [airports, routes, onAirportSelect, onRouteSelect]);

  if (error) {
    return (
      <Card className="sr-panel">
        <div className="sr-panel__header">
          <h2>Visualización del grafo</h2>
        </div>

        <div className="sr-alert sr-alert--error">{error}</div>
      </Card>
    );
  }

  if (loading || airports.length === 0) {
    return (
      <Card className="sr-panel">
        <div className="sr-panel__header">
          <div>
            <h2>Visualización del grafo</h2>
            <p>Cargando red aérea...</p>
          </div>

          {loading && <Spinner size="sm" />}
        </div>
      </Card>
    );
  }

  return (
    <Card className="sr-panel sr-panel--graph-viz">
      <div className="sr-panel__header">
        <div>
          <h2>Visualización del grafo</h2>
          <p>Haz clic en un aeropuerto o ruta para ver sus detalles.</p>
        </div>
      </div>

      <div className="graph-visualization-container">
        <div ref={containerRef} className="graph-canvas" />

        <div className="graph-legend">
          <div className="legend-item hub">
            <span className="legend-dot legend-dot--hub" />
            <span>Aeropuerto Hub</span>
          </div>

          <div className="legend-item secondary">
            <span className="legend-dot legend-dot--secondary" />
            <span>Aeropuerto Secundario</span>
          </div>

          <div className="legend-item route">
            <span className="legend-line" />
            <span>Ruta aérea</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
