import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "../api";
import { useIdleTimer } from "../hooks/useIdleTimer";
import { createTotemSync } from "./totemSync";
import { ArrowLeft, ZoomIn, ZoomOut, Maximize, Minimize, RefreshCcw, FileImage } from "lucide-react";

const sync = createTotemSync();

export default function TotemPosterDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [params] = useSearchParams();
  const screen = params.get("screen") || "1";

  const [zoom, setZoom] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const pubQuery = useQuery({
    queryKey: ["totem-pub", id],
    queryFn: async () => (await api.get(`/publications/${id}`)).data
  });

  const posterUrl = useMemo(() => pubQuery.data?.posterUrl, [pubQuery.data]);

  useIdleTimer({
    timeoutMs: 45_000,
    onIdle: () => navigate(`/totem?screen=${screen}`),
    enabled: true
  });

  useEffect(() => {
    return sync.onMessage((msg) => {
      if (!msg || msg.type !== "NAVIGATE") return;
      if (String(msg.screen) === String(screen)) return;
      navigate(msg.path);
    });
  }, [navigate, screen]);

  const requestFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch {
      // ignore
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 flex flex-col relative overflow-hidden">
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-blue-600/10 blur-[150px] rounded-full pointer-events-none" />

      <header className="flex items-center justify-between mb-6 relative z-10 bg-slate-900/40 p-4 rounded-3xl border border-slate-800/50 backdrop-blur-md">
        <Link to={`/totem/publications?screen=${screen}`} className="px-6 py-4 bg-slate-800 hover:bg-slate-700 rounded-2xl text-xl font-bold transition-all flex items-center gap-3 shadow-lg">
          <ArrowLeft size={28} /> Retour à la galerie
        </Link>
        <div className="flex gap-4">
          <button onClick={() => setZoom((z) => Math.max(0.6, Number((z - 0.1).toFixed(2))))} className="p-4 bg-slate-800 hover:bg-slate-700 rounded-2xl transition-all shadow-lg text-slate-300 hover:text-white">
            <ZoomOut size={28} />
          </button>
          <div className="flex items-center justify-center min-w-[5rem] font-mono text-xl font-bold bg-slate-950 rounded-2xl border border-slate-800 text-slate-300">
            {Math.round(zoom * 100)}%
          </div>
          <button onClick={() => setZoom((z) => Math.min(3, Number((z + 0.1).toFixed(2))))} className="p-4 bg-slate-800 hover:bg-slate-700 rounded-2xl transition-all shadow-lg text-slate-300 hover:text-white">
            <ZoomIn size={28} />
          </button>
          <button onClick={() => setZoom(1)} className="p-4 bg-slate-800 hover:bg-slate-700 rounded-2xl transition-all shadow-lg text-slate-300 hover:text-white ml-2">
            <RefreshCcw size={28} />
          </button>
          <button onClick={requestFullscreen} className="px-6 py-4 bg-indigo-600/20 text-indigo-400 hover:bg-indigo-600/30 border border-indigo-500/30 rounded-2xl text-xl font-bold transition-all flex items-center gap-3 shadow-lg ml-4">
            {isFullscreen ? <Minimize size={28} /> : <Maximize size={28} />}
            {isFullscreen ? "Quitter Plein Écran" : "Plein Écran"}
          </button>
        </div>
      </header>

      <main className="flex-1 bg-slate-900/80 border border-slate-800 rounded-[2rem] p-6 backdrop-blur-xl relative z-10 flex flex-col shadow-2xl">
        {pubQuery.isLoading ? (
           <div className="flex-1 flex flex-col items-center justify-center space-y-6 animate-pulse">
             <div className="w-24 h-24 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
             <div className="text-2xl text-slate-400">Chargement du poster...</div>
           </div>
        ) : !pubQuery.data ? (
           <div className="flex-1 flex flex-col items-center justify-center">
             <FileImage size={80} className="text-slate-700 mb-6" />
             <div className="text-3xl font-bold mb-2">Poster introuvable</div>
             <div className="text-xl text-slate-500">Le document demandé n'existe plus ou a été supprimé.</div>
           </div>
        ) : (
          <>
            <div className="mb-6 flex gap-4 items-center">
               <h2 className="text-3xl font-extrabold line-clamp-1">{pubQuery.data.title}</h2>
               {pubQuery.data.authors && <span className="text-xl text-indigo-400 font-medium px-4 py-1.5 bg-indigo-500/10 rounded-full border border-indigo-500/20 truncate">{pubQuery.data.authors}</span>}
            </div>
            
            <div className="flex-1 bg-slate-950 rounded-2xl border border-slate-800 overflow-auto flex items-start justify-center p-8 shadow-inner relative">
              {posterUrl ? (
                <img
                  src={posterUrl}
                  alt={pubQuery.data.title}
                  className="max-w-none origin-top transition-transform duration-200 ease-out shadow-2xl rounded-lg"
                  style={{ transform: `scale(${zoom})` }}
                  draggable={false}
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-center p-12 max-w-lg mx-auto my-auto opacity-50">
                  <FileImage size={96} className="mb-6" />
                  <h3 className="text-2xl font-bold mb-4">Aucun fichier média fourni</h3>
                  <p className="text-lg">Ce poster ne possède pas d'image ou de document PDF associé.</p>
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
