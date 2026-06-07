import { useEffect, useRef, useState } from 'react';
import ForceGraph3D from 'force-graph';
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
  aircraft: string[];
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
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  useEffect(() => {
    if (!containerRef.current || airports.length === 0) return;

    // Prepare nodes
    const nodes: GraphNode[] = airports.map((airport) => ({
      id: airport.id,
      name: airport.id,
      isHub: airport.esHub || false,
      val: airport.esHub ? 12 : 8,
      color: airport.esHub ? '#f59e0b' : '#3b82f6',
    }));

    // Prepare links
    const links: GraphLink[] = routes.map((route) => ({
      source: route.origen,
      target: route.destino,
      distance: route.distanciaKm || 0,
      aircraft: route.aeronaves || [],
      cost: route.costoBase || 0,
    }));

    const graphData = {
      nodes,
      links,
    };

    if (!containerRef.current) return;

    // Create force-graph instance
    // ForceGraph3D's type may require using `new` in TypeScript builds.
    // Cast to any to call as a function after instantiation.
    const GraphFactory: any = ForceGraph3D;
    const graph = new GraphFactory()(containerRef.current)
      .graphData(graphData)
      .nodeId('id')
      .nodeVal('val')
      .nodeColor((node: any) => node.color)
      .nodeLabel((node: any) => `${node.id}`)
      .linkSource('source')
      .linkTarget('target')
      .linkLabel((link: any) => `${link.distance} km · $${link.cost}`)
      .linkWidth(1.5)
      .linkColor(() => 'rgba(100, 150, 200, 0.4)')
      .linkOpacity(0.7)
      .linkDirectionalParticles(2)
      .linkDirectionalParticleWidth(1.5)
      .linkDirectionalParticleSpeed((link: any) => (link.distance || 500) * 0.00001)
      .linkDirectionalArrowLength(4)
      .linkDirectionalArrowRelPos(1)
      .onNodeClick((node: any) => {
        setSelectedNode(node.id);
        const airport = airports.find((a) => a.id === node.id);
        if (airport) {
          onAirportSelect(airport);
        }
      })
      .onLinkClick((link: any) => {
        const route = routes.find(
          (r) => r.origen === link.source.id && r.destino === link.target.id
        );
        if (route) {
          onRouteSelect(route);
        }
      })
      .onBackgroundClick(() => {
        setSelectedNode(null);
        onAirportSelect(null);
        onRouteSelect(null);
      });

    // Camera positioning
    const canvas = containerRef.current.querySelector('canvas') as HTMLCanvasElement;
    if (canvas) {
      // Set initial distance based on number of nodes
      const distance = Math.min(1000, Math.max(300, airports.length * 15));
      graph.cameraPosition({ z: distance });
    }

    graphRef.current = graph;

    return () => {
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
          <p>Interactúa con el grafo: haz clic en nodos para ver detalles y arrastra para rotar.</p>
        </div>
      </div>

      <div className="graph-visualization-container">
        <div ref={containerRef} className="graph-canvas" />
        <div className="graph-legend">
          <div className="legend-item hub">
            <span className="legend-dot" />
            <span>Aeropuerto Hub</span>
          </div>
          <div className="legend-item secondary">
            <span className="legend-dot" />
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
