import { useEffect, useState, useCallback } from 'react';
import {
  charactersApi,
  Character,
  LearningProgress,
} from '../../api/characters';
import { useAuthStore } from '../../stores/auth';
import { useToastStore } from '../../stores/toast';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { Spinner } from '../../components/Spinner';
import { Modal } from '../../components/Modal';

function formatDate(iso: string | null) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function shortId(id: string) {
  return id.slice(-8);
}

function progressPercent(progress: LearningProgress) {
  if (progress.dt_required === 0) return 0;
  return Math.min(
    100,
    Math.round((progress.dt_invested / progress.dt_required) * 100)
  );
}

interface InvestModalState {
  open: boolean;
  progress: LearningProgress | null;
  amount: string;
  loading: boolean;
}

export function LearningProgressPage() {
  const { user } = useAuthStore();
  const { show: showToast } = useToastStore();

  const [character, setCharacter] = useState<Character | null>(null);
  const [progressList, setProgressList] = useState<LearningProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [investModal, setInvestModal] = useState<InvestModalState>({
    open: false,
    progress: null,
    amount: '',
    loading: false,
  });

  const loadProgress = useCallback(
    async (charId: string) => {
      try {
        const data = await charactersApi.getLearningProgress(charId);
        // Sort: in_progress first, then by started_at desc
        const sorted = [...data].sort((a, b) => {
          if (a.status === b.status) {
            return (
              new Date(b.started_at).getTime() -
              new Date(a.started_at).getTime()
            );
          }
          return a.status === 'in_progress' ? -1 : 1;
        });
        setProgressList(sorted);
      } catch {
        showToast('Failed to load learning progress.', 'error');
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
          await loadProgress(match._id);
        }
      } catch {
        showToast('Failed to load character.', 'error');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user, showToast, loadProgress]);

  const handleOpenInvestModal = (progress: LearningProgress) => {
    setInvestModal({ open: true, progress, amount: '', loading: false });
  };

  const handleCloseInvestModal = () => {
    if (investModal.loading) return;
    setInvestModal({ open: false, progress: null, amount: '', loading: false });
  };

  const handleInvestDt = async () => {
    if (!character || !investModal.progress) return;
    const amount = parseInt(investModal.amount, 10);
    if (!amount || amount <= 0) {
      showToast('Enter a valid amount.', 'error');
      return;
    }

    setInvestModal((prev) => ({ ...prev, loading: true }));
    try {
      await charactersApi.investDt(character._id, investModal.progress._id, {
        amount,
        source: 'solo',
      });
      showToast('DT invested successfully!', 'success');
      setInvestModal({ open: false, progress: null, amount: '', loading: false });
      await loadProgress(character._id);
    } catch (err: unknown) {
      const axiosErr = err as {
        response?: { data?: { error?: string } };
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
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-100">My Progress</h1>
        <p className="text-sm text-gray-400 mt-1">
          Learning progress for {character.name}
        </p>
      </div>

      {progressList.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No learning progress yet. Start from the Training Catalog.
        </div>
      ) : (
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Content
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                    DT Invested
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                    DT Required
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Progress
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Started
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Completed
                  </th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {progressList.map((p) => {
                  const pct = progressPercent(p);
                  return (
                    <tr key={p._id} className="hover:bg-gray-800/50 transition-colors">
                      <td className="px-4 py-3 font-mono text-gray-400 text-xs">
                        …{shortId(p.trainable_content_id)}
                      </td>
                      <td className="px-4 py-3 text-gray-300">
                        {p.dt_invested.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-gray-300">
                        {p.dt_required.toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-gray-700 rounded-full h-1.5">
                            <div
                              className="bg-indigo-500 h-1.5 rounded-full"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-400">{pct}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {p.status === 'completed' ? (
                          <Badge variant="green">Completed</Badge>
                        ) : (
                          <Badge variant="blue">In Progress</Badge>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-400 text-xs">
                        {formatDate(p.started_at)}
                      </td>
                      <td className="px-4 py-3 text-gray-400 text-xs">
                        {formatDate(p.completed_at)}
                      </td>
                      <td className="px-4 py-3">
                        {p.status === 'in_progress' && (
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => handleOpenInvestModal(p)}
                          >
                            Invest DT
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal
        isOpen={investModal.open}
        title="Invest DT"
        onClose={handleCloseInvestModal}
        size="sm"
      >
        <div className="flex flex-col gap-4">
          {investModal.progress && (
            <p className="text-sm text-gray-400">
              Content:{' '}
              <span className="font-mono text-gray-200 text-xs">
                …{shortId(investModal.progress.trainable_content_id)}
              </span>
              <br />
              Current:{' '}
              <span className="text-indigo-400">
                {investModal.progress.dt_invested}/
                {investModal.progress.dt_required} DT
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
