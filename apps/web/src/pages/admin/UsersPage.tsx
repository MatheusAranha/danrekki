import { useState, useEffect } from 'react';
import { usersApi, User } from '../../api/users';
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

function CreateUserForm({
  onSave,
  onCancel,
  saving,
}: {
  onSave: (data: { email: string; password: string; role: 'admin' | 'player' }) => void;
  onCancel: () => void;
  saving: boolean;
}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'admin' | 'player'>('player');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ email, password, role });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <FormField label="Email" required>
        <input
          type="email"
          className={inputClass}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="player@example.com"
          required
        />
      </FormField>
      <FormField label="Password" required>
        <input
          type="password"
          className={inputClass}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          required
        />
      </FormField>
      <FormField label="Role" required>
        <select
          className={inputClass}
          value={role}
          onChange={(e) => setRole(e.target.value as 'admin' | 'player')}
          required
        >
          <option value="player">Player</option>
          <option value="admin">Admin</option>
        </select>
      </FormField>
      <div className="flex justify-end gap-3 pt-2">
        <Button variant="secondary" type="button" onClick={onCancel}>Cancel</Button>
        <Button type="submit" loading={saving}>Create User</Button>
      </div>
    </form>
  );
}

export function UsersPage() {
  const { show } = useToastStore();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      setUsers(await usersApi.list());
    } catch {
      show('Failed to load users', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (data: { email: string; password: string; role: 'admin' | 'player' }) => {
    setSaving(true);
    try {
      await usersApi.create(data);
      show('User created');
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
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await usersApi.delete(deleteTarget._id);
      show('User deleted');
      setDeleteTarget(null);
      load();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } }; message?: string };
      show(e.response?.data?.error || e.message || 'Delete failed', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const columns: Column<User>[] = [
    { key: 'email', label: 'Email' },
    {
      key: 'role',
      label: 'Role',
      render: (u) => (
        <Badge variant={u.role === 'admin' ? 'orange' : 'gray'}>{u.role}</Badge>
      ),
    },
    {
      key: 'created_at',
      label: 'Created At',
      render: (u) => (
        <span className="text-gray-400">{new Date(u.created_at).toLocaleDateString()}</span>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Users"
        description="Player and admin accounts."
        action={{ label: '+ New User', onClick: () => setModalOpen(true) }}
      />
      <DataTable
        columns={columns}
        data={users}
        loading={loading}
        onDelete={setDeleteTarget}
        emptyMessage="No users found."
      />
      <Modal isOpen={modalOpen} title="New User" onClose={() => setModalOpen(false)} size="sm">
        <CreateUserForm
          onSave={handleCreate}
          onCancel={() => setModalOpen(false)}
          saving={saving}
        />
      </Modal>
      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Delete User"
        message={`Delete user "${deleteTarget?.email}"? This cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />
    </div>
  );
}
