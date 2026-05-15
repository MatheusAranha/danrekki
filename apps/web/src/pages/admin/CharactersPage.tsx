import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { charactersApi, Character } from '../../api/characters';
import { useToastStore } from '../../stores/toast';
import { PageHeader } from '../../components/PageHeader';
import { DataTable, Column } from '../../components/DataTable';

export function CharactersPage() {
  const { show } = useToastStore();
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setCharacters(await charactersApi.list());
      } catch {
        show('Failed to load characters', 'error');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const columns: Column<Character>[] = [
    { key: 'name', label: 'Name' },
    {
      key: 'user_id',
      label: 'User ID',
      render: (c) => <span className="text-gray-400 font-mono text-xs">{c.user_id.slice(0, 8)}...</span>,
    },
    {
      key: 'clan_id',
      label: 'Clan ID',
      render: (c) => <span className="text-gray-400 font-mono text-xs">{c.clan_id.slice(0, 8)}...</span>,
    },
    {
      key: 'available_dt',
      label: 'Available DT',
      render: (c) => (
        <span className="text-orange-400 font-semibold">{c.available_dt.toLocaleString()}</span>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Characters"
        description="Player characters (read-only — created by players)."
      />
      <DataTable
        columns={columns}
        data={characters}
        loading={loading}
        actions={(char) => (
          <Link
            to={`/admin/characters/${char._id}`}
            className="px-2 py-1 text-xs text-orange-400 hover:text-orange-300 border border-orange-500/30 rounded-lg hover:bg-orange-500/10 transition-colors"
          >
            View →
          </Link>
        )}
        emptyMessage="No characters found."
      />
    </div>
  );
}
