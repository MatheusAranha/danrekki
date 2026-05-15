import { useState, useEffect } from 'react';
import { jutsusApi, Jutsu } from '../../api/jutsus';
import { jutsuRanksApi, JutsuRank } from '../../api/jutsu-ranks';
import { releasesApi, Release } from '../../api/releases';
import { useToastStore } from '../../stores/toast';
import { PageHeader } from '../../components/PageHeader';
import { DataTable, Column } from '../../components/DataTable';
import { Modal } from '../../components/Modal';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { Button } from '../../components/Button';
import { FormField } from '../../components/FormField';

const inputClass =
  'w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-gray-100 text-sm placeholder-gray-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500';
const textareaClass = `${inputClass} resize-y min-h-[80px]`;

interface JutsuFormData {
  name: string;
  jutsu_rank_id: string;
  release_id: string;
  components: string;
  duration: string;
  description: string;
}

function JutsuForm({
  initial,
  jutsuRanks,
  releases,
  onSave,
  onCancel,
  saving,
}: {
  initial?: Jutsu;
  jutsuRanks: JutsuRank[];
  releases: Release[];
  onSave: (data: JutsuFormData) => void;
  onCancel: () => void;
  saving: boolean;
}) {
  const [form, setForm] = useState<JutsuFormData>({
    name: initial?.name ?? '',
    jutsu_rank_id: initial?.jutsu_rank_id ?? '',
    release_id: initial?.release_id ?? '',
    components: initial?.components ?? '',
    duration: initial?.duration ?? '',
    description: initial?.description ?? '',
  });

  const set = (field: keyof JutsuFormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <FormField label="Name" required>
        <input className={inputClass} value={form.name} onChange={set('name')} placeholder="Fireball Jutsu" required />
      </FormField>
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Jutsu Rank" required>
          <select className={inputClass} value={form.jutsu_rank_id} onChange={set('jutsu_rank_id')} required>
            <option value="" disabled>Select rank...</option>
            {jutsuRanks.map((r) => <option key={r._id} value={r._id}>{r.name}</option>)}
          </select>
        </FormField>
        <FormField label="Release" required>
          <select className={inputClass} value={form.release_id} onChange={set('release_id')} required>
            <option value="" disabled>Select release...</option>
            {releases.map((r) => <option key={r._id} value={r._id}>{r.name}</option>)}
          </select>
        </FormField>
      </div>
      <FormField label="Components" required>
        <input className={inputClass} value={form.components} onChange={set('components')} placeholder="Hand seals, chakra" required />
      </FormField>
      <FormField label="Duration" required>
        <input className={inputClass} value={form.duration} onChange={set('duration')} placeholder="Instantaneous" required />
      </FormField>
      <FormField label="Description" required>
        <textarea className={textareaClass} value={form.description} onChange={set('description')} placeholder="Describe this jutsu..." required />
      </FormField>
      <div className="flex justify-end gap-3 pt-2">
        <Button variant="secondary" type="button" onClick={onCancel}>Cancel</Button>
        <Button type="submit" loading={saving}>{initial ? 'Save Changes' : 'Create Jutsu'}</Button>
      </div>
    </form>
  );
}

export function JutsusPage() {
  const { show } = useToastStore();
  const [jutsus, setJutsus] = useState<Jutsu[]>([]);
  const [jutsuRanks, setJutsuRanks] = useState<JutsuRank[]>([]);
  const [releases, setReleases] = useState<Release[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Jutsu | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Jutsu | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [j, jr, r] = await Promise.all([
        jutsusApi.list(),
        jutsuRanksApi.list(),
        releasesApi.list(),
      ]);
      setJutsus(j);
      setJutsuRanks(jr);
      setReleases(r);
    } catch {
      show('Failed to load jutsus', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditing(null); setModalOpen(true); };
  const openEdit = (j: Jutsu) => { setEditing(j); setModalOpen(true); };
  const closeModal = () => { setModalOpen(false); setEditing(null); };

  const handleSave = async (data: JutsuFormData) => {
    setSaving(true);
    try {
      if (editing) {
        await jutsusApi.update(editing._id, data);
        show('Jutsu updated');
      } else {
        await jutsusApi.create(data);
        show('Jutsu created');
      }
      closeModal();
      load();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } }; message?: string };
      show(e.response?.data?.error || e.message || 'Operation failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await jutsusApi.delete(deleteTarget._id);
      show('Jutsu deleted');
      setDeleteTarget(null);
      load();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } }; message?: string };
      show(e.response?.data?.error || e.message || 'Delete failed', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const rankMap = Object.fromEntries(jutsuRanks.map((r) => [r._id, r.name]));
  const releaseMap = Object.fromEntries(releases.map((r) => [r._id, r.name]));

  const columns: Column<Jutsu>[] = [
    { key: 'name', label: 'Name' },
    {
      key: 'jutsu_rank_id',
      label: 'Jutsu Rank',
      render: (j) => <span className="text-gray-300">{rankMap[j.jutsu_rank_id] ?? j.jutsu_rank_id}</span>,
    },
    {
      key: 'release_id',
      label: 'Release',
      render: (j) => <span className="text-gray-300">{releaseMap[j.release_id] ?? j.release_id}</span>,
    },
    { key: 'duration', label: 'Duration' },
  ];

  return (
    <div>
      <PageHeader
        title="Jutsus"
        description="All learnable jutsu."
        action={{ label: '+ New Jutsu', onClick: openCreate }}
      />
      <DataTable
        columns={columns}
        data={jutsus}
        loading={loading}
        onEdit={openEdit}
        onDelete={setDeleteTarget}
        emptyMessage="No jutsus found."
      />
      <Modal
        isOpen={modalOpen}
        title={editing ? 'Edit Jutsu' : 'New Jutsu'}
        onClose={closeModal}
        size="lg"
      >
        <JutsuForm
          initial={editing ?? undefined}
          jutsuRanks={jutsuRanks}
          releases={releases}
          onSave={handleSave}
          onCancel={closeModal}
          saving={saving}
        />
      </Modal>
      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Delete Jutsu"
        message={`Delete "${deleteTarget?.name}"?`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />
    </div>
  );
}
