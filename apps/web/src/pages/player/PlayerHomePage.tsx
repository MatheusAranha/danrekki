import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { charactersApi, Character } from '../../api/characters';
import { useAuthStore } from '../../stores/auth';
import { useToastStore } from '../../stores/toast';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { Spinner } from '../../components/Spinner';

const elementColors: Record<
  string,
  'red' | 'blue' | 'orange' | 'green' | 'gray'
> = {
  katon: 'red',
  suiton: 'blue',
  doton: 'orange',
  futon: 'green',
  raiton: 'gray',
  iryo: 'gray',
};

export function PlayerHomePage() {
  const { user } = useAuthStore();
  const { show: showToast } = useToastStore();
  const navigate = useNavigate();

  const [character, setCharacter] = useState<Character | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const all = await charactersApi.list();
        const match = all.find((c) => c.user_id === user?._id) ?? null;
        setCharacter(match);
      } catch {
        showToast('Failed to load character data.', 'error');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user, showToast]);

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
        <p className="text-lg">No character assigned to your account.</p>
        <p className="text-sm mt-2">
          Contact an administrator to have a character linked to you.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-100">{character.name}</h1>
        <p className="text-sm text-gray-400 mt-1">Your character profile</p>
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
            {character.clan_id}
          </p>
        </div>
      </div>

      {character.elemental_affinities &&
        character.elemental_affinities.length > 0 && (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-3">
              Elemental Affinities
            </p>
            <div className="flex flex-wrap gap-2">
              {character.elemental_affinities.map((el) => (
                <Badge
                  key={el}
                  variant={elementColors[el.toLowerCase()] ?? 'gray'}
                >
                  {el}
                </Badge>
              ))}
            </div>
          </div>
        )}

      <div className="flex gap-3">
        <Button
          variant="primary"
          onClick={() => navigate('/player/catalog')}
        >
          Training Catalog
        </Button>
        <Button
          variant="secondary"
          onClick={() => navigate('/player/progress')}
        >
          My Progress
        </Button>
      </div>
    </div>
  );
}
