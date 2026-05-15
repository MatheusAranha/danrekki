import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../stores/auth';
import { Layout } from '../components/Layout';
import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/admin/DashboardPage';
import { ClansPage } from '../pages/admin/ClansPage';
import { ReleasesPage } from '../pages/admin/ReleasesPage';
import { JutsuRanksPage } from '../pages/admin/JutsuRanksPage';
import { NinjaRanksPage } from '../pages/admin/NinjaRanksPage';
import { JutsusPage } from '../pages/admin/JutsusPage';
import { LibrariesPage } from '../pages/admin/LibrariesPage';
import { LibraryScrollsPage } from '../pages/admin/LibraryScrollsPage';
import { SenseisPage } from '../pages/admin/SenseisPage';
import { SenseiContentsPage } from '../pages/admin/SenseiContentsPage';
import { TrainableContentsPage } from '../pages/admin/TrainableContentsPage';
import { UsersPage } from '../pages/admin/UsersPage';
import { CharactersPage } from '../pages/admin/CharactersPage';
import { CharacterDetailPage } from '../pages/admin/CharacterDetailPage';

function RequireAuth() {
  const { token, user } = useAuthStore();
  if (!token || user?.role !== 'admin') {
    return <Navigate to="/login" replace />;
  }
  return (
    <Layout>
      <Outlet />
    </Layout>
  );
}

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/',
    element: <Navigate to="/admin/clans" replace />,
  },
  {
    path: '/admin',
    element: <RequireAuth />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'clans', element: <ClansPage /> },
      { path: 'releases', element: <ReleasesPage /> },
      { path: 'jutsu-ranks', element: <JutsuRanksPage /> },
      { path: 'ninja-ranks', element: <NinjaRanksPage /> },
      { path: 'jutsus', element: <JutsusPage /> },
      { path: 'libraries', element: <LibrariesPage /> },
      { path: 'libraries/:libraryId/scrolls', element: <LibraryScrollsPage /> },
      { path: 'senseis', element: <SenseisPage /> },
      { path: 'senseis/:senseiId/contents', element: <SenseiContentsPage /> },
      { path: 'trainable-contents', element: <TrainableContentsPage /> },
      { path: 'users', element: <UsersPage /> },
      { path: 'characters', element: <CharactersPage /> },
      { path: 'characters/:characterId', element: <CharacterDetailPage /> },
    ],
  },
]);
