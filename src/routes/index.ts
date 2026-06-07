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
];

const routes = [...coreRoutes];

export default routes;
