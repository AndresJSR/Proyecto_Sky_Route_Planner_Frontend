import { BlockRouteForm } from '../components/BlockRouteForm';
import { BlockedRoutesTable } from '../components/BlockedRoutesTable';
import { InterruptionSummaryCards } from '../components/InterruptionSummaryCards';
import { useInterruptionHandlerPage } from '../hooks/useInterruptionHandlerPage';
import './InterruptionHandlerPage.css';

export function InterruptionHandlerPage() {
  const {
    blockedRoutes,
    info,

    origen,
    destino,

    loading,
    actionLoading,
    error,
    successMessage,

    setOrigen,
    setDestino,

    handleBlockRoute,
    handleUnblockRoute,
  } = useInterruptionHandlerPage();

  return (
    <main className="skyroute-page">
      <section className="mb-6">
        <span className="mb-2 block text-sm font-semibold uppercase tracking-wide text-primary">
          SkyRoute Planner
        </span>

        <h1 className="text-3xl font-bold text-black dark:text-white">
          Manejo de interrupciones
        </h1>

        <p className="mt-2 max-w-3xl text-sm text-body dark:text-bodydark">
          Bloquea rutas, consulta interrupciones activas y prepara el recálculo
          de itinerarios cuando una ruta deja de estar disponible.
        </p>
      </section>

      {error && (
        <div className="mb-6 rounded-sm border border-danger bg-danger/10 px-4 py-3 text-sm font-medium text-danger">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="mb-6 rounded-sm border border-success bg-success/10 px-4 py-3 text-sm font-medium text-success">
          {successMessage}
        </div>
      )}

      <InterruptionSummaryCards info={info} loading={loading} />

      <BlockRouteForm
        origen={origen}
        destino={destino}
        loading={actionLoading}
        onOrigenChange={setOrigen}
        onDestinoChange={setDestino}
        onBlockRoute={handleBlockRoute}
        onUnblockRoute={() => handleUnblockRoute()}
      />

      <BlockedRoutesTable
        routes={blockedRoutes}
        loading={loading}
        actionLoading={actionLoading}
        onUnblockRoute={handleUnblockRoute}
      />
    </main>
  );
}

export default InterruptionHandlerPage;
