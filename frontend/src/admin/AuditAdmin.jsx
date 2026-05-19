import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "../api";
import { Activity, ChevronLeft, ChevronRight } from "lucide-react";

export default function AuditAdmin() {
  const [page, setPage] = useState(0);
  const size = 20;

  const { data, isLoading } = useQuery({
    queryKey: ["audit-logs", page, size],
    queryFn: async () => (await api.get(`/audit-logs?page=${page}&size=${size}`)).data
  });

  const formatDate = (isoString) => {
    if (!isoString) return "-";
    const d = new Date(isoString);
    return d.toLocaleString('fr-FR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit'
    });
  };

  const getActionColor = (action) => {
    switch (action) {
      case 'CREATE': return 'bg-zinc-100 text-zinc-900 border-zinc-200';
      case 'UPDATE': return 'bg-zinc-50 text-zinc-600 border-zinc-200';
      case 'DELETE': return 'bg-red-50 text-red-600 border-red-200';
      default: return 'bg-white text-zinc-500 border-zinc-200';
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto font-sans">
      <div className="flex items-center gap-3">
        <h2 className="text-2xl font-bold text-zinc-900 tracking-tight">Logs d'Audit</h2>
      </div>

      <div className="bg-white border border-zinc-200 rounded-lg overflow-hidden shadow-sm">
        <table className="w-full text-left text-sm text-zinc-700">
          <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-500">
            <tr>
              <th className="px-6 py-3 font-semibold text-xs uppercase tracking-wider w-48">Date & Heure</th>
              <th className="px-6 py-3 font-semibold text-xs uppercase tracking-wider w-40">Entité</th>
              <th className="px-6 py-3 font-semibold text-xs uppercase tracking-wider w-24">ID</th>
              <th className="px-6 py-3 font-semibold text-xs uppercase tracking-wider w-32">Action</th>
              <th className="px-6 py-3 font-semibold text-xs uppercase tracking-wider">Détails</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {isLoading ? (
              <tr><td colSpan="5" className="px-6 py-8 text-center text-zinc-400 font-medium">Chargement...</td></tr>
            ) : data?.items?.length === 0 ? (
              <tr><td colSpan="5" className="px-6 py-8 text-center text-zinc-400 font-medium">Aucun log trouvé</td></tr>
            ) : (
              data?.items?.map((item) => (
                <tr key={item.id} className="hover:bg-zinc-50 transition-colors">
                  <td className="px-6 py-4 text-zinc-500 whitespace-nowrap">{formatDate(item.createdAt)}</td>
                  <td className="px-6 py-4 font-semibold text-zinc-900">{item.entityName}</td>
                  <td className="px-6 py-4 text-zinc-500 font-mono text-xs">{item.entityId}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded border ${getActionColor(item.action)}`}>
                      {item.action}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-zinc-600">{item.details || "-"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-zinc-200 pt-4 text-sm text-zinc-500">
          <button disabled={page <= 0} onClick={() => setPage(p => p - 1)} className="px-3 py-1.5 bg-white border border-zinc-200 rounded-md hover:text-zinc-900 hover:bg-zinc-50 disabled:opacity-50 transition-colors font-semibold"><ChevronLeft size={16} className="inline mr-1" /> Précédent</button>
          <span className="font-semibold text-zinc-600">Page {page + 1} sur {data.totalPages}</span>
          <button disabled={page + 1 >= data.totalPages} onClick={() => setPage(p => p + 1)} className="px-3 py-1.5 bg-white border border-zinc-200 rounded-md hover:text-zinc-900 hover:bg-zinc-50 disabled:opacity-50 transition-colors font-semibold">Suivant <ChevronRight size={16} className="inline ml-1" /></button>
        </div>
      )}
    </div>
  );
}
