import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { api, apiError } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function Projects() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: () => api.get('/projects').then((r) => r.data),
  });

  const createMut = useMutation({
    mutationFn: (body) => api.post('/projects', body).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['projects'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
      setShowForm(false); setName(''); setDescription(''); setError(null);
    },
    onError: (e) => setError(apiError(e)),
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Projects</h1>
        {user?.role === 'admin' && (
          <button onClick={() => setShowForm((s) => !s)}
            className="inline-flex items-center gap-2 bg-gray-900 text-white px-3 py-2 rounded-md text-sm hover:bg-gray-800">
            <Plus size={16} /> New Project
          </button>
        )}
      </div>

      {showForm && (
        <form
          className="bg-white border rounded-lg p-4 space-y-3"
          onSubmit={(e) => { e.preventDefault(); createMut.mutate({ name, description }); }}
        >
          {error && <div className="text-sm text-red-600">{error}</div>}
          <input className="w-full border rounded-md px-3 py-2" placeholder="Project name" required value={name} onChange={(e)=>setName(e.target.value)} />
          <textarea className="w-full border rounded-md px-3 py-2" placeholder="Description (optional)" value={description} onChange={(e)=>setDescription(e.target.value)} />
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setShowForm(false)} className="px-3 py-2 text-sm border rounded-md">Cancel</button>
            <button disabled={createMut.isPending} className="px-3 py-2 text-sm bg-gray-900 text-white rounded-md disabled:opacity-50">
              {createMut.isPending ? 'Creating…' : 'Create'}
            </button>
          </div>
        </form>
      )}

      {isLoading ? (
        <div className="text-gray-500">Loading…</div>
      ) : data?.projects?.length === 0 ? (
        <div className="bg-white border rounded-lg p-8 text-center text-gray-500">
          No projects yet.{user?.role === 'admin' ? ' Create one to get started.' : ' Ask an admin to add you to one.'}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {data.projects.map((p) => (
            <Link to={`/projects/${p._id}`} key={p._id}
              className="bg-white border rounded-lg p-4 hover:shadow-sm transition block">
              <div className="font-semibold">{p.name}</div>
              <div className="text-sm text-gray-500 mt-1 line-clamp-2">{p.description || 'No description'}</div>
              <div className="mt-3 text-xs text-gray-500">{p.members.length} member(s)</div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
