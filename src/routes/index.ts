import { lazy } from 'react';
;

const BasicPlanner = lazy(
  () => import('../pages/SkyRoute/BasicPlanner/BasicPlannerPage'),
);
const InterruptionHandler = lazy(
  () => import('../pages/SkyRoute/InterruptionHandler/InterruptionHandlerPage'),
);
const GraphViewer = lazy(
  () => import('../pages/SkyRoute/GraphViewer/GraphViewerPage'),
);
const AdvancedTrip = lazy(() => import('../pages/SkyRoute/AdvancedTrip'));
const Reports = lazy(() => import('../pages/SkyRoute/Reports/ReportsPage'));

const coreRoutes = [
  {
    path: '/planner',
    title: 'SkyRoute Planner',
    component: BasicPlanner,
  },
  {
    path: '/interruption-handler',
    title: 'Interruption Handler',
    component: InterruptionHandler,
  },
  {
    path: '/graph-viewer',
    title: 'Graph Viewer',
    component: GraphViewer,
  },
  {
    path: '/advanced-trip',
    title: 'Advanced Trip',
    component: AdvancedTrip,
  },
  {
    path: '/reports',
    title: 'Reports',
    component: Reports,
  },
];

const routes = [...coreRoutes];

export default routes;
