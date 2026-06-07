import { interruptionRepository } from './interruptionRepository';
import type {
  BlockedRoute,
  InterruptionInfo,
  RecalculationResult,
} from '../../models/skyroute/interruption.types';
import type { TravelerState } from '../../models/skyroute/planner.types';

class InterruptionService {
  async blockRoute(origin: string, destination: string): Promise<void> {
    try {
      await interruptionRepository.blockRoute(
        origin.toUpperCase(),
        destination.toUpperCase(),
      );
    } catch (error) {
      console.error(
        `Error blocking route from ${origin} to ${destination}:`,
        error,
      );

      throw error;
    }
  }

  async unblockRoute(origin: string, destination: string): Promise<void> {
    try {
      await interruptionRepository.unblockRoute(
        origin.toUpperCase(),
        destination.toUpperCase(),
      );
    } catch (error) {
      console.error(
        `Error unblocking route from ${origin} to ${destination}:`,
        error,
      );

      throw error;
    }
  }

  async getBlockedRoutes(): Promise<BlockedRoute[]> {
    try {
      return await interruptionRepository.listBlockedRoutes();
    } catch (error) {
      console.error('Error fetching blocked routes:', error);

      throw error;
    }
  }

  async isRouteBlocked(origin: string, destination: string): Promise<boolean> {
    try {
      const blockedRoutes = await this.getBlockedRoutes();

      return blockedRoutes.some(
        (route) =>
          route.origen === origin.toUpperCase() &&
          route.destino === destination.toUpperCase(),
      );
    } catch (error) {
      console.error('Error checking if route is blocked:', error);

      return false;
    }
  }

  async recalculateRoute(
    currentState: TravelerState,
    finalDestination: string,
    criterion: 'costo' | 'tiempo' | 'distancia' = 'distancia',
    options?: {
      includeSecondary?: boolean;
      transportTypes?: string[];
    },
  ): Promise<RecalculationResult> {
    try {
      return await interruptionRepository.recalculateItinerary(
        currentState,
        finalDestination.toUpperCase(),
        criterion,
        options?.includeSecondary ?? true,
        options?.transportTypes,
      );
    } catch (error) {
      console.error('Error recalculating itinerary:', error);

      throw error;
    }
  }

  async getInterruptionStatus(): Promise<{
    totalBlockedRoutes: number;
    affectedAirports: string[];
  }> {
    try {
      const info: InterruptionInfo =
        await interruptionRepository.getInterruptionInfo();

      return {
        totalBlockedRoutes: info.rutas_bloqueadas_total,
        affectedAirports: info.aeropuertos_afectados,
      };
    } catch (error) {
      console.error('Error fetching interruption info:', error);

      throw error;
    }
  }
}

export const interruptionService = new InterruptionService();
