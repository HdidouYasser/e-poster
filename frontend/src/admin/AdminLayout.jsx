import { Link, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";
import { LogOut, Calendar, FileText, Search, Plus, Bell } from "lucide-react";
import clsx from "clsx";

export default function AdminLayout() {
  const logout = useAuthStore((s) => s.logout);
  const location = useLocation();

  const navItemClass = (path) => clsx(
    "flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-medium",
    location.pathname.startsWith(path)
      ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
      : "text-slate-500 hover:bg-slate-100 hover:text-slate-800"
  );

  return (
    <div className="flex h-screen bg-slate-50 text-slate-800 font-sans">
      {/* Sidebar */}
      <aside className="w-64 border-r border-slate-200 bg-white flex flex-col p-4 shrink-0 shadow-sm">
        <div className="flex items-center gap-3 mb-8 px-2 mt-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-white font-bold shadow-sm">
            <FileText size={18} />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-800 leading-none">E-Poster</h1>
          </div>
        </div>

        <nav className="flex-1 space-y-1">
          <Link to="/admin/publications" className={navItemClass("/admin/publications")}>
            <FileText size={20} /> E-Posters
          </Link>
          <Link to="/admin/events" className={navItemClass("/admin/events")}>
            <Calendar size={20} /> Événements
          </Link>
        </nav>

        <div className="mt-auto space-y-1 mb-4 border-b border-slate-200 pb-4">
          <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 rounded-xl transition-colors font-medium">
            <LogOut size={20} /> Déconnexion
          </button>
        </div>

        <div className="flex items-center gap-3 px-2 pb-2">
          <div className="w-10 h-10 rounded-full bg-emerald-100 border border-emerald-200 flex items-center justify-center text-sm font-bold text-emerald-700">
            AD
          </div>
          <div className="overflow-hidden">
            <div className="text-sm font-medium text-slate-800 truncate">Admin</div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden bg-slate-50">
        {/* Topbar */}
        <header className="h-16 border-b border-slate-200 bg-white flex items-center justify-between px-8 shrink-0 shadow-sm">
          <div className="relative w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Rechercher un poster, auteur..."
              className="w-full bg-slate-50 border border-slate-200 text-sm text-slate-800 pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition-colors"
            />
          </div>
          <div className="flex items-center gap-4">
            <button className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm">
              <Plus size={16} /> Nouveau
            </button>
            <button className="text-slate-400 hover:text-slate-700 transition-colors">
              <Bell size={20} />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
