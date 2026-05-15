import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { librariesApi, libraryScrollsApi, Library, LibraryScroll } from '../../api/libraries';
import { jutsusApi, Jutsu } from '../../api/jutsus';
import { ninjaRanksApi, NinjaRank } from '../../api/ninja-ranks';
import { useToastStore } from '../../stores/toast';
import { PageHeader } from '../../components/PageHeader';
import { DataTable, Column } from '../../components/DataTable';
import { Modal } from '../../components/Modal';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { Button } from '../../components/Button';
import { FormField } from '../../components/FormField';
import { Badge } from '../../components/Badge';

const inputClass =
  'w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-gray-100 text-sm placeholder-gray-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500';

function AddScrollForm({
  jutsus,
  ninjaRanks,
  onSave,
  onCancel,
  saving,
}: {
  jutsus: Jutsu[];
  ninjaRanks: NinjaRank[];
  onSave: (data: { jutsu_id: string; required_ninja_rank_id: string }) => void;
  onCancel: () => void;
  saving: boolean;
}) {
  const [jutsuId, setJutsuId] = useState('');
  const [rankId, setRankId] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ jutsu_id: jutsuId, required_ninja_rank_id: rankId });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <FormField label="Jutsu" required>
        <select
          className={inputClass}
          value={jutsuId}
          onChange={(e) => setJutsuId(e.target.value)}
          required
        >
          <option value="" disabled>Select jutsu...</option>
          {jutsus.map((j) => (
            <option key={j._id} value={j._id}>{j.name}</option>
          ))}
        </select>
      </FormField>
      <FormField label="Required Ninja Rank" required>
        <select
          className={inputClass}
          value={rankId}
          onChange={(e) => setRankId(e.target.value)}
          required
        >
          <option value="" disabled>Select rank...</option>
          {ninjaRanks.map((r) => (
            <option key={r._id} value={r._id}>{r.name}</option>
          ))}
        </select>
      </FormField>
      <div className="flex justify-end gap-3 pt-2">
        <Button variant="secondary" type="button" onClick={onCancel}>Cancel</Button>
        <Button type="submit" loading={saving}>Add Scroll</Button>
      </div>
    </form>
  );
}

export function LibraryScrollsPage() {
  const { libraryId } = useParams<{ libraryId: string }>();
  const { show } = useToastStore();
  const [library, setLibrary] = useState<Library | null>(null);
  const [scrolls, setScrolls] = useState<LibraryScroll[]>([]);
  const [jutsus, setJutsus] = useState<Jutsu[]>([]);
  const [ninjaRanks, setNinjaRanks] = useState<NinjaRank[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<LibraryScroll | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = async () => {
    if (!libraryId) return;
    setLoading(true);
    try {
      const [lib, s, j, nr] = await Promise.all([
        librariesApi.get(libraryId),
        libraryScrollsApi.list(libraryId),
        jutsusApi.list(),
        ninjaRanksApi.list(),
      ]);
      setLibrary(lib);
      setScrolls(s);
      setJutsus(j);
      setNinjaRanks(nr);
    } catch {
      show('Failed to load scrolls', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [libraryId]);

  const handleAdd = async (data: { jutsu_id: string; required_ninja_rank_id: string }) => {
    if (!libraryId) return;
    setSaving(true);
    try {
      await libraryScrollsApi.create(libraryId, data);
      show('Scroll added');
      setModalOpen(false);
      load();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } }; message?: string };
      show(e.response?.data?.error || e.message || 'Operation failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget || !libraryId) return;
    setDeleting(true);
    try {
      await libraryScrollsApi.delete(libraryId, deleteTarget._id);
      show('Scroll removed');
      setDeleteTarget(null);
      load();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } }; message?: string };
      show(e.response?.data?.error || e.message || 'Delete failed', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const jutsuMap = Object.fromEntries(jutsus.map((j) => [j._id, j.name]));
  const rankMap = Object.fromEntries(ninjaRanks.map((r) => [r._id, r.name]));

  const columns: Column<LibraryScroll>[] = [
    {
      key: 'jutsu_id',
      label: 'Jutsu',
      render: (s) => <span>{jutsuMap[s.jutsu_id] ?? s.jutsu_id}</span>,
    },
    {
      key: 'required_ninja_rank_id',
      label: 'Required Rank',
      render: (s) => (
        <span className="text-gray-300">{rankMap[s.required_ninja_rank_id] ?? s.required_ninja_rank_id}</span>
      ),
    },
    {
      key: 'rented_by_character_id',
      label: 'Status',
      render: (s) =>
        s.rented_by_character_id ? (
          <Badge variant="orange">Rented</Badge>
        ) : (
          <Badge variant="green">Available</Badge>
        ),
    },
  ];

  return (
    <div>
      <PageHeader
        title={library ? `${library.name} — Scrolls` : 'Library Scrolls'}
        description={library?.description}
        backLink={{ label: 'Back to Libraries', to: '/admin/libraries' }}
        action={{ label: '+ Add Scroll', onClick: () => setModalOpen(true) }}
      />
      <DataTable
        columns={columns}
        data={scrolls}
        loading={loading}
        onDelete={setDeleteTarget}
        emptyMessage="No scrolls in this library."
      />
      <Modal isOpen={modalOpen} title="Add Scroll" onClose={() => setModalOpen(false)} size="sm">
        <AddScrollForm
          jutsus={jutsus}
          ninjaRanks={ninjaRanks}
          onSave={handleAdd}
          onCancel={() => setModalOpen(false)}
          saving={saving}
        />
      </Modal>
      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Remove Scroll"
        message="Remove this scroll from the library?"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />
    </div>
  );
}
