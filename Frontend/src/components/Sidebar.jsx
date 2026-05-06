import { NavLink } from 'react-router-dom';
import { LayoutDashboard, FolderKanban, Users, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

export function Sidebar() {
  const { user, logout } = useAuth();
  const link = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-2 rounded-md text-sm transition ${
      isActive ? 'bg-gray-800 text-white' : 'text-gray-300 hover:bg-gray-800 hover:text-white'
    }`;

  return (
    <aside className="w-60 bg-gray-900 text-white flex flex-col">
      <div className="px-5 py-5 border-b border-gray-800">
        <div className="font-bold text-lg">TaskFlow</div>
        <div className="text-xs text-gray-400 mt-1 truncate">{user?.name}</div>
        <div className="text-xs text-blue-400 capitalize mt-0.5">{user?.role}</div>
      </div>
      <nav className="flex-1 p-3 space-y-1">
        <NavLink to="/dashboard" className={link}>
          <LayoutDashboard size={18} /> Dashboard
        </NavLink>
        <NavLink to="/projects" className={link}>
          <FolderKanban size={18} /> Projects
        </NavLink>
        {user?.role === 'admin' && (
          <NavLink to="/team" className={link}>
            <Users size={18} /> Team
          </NavLink>
        )}
      </nav>
      <button
        onClick={logout}
        className="m-3 flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-800 rounded-md"
      >
        <LogOut size={18} /> Logout
      </button>
    </aside>
  );
}
