import { Suspense, useEffect, useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import Loader from './common/Loader';
import DefaultLayout from './layout/DefaultLayout';
import routes from './routes';

function App() {
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const timeoutId = setTimeout(() => setLoading(false), 1000);

    return () => clearTimeout(timeoutId);
  }, []);

  return loading ? (
    <Loader />
  ) : (
    <>
      <Toaster
        position="top-right"
        reverseOrder={false}
        containerClassName="overflow-auto"
      />

      <Routes>
        <Route element={<DefaultLayout />}>
          <Route index element={<Navigate to="/graph-viewer" replace />} />

          {routes.filter(Boolean).map((route, index) => {
            const { path, component: Component } = route;

            return (
              <Route
                key={`${path}-${index}`}
                path={path}
                element={
                  <Suspense fallback={<Loader />}>
                    <Component />
                  </Suspense>
                }
              />
            );
          })}
        </Route>
      </Routes>
    </>
  );
}

export default App;
