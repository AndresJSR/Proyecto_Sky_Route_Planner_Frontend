import { useEffect, useState } from 'react';
import { interruptionService } from '../../../../services/skyroute/interruptionService';
import type {
  BlockedRoute,
  InterruptionInfo,
} from '../../../../models/skyroute/interruption.types';

export function useInterruptionHandlerPage() {
  const [blockedRoutes, setBlockedRoutes] = useState<BlockedRoute[]>([]);
  const [info, setInfo] = useState<InterruptionInfo | null>(null);

  const [origen, setOrigen] = useState('');
  const [destino, setDestino] = useState('');

  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  async function loadInterruptionData() {
    try {
      setLoading(true);
      setError(null);

      const [routesData, statusData] = await Promise.all([
        interruptionService.getBlockedRoutes(),
        interruptionService.getInterruptionStatus(),
      ]);

      setBlockedRoutes(routesData);

      setInfo({
        rutas_bloqueadas_total: statusData.totalBlockedRoutes,
        aeropuertos_afectados: statusData.affectedAirports,
      });
    } catch (loadError) {
      const message =
        loadError instanceof Error
          ? loadError.message
          : 'No se pudo cargar la información de interrupciones.';

      setError(message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadInterruptionData();
  }, []);

  async function handleBlockRoute() {
    if (!origen.trim() || !destino.trim()) {
      setError('Debes ingresar origen y destino.');
      return;
    }

    try {
      setActionLoading(true);
      setError(null);
      setSuccessMessage(null);

      await interruptionService.blockRoute(origen, destino);

      setSuccessMessage('Ruta bloqueada correctamente.');
      await loadInterruptionData();
    } catch (blockError) {
      const message =
        blockError instanceof Error
          ? blockError.message
          : 'No se pudo bloquear la ruta.';

      setError(message);
    } finally {
      setActionLoading(false);
    }
  }

  async function handleUnblockRoute(
    routeOrigen?: string,
    routeDestino?: string,
  ) {
    const finalOrigen = routeOrigen ?? origen;
    const finalDestino = routeDestino ?? destino;

    if (!finalOrigen.trim() || !finalDestino.trim()) {
      setError('Debes ingresar origen y destino.');
      return;
    }

    try {
      setActionLoading(true);
      setError(null);
      setSuccessMessage(null);

      await interruptionService.unblockRoute(finalOrigen, finalDestino);

      setSuccessMessage('Ruta desbloqueada correctamente.');
      await loadInterruptionData();
    } catch (unblockError) {
      const message =
        unblockError instanceof Error
          ? unblockError.message
          : 'No se pudo desbloquear la ruta.';

      setError(message);
    } finally {
      setActionLoading(false);
    }
  }

  return {
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

    loadInterruptionData,
    handleBlockRoute,
    handleUnblockRoute,
  };
}
