# Arquitectura de SkyRoute (resumen)

Breve descripción de responsabilidades por carpeta:

- components/ui: componentes globales reutilizables (botones, inputs, tarjetas, tablas, spinners, etc.).
- models/skyroute: contratos y tipos relacionados con SkyRoute (tipos de API, tipos de grafo, tipos del planner).
- services/skyroute: cliente HTTP/SDK de SkyRoute y repositorios que exponen operaciones de alto nivel (graphRepository, plannerRepository, etc.).
- pages/SkyRoute: páginas principales del proyecto SkyRoute (Dashboard, GraphViewer, BasicPlanner, AdvancedTrip, InterruptionHandler, Reports, etc.).
- pages/SkyRoute/BasicPlanner/components: componentes visuales y de presentación específicos del flujo BasicPlanner (paneles, listas, tarjetas, tablas).
- pages/SkyRoute/BasicPlanner/hooks: hooks locales que contienen estado y lógica exclusiva de la página BasicPlanner.
- pages/SkyRoute/BasicPlanner/constants: constantes u opciones fijas usadas por BasicPlanner.
- pages/SkyRoute/BasicPlanner/utils: utilidades y formateadores auxiliares reutilizables dentro de BasicPlanner.

Principios:

- Responsabilidad única: cada carpeta contiene artefactos de una sola responsabilidad.
- Preparado para migración incremental: cada archivo se migrará individualmente sin acoplar rutas ni lógica global.
- No hay dependencias ni implementación en esta fase; sólo placeholders y documentación.

# Arquitectura de SkyRoute

Breve responsabilidad de cada carpeta del módulo SkyRoute:

- components/ui: Componentes globales y reutilizables de UI (botones, tarjetas, tablas, etc.).
- models/skyroute: Contratos y tipos (tipos de API, grafo y planner) usados por SkyRoute.
- services/skyroute: Cliente API y repositorios que abstraen acceso a datos y dominios.
- pages/SkyRoute: Páginas principales del proyecto SkyRoute (dashboard, planner, reportes, etc.).
- pages/SkyRoute/BasicPlanner/components: Componentes visuales y de presentación específicos de BasicPlanner.
- pages/SkyRoute/BasicPlanner/hooks: Hooks locales que encapsulan estado y lógica de la página BasicPlanner.
- pages/SkyRoute/BasicPlanner/constants: Valores y opciones fijas utilizadas por BasicPlanner.
- pages/SkyRoute/BasicPlanner/utils: Funciones auxiliares y formateadores locales de BasicPlanner.

Notas:

- Esta estructura está pensada para mantener separación clara entre dominio, infraestructura y presentación.
- Los archivos creados aquí son scaffolding; la implementación se migrará archivo por archivo.
