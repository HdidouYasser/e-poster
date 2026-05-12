import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { api } from "../api";
import { UploadCloud, FileSpreadsheet, FileText, Loader2, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";

export default function ImportAdmin() {
  const [file, setFile] = useState(null);
  const [eventId, setEventId] = useState("");
  const [importResult, setImportResult] = useState(null);

  const { data: eventsData } = useQuery({
    queryKey: ["events-all"],
    queryFn: async () => (await api.get(`/events?page=0&size=100`)).data
  });

  const importMutation = useMutation({
    mutationFn: async () => {
      const formData = new FormData();
      formData.append("file", file);
      if (eventId) formData.append("eventId", eventId);
      
      const res = await api.post("/import/publications", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      return res.data;
    },
    onSuccess: (data) => {
      setImportResult(data);
      toast.success("Import réussi");
      setFile(null);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Erreur lors de l'import");
      setImportResult(null);
    }
  });

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setImportResult(null);
    }
  };

  const handleImport = () => {
    if (!file) return;
    importMutation.mutate();
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-slate-800">Import en Masse</h2>
      </div>

      <div className="bg-white border border-slate-200 p-8 rounded-2xl shadow-sm">
        <p className="text-slate-500 mb-6">
          Importez des publications à partir d'un fichier Excel (.xlsx) ou CSV. 
          Les colonnes attendues sont : <span className="font-mono text-xs bg-slate-100 px-2 py-1 rounded">eventId, title, description, status, posterUrl, publishDate</span>.
        </p>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-2">Événement par défaut (optionnel)</label>
            <select 
              value={eventId}
              onChange={(e) => setEventId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-slate-800 px-4 py-3 rounded-xl focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400 outline-none transition-colors"
            >
              <option value="">-- Aucun événement par défaut --</option>
              {eventsData?.items?.map(e => <option key={e.id} value={e.id}>{e.title}</option>)}
            </select>
            <p className="text-xs text-slate-400 mt-2">Sera utilisé si la colonne eventId est vide dans le fichier.</p>
          </div>

          <div className="border-2 border-dashed border-slate-200 rounded-2xl p-10 flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer relative">
            <input 
              type="file" 
              accept=".xlsx,.csv" 
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            
            {file ? (
              <div className="flex flex-col items-center">
                {file.name.endsWith('.csv') ? <FileText size={48} className="text-emerald-500 mb-4" /> : <FileSpreadsheet size={48} className="text-emerald-500 mb-4" />}
                <p className="font-medium text-slate-800 text-lg">{file.name}</p>
                <p className="text-sm text-slate-500">{(file.size / 1024).toFixed(2)} KB</p>
                <button 
                  onClick={(e) => { e.preventDefault(); setFile(null); }}
                  className="mt-4 text-sm text-red-500 hover:text-red-600 font-medium z-10"
                >
                  Retirer le fichier
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center text-slate-400">
                <UploadCloud size={48} className="mb-4" />
                <p className="font-medium text-slate-600 text-lg mb-1">Cliquez ou glissez-déposez</p>
                <p className="text-sm">Fichiers .xlsx ou .csv uniquement</p>
              </div>
            )}
          </div>

          <button 
            onClick={handleImport}
            disabled={!file || importMutation.isPending}
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-sm disabled:opacity-50"
          >
            {importMutation.isPending ? <Loader2 className="animate-spin" size={24} /> : <UploadCloud size={24} />}
            {importMutation.isPending ? "Importation en cours..." : "Lancer l'import"}
          </button>
        </div>
      </div>

      {importResult && (
        <div className="bg-emerald-50 border border-emerald-200 p-6 rounded-2xl flex items-start gap-4 shadow-sm animate-in fade-in slide-in-from-bottom-4">
          <CheckCircle2 className="text-emerald-500 mt-1" size={24} />
          <div>
            <h3 className="font-bold text-emerald-800 text-lg">Import terminé avec succès</h3>
            <p className="text-emerald-700 mt-1">
              <strong>{importResult.created}</strong> publications ont été créées.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
