import { Button, Card, Input } from '../../../../components/ui';

interface BlockRouteFormProps {
  origen: string;
  destino: string;
  loading: boolean;
  onOrigenChange: (value: string) => void;
  onDestinoChange: (value: string) => void;
  onBlockRoute: () => void;
  onUnblockRoute: () => void;
}

export function BlockRouteForm({
  origen,
  destino,
  loading,
  onOrigenChange,
  onDestinoChange,
  onBlockRoute,
  onUnblockRoute,
}: BlockRouteFormProps) {
  return (
    <Card className="mb-6">
      <div className="mb-5">
        <h2 className="text-xl font-bold text-black dark:text-white">
          Gestión de interrupciones
        </h2>
        <p className="mt-1 text-sm text-body dark:text-bodydark">
          Bloquea o desbloquea una ruta específica entre dos aeropuertos.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Input
          label="Origen"
          placeholder="BOG"
          value={origen}
          onChange={(event) => onOrigenChange(event.target.value.toUpperCase())}
        />

        <Input
          label="Destino"
          placeholder="LIM"
          value={destino}
          onChange={(event) =>
            onDestinoChange(event.target.value.toUpperCase())
          }
        />

        <div className="flex items-end gap-3">
          <Button
            type="button"
            variant="danger"
            loading={loading}
            disabled={loading}
            onClick={onBlockRoute}
            className="w-full"
          >
            Bloquear
          </Button>

          <Button
            type="button"
            variant="secondary"
            loading={loading}
            disabled={loading}
            onClick={onUnblockRoute}
            className="w-full"
          >
            Desbloquear
          </Button>
        </div>
      </div>
    </Card>
  );
}
