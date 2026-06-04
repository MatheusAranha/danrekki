import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { charactersApi, Character } from '../../api/characters';
import { clansApi, Clan } from '../../api/clans';
import { useAuthStore } from '../../stores/auth';
import { useToastStore } from '../../stores/toast';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { Spinner } from '../../components/Spinner';

const elementColors: Record<string, 'red' | 'blue' | 'orange' | 'green' | 'gray'> = {
  katon: 'red',
  suiton: 'blue',
  doton: 'orange',
  futon: 'green',
  raiton: 'gray',
};

export function PlayerHomePage() {
  const { user } = useAuthStore();
  const { show: showToast } = useToastStore();
  const navigate = useNavigate();

  const [character, setCharacter] = useState<Character | null>(null);
  const [clanName, setClanName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [all, clans] = await Promise.all([
        charactersApi.list(),
        clansApi.list(),
      ]);
      const match = all.find((c) => c.user_id === user?._id) ?? null;
      setCharacter(match);
      if (match) {
        const clan = clans.find((cl: Clan) => cl._id === match.clan_id);
        setClanName(clan?.name ?? match.clan_id);
      }
    } catch {
      showToast('Failed to load character data.', 'error');
    } finally {
      setLoading(false);
    }
  }, [user, showToast]);

  useEffect(() => { load(); }, [load]);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!character) {
    return (
      <div className="text-center py-20 text-gray-400">
        <p className="text-lg">Your character hasn't been created yet.</p>
        <p className="text-sm mt-2">
          Your Dungeon Master will create your character. Check back after your first session.
        </p>
        <button
          onClick={load}
          className="mt-4 text-xs text-orange-400 hover:text-orange-300 underline"
        >
          Refresh
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">{character.name}</h1>
          <p className="text-sm text-gray-400 mt-1">Your character profile</p>
        </div>
        <button
          onClick={load}
          className="text-xs text-gray-500 hover:text-gray-300 border border-gray-700 rounded-lg px-3 py-1.5 transition-colors"
        >
          ↻ Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
            Available DT
          </p>
          <p className="text-3xl font-bold text-indigo-400">
            {character.available_dt.toLocaleString()}
          </p>
          <p className="text-xs text-gray-500 mt-1">Training Days</p>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">
            Clan
          </p>
          <p className="text-sm text-gray-300 font-medium">
            {clanName ?? '—'}
          </p>
        </div>
      </div>

      {character.elemental_affinities && character.elemental_affinities.length > 0 && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-3">
            Elemental Affinities
          </p>
          <div className="flex flex-wrap gap-2">
            {character.elemental_affinities.map((el) => (
              <Badge key={el} variant={elementColors[el.toLowerCase()] ?? 'gray'}>
                {el}
              </Badge>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-3">
        <Button variant="primary" onClick={() => navigate('/player/catalog')}>
          Training Catalog
        </Button>
        <Button variant="secondary" onClick={() => navigate('/player/progress')}>
          My Progress
        </Button>
      </div>
    </div>
  );
}
