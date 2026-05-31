import { Link, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";
import { LogOut, Calendar, FileText, Users, Tags, UploadCloud, Activity, Monitor, Presentation, BarChart3, Sparkles } from "lucide-react";
import clsx from "clsx";

const navItems = [
  { path: "/admin/stats",        icon: BarChart3,    label: "Tableau de bord" },
  { path: "/admin/publications", icon: FileText,    label: "E-Posters" },
  { path: "/admin/screens",      icon: Monitor,      label: "Écrans / Totems" },
  { path: "/admin/events",       icon: Calendar,     label: "Événements" },
  { path: "/admin/categories",   icon: Tags,         label: "Catégories" },
  { path: "/admin/authors",      icon: Users,        label: "Auteurs" },
  { path: "/admin/import",       icon: UploadCloud,  label: "Import Bulk" },
  { path: "/admin/audit",        icon: Activity,     label: "Audit Logs" },
];

export default function AdminLayout() {
  const logout   = useAuthStore((s) => s.logout);
  const username = useAuthStore((s) => s.username);
  const location = useLocation();

  const activeNav = navItems.find((n) => location.pathname.startsWith(n.path));

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 font-sans overflow-hidden">

      {/* ── Sidebar ── */}
      <aside className="w-64 border-r border-slate-200/60 bg-white/95 backdrop-blur-xl flex flex-col shrink-0 shadow-lg">

        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-6 border-b border-slate-200/50 bg-slate-50/50">
          <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center shadow-lg shrink-0 relative overflow-hidden">
            <Presentation size={20} className="text-white relative z-10" />
            <Sparkles size={8} className="absolute top-1 right-1 text-orange-300 animate-pulse" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900 leading-none font-display tracking-tight">E-Poster</h1>
            <p className="text-xs text-slate-500 font-semibold mt-1 uppercase tracking-wider">Administration</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent">
          {navItems.map(({ path, icon: Icon, label }) => {
            const isActive = location.pathname.startsWith(path);
            return (
              <Link
                key={path}
                to={path}
                className={clsx(
                  "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 text-sm font-medium group relative",
                  isActive
                    ? "bg-slate-900 text-white shadow-md scale-105 origin-left"
                    : "text-slate-600 hover:bg-slate-100/80 hover:text-slate-900"
                )}
              >
                <Icon
                  size={18}
                  className={clsx(
                    "shrink-0 transition-all",
                    isActive ? "text-white scale-110" : "text-slate-400 group-hover:text-slate-600 group-hover:scale-110"
                  )}
                />
                <span className="relative z-10">{label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200/50 space-y-2 bg-transparent">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-red-50/80 hover:text-red-600 rounded-lg transition-all duration-200 font-medium text-sm group"
          >
            <LogOut size={18} className="shrink-0 group-hover:scale-110 transition-transform" />
            Déconnexion
          </button>

          <div className="flex items-center gap-3 px-4 py-3 mt-2 bg-slate-100 rounded-lg border border-slate-200/50">
            <div className="w-9 h-9 rounded-lg bg-slate-500 flex items-center justify-center text-xs font-bold text-white uppercase shrink-0 shadow-md">
              {username ? username.substring(0, 2) : "AD"}
            </div>
            <div className="overflow-hidden flex-1">
              <div className="text-sm font-semibold text-slate-900 truncate">{username || "Admin"}</div>
              <div className="text-xs text-slate-500 font-medium">Administrateur</div>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="flex-1 flex flex-col overflow-hidden bg-slate-50">

        {/* Topbar */}
        <header className="h-16 border-b border-slate-200/40 bg-white/80 backdrop-blur-xl flex items-center justify-between px-8 shrink-0 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex flex-col gap-1">
              <span className="text-lg font-bold text-slate-900 font-display tracking-tight">
                {activeNav?.label ?? "Tableau de bord"}
              </span>
              <span className="text-xs text-slate-500 font-medium">Plateforme E-Poster</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-2 bg-emerald-50 rounded-lg border border-emerald-200/50">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-lg shadow-emerald-500/50" />
              <span className="text-xs font-semibold text-emerald-700">En ligne</span>
            </div>
          </div>
        </header>

        {/* Content area */}
        <div className="flex-1 overflow-auto p-8 bg-dot-grid-subtle">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}
