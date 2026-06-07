import { Card } from '../../../../components/ui';
import type { AirportDetail } from '../../../../models/skyroute/graph.types';

interface AirportDetailsPanelProps {
  airport: AirportDetail | null;
}

export function AirportDetailsPanel({ airport }: AirportDetailsPanelProps) {
  if (!airport) {
    return (
      <Card className="sr-panel">
        <div className="sr-panel__header">
          <h2>Detalles del Aeropuerto</h2>
        </div>
        <p className="text-gray-500">
          Selecciona un aeropuerto en el grafo para ver sus detalles.
        </p>
      </Card>
    );
  }

  return (
    <Card className="sr-panel sr-panel--details">
      <div className="sr-panel__header">
        <h2 className="flex items-center gap-2">
          <span className="text-2xl font-bold text-primary">{airport.id}</span>
          {airport.esHub && (
            <span className="inline-block bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-800 rounded-full">
              HUB
            </span>
          )}
        </h2>
      </div>

      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-gray-600 mb-1">Aeropuerto</h3>
          <p className="text-gray-900 font-medium">{airport.nombre}</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <h3 className="text-sm font-semibold text-gray-600 mb-1">Ciudad</h3>
            <p className="text-gray-900">{airport.ciudad}</p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-600 mb-1">País</h3>
            <p className="text-gray-900">{airport.pais}</p>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-gray-600 mb-1">Zona Horaria</h3>
          <p className="text-gray-900">{airport.zonaHoraria}</p>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-200">
          <div>
            <h3 className="text-sm font-semibold text-gray-600 mb-1">Alojamiento</h3>
            <p className="text-gray-900 font-medium text-primary">
              ${airport.costoAlojamiento || 'N/A'}/noche
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-600 mb-1">Alimentación</h3>
            <p className="text-gray-900 font-medium text-primary">
              ${airport.costoAlimentacion || 'N/A'}/comida
            </p>
          </div>
        </div>

        {airport.aerolineas && airport.aerolineas.length > 0 && (
          <div className="pt-2 border-t border-gray-200">
            <h3 className="text-sm font-semibold text-gray-600 mb-2">Aerolíneas operando</h3>
            <div className="flex flex-wrap gap-2">
              {airport.aerolineas.map((airline) => (
                <span
                  key={airline}
                  className="inline-block bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 rounded-full"
                >
                  {airline}
                </span>
              ))}
            </div>
          </div>
        )}

        {airport.actividades && airport.actividades.length > 0 && (
          <div className="pt-2 border-t border-gray-200">
            <h3 className="text-sm font-semibold text-gray-600 mb-2">Actividades</h3>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {airport.actividades.slice(0, 5).map((activity: any, idx: number) => (
                <div
                  key={idx}
                  className="flex justify-between items-start p-2 bg-gray-50 rounded"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-800">{activity.nombre}</p>
                    <p className="text-xs text-gray-600">
                      {activity.duracionMin || 0} min • ${activity.costoUSD || 0}
                    </p>
                  </div>
                </div>
              ))}
              {airport.actividades.length > 5 && (
                <p className="text-xs text-gray-500 italic">
                  +{airport.actividades.length - 5} actividades más
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
