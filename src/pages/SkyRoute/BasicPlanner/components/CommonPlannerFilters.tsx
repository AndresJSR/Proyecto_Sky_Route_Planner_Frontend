import { Card, Select } from '../../../../components/ui';
import type { TransportType } from '../../../../models/skyroute/planner.types';
import { AIRCRAFT_OPTIONS } from '../constants/plannerOptions';

interface CommonPlannerFiltersProps {
  airportCodes: string[];
  origen: string;
  destino: string;
  incluirSecundarios: boolean;
  selectedTransports: TransportType[];
  onOrigenChange: (value: string) => void;
  onDestinoChange: (value: string) => void;
  onIncluirSecundariosChange: (value: boolean) => void;
  onToggleTransport: (transport: TransportType) => void;
}

export function CommonPlannerFilters({
  airportCodes,
  origen,
  destino,
  incluirSecundarios,
  selectedTransports,
  onOrigenChange,
  onDestinoChange,
  onIncluirSecundariosChange,
  onToggleTransport,
}: CommonPlannerFiltersProps) {
  const airportOptions = airportCodes.map((code) => ({
    value: code,
    label: code,
  }));

  const hasAirports = airportOptions.length > 0;

  return (
    <Card className="sr-panel">
      <div className="sr-panel__header">
        <div>
          <h2>1. Filtros comunes de planificación</h2>
          <p>
            Define origen, destino, aeropuertos permitidos y tipos de aeronave
            disponibles para los cálculos de rutas e itinerarios.
          </p>
        </div>
      </div>

      <div className="sr-common-filters-grid">
        <Select
          label="Aeropuerto de origen"
          value={origen}
          disabled={!hasAirports}
          placeholder="Selecciona origen"
          onChange={(event) => onOrigenChange(event.target.value)}
          options={airportOptions}
        />

        <Select
          label="Aeropuerto de destino"
          value={destino}
          disabled={!hasAirports}
          placeholder="Selecciona destino"
          onChange={(event) => onDestinoChange(event.target.value)}
          options={airportOptions}
        />

        <label className="sr-checkbox-card">
          <input
            type="checkbox"
            checked={incluirSecundarios}
            onChange={(event) =>
              onIncluirSecundariosChange(event.target.checked)
            }
          />

          <span>
            <strong>Incluir aeropuertos secundarios</strong>
            <small>
              Permite que el algoritmo use aeropuertos no principales como
              escalas o destinos intermedios.
            </small>
          </span>
        </label>
      </div>

      <div className="sr-filter-row">
        <span>Tipos de aeronave permitidos:</span>

        {AIRCRAFT_OPTIONS.map((transport) => (
          <label className="sr-check-card" key={transport}>
            <input
              type="checkbox"
              checked={selectedTransports.includes(transport)}
              onChange={() => onToggleTransport(transport)}
            />

            {transport}
          </label>
        ))}

        <small>
          Debe quedar seleccionado al menos un tipo de aeronave para ejecutar
          los cálculos.
        </small>
      </div>
    </Card>
  );
}
