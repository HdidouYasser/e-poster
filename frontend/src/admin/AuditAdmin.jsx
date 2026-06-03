import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "../api";
import { Activity, Loader2 } from "lucide-react";

export default function AuditAdmin() {
  const [page, setPage] = useState(0);
  const size = 20;

  const { data, isLoading } = useQuery({
    queryKey: ["audit-logs", page, size],
    queryFn: async () => (await api.get(`/audit-logs?page=${page}&size=${size}`)).data
  });

  const formatDate = (isoString) => {
    if (!isoString) return "—";
    const d = new Date(isoString);
    return d.toLocaleString('fr-FR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit'
    });
  };

  const getActionStyle = (action) => {
    switch (action) {
      case 'CREATE': return 'bg-zinc-900 text-white border-zinc-900';
      case 'UPDATE': return 'bg-zinc-100 text-zinc-700 border-zinc-200';
      case 'DELETE': return 'bg-red-50 text-red-600 border-red-200';
      default: return 'bg-white text-zinc-500 border-zinc-200';
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto font-sans">
      {/* Header */}
      <div className="page-header">
        <div>
          <h2 className="page-title">Logs d'Audit</h2>
          <p className="page-subtitle">Historique complet des opérations effectuées sur la plateforme</p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-zinc-200/80 rounded-3xl overflow-hidden shadow-sm">
        <table className="w-full text-left text-sm text-zinc-700">
          <thead className="bg-zinc-50/80 border-b border-zinc-100">
            <tr>
              <th className="px-6 py-3.5 font-semibold text-[11px] uppercase tracking-wider text-zinc-400 w-48">Date & Heure</th>
              <th className="px-6 py-3.5 font-semibold text-[11px] uppercase tracking-wider text-zinc-400 w-40">Entité</th>
              <th className="px-6 py-3.5 font-semibold text-[11px] uppercase tracking-wider text-zinc-400 w-24">ID</th>
              <th className="px-6 py-3.5 font-semibold text-[11px] uppercase tracking-wider text-zinc-400 w-28">Action</th>
              <th className="px-6 py-3.5 font-semibold text-[11px] uppercase tracking-wider text-zinc-400">Détails</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-50">
            {isLoading ? (
              <tr>
                <td colSpan="5" className="px-6 py-12 text-center text-zinc-400 font-medium">
                  <Loader2 className="animate-spin inline mr-2" size={16} />Chargement des logs...
                </td>
              </tr>
            ) : data?.items?.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-12 text-center text-zinc-400 font-medium">
                  <Activity className="mx-auto mb-2 text-zinc-300" size={24} />
                  Aucun log d'audit trouvé
                </td>
              </tr>
            ) : (
              data?.items?.map((item) => (
                <tr key={item.id} className="hover:bg-zinc-50/80 transition-colors">
                  <td className="px-6 py-4 text-zinc-400 whitespace-nowrap font-mono text-xs">{formatDate(item.createdAt)}</td>
                  <td className="px-6 py-4 font-semibold text-zinc-900">{item.entityName}</td>
                  <td className="px-6 py-4 text-zinc-400 font-mono text-xs">{item.entityId}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2.5 py-1 text-[10px] font-bold uppercase rounded-xl border tracking-wider ${getActionStyle(item.action)}`}>
                      {item.action}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-zinc-500 text-xs truncate max-w-xs">{item.details || "—"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-between pt-2 text-sm text-zinc-500">
          <button disabled={page <= 0} onClick={() => setPage(p => p - 1)} className="px-4 py-2 bg-white border border-zinc-200 rounded-xl hover:text-zinc-900 hover:bg-zinc-50 disabled:opacity-40 transition-all font-semibold text-xs">← Précédent</button>
          <span className="font-semibold text-zinc-500 text-xs">Page {page + 1} / {data.totalPages}</span>
          <button disabled={page + 1 >= data.totalPages} onClick={() => setPage(p => p + 1)} className="px-4 py-2 bg-white border border-zinc-200 rounded-xl hover:text-zinc-900 hover:bg-zinc-50 disabled:opacity-40 transition-all font-semibold text-xs">Suivant →</button>
        </div>
      )}
    </div>
  );
}
