import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import type {
  AirportSummary,
  NetworkSummary,
  RouteDto,
} from '../../../../models/skyroute/graph.types';

interface UseGraphViewerReturn {
  summary: NetworkSummary | null;
  airports: AirportSummary[];
  routes: RouteDto[];
  loading: boolean;
  error: string | null;
  selectedAirport: AirportSummary | null;
  selectedRoute: RouteDto | null;
  setSelectedAirport: (airport: AirportSummary | null) => void;
  setSelectedRoute: (route: RouteDto | null) => void;
  filterHubsOnly: boolean;
  setFilterHubsOnly: (value: boolean) => void;
}

const API_BASE = 'http://localhost:8000';

export function useGraphViewer(): UseGraphViewerReturn {
  const [summary, setSummary] = useState<NetworkSummary | null>(null);
  const [airports, setAirports] = useState<AirportSummary[]>([]);
  const [routes, setRoutes] = useState<RouteDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAirport, setSelectedAirport] = useState<AirportSummary | null>(
    null
  );
  const [selectedRoute, setSelectedRoute] = useState<RouteDto | null>(null);
  const [filterHubsOnly, setFilterHubsOnly] = useState(false);

  // Load graph data from backend
  useEffect(() => {
    const fetchGraphData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Try to load summary
        try {
          const summaryRes = await fetch(`${API_BASE}/graph/summary`);
          if (summaryRes.ok) {
            const summaryData = await summaryRes.json();
            setSummary(summaryData);
          }
        } catch (e) {
          console.warn('Failed to load graph summary');
        }

        // Load airports
        const airportRes = await fetch(`${API_BASE}/airports`);
        if (!airportRes.ok) {
          throw new Error(`Failed to load airports: ${airportRes.statusText}`);
        }
        const airportData = await airportRes.json();
        setAirports(Array.isArray(airportData) ? airportData : []);

        // Load routes
        const routeRes = await fetch(`${API_BASE}/routes`);
        if (!routeRes.ok) {
          throw new Error(`Failed to load routes: ${routeRes.statusText}`);
        }
        const routeData = await routeRes.json();
        setRoutes(Array.isArray(routeData) ? routeData : []);

        setLoading(false);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Failed to load graph data from backend'
        );
        setLoading(false);

        console.error('Error fetching graph data:', err);
      }
    };

    fetchGraphData();
  }, []);

  // Apply filters
  const filteredAirports = filterHubsOnly
    ? airports.filter((a) => a.esHub)
    : airports;

  const filteredRoutes = filterHubsOnly
    ? routes.filter(
        (r) =>
          airports
            .filter((a) => a.esHub)
            .some((a) => a.id === r.origen) &&
          airports
            .filter((a) => a.esHub)
            .some((a) => a.id === r.destino)
      )
    : routes;

  return {
    summary,
    airports: filteredAirports,
    routes: filteredRoutes,
    loading,
    error,
    selectedAirport,
    selectedRoute,
    setSelectedAirport,
    setSelectedRoute,
    filterHubsOnly,
    setFilterHubsOnly,
  };
}
