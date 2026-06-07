import { useCallback, useEffect, useMemo, useState } from 'react';
import type {
  AirportDetail,
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
  detailLoading: boolean;
  error: string | null;
  detailError: string | null;

  selectedAirport: AirportDetail | null;
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
  const [detailLoading, setDetailLoading] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [detailError, setDetailError] = useState<string | null>(null);

  const [selectedAirportDetail, setSelectedAirportDetail] =
    useState<AirportDetail | null>(null);

  const [selectedRoute, setSelectedRouteState] = useState<RouteDto | null>(
    null,
  );

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

  const setSelectedAirport = useCallback(
    async (airport: AirportSummary | null) => {
      setSelectedRouteState(null);
      setDetailError(null);

      if (!airport) {
        setSelectedAirportDetail(null);
        return;
      }

      try {
        setDetailLoading(true);

        const detail = await graphRepository.getAirportInfo(airport.id);

        setSelectedAirportDetail(detail);
      } catch (detailFetchError) {
        const message =
          detailFetchError instanceof Error
            ? detailFetchError.message
            : 'No se pudo cargar el detalle del aeropuerto.';

        setDetailError(message);

        setSelectedAirportDetail({
          ...airport,
          costoAlojamiento: 0,
          costoAlimentacion: 0,
          aerolineas: [],
          actividades: [],
          trabajos: [],
          gradoSalida: 0,
          gradoEntrada: 0,
        });
      } finally {
        setDetailLoading(false);
      }
    },
    [],
  );

  const setSelectedRoute = useCallback((route: RouteDto | null) => {
    setSelectedAirportDetail(null);
    setDetailError(null);
    setSelectedRouteState(route);
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
    detailLoading,
    error,
    detailError,

    selectedAirport: selectedAirportDetail,
    selectedRoute,

    setSelectedAirport,
    setSelectedRoute,

    filterHubsOnly,
    setFilterHubsOnly,
  };
}
