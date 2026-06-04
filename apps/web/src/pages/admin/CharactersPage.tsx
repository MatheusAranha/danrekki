import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { charactersApi, Character } from '../../api/characters';
import { usersApi, User } from '../../api/users';
import { clansApi, Clan } from '../../api/clans';
import { useToastStore } from '../../stores/toast';
import { PageHeader } from '../../components/PageHeader';
import { DataTable, Column } from '../../components/DataTable';
import { Modal } from '../../components/Modal';
import { Button } from '../../components/Button';
import { FormField } from '../../components/FormField';

const inputClass =
  'w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-gray-100 text-sm placeholder-gray-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500';

export function CharactersPage() {
  const { show } = useToastStore();
  const [characters, setCharacters] = useState<Character[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [clans, setClans] = useState<Clan[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', user_id: '', clan_id: '' });

  const load = async () => {
    setLoading(true);
    try {
      const [chars, u, c] = await Promise.all([
        charactersApi.list(),
        usersApi.list(),
        clansApi.list(),
      ]);
      setCharacters(chars);
      setUsers(u);
      setClans(c);
    } catch {
      show('Failed to load characters', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openModal = () => {
    setForm({ name: '', user_id: '', clan_id: '' });
    setModalOpen(true);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await charactersApi.create(form);
      show('Character created');
      setModalOpen(false);
      load();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } }; message?: string };
      show(e.response?.data?.error || e.message || 'Failed to create character', 'error');
    } finally {
      setSaving(false);
    }
  };

  const userMap = Object.fromEntries(users.map((u) => [u._id, u.email]));

  const columns: Column<Character>[] = [
    { key: 'name', label: 'Name' },
    {
      key: 'user_id',
      label: 'Player',
      render: (c) => (
        <span className="text-gray-300 text-sm">{userMap[c.user_id] ?? c.user_id}</span>
      ),
    },
    {
      key: 'available_dt',
      label: 'Available DT',
      render: (c) => (
        <span className="text-orange-400 font-semibold">{c.available_dt.toLocaleString()}</span>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Characters"
        description="Create and manage player characters."
        action={{ label: '+ New Character', onClick: openModal }}
      />
      <DataTable
        columns={columns}
        data={characters}
        loading={loading}
        actions={(char) => (
          <Link
            to={`/admin/characters/${char._id}`}
            className="px-2 py-1 text-xs text-orange-400 hover:text-orange-300 border border-orange-500/30 rounded-lg hover:bg-orange-500/10 transition-colors"
          >
            View →
          </Link>
        )}
        emptyMessage="No characters yet. Create one for a player to get started."
      />
      <Modal isOpen={modalOpen} title="New Character" onClose={() => setModalOpen(false)} size="sm">
        <form onSubmit={handleCreate} className="flex flex-col gap-4">
          <FormField label="Character Name" required>
            <input
              className={inputClass}
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="Naruto Uzumaki"
              required
            />
          </FormField>
          <FormField label="Player" required>
            <select
              className={inputClass}
              value={form.user_id}
              onChange={(e) => setForm((f) => ({ ...f, user_id: e.target.value }))}
              required
            >
              <option value="" disabled>Select player...</option>
              {users.filter((u) => u.role === 'player').map((u) => (
                <option key={u._id} value={u._id}>{u.email}</option>
              ))}
            </select>
          </FormField>
          <FormField label="Clan" required>
            <select
              className={inputClass}
              value={form.clan_id}
              onChange={(e) => setForm((f) => ({ ...f, clan_id: e.target.value }))}
              required
            >
              <option value="" disabled>Select clan...</option>
              {clans.map((c) => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
          </FormField>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" type="button" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" loading={saving}>Create Character</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
