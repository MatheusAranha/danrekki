import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../stores/auth';
import { Layout } from '../components/Layout';
import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/admin/DashboardPage';
import { ClansPage } from '../pages/admin/ClansPage';
import { KeywordsPage } from '../pages/admin/KeywordsPage';
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
import { PlayerLayout } from '../pages/player/PlayerLayout';
import { PlayerHomePage } from '../pages/player/PlayerHomePage';
import { TrainingCatalogPage } from '../pages/player/TrainingCatalogPage';
import { LearningProgressPage } from '../pages/player/LearningProgressPage';
import { DtHistoryPage } from '../pages/player/DtHistoryPage';
import { MyJutsusPage } from '../pages/player/MyJutsusPage';

function RootRedirect() {
  const { token, user } = useAuthStore();
  if (!token) return <Navigate to="/login" replace />;
  if (user?.role === 'admin') return <Navigate to="/admin/clans" replace />;
  return <Navigate to="/player" replace />;
}

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

function RequirePlayer() {
  const { token } = useAuthStore();
  if (!token) return <Navigate to="/login" replace />;
  return (
    <PlayerLayout>
      <Outlet />
    </PlayerLayout>
  );
}

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/',
    element: <RootRedirect />,
  },
  {
    path: '/admin',
    element: <RequireAuth />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'clans', element: <ClansPage /> },
      { path: 'keywords', element: <KeywordsPage /> },
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
  {
    path: '/player',
    element: <RequirePlayer />,
    children: [
      { index: true, element: <PlayerHomePage /> },
      { path: 'catalog', element: <TrainingCatalogPage /> },
      { path: 'my-jutsus', element: <MyJutsusPage /> },
      { path: 'progress', element: <LearningProgressPage /> },
      { path: 'dt-history', element: <DtHistoryPage /> },
    ],
  },
]);
