import { useEffect, useState } from 'react';
import { charactersApi, Character, DtTransaction } from '../../api/characters';
import { useAuthStore } from '../../stores/auth';
import { useToastStore } from '../../stores/toast';
import { Spinner } from '../../components/Spinner';

function formatDate(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function DtHistoryPage() {
  const { user } = useAuthStore();
  const { show: showToast } = useToastStore();

  const [character, setCharacter] = useState<Character | null>(null);
  const [transactions, setTransactions] = useState<DtTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const all = await charactersApi.list();
        const match = all.find((c) => c.user_id === user?._id) ?? null;
        setCharacter(match);
        if (match) {
          const txs = await charactersApi.getDtTransactions(match._id);
          // Sort by created_at desc
          const sorted = [...txs].sort(
            (a, b) =>
              new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
          setTransactions(sorted);
        }
      } catch {
        showToast('Failed to load DT history.', 'error');
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
        No character assigned to your account.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-100">DT History</h1>
        <p className="text-sm text-gray-400 mt-1">
          Training Day transactions for {character.name}
        </p>
      </div>

      {transactions.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No transactions yet.
        </div>
      ) : (
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Type
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Amount
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Reason
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {transactions.map((tx) => {
                  const isCredit = tx.amount > 0;
                  return (
                    <tr
                      key={tx._id}
                      className="hover:bg-gray-800/50 transition-colors"
                    >
                      <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">
                        {formatDate(tx.created_at)}
                      </td>
                      <td className="px-4 py-3">
                        {isCredit ? (
                          <span className="rounded-full px-2 py-0.5 text-xs font-medium bg-green-500/20 text-green-400">
                            Credit
                          </span>
                        ) : (
                          <span className="rounded-full px-2 py-0.5 text-xs font-medium bg-red-500/20 text-red-400">
                            Debit
                          </span>
                        )}
                      </td>
                      <td
                        className={`px-4 py-3 font-semibold ${
                          isCredit ? 'text-green-400' : 'text-red-400'
                        }`}
                      >
                        {isCredit ? '+' : ''}
                        {tx.amount.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-gray-300">
                        {tx.reason}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
