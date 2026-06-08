import './ReportsPage.css';

import { Card, Spinner } from '../../../components/ui';
import ReportActions from './components/ReportActions';
import ReportEmptyState from './components/ReportEmptyState';
import ReportSummaryCards from './components/ReportSummaryCards';
import ReportTableSection from './components/ReportTableSection';
import { useReportsPage } from './hooks/useReportsPage';
import type {
  DetailedActivityRow,
  DetailedDestinationRow,
  DetailedFlightRow,
  DetailedJobRow,
} from './types/reportView.types';
import {
  formatHoursFromMinutes,
  formatMoney,
  formatNullableDistance,
  formatNumber,
} from './utils/reportFormatters';

export function ReportsPage() {
  const {
    travelerState,
    detailedReport,

    loadingDetails,
    loadingReport,
    exporting,
    error,
    reportStatus,

    refreshState,
    generateReport,
    exportReport,
  } = useReportsPage();

  const summary = detailedReport?.resumen ?? null;
  const destinationsRows = detailedReport?.destinos ?? [];
  const flightsRows = detailedReport?.vuelos ?? [];
  const activitiesRows = detailedReport?.actividades ?? [];
  const jobsRows = detailedReport?.trabajos ?? [];

  return (
    <main className="sr-reports-page">
      <section className="sr-reports-hero">
        <div>
          <span className="sr-reports-eyebrow">SkyRoute Planner</span>

          <h1>Reporte final del viaje</h1>

          <p>
            Consolida destinos, tramos, actividades y trabajos realizados con
            totales y exportación del resultado final.
          </p>
        </div>

        <ReportActions
          hasTravelerState={Boolean(travelerState)}
          loadingReport={loadingReport}
          loadingDetails={loadingDetails}
          exporting={exporting}
          onRefreshState={refreshState}
          onGenerateReport={generateReport}
          onExportReport={exportReport}
        />
      </section>

      {error && (
        <div className="sr-reports-alert sr-reports-alert--error">{error}</div>
      )}

      {reportStatus && !error && (
        <div className="sr-reports-alert sr-reports-alert--success">
          {reportStatus}
        </div>
      )}

      {!travelerState ? (
        <ReportEmptyState />
      ) : (
        <>
          <ReportSummaryCards summary={summary} />

          {loadingDetails && (
            <Card className="sr-reports-empty">
              <h2>Construyendo detalle del reporte</h2>

              <p>
                Estamos consultando aeropuertos y rutas para enriquecer la
                visualización final.
              </p>

              <Spinner size="md" />
            </Card>
          )}

          <section className="sr-reports-table-grid">
            <ReportTableSection<DetailedDestinationRow>
              title="Destinos visitados"
              data={destinationsRows}
              loading={loadingDetails}
              emptyMessage="No hay destinos registrados."
              keyExtractor={(row, index) => `${row.aeropuerto}-${index}`}
              columns={[
                { key: 'aeropuerto', label: 'Aeropuerto' },
                { key: 'nombreAeropuerto', label: 'Nombre' },
                { key: 'ciudad', label: 'Ciudad' },
                { key: 'pais', label: 'País' },
                {
                  key: 'tiempoEstadiaMin',
                  label: 'Tiempo de estadía',
                  render: (value) => `${formatNumber(Number(value))} min`,
                },
                {
                  key: 'alojamiento',
                  label: 'Alojamiento',
                  render: (value) => formatMoney(Number(value)),
                },
                {
                  key: 'alimentacion',
                  label: 'Alimentación',
                  render: (value) => formatMoney(Number(value)),
                },
                {
                  key: 'costoTotal',
                  label: 'Costo total incurrido',
                  render: (value) => formatMoney(Number(value)),
                },
              ]}
            />

            <ReportTableSection<DetailedFlightRow>
              title="Tramos volados"
              data={flightsRows}
              loading={loadingDetails}
              emptyMessage="No hay tramos registrados."
              keyExtractor={(row, index) =>
                `${row.origen}-${row.destino}-${index}`
              }
              columns={[
                { key: 'origen', label: 'Origen' },
                { key: 'destino', label: 'Destino' },
                { key: 'aeronave', label: 'Aeronave' },
                {
                  key: 'distanciaKm',
                  label: 'Distancia',
                  render: (value) =>
                    formatNullableDistance(
                      typeof value === 'number' ? value : null,
                    ),
                },
                {
                  key: 'tiempoVueloMin',
                  label: 'Tiempo de vuelo',
                  render: (value) => `${formatNumber(Number(value))} min`,
                },
                {
                  key: 'costoTramo',
                  label: 'Costo del tramo',
                  render: (value) => formatMoney(Number(value)),
                },
              ]}
            />

            <ReportTableSection<DetailedActivityRow>
              title="Actividades realizadas"
              data={activitiesRows}
              loading={loadingDetails}
              emptyMessage="No hay actividades registradas."
              keyExtractor={(row, index) => `${row.nombre}-${index}`}
              columns={[
                { key: 'nombre', label: 'Nombre' },
                { key: 'tipo', label: 'Tipo' },
                {
                  key: 'aeropuerto',
                  label: 'Aeropuerto',
                  render: (value) => String(value || 'N/D'),
                },
                {
                  key: 'tiempoMin',
                  label: 'Tiempo',
                  render: (value) => `${formatNumber(Number(value))} min`,
                },
                {
                  key: 'costo',
                  label: 'Costo',
                  render: (value) => formatMoney(Number(value)),
                },
              ]}
            />

            <ReportTableSection<DetailedJobRow>
              title="Trabajos realizados"
              data={jobsRows}
              loading={loadingDetails}
              emptyMessage="No hay trabajos registrados."
              keyExtractor={(row, index) => `${row.nombre}-${index}`}
              columns={[
                { key: 'nombre', label: 'Nombre del trabajo' },
                {
                  key: 'horasTrabajadas',
                  label: 'Horas trabajadas',
                  render: (value) => formatHoursFromMinutes(Number(value) * 60),
                },
                {
                  key: 'ingresoObtenido',
                  label: 'Ingreso obtenido',
                  render: (value) => formatMoney(Number(value)),
                },
              ]}
            />
          </section>
        </>
      )}
    </main>
  );
}

export default ReportsPage;
