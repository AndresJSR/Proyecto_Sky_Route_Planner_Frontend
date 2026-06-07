import { useEffect, useMemo, useState } from 'react';
import type {
  AirportSummary,
  NetworkSummary,
  RouteDto,
} from '../../../../models/skyroute/graph.types';
import { graphRepository } from '../../../../services/skyroute/graphRepository';

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

export function useGraphViewer(): UseGraphViewerReturn {
  const [summary, setSummary] = useState<NetworkSummary | null>(null);
  const [airports, setAirports] = useState<AirportSummary[]>([]);
  const [routes, setRoutes] = useState<RouteDto[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedAirport, setSelectedAirport] = useState<AirportSummary | null>(
    null,
  );

  const [selectedRoute, setSelectedRoute] = useState<RouteDto | null>(null);

  const [filterHubsOnly, setFilterHubsOnly] = useState(false);

  useEffect(() => {
    async function fetchGraphData() {
      try {
        setLoading(true);
        setError(null);

        const [summaryData, airportData, routeData] = await Promise.all([
          graphRepository.getNetworkSummary(),
          graphRepository.listAirports(false),
          graphRepository.listRoutes(true),
        ]);

        setSummary(summaryData);
        setAirports(airportData);
        setRoutes(routeData);
      } catch (fetchError) {
        const message =
          fetchError instanceof Error
            ? fetchError.message
            : 'No se pudo cargar la información del grafo.';

        setError(message);
        console.error('Error fetching graph data:', fetchError);
      } finally {
        setLoading(false);
      }
    }

    fetchGraphData();
  }, []);

  const filteredAirports = useMemo(() => {
    if (!filterHubsOnly) return airports;

    return airports.filter((airport) => airport.esHub);
  }, [airports, filterHubsOnly]);

  const filteredRoutes = useMemo(() => {
    if (!filterHubsOnly) return routes;

    const hubIds = new Set(
      airports.filter((airport) => airport.esHub).map((airport) => airport.id),
    );

    return routes.filter(
      (route) => hubIds.has(route.origen) && hubIds.has(route.destino),
    );
  }, [airports, routes, filterHubsOnly]);

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
