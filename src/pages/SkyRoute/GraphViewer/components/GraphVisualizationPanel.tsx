import { useEffect, useMemo, useRef, useState } from 'react';
import cytoscape from 'cytoscape';
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
  highlightRoute?: RouteDto | null;
  onAirportSelect: (airport: AirportSummary | null) => void;
  onRouteSelect: (route: RouteDto | null) => void;
}

type GraphPopupData =
  | {
      type: 'airport';
      airport: AirportSummary;
    }
  | {
      type: 'route';
      route: RouteDto;
    }
  | null;

/**
 * Parámetros principales del grafo.
 *
 * layoutName:
 * - 'circle'       → seguro para probar que el grafo renderiza.
 * - 'grid'         → ordenado en grilla.
 * - 'concentric'   → hubs/centrales más al centro.
 * - 'breadthfirst' → jerárquico.
 * - 'cose'         → automático tipo fuerza, más bonito pero más pesado.
 */
const CY_GRAPH_CONFIG = {
  layoutName: 'circle',

  minZoom: 0.35,
  maxZoom: 2.5,

  hubNodeSize: 40,
  secondaryNodeSize: 30,

  routeWidth: 3,
  blockedRouteWidth: 5,

  layoutPadding: 80,
};

function getNumberValue(source: unknown, keys: string[]): number {
  if (!source || typeof source !== 'object') return 0;

  const data = source as Record<string, unknown>;

  for (const key of keys) {
    const value = data[key];

    if (typeof value === 'number') {
      return value;
    }
  }

  return 0;
}

export function GraphVisualizationPanel({
  airports,
  routes,
  loading,
  error,
  highlightRoute,
  onAirportSelect,
  onRouteSelect,
}: GraphVisualizationPanelProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const cyRef = useRef<cytoscape.Core | null>(null);

  const onAirportSelectRef = useRef(onAirportSelect);
  const onRouteSelectRef = useRef(onRouteSelect);

  const [popupData, setPopupData] = useState<GraphPopupData>(null);

  useEffect(() => {
    onAirportSelectRef.current = onAirportSelect;
    onRouteSelectRef.current = onRouteSelect;
  }, [onAirportSelect, onRouteSelect]);

  const elements = useMemo(() => {
    const airportIds = new Set(airports.map((airport) => airport.id));

    const nodes = airports.map((airport) => ({
      data: {
        id: airport.id,
        label: airport.id,
        airport,
      },
      classes: airport.esHub ? 'hub' : 'secondary',
    }));

    const validRoutes = routes.filter(
      (route) => airportIds.has(route.origen) && airportIds.has(route.destino),
    );

    const edges = validRoutes.map((route, index) => ({
      data: {
        id: `${route.origen}-${route.destino}-${index}`,
        source: route.origen,
        target: route.destino,
        label: `${route.origen} → ${route.destino}`,
        route,
        distance: getNumberValue(route, ['distanciaKm', 'distancia_km']),
        cost: getNumberValue(route, ['costoBase', 'costo_base']),
        blocked: Boolean(route.bloqueada),
      },
      classes: route.bloqueada ? 'blocked-route' : 'normal-route',
    }));

    return [...nodes, ...edges];
  }, [airports, routes]);

  useEffect(() => {
    if (!containerRef.current || airports.length === 0) return;

    if (cyRef.current) {
      cyRef.current.removeAllListeners();
      cyRef.current.destroy();
      cyRef.current = null;
    }

    const container = containerRef.current;

    const cy = cytoscape({
      container,
      elements,

      minZoom: CY_GRAPH_CONFIG.minZoom,
      maxZoom: CY_GRAPH_CONFIG.maxZoom,

      boxSelectionEnabled: false,
      autoungrabify: false,
      autounselectify: false,

      layout: {
        name: CY_GRAPH_CONFIG.layoutName,
        fit: true,
        padding: CY_GRAPH_CONFIG.layoutPadding,
      },

      style: [
        {
          selector: 'node',
          style: {
            label: 'data(label)',
            width: CY_GRAPH_CONFIG.secondaryNodeSize,
            height: CY_GRAPH_CONFIG.secondaryNodeSize,
            'background-color': '#4f46e5',
            'border-color': '#ffffff',
            'border-width': 3,
            color: '#0f172a',
            'font-size': 13,
            'font-weight': 700,
            'text-valign': 'top',
            'text-halign': 'center',
            'text-margin-y': -10,
            'text-outline-color': '#ffffff',
            'text-outline-width': 3,
          },
        },
        {
          selector: 'node.hub',
          style: {
            width: CY_GRAPH_CONFIG.hubNodeSize,
            height: CY_GRAPH_CONFIG.hubNodeSize,
            'background-color': '#f59e0b',
          },
        },
        {
          selector: 'edge',
          style: {
            width: CY_GRAPH_CONFIG.routeWidth,
            'line-color': 'rgba(71, 85, 105, 0.55)',
            'target-arrow-color': 'rgba(71, 85, 105, 0.8)',
            'target-arrow-shape': 'triangle',
            'curve-style': 'bezier',
            'arrow-scale': 1.1,
          },
        },
        {
          selector: 'edge.blocked-route',
          style: {
            width: CY_GRAPH_CONFIG.blockedRouteWidth,
            'line-color': 'rgba(220, 38, 38, 0.8)',
            'target-arrow-color': 'rgba(220, 38, 38, 0.95)',
          },
        },
        {
          selector: 'node:selected',
          style: {
            'border-color': '#2563eb',
            'border-width': 5,
          },
        },
        {
          selector: 'edge:selected',
          style: {
            width: 7,
            'line-color': '#2563eb',
            'target-arrow-color': '#2563eb',
          },
        },
        {
          selector: 'edge.highlighted',
          style: {
            width: 8,
            'line-color': '#10b981',
            'target-arrow-color': '#10b981',
            'transition-property': 'line-color, width',
            'transition-duration': '200ms',
          },
        },
      ],
    });

    cyRef.current = cy;

    cy.on('tap', 'node', (event) => {
      const airport = event.target.data('airport') as AirportSummary;

      setPopupData({
        type: 'airport',
        airport,
      });

      onRouteSelectRef.current(null);
      onAirportSelectRef.current(airport);
    });

    cy.on('tap', 'edge', (event) => {
      const route = event.target.data('route') as RouteDto;

      setPopupData({
        type: 'route',
        route,
      });

      onAirportSelectRef.current(null);
      onRouteSelectRef.current(route);
    });

    cy.on('tap', (event) => {
      if (event.target !== cy) return;

      setPopupData(null);
      onAirportSelectRef.current(null);
      onRouteSelectRef.current(null);
    });

    window.setTimeout(() => {
      cy.resize();

      cy.layout({
        name: CY_GRAPH_CONFIG.layoutName,
        fit: true,
        padding: CY_GRAPH_CONFIG.layoutPadding,
      }).run();
    }, 120);

    return () => {
      cy.removeAllListeners();
      cy.destroy();
      cyRef.current = null;
    };
  }, [airports.length, elements]);

  useEffect(() => {
    if (!cyRef.current || !routes.length) return;

    cyRef.current.edges().removeClass('highlighted');

    if (!highlightRoute) return;

    cyRef.current
      .edges()
      .filter((edge) => {
        const route = edge.data('route') as RouteDto;
        return (
          route.origen === highlightRoute.origen &&
          route.destino === highlightRoute.destino
        );
      })
      .addClass('highlighted')
      .select();
  }, [highlightRoute, routes.length]);

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
          <p>
            Arrastra para moverte, usa la rueda para hacer zoom y haz clic en un
            aeropuerto o ruta para ver sus detalles.
          </p>
        </div>
      </div>

      <div className="graph-visualization-container">
        {popupData && (
          <div className="graph-popup">
            <button
              type="button"
              className="graph-popup__close"
              onClick={() => setPopupData(null)}
            >
              ×
            </button>

            {popupData.type === 'airport' ? (
              <>
                <span className="graph-popup__eyebrow">Aeropuerto</span>
                <h3>{popupData.airport.id}</h3>
                <p>{popupData.airport.nombre}</p>

                <div className="graph-popup__grid">
                  <div>
                    <small>Ciudad</small>
                    <strong>{popupData.airport.ciudad}</strong>
                  </div>

                  <div>
                    <small>País</small>
                    <strong>{popupData.airport.pais}</strong>
                  </div>

                  <div>
                    <small>Tipo</small>
                    <strong>
                      {popupData.airport.esHub ? 'Hub' : 'Secundario'}
                    </strong>
                  </div>
                </div>
              </>
            ) : (
              <>
                <span className="graph-popup__eyebrow">Ruta aérea</span>
                <h3>
                  {popupData.route.origen} → {popupData.route.destino}
                </h3>

                <div className="graph-popup__grid">
                  <div>
                    <small>Distancia</small>
                    <strong>
                      {getNumberValue(popupData.route, [
                        'distanciaKm',
                        'distancia_km',
                      ])}{' '}
                      km
                    </strong>
                  </div>

                  <div>
                    <small>Costo base</small>
                    <strong>
                      $
                      {getNumberValue(popupData.route, [
                        'costoBase',
                        'costo_base',
                      ])}
                    </strong>
                  </div>

                  <div>
                    <small>Estado</small>
                    <strong>
                      {popupData.route.bloqueada ? 'Bloqueada' : 'Activa'}
                    </strong>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        <div ref={containerRef} className="graph-cytoscape-canvas" />

        <div className="graph-legend">
          <div className="legend-item">
            <span className="legend-dot legend-dot--hub" />
            <span>Aeropuerto Hub</span>
          </div>

          <div className="legend-item">
            <span className="legend-dot legend-dot--secondary" />
            <span>Aeropuerto Secundario</span>
          </div>

          <div className="legend-item">
            <span className="legend-line" />
            <span>Ruta aérea</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
