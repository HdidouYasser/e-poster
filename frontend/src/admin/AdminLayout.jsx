import { Link, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";
import { LogOut, Calendar, FileText } from "lucide-react";
import clsx from "clsx";

export default function AdminLayout() {
  const logout = useAuthStore((s) => s.logout);
  const location = useLocation();

  const navItemClass = (path) => clsx(
    "flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-medium",
    location.pathname.startsWith(path) ? "bg-indigo-600 text-white" : "text-slate-400 hover:bg-slate-800 hover:text-white"
  );

  return (
    <div className="flex h-screen bg-slate-950 text-slate-200">
      <aside className="w-64 border-r border-slate-800 bg-slate-900 flex flex-col p-4 shrink-0">
        <h1 className="text-2xl font-bold text-white mb-8 px-4 mt-2">E-Poster Admin</h1>
        <nav className="flex-1 space-y-2">
          <Link to="/admin/events" className={navItemClass("/admin/events")}>
            <Calendar size={20} /> Événements
          </Link>
          <Link to="/admin/publications" className={navItemClass("/admin/publications")}>
            <FileText size={20} /> Publications
          </Link>
        </nav>
        <button onClick={logout} className="flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-950 hover:text-red-300 rounded-xl transition-colors font-medium mt-auto">
          <LogOut size={20} /> Déconnexion
        </button>
      </aside>
      <main className="flex-1 overflow-auto bg-slate-950 p-8">
        <Outlet />
      </main>
    </div>
  );
}
