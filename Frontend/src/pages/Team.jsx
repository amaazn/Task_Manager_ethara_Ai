import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Trash2 } from 'lucide-react';
import { api, apiError } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function Team() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['users'],
    queryFn: () => api.get('/users').then((r) => r.data.users),
  });

  const setRole = useMutation({
    mutationFn: ({ id, role }) => api.patch(`/users/${id}/role`, { role }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }),
  });

  const remove = useMutation({
    mutationFn: (id) => api.delete(`/users/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }),
  });

  if (isLoading) return <div className="text-gray-500">Loading…</div>;
  if (error) return <div className="text-red-600">{apiError(error)}</div>;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Team</h1>
      <div className="bg-white border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600 text-left">
            <tr>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Email</th>
              <th className="px-4 py-2">Role</th>
              <th className="px-4 py-2 w-10"></th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {data.map((u) => (
              <tr key={u.id}>
                <td className="px-4 py-2 font-medium">{u.name}</td>
                <td className="px-4 py-2 text-gray-600">{u.email}</td>
                <td className="px-4 py-2">
                  <select
                    value={u.role}
                    disabled={u.id === user.id}
                    onChange={(e) => setRole.mutate({ id: u.id, role: e.target.value })}
                    className="border rounded-md px-2 py-1"
                  >
                    <option value="member">member</option>
                    <option value="admin">admin</option>
                  </select>
                </td>
                <td className="px-4 py-2">
                  {u.id !== user.id && (
                    <button onClick={() => { if (confirm(`Delete ${u.email}?`)) remove.mutate(u.id); }}
                      className="text-gray-400 hover:text-red-600">
                      <Trash2 size={16} />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
