import { Link } from 'react-router-dom';
import { useAuthStore } from '../../stores/auth';

const sections = [
  { label: 'Clans', to: '/admin/clans', description: 'Manage ninja clans and DT modifiers' },
  { label: 'Releases', to: '/admin/releases', description: 'Content release schedule' },
  { label: 'Jutsu Ranks', to: '/admin/jutsu-ranks', description: 'Rank tiers for jutsu learning' },
  { label: 'Ninja Ranks', to: '/admin/ninja-ranks', description: 'Shinobi rank progression' },
  { label: 'Jutsus', to: '/admin/jutsus', description: 'All learnable jutsu' },
  { label: 'Libraries', to: '/admin/libraries', description: 'Scroll libraries and access' },
  { label: 'Senseis', to: '/admin/senseis', description: 'Teachers and their content' },
  { label: 'Trainable Content', to: '/admin/trainable-contents', description: 'Skills, tools, weapons and feats' },
  { label: 'Users', to: '/admin/users', description: 'Player and admin accounts' },
  { label: 'Characters', to: '/admin/characters', description: 'Player characters' },
];

export function DashboardPage() {
  const { user } = useAuthStore();

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-100">
          Welcome back, <span className="text-orange-400">{user?.email}</span>
        </h1>
        <p className="text-gray-400 mt-1">Danrekki Admin Panel — manage your RPG world.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {sections.map((s) => (
          <Link
            key={s.to}
            to={s.to}
            className="bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-orange-500/50 hover:bg-gray-800/50 transition-all group"
          >
            <h2 className="text-base font-semibold text-gray-100 group-hover:text-orange-400 transition-colors mb-1">
              {s.label}
            </h2>
            <p className="text-sm text-gray-400">{s.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
