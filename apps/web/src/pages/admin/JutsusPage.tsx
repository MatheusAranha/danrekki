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

const ELEMENTS = ['katon', 'suiton', 'doton', 'futon', 'raiton'] as const;

interface JutsuFormData {
  name: string;
  jutsu_rank_id: string;
  keyword_ids: string[];
  elements: string[];
  casting_time: string;
  range: string;
  chakra_cost: string;
  components: string;
  duration: string;
  description: string;
  at_higher_ranks: string;
}

function JutsuForm({
  initial,
  jutsuRanks,
  keywords,
  onSave,
  onCancel,
  saving,
}: {
  initial?: Jutsu;
  jutsuRanks: JutsuRank[];
  keywords: Release[];
  onSave: (data: JutsuFormData) => void;
  onCancel: () => void;
  saving: boolean;
}) {
  const [form, setForm] = useState<JutsuFormData>({
    name: initial?.name ?? '',
    jutsu_rank_id: initial?.jutsu_rank_id ?? '',
    keyword_ids: initial?.keyword_ids ?? [],
    elements: initial?.elements ?? [],
    casting_time: initial?.casting_time ?? '',
    range: initial?.range ?? '',
    chakra_cost: initial?.chakra_cost ?? '',
    components: initial?.components ?? '',
    duration: initial?.duration ?? '',
    description: initial?.description ?? '',
    at_higher_ranks: initial?.at_higher_ranks ?? '',
  });

  const set = (field: keyof Omit<JutsuFormData, 'keyword_ids' | 'elements'>) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const toggleKeyword = (id: string) => {
    setForm((f) => ({
      ...f,
      keyword_ids: f.keyword_ids.includes(id)
        ? f.keyword_ids.filter((k) => k !== id)
        : [...f.keyword_ids, id],
    }));
  };

  const toggleElement = (el: string) => {
    setForm((f) => ({
      ...f,
      elements: f.elements.includes(el)
        ? f.elements.filter((e) => e !== el)
        : [...f.elements, el],
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <FormField label="Name" required>
        <input className={inputClass} value={form.name} onChange={set('name')} placeholder="Fireball Jutsu" required />
      </FormField>
      <FormField label="Jutsu Rank" required>
        <select className={inputClass} value={form.jutsu_rank_id} onChange={set('jutsu_rank_id')} required>
          <option value="" disabled>Select rank...</option>
          {jutsuRanks.map((r) => <option key={r._id} value={r._id}>{r.name}</option>)}
        </select>
      </FormField>
      <div className="grid grid-cols-3 gap-3">
        <FormField label="Casting Time" required>
          <input className={inputClass} value={form.casting_time} onChange={set('casting_time')} placeholder="1 Action" required />
        </FormField>
        <FormField label="Range" required>
          <input className={inputClass} value={form.range} onChange={set('range')} placeholder="60 feet" required />
        </FormField>
        <FormField label="Chakra Cost" required>
          <input className={inputClass} value={form.chakra_cost} onChange={set('chakra_cost')} placeholder="3 Chakra" required />
        </FormField>
      </div>
      <FormField label="Elements">
        <div className="flex flex-wrap gap-2 pt-1">
          {ELEMENTS.map((el) => (
            <button
              key={el}
              type="button"
              onClick={() => toggleElement(el)}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                form.elements.includes(el)
                  ? 'bg-blue-500 border-blue-500 text-white'
                  : 'bg-gray-800 border-gray-600 text-gray-300 hover:border-blue-500'
              }`}
            >
              {el}
            </button>
          ))}
        </div>
      </FormField>
      <FormField label="Keywords">
        <div className="flex flex-wrap gap-2 pt-1">
          {keywords.map((k) => (
            <button
              key={k._id}
              type="button"
              onClick={() => toggleKeyword(k._id)}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                form.keyword_ids.includes(k._id)
                  ? 'bg-orange-500 border-orange-500 text-white'
                  : 'bg-gray-800 border-gray-600 text-gray-300 hover:border-orange-500'
              }`}
            >
              {k.name}
            </button>
          ))}
          {keywords.length === 0 && <span className="text-gray-500 text-sm">No keywords yet.</span>}
        </div>
      </FormField>
      <div className="grid grid-cols-2 gap-3">
        <FormField label="Components" required>
          <input className={inputClass} value={form.components} onChange={set('components')} placeholder="HS, CM" required />
        </FormField>
        <FormField label="Duration" required>
          <input className={inputClass} value={form.duration} onChange={set('duration')} placeholder="Instantaneous" required />
        </FormField>
      </div>
      <FormField label="Description" required>
        <textarea className={textareaClass} value={form.description} onChange={set('description')} placeholder="Describe this jutsu..." required />
      </FormField>
      <FormField label="At Higher Ranks">
        <textarea className={textareaClass} value={form.at_higher_ranks} onChange={set('at_higher_ranks')} placeholder="For each rank above D-Rank, increase cost by 3..." />
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
  const [keywords, setKeywords] = useState<Release[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Jutsu | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Jutsu | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [j, jr, k] = await Promise.all([
        jutsusApi.list(),
        jutsuRanksApi.list(),
        releasesApi.list(),
      ]);
      setJutsus(j);
      setJutsuRanks(jr);
      setKeywords(k);
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
      const payload = {
        ...data,
        at_higher_ranks: data.at_higher_ranks.trim() || null,
      };
      if (editing) {
        await jutsusApi.update(editing._id, payload);
        show('Jutsu updated');
      } else {
        await jutsusApi.create(payload);
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
  const keywordMap = Object.fromEntries(keywords.map((k) => [k._id, k.name]));

  const filteredJutsus = search.trim()
    ? jutsus.filter((j) => j.name.toLowerCase().includes(search.toLowerCase()))
    : jutsus;

  const columns: Column<Jutsu>[] = [
    { key: 'name', label: 'Name' },
    {
      key: 'jutsu_rank_id',
      label: 'Rank',
      render: (j) => <span className="text-gray-300">{rankMap[j.jutsu_rank_id] ?? j.jutsu_rank_id}</span>,
    },
    { key: 'casting_time', label: 'Casting Time' },
    { key: 'range', label: 'Range' },
    { key: 'chakra_cost', label: 'Chakra Cost' },
    {
      key: 'keyword_ids',
      label: 'Keywords',
      render: (j) => (
        <div className="flex flex-wrap gap-1">
          {j.keyword_ids.length === 0
            ? <span className="text-gray-500">—</span>
            : j.keyword_ids.map((id) => (
                <span key={id} className="px-2 py-0.5 rounded-full text-xs bg-orange-500/20 text-orange-300">
                  {keywordMap[id] ?? id}
                </span>
              ))}
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Jutsus"
        description="All learnable jutsu."
        action={{ label: '+ New Jutsu', onClick: openCreate }}
      />
      <div className="mb-4">
        <input
          className="w-full max-w-sm bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-gray-100 text-sm placeholder-gray-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
          placeholder="Search jutsus..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <DataTable
        columns={columns}
        data={filteredJutsus}
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
          keywords={keywords}
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
