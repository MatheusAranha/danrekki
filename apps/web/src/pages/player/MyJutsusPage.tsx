import { useCallback, useEffect, useState } from 'react';
import { charactersApi, Character, CatalogEntry, Jutsu } from '../../api/characters';
import { releasesApi, Release } from '../../api/releases';
import { useAuthStore } from '../../stores/auth';
import { useToastStore } from '../../stores/toast';
import { Spinner } from '../../components/Spinner';
import { Modal } from '../../components/Modal';

const elementBadgeClass: Record<string, string> = {
  katon: 'bg-red-500/20 text-red-400',
  suiton: 'bg-blue-500/20 text-blue-400',
  doton: 'bg-yellow-500/20 text-yellow-400',
  futon: 'bg-green-500/20 text-green-400',
  raiton: 'bg-purple-500/20 text-purple-400',
};

function ElementBadge({ element }: { element: string }) {
  const cls = elementBadgeClass[element.toLowerCase()] ?? 'bg-gray-700 text-gray-400';
  return <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${cls}`}>{element}</span>;
}

function JutsuCard({
  jutsu,
  keywordMap,
  onClick,
}: {
  jutsu: Jutsu;
  keywordMap: Record<string, string>;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-left hover:border-indigo-500/50 hover:bg-gray-800/50 transition-all group w-full"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="font-semibold text-gray-100 text-sm group-hover:text-indigo-400 transition-colors leading-tight">
          {jutsu.name}
        </h3>
        <span className="text-xs text-indigo-400 font-medium whitespace-nowrap flex-shrink-0">
          {jutsu.chakra_cost}
        </span>
      </div>

      <div className="flex flex-wrap gap-1 mb-2">
        {jutsu.elements.map((el) => <ElementBadge key={el} element={el} />)}
        {jutsu.keyword_ids.slice(0, 3).map((id) => (
          <span key={id} className="px-1.5 py-0.5 rounded text-xs bg-orange-500/10 text-orange-400">
            {keywordMap[id] ?? id}
          </span>
        ))}
      </div>

      <div className="flex gap-3 text-xs text-gray-500 mb-2">
        <span>{jutsu.casting_time}</span>
        <span>·</span>
        <span>{jutsu.range}</span>
      </div>

      <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">{jutsu.description}</p>
    </button>
  );
}

function JutsuDetailModal({
  jutsu,
  keywordMap,
  onClose,
}: {
  jutsu: Jutsu;
  keywordMap: Record<string, string>;
  onClose: () => void;
}) {
  return (
    <Modal isOpen title={jutsu.name} onClose={onClose} size="lg">
      <div className="flex flex-col gap-4 text-sm">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { label: 'Casting Time', value: jutsu.casting_time },
            { label: 'Range', value: jutsu.range },
            { label: 'Chakra Cost', value: jutsu.chakra_cost },
            { label: 'Components', value: jutsu.components },
            { label: 'Duration', value: jutsu.duration },
          ].map(({ label, value }) => (
            <div key={label} className="bg-gray-800 rounded-lg p-3">
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-0.5">{label}</p>
              <p className="text-gray-200 font-medium">{value || '—'}</p>
            </div>
          ))}
        </div>

        {jutsu.elements.length > 0 && (
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Elements</p>
            <div className="flex flex-wrap gap-1">
              {jutsu.elements.map((el) => <ElementBadge key={el} element={el} />)}
            </div>
          </div>
        )}

        {jutsu.keyword_ids.length > 0 && (
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Keywords</p>
            <div className="flex flex-wrap gap-1">
              {jutsu.keyword_ids.map((id) => (
                <span key={id} className="px-2 py-0.5 rounded-full text-xs bg-orange-500/20 text-orange-300">
                  {keywordMap[id] ?? id}
                </span>
              ))}
            </div>
          </div>
        )}

        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Description</p>
          <p className="text-gray-300 leading-relaxed">{jutsu.description}</p>
        </div>

        {jutsu.at_higher_ranks && (
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">At Higher Ranks</p>
            <p className="text-gray-400 leading-relaxed">{jutsu.at_higher_ranks}</p>
          </div>
        )}
      </div>
    </Modal>
  );
}

export function MyJutsusPage() {
  const { user } = useAuthStore();
  const { show: showToast } = useToastStore();

  const [character, setCharacter] = useState<Character | null>(null);
  const [learnedJutsus, setLearnedJutsus] = useState<Jutsu[]>([]);
  const [keywords, setKeywords] = useState<Release[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Jutsu | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [all, kw] = await Promise.all([charactersApi.list(), releasesApi.list()]);
      const match = all.find((c) => c.user_id === user?._id) ?? null;
      setCharacter(match);
      setKeywords(kw);

      if (!match) return;

      // Fetch catalog with ineligible included to capture all completed jutsus.
      const catalog = await charactersApi.getTrainingCatalog(match._id, true);
      const allEntries: CatalogEntry[] = [...catalog.library_entries, ...catalog.sensei_entries];

      // Deduplicate by trainable content ID, keep only completed jutsu entries.
      const seen = new Set<string>();
      const jutsus: Jutsu[] = [];
      for (const entry of allEntries) {
        if (
          entry.learning_progress?.status === 'completed' &&
          entry.jutsu &&
          !seen.has(entry.trainable_content._id)
        ) {
          seen.add(entry.trainable_content._id);
          jutsus.push(entry.jutsu);
        }
      }
      jutsus.sort((a, b) => a.name.localeCompare(b.name));
      setLearnedJutsus(jutsus);
    } catch {
      showToast('Failed to load learned jutsus.', 'error');
    } finally {
      setLoading(false);
    }
  }, [user, showToast]);

  useEffect(() => { load(); }, [load]);

  const keywordMap = Object.fromEntries(keywords.map((k) => [k._id, k.name]));
  const filtered = search.trim()
    ? learnedJutsus.filter((j) => j.name.toLowerCase().includes(search.toLowerCase()))
    : learnedJutsus;

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  if (!character) {
    return <div className="text-center py-20 text-gray-400">No character assigned to your account.</div>;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">My Jutsus</h1>
          <p className="text-sm text-gray-400 mt-1">
            {learnedJutsus.length} jutsu{learnedJutsus.length !== 1 ? 's' : ''} learned
          </p>
        </div>
        <input
          className="w-full sm:w-64 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-gray-100 text-sm placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          placeholder="Search jutsus..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          {learnedJutsus.length === 0
            ? 'No jutsus learned yet. Complete training to see them here.'
            : 'No jutsus match your search.'}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((jutsu) => (
            <JutsuCard
              key={jutsu._id}
              jutsu={jutsu}
              keywordMap={keywordMap}
              onClick={() => setSelected(jutsu)}
            />
          ))}
        </div>
      )}

      {selected && (
        <JutsuDetailModal
          jutsu={selected}
          keywordMap={keywordMap}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}
