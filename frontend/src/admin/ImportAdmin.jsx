import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { api } from "../api";
import { UploadCloud, FileSpreadsheet, FileText, Loader2, CheckCircle2, Info } from "lucide-react";
import toast from "react-hot-toast";

export default function ImportAdmin() {
  const [file, setFile] = useState(null);
  const [eventId, setEventId] = useState("");
  const [importResult, setImportResult] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

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

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped && (dropped.name.endsWith('.xlsx') || dropped.name.endsWith('.csv'))) {
      setFile(dropped);
      setImportResult(null);
    } else {
      toast.error("Format non supporté. Utilisez .xlsx ou .csv");
    }
  };

  const handleImport = () => {
    if (!file) return;
    importMutation.mutate();
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto font-sans">
      {/* Header */}
      <div className="page-header">
        <div>
          <h2 className="page-title">Import en Masse</h2>
          <p className="page-subtitle">Importez des publications depuis un fichier Excel ou CSV</p>
        </div>
      </div>

      {/* Info card */}
      <div className="flex items-start gap-3 p-4 bg-zinc-50/80 border border-zinc-200/80 rounded-2xl">
        <Info size={16} className="text-zinc-400 mt-0.5 shrink-0" />
        <p className="text-xs text-zinc-500 leading-relaxed">
          Le fichier doit contenir les colonnes : <span className="font-semibold text-zinc-700">title</span>, <span className="font-semibold text-zinc-700">authors</span>, <span className="font-semibold text-zinc-700">abstract</span>. Les colonnes optionnelles incluent <span className="font-semibold text-zinc-700">eventId</span>, <span className="font-semibold text-zinc-700">categoryId</span>, <span className="font-semibold text-zinc-700">posterUrl</span>.
        </p>
      </div>

      {/* Main card */}
      <div className="bg-white border border-zinc-200/80 p-8 rounded-3xl shadow-sm space-y-6">

        {/* Event selector */}
        <div>
          <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">
            Événement par défaut <span className="normal-case font-normal text-zinc-400">(optionnel)</span>
          </label>
          <select
            value={eventId}
            onChange={(e) => setEventId(e.target.value)}
            className="w-full bg-zinc-50/70 border border-zinc-200 text-zinc-900 px-3.5 py-2.5 rounded-xl focus:border-zinc-400 focus:bg-white outline-none transition-all text-sm shadow-inner"
          >
            <option value="">— Aucun événement par défaut —</option>
            {eventsData?.items?.map(e => <option key={e.id} value={e.id}>{e.title}</option>)}
          </select>
          <p className="text-xs text-zinc-400 mt-1.5">Sera utilisé si la colonne <code className="bg-zinc-100 px-1 rounded text-zinc-600">eventId</code> est vide dans le fichier.</p>
        </div>

        {/* Drop zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={`relative border-2 border-dashed rounded-2xl p-12 flex flex-col items-center justify-center transition-all cursor-pointer ${
            isDragging
              ? "border-zinc-400 bg-zinc-100"
              : file
              ? "border-zinc-300 bg-zinc-50/80"
              : "border-zinc-200 bg-zinc-50/50 hover:bg-zinc-50 hover:border-zinc-300"
          }`}
        >
          <input
            type="file"
            accept=".xlsx,.csv"
            onChange={handleFileChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />

          {file ? (
            <div className="flex flex-col items-center text-center">
              <div className="w-14 h-14 bg-zinc-900 rounded-2xl flex items-center justify-center mb-4 shadow-md">
                {file.name.endsWith('.csv')
                  ? <FileText size={26} className="text-white" />
                  : <FileSpreadsheet size={26} className="text-white" />
                }
              </div>
              <p className="font-bold text-zinc-900 text-sm">{file.name}</p>
              <p className="text-xs text-zinc-400 mt-1">{(file.size / 1024).toFixed(1)} KB</p>
              <button
                onClick={(e) => { e.preventDefault(); setFile(null); }}
                className="mt-4 text-xs text-red-500 hover:text-red-700 font-semibold z-10 px-3 py-1.5 rounded-xl hover:bg-red-50 transition-colors"
              >
                × Retirer le fichier
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center text-center">
              <div className="w-14 h-14 bg-zinc-100 rounded-2xl flex items-center justify-center mb-4 border border-zinc-200">
                <UploadCloud size={26} className="text-zinc-400" />
              </div>
              <p className="font-bold text-zinc-700 text-sm mb-1">Cliquez ou glissez-déposez</p>
              <p className="text-xs text-zinc-400">Formats acceptés : <span className="font-semibold">.xlsx</span> et <span className="font-semibold">.csv</span></p>
            </div>
          )}
        </div>

        {/* Import button */}
        <button
          onClick={handleImport}
          disabled={!file || importMutation.isPending}
          className="btn btn-primary btn-lg w-full"
        >
          {importMutation.isPending
            ? <><Loader2 className="animate-spin" size={17} /> Importation en cours...</>
            : <><UploadCloud size={17} /> Lancer l'import</>
          }
        </button>
      </div>

      {/* Result */}
      {importResult && (
        <div className="bg-white border border-zinc-200/80 p-6 rounded-3xl flex items-start gap-4 shadow-sm">
          <div className="w-10 h-10 bg-zinc-900 rounded-xl flex items-center justify-center shrink-0">
            <CheckCircle2 className="text-white" size={20} />
          </div>
          <div>
            <h3 className="font-bold text-zinc-900 text-sm font-display">Import terminé avec succès</h3>
            <p className="text-zinc-500 mt-1 text-sm">
              <span className="font-bold text-zinc-900 text-lg">{importResult.created}</span> publications ont été importées et indexées.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
