import { useState, useEffect, FormEvent } from 'react';
import { useParams } from 'react-router-dom';
import {
  charactersApi,
  Character,
  CharacterKeyword,
  CharacterLibrary,
  CharacterSensei,
  LearningProgress,
} from '../../api/characters';
import { releasesApi, Release } from '../../api/releases';
import { librariesApi, Library } from '../../api/libraries';
import { ninjaRanksApi, NinjaRank } from '../../api/ninja-ranks';
import { senseisApi, Sensei } from '../../api/senseis';
import { trainableContentsApi, TrainableContent } from '../../api/trainable-contents';
import { clansApi, Clan } from '../../api/clans';
import { useToastStore } from '../../stores/toast';
import { PageHeader } from '../../components/PageHeader';
import { Button } from '../../components/Button';
import { FormField } from '../../components/FormField';
import { Badge } from '../../components/Badge';
import { Spinner } from '../../components/Spinner';
import { Modal } from '../../components/Modal';
import { ConfirmDialog } from '../../components/ConfirmDialog';

const inputClass =
  'w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-gray-100 text-sm placeholder-gray-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500';

type Tab = 'libraries' | 'senseis' | 'progress';

const TABS: { key: Tab; label: string }[] = [
  { key: 'libraries', label: 'Library Access' },
  { key: 'senseis', label: 'Sensei Access' },
  { key: 'progress', label: 'Learning Progress' },
];

export function CharacterDetailPage() {
  const { characterId } = useParams<{ characterId: string }>();
  const { show } = useToastStore();

  const [character, setCharacter] = useState<Character | null>(null);
  const [clan, setClan] = useState<Clan | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('libraries');

  // Reference data
  const [releases, setReleases] = useState<Release[]>([]);
  const [libraries, setLibraries] = useState<Library[]>([]);
  const [ninjaRanks, setNinjaRanks] = useState<NinjaRank[]>([]);
  const [senseis, setSenseis] = useState<Sensei[]>([]);
  const [allContents, setAllContents] = useState<TrainableContent[]>([]);

  // Character data
  const [charKeywords, setCharReleases] = useState<CharacterKeyword[]>([]);
  const [charLibraries, setCharLibraries] = useState<CharacterLibrary[]>([]);
  const [charSenseis, setCharSenseis] = useState<CharacterSensei[]>([]);
  const [progress, setProgress] = useState<LearningProgress[]>([]);

  // DT form
  const [dtAmount, setDtAmount] = useState('');
  const [dtReason, setDtReason] = useState('');
  const [dtLoading, setDtLoading] = useState(false);

  // Elemental releases
  const [affinitiesSaving, setAffinitiesSaving] = useState(false);

  // Add modals
  const [addKeywordId, setAddReleaseId] = useState('');
  const [addLibraryId, setAddLibraryId] = useState('');
  const [addLibraryRankId, setAddLibraryRankId] = useState('');
  const [addSenseiId, setAddSenseiId] = useState('');
  const [addSenseiProximity, setAddSenseiProximity] = useState(1);
  const [keywordModalOpen, setKeywordModalOpen] = useState(false);
  const [libraryModalOpen, setLibraryModalOpen] = useState(false);
  const [senseiModalOpen, setSenseiModalOpen] = useState(false);
  const [addingSaving, setAddingSaving] = useState(false);

  // Delete confirm
  const [deleteKeywordTarget, setDeleteKeywordTarget] = useState<CharacterKeyword | null>(null);
  const [deleteLibraryTarget, setDeleteLibraryTarget] = useState<CharacterLibrary | null>(null);
  const [deleteSenseiTarget, setDeleteSenseiTarget] = useState<CharacterSensei | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadAll = async () => {
    if (!characterId) return;
    setLoading(true);
    try {
      const [char, r, l, nr, s, ac] = await Promise.all([
        charactersApi.get(characterId),
        releasesApi.list(),
        librariesApi.list(),
        ninjaRanksApi.list(),
        senseisApi.list(),
        trainableContentsApi.list(),
      ]);
      setCharacter(char);
      setReleases(r);
      setLibraries(l);
      setNinjaRanks(nr);
      setSenseis(s);
      setAllContents(ac);

      const clans = await clansApi.list();
      setClan(clans.find((c) => c._id === char.clan_id) ?? null);

      await loadCharacterData(characterId);
    } catch {
      show('Failed to load character', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadCharacterData = async (id: string) => {
    const [cr, cl, cs, p] = await Promise.all([
      charactersApi.getKeywords(id),
      charactersApi.getLibraries(id),
      charactersApi.getSenseis(id),
      charactersApi.getLearningProgress(id),
    ]);
    setCharReleases(cr);
    setCharLibraries(cl);
    setCharSenseis(cs);
    setProgress(p);
  };

  const refreshCharacter = async () => {
    if (!characterId) return;
    const char = await charactersApi.get(characterId);
    setCharacter(char);
    await loadCharacterData(characterId);
  };

  useEffect(() => { loadAll(); }, [characterId]);

  const handleToggleAffinity = async (element: string) => {
    if (!characterId || !character || affinitiesSaving) return;
    setAffinitiesSaving(true);
    try {
      const current = character.elemental_releases ?? [];
      const next = current.includes(element)
        ? current.filter((e) => e !== element)
        : [...current, element];
      const updated = await charactersApi.update(characterId, { elemental_releases: next });
      setCharacter(updated);
    } catch (err: unknown) {
      const ex = err as { response?: { data?: { error?: string } }; message?: string };
      show(ex.response?.data?.error || ex.message || 'Failed to update affinities', 'error');
    } finally {
      setAffinitiesSaving(false);
    }
  };

  const handleAddDt = async (e: FormEvent) => {
    e.preventDefault();
    if (!characterId) return;
    setDtLoading(true);
    try {
      await charactersApi.addDt(characterId, {
        amount: parseInt(dtAmount),
        reason: dtReason,
      });
      show('DT transaction recorded');
      setDtAmount('');
      setDtReason('');
      await refreshCharacter();
    } catch (err: unknown) {
      const ex = err as { response?: { data?: { error?: string } }; message?: string };
      show(ex.response?.data?.error || ex.message || 'Failed', 'error');
    } finally {
      setDtLoading(false);
    }
  };

  const handleAssignKeyword = async (e: FormEvent) => {
    e.preventDefault();
    if (!characterId) return;
    setAddingSaving(true);
    try {
      await charactersApi.assignKeyword(characterId, { keyword_id: addKeywordId });
      show('Keyword assigned');
      setKeywordModalOpen(false);
      setAddReleaseId('');
      await refreshCharacter();
    } catch (err: unknown) {
      const ex = err as { response?: { data?: { error?: string } }; message?: string };
      show(ex.response?.data?.error || ex.message || 'Failed', 'error');
    } finally {
      setAddingSaving(false);
    }
  };

  const handleRevokeKeyword = async () => {
    if (!deleteKeywordTarget || !characterId) return;
    setDeleting(true);
    try {
      await charactersApi.revokeKeyword(characterId, deleteKeywordTarget._id);
      show('Keyword removed');
      setDeleteKeywordTarget(null);
      await refreshCharacter();
    } catch (err: unknown) {
      const ex = err as { response?: { data?: { error?: string } }; message?: string };
      show(ex.response?.data?.error || ex.message || 'Failed', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const handleAssignLibrary = async (e: FormEvent) => {
    e.preventDefault();
    if (!characterId) return;
    setAddingSaving(true);
    try {
      await charactersApi.assignLibrary(characterId, {
        library_id: addLibraryId,
        required_ninja_rank_id: addLibraryRankId,
      });
      show('Library access granted');
      setLibraryModalOpen(false);
      setAddLibraryId('');
      setAddLibraryRankId('');
      await refreshCharacter();
    } catch (err: unknown) {
      const ex = err as { response?: { data?: { error?: string } }; message?: string };
      show(ex.response?.data?.error || ex.message || 'Failed', 'error');
    } finally {
      setAddingSaving(false);
    }
  };

  const handleRevokeLibrary = async () => {
    if (!deleteLibraryTarget || !characterId) return;
    setDeleting(true);
    try {
      await charactersApi.revokeLibrary(characterId, deleteLibraryTarget._id);
      show('Library access revoked');
      setDeleteLibraryTarget(null);
      await refreshCharacter();
    } catch (err: unknown) {
      const ex = err as { response?: { data?: { error?: string } }; message?: string };
      show(ex.response?.data?.error || ex.message || 'Failed', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const handleAssignSensei = async (e: FormEvent) => {
    e.preventDefault();
    if (!characterId) return;
    setAddingSaving(true);
    try {
      await charactersApi.assignSensei(characterId, {
        sensei_id: addSenseiId,
        proximity: addSenseiProximity,
      });
      show('Sensei assigned');
      setSenseiModalOpen(false);
      setAddSenseiId('');
      setAddSenseiProximity(1);
      await refreshCharacter();
    } catch (err: unknown) {
      const ex = err as { response?: { data?: { error?: string } }; message?: string };
      show(ex.response?.data?.error || ex.message || 'Failed', 'error');
    } finally {
      setAddingSaving(false);
    }
  };

  const handleRevokeSensei = async () => {
    if (!deleteSenseiTarget || !characterId) return;
    setDeleting(true);
    try {
      await charactersApi.revokeSensei(characterId, deleteSenseiTarget._id);
      show('Sensei removed');
      setDeleteSenseiTarget(null);
      await refreshCharacter();
    } catch (err: unknown) {
      const ex = err as { response?: { data?: { error?: string } }; message?: string };
      show(ex.response?.data?.error || ex.message || 'Failed', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const keywordMap = Object.fromEntries(releases.map((r) => [r._id, r.name]));
  const libraryMap = Object.fromEntries(libraries.map((l) => [l._id, l.name]));
  const rankMap = Object.fromEntries(ninjaRanks.map((r) => [r._id, r.name]));
  const senseiMap = Object.fromEntries(senseis.map((s) => [s._id, s.name]));
  const contentMap = Object.fromEntries(allContents.map((c) => [c._id, c]));

  const assignedReleaseIds = new Set(charKeywords.map((r) => r.keyword_id));
  const unassignedReleases = releases.filter((r) => !assignedReleaseIds.has(r._id));

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!character) {
    return <p className="text-gray-400">Character not found.</p>;
  }

  return (
    <div>
      <PageHeader
        title={character.name}
        description="Character details and management."
        backLink={{ label: 'Back to Characters', to: '/admin/characters' }}
      />

      {/* Info card */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Clan</p>
          <p className="text-gray-100 font-medium">{clan?.name ?? character.clan_id}</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">User ID</p>
          <p className="text-gray-100 font-mono text-sm">{character.user_id}</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Available DT</p>
          <p className="text-orange-400 font-bold text-xl">{character.available_dt.toLocaleString()}</p>
        </div>
      </div>

      {/* Profile Picture */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 mb-8">
        <h2 className="text-sm font-semibold text-gray-300 mb-3">Profile Picture</h2>
        <div className="flex items-start gap-4">
          {character.picture_url && (
            <img src={character.picture_url} alt={character.name} className="w-16 h-16 rounded-full object-cover border border-gray-700 flex-shrink-0" />
          )}
          <div className="flex-1 flex gap-2">
            <input
              className={inputClass}
              placeholder="https://example.com/image.png"
              defaultValue={character.picture_url ?? ''}
              id="picture_url_input"
            />
            <Button
              size="sm"
              type="button"
              onClick={async () => {
                const val = (document.getElementById('picture_url_input') as HTMLInputElement).value.trim();
                try {
                  const updated = await charactersApi.update(characterId!, { picture_url: val || null });
                  setCharacter(updated);
                  show('Picture updated');
                } catch {
                  show('Failed to update picture', 'error');
                }
              }}
            >
              Save
            </Button>
          </div>
        </div>
      </div>

      {/* Elemental Releases */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 mb-8">
        <h2 className="text-sm font-semibold text-gray-300 mb-3">Elemental Releases</h2>
        <div className="flex flex-wrap gap-2">
          {(['katon', 'suiton', 'doton', 'futon', 'raiton'] as const).map((el) => {
            const active = (character.elemental_releases ?? []).includes(el);
            return (
              <button
                key={el}
                onClick={() => handleToggleAffinity(el)}
                disabled={affinitiesSaving}
                className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors disabled:opacity-50 ${
                  active
                    ? 'bg-orange-500 border-orange-500 text-white'
                    : 'bg-gray-800 border-gray-600 text-gray-300 hover:border-orange-500'
                }`}
              >
                {el}
              </button>
            );
          })}
        </div>
        <p className="text-xs text-gray-500 mt-3">Click an element to toggle it. Determines which elemental jutsu this character is eligible to learn.</p>
      </div>

      {/* Add DT */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 mb-8">
        <h2 className="text-sm font-semibold text-gray-300 mb-4">Add DT Transaction</h2>
        <form onSubmit={handleAddDt} className="flex items-end gap-4">
          <div className="flex-1">
            <FormField label="Amount">
              <input
                type="number"
                className={inputClass}
                value={dtAmount}
                onChange={(e) => setDtAmount(e.target.value)}
                placeholder="500"
                required
              />
            </FormField>
          </div>
          <div className="flex-[2]">
            <FormField label="Reason">
              <input
                className={inputClass}
                value={dtReason}
                onChange={(e) => setDtReason(e.target.value)}
                placeholder="Training session reward"
                required
              />
            </FormField>
          </div>
          <Button type="submit" loading={dtLoading}>Add DT</Button>
        </form>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 bg-gray-900 border border-gray-800 rounded-xl p-1 w-fit">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? 'bg-orange-500 text-white'
                : 'text-gray-400 hover:text-gray-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Libraries tab */}
      {activeTab === 'libraries' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-base font-semibold text-gray-200">Library Access</h2>
            <Button size="sm" onClick={() => setLibraryModalOpen(true)}>+ Grant Access</Button>
          </div>
          <div className="overflow-x-auto rounded-xl border border-gray-800">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-900 border-b border-gray-800">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Library</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Required Rank</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {charLibraries.length === 0 ? (
                  <tr><td colSpan={3} className="px-4 py-8 text-center text-gray-500">No library access granted.</td></tr>
                ) : charLibraries.map((cl) => (
                  <tr key={cl._id} className="border-b border-gray-800/50 hover:bg-gray-800/50">
                    <td className="px-4 py-3 text-gray-200">{libraryMap[cl.library_id] ?? cl.library_id}</td>
                    <td className="px-4 py-3 text-gray-300">{rankMap[cl.required_ninja_rank_id] ?? cl.required_ninja_rank_id}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => setDeleteLibraryTarget(cl)}
                        className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded-lg transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Senseis tab */}
      {activeTab === 'senseis' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-base font-semibold text-gray-200">Sensei Access</h2>
            <Button size="sm" onClick={() => setSenseiModalOpen(true)}>+ Assign Sensei</Button>
          </div>
          <div className="overflow-x-auto rounded-xl border border-gray-800">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-900 border-b border-gray-800">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Sensei</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Proximity</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {charSenseis.length === 0 ? (
                  <tr><td colSpan={3} className="px-4 py-8 text-center text-gray-500">No senseis assigned.</td></tr>
                ) : charSenseis.map((cs) => (
                  <tr key={cs._id} className="border-b border-gray-800/50 hover:bg-gray-800/50">
                    <td className="px-4 py-3 text-gray-200">{senseiMap[cs.sensei_id] ?? cs.sensei_id}</td>
                    <td className="px-4 py-3 text-gray-300">{cs.proximity}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => setDeleteSenseiTarget(cs)}
                        className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded-lg transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Learning Progress tab */}
      {activeTab === 'progress' && (
        <div>
          <h2 className="text-base font-semibold text-gray-200 mb-4">Learning Progress</h2>
          <div className="overflow-x-auto rounded-xl border border-gray-800">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-900 border-b border-gray-800">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Content</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">DT Progress</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Started At</th>
                </tr>
              </thead>
              <tbody>
                {progress.length === 0 ? (
                  <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-500">No learning progress yet.</td></tr>
                ) : progress.map((p) => {
                  const content = contentMap[p.trainable_content_id];
                  return (
                    <tr key={p._id} className="border-b border-gray-800/50 hover:bg-gray-800/50">
                      <td className="px-4 py-3 text-gray-200">{content?.name ?? p.trainable_content_id}</td>
                      <td className="px-4 py-3 text-gray-300">
                        {p.dt_invested.toLocaleString()} / {p.dt_required.toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={p.status === 'completed' ? 'green' : 'orange'}>
                          {p.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-gray-400">
                        {new Date(p.started_at).toLocaleDateString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Keyword modal */}
      <Modal isOpen={keywordModalOpen} title="Assign Keyword" onClose={() => setKeywordModalOpen(false)} size="sm">
        <form onSubmit={handleAssignKeyword} className="flex flex-col gap-4">
          <FormField label="Keyword" required>
            <select className={inputClass} value={addKeywordId} onChange={(e) => setAddReleaseId(e.target.value)} required>
              <option value="" disabled>Select keyword...</option>
              {unassignedReleases.map((r) => <option key={r._id} value={r._id}>{r.name}</option>)}
            </select>
          </FormField>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" type="button" onClick={() => setKeywordModalOpen(false)}>Cancel</Button>
            <Button type="submit" loading={addingSaving}>Assign</Button>
          </div>
        </form>
      </Modal>

      {/* Library modal */}
      <Modal isOpen={libraryModalOpen} title="Grant Library Access" onClose={() => setLibraryModalOpen(false)} size="sm">
        <form onSubmit={handleAssignLibrary} className="flex flex-col gap-4">
          <FormField label="Library" required>
            <select className={inputClass} value={addLibraryId} onChange={(e) => setAddLibraryId(e.target.value)} required>
              <option value="" disabled>Select library...</option>
              {libraries.map((l) => <option key={l._id} value={l._id}>{l.name}</option>)}
            </select>
          </FormField>
          <FormField label="Required Ninja Rank" required>
            <select className={inputClass} value={addLibraryRankId} onChange={(e) => setAddLibraryRankId(e.target.value)} required>
              <option value="" disabled>Select rank...</option>
              {ninjaRanks.map((r) => <option key={r._id} value={r._id}>{r.name}</option>)}
            </select>
          </FormField>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" type="button" onClick={() => setLibraryModalOpen(false)}>Cancel</Button>
            <Button type="submit" loading={addingSaving}>Grant Access</Button>
          </div>
        </form>
      </Modal>

      {/* Sensei modal */}
      <Modal isOpen={senseiModalOpen} title="Assign Sensei" onClose={() => setSenseiModalOpen(false)} size="sm">
        <form onSubmit={handleAssignSensei} className="flex flex-col gap-4">
          <FormField label="Sensei" required>
            <select className={inputClass} value={addSenseiId} onChange={(e) => setAddSenseiId(e.target.value)} required>
              <option value="" disabled>Select sensei...</option>
              {senseis.map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
            </select>
          </FormField>
          <FormField label="Proximity (1–10)" required>
            <input
              type="number"
              className={inputClass}
              value={addSenseiProximity}
              min={1}
              max={10}
              onChange={(e) => setAddSenseiProximity(parseInt(e.target.value))}
              required
            />
          </FormField>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" type="button" onClick={() => setSenseiModalOpen(false)}>Cancel</Button>
            <Button type="submit" loading={addingSaving}>Assign</Button>
          </div>
        </form>
      </Modal>

      {/* Confirm dialogs */}
      <ConfirmDialog
        isOpen={!!deleteKeywordTarget}
        title="Remove Keyword"
        message={`Remove keyword "${keywordMap[deleteKeywordTarget?.keyword_id ?? ''] ?? ''}" from this character?`}
        onConfirm={handleRevokeKeyword}
        onCancel={() => setDeleteKeywordTarget(null)}
        loading={deleting}
      />
      <ConfirmDialog
        isOpen={!!deleteLibraryTarget}
        title="Revoke Library Access"
        message={`Revoke access to "${libraryMap[deleteLibraryTarget?.library_id ?? ''] ?? ''}"?`}
        onConfirm={handleRevokeLibrary}
        onCancel={() => setDeleteLibraryTarget(null)}
        loading={deleting}
      />
      <ConfirmDialog
        isOpen={!!deleteSenseiTarget}
        title="Remove Sensei"
        message={`Remove sensei "${senseiMap[deleteSenseiTarget?.sensei_id ?? ''] ?? ''}" from this character?`}
        onConfirm={handleRevokeSensei}
        onCancel={() => setDeleteSenseiTarget(null)}
        loading={deleting}
      />
    </div>
  );
}
