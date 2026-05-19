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
    <div className="space-y-6 max-w-3xl mx-auto font-sans">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-zinc-900 tracking-tight">Import en Masse</h2>
      </div>

      <div className="bg-white border border-zinc-200 p-8 rounded-lg shadow-sm">
        <p className="text-zinc-500 mb-6 text-sm">
          Importez des publications à partir d'un fichier Excel (.xlsx) ou CSV.
        </p>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-zinc-700 mb-1.5">Événement par défaut (optionnel)</label>
            <select
              value={eventId}
              onChange={(e) => setEventId(e.target.value)}
              className="w-full bg-white border border-zinc-200 text-zinc-900 px-3 py-2 rounded-md focus:border-zinc-400 outline-none transition-colors text-sm"
            >
              <option value="">-- Aucun événement par défaut --</option>
              {eventsData?.items?.map(e => <option key={e.id} value={e.id}>{e.title}</option>)}
            </select>
            <p className="text-xs text-zinc-500 mt-1.5">Sera utilisé si la colonne eventId est vide dans le fichier.</p>
          </div>

          <div className="border border-dashed border-zinc-300 rounded-lg p-10 flex flex-col items-center justify-center bg-zinc-50 hover:bg-zinc-100 transition-colors cursor-pointer relative">
            <input
              type="file"
              accept=".xlsx,.csv"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />

            {file ? (
              <div className="flex flex-col items-center">
                {file.name.endsWith('.csv') ? <FileText size={32} className="text-zinc-900 mb-3" /> : <FileSpreadsheet size={32} className="text-zinc-900 mb-3" />}
                <p className="font-semibold text-zinc-900 text-sm">{file.name}</p>
                <p className="text-xs text-zinc-500">{(file.size / 1024).toFixed(2)} KB</p>
                <button
                  onClick={(e) => { e.preventDefault(); setFile(null); }}
                  className="mt-3 text-xs text-red-600 hover:text-red-700 font-semibold z-10"
                >
                  Retirer le fichier
                </button>
              </div>
            ) : (
               <div className="flex flex-col items-center text-zinc-500">
                <UploadCloud size={32} className="mb-3 text-zinc-400" />
                <p className="font-semibold text-zinc-700 text-sm mb-0.5">Cliquez ou glissez-déposez</p>
                <p className="text-xs">Fichiers .xlsx ou .csv uniquement</p>
              </div>
            )}
          </div>

          <button
            onClick={handleImport}
            disabled={!file || importMutation.isPending}
            className="w-full bg-zinc-900 hover:bg-zinc-800 text-white px-6 py-2.5 rounded-md font-semibold text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
          >
            {importMutation.isPending ? <Loader2 className="animate-spin" size={16} /> : <UploadCloud size={16} />}
            {importMutation.isPending ? "Importation en cours..." : "Lancer l'import"}
          </button>
        </div>
      </div>

      {importResult && (
        <div className="bg-zinc-50 border border-zinc-200 p-6 rounded-lg flex items-start gap-4 shadow-sm animate-in fade-in slide-in-from-bottom-4">
          <CheckCircle2 className="text-zinc-900 mt-0.5" size={20} />
          <div>
            <h3 className="font-bold text-zinc-900 text-sm">Import terminé avec succès</h3>
            <p className="text-zinc-600 mt-1 text-sm">
              <strong className="text-zinc-900">{importResult.created}</strong> publications ont été créées.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
