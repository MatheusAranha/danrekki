import { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import { useAuthStore } from './stores/auth';

export default function App() {
  const revalidate = useAuthStore((s) => s.revalidate);

  useEffect(() => {
    revalidate();
  }, [revalidate]);

  return <RouterProvider router={router} />;
}
