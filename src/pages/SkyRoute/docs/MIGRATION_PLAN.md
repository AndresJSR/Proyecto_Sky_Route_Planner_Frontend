# Plan de migración (orden sugerido)

1. Migrar tipos de API.
2. Migrar tipos de grafo.
3. Migrar tipos de planner.
4. Migrar cliente API.
5. Migrar graphRepository.
6. Migrar plannerRepository.
7. Migrar componentes ui reutilizables.
8. Migrar utils de BasicPlanner.
9. Migrar constants de BasicPlanner.
10. Migrar componentes visuales de BasicPlanner.
11. Migrar hook `useBasicPlannerPage`.
12. Migrar `BasicPlannerPage`.
13. Registrar ruta `/planner`.
14. Agregar link al Sidebar.
15. Probar build.
16. Probar navegación.

Notas:

- Migración incremental: mover archivo por archivo y ejecutar build/navegación tras cada grupo de cambios.
- Evitar cambios en `App.tsx`, `main.tsx`, Sidebar y layout hasta completar la migración de las páginas y rutas.

1. Migrar tipos de API.
2. Migrar tipos de grafo.
3. Migrar tipos de planner.
4. Migrar cliente API.
5. Migrar graphRepository.
6. Migrar plannerRepository.
7. Migrar componentes ui reutilizables.
8. Migrar utils de BasicPlanner.
9. Migrar constants de BasicPlanner.
10. Migrar componentes visuales de BasicPlanner.
11. Migrar hook useBasicPlannerPage.
12. Migrar BasicPlannerPage.
13. Registrar ruta /planner.
14. Agregar link al Sidebar.
15. Probar build.
16. Probar navegación.

Notas:

- Seguir el orden estrictamente para minimizar dependencias rotas.
- Migrar y verificar each step antes de avanzar al siguiente.
