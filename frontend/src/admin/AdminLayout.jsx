import { Link, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";
import {
  LogOut, Calendar, FileText, Users, Tags, UploadCloud,
  Activity, Monitor, Presentation, BarChart3, Download, UserCog, UserCircle2
} from "lucide-react";
import clsx from "clsx";

const navItems = [
  { path: "/admin/stats",        icon: BarChart3,     label: "Tableau de bord",  adminOnly: false },
  { path: "/admin/publications", icon: FileText,      label: "E-Posters",         adminOnly: false },
  { path: "/admin/events",       icon: Calendar,      label: "Événements",        adminOnly: false },
  { path: "/admin/screens",      icon: Monitor,       label: "Écrans / Totems",   adminOnly: true  },
  { path: "/admin/categories",   icon: Tags,          label: "Catégories",        adminOnly: true  },
  { path: "/admin/authors",      icon: Users,         label: "Auteurs",           adminOnly: true  },
  { path: "/admin/managers",     icon: UserCog,       label: "Responsables",      adminOnly: true  },
  { path: "/admin/import",       icon: UploadCloud,   label: "Import Bulk",       adminOnly: true  },
  { path: "/admin/export",       icon: Download,      label: "Exports",           adminOnly: true  },
  { path: "/admin/audit",        icon: Activity,      label: "Audit Logs",        adminOnly: true  },
  { path: "/admin/profile",      icon: UserCircle2,   label: "Mon Profil",        adminOnly: false, managerOnly: true },
];

export default function AdminLayout() {
  const logout    = useAuthStore((s) => s.logout);
  const username  = useAuthStore((s) => s.username);
  const role      = useAuthStore((s) => s.role);
  const firstName = useAuthStore((s) => s.firstName);
  const lastName  = useAuthStore((s) => s.lastName);
  const avatarUrl = useAuthStore((s) => s.avatarUrl);
  const location  = useLocation();
  const isManager = role === "ROLE_EVENT_MANAGER";

  const visibleNavItems = isManager
    ? navItems.filter((n) => !n.adminOnly)
    : navItems.filter((n) => !n.managerOnly);

  const activeNav = navItems.find((n) => location.pathname.startsWith(n.path));
  const roleLabel = isManager ? "Responsable d'Événement" : "Administrateur";

  const displayName = firstName || lastName
    ? `${firstName || ""} ${lastName || ""}`.trim()
    : username || "Admin";

  const initials = firstName || lastName
    ? `${(firstName || "").charAt(0)}${(lastName || "").charAt(0)}`.toUpperCase()
    : (username || "AD").substring(0, 2).toUpperCase();

  return (
    <div className="flex h-screen bg-zinc-50 text-zinc-900 font-sans overflow-hidden">

      {/* ── Sidebar ── */}
      <aside className="w-64 border-r border-zinc-200/60 bg-white flex flex-col shrink-0">

        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-zinc-100">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${isManager ? "bg-blue-600" : "bg-zinc-900"}`}>
            <Presentation size={18} className="text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-zinc-900 leading-none tracking-tight font-display">
              E-Poster
            </h1>
            <p className="text-[10px] text-zinc-400 font-semibold mt-0.5 uppercase tracking-widest">
              {isManager ? "Espace Responsable" : "Administration"}
            </p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {visibleNavItems.map(({ path, icon: Icon, label }) => {
            const isActive = location.pathname.startsWith(path);
            return (
              <Link
                key={path}
                to={path}
                className={clsx("nav-link", isActive && "nav-link-active")}
              >
                <Icon size={16} className={clsx("shrink-0 transition-all", isActive ? "text-white" : "text-zinc-400")} />
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

          {/* Clickable user card → /admin/profile for manager, or static card for admin */}
          {isManager ? (
            <Link
              to="/admin/profile"
              className="flex items-center gap-3 px-3 py-2.5 bg-zinc-50 hover:bg-zinc-100 rounded-xl border border-zinc-100 transition-colors group"
            >
              {/* Avatar */}
              <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0 shadow-sm">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[11px] font-bold text-white uppercase bg-blue-600">
                    {initials}
                  </div>
                )}
              </div>
              <div className="overflow-hidden flex-1 min-w-0">
                <div className="text-xs font-semibold text-zinc-900 truncate group-hover:text-zinc-700">{displayName}</div>
                <div className="text-[10px] font-medium text-blue-500">{roleLabel}</div>
              </div>
              <UserCircle2 size={13} className="text-zinc-300 group-hover:text-zinc-500 transition-colors shrink-0" />
            </Link>
          ) : (
            <div className="flex items-center gap-3 px-3 py-2.5 bg-zinc-50 rounded-xl border border-zinc-100">
              {/* Avatar */}
              <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0 shadow-sm">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[11px] font-bold text-white uppercase bg-zinc-900">
                    {initials}
                  </div>
                )}
              </div>
              <div className="overflow-hidden flex-1 min-w-0">
                <div className="text-xs font-semibold text-zinc-900 truncate">{displayName}</div>
                <div className="text-[10px] font-medium text-zinc-400">{roleLabel}</div>
              </div>
            </div>
          )}
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
            {isManager && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 rounded-lg border border-blue-100 mr-2">
                <span className="text-[11px] font-semibold text-blue-700">Responsable d'Événement</span>
              </div>
            )}
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
