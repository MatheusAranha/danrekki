import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { senseisApi, Sensei } from '../../api/senseis';
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

function SenseiForm({
  initial,
  onSave,
  onCancel,
  saving,
}: {
  initial?: Sensei;
  onSave: (name: string, description: string) => void;
  onCancel: () => void;
  saving: boolean;
}) {
  const [name, setName] = useState(initial?.name ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(name, description);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <FormField label="Name" required>
        <input
          className={inputClass}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Kakashi Hatake"
          required
        />
      </FormField>
      <FormField label="Description">
        <textarea
          className={textareaClass}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe this sensei..."
        />
      </FormField>
      <div className="flex justify-end gap-3 pt-2">
        <Button variant="secondary" type="button" onClick={onCancel}>Cancel</Button>
        <Button type="submit" loading={saving}>{initial ? 'Save Changes' : 'Create Sensei'}</Button>
      </div>
    </form>
  );
}

export function SenseisPage() {
  const { show } = useToastStore();
  const [senseis, setSenseis] = useState<Sensei[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Sensei | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Sensei | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      setSenseis(await senseisApi.list());
    } catch {
      show('Failed to load senseis', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditing(null); setModalOpen(true); };
  const openEdit = (s: Sensei) => { setEditing(s); setModalOpen(true); };
  const closeModal = () => { setModalOpen(false); setEditing(null); };

  const handleSave = async (name: string, description: string) => {
    setSaving(true);
    try {
      if (editing) {
        await senseisApi.update(editing._id, { name, description });
        show('Sensei updated');
      } else {
        await senseisApi.create({ name, description });
        show('Sensei created');
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
      await senseisApi.delete(deleteTarget._id);
      show('Sensei deleted');
      setDeleteTarget(null);
      load();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } }; message?: string };
      show(e.response?.data?.error || e.message || 'Delete failed', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const columns: Column<Sensei>[] = [
    { key: 'name', label: 'Name' },
    {
      key: 'description',
      label: 'Description',
      render: (s) => (
        <span className="text-gray-400">
          {s.description.length > 60 ? `${s.description.slice(0, 60)}...` : s.description}
        </span>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Senseis"
        description="Teachers and training content."
        action={{ label: '+ New Sensei', onClick: openCreate }}
      />
      <DataTable
        columns={columns}
        data={senseis}
        loading={loading}
        onEdit={openEdit}
        onDelete={setDeleteTarget}
        actions={(s) => (
          <Link
            to={`/admin/senseis/${s._id}/contents`}
            className="px-2 py-1 text-xs text-orange-400 hover:text-orange-300 border border-orange-500/30 rounded-lg hover:bg-orange-500/10 transition-colors"
          >
            Contents →
          </Link>
        )}
        emptyMessage="No senseis found."
      />
      <Modal
        isOpen={modalOpen}
        title={editing ? 'Edit Sensei' : 'New Sensei'}
        onClose={closeModal}
        size="md"
      >
        <SenseiForm
          initial={editing ?? undefined}
          onSave={handleSave}
          onCancel={closeModal}
          saving={saving}
        />
      </Modal>
      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Delete Sensei"
        message={`Delete "${deleteTarget?.name}"?`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />
    </div>
  );
}
