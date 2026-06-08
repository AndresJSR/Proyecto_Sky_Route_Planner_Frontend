import { useEffect, useRef } from 'react';
import type { MutableRefObject } from 'react';
import type cytoscape from 'cytoscape';
import type { RouteDto } from '../../../../models/skyroute/graph.types';

interface UseTravelAnimationParams {
  cyRef: MutableRefObject<cytoscape.Core | null>;
  highlightRoute?: RouteDto | null;
  traveledRoutesCount: number;
  enabled: boolean;
}

type Point = {
  x: number;
  y: number;
};

const TRAVELER_MARKER_ID = 'skyroute-traveler-marker';
const TRAVEL_ANIMATION_DURATION_MS = 1800;
const ANIMATION_START_DELAY_MS = 180;

function getRouteKey(route: RouteDto): string {
  return `${route.origen}-${route.destino}`;
}

function isSameRoute(routeA: RouteDto, routeB: RouteDto): boolean {
  return routeA.origen === routeB.origen && routeA.destino === routeB.destino;
}

function easeInOutCubic(value: number): number {
  return value < 0.5
    ? 4 * value * value * value
    : 1 - Math.pow(-2 * value + 2, 3) / 2;
}

function removeTravelerMarker(container: HTMLElement | null): void {
  if (!container) return;

  const marker = container.querySelector(`#${TRAVELER_MARKER_ID}`);

  if (marker) {
    marker.remove();
  }
}

function createTravelerMarker(container: HTMLElement): HTMLDivElement {
  removeTravelerMarker(container);

  const marker = document.createElement('div');

  marker.id = TRAVELER_MARKER_ID;
  marker.textContent = '✈︎';

  marker.style.position = 'absolute';
  marker.style.left = '0px';
  marker.style.top = '0px';
  marker.style.zIndex = '100';
  marker.style.pointerEvents = 'none';
  marker.style.userSelect = 'none';

  marker.style.width = '34px';
  marker.style.height = '34px';
  marker.style.display = 'flex';
  marker.style.alignItems = 'center';
  marker.style.justifyContent = 'center';

  marker.style.color = '#f8fafc';
  marker.style.fontSize = '30px';
  marker.style.lineHeight = '1';
  marker.style.textShadow =
    '0 0 4px #10b981, 0 0 10px #10b981, 0 0 18px #10b981';

  marker.style.transformOrigin = 'center center';

  container.appendChild(marker);

  return marker;
}

function getQuadraticBezierPoint(
  start: Point,
  control: Point,
  end: Point,
  progress: number,
): Point {
  const inverseProgress = 1 - progress;

  return {
    x:
      inverseProgress * inverseProgress * start.x +
      2 * inverseProgress * progress * control.x +
      progress * progress * end.x,
    y:
      inverseProgress * inverseProgress * start.y +
      2 * inverseProgress * progress * control.y +
      progress * progress * end.y,
  };
}

function getQuadraticBezierAngle(
  start: Point,
  control: Point,
  end: Point,
  progress: number,
): number {
  const inverseProgress = 1 - progress;

  const dx =
    2 * inverseProgress * (control.x - start.x) +
    2 * progress * (end.x - control.x);

  const dy =
    2 * inverseProgress * (control.y - start.y) +
    2 * progress * (end.y - control.y);

  return Math.atan2(dy, dx) * (180 / Math.PI);
}

function getFallbackMidpoint(start: Point, end: Point): Point {
  return {
    x: (start.x + end.x) / 2,
    y: (start.y + end.y) / 2,
  };
}

function getEdgeRenderedMidpoint(edge: cytoscape.EdgeSingular): Point | null {
  const edgeWithMidpoint = edge as cytoscape.EdgeSingular & {
    renderedMidpoint?: () => Point;
  };

  if (typeof edgeWithMidpoint.renderedMidpoint === 'function') {
    return edgeWithMidpoint.renderedMidpoint();
  }

  return null;
}

/**
 * Si M es el punto medio real de la curva en t = 0.5:
 * M = 0.25S + 0.5C + 0.25E
 *
 * Despejando:
 * C = 2M - 0.5S - 0.5E
 */
function getControlPointFromRenderedMidpoint(
  start: Point,
  midpoint: Point,
  end: Point,
): Point {
  return {
    x: 2 * midpoint.x - 0.5 * start.x - 0.5 * end.x,
    y: 2 * midpoint.y - 0.5 * start.y - 0.5 * end.y,
  };
}

function findRenderedRouteEdge(
  cy: cytoscape.Core,
  routeToAnimate: RouteDto,
): cytoscape.EdgeSingular | null {
  const matchingEdges = cy.edges().filter((edge) => {
    const route = edge.data('route') as RouteDto | undefined;

    if (!route) return false;

    return isSameRoute(route, routeToAnimate);
  });

  if (matchingEdges.length === 0) {
    return null;
  }

  return matchingEdges[0] as cytoscape.EdgeSingular;
}

export function useTravelAnimation({
  cyRef,
  highlightRoute,
  traveledRoutesCount,
  enabled,
}: UseTravelAnimationParams) {
  const animationFrameRef = useRef<number | null>(null);
  const timeoutRef = useRef<number | null>(null);
  const lastAnimationKeyRef = useRef<string | null>(null);

  useEffect(() => {
    const cy = cyRef.current;

    if (!cy || cy.destroyed()) {
      return;
    }

    const container = cy.container();

    if (!container) {
      return;
    }

    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    if (animationFrameRef.current !== null) {
      window.cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    if (!enabled || !highlightRoute) {
      removeTravelerMarker(container);
      lastAnimationKeyRef.current = null;
      return;
    }

    const animationKey = `${getRouteKey(
      highlightRoute,
    )}-${traveledRoutesCount}`;

    if (lastAnimationKeyRef.current === animationKey) {
      return;
    }

    lastAnimationKeyRef.current = animationKey;

    timeoutRef.current = window.setTimeout(() => {
      if (cy.destroyed()) return;

      const sourceNode = cy.getElementById(highlightRoute.origen);
      const targetNode = cy.getElementById(highlightRoute.destino);
      const routeEdge = findRenderedRouteEdge(cy, highlightRoute);

      if (
        sourceNode.length === 0 ||
        targetNode.length === 0 ||
        routeEdge === null
      ) {
        console.warn(
          'No se pudo animar el viajero. Ruta o nodos no encontrados.',
          {
            origen: highlightRoute.origen,
            destino: highlightRoute.destino,
          },
        );
        return;
      }

      const startPosition = sourceNode.renderedPosition();
      const endPosition = targetNode.renderedPosition();

      const renderedMidpoint =
        getEdgeRenderedMidpoint(routeEdge) ??
        getFallbackMidpoint(startPosition, endPosition);

      const controlPosition = getControlPointFromRenderedMidpoint(
        startPosition,
        renderedMidpoint,
        endPosition,
      );

      const travelerMarker = createTravelerMarker(container);
      const animationStart = performance.now();

      const animateTraveler = (timestamp: number) => {
        if (cy.destroyed()) return;

        const elapsed = timestamp - animationStart;
        const progress = Math.min(elapsed / TRAVEL_ANIMATION_DURATION_MS, 1);
        const easedProgress = easeInOutCubic(progress);

        const position = getQuadraticBezierPoint(
          startPosition,
          controlPosition,
          endPosition,
          easedProgress,
        );

        const angle = getQuadraticBezierAngle(
          startPosition,
          controlPosition,
          endPosition,
          easedProgress,
        );

        travelerMarker.style.left = `${position.x}px`;
        travelerMarker.style.top = `${position.y}px`;
        travelerMarker.style.transform = `translate(-50%, -50%) rotate(${angle}deg)`;

        if (progress < 1) {
          animationFrameRef.current =
            window.requestAnimationFrame(animateTraveler);
          return;
        }

        window.setTimeout(() => {
          removeTravelerMarker(container);
        }, 350);

        animationFrameRef.current = null;
      };

      animationFrameRef.current = window.requestAnimationFrame(animateTraveler);
    }, ANIMATION_START_DELAY_MS);

    return () => {
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }

      if (animationFrameRef.current !== null) {
        window.cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [cyRef, enabled, highlightRoute, traveledRoutesCount]);
}
