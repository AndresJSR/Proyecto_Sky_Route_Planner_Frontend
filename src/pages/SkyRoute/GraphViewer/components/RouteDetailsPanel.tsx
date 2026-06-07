import { Card } from '../../../../components/ui';
import type { RouteDto } from '../../../../models/skyroute/graph.types';

interface RouteDetailsPanelProps {
  route: RouteDto | null;
}

export function RouteDetailsPanel({ route }: RouteDetailsPanelProps) {
  if (!route) {
    return (
      <Card className="sr-panel">
        <div className="sr-panel__header">
          <h2>Detalles de la Ruta</h2>
        </div>
        <p className="text-gray-500">
          Haz clic en una ruta del grafo para ver sus detalles.
        </p>
      </Card>
    );
  }

  return (
    <Card className="sr-panel sr-panel--details">
      <div className="sr-panel__header">
        <h2 className="flex items-center gap-3">
          <span className="text-lg font-bold">{route.origen}</span>
          <span className="text-gray-400">→</span>
          <span className="text-lg font-bold">{route.destino}</span>
        </h2>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h3 className="text-sm font-semibold text-gray-600 mb-1">Distancia</h3>
            <p className="text-lg font-bold text-primary">
              {route.distanciaKm || 0} km
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-600 mb-1">Costo Base</h3>
            <p className="text-lg font-bold text-primary">
              ${route.costoBase !== undefined && route.costoBase !== null ? route.costoBase.toFixed(2) : 'N/A'}
            </p>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-gray-600 mb-1">Estancia Mínima</h3>
          <p className="text-gray-900">
            {route.estanciaMinima || 0} minutos
          </p>
        </div>

        {route.aeronaves && route.aeronaves.length > 0 && (
          <div className="pt-2 border-t border-gray-200">
            <h3 className="text-sm font-semibold text-gray-600 mb-2">Tipos de Aeronave</h3>
            <div className="space-y-2">
              {route.aeronaves.map((aircraft: string, idx: number) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2 bg-blue-50 rounded"
                >
                  <span className="text-sm font-medium text-blue-900">{aircraft}</span>
                  {aircraft === 'Avión Comercial' && (
                    <span className="text-xs text-blue-600">Rápido y eficiente</span>
                  )}
                  {aircraft === 'Avión Regional' && (
                    <span className="text-xs text-blue-600">Flexible</span>
                  )}
                  {aircraft === 'Hélice' && (
                    <span className="text-xs text-blue-600">Económico</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {route.costoBase === 0 && (
          <div className="pt-2 border-t border-gray-200">
            <div className="flex items-start gap-2 p-3 bg-green-50 rounded">
              <span className="text-green-600 font-bold text-lg">✓</span>
              <div>
                <p className="text-sm font-semibold text-green-900">Ruta Subsidiada</p>
                <p className="text-xs text-green-700">
                  Esta ruta tiene costo cero. Máximo 20% de distancia.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
