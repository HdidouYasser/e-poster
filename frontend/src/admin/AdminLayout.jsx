import { Link, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";
import { LogOut, Calendar, FileText, Search, Users, Tags, UploadCloud, Activity } from "lucide-react";
import clsx from "clsx";

export default function AdminLayout() {
  const logout = useAuthStore((s) => s.logout);
  const username = useAuthStore((s) => s.username);
  const location = useLocation();

  const navItemClass = (path) => clsx(
    "flex items-center gap-3 px-3 py-2 rounded-md transition-colors font-medium text-sm",
    location.pathname.startsWith(path)
      ? "bg-zinc-100 text-zinc-900 font-semibold"
      : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900"
  );

  return (
    <div className="flex h-screen bg-zinc-50 text-zinc-900 font-sans">
      {/* Sidebar */}
      <aside className="w-64 border-r border-zinc-200 bg-white flex flex-col px-4 py-6 shrink-0">
        <div className="flex items-center gap-3 mb-8 px-2">
          <div className="w-8 h-8 rounded-md bg-zinc-900 flex items-center justify-center text-white font-bold">
            <FileText size={16} />
          </div>
          <div>
            <h1 className="text-base font-bold text-zinc-900 leading-none">E-Poster</h1>
          </div>
        </div>

        <nav className="flex-1 space-y-1">
          <Link to="/admin/publications" className={navItemClass("/admin/publications")}>
            <FileText size={18} /> E-Posters
          </Link>
          <Link to="/admin/events" className={navItemClass("/admin/events")}>
            <Calendar size={18} /> Événements
          </Link>
          <Link to="/admin/categories" className={navItemClass("/admin/categories")}>
            <Tags size={18} /> Catégories
          </Link>
          <Link to="/admin/authors" className={navItemClass("/admin/authors")}>
            <Users size={18} /> Auteurs
          </Link>
          <Link to="/admin/import" className={navItemClass("/admin/import")}>
            <UploadCloud size={18} /> Import Bulk
          </Link>
          <Link to="/admin/audit" className={navItemClass("/admin/audit")}>
            <Activity size={18} /> Audit Logs
          </Link>
        </nav>

        <div className="mt-auto space-y-1 mb-6 border-b border-zinc-200 pb-6">
          <button onClick={logout} className="w-full flex items-center gap-3 px-3 py-2 text-zinc-500 hover:bg-zinc-50 hover:text-red-600 rounded-md transition-colors font-medium text-sm">
            <LogOut size={18} /> Déconnexion
          </button>
        </div>

        <div className="flex items-center gap-3 px-2">
          <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-xs font-bold text-zinc-700 uppercase">
            {username ? username.substring(0, 2) : "AD"}
          </div>
          <div className="overflow-hidden">
            <div className="text-sm font-semibold text-zinc-900 truncate">{username || "Admin"}</div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden bg-zinc-50">
        {/* Topbar */}
        <header className="h-14 border-b border-zinc-200 bg-white flex items-center justify-between px-8 shrink-0">
          <div className="flex items-center gap-4 text-zinc-500 font-medium text-sm">
            Tableau de Bord Administration
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
