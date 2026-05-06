import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { api } from '../api/client.js';
import { StatusBadge } from '../components/StatusBadge.jsx';

function StatCard({ label, value, color }) {
  return (
    <div className={`p-4 rounded-lg border ${color}`}>
      <div className="text-xs uppercase tracking-wide opacity-70">{label}</div>
      <div className="text-2xl font-bold mt-1">{value}</div>
    </div>
  );
}

function fmtDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString();
}

export default function Dashboard() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => api.get('/dashboard').then((r) => r.data),
  });

  if (isLoading) return <div className="text-gray-500">Loading…</div>;
  if (error) return <div className="text-red-600">Failed to load dashboard.</div>;

  const { byStatus, overdue, myTasks, projectCount } = data;
  const active = byStatus.todo + byStatus.in_progress;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Active" value={active} color="bg-blue-50 border-blue-200 text-blue-900" />
        <StatCard label="Overdue" value={overdue.length} color="bg-amber-50 border-amber-200 text-amber-900" />
        <StatCard label="Done" value={byStatus.done} color="bg-green-50 border-green-200 text-green-900" />
        <StatCard label="Projects" value={projectCount} color="bg-pink-50 border-pink-200 text-pink-900" />
      </div>

      <section className="bg-white border rounded-lg">
        <div className="px-4 py-3 border-b font-semibold">Overdue</div>
        {overdue.length === 0 ? (
          <div className="p-4 text-sm text-gray-500">Nothing overdue. Nice.</div>
        ) : (
          <ul className="divide-y">
            {overdue.map((t) => (
              <li key={t._id} className="p-4 flex items-center justify-between">
                <div>
                  <Link to={`/projects/${t.project?._id}`} className="text-xs text-gray-500 hover:underline">
                    {t.project?.name}
                  </Link>
                  <div className="font-medium">{t.title}</div>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <span className="text-red-600">Due {fmtDate(t.dueDate)}</span>
                  <StatusBadge status={t.status} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="bg-white border rounded-lg">
        <div className="px-4 py-3 border-b font-semibold">My Tasks</div>
        {myTasks.length === 0 ? (
          <div className="p-4 text-sm text-gray-500">No tasks assigned to you yet.</div>
        ) : (
          <ul className="divide-y">
            {myTasks.map((t) => (
              <li key={t._id} className="p-4 flex items-center justify-between">
                <div>
                  <Link to={`/projects/${t.project?._id}`} className="text-xs text-gray-500 hover:underline">
                    {t.project?.name}
                  </Link>
                  <div className="font-medium">{t.title}</div>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <span className="text-gray-500">Due {fmtDate(t.dueDate)}</span>
                  <StatusBadge status={t.status} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
