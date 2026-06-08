import { useCallback, useEffect, useMemo, useState } from 'react';
import type {
  AirportDetail,
  RouteDto,
} from '../../../../models/skyroute/graph.types';
import type { TravelerState } from '../../../../models/skyroute/planner.types';
import { graphRepository } from '../../../../services/skyroute/graphRepository';
import type {
  DetailedReportData,
  ReportExportFormat,
} from '../types/reportView.types';
import { buildDetailedReport } from '../utils/reportBuilder';
import {
  createReportCsvBlob,
  createReportPdfBlob,
  downloadBlob,
} from '../utils/reportExporters';
import { readStoredTravelerState } from '../utils/reportStorage';
import {
  getStringValue,
  getTravelerFlights,
  getVisitedAirportCodes,
} from '../utils/reportAccessors';

function uniquePreserveOrder(values: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  values.forEach((value) => {
    if (!value || seen.has(value)) return;

    seen.add(value);
    result.push(value);
  });

  return result;
}

function getVisitedAirportSequence(state: TravelerState): string[] {
  const flights = getTravelerFlights(state);

  if (flights.length > 0) {
    const firstOrigin = getStringValue(flights[0], ['origen', 'origin']);

    return uniquePreserveOrder([
      firstOrigin,
      ...flights.map((flight) =>
        getStringValue(flight, ['destino', 'destination']),
      ),
      state.aeropuerto_actual,
    ]);
  }

  const visitedAirports = getVisitedAirportCodes(state);

  if (visitedAirports.length > 0) {
    return uniquePreserveOrder([...visitedAirports, state.aeropuerto_actual]);
  }

  return [state.aeropuerto_actual].filter(Boolean);
}

function buildCurrentDateTimeLabel(): string {
  return new Intl.DateTimeFormat('es-CO', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date());
}

export function useReportsPage() {
  const [travelerState, setTravelerState] = useState<TravelerState | null>(() =>
    readStoredTravelerState(),
  );

  const [airportDetailsById, setAirportDetailsById] = useState<
    Record<string, AirportDetail>
  >({});

  const [routes, setRoutes] = useState<RouteDto[]>([]);

  const [loadingDetails, setLoadingDetails] = useState(false);
  const [loadingReport, setLoadingReport] = useState(false);
  const [exporting, setExporting] = useState<ReportExportFormat | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [reportStatus, setReportStatus] = useState<string | null>(null);
  const [lastGeneratedAt, setLastGeneratedAt] = useState<string | null>(null);

  const visitedAirportSequence = useMemo(
    () => (travelerState ? getVisitedAirportSequence(travelerState) : []),
    [travelerState],
  );

  const detailedReport = useMemo<DetailedReportData | null>(() => {
    if (!travelerState) {
      return null;
    }

    return buildDetailedReport(travelerState, airportDetailsById, routes);
  }, [airportDetailsById, routes, travelerState]);

  const loadDetailedLookupsForState = useCallback(
    async (state: TravelerState) => {
      const airportIds = uniquePreserveOrder([
        ...getVisitedAirportSequence(state),
        state.aeropuerto_actual,
      ]);

      const [routesData, airportResults] = await Promise.all([
        graphRepository.listRoutes(true),
        Promise.allSettled(
          airportIds.map((airportId) =>
            graphRepository.getAirportInfo(airportId),
          ),
        ),
      ]);

      const detailsById: Record<string, AirportDetail> = {};

      airportResults.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          detailsById[airportIds[index]] = result.value;
        }
      });

      return {
        airportDetailsById: detailsById,
        routes: routesData,
      };
    },
    [],
  );

  const refreshDetailedReportForState = useCallback(
    async (state: TravelerState | null) => {
      if (!state) {
        setAirportDetailsById({});
        setRoutes([]);
        return;
      }

      try {
        setLoadingDetails(true);

        const lookups = await loadDetailedLookupsForState(state);

        setAirportDetailsById(lookups.airportDetailsById);
        setRoutes(lookups.routes);
        setError(null);
      } catch (reportError) {
        setError(
          reportError instanceof Error
            ? reportError.message
            : 'No se pudo construir el reporte detallado.',
        );
      } finally {
        setLoadingDetails(false);
      }
    },
    [loadDetailedLookupsForState],
  );

  const refreshState = useCallback(() => {
    const storedState = readStoredTravelerState();

    setTravelerState(storedState);
    setError(null);
    setReportStatus(
      storedState
        ? 'Estado del viaje actualizado desde la simulación.'
        : 'No hay estado final guardado para reportar.',
    );
  }, []);

  const generateReport = useCallback(async () => {
    const latestState = readStoredTravelerState();

    if (!latestState) {
      setError('No hay estado final de viaje para generar el reporte.');
      setReportStatus(null);
      return;
    }

    try {
      setLoadingReport(true);
      setError(null);
      setReportStatus(null);

      const lookups = await loadDetailedLookupsForState(latestState);

      setTravelerState(latestState);
      setAirportDetailsById(lookups.airportDetailsById);
      setRoutes(lookups.routes);

      const generatedAt = buildCurrentDateTimeLabel();

      setLastGeneratedAt(generatedAt);
      setReportStatus(
        `Reporte generado correctamente. Última generación: ${generatedAt}.`,
      );
    } catch (reportError) {
      setError(
        reportError instanceof Error
          ? reportError.message
          : 'No se pudo generar el reporte final.',
      );
    } finally {
      setLoadingReport(false);
    }
  }, [loadDetailedLookupsForState]);

  const exportReport = useCallback(
    async (format: ReportExportFormat) => {
      const stateToExport = travelerState ?? readStoredTravelerState();

      if (!stateToExport) {
        setError('No hay estado final de viaje para exportar.');
        return;
      }

      try {
        setExporting(format);
        setError(null);

        let reportData = detailedReport;

        if (!reportData) {
          const lookups = await loadDetailedLookupsForState(stateToExport);

          reportData = buildDetailedReport(
            stateToExport,
            lookups.airportDetailsById,
            lookups.routes,
          );
        }

        const blob =
          format === 'pdf'
            ? createReportPdfBlob(reportData)
            : createReportCsvBlob(reportData);

        downloadBlob(blob, `skyroute-reporte-final.${format}`);
      } catch (exportError) {
        setError(
          exportError instanceof Error
            ? exportError.message
            : `No se pudo exportar el archivo ${format.toUpperCase()}.`,
        );
      } finally {
        setExporting(null);
      }
    },
    [detailedReport, loadDetailedLookupsForState, travelerState],
  );

  useEffect(() => {
    void refreshDetailedReportForState(travelerState);
  }, [refreshDetailedReportForState, travelerState]);

  return {
    travelerState,
    detailedReport,

    loadingDetails,
    loadingReport,
    exporting,
    error,
    reportStatus,
    lastGeneratedAt,

    refreshState,
    generateReport,
    exportReport,
  };
}

export default useReportsPage;
