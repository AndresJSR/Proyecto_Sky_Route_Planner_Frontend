import { Badge } from '../../../../components/ui';

export function PageHeader() {
  return (
    <section className="sr-hero">
      <div>
        <span className="sr-eyebrow">SkyRoute Planner</span>
        <h1>Visualización de la red aérea</h1>
        <p>
          Visualiza interactivamente el grafo de rutas aéreas. Observa la estructura
          de la red, distingue hubs de aeropuertos secundarios y explora los detalles
          de cada ruta y aeropuerto.
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
