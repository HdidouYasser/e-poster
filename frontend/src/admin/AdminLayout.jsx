import { Link, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";
import { LogOut, Calendar, FileText, Search, Plus, Bell } from "lucide-react";
import clsx from "clsx";

export default function AdminLayout() {
  const logout = useAuthStore((s) => s.logout);
  const location = useLocation();

  const navItemClass = (path) => clsx(
    "flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-medium",
    location.pathname.startsWith(path) ? "bg-emerald-500/10 text-emerald-500" : "text-neutral-400 hover:bg-neutral-800/50 hover:text-white"
  );

  return (
    <div className="flex h-screen bg-[#0a0a0a] text-neutral-200 font-sans">
      {/* Sidebar */}
      <aside className="w-64 border-r border-neutral-800 bg-[#0a0a0a] flex flex-col p-4 shrink-0">
        <div className="flex items-center gap-3 mb-8 px-2 mt-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-black font-bold">
            <FileText size={18} />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white leading-none">E-Poster</h1>

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

        <div className="mt-auto space-y-1 mb-4 border-b border-neutral-800 pb-4">
          <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-xl transition-colors font-medium">
            <LogOut size={20} /> Déconnexion
          </button>
        </div>

        <div className="flex items-center gap-3 px-2 pb-2">
          <div className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center text-sm font-bold text-white">
            AD
          </div>
          <div className="overflow-hidden">
            <div className="text-sm font-medium text-white truncate">Admin</div>
            <div className="text-xs text-neutral-500 truncate">admin@conference.org</div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden bg-[#0a0a0a]">
        {/* Topbar */}
        <header className="h-16 border-b border-neutral-800 flex items-center justify-between px-8 shrink-0">
          <div className="relative w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" size={18} />
            <input
              type="text"
              placeholder="Rechercher un poster, auteur..."
              className="w-full bg-neutral-900 border border-neutral-800 text-sm text-white pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>
          <div className="flex items-center gap-4">
            <button className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-black px-4 py-2 rounded-lg text-sm font-medium transition-colors">
              <Plus size={16} /> Nouveau
            </button>
            <button className="text-neutral-400 hover:text-white transition-colors">
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
