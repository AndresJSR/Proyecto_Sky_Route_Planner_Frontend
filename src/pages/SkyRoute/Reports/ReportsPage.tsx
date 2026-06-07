import './ReportsPage.css';

import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, Card, Spinner, Table } from '../../../components/ui';
import type { TravelerState } from '../../../models/skyroute/planner.types';
import type {
    TravelReport,
    TravelReportActivity,
    TravelReportFlight,
    TravelReportJob,
    TravelStatistics,
} from '../../../models/skyroute/report.types';
import { reportRepository } from '../../../services/skyroute/reportRepository';

const LAST_TRAVELER_STATE_KEY = 'skyroute:last-traveler-state';

const moneyFormatter = new Intl.NumberFormat('es-CO', {
	style: 'currency',
	currency: 'USD',
	minimumFractionDigits: 0,
});

const numberFormatter = new Intl.NumberFormat('es-CO');

function formatMoney(value: number): string {
	return moneyFormatter.format(value ?? 0);
}

function formatNumber(value: number): string {
	return numberFormatter.format(value ?? 0);
}

function downloadBlob(blob: Blob, fileName: string): void {
	const url = window.URL.createObjectURL(blob);
	const link = document.createElement('a');

	link.href = url;
	link.download = fileName;
	document.body.appendChild(link);
	link.click();
	link.remove();

	window.URL.revokeObjectURL(url);
}

function readStoredTravelerState(): TravelerState | null {
	try {
		const rawState = localStorage.getItem(LAST_TRAVELER_STATE_KEY);
		if (!rawState) {
			return null;
		}

		const parsed = JSON.parse(rawState) as TravelerState;
		if (!parsed || !parsed.aeropuerto_actual) {
			return null;
		}

		return parsed;
	} catch (error) {
		console.warn('No fue posible leer el estado final guardado.', error);
		return null;
	}
}

export function ReportsPage() {
	const [travelerState, setTravelerState] = useState<TravelerState | null>(
		() => readStoredTravelerState(),
	);
	const [report, setReport] = useState<TravelReport | null>(null);
	const [statistics, setStatistics] = useState<TravelStatistics | null>(null);
	const [loadingReport, setLoadingReport] = useState(false);
	const [loadingStats, setLoadingStats] = useState(false);
	const [exporting, setExporting] = useState<'pdf' | 'csv' | null>(null);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		let cancelled = false;

		const loadStatistics = async () => {
			try {
				setLoadingStats(true);
				const stats = await reportRepository.getStatistics();

				if (!cancelled) {
					setStatistics(stats);
				}
			} catch (statsError) {
				console.warn('No fue posible cargar estadísticas globales.', statsError);
			} finally {
				if (!cancelled) {
					setLoadingStats(false);
				}
			}
		};

		void loadStatistics();

		return () => {
			cancelled = true;
		};
	}, []);

	const summary = useMemo(() => {
		if (report) {
			return report.resumen;
		}

		if (!travelerState) {
			return null;
		}

		return {
			presupuesto_inicial: travelerState.presupuesto_inicial,
			total_gastado: travelerState.gasto_total,
			total_ganado: travelerState.ganancia_total,
			saldo_final: travelerState.presupuesto_actual,
			tiempo_total_min: travelerState.tiempo_total_min,
			tiempo_restante_min: travelerState.tiempo_restante_min,
		};
	}, [report, travelerState]);

	const destinationsRows = useMemo(() => {
		const source = report?.destinos_visitados.destinos ?? travelerState?.destinos_visitados ?? [];

		return source.map((destino) => ({
			destino,
		}));
	}, [report, travelerState]);

	const flightsRows = useMemo<TravelReportFlight[]>(() => {
		if (report) {
			return report.vuelos.detalle;
		}

		return travelerState?.vuelos ?? [];
	}, [report, travelerState]);

	const activitiesRows = useMemo<TravelReportActivity[]>(() => {
		if (report) {
			return report.actividades.detalle;
		}

		return travelerState?.actividades ?? [];
	}, [report, travelerState]);

	const jobsRows = useMemo<TravelReportJob[]>(() => {
		if (report) {
			return report.trabajos.detalle;
		}

		return travelerState?.trabajos ?? [];
	}, [report, travelerState]);

	const handleRefreshState = () => {
		setTravelerState(readStoredTravelerState());
		setReport(null);
		setError(null);
	};

	const handleGenerateReport = async () => {
		if (!travelerState) {
			setError('No hay estado final de viaje para generar el reporte.');
			return;
		}

		try {
			setLoadingReport(true);
			setError(null);

			const generatedReport = await reportRepository.generateReport(travelerState);
			setReport(generatedReport);
		} catch (reportError) {
			setError(
				reportError instanceof Error
					? reportError.message
					: 'No se pudo generar el reporte final.',
			);
		} finally {
			setLoadingReport(false);
		}
	};

	const handleExport = async (format: 'pdf' | 'csv') => {
		if (!travelerState) {
			setError('No hay estado final de viaje para exportar.');
			return;
		}

		try {
			setExporting(format);
			setError(null);

			const blob =
				format === 'pdf'
					? await reportRepository.exportReportPDF(travelerState)
					: await reportRepository.exportReportCSV(travelerState);

			const fileExtension = format === 'pdf' ? 'pdf' : 'csv';
			const fileName = `skyroute-reporte-final.${fileExtension}`;

			downloadBlob(blob, fileName);
		} catch (exportError) {
			setError(
				exportError instanceof Error
					? exportError.message
					: `No se pudo exportar el archivo ${format.toUpperCase()}.`,
			);
		} finally {
			setExporting(null);
		}
	};

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

				<div className="sr-reports-actions">
					<Button variant="secondary" onClick={handleRefreshState}>
						Refrescar estado
					</Button>

					<Button onClick={handleGenerateReport} loading={loadingReport}>
						Generar reporte
					</Button>

					<Button
						variant="success"
						onClick={() => handleExport('pdf')}
						loading={exporting === 'pdf'}
						disabled={!travelerState}
					>
						Exportar PDF
					</Button>

					<Button
						variant="success"
						onClick={() => handleExport('csv')}
						loading={exporting === 'csv'}
						disabled={!travelerState}
					>
						Exportar CSV
					</Button>
				</div>
			</section>

			{error && (
				<div className="sr-reports-alert sr-reports-alert--error">{error}</div>
			)}

			{!travelerState && (
				<Card className="sr-reports-empty">
					<h2>No hay estado final disponible</h2>
					<p>
						Primero ejecuta una simulación en Advanced Trip para generar el
						estado del viajero y luego vuelve a esta página.
					</p>
					<Link to="/advanced-trip" className="sr-reports-link">
						Ir a Advanced Trip
					</Link>
				</Card>
			)}

			{summary && (
				<section className="sr-reports-kpis">
					<Card className="sr-reports-kpi-card">
						<span>Presupuesto inicial</span>
						<strong>{formatMoney(summary.presupuesto_inicial)}</strong>
					</Card>

					<Card className="sr-reports-kpi-card">
						<span>Total gastado</span>
						<strong>{formatMoney(summary.total_gastado)}</strong>
					</Card>

					<Card className="sr-reports-kpi-card">
						<span>Total ganado</span>
						<strong>{formatMoney(summary.total_ganado)}</strong>
					</Card>

					<Card className="sr-reports-kpi-card">
						<span>Saldo final</span>
						<strong>{formatMoney(summary.saldo_final)}</strong>
					</Card>

					<Card className="sr-reports-kpi-card">
						<span>Tiempo total</span>
						<strong>{formatNumber(summary.tiempo_total_min)} min</strong>
					</Card>

					<Card className="sr-reports-kpi-card">
						<span>Tiempo restante</span>
						<strong>{formatNumber(summary.tiempo_restante_min)} min</strong>
					</Card>
				</section>
			)}

			<section className="sr-reports-table-grid">
				<Card title="Destinos visitados">
					<Table
						columns={[
							{ key: 'destino', label: 'Destino' },
						]}
						data={destinationsRows}
						emptyMessage="No hay destinos registrados."
						keyExtractor={(row, index) => `${row.destino}-${index}`}
					/>
				</Card>

				<Card title="Tramos (vuelos)">
					<Table
						columns={[
							{ key: 'origen', label: 'Origen' },
							{ key: 'destino', label: 'Destino' },
							{ key: 'aeronave', label: 'Aeronave' },
							{
								key: 'costo',
								label: 'Costo',
								render: (value) => formatMoney(Number(value)),
							},
							{
								key: 'tiempo_min',
								label: 'Tiempo (min)',
								render: (value) => formatNumber(Number(value)),
							},
						]}
						data={flightsRows}
						emptyMessage="No hay tramos registrados."
						keyExtractor={(row, index) => `${row.origen}-${row.destino}-${index}`}
					/>
				</Card>

				<Card title="Actividades realizadas">
					<Table
						columns={[
							{ key: 'id', label: 'ID' },
							{ key: 'nombre', label: 'Nombre' },
							{
								key: 'duracion_min',
								label: 'Duración (min)',
								render: (value) => formatNumber(Number(value)),
							},
							{
								key: 'costo',
								label: 'Costo',
								render: (value) => formatMoney(Number(value)),
							},
						]}
						data={activitiesRows}
						emptyMessage="No hay actividades registradas."
						keyExtractor={(row, index) => `${row.id}-${index}`}
					/>
				</Card>

				<Card title="Trabajos realizados">
					<Table
						columns={[
							{ key: 'id', label: 'ID' },
							{ key: 'descripcion', label: 'Descripción' },
							{
								key: 'duracion_min',
								label: 'Duración (min)',
								render: (value) => formatNumber(Number(value)),
							},
							{
								key: 'pago',
								label: 'Pago',
								render: (value) => formatMoney(Number(value)),
							},
						]}
						data={jobsRows}
						emptyMessage="No hay trabajos registrados."
						keyExtractor={(row, index) => `${row.id}-${index}`}
					/>
				</Card>
			</section>

			<Card title="Estadísticas globales" className="sr-reports-stats-card">
				{loadingStats ? (
					<Spinner size="md" />
				) : statistics ? (
					<div className="sr-reports-stats-grid">
						<div>
							<span>Viajes completados</span>
							<strong>{formatNumber(statistics.viajes_completados)}</strong>
						</div>
						<div>
							<span>Presupuesto promedio</span>
							<strong>{formatMoney(statistics.presupuesto_promedio)}</strong>
						</div>
						<div>
							<span>Tiempo promedio</span>
							<strong>{formatNumber(statistics.tiempo_promedio_horas)} h</strong>
						</div>
						<div>
							<span>Destino más popular</span>
							<strong>{statistics.destino_mas_popular || '-'}</strong>
						</div>
					</div>
				) : (
					<p className="text-sm text-body">No hay estadísticas disponibles.</p>
				)}
			</Card>
		</main>
	);
}

export default ReportsPage;
