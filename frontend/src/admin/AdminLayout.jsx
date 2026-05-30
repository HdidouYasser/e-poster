import { Link, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";
import { LogOut, Calendar, FileText, Users, Tags, UploadCloud, Activity, Monitor, Presentation, BarChart3 } from "lucide-react";
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
    <div className="flex h-screen bg-zinc-50 text-zinc-900 font-sans overflow-hidden">

      {/* ── Sidebar ── */}
      <aside className="w-64 border-r border-zinc-200/80 bg-white flex flex-col shrink-0">

        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-zinc-100">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-zinc-900 to-zinc-600 flex items-center justify-center shadow-md shrink-0">
            <Presentation size={18} className="text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold text-zinc-900 leading-none font-display">E-Poster</h1>
            <p className="text-[10px] text-zinc-400 font-medium mt-0.5">Administration</p>
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
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm font-medium",
                  isActive
                    ? "bg-zinc-900 text-white shadow-sm"
                    : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900"
                )}
              >
                <Icon
                  size={16}
                  className={clsx(isActive ? "text-white" : "text-zinc-400")}
                />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-zinc-100 space-y-0.5">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-zinc-500 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all font-medium text-sm"
          >
            <LogOut size={16} className="shrink-0" />
            Déconnexion
          </button>

          <div className="flex items-center gap-3 px-3 py-2 mt-1">
            <div className="w-8 h-8 rounded-xl bg-zinc-100 border border-zinc-200 flex items-center justify-center text-xs font-bold text-zinc-700 uppercase shrink-0">
              {username ? username.substring(0, 2) : "AD"}
            </div>
            <div className="overflow-hidden">
              <div className="text-sm font-semibold text-zinc-900 truncate">{username || "Admin"}</div>
              <div className="text-[10px] text-zinc-400 font-medium">Administrateur</div>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="flex-1 flex flex-col overflow-hidden">

        {/* Topbar */}
        <header className="h-14 border-b border-zinc-200/80 bg-white/90 backdrop-blur-sm flex items-center justify-between px-8 shrink-0 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-zinc-500 font-display">
              {activeNav?.label ?? "Tableau de bord"}
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-zinc-400 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            En ligne
          </div>
        </header>

        {/* Content area */}
        <div className="flex-1 overflow-auto p-8 bg-zinc-50 bg-dot-grid">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
