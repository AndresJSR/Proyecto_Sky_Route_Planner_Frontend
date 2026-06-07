import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import type {
  AirportSummary,
  NetworkSummary,
  RouteDto,
} from '../../../../models/skyroute/graph.types';
import type {
  ItineraryAlternative,
  PlannerCriterionInput,
  RouteResult,
  RoutesByCriteriaData,
  TransportType,
} from '../../../../models/skyroute/planner.types';
import { graphRepository } from '../../../../services/skyroute/graphRepository';
import { plannerRepository } from '../../../../services/skyroute/plannerRepository';
import { selectedTransportsOrNull } from '../utils/plannerFormatters';
import { buildTransportUsageValidation } from '../utils/transportValidation';

type LoadingSection = 'optimal' | 'criteria' | 'itineraries' | null;

export function useBasicPlannerPage() {
  const [summary, setSummary] = useState<NetworkSummary | null>(null);
  const [airports, setAirports] = useState<AirportSummary[]>([]);
  const [routes, setRoutes] = useState<RouteDto[]>([]);
  const [graphLoading, setGraphLoading] = useState(false);
  const [graphError, setGraphError] = useState<string | null>(null);

  const [origen, setOrigen] = useState('BOG');
  const [destino, setDestino] = useState('SCL');
  const [criterio, setCriterio] = useState<PlannerCriterionInput>('costo');
  const [incluirSecundarios, setIncluirSecundarios] = useState(true);

  const [selectedTransports, setSelectedTransports] = useState<TransportType[]>(
    [],
  );

  /**
   * R2:
   * Cuando está activo, el backend debe calcular una ruta que use
   * al menos una vez cada transporte seleccionado.
   *
   * Nota:
   * Esto solo aplica a ruta óptima.
   */
  const [exigirTodosLosTransportes, setExigirTodosLosTransportes] =
    useState(false);

  const [selectedCriteria, setSelectedCriteria] = useState<
    PlannerCriterionInput[]
  >(['costo', 'tiempo', 'distancia']);

  const [presupuesto, setPresupuesto] = useState(700);
  const [tiempoHoras, setTiempoHoras] = useState(72);

  const [optimalResult, setOptimalResult] = useState<
    RouteResult | null | undefined
  >(undefined);

  const [criteriaResult, setCriteriaResult] =
    useState<RoutesByCriteriaData | null>(null);

  const [itineraryResult, setItineraryResult] = useState<
    ItineraryAlternative[]
  >([]);

  const [loadingSection, setLoadingSection] = useState<LoadingSection>(null);
  const [plannerError, setPlannerError] = useState<string | null>(null);

  const airportCodes = useMemo(
    () => airports.map((airport) => airport.id),
    [airports],
  );

  const optimalTransportValidation = useMemo(
    () => buildTransportUsageValidation(selectedTransports, optimalResult),
    [selectedTransports, optimalResult],
  );

  useEffect(() => {
    async function loadGraphData() {
      try {
        setGraphLoading(true);
        setGraphError(null);

        const [summaryData, airportData, routeData] = await Promise.all([
          graphRepository.getNetworkSummary(),
          graphRepository.listAirports(false),
          graphRepository.listRoutes(true),
        ]);

        setSummary(summaryData);
        setAirports(airportData);
        setRoutes(routeData);
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : 'No se pudo cargar la información del grafo.';

        setGraphError(message);
      } finally {
        setGraphLoading(false);
      }
    }

    loadGraphData();
  }, []);

  function toggleTransport(transport: TransportType) {
    setSelectedTransports((current) =>
      current.includes(transport)
        ? current.filter((item) => item !== transport)
        : [...current, transport],
    );
  }

  function toggleCriterion(option: PlannerCriterionInput) {
    setSelectedCriteria((current) =>
      current.includes(option)
        ? current.filter((item) => item !== option)
        : [...current, option],
    );
  }

  function toggleExigirTodosLosTransportes() {
    setExigirTodosLosTransportes((current) => !current);
  }

  async function handleOptimalRoute(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setPlannerError(null);
      setLoadingSection('optimal');

      const result = await plannerRepository.calculateOptimalRoute(
        origen.trim().toUpperCase(),
        destino.trim().toUpperCase(),
        criterio,
        incluirSecundarios,
        selectedTransportsOrNull(selectedTransports),
        exigirTodosLosTransportes,
      );

      setOptimalResult(result);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'No se pudo calcular la ruta óptima.';

      setPlannerError(message);
      setOptimalResult(null);
    } finally {
      setLoadingSection(null);
    }
  }

  async function handleRoutesByCriteria(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (selectedCriteria.length === 0) {
      setPlannerError('Selecciona al menos un criterio.');
      return;
    }

    try {
      setPlannerError(null);
      setLoadingSection('criteria');

      const result = await plannerRepository.calculateRoutesByCriteria(
        origen.trim().toUpperCase(),
        destino.trim().toUpperCase(),
        selectedCriteria,
        incluirSecundarios,
        selectedTransportsOrNull(selectedTransports),
      );

      setCriteriaResult(result);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'No se pudieron calcular las rutas por criterios.';

      setPlannerError(message);
      setCriteriaResult(null);
    } finally {
      setLoadingSection(null);
    }
  }

  async function handleItineraries(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setPlannerError(null);
      setLoadingSection('itineraries');

      const result = await plannerRepository.proposeItineraries(
        origen.trim().toUpperCase(),
        presupuesto,
        tiempoHoras,
        incluirSecundarios,
        selectedTransportsOrNull(selectedTransports),
      );

      setItineraryResult(result);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'No se pudieron proponer itinerarios.';

      setPlannerError(message);
      setItineraryResult([]);
    } finally {
      setLoadingSection(null);
    }
  }

  return {
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
    setExigirTodosLosTransportes,
    setPresupuesto,
    setTiempoHoras,

    toggleTransport,
    toggleCriterion,
    toggleExigirTodosLosTransportes,
    handleOptimalRoute,
    handleRoutesByCriteria,
    handleItineraries,
  };
}
