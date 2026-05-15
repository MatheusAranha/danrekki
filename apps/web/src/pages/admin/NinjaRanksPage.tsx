import { useState, useEffect } from 'react';
import { ninjaRanksApi, NinjaRank } from '../../api/ninja-ranks';
import { useToastStore } from '../../stores/toast';
import { PageHeader } from '../../components/PageHeader';
import { DataTable, Column } from '../../components/DataTable';
import { Modal } from '../../components/Modal';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { Button } from '../../components/Button';
import { FormField } from '../../components/FormField';

const inputClass =
  'w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-gray-100 text-sm placeholder-gray-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500';

function NinjaRankForm({
  initial,
  onSave,
  onCancel,
  saving,
}: {
  initial?: NinjaRank;
  onSave: (data: { name: string; order: number }) => void;
  onCancel: () => void;
  saving: boolean;
}) {
  const [name, setName] = useState(initial?.name ?? '');
  const [order, setOrder] = useState(initial?.order ?? 1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ name, order });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <FormField label="Name" required>
        <input
          className={inputClass}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Genin"
          required
        />
      </FormField>
      <FormField label="Order" required>
        <input
          type="number"
          className={inputClass}
          value={order}
          min={1}
          onChange={(e) => setOrder(parseInt(e.target.value))}
          required
        />
      </FormField>
      <div className="flex justify-end gap-3 pt-2">
        <Button variant="secondary" type="button" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" loading={saving}>
          {initial ? 'Save Changes' : 'Create Ninja Rank'}
        </Button>
      </div>
    </form>
  );
}

export function NinjaRanksPage() {
  const { show } = useToastStore();
  const [ranks, setRanks] = useState<NinjaRank[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<NinjaRank | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<NinjaRank | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      setRanks(await ninjaRanksApi.list());
    } catch {
      show('Failed to load ninja ranks', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditing(null); setModalOpen(true); };
  const openEdit = (r: NinjaRank) => { setEditing(r); setModalOpen(true); };
  const closeModal = () => { setModalOpen(false); setEditing(null); };

  const handleSave = async (data: { name: string; order: number }) => {
    setSaving(true);
    try {
      if (editing) {
        await ninjaRanksApi.update(editing._id, data);
        show('Ninja rank updated');
      } else {
        await ninjaRanksApi.create(data);
        show('Ninja rank created');
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
      await ninjaRanksApi.delete(deleteTarget._id);
      show('Ninja rank deleted');
      setDeleteTarget(null);
      load();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } }; message?: string };
      show(e.response?.data?.error || e.message || 'Delete failed', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const columns: Column<NinjaRank>[] = [
    { key: 'name', label: 'Name' },
    { key: 'order', label: 'Order' },
  ];

  return (
    <div>
      <PageHeader
        title="Ninja Ranks"
        description="Shinobi rank progression."
        action={{ label: '+ New Ninja Rank', onClick: openCreate }}
      />
      <DataTable
        columns={columns}
        data={ranks}
        loading={loading}
        onEdit={openEdit}
        onDelete={setDeleteTarget}
        emptyMessage="No ninja ranks found."
      />
      <Modal
        isOpen={modalOpen}
        title={editing ? 'Edit Ninja Rank' : 'New Ninja Rank'}
        onClose={closeModal}
        size="sm"
      >
        <NinjaRankForm
          initial={editing ?? undefined}
          onSave={handleSave}
          onCancel={closeModal}
          saving={saving}
        />
      </Modal>
      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Delete Ninja Rank"
        message={`Delete "${deleteTarget?.name}"?`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />
    </div>
  );
}
