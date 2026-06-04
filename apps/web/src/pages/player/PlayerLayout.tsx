import { NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/auth';
import { Toast } from '../../components/Toast';

interface PlayerLayoutProps {
  children: React.ReactNode;
}

const navLinks = [
  { to: '/player', label: 'My Character', end: true },
  { to: '/player/my-jutsus', label: 'My Jutsus', end: false },
  { to: '/player/catalog', label: 'Training Catalog', end: false },
  { to: '/player/progress', label: 'My Progress', end: false },
  { to: '/player/dt-history', label: 'DT History', end: false },
];

export function PlayerLayout({ children }: PlayerLayoutProps) {
  const { logout, user } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <nav className="bg-gray-900 border-b border-gray-800 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center gap-6">
          <div className="flex items-center gap-2 mr-4">
            <span className="text-lg font-bold text-gray-100">Danrekki</span>
            <span className="w-2 h-2 rounded-full bg-indigo-500" />
          </div>

          <div className="flex items-center gap-1 flex-1">
            {navLinks.map(({ to, label, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-indigo-500/20 text-indigo-400'
                      : 'text-gray-400 hover:text-gray-100 hover:bg-gray-800'
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-500 hidden sm:block">
              {user?.email}
            </span>
            <button
              onClick={handleLogout}
              className="px-3 py-1.5 rounded-lg text-sm font-medium text-gray-400 hover:text-gray-100 hover:bg-gray-800 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-4 py-8">{children}</main>

      <Toast />
    </div>
  );
}
