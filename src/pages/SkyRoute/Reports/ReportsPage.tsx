import './ReportsPage.css';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, Card, Spinner, Table } from '../../../components/ui';
import type { AirportDetail, RouteDto } from '../../../models/skyroute/graph.types';
import type { TravelerState } from '../../../models/skyroute/planner.types';
import type { TravelStatistics } from '../../../models/skyroute/report.types';
import { graphRepository } from '../../../services/skyroute/graphRepository';
import { reportRepository } from '../../../services/skyroute/reportRepository';
import {
    LAST_TRAVELER_STATE_KEY,
    normalizeTravelerState,
} from '../../../services/skyroute/travelerState';

interface DetailedSummary {
	presupuesto_inicial: number;
	total_gastado: number;
	total_ganado: number;
	saldo_final: number;
	tiempo_total_min: number;
	tiempo_restante_min: number;
}

interface DetailedDestinationRow extends Record<string, unknown> {
	aeropuerto: string;
	nombreAeropuerto: string;
	ciudad: string;
	pais: string;
	tiempoEstadiaMin: number;
	alojamiento: number;
	alimentacion: number;
	costoTotal: number;
}

interface DetailedFlightRow extends Record<string, unknown> {
	origen: string;
	destino: string;
	aeronave: string;
	distanciaKm: number | null;
	tiempoVueloMin: number;
	costoTramo: number;
}

interface DetailedActivityRow extends Record<string, unknown> {
	nombre: string;
	tipo: string;
	tiempoMin: number;
	costo: number;
	aeropuerto?: string;
}

interface DetailedJobRow extends Record<string, unknown> {
	nombre: string;
	horasTrabajadas: number;
	ingresoObtenido: number;
}

interface DetailedReportData {
	resumen: DetailedSummary;
	destinos: DetailedDestinationRow[];
	vuelos: DetailedFlightRow[];
	actividades: DetailedActivityRow[];
	trabajos: DetailedJobRow[];
}

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

function formatHours(value: number): string {
	return `${value.toFixed(2).replace(/\.00$/, '')} h`;
}

function uniquePreserveOrder(values: string[]): string[] {
	const seen = new Set<string>();
	const result: string[] = [];

	for (const value of values) {
		if (!value || seen.has(value)) continue;
		seen.add(value);
		result.push(value);
	}

	return result;
}

function routeKey(origen: string, destino: string): string {
	return `${origen}__${destino}`;
}

function getVisitedAirportSequence(state: TravelerState): string[] {
	const vuelos = Array.isArray(state.vuelos) ? state.vuelos : [];
	const destinosVisitados = Array.isArray(state.destinos_visitados)
		? state.destinos_visitados
		: [];

	if (vuelos.length > 0) {
		return [vuelos[0].origen, ...vuelos.map((flight) => flight.destino)];
	}

	if (destinosVisitados.length > 0) {
		return [...destinosVisitados];
	}

	return [state.aeropuerto_actual];
}

function buildDetailedReport(
	travelerState: TravelerState,
	airportDetailsById: Record<string, AirportDetail>,
	routes: RouteDto[],
): DetailedReportData {
	const summary: DetailedSummary = {
		presupuesto_inicial: travelerState.presupuesto_inicial,
		total_gastado: travelerState.gasto_total,
		total_ganado: travelerState.ganancia_total,
		saldo_final: travelerState.presupuesto_actual,
		tiempo_total_min: travelerState.tiempo_total_min,
		tiempo_restante_min: travelerState.tiempo_restante_min,
	};

	const routeLookup = new Map<string, RouteDto>();
	routes.forEach((route) => {
		routeLookup.set(routeKey(route.origen, route.destino), route);
	});

	const activityCatalog = Object.values(airportDetailsById).flatMap((detail) =>
		detail.actividades.map((activity) => ({
			aeropuerto: detail.id,
			nombre: activity.nombre,
			tipo: activity.tipo,
			duracionMin: activity.duracionMin,
			costoUSD: activity.costoUSD,
		})),
	);

	const vuelos = Array.isArray(travelerState.vuelos) ? travelerState.vuelos : [];
	const actividades = Array.isArray(travelerState.actividades)
		? travelerState.actividades
		: [];
	const trabajos = Array.isArray(travelerState.trabajos) ? travelerState.trabajos : [];

	const sequence = getVisitedAirportSequence(travelerState);
	const destinations: DetailedDestinationRow[] = sequence.map((airportId, index) => {
		const airport = airportDetailsById[airportId];
		const previousAirportId = index > 0 ? sequence[index - 1] : null;
		const incomingRoute = previousAirportId
			? routeLookup.get(routeKey(previousAirportId, airportId))
			: null;
		const stayMinutes = index === 0 ? 0 : incomingRoute?.estanciaMinima ?? 0;
		const lodgingDays = stayMinutes > 0 ? Math.max(1, Math.ceil(stayMinutes / 1440)) : 0;
		const mealCount = stayMinutes > 0 ? Math.max(1, Math.ceil(stayMinutes / 240)) : 0;
		const lodgingCost = lodgingDays * (airport?.costoAlojamiento ?? 0);
		const foodCost = mealCount * (airport?.costoAlimentacion ?? 0);

		return {
			aeropuerto: airportId,
			nombreAeropuerto: airport?.nombre ?? airportId,
			ciudad: airport?.ciudad ?? 'N/D',
			pais: airport?.pais ?? 'N/D',
			tiempoEstadiaMin: stayMinutes,
			alojamiento: lodgingCost,
			alimentacion: foodCost,
			costoTotal: lodgingCost + foodCost,
		};
	});

	const vuelosDetalle: DetailedFlightRow[] = vuelos.map((flight) => {
		const route = routeLookup.get(routeKey(flight.origen, flight.destino));

		return {
			origen: flight.origen,
			destino: flight.destino,
			aeronave: flight.aeronave,
			distanciaKm: route?.distanciaKm ?? null,
			tiempoVueloMin: flight.tiempo_min,
			costoTramo: flight.costo,
		};
	});

	const actividadesDetalle: DetailedActivityRow[] = actividades.map(
		(activity) => {
			const matchedActivity = activityCatalog.find(
				(entry) =>
					entry.nombre === activity.nombre &&
					entry.duracionMin === activity.duracion_min &&
					entry.costoUSD === activity.costo,
			) ?? activityCatalog.find((entry) => entry.nombre === activity.nombre);

			return {
				nombre: activity.nombre,
				tipo: matchedActivity?.tipo ?? 'N/D',
				tiempoMin: activity.duracion_min,
				costo: activity.costo,
				aeropuerto: matchedActivity?.aeropuerto,
			};
		},
	);

	const trabajosDetalle: DetailedJobRow[] = trabajos.map((job) => ({
		nombre: job.descripcion,
		horasTrabajadas: job.duracion_min / 60,
		ingresoObtenido: job.pago,
	}));

	return {
		resumen: summary,
		destinos: destinations,
		vuelos: vuelosDetalle,
		actividades: actividadesDetalle,
		trabajos: trabajosDetalle,
	};
}

function escapeCsvValue(value: string | number | null | undefined): string {
	const text = String(value ?? '');
	return `"${text.replace(/"/g, '""')}"`;
}

function createCsvBlob(report: DetailedReportData): Blob {
	const lines: string[] = [];
	const pushRow = (values: Array<string | number | null | undefined>) => {
		lines.push(values.map(escapeCsvValue).join(','));
	};

	lines.push('"SkyRoute - Reporte Final"');
	lines.push('');
	lines.push('"Resumen"');
	pushRow(['Presupuesto inicial', report.resumen.presupuesto_inicial]);
	pushRow(['Total gastado', report.resumen.total_gastado]);
	pushRow(['Total ganado', report.resumen.total_ganado]);
	pushRow(['Saldo final', report.resumen.saldo_final]);
	pushRow(['Tiempo total min', report.resumen.tiempo_total_min]);
	pushRow(['Tiempo restante min', report.resumen.tiempo_restante_min]);

	lines.push('');
	lines.push('"Destinos visitados"');
	pushRow([
		'Aeropuerto',
		'Nombre',
		'Ciudad',
		'País',
		'Tiempo estadía min',
		'Costo alojamiento',
		'Costo alimentación',
		'Costo total',
	]);
	report.destinos.forEach((destination) => {
		pushRow([
			destination.aeropuerto,
			destination.nombreAeropuerto,
			destination.ciudad,
			destination.pais,
			destination.tiempoEstadiaMin,
			destination.alojamiento,
			destination.alimentacion,
			destination.costoTotal,
		]);
	});

	lines.push('');
	lines.push('"Tramos volados"');
	pushRow(['Origen', 'Destino', 'Aeronave', 'Distancia km', 'Tiempo vuelo min', 'Costo tramo']);
	report.vuelos.forEach((flight) => {
		pushRow([
			flight.origen,
			flight.destino,
			flight.aeronave,
			flight.distanciaKm ?? 'N/D',
			flight.tiempoVueloMin,
			flight.costoTramo,
		]);
	});

	lines.push('');
	lines.push('"Actividades realizadas"');
	pushRow(['Nombre', 'Tipo', 'Tiempo min', 'Costo']);
	report.actividades.forEach((activity) => {
		pushRow([activity.nombre, activity.tipo, activity.tiempoMin, activity.costo]);
	});

	lines.push('');
	lines.push('"Trabajos realizados"');
	pushRow(['Nombre del trabajo', 'Horas trabajadas', 'Ingreso obtenido']);
	report.trabajos.forEach((job) => {
		pushRow([job.nombre, formatHours(job.horasTrabajadas), job.ingresoObtenido]);
	});

	return new Blob([`\uFEFF${lines.join('\n')}`], {
		type: 'text/csv;charset=utf-8',
	});
}

function sanitizePdfText(text: string): string {
	return text.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
}

function createPdfBlob(lines: string[]): Blob {
	const visibleLines = lines.slice(0, 60);
	const contentLines = visibleLines.map((line) => `(${sanitizePdfText(line)}) Tj T*`);
	const stream = `BT\n/F1 11 Tf\n50 790 Td\n14 TL\n${contentLines.join('\n')}\nET`;
	const streamLength = stream.length;

	const objects = [
		'1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n',
		'2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n',
		'3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>\nendobj\n',
		'4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n',
		`5 0 obj\n<< /Length ${streamLength} >>\nstream\n${stream}\nendstream\nendobj\n`,
	];

	let pdf = '%PDF-1.4\n';
	const offsets: number[] = [];

	for (const object of objects) {
		offsets.push(pdf.length);
		pdf += object;
	}

	const xrefOffset = pdf.length;
	pdf += `xref\n0 ${objects.length + 1}\n`;
	pdf += '0000000000 65535 f \n';

	offsets.forEach((offset) => {
		pdf += `${offset.toString().padStart(10, '0')} 00000 n \n`;
	});

	pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

	return new Blob([pdf], { type: 'application/pdf' });
}

function createPdfLines(report: DetailedReportData): string[] {
	return [
		'SkyRoute - Reporte Final',
		'',
		'Resumen',
		`Presupuesto inicial: ${formatMoney(report.resumen.presupuesto_inicial)}`,
		`Total gastado: ${formatMoney(report.resumen.total_gastado)}`,
		`Total ganado: ${formatMoney(report.resumen.total_ganado)}`,
		`Saldo final: ${formatMoney(report.resumen.saldo_final)}`,
		`Tiempo total: ${formatNumber(report.resumen.tiempo_total_min)} min`,
		`Tiempo restante: ${formatNumber(report.resumen.tiempo_restante_min)} min`,
		'',
		'Destinos visitados',
		...report.destinos.map(
			(destination) =>
				`- ${destination.aeropuerto} | ${destination.nombreAeropuerto} | ${destination.ciudad}, ${destination.pais} | estadía ${formatNumber(destination.tiempoEstadiaMin)} min | costo ${formatMoney(destination.costoTotal)}`,
		),
		'',
		'Tramos volados',
		...report.vuelos.map(
			(flight) =>
				`- ${flight.origen} -> ${flight.destino} | ${flight.aeronave} | distancia ${flight.distanciaKm ?? 'N/D'} km | tiempo ${formatNumber(flight.tiempoVueloMin)} min | costo ${formatMoney(flight.costoTramo)}`,
		),
		'',
		'Actividades realizadas',
		...report.actividades.map(
			(activity) =>
				`- ${activity.nombre} | tipo ${activity.tipo} | ${formatNumber(activity.tiempoMin)} min | costo ${formatMoney(activity.costo)}`,
		),
		'',
		'Trabajos realizados',
		...report.trabajos.map(
			(job) =>
				`- ${job.nombre} | ${formatHours(job.horasTrabajadas)} | ingreso ${formatMoney(job.ingresoObtenido)}`,
		),
	];
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
		return normalizeTravelerState(parsed);
	} catch (error) {
		console.warn('No fue posible leer el estado final guardado.', error);
		return null;
	}
}

export function ReportsPage() {
	const [travelerState, setTravelerState] = useState<TravelerState | null>(
		() => readStoredTravelerState(),
	);
	const [statistics, setStatistics] = useState<TravelStatistics | null>(null);
	const [loadingStats, setLoadingStats] = useState(false);
	const [loadingDetails, setLoadingDetails] = useState(false);
	const [loadingReport, setLoadingReport] = useState(false);
	const [exporting, setExporting] = useState<'pdf' | 'csv' | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [airportDetailsById, setAirportDetailsById] = useState<Record<string, AirportDetail>>({});
	const [routes, setRoutes] = useState<RouteDto[]>([]);

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

	const visitedAirportSequence = useMemo(
		() => (travelerState ? getVisitedAirportSequence(travelerState) : []),
		[travelerState],
	);

	const loadDetailedLookups = useCallback(async () => {
		if (!travelerState) {
			return {
				airportDetailsById: {} as Record<string, AirportDetail>,
				routes: [] as RouteDto[],
			};
		}

		const airportIds = uniquePreserveOrder([
			...visitedAirportSequence,
			travelerState.aeropuerto_actual,
		]);

		const [routesData, airportResults] = await Promise.all([
			graphRepository.listRoutes(true),
			Promise.allSettled(
				airportIds.map((airportId) => graphRepository.getAirportInfo(airportId)),
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
	}, [travelerState, visitedAirportSequence]);

	const detailedReport = useMemo(() => {
		if (!travelerState) {
			return null;
		}

		return buildDetailedReport(travelerState, airportDetailsById, routes);
	}, [airportDetailsById, routes, travelerState]);

	const summary = detailedReport?.resumen ?? null;

	const destinationsRows = (detailedReport?.destinos ?? []) as Array<Record<string, unknown>>;
	const flightsRows = (detailedReport?.vuelos ?? []) as Array<Record<string, unknown>>;
	const activitiesRows = (detailedReport?.actividades ?? []) as Array<Record<string, unknown>>;
	const jobsRows = (detailedReport?.trabajos ?? []) as Array<Record<string, unknown>>;

	const refreshDetailedReport = useCallback(async () => {
		if (!travelerState) {
			return;
		}

		try {
			setLoadingDetails(true);
			const lookups = await loadDetailedLookups();
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
	}, [loadDetailedLookups, travelerState]);

	useEffect(() => {
		void refreshDetailedReport();
	}, [refreshDetailedReport]);

	const handleRefreshState = () => {
		setTravelerState(readStoredTravelerState());
		setError(null);
		void refreshDetailedReport();
	};

	const handleGenerateReport = async () => {
		if (!travelerState) {
			setError('No hay estado final de viaje para generar el reporte.');
			return;
		}

		try {
			setLoadingReport(true);
			setError(null);
			await refreshDetailedReport();
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

			let reportData = detailedReport;
			if (!reportData) {
				const lookups = await loadDetailedLookups();
				reportData = buildDetailedReport(
					travelerState,
					lookups.airportDetailsById,
					lookups.routes,
				);
			}

			const blob =
				format === 'pdf'
					? createPdfBlob(createPdfLines(reportData))
					: createCsvBlob(reportData);

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

					<Button onClick={handleGenerateReport} loading={loadingReport || loadingDetails}>
						Generar reporte
					</Button>

					<Button
						variant="success"
						onClick={() => handleExport('pdf')}
						loading={exporting === 'pdf'}
						disabled={!travelerState || loadingDetails}
					>
						Exportar PDF
					</Button>

					<Button
						variant="success"
						onClick={() => handleExport('csv')}
						loading={exporting === 'csv'}
						disabled={!travelerState || loadingDetails}
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
				<Card title="Destinos visitados">
					<Table
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
								key: 'costoTotal',
								label: 'Costo total incurrido',
								render: (value) => formatMoney(Number(value)),
							},
						]}
						data={destinationsRows}
						emptyMessage="No hay destinos registrados."
						keyExtractor={(row, index) => `${row.aeropuerto}-${index}`}
					/>
				</Card>

				<Card title="Tramos (vuelos)">
					<Table
						columns={[
							{ key: 'origen', label: 'Origen' },
							{ key: 'destino', label: 'Destino' },
							{ key: 'aeronave', label: 'Aeronave' },
							{
								key: 'distanciaKm',
								label: 'Distancia',
								render: (value) => `${Number(value)} km`,
							},
							{
								key: 'tiempoVueloMin',
								label: 'Tiempo de vuelo',
								render: (value) => formatNumber(Number(value)),
							},
							{
								key: 'costoTramo',
								label: 'Costo del tramo',
								render: (value) => formatMoney(Number(value)),
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
							{ key: 'nombre', label: 'Nombre' },
							{ key: 'tipo', label: 'Tipo' },
							{
								key: 'tiempoMin',
								label: 'Tiempo',
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
						keyExtractor={(row, index) => `${row.nombre}-${index}`}
					/>
				</Card>

				<Card title="Trabajos realizados">
					<Table
						columns={[
							{ key: 'nombre', label: 'Nombre del trabajo' },
							{
								key: 'horasTrabajadas',
								label: 'Horas trabajadas',
								render: (value) => formatHours(Number(value)),
							},
							{
								key: 'ingresoObtenido',
								label: 'Ingreso obtenido',
								render: (value) => formatMoney(Number(value)),
							},
						]}
						data={jobsRows}
						emptyMessage="No hay trabajos registrados."
						keyExtractor={(row, index) => `${row.nombre}-${index}`}
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
