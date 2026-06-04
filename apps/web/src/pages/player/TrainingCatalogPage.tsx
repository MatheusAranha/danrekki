import { useEffect, useState, useCallback } from 'react';
import {
  charactersApi,
  Character,
  CatalogEntry,
  TrainingCatalog,
  Jutsu,
} from '../../api/characters';
import { releasesApi, Release } from '../../api/releases';
import { useAuthStore } from '../../stores/auth';
import { useToastStore } from '../../stores/toast';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
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

function ProgressBar({ invested, required }: { invested: number; required: number }) {
  const pct = required > 0 ? Math.min(100, Math.round((invested / required) * 100)) : 0;
  return (
    <div className="mt-3">
      <div className="flex justify-between text-xs text-gray-500 mb-1">
        <span>{invested} / {required} DT</span>
        <span>{pct}%</span>
      </div>
      <div className="w-full bg-gray-800 rounded-full h-1.5">
        <div
          className={`h-1.5 rounded-full transition-all ${pct >= 100 ? 'bg-green-500' : 'bg-indigo-500'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function JutsuDetailModal({
  jutsu,
  keywordMap,
  dtCost,
  onClose,
}: {
  jutsu: Jutsu;
  keywordMap: Record<string, string>;
  dtCost: number;
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
            { label: 'DT to Learn', value: `${dtCost} DT` },
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

type DtSource = 'solo' | 'library' | 'sensei';
const SOURCE_MULTIPLIER: Record<DtSource, number> = { solo: 1, library: 1.5, sensei: 2 };
const SOURCE_LABELS: Record<DtSource, string> = { solo: 'Solo (×1)', library: 'Library Scroll (×1.5)', sensei: 'With Sensei (×2)' };

interface InvestModalState {
  open: boolean;
  entry: CatalogEntry | null;
  amount: string;
  source: DtSource;
  loading: boolean;
}

interface CatalogSectionProps {
  title: string;
  entries: CatalogEntry[];
  onStartLearning: (entry: CatalogEntry) => Promise<void>;
  onInvestDt: (entry: CatalogEntry) => void;
  onViewDetail: (entry: CatalogEntry) => void;
  startingId: string | null;
}

function CatalogSection({ title, entries, onStartLearning, onInvestDt, onViewDetail, startingId }: CatalogSectionProps) {
  if (entries.length === 0) {
    return (
      <div>
        <h2 className="text-lg font-semibold text-gray-200 mb-3">{title}</h2>
        <p className="text-sm text-gray-500">No entries.</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-200 mb-3">{title}</h2>
      <div className="flex flex-col gap-3">
        {entries.map((entry) => {
          const progress = entry.learning_progress;
          const contentId = entry.trainable_content._id;
          const isStarting = startingId === contentId;
          const isCompleted = progress?.status === 'completed';

          return (
            <div key={contentId} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <button
                      className="font-medium text-gray-100 text-sm hover:text-indigo-400 transition-colors text-left"
                      onClick={() => entry.jutsu && onViewDetail(entry)}
                      title={entry.jutsu ? 'Click to view jutsu details' : undefined}
                    >
                      {entry.trainable_content.name}
                    </button>
                    <Badge variant="gray">{entry.trainable_content.type}</Badge>
                    {isCompleted && <Badge variant="green">Completed</Badge>}
                    {progress && !isCompleted && <Badge variant="blue">In Progress</Badge>}
                    {!progress && <Badge variant="gray">Not started</Badge>}
                  </div>

                  {entry.jutsu && entry.jutsu.elements.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {entry.jutsu.elements.map((el) => <ElementBadge key={el} element={el} />)}
                    </div>
                  )}

                  <div className="text-xs text-gray-400">
                    <span className="text-gray-500">DT Cost: </span>
                    <span className="text-indigo-400 font-medium">{entry.dt_cost}</span>
                  </div>

                  {progress && (
                    <ProgressBar invested={progress.dt_invested} required={progress.dt_required} />
                  )}
                </div>

                <div className="flex gap-2 flex-shrink-0">
                  {entry.jutsu && (
                    <Button size="sm" variant="secondary" onClick={() => onViewDetail(entry)}>
                      Details
                    </Button>
                  )}
                  {!progress && (
                    <Button size="sm" variant="primary" loading={isStarting} onClick={() => onStartLearning(entry)}>
                      Start
                    </Button>
                  )}
                  {progress?.status === 'in_progress' && (
                    <Button size="sm" variant="primary" onClick={() => onInvestDt(entry)}>
                      Invest DT
                    </Button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function TrainingCatalogPage() {
  const { user } = useAuthStore();
  const { show: showToast } = useToastStore();

  const [character, setCharacter] = useState<Character | null>(null);
  const [catalog, setCatalog] = useState<TrainingCatalog | null>(null);
  const [keywords, setKeywords] = useState<Release[]>([]);
  const [loading, setLoading] = useState(true);
  const [includeIneligible, setIncludeIneligible] = useState(false);
  const [startingId, setStartingId] = useState<string | null>(null);
  const [detailEntry, setDetailEntry] = useState<CatalogEntry | null>(null);
  const [investModal, setInvestModal] = useState<InvestModalState>({
    open: false, entry: null, amount: '', source: 'solo', loading: false,
  });

  const loadCatalog = useCallback(async (charId: string, ineligible: boolean) => {
    try {
      const data = await charactersApi.getTrainingCatalog(charId, ineligible);
      setCatalog(data);
    } catch (err: unknown) {
      const e = err as { response?: { status?: number; data?: { error?: string } }; message?: string };
      showToast(e.response?.data?.error ?? 'Failed to load training catalog.', 'error');
    }
  }, [showToast]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [all, kw] = await Promise.all([charactersApi.list(), releasesApi.list()]);
        const match = all.find((c) => c.user_id === user?._id) ?? null;
        setCharacter(match);
        setKeywords(kw);
        if (match) await loadCatalog(match._id, includeIneligible);
      } catch {
        showToast('Failed to load character.', 'error');
      } finally {
        setLoading(false);
      }
    };
    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useEffect(() => {
    if (!character) return;
    loadCatalog(character._id, includeIneligible);
  }, [includeIneligible, character, loadCatalog]);

  const handleStartLearning = async (entry: CatalogEntry) => {
    if (!character) return;
    setStartingId(entry.trainable_content._id);
    try {
      await charactersApi.startLearning(character._id, { trainable_content_id: entry.trainable_content._id });
      showToast('Learning started!', 'success');
      await loadCatalog(character._id, includeIneligible);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } }; message?: string };
      showToast(e.response?.data?.error ?? 'Failed to start learning.', 'error');
    } finally {
      setStartingId(null);
    }
  };

  const handleOpenInvestModal = (entry: CatalogEntry) => {
    setInvestModal({ open: true, entry, amount: '', source: 'solo', loading: false });
  };

  const handleCloseInvestModal = () => {
    if (investModal.loading) return;
    setInvestModal({ open: false, entry: null, amount: '', source: 'solo', loading: false });
  };

  const handleInvestDt = async () => {
    if (!character || !investModal.entry?.learning_progress) return;
    const amount = parseInt(investModal.amount, 10);
    if (!amount || amount <= 0) { showToast('Enter a valid amount.', 'error'); return; }

    setInvestModal((prev) => ({ ...prev, loading: true }));
    try {
      await charactersApi.investDt(character._id, investModal.entry.learning_progress._id, {
        amount,
        source: investModal.source,
      });
      showToast('DT invested!', 'success');
      setInvestModal({ open: false, entry: null, amount: '', source: 'solo', loading: false });
      await loadCatalog(character._id, includeIneligible);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } }; message?: string };
      showToast(e.response?.data?.error ?? 'Failed to invest DT.', 'error');
      setInvestModal((prev) => ({ ...prev, loading: false }));
    }
  };

  const keywordMap = Object.fromEntries(keywords.map((k) => [k._id, k.name]));

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  if (!character) {
    return <div className="text-center py-20 text-gray-400">No character assigned to your account.</div>;
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">Training Catalog</h1>
          <p className="text-sm text-gray-400 mt-1">Available training content for {character.name}</p>
        </div>
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={includeIneligible}
            onChange={(e) => setIncludeIneligible(e.target.checked)}
            className="w-4 h-4 rounded accent-indigo-500"
          />
          <span className="text-sm text-gray-400">Show ineligible jutsus</span>
        </label>
      </div>

      {!catalog ? (
        <div className="text-center py-10 text-gray-500">No catalog data available.</div>
      ) : (
        <div className="flex flex-col gap-8">
          <CatalogSection
            title="Library"
            entries={catalog.library_entries}
            onStartLearning={handleStartLearning}
            onInvestDt={handleOpenInvestModal}
            onViewDetail={setDetailEntry}
            startingId={startingId}
          />
          <CatalogSection
            title="Sensei"
            entries={catalog.sensei_entries}
            onStartLearning={handleStartLearning}
            onInvestDt={handleOpenInvestModal}
            onViewDetail={setDetailEntry}
            startingId={startingId}
          />
        </div>
      )}

      {/* Jutsu detail modal (item 7) */}
      {detailEntry?.jutsu && (
        <JutsuDetailModal
          jutsu={detailEntry.jutsu}
          keywordMap={keywordMap}
          dtCost={detailEntry.dt_cost}
          onClose={() => setDetailEntry(null)}
        />
      )}

      {/* Invest DT modal */}
      <Modal isOpen={investModal.open} title="Invest DT" onClose={handleCloseInvestModal} size="sm">
        <div className="flex flex-col gap-4">
          {investModal.entry && (() => {
            const p = investModal.entry.learning_progress;
            const multiplier = SOURCE_MULTIPLIER[investModal.source];
            const effective = investModal.amount ? Math.ceil(parseInt(investModal.amount, 10) * multiplier) : 0;
            const remaining = p ? p.dt_required - p.dt_invested : 0;
            return (
              <>
                <p className="text-sm text-gray-400">
                  Training: <span className="text-gray-200 font-medium">{investModal.entry.trainable_content.name}</span>
                  <br />
                  Progress: <span className="text-indigo-400">{p?.dt_invested ?? 0} / {p?.dt_required ?? 0} DT</span>
                  {' '}— <span className="text-orange-400">{remaining} effective DT remaining</span>
                </p>
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-gray-300">How are you training?</label>
                  <div className="flex flex-col gap-1.5">
                    {(['solo', 'library', 'sensei'] as DtSource[]).map((s) => (
                      <label key={s} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="source"
                          value={s}
                          checked={investModal.source === s}
                          onChange={() => setInvestModal((prev) => ({ ...prev, source: s }))}
                          className="accent-indigo-500"
                        />
                        <span className="text-sm text-gray-300">{SOURCE_LABELS[s]}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-gray-300">DT to spend</label>
                  <input
                    type="number"
                    min={1}
                    value={investModal.amount}
                    onChange={(e) => setInvestModal((prev) => ({ ...prev, amount: e.target.value }))}
                    placeholder="e.g. 10"
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-gray-100 text-sm placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                  {effective > 0 && (
                    <p className="text-xs text-indigo-400">
                      → {effective} effective DT progress ({multiplier}× multiplier)
                    </p>
                  )}
                </div>
              </>
            );
          })()}
          <div className="flex gap-2 justify-end">
            <Button variant="secondary" onClick={handleCloseInvestModal} disabled={investModal.loading}>Cancel</Button>
            <Button variant="primary" onClick={handleInvestDt} loading={investModal.loading}>Invest</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
