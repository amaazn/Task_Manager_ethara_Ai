import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, X, Trash2 } from 'lucide-react';
import { api, apiError } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import { StatusBadge } from '../components/StatusBadge.jsx';

function fmtDate(d) { return d ? new Date(d).toLocaleDateString() : '—'; }
function toIsoOrNull(v) { return v ? new Date(v).toISOString() : null; }

export default function ProjectDetail() {
  const { id } = useParams();
  const qc = useQueryClient();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const projectQ = useQuery({
    queryKey: ['project', id],
    queryFn: () => api.get(`/projects/${id}`).then((r) => r.data.project),
  });
  const tasksQ = useQuery({
    queryKey: ['project', id, 'tasks'],
    queryFn: () => api.get(`/projects/${id}/tasks`).then((r) => r.data.tasks),
  });
  const usersQ = useQuery({
    queryKey: ['users'],
    queryFn: () => api.get('/users').then((r) => r.data.users),
    enabled: isAdmin,
  });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['project', id] });
    qc.invalidateQueries({ queryKey: ['project', id, 'tasks'] });
    qc.invalidateQueries({ queryKey: ['dashboard'] });
    qc.invalidateQueries({ queryKey: ['projects'] });
  };

  const addMember = useMutation({
    mutationFn: (userId) => api.post(`/projects/${id}/members`, { userId }),
    onSuccess: invalidate,
  });
  const removeMember = useMutation({
    mutationFn: (userId) => api.delete(`/projects/${id}/members/${userId}`),
    onSuccess: invalidate,
  });
  const deleteProject = useMutation({
    mutationFn: () => api.delete(`/projects/${id}`),
    onSuccess: () => { invalidate(); window.location.assign('/projects'); },
  });

  const updateTask = useMutation({
    mutationFn: ({ taskId, body }) => api.patch(`/tasks/${taskId}`, body),
    onSuccess: invalidate,
  });
  const deleteTask = useMutation({
    mutationFn: (taskId) => api.delete(`/tasks/${taskId}`),
    onSuccess: invalidate,
  });

  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskAssignee, setTaskAssignee] = useState('');
  const [taskDue, setTaskDue] = useState('');
  const [taskError, setTaskError] = useState(null);
  const createTask = useMutation({
    mutationFn: (body) => api.post(`/projects/${id}/tasks`, body),
    onSuccess: () => {
      invalidate();
      setTaskTitle(''); setTaskDesc(''); setTaskAssignee(''); setTaskDue(''); setTaskError(null);
    },
    onError: (e) => setTaskError(apiError(e)),
  });

  if (projectQ.isLoading) return <div className="text-gray-500">Loading…</div>;
  if (projectQ.error) return <div className="text-red-600">{apiError(projectQ.error)}</div>;
  const project = projectQ.data;

  const memberIds = new Set(project.members.map((m) => m.id || m._id));
  const candidates = (usersQ.data || []).filter((u) => !memberIds.has(u.id || u._id));

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <Link to="/projects" className="text-sm text-gray-500 hover:underline">← Projects</Link>
          <h1 className="text-2xl font-bold mt-1">{project.name}</h1>
          {project.description && <p className="text-gray-600 mt-1">{project.description}</p>}
        </div>
        {isAdmin && (
          <button
            onClick={() => { if (confirm('Delete this project and all its tasks?')) deleteProject.mutate(); }}
            className="text-red-600 text-sm hover:underline"
          >
            Delete project
          </button>
        )}
      </div>

      <section className="bg-white border rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold">Members ({project.members.length})</h2>
        </div>
        <ul className="flex flex-wrap gap-2">
          {project.members.map((m) => {
            const memberId = m.id || m._id;
            return (
            <li key={memberId} className="inline-flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-full text-sm">
              {m.name} <span className="text-xs text-gray-500">({m.role})</span>
              {isAdmin && (
                <button onClick={() => removeMember.mutate(memberId)} className="text-gray-500 hover:text-red-600">
                  <X size={14} />
                </button>
              )}
            </li>
            );
          })}
        </ul>
        {isAdmin && candidates.length > 0 && (
          <div className="mt-3 flex items-center gap-2">
            <select
              className="border rounded-md px-2 py-1 text-sm"
              onChange={(e) => { if (e.target.value) { addMember.mutate(e.target.value); e.target.value=''; } }}
              defaultValue=""
            >
              <option value="">+ Add member…</option>
              {candidates.map((u) => {
                const userId = u.id || u._id;
                return (
                  <option key={userId} value={userId}>{u.name} ({u.email})</option>
                );
              })}
            </select>
          </div>
        )}
      </section>

      <section className="bg-white border rounded-lg">
        <div className="px-4 py-3 border-b font-semibold flex items-center justify-between">
          <span>Tasks ({tasksQ.data?.length ?? 0})</span>
        </div>

        <form
          className="p-4 border-b space-y-2 bg-gray-50"
          onSubmit={(e) => {
            e.preventDefault();
            createTask.mutate({
              title: taskTitle,
              description: taskDesc,
              assignee: taskAssignee || null,
              dueDate: toIsoOrNull(taskDue),
            });
          }}
        >
          {taskError && <div className="text-sm text-red-600">{taskError}</div>}
          <div className="flex gap-2 flex-wrap">
            <input className="flex-1 border rounded-md px-3 py-2 text-sm min-w-[200px]" placeholder="Task title" required value={taskTitle} onChange={(e)=>setTaskTitle(e.target.value)} />
            <select className="border rounded-md px-2 py-2 text-sm" value={taskAssignee} onChange={(e)=>setTaskAssignee(e.target.value)}>
              <option value="">Unassigned</option>
              {isAdmin ? (
                project.members.map((m) => {
                  const memberId = m.id || m._id;
                  return (
                    <option key={memberId} value={memberId}>{m.name}</option>
                  );
                })
              ) : (
                <option value={user.id || user._id}>{user.name}</option>
              )}
            </select>
            <input className="border rounded-md px-2 py-2 text-sm" type="date" value={taskDue} onChange={(e)=>setTaskDue(e.target.value)} />
            <button disabled={createTask.isPending} className="inline-flex items-center gap-1 bg-gray-900 text-white px-3 py-2 rounded-md text-sm disabled:opacity-50">
              <Plus size={14} /> Add
            </button>
          </div>
          <textarea className="w-full border rounded-md px-3 py-2 text-sm" placeholder="Description (optional)" value={taskDesc} onChange={(e)=>setTaskDesc(e.target.value)} />
        </form>

        {tasksQ.isLoading ? (
          <div className="p-4 text-gray-500">Loading tasks…</div>
        ) : tasksQ.data?.length === 0 ? (
          <div className="p-4 text-sm text-gray-500">No tasks yet.</div>
        ) : (
          <ul className="divide-y">
            {tasksQ.data.map((t) => {
              const overdue = t.dueDate && t.status !== 'done' && new Date(t.dueDate) < new Date();
              return (
                <li key={t._id} className="p-4 flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium">{t.title}</div>
                    {t.description && <div className="text-sm text-gray-500 mt-1">{t.description}</div>}
                    <div className="flex gap-3 text-xs text-gray-500 mt-2">
                      <span>Assignee: {t.assignee?.name || 'Unassigned'}</span>
                      <span className={overdue ? 'text-red-600 font-medium' : ''}>Due: {fmtDate(t.dueDate)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <select
                      className="border rounded-md px-2 py-1 text-sm"
                      value={t.status}
                      onChange={(e) => updateTask.mutate({ taskId: t._id, body: { status: e.target.value } })}
                    >
                      <option value="todo">To Do</option>
                      <option value="in_progress">In Progress</option>
                      <option value="done">Done</option>
                    </select>
                    <StatusBadge status={t.status} />
                    {isAdmin && (
                      <button onClick={() => { if (confirm('Delete this task?')) deleteTask.mutate(t._id); }}
                        className="text-gray-400 hover:text-red-600">
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
