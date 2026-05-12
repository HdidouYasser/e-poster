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
      case 'CREATE': return 'bg-emerald-50 text-emerald-600 border-emerald-200';
      case 'UPDATE': return 'bg-blue-50 text-blue-600 border-blue-200';
      case 'DELETE': return 'bg-red-50 text-red-600 border-red-200';
      default: return 'bg-slate-50 text-slate-600 border-slate-200';
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600">
          <Activity size={24} />
        </div>
        <h2 className="text-3xl font-bold text-slate-800">Logs d'Audit</h2>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-left text-sm text-slate-700">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
            <tr>
              <th className="px-6 py-4 font-semibold w-48">Date & Heure</th>
              <th className="px-6 py-4 font-semibold w-40">Entité</th>
              <th className="px-6 py-4 font-semibold w-24">ID</th>
              <th className="px-6 py-4 font-semibold w-32">Action</th>
              <th className="px-6 py-4 font-semibold">Détails</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              <tr><td colSpan="5" className="px-6 py-8 text-center text-slate-400">Chargement...</td></tr>
            ) : data?.items?.length === 0 ? (
              <tr><td colSpan="5" className="px-6 py-8 text-center text-slate-400">Aucun log trouvé</td></tr>
            ) : (
              data?.items?.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 text-slate-500 whitespace-nowrap">{formatDate(item.createdAt)}</td>
                  <td className="px-6 py-4 font-medium text-slate-800">{item.entityName}</td>
                  <td className="px-6 py-4 text-slate-500 font-mono">{item.entityId}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 text-xs font-bold rounded border ${getActionColor(item.action)}`}>
                      {item.action}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-600">{item.details || "-"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 text-sm text-slate-500">
          <button disabled={page <= 0} onClick={() => setPage(p => p - 1)} className="px-4 py-2 bg-white border border-slate-200 rounded-lg hover:text-slate-800 hover:bg-slate-50 disabled:opacity-50 transition-colors shadow-sm"><ChevronLeft size={20} /></button>
          <span className="font-medium bg-slate-100 px-4 py-2 rounded-lg text-slate-700">Page {page + 1} / {data.totalPages}</span>
          <button disabled={page + 1 >= data.totalPages} onClick={() => setPage(p => p + 1)} className="px-4 py-2 bg-white border border-slate-200 rounded-lg hover:text-slate-800 hover:bg-slate-50 disabled:opacity-50 transition-colors shadow-sm"><ChevronRight size={20} /></button>
        </div>
      )}
    </div>
  );
}
