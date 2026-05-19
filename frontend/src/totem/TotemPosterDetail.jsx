import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { publicApi } from "../api";
import { useIdleTimer } from "../hooks/useIdleTimer";
import { createTotemSync } from "./totemSync";
import { ArrowLeft, ZoomIn, ZoomOut, Maximize, Minimize, RefreshCcw, FileImage, Tag, MapPin, Clock, ChevronLeft, ChevronRight } from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";

const sync = createTotemSync();

export default function TotemPosterDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [params] = useSearchParams();
  const screen = params.get("screen") || "1";
  const page = Number(params.get("page") || 0);
  const q = params.get("q") || "";
  const category = params.get("category") || "";
  const eventId = params.get("eventId") || "";

  const [zoom, setZoom] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const activeEventQuery = useQuery({
    queryKey: ["totem-active-event"],
    queryFn: async () => (await publicApi.get("/events/active")).data,
    retry: false
  });

  const eventQuery = useQuery({
    queryKey: ["totem-event", eventId],
    queryFn: async () => (await publicApi.get(`/events/${eventId}`)).data,
    enabled: !!eventId
  });

  const selectedEvent = useMemo(
    () => eventQuery.data || activeEventQuery.data,
    [eventQuery.data, activeEventQuery.data]
  );

  const cp = selectedEvent?.colorPrimary || '#18181b';

  const pubQuery = useQuery({
    queryKey: ["totem-pub", id],
    queryFn: async () => (await publicApi.get(`/publications/${id}`)).data
  });

  const endpoint = useMemo(() => {
    let base = `/publications?page=${page}&size=12`;
    if (q.trim()) {
      base = `/publications/search?q=${encodeURIComponent(q)}&page=${page}&size=12`;
    }
    if (eventId) base += `&eventId=${encodeURIComponent(eventId)}`;
    if (category) base += `&category=${encodeURIComponent(category)}`;
    return base;
  }, [q, page, eventId, category]);

  const pubsQuery = useQuery({
    queryKey: ["totem-pubs-nav", endpoint],
    queryFn: async () => (await publicApi.get(endpoint)).data
  });

  const posterUrl = useMemo(() => pubQuery.data?.posterUrl, [pubQuery.data]);

  const { nextPub, prevPub, currentIndex } = useMemo(() => {
    const items = pubsQuery.data?.items || [];
    const currentIndex = items.findIndex(p => Number(p.id) === Number(id));
    
    let prevPub = currentIndex > 0 ? items[currentIndex - 1] : null;
    let nextPub = currentIndex >= 0 && currentIndex < items.length - 1 ? items[currentIndex + 1] : null;
    
    return { nextPub, prevPub, currentIndex };
  }, [pubsQuery.data, id]);

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

  const buildSearchParams = () => {
    let params = `?screen=${screen}&page=${page}`;
    if (q) params += `&q=${encodeURIComponent(q)}`;
    if (category) params += `&category=${encodeURIComponent(category)}`;
    if (eventId) params += `&eventId=${encodeURIComponent(eventId)}`;
    return params;
  };

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 text-zinc-900 font-sans" style={{ '--color-primary': cp }}>
      {/* Header Toolbar */}
      <header className="flex items-center justify-between px-6 py-4 bg-white border-b border-zinc-200 z-10 shrink-0">
        <Link
          to={`/totem/publications${buildSearchParams()}`}
          className="px-4 py-2 bg-white hover:bg-zinc-50 border border-zinc-200 text-zinc-700 rounded-md text-sm font-medium transition-colors flex items-center gap-2"
        >
          <ArrowLeft size={16} /> Retour à la galerie
        </Link>
        <div className="flex items-center gap-2">
          <div className="flex bg-zinc-100 p-1 rounded-md border border-zinc-200">
            <button onClick={() => setZoom((z) => Math.max(0.6, Number((z - 0.1).toFixed(2))))} className="p-1.5 hover:bg-white rounded text-zinc-500 hover:text-zinc-900 transition-colors shadow-sm">
              <ZoomOut size={16} />
            </button>
            <div className="flex items-center justify-center w-12 font-mono text-xs font-semibold text-zinc-600">
              {Math.round(zoom * 100)}%
            </div>
            <button onClick={() => setZoom((z) => Math.min(3, Number((z - -0.1).toFixed(2))))} className="p-1.5 hover:bg-white rounded text-zinc-500 hover:text-zinc-900 transition-colors shadow-sm">
              <ZoomIn size={16} />
            </button>
          </div>
          <button onClick={() => setZoom(1)} className="p-2 bg-white hover:bg-zinc-50 border border-zinc-200 rounded-md transition-colors text-zinc-500 hover:text-zinc-900">
            <RefreshCcw size={16} />
          </button>
          <button
            onClick={requestFullscreen}
            className="px-4 py-2 text-white hover:opacity-90 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ml-2"
            style={{ backgroundColor: cp }}
          >
            {isFullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
            {isFullscreen ? "Quitter" : "Plein Écran"}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex overflow-hidden">
        {pubQuery.isLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="w-8 h-8 border-2 border-zinc-200 rounded-full animate-spin mb-4" style={{ borderTopColor: cp }} />
            <div className="text-sm text-zinc-500 font-medium">Chargement...</div>
          </div>
        ) : !pubQuery.data ? (
          <div className="flex-1 flex flex-col items-center justify-center bg-white m-6 rounded-xl border border-zinc-200 shadow-sm">
            <FileImage size={48} className="text-zinc-300 mb-4" />
            <div className="text-lg font-semibold text-zinc-900 mb-1">Poster introuvable</div>
            <div className="text-sm text-zinc-500">Ce document n'existe plus ou a été supprimé.</div>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row w-full h-full">
            
            {/* Image Canvas */}
            <div className="flex-1 bg-zinc-100 flex items-center justify-center p-8 overflow-auto relative">
              {posterUrl ? (
                <img
                  src={posterUrl}
                  alt={pubQuery.data.title}
                  className="max-w-none origin-center transition-transform duration-200 ease-out shadow-sm border border-zinc-200 bg-white"
                  style={{ transform: `scale(${zoom})` }}
                  draggable={false}
                />
              ) : (
                <div className="flex flex-col items-center text-zinc-400">
                  <FileImage size={64} className="mb-4 text-zinc-300" />
                  <h3 className="text-lg font-semibold text-zinc-900 mb-1">Aucun média fourni</h3>
                  <p className="text-sm">Ce poster ne possède pas d'image.</p>
                </div>
              )}
            </div>

            {/* Sidebar Details */}
            <div className="w-full lg:w-96 bg-white border-l border-zinc-200 flex flex-col shrink-0 overflow-y-auto">
              
              <div className="p-6 border-b border-zinc-200">
                <h2 className="text-2xl font-bold text-zinc-900 mb-2 leading-tight">{pubQuery.data.title}</h2>
                <p className="text-sm font-medium text-zinc-600 mb-4">{pubQuery.data.authors}</p>
                <div className="flex flex-wrap gap-2">
                  {pubQuery.data.category && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-zinc-100 text-zinc-700 rounded-md text-xs font-semibold border border-zinc-200">
                      <Tag size={12} /> {pubQuery.data.category}
                    </span>
                  )}
                  {pubQuery.data.session && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-zinc-100 text-zinc-700 rounded-md text-xs font-semibold border border-zinc-200">
                      <Clock size={12} /> {pubQuery.data.session}
                    </span>
                  )}
                  {pubQuery.data.room && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-zinc-100 text-zinc-700 rounded-md text-xs font-semibold border border-zinc-200">
                      <MapPin size={12} /> {pubQuery.data.room}
                    </span>
                  )}
                </div>
              </div>

              {(pubQuery.data.abstractText || pubQuery.data.description) && (
                <div className="p-6 border-b border-zinc-200">
                  <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-3">Résumé</h4>
                  <p className="text-sm text-zinc-700 leading-relaxed whitespace-pre-wrap">
                    {pubQuery.data.abstractText || pubQuery.data.description}
                  </p>
                </div>
              )}

              {posterUrl && (
                <div className="p-6 flex flex-col items-center text-center">
                  <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-4 w-full text-left">Accès Mobile</h4>
                  <div className="p-4 bg-white border border-zinc-200 rounded-lg shadow-sm mb-3">
                    <QRCodeCanvas value={posterUrl} size={120} level="M" fgColor="#18181b" />
                  </div>
                  <p className="text-xs text-zinc-500 font-medium">Scannez ce QR Code pour consulter<br/>le poster sur votre téléphone.</p>
                </div>
              )}
              
              <div className="mt-auto border-t border-zinc-200 bg-zinc-50 p-4">
                <div className="flex justify-between items-center gap-2">
                  <button
                    disabled={!prevPub}
                    onClick={() => prevPub && navigate(`/totem/publications/${prevPub.id}${buildSearchParams()}`)}
                    className="flex-1 px-4 py-2 bg-white hover:bg-zinc-100 border border-zinc-200 disabled:opacity-50 disabled:bg-zinc-50 rounded-md text-xs font-semibold transition-colors flex items-center justify-center gap-2 text-zinc-700"
                  >
                    <ChevronLeft size={14} /> Précédent
                  </button>
                  <div className="text-xs font-semibold text-zinc-500 px-2">
                    {currentIndex >= 0 ? `${currentIndex + 1} / ${pubsQuery.data?.totalElements || "?"}` : ""}
                  </div>
                  <button
                    disabled={!nextPub}
                    onClick={() => nextPub && navigate(`/totem/publications/${nextPub.id}${buildSearchParams()}`)}
                    className="flex-1 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white disabled:opacity-50 disabled:bg-zinc-300 rounded-md text-xs font-semibold transition-colors flex items-center justify-center gap-2"
                  >
                    Suivant <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
