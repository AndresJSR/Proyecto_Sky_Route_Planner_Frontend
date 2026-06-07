import { Badge } from '../../../../components/ui';

export function PageHeader() {
  return (
    <section className="sr-hero">
      <div>
        <span className="sr-eyebrow">SkyPlanner · R2</span>

        <h1>Planificación básica de rutas aéreas</h1>

        <p>
          Módulo para calcular rutas óptimas, comparar criterios de
          planificación y generar itinerarios considerando restricciones de
          transporte, presupuesto y tiempo.
        </p>
      </div>

      <div className="sr-hero__actions">
        <Badge
          variant="info"
          label={
            <>
              <strong>API activa en localhost:8000</strong>
            </>
          }
          className="sr-status-pill"
        />
      </div>
    </section>
  );
}
