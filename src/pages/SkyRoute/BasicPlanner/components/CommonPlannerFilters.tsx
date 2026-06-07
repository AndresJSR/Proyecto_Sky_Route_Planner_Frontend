import { Card, Input } from '../../../../components/ui';
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
  return (
    <Card className="sr-panel">
      <div className="sr-panel__header">
        <div>
          <h2>Parámetros comunes</h2>
          <p>
            Estos filtros se usan en las pruebas de ruta óptima y criterios.
          </p>
        </div>
      </div>

      <div className="sr-common-filters-grid">
        <Input
          label="Origen"
          list="airport-codes"
          value={origen}
          onChange={(event) => onOrigenChange(event.target.value.toUpperCase())}
          placeholder="BOG"
        />

        <Input
          label="Destino"
          list="airport-codes"
          value={destino}
          onChange={(event) =>
            onDestinoChange(event.target.value.toUpperCase())
          }
          placeholder="SCL"
        />

        <label className="sr-checkbox-card">
          <input
            type="checkbox"
            checked={incluirSecundarios}
            onChange={(event) =>
              onIncluirSecundariosChange(event.target.checked)
            }
          />
          <span>Incluir aeropuertos secundarios</span>
        </label>
      </div>

      <datalist id="airport-codes">
        {airportCodes.map((code) => (
          <option key={code} value={code} />
        ))}
      </datalist>

      <div className="sr-filter-row">
        <span>Tipos de transporte:</span>

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

        <small>Si no seleccionas ninguno, se usan todos.</small>
      </div>
    </Card>
  );
}
