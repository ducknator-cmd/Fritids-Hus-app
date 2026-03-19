import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Home, Settings, GitCompare, Plus } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function Layout({ children }) {
  const { compareIds } = useApp();

  return (
    <div className="min-h-screen flex flex-col">
      <nav className="bg-slate-800 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-14">
          <Link to="/" className="flex items-center gap-2 font-bold text-lg tracking-tight">
            <Home className="w-5 h-5 text-indigo-300" />
            Fritidshus Finder
          </Link>
          <div className="flex items-center gap-1">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  isActive ? 'bg-slate-600 text-white' : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                }`
              }
            >
              Boliger
            </NavLink>
            <NavLink
              to="/compare"
              className={({ isActive }) =>
                `relative flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  isActive ? 'bg-slate-600 text-white' : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                }`
              }
            >
              <GitCompare className="w-4 h-4" />
              Sammenlign
              {compareIds.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-indigo-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">
                  {compareIds.length}
                </span>
              )}
            </NavLink>
            <NavLink
              to="/settings"
              className={({ isActive }) =>
                `flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  isActive ? 'bg-slate-600 text-white' : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                }`
              }
            >
              <Settings className="w-4 h-4" />
              Indstillinger
            </NavLink>
            <Link
              to="/add"
              className="ml-2 flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
            >
              <Plus className="w-4 h-4" />
              Tilføj bolig
            </Link>
          </div>
        </div>
      </nav>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  );
}
