import { Link, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";
import {
  LogOut, Calendar, FileText, Users, Tags, UploadCloud,
  Activity, Monitor, Presentation, BarChart3, Download
} from "lucide-react";
import clsx from "clsx";

const navItems = [
  { path: "/admin/stats",        icon: BarChart3,   label: "Tableau de bord" },
  { path: "/admin/publications", icon: FileText,    label: "E-Posters" },
  { path: "/admin/screens",      icon: Monitor,     label: "Écrans / Totems" },
  { path: "/admin/events",       icon: Calendar,    label: "Événements" },
  { path: "/admin/categories",   icon: Tags,        label: "Catégories" },
  { path: "/admin/authors",      icon: Users,       label: "Auteurs" },
  { path: "/admin/import",       icon: UploadCloud, label: "Import Bulk" },
  { path: "/admin/export",       icon: Download,    label: "Exports" },
  { path: "/admin/audit",        icon: Activity,    label: "Audit Logs" },
];

export default function AdminLayout() {
  const logout   = useAuthStore((s) => s.logout);
  const username = useAuthStore((s) => s.username);
  const location = useLocation();

  const activeNav = navItems.find((n) => location.pathname.startsWith(n.path));

  return (
    <div className="flex h-screen bg-zinc-50 text-zinc-900 font-sans overflow-hidden">

      {/* ── Sidebar ── */}
      <aside className="w-64 border-r border-zinc-200/60 bg-white flex flex-col shrink-0">

        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-zinc-100">
          <div className="w-9 h-9 rounded-xl bg-zinc-900 flex items-center justify-center shrink-0">
            <Presentation size={18} className="text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-zinc-900 leading-none tracking-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>
              E-Poster
            </h1>
            <p className="text-[10px] text-zinc-400 font-semibold mt-0.5 uppercase tracking-widest">Administration</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {navItems.map(({ path, icon: Icon, label }) => {
            const isActive = location.pathname.startsWith(path);
            return (
              <Link
                key={path}
                to={path}
                className={clsx(
                  "nav-link",
                  isActive && "nav-link-active"
                )}
              >
                <Icon
                  size={16}
                  className={clsx(
                    "shrink-0 transition-all",
                    isActive ? "text-white" : "text-zinc-400"
                  )}
                />
                <span className="text-sm">{label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-zinc-100 space-y-1">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-zinc-500 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all duration-150 font-medium text-sm group"
          >
            <LogOut size={15} className="shrink-0" />
            Déconnexion
          </button>

          <div className="flex items-center gap-3 px-3 py-2.5 bg-zinc-50 rounded-xl border border-zinc-100">
            <div className="w-8 h-8 rounded-lg bg-zinc-900 flex items-center justify-center text-[11px] font-bold text-white uppercase shrink-0">
              {username ? username.substring(0, 2) : "AD"}
            </div>
            <div className="overflow-hidden flex-1 min-w-0">
              <div className="text-xs font-semibold text-zinc-900 truncate">{username || "Admin"}</div>
              <div className="text-[10px] text-zinc-400 font-medium">Administrateur</div>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="flex-1 flex flex-col overflow-hidden">

        {/* Topbar */}
        <header className="h-14 border-b border-zinc-200/60 bg-white flex items-center justify-between px-7 shrink-0">
          <div>
            <span className="text-sm font-bold text-zinc-900" style={{ fontFamily: "'Outfit', sans-serif" }}>
              {activeNav?.label ?? "Tableau de bord"}
            </span>
            <span className="text-xs text-zinc-400 font-medium ml-3">· Plateforme E-Poster</span>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 rounded-lg border border-emerald-100">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[11px] font-semibold text-emerald-700">En ligne</span>
            </div>
          </div>
        </header>

        {/* Content area */}
        <div className="flex-1 overflow-auto p-7 bg-dot-grid-subtle">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}
