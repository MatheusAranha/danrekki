import { useState, useEffect } from 'react';
import { trainableContentsApi, TrainableContent, ContentType } from '../../api/trainable-contents';
import { jutsusApi, Jutsu } from '../../api/jutsus';
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
const textareaClass = `${inputClass} resize-y min-h-[80px]`;

const CONTENT_TYPES: ContentType[] = [
  'jutsu',
  'tool',
  'weapon_or_armor',
  'skill_proficiency',
  'feat',
];

const DEFAULT_DT_COSTS: Record<ContentType, number> = {
  jutsu: 0,
  tool: 16,
  weapon_or_armor: 32,
  skill_proficiency: 8,
  feat: 24,
};

const typeBadge: Record<ContentType, 'orange' | 'blue' | 'red' | 'green' | 'gray'> = {
  jutsu: 'orange',
  tool: 'blue',
  weapon_or_armor: 'red',
  skill_proficiency: 'green',
  feat: 'gray',
};

interface ContentFormData {
  type: ContentType;
  jutsu_id: string;
  name: string;
  description: string;
  base_dt_cost: number;
}

function ContentForm({
  initial,
  jutsus,
  onSave,
  onCancel,
  saving,
}: {
  initial?: TrainableContent;
  jutsus: Jutsu[];
  onSave: (data: ContentFormData) => void;
  onCancel: () => void;
  saving: boolean;
}) {
  const [type, setType] = useState<ContentType>(initial?.type ?? 'jutsu');
  const [jutsuId, setJutsuId] = useState(initial?.jutsu_id ?? '');
  const [name, setName] = useState(initial?.name ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [dtCost, setDtCost] = useState(initial?.base_dt_cost ?? 0);

  const handleTypeChange = (newType: ContentType) => {
    setType(newType);
    if (!initial) setDtCost(DEFAULT_DT_COSTS[newType]);
    if (newType !== 'jutsu') setJutsuId('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ type, jutsu_id: jutsuId, name, description, base_dt_cost: dtCost });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <FormField label="Type" required>
        <select
          className={inputClass}
          value={type}
          onChange={(e) => handleTypeChange(e.target.value as ContentType)}
          required
        >
          {CONTENT_TYPES.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </FormField>

      {type === 'jutsu' && (
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
      )}

      <FormField label="Name" required>
        <input
          className={inputClass}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Content name"
          required
        />
      </FormField>
      <FormField label="Description" required>
        <textarea
          className={textareaClass}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe this content..."
          required
        />
      </FormField>
      <FormField label="Base DT Cost" required>
        <input
          type="number"
          className={inputClass}
          value={dtCost}
          min={0}
          onChange={(e) => setDtCost(parseInt(e.target.value))}
          required
        />
      </FormField>
      <div className="flex justify-end gap-3 pt-2">
        <Button variant="secondary" type="button" onClick={onCancel}>Cancel</Button>
        <Button type="submit" loading={saving}>{initial ? 'Save Changes' : 'Create Content'}</Button>
      </div>
    </form>
  );
}

export function TrainableContentsPage() {
  const { show } = useToastStore();
  const [contents, setContents] = useState<TrainableContent[]>([]);
  const [jutsus, setJutsus] = useState<Jutsu[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<TrainableContent | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<TrainableContent | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [c, j] = await Promise.all([
        trainableContentsApi.list(),
        jutsusApi.list(),
      ]);
      setContents(c);
      setJutsus(j);
    } catch {
      show('Failed to load trainable contents', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditing(null); setModalOpen(true); };
  const openEdit = (c: TrainableContent) => { setEditing(c); setModalOpen(true); };
  const closeModal = () => { setModalOpen(false); setEditing(null); };

  const handleSave = async (data: ContentFormData) => {
    setSaving(true);
    try {
      const body = {
        ...data,
        jutsu_id: data.type === 'jutsu' ? data.jutsu_id : undefined,
      };
      if (editing) {
        await trainableContentsApi.update(editing._id, body);
        show('Content updated');
      } else {
        await trainableContentsApi.create(body);
        show('Content created');
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
      await trainableContentsApi.delete(deleteTarget._id);
      show('Content deleted');
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

  const columns: Column<TrainableContent>[] = [
    { key: 'name', label: 'Name' },
    {
      key: 'type',
      label: 'Type',
      render: (c) => <Badge variant={typeBadge[c.type] ?? 'gray'}>{c.type}</Badge>,
    },
    { key: 'base_dt_cost', label: 'DT Cost' },
    {
      key: 'jutsu_id',
      label: 'Jutsu',
      render: (c) => (
        <span className="text-gray-400">
          {c.jutsu_id ? jutsuMap[c.jutsu_id] ?? c.jutsu_id : '—'}
        </span>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Trainable Content"
        description="Skills, tools, weapons, and feats."
        action={{ label: '+ New Content', onClick: openCreate }}
      />
      <DataTable
        columns={columns}
        data={contents}
        loading={loading}
        onEdit={openEdit}
        onDelete={setDeleteTarget}
        emptyMessage="No trainable content found."
      />
      <Modal
        isOpen={modalOpen}
        title={editing ? 'Edit Content' : 'New Content'}
        onClose={closeModal}
        size="md"
      >
        <ContentForm
          initial={editing ?? undefined}
          jutsus={jutsus}
          onSave={handleSave}
          onCancel={closeModal}
          saving={saving}
        />
      </Modal>
      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Delete Content"
        message={`Delete "${deleteTarget?.name}"?`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />
    </div>
  );
}
