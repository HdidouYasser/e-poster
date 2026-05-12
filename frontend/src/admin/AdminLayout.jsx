import { Link, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";
import { LogOut, Calendar, FileText, Search, Users, Tags, UploadCloud, Activity } from "lucide-react";
import clsx from "clsx";

export default function AdminLayout() {
  const logout = useAuthStore((s) => s.logout);
  const username = useAuthStore((s) => s.username);
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
          <Link to="/admin/categories" className={navItemClass("/admin/categories")}>
            <Tags size={20} /> Catégories
          </Link>
          <Link to="/admin/authors" className={navItemClass("/admin/authors")}>
            <Users size={20} /> Auteurs
          </Link>
          <Link to="/admin/import" className={navItemClass("/admin/import")}>
            <UploadCloud size={20} /> Import Bulk
          </Link>
          <Link to="/admin/audit" className={navItemClass("/admin/audit")}>
            <Activity size={20} /> Audit Logs
          </Link>
        </nav>

        <div className="mt-auto space-y-1 mb-4 border-b border-slate-200 pb-4">
          <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 rounded-xl transition-colors font-medium">
            <LogOut size={20} /> Déconnexion
          </button>
        </div>

        <div className="flex items-center gap-3 px-2 pb-2">
          <div className="w-10 h-10 rounded-full bg-emerald-100 border border-emerald-200 flex items-center justify-center text-sm font-bold text-emerald-700 uppercase">
            {username ? username.substring(0, 2) : "AD"}
          </div>
          <div className="overflow-hidden">
            <div className="text-sm font-medium text-slate-800 truncate">{username || "Admin"}</div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden bg-slate-50">
        {/* Topbar */}
        <header className="h-16 border-b border-slate-200 bg-white flex items-center justify-between px-8 shrink-0 shadow-sm">
          <div className="flex items-center gap-4 text-slate-500 font-medium">
            Tableau de Bord Administration
          </div>
          <div className="flex items-center gap-4">
            
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
