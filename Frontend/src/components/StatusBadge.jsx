const styles = {
  todo: 'bg-gray-100 text-gray-700 border-gray-200',
  in_progress: 'bg-blue-50 text-blue-700 border-blue-200',
  done: 'bg-green-50 text-green-700 border-green-200',
};
const labels = { todo: 'To Do', in_progress: 'In Progress', done: 'Done' };

export function StatusBadge({ status }) {
  return (
    <span className={`inline-block px-2 py-0.5 text-xs rounded border ${styles[status] || styles.todo}`}>
      {labels[status] || status}
    </span>
  );
}
