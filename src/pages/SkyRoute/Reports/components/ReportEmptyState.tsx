import { Link } from 'react-router-dom';
import { Card } from '../../../../components/ui';

export function ReportEmptyState() {
  return (
    <Card className="sr-reports-empty">
      <h2>No hay estado final disponible</h2>

      <p>
        Primero ejecuta una simulación en Advanced Trip para generar el estado
        del viajero y luego vuelve a esta página.
      </p>

      <Link to="/advanced-trip" className="sr-reports-link">
        Ir a Advanced Trip
      </Link>
    </Card>
  );
}

export default ReportEmptyState;
