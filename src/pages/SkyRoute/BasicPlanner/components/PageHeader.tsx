import { Badge } from '../../../../components/ui';

export function PageHeader() {
  return (
    <section className="sr-hero">
      <div>
        <span className="sr-eyebrow">SkyRoute Planner</span>
        <h1>Planificación básica de rutas</h1>
        <p>
          Prueba visual de los endpoints de R2: ruta óptima, rutas por criterios
          e itinerarios con restricciones de presupuesto y tiempo.
        </p>
      </div>

      <div className="sr-hero__actions">
        <Badge
          variant="info"
          label={
            <>
              Backend esperado: <strong>localhost:8000</strong>
            </>
          }
          className="sr-status-pill"
        />
      </div>
    </section>
  );
}
