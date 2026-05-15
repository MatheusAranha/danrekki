import { useState, useEffect } from 'react';
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

function ReleaseForm({
  initial,
  onSave,
  onCancel,
  saving,
}: {
  initial?: Release;
  onSave: (name: string, date: string) => void;
  onCancel: () => void;
  saving: boolean;
}) {
  const [name, setName] = useState(initial?.name ?? '');
  const [date, setDate] = useState(
    initial?.date ? initial.date.split('T')[0] : ''
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(name, date);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <FormField label="Name" required>
        <input
          className={inputClass}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Arc 1 Release"
          required
        />
      </FormField>
      <FormField label="Date" required>
        <input
          type="date"
          className={inputClass}
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />
      </FormField>
      <div className="flex justify-end gap-3 pt-2">
        <Button variant="secondary" type="button" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" loading={saving}>
          {initial ? 'Save Changes' : 'Create Release'}
        </Button>
      </div>
    </form>
  );
}

export function ReleasesPage() {
  const { show } = useToastStore();
  const [releases, setReleases] = useState<Release[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Release | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Release | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      setReleases(await releasesApi.list());
    } catch {
      show('Failed to load releases', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditing(null); setModalOpen(true); };
  const openEdit = (r: Release) => { setEditing(r); setModalOpen(true); };
  const closeModal = () => { setModalOpen(false); setEditing(null); };

  const handleSave = async (name: string, date: string) => {
    setSaving(true);
    try {
      if (editing) {
        await releasesApi.update(editing._id, { name, date });
        show('Release updated');
      } else {
        await releasesApi.create({ name, date });
        show('Release created');
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
      await releasesApi.delete(deleteTarget._id);
      show('Release deleted');
      setDeleteTarget(null);
      load();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } }; message?: string };
      show(e.response?.data?.error || e.message || 'Delete failed', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const columns: Column<Release>[] = [
    { key: 'name', label: 'Name' },
    {
      key: 'date',
      label: 'Date',
      render: (r) => (
        <span className="text-gray-400">{new Date(r.date).toLocaleDateString()}</span>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Releases"
        description="Content release schedule."
        action={{ label: '+ New Release', onClick: openCreate }}
      />
      <DataTable
        columns={columns}
        data={releases}
        loading={loading}
        onEdit={openEdit}
        onDelete={setDeleteTarget}
        emptyMessage="No releases found."
      />
      <Modal
        isOpen={modalOpen}
        title={editing ? 'Edit Release' : 'New Release'}
        onClose={closeModal}
        size="sm"
      >
        <ReleaseForm
          initial={editing ?? undefined}
          onSave={handleSave}
          onCancel={closeModal}
          saving={saving}
        />
      </Modal>
      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Delete Release"
        message={`Delete "${deleteTarget?.name}"? This cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />
    </div>
  );
}
