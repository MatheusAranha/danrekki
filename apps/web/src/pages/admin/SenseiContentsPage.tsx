import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { senseisApi, senseiContentsApi, Sensei, SenseiContent } from '../../api/senseis';
import { trainableContentsApi, TrainableContent } from '../../api/trainable-contents';
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

const contentTypeBadge: Record<string, 'orange' | 'blue' | 'green' | 'gray' | 'red'> = {
  jutsu: 'orange',
  tool: 'blue',
  weapon_or_armor: 'red',
  skill_proficiency: 'green',
  feat: 'gray',
};

function AddContentForm({
  contents,
  onSave,
  onCancel,
  saving,
}: {
  contents: TrainableContent[];
  onSave: (data: { trainable_content_id: string; required_proximity: number }) => void;
  onCancel: () => void;
  saving: boolean;
}) {
  const [contentId, setContentId] = useState('');
  const [proximity, setProximity] = useState(1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ trainable_content_id: contentId, required_proximity: proximity });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <FormField label="Trainable Content" required>
        <select
          className={inputClass}
          value={contentId}
          onChange={(e) => setContentId(e.target.value)}
          required
        >
          <option value="" disabled>Select content...</option>
          {contents.map((c) => (
            <option key={c._id} value={c._id}>{c.name} ({c.type})</option>
          ))}
        </select>
      </FormField>
      <FormField label="Required Proximity (1–10)" required>
        <input
          type="number"
          className={inputClass}
          value={proximity}
          min={1}
          max={10}
          onChange={(e) => setProximity(parseInt(e.target.value))}
          required
        />
      </FormField>
      <div className="flex justify-end gap-3 pt-2">
        <Button variant="secondary" type="button" onClick={onCancel}>Cancel</Button>
        <Button type="submit" loading={saving}>Assign Content</Button>
      </div>
    </form>
  );
}

export function SenseiContentsPage() {
  const { senseiId } = useParams<{ senseiId: string }>();
  const { show } = useToastStore();
  const [sensei, setSensei] = useState<Sensei | null>(null);
  const [contents, setContents] = useState<SenseiContent[]>([]);
  const [allContents, setAllContents] = useState<TrainableContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<SenseiContent | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = async () => {
    if (!senseiId) return;
    setLoading(true);
    try {
      const [s, c, ac] = await Promise.all([
        senseisApi.get(senseiId),
        senseiContentsApi.list(senseiId),
        trainableContentsApi.list(),
      ]);
      setSensei(s);
      setContents(c);
      setAllContents(ac);
    } catch {
      show('Failed to load sensei contents', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [senseiId]);

  const handleAdd = async (data: { trainable_content_id: string; required_proximity: number }) => {
    if (!senseiId) return;
    setSaving(true);
    try {
      await senseiContentsApi.assign(senseiId, data);
      show('Content assigned');
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
    if (!deleteTarget || !senseiId) return;
    setDeleting(true);
    try {
      await senseiContentsApi.delete(senseiId, deleteTarget._id);
      show('Content removed');
      setDeleteTarget(null);
      load();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } }; message?: string };
      show(e.response?.data?.error || e.message || 'Delete failed', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const contentMap = Object.fromEntries(allContents.map((c) => [c._id, c]));

  const columns: Column<SenseiContent>[] = [
    {
      key: 'trainable_content_id',
      label: 'Content',
      render: (c) => <span>{contentMap[c.trainable_content_id]?.name ?? c.trainable_content_id}</span>,
    },
    {
      key: 'type',
      label: 'Type',
      render: (c) => {
        const type = contentMap[c.trainable_content_id]?.type ?? '';
        return (
          <Badge variant={contentTypeBadge[type] ?? 'gray'}>
            {type}
          </Badge>
        );
      },
    },
    {
      key: 'required_proximity',
      label: 'Required Proximity',
      render: (c) => <span className="text-gray-300">{c.required_proximity}</span>,
    },
  ];

  return (
    <div>
      <PageHeader
        title={sensei ? `${sensei.name} — Contents` : 'Sensei Contents'}
        description={sensei?.description}
        backLink={{ label: 'Back to Senseis', to: '/admin/senseis' }}
        action={{ label: '+ Assign Content', onClick: () => setModalOpen(true) }}
      />
      <DataTable
        columns={columns}
        data={contents}
        loading={loading}
        onDelete={setDeleteTarget}
        emptyMessage="No content assigned to this sensei."
      />
      <Modal isOpen={modalOpen} title="Assign Content" onClose={() => setModalOpen(false)} size="sm">
        <AddContentForm
          contents={allContents}
          onSave={handleAdd}
          onCancel={() => setModalOpen(false)}
          saving={saving}
        />
      </Modal>
      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Remove Content"
        message="Remove this content from the sensei?"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />
    </div>
  );
}
