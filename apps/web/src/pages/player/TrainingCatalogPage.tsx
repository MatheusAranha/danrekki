import { useEffect, useState, useCallback } from 'react';
import {
  charactersApi,
  Character,
  CatalogEntry,
  TrainingCatalog,
} from '../../api/characters';
import { useAuthStore } from '../../stores/auth';
import { useToastStore } from '../../stores/toast';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { Spinner } from '../../components/Spinner';
import { Modal } from '../../components/Modal';

// Element → badge variant mapping (using inline class for purple/pink not in Badge)
const elementBadgeClass: Record<string, string> = {
  katon: 'bg-red-500/20 text-red-400',
  suiton: 'bg-blue-500/20 text-blue-400',
  doton: 'bg-yellow-500/20 text-yellow-400',
  futon: 'bg-green-500/20 text-green-400',
  raiton: 'bg-purple-500/20 text-purple-400',
  iryo: 'bg-pink-500/20 text-pink-400',
};

function ElementBadge({ element }: { element: string }) {
  const cls =
    elementBadgeClass[element.toLowerCase()] ?? 'bg-gray-700 text-gray-400';
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${cls}`}>
      {element}
    </span>
  );
}

function StatusBadge({ entry }: { entry: CatalogEntry }) {
  const progress = entry.learning_progress;
  if (!progress) {
    return <Badge variant="gray">Not started</Badge>;
  }
  if (progress.status === 'completed') {
    return <Badge variant="green">Completed</Badge>;
  }
  return (
    <Badge variant="blue">
      In Progress ({progress.dt_invested}/{progress.dt_required} DT)
    </Badge>
  );
}

interface InvestModalState {
  open: boolean;
  entry: CatalogEntry | null;
  amount: string;
  loading: boolean;
}

interface CatalogSectionProps {
  title: string;
  entries: CatalogEntry[];
  characterId: string;
  onStartLearning: (entry: CatalogEntry) => Promise<void>;
  onInvestDt: (entry: CatalogEntry) => void;
  startingId: string | null;
}

function CatalogSection({
  title,
  entries,
  onStartLearning,
  onInvestDt,
  startingId,
}: CatalogSectionProps) {
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
          const contentId = entry.trainable_content.jutsu_id ?? entry.trainable_content._id;
          const isStarting = startingId === contentId;

          return (
            <div
              key={entry.trainable_content._id}
              className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-4"
            >
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="font-medium text-gray-100 text-sm">
                    {entry.trainable_content.name}
                  </span>
                  <Badge variant="gray">{entry.trainable_content.type}</Badge>
                </div>

                {entry.jutsu && entry.jutsu.elements.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-2">
                    {entry.jutsu.elements.map((el) => (
                      <ElementBadge key={el} element={el} />
                    ))}
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400">
                  <span>
                    <span className="text-gray-500">DT Cost:</span>{' '}
                    <span className="text-indigo-400 font-medium">
                      {entry.dt_cost}
                    </span>
                  </span>
                  <StatusBadge entry={entry} />
                </div>
              </div>

              <div className="flex gap-2 flex-shrink-0">
                {!progress && (
                  <Button
                    size="sm"
                    variant="primary"
                    loading={isStarting}
                    onClick={() => onStartLearning(entry)}
                  >
                    Start Learning
                  </Button>
                )}
                {progress?.status === 'in_progress' && (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => onInvestDt(entry)}
                  >
                    Invest DT
                  </Button>
                )}
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
  const [loading, setLoading] = useState(true);
  const [includeIneligible, setIncludeIneligible] = useState(false);
  const [startingId, setStartingId] = useState<string | null>(null);
  const [investModal, setInvestModal] = useState<InvestModalState>({
    open: false,
    entry: null,
    amount: '',
    loading: false,
  });

  const loadCatalog = useCallback(
    async (charId: string, ineligible: boolean) => {
      try {
        const data = await charactersApi.getTrainingCatalog(charId, ineligible);
        setCatalog(data);
      } catch (err: unknown) {
        const axiosErr = err as {
          response?: { status?: number; data?: { error?: string } };
          message?: string;
        };
        if (axiosErr.response?.status === 403) {
          showToast(
            axiosErr.response.data?.error ?? 'Access denied to training catalog.',
            'error'
          );
        } else {
          showToast('Failed to load training catalog.', 'error');
        }
      }
    },
    [showToast]
  );

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const all = await charactersApi.list();
        const match = all.find((c) => c.user_id === user?._id) ?? null;
        setCharacter(match);
        if (match) {
          await loadCatalog(match._id, includeIneligible);
        }
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
    const contentId = entry.trainable_content.jutsu_id ?? entry.trainable_content._id;
    setStartingId(contentId);
    try {
      await charactersApi.startLearning(character._id, {
        trainable_content_id: entry.trainable_content._id,
      });
      showToast('Learning started!', 'success');
      await loadCatalog(character._id, includeIneligible);
    } catch (err: unknown) {
      const axiosErr = err as {
        response?: { status?: number; data?: { error?: string } };
        message?: string;
      };
      if (axiosErr.response?.status === 403) {
        showToast(
          axiosErr.response.data?.error ?? 'Access denied.',
          'error'
        );
      } else {
        showToast(
          axiosErr.response?.data?.error ?? 'Failed to start learning.',
          'error'
        );
      }
    } finally {
      setStartingId(null);
    }
  };

  const handleOpenInvestModal = (entry: CatalogEntry) => {
    setInvestModal({ open: true, entry, amount: '', loading: false });
  };

  const handleCloseInvestModal = () => {
    if (investModal.loading) return;
    setInvestModal({ open: false, entry: null, amount: '', loading: false });
  };

  const handleInvestDt = async () => {
    if (!character || !investModal.entry?.learning_progress) return;
    const amount = parseInt(investModal.amount, 10);
    if (!amount || amount <= 0) {
      showToast('Enter a valid amount.', 'error');
      return;
    }

    setInvestModal((prev) => ({ ...prev, loading: true }));
    try {
      await charactersApi.investDt(
        character._id,
        investModal.entry.learning_progress._id,
        { amount }
      );
      showToast('DT invested successfully!', 'success');
      setInvestModal({ open: false, entry: null, amount: '', loading: false });
      await loadCatalog(character._id, includeIneligible);
    } catch (err: unknown) {
      const axiosErr = err as {
        response?: { data?: { error?: string } };
        message?: string;
      };
      showToast(
        axiosErr.response?.data?.error ?? 'Failed to invest DT.',
        'error'
      );
      setInvestModal((prev) => ({ ...prev, loading: false }));
    }
  };

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
        No character assigned to your account.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">Training Catalog</h1>
          <p className="text-sm text-gray-400 mt-1">
            Available training content for {character.name}
          </p>
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
        <div className="text-center py-10 text-gray-500">
          No catalog data available.
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          <CatalogSection
            title="Library"
            entries={catalog.library_entries}
            characterId={character._id}
            onStartLearning={handleStartLearning}
            onInvestDt={handleOpenInvestModal}
            startingId={startingId}
          />
          <CatalogSection
            title="Sensei"
            entries={catalog.sensei_entries}
            characterId={character._id}
            onStartLearning={handleStartLearning}
            onInvestDt={handleOpenInvestModal}
            startingId={startingId}
          />
        </div>
      )}

      <Modal
        isOpen={investModal.open}
        title="Invest DT"
        onClose={handleCloseInvestModal}
        size="sm"
      >
        <div className="flex flex-col gap-4">
          {investModal.entry && (
            <p className="text-sm text-gray-400">
              Investing DT in{' '}
              <span className="text-gray-200 font-medium">
                {investModal.entry.trainable_content.name}
              </span>
              . Current progress:{' '}
              <span className="text-indigo-400">
                {investModal.entry.learning_progress?.dt_invested ?? 0}/
                {investModal.entry.learning_progress?.dt_required ?? 0} DT
              </span>
            </p>
          )}

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-300">
              Amount (DT)
            </label>
            <input
              type="number"
              min={1}
              value={investModal.amount}
              onChange={(e) =>
                setInvestModal((prev) => ({ ...prev, amount: e.target.value }))
              }
              placeholder="e.g. 10"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-gray-100 text-sm placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div className="flex gap-2 justify-end">
            <Button
              variant="secondary"
              onClick={handleCloseInvestModal}
              disabled={investModal.loading}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleInvestDt}
              loading={investModal.loading}
            >
              Invest
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
