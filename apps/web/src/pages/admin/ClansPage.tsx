import { useState, useEffect } from 'react';
import { clansApi, Clan } from '../../api/clans';
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

interface DtModifier {
  release_id: string;
  multiplier: number;
}

function ClanForm({
  initial,
  releases,
  onSave,
  onCancel,
  saving,
}: {
  initial?: Clan;
  releases: Release[];
  onSave: (name: string, dt_modifiers: DtModifier[]) => void;
  onCancel: () => void;
  saving: boolean;
}) {
  const [name, setName] = useState(initial?.name ?? '');
  const [modifiers, setModifiers] = useState<DtModifier[]>(
    initial?.dt_modifiers ?? []
  );

  const addModifier = () =>
    setModifiers((m) => [...m, { release_id: '', multiplier: 1.0 }]);

  const removeModifier = (idx: number) =>
    setModifiers((m) => m.filter((_, i) => i !== idx));

  const updateModifier = (idx: number, field: keyof DtModifier, value: string | number) =>
    setModifiers((m) =>
      m.map((mod, i) => (i === idx ? { ...mod, [field]: value } : mod))
    );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(name, modifiers);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <FormField label="Name" required>
        <input
          className={inputClass}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Uchiha"
          required
        />
      </FormField>

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-300">DT Modifiers</label>
          <Button variant="ghost" size="sm" type="button" onClick={addModifier}>
            + Add
          </Button>
        </div>
        {modifiers.length === 0 && (
          <p className="text-xs text-gray-500">No modifiers. Click + Add to create one.</p>
        )}
        {modifiers.map((mod, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <select
              className={`${inputClass} flex-1`}
              value={mod.release_id}
              onChange={(e) => updateModifier(idx, 'release_id', e.target.value)}
              required
            >
              <option value="" disabled>
                Select release...
              </option>
              {releases.map((r) => (
                <option key={r._id} value={r._id}>
                  {r.name}
                </option>
              ))}
            </select>
            <input
              type="number"
              className={`${inputClass} w-28`}
              value={mod.multiplier}
              min={0.01}
              max={1.0}
              step={0.01}
              onChange={(e) =>
                updateModifier(idx, 'multiplier', parseFloat(e.target.value))
              }
              required
            />
            <button
              type="button"
              onClick={() => removeModifier(idx)}
              className="text-gray-500 hover:text-red-400 transition-colors p-1"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        ))}
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <Button variant="secondary" type="button" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" loading={saving}>
          {initial ? 'Save Changes' : 'Create Clan'}
        </Button>
      </div>
    </form>
  );
}

export function ClansPage() {
  const { show } = useToastStore();
  const [clans, setClans] = useState<Clan[]>([]);
  const [releases, setReleases] = useState<Release[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Clan | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Clan | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [c, r] = await Promise.all([clansApi.list(), releasesApi.list()]);
      setClans(c);
      setReleases(r);
    } catch {
      show('Failed to load clans', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditing(null); setModalOpen(true); };
  const openEdit = (clan: Clan) => { setEditing(clan); setModalOpen(true); };
  const closeModal = () => { setModalOpen(false); setEditing(null); };

  const handleSave = async (name: string, dt_modifiers: DtModifier[]) => {
    setSaving(true);
    try {
      if (editing) {
        await clansApi.update(editing._id, { name, dt_modifiers });
        show('Clan updated successfully');
      } else {
        await clansApi.create({ name, dt_modifiers });
        show('Clan created successfully');
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
      await clansApi.delete(deleteTarget._id);
      show('Clan deleted');
      setDeleteTarget(null);
      load();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } }; message?: string };
      show(e.response?.data?.error || e.message || 'Delete failed', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const columns: Column<Clan>[] = [
    { key: 'name', label: 'Name' },
    {
      key: 'dt_modifiers',
      label: 'DT Modifiers',
      render: (c) => <span className="text-gray-400">{c.dt_modifiers.length}</span>,
    },
    {
      key: 'created_at',
      label: 'Created At',
      render: (c) => (
        <span className="text-gray-400">
          {new Date(c.created_at).toLocaleDateString()}
        </span>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Clans"
        description="Manage ninja clans and their DT multipliers."
        action={{ label: '+ New Clan', onClick: openCreate }}
      />

      <DataTable
        columns={columns}
        data={clans}
        loading={loading}
        onEdit={openEdit}
        onDelete={setDeleteTarget}
        emptyMessage="No clans found. Create one to get started."
      />

      <Modal
        isOpen={modalOpen}
        title={editing ? 'Edit Clan' : 'New Clan'}
        onClose={closeModal}
        size="md"
      >
        <ClanForm
          initial={editing ?? undefined}
          releases={releases}
          onSave={handleSave}
          onCancel={closeModal}
          saving={saving}
        />
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Delete Clan"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />
    </div>
  );
}
