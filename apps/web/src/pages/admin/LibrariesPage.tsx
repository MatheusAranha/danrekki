import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { librariesApi, Library } from '../../api/libraries';
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

function LibraryForm({
  initial,
  onSave,
  onCancel,
  saving,
}: {
  initial?: Library;
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
          placeholder="Konoha Main Library"
          required
        />
      </FormField>
      <FormField label="Description">
        <textarea
          className={textareaClass}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe this library..."
        />
      </FormField>
      <div className="flex justify-end gap-3 pt-2">
        <Button variant="secondary" type="button" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" loading={saving}>
          {initial ? 'Save Changes' : 'Create Library'}
        </Button>
      </div>
    </form>
  );
}

export function LibrariesPage() {
  const { show } = useToastStore();
  const [libraries, setLibraries] = useState<Library[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Library | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Library | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      setLibraries(await librariesApi.list());
    } catch {
      show('Failed to load libraries', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditing(null); setModalOpen(true); };
  const openEdit = (l: Library) => { setEditing(l); setModalOpen(true); };
  const closeModal = () => { setModalOpen(false); setEditing(null); };

  const handleSave = async (name: string, description: string) => {
    setSaving(true);
    try {
      if (editing) {
        await librariesApi.update(editing._id, { name, description });
        show('Library updated');
      } else {
        await librariesApi.create({ name, description });
        show('Library created');
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
      await librariesApi.delete(deleteTarget._id);
      show('Library deleted');
      setDeleteTarget(null);
      load();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } }; message?: string };
      show(e.response?.data?.error || e.message || 'Delete failed', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const columns: Column<Library>[] = [
    { key: 'name', label: 'Name' },
    {
      key: 'description',
      label: 'Description',
      render: (l) => (
        <span className="text-gray-400">
          {l.description.length > 60 ? `${l.description.slice(0, 60)}...` : l.description}
        </span>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Libraries"
        description="Scroll libraries and access control."
        action={{ label: '+ New Library', onClick: openCreate }}
      />
      <DataTable
        columns={columns}
        data={libraries}
        loading={loading}
        onEdit={openEdit}
        onDelete={setDeleteTarget}
        actions={(lib) => (
          <Link
            to={`/admin/libraries/${lib._id}/scrolls`}
            className="px-2 py-1 text-xs text-orange-400 hover:text-orange-300 border border-orange-500/30 rounded-lg hover:bg-orange-500/10 transition-colors"
          >
            Scrolls →
          </Link>
        )}
        emptyMessage="No libraries found."
      />
      <Modal
        isOpen={modalOpen}
        title={editing ? 'Edit Library' : 'New Library'}
        onClose={closeModal}
        size="md"
      >
        <LibraryForm
          initial={editing ?? undefined}
          onSave={handleSave}
          onCancel={closeModal}
          saving={saving}
        />
      </Modal>
      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Delete Library"
        message={`Delete "${deleteTarget?.name}"?`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />
    </div>
  );
}
