import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "../api";
import { useIdleTimer } from "../hooks/useIdleTimer";
import { createTotemSync } from "./totemSync";
import { ArrowLeft, ZoomIn, ZoomOut, Maximize, Minimize, RefreshCcw, FileImage, Tag, MapPin, Clock } from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";

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
    <div className="min-h-screen bg-slate-50 text-slate-800 p-6 flex flex-col relative overflow-hidden">
      {/* Soft accent */}
      <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-emerald-100/40 blur-[100px] rounded-full pointer-events-none" />

      {/* Header toolbar */}
      <header className="flex items-center justify-between mb-6 relative z-10 bg-white p-4 rounded-3xl border border-slate-200 shadow-sm">
        <Link
          to={`/totem/publications?screen=${screen}`}
          className="px-6 py-3 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 rounded-2xl text-lg font-bold transition-all flex items-center gap-3 shadow-sm"
        >
          <ArrowLeft size={24} /> Retour à la galerie
        </Link>
        <div className="flex gap-3">
          <button onClick={() => setZoom((z) => Math.max(0.6, Number((z - 0.1).toFixed(2))))} className="p-3 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-2xl transition-all shadow-sm text-slate-600 hover:text-slate-800">
            <ZoomOut size={24} />
          </button>
          <div className="flex items-center justify-center min-w-[5rem] font-mono text-lg font-bold bg-slate-50 border border-slate-200 rounded-2xl text-slate-600 px-3">
            {Math.round(zoom * 100)}%
          </div>
          <button onClick={() => setZoom((z) => Math.min(3, Number((z + 0.1).toFixed(2))))} className="p-3 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-2xl transition-all shadow-sm text-slate-600 hover:text-slate-800">
            <ZoomIn size={24} />
          </button>
          <button onClick={() => setZoom(1)} className="p-3 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-2xl transition-all shadow-sm text-slate-600 hover:text-slate-800 ml-1">
            <RefreshCcw size={24} />
          </button>
          <button
            onClick={requestFullscreen}
            className="px-5 py-3 bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 rounded-2xl text-base font-bold transition-all flex items-center gap-2 shadow-sm ml-2"
          >
            {isFullscreen ? <Minimize size={24} /> : <Maximize size={24} />}
            {isFullscreen ? "Quitter Plein Écran" : "Plein Écran"}
          </button>
        </div>
      </header>

      {/* Poster content */}
      <main className="flex-1 bg-white border border-slate-200 rounded-[2rem] p-6 relative z-10 flex flex-col shadow-sm">
        {pubQuery.isLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center space-y-6">
            <div className="w-16 h-16 border-4 border-emerald-200 border-t-emerald-500 rounded-full animate-spin" />
            <div className="text-xl text-slate-400">Chargement du poster...</div>
          </div>
        ) : !pubQuery.data ? (
          <div className="flex-1 flex flex-col items-center justify-center">
            <FileImage size={80} className="text-slate-300 mb-6" />
            <div className="text-3xl font-bold text-slate-600 mb-2">Poster introuvable</div>
            <div className="text-xl text-slate-400">Le document demandé n'existe plus ou a été supprimé.</div>
          </div>
        ) : (
          <>
            <div className="mb-6 flex gap-4 items-center">
              <h2 className="text-3xl font-extrabold line-clamp-1 text-slate-800">{pubQuery.data.title}</h2>
              {pubQuery.data.authors && (
                <span className="text-lg text-emerald-700 font-medium px-4 py-1.5 bg-emerald-50 border border-emerald-200 rounded-full truncate">
                  {pubQuery.data.authors}
                </span>
              )}
            </div>

            <div className="flex flex-col xl:flex-row gap-6 flex-1 overflow-hidden">
              {/* Image Container */}
              <div className="flex-[2] bg-slate-50 border border-slate-200 rounded-2xl overflow-auto flex items-start justify-center p-8 shadow-inner relative">
                {posterUrl ? (
                  <img
                    src={posterUrl}
                    alt={pubQuery.data.title}
                    className="max-w-none origin-top transition-transform duration-200 ease-out shadow-lg rounded-lg"
                    style={{ transform: `scale(${zoom})` }}
                    draggable={false}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-center p-12 max-w-lg mx-auto my-auto text-slate-400">
                    <FileImage size={96} className="mb-6 text-slate-300" />
                    <h3 className="text-2xl font-bold mb-4 text-slate-600">Aucun fichier média fourni</h3>
                    <p className="text-lg">Ce poster ne possède pas d'image ou de document PDF associé.</p>
                  </div>
                )}
              </div>

              {/* Sidebar with Abstract and QR Code */}
              <div className="flex-1 w-full xl:w-96 flex flex-col gap-6 overflow-y-auto pr-2">
                
                {/* QR Code */}
                {posterUrl && (
                  <div className="bg-white border border-emerald-200 rounded-2xl p-6 flex flex-col items-center justify-center text-center shadow-sm shrink-0">
                    <div className="p-3 bg-white border-4 border-emerald-100 rounded-2xl shadow-sm mb-4">
                      <QRCodeCanvas value={posterUrl} size={140} level="H" fgColor="#0f172a" />
                    </div>
                    <h4 className="font-bold text-slate-800 text-lg">Scanner le poster</h4>
                    <p className="text-slate-500 text-sm mt-1">Téléchargez le fichier complet sur votre appareil</p>
                  </div>
                )}

                {/* Metadata */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-4 shrink-0 shadow-sm">
                  <h4 className="font-bold text-slate-800 text-lg border-b border-slate-200 pb-2">Informations</h4>
                  {pubQuery.data.category && (
                    <div className="flex items-center gap-3 text-slate-600">
                      <Tag size={18} className="text-emerald-500" />
                      <span className="font-medium">{pubQuery.data.category}</span>
                    </div>
                  )}
                  {pubQuery.data.session && (
                    <div className="flex items-center gap-3 text-slate-600">
                      <Clock size={18} className="text-emerald-500" />
                      <span className="font-medium">{pubQuery.data.session}</span>
                    </div>
                  )}
                  {pubQuery.data.room && (
                    <div className="flex items-center gap-3 text-slate-600">
                      <MapPin size={18} className="text-emerald-500" />
                      <span className="font-medium">{pubQuery.data.room}</span>
                    </div>
                  )}
                  {!pubQuery.data.category && !pubQuery.data.session && !pubQuery.data.room && (
                    <p className="text-slate-400 italic text-sm">Aucune information supplémentaire</p>
                  )}
                </div>

                {/* Abstract */}
                {(pubQuery.data.abstractText || pubQuery.data.description) && (
                  <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex-1">
                    <h4 className="font-bold text-slate-800 text-lg border-b border-slate-200 pb-2 mb-4">Résumé</h4>
                    <div className="prose prose-slate prose-sm text-slate-600">
                      <p className="whitespace-pre-wrap leading-relaxed">
                        {pubQuery.data.abstractText || pubQuery.data.description}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
