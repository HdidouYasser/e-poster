import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { publicApi, getMediaUrl } from "../api";
import { useIdleTimer } from "../hooks/useIdleTimer";
import { createTotemSync } from "./totemSync";
import { ArrowLeft, ZoomIn, ZoomOut, Maximize, Minimize, RefreshCcw, FileImage, Tag, MapPin, Clock, ChevronLeft, ChevronRight, Video, FileText } from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";
import { useDynamicTheme } from "../hooks/useDynamicTheme";

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
  const session = params.get("session") || "";
  const room = params.get("room") || "";

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

  // Apply dynamic color theme of the selected event
  useDynamicTheme(selectedEvent?.colorPrimary, selectedEvent?.logoUrl);

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
    if (session) base += `&session=${encodeURIComponent(session)}`;
    if (room) base += `&room=${encodeURIComponent(room)}`;
    return base;
  }, [q, page, eventId, category, session, room]);

  const pubsQuery = useQuery({
    queryKey: ["totem-pubs-nav", endpoint],
    queryFn: async () => (await publicApi.get(endpoint)).data
  });

  const posterUrl = useMemo(() => pubQuery.data?.posterUrl, [pubQuery.data]);
  const mediaList = useMemo(() => pubQuery.data?.mediaList || [], [pubQuery.data]);
  const [activeMedia, setActiveMedia] = useState(null);

  // Reset active media when changing publication
  useEffect(() => {
    setActiveMedia(null);
  }, [id]);

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
    enabled: screen === "1" || screen === "2"
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
    if (session) params += `&session=${encodeURIComponent(session)}`;
    if (room) params += `&room=${encodeURIComponent(room)}`;
    return params;
  };

  // Determine media type for rendering
  const activeMediaUrl = useMemo(() => {
    return getMediaUrl(activeMedia?.filePath || posterUrl);
  }, [activeMedia, posterUrl]);

  const isPdf = useMemo(() => {
    if (activeMedia?.fileType === "PDF") return true;
    if (!activeMedia && posterUrl && posterUrl.toLowerCase().endsWith('.pdf')) return true;
    return false;
  }, [activeMedia, posterUrl]);

  const isVideo = useMemo(() => {
    return activeMedia?.fileType === "VIDEO";
  }, [activeMedia]);

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 text-zinc-900 font-sans transition-colors duration-500 selection:bg-theme-secondary/20 selection:text-zinc-900 bg-dot-grid theme-transition relative overflow-hidden">

      {/* Header Toolbar */}
      <header className="flex items-center justify-between px-6 py-4 bg-white/80 backdrop-blur-md border-b border-zinc-200/60 z-10 shrink-0 shadow-sm theme-transition">
        <Link
          to={`/totem/publications${buildSearchParams()}`}
          className="totem-back-btn"
        >
          <ArrowLeft size={15} /> Retour aux communications
        </Link>
        
        <div className="flex items-center gap-3">
          {/* Zoom controls (hidden for video/pdf, active for image) */}
          {!isPdf && !isVideo && (
            <div className="flex bg-zinc-100/80 p-1 rounded-xl border border-zinc-200/60 items-center">
              <button 
                onClick={() => setZoom((z) => Math.max(0.6, Number((z - 0.1).toFixed(2))))} 
                className="p-2 hover:bg-zinc-200/50 rounded-lg text-zinc-500 hover:text-zinc-900 transition-all active:scale-90"
              >
                <ZoomOut size={14} />
              </button>
              <div className="flex items-center justify-center w-14 font-mono text-[11px] font-bold text-zinc-600">
                {Math.round(zoom * 100)}%
              </div>
              <button 
                onClick={() => setZoom((z) => Math.min(3, Number((z - -0.1).toFixed(2))))} 
                className="p-2 hover:bg-zinc-200/50 rounded-lg text-zinc-500 hover:text-zinc-900 transition-all active:scale-90"
              >
                <ZoomIn size={14} />
              </button>
            </div>
          )}
          
          {!isPdf && !isVideo && (
            <button 
              onClick={() => setZoom(1)} 
              className="p-2.5 bg-white hover:bg-zinc-50 border border-zinc-200 rounded-xl transition-all text-zinc-500 hover:text-zinc-900 active:scale-95 shadow-sm"
              title="Réinitialiser zoom"
            >
              <RefreshCcw size={14} />
            </button>
          )}

          <button
            onClick={requestFullscreen}
            style={{ backgroundColor: 'var(--theme-primary)', color: 'var(--theme-foreground)' }}
            className="px-4 py-2.5 hover:opacity-90 hover:brightness-110 rounded-xl text-xs font-bold transition-all flex items-center gap-2 active:scale-95 shadow-md font-display theme-transition"
          >
            {isFullscreen ? <Minimize size={14} /> : <Maximize size={14} />}
            {isFullscreen ? "Quitter" : "Plein Écran"}
          </button>
        </div>
      </header>
      {/* ── Navigation Stepper ── */}
      <div className="max-w-7xl mx-auto px-6 pt-6 w-full">
        <div className="flex items-center justify-center bg-white/60 backdrop-blur-sm border border-zinc-200/60 rounded-2xl py-3 px-6 shadow-sm w-fit mx-auto gap-4 md:gap-8 text-[10px] md:text-xs font-bold uppercase tracking-wider text-zinc-400 theme-transition">
          <Link to="/" className="flex items-center gap-2 text-zinc-550 hover:text-zinc-900 transition-colors">
            <span className="w-5 h-5 rounded-full bg-zinc-100 flex items-center justify-center text-[10px]">1</span>
            <span className="hidden sm:inline">Portail</span>
          </Link>
          <span className="text-zinc-300">/</span>
          <Link to={`/totem?screen=${screen}`} className="flex items-center gap-2 text-zinc-550 hover:text-zinc-900 transition-colors">
            <span className="w-5 h-5 rounded-full bg-zinc-100 flex items-center justify-center text-[10px]">2</span>
            <span className="hidden sm:inline">Sélection Congrès</span>
          </Link>
          <span className="text-zinc-300">/</span>
          <Link to={`/totem/publications${buildSearchParams()}`} className="flex items-center gap-2 text-zinc-550 hover:text-zinc-900 transition-colors">
            <span className="w-5 h-5 rounded-full bg-zinc-100 flex items-center justify-center text-[10px]">3</span>
            <span className="hidden sm:inline">E-Posters</span>
          </Link>
          <span className="text-zinc-300">/</span>
          <div className="flex items-center gap-2 text-blue-600">
            <span className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center text-[10px]">4</span>
            <span className="hidden sm:inline">Lecture Poster</span>
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <main className="flex-1 flex overflow-hidden relative">
        {pubQuery.isLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center bg-zinc-50">
            <div className="w-10 h-10 border-4 border-zinc-200 border-t-theme-secondary rounded-full animate-spin mb-4" />
            <div className="text-sm text-zinc-400 font-semibold tracking-wide">Chargement du document...</div>
          </div>
        ) : !pubQuery.data ? (
          <div className="flex-1 flex flex-col items-center justify-center bg-white/20 m-8 rounded-3xl border border-zinc-200 shadow-2xl">
            <FileImage size={64} className="text-zinc-300 mb-4" />
            <div className="text-xl font-bold text-zinc-900 mb-2">Poster introuvable</div>
            <div className="text-sm text-zinc-500">Ce document n'existe plus ou a été archivé.</div>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row w-full h-full">
            
            {/* Dark Media Canvas Viewport */}
            <div className="flex-1 bg-zinc-100/50 relative overflow-hidden shadow-inner vh-media-viewport">
              {/* Left Side Navigation Button */}
              {prevPub && (
                <button
                  onClick={() => navigate(`/totem/publications/${prevPub.id}${buildSearchParams()}`)}
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white/90 hover:bg-white border border-zinc-200 text-zinc-800 rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-all hover:scale-105"
                  title="Poster Précédent"
                >
                  <ChevronLeft size={24} />
                </button>
              )}

              {/* Right Side Navigation Button */}
              {nextPub && (
                <button
                  onClick={() => navigate(`/totem/publications/${nextPub.id}${buildSearchParams()}`)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white/90 hover:bg-white border border-zinc-200 text-zinc-800 rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-all hover:scale-105"
                  title="Poster Suivant"
                >
                  <ChevronRight size={24} />
                </button>
              )}

              {/* Absolutely-positioned media area — sits between the two nav arrows */}
              <div className="absolute inset-0 flex items-center justify-center px-16 py-6 overflow-auto">
                {isVideo ? (
                  <div className="w-full h-full max-w-5xl flex-shrink-0 aspect-video rounded-2xl overflow-hidden border border-zinc-200 bg-black shadow-2xl">
                    <video
                      src={activeMediaUrl}
                      controls
                      autoPlay
                      className="w-full h-full object-contain"
                    />
                  </div>
                ) : isPdf ? (
                  <div className="w-full h-full rounded-2xl overflow-hidden border border-zinc-200 bg-white shadow-2xl relative">
                    {/* Clean iframe to serve same-origin proxied PDF */}
                    <iframe
                      src={activeMediaUrl}
                      className="w-full h-full bg-white border-none"
                      title="PDF Poster Viewer"
                    />
                  </div>
                ) : activeMediaUrl ? (
                  /* Image: constrained to canvas size at zoom=1; CSS transform scales visually when zoomed */
                  <img
                    src={activeMediaUrl}
                    alt={pubQuery.data.title}
                    className="max-w-full max-h-full object-contain origin-center transition-transform duration-200 ease-out rounded-xl border border-zinc-200 bg-white shadow-2xl"
                    style={{ transform: `scale(${zoom})` }}
                    draggable={false}
                  />
                ) : (
                  <div className="flex flex-col items-center text-zinc-400 max-w-sm text-center">
                    <FileImage size={64} className="mb-4 text-zinc-300 animate-pulse" />
                    <h3 className="text-lg font-bold text-zinc-900 mb-2">Aucun visuel associé</h3>
                    <p className="text-xs text-zinc-550">Le support visuel de cet e-poster n'a pas été téléversé pour le moment.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Premium details sidebar panel */}
            <div className="w-full lg:w-[400px] bg-white border-t lg:border-t-0 lg:border-l border-zinc-200 flex flex-col shrink-0 overflow-y-auto shadow-lg">
              
              {/* Header details block */}
              <div className="p-8 border-b border-zinc-200/80 bg-zinc-50/50 theme-transition">
                <div className="flex items-center justify-between gap-3 mb-4">
                  {pubQuery.data.category ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-theme-primary/10 text-theme-primary-light border border-theme-primary/20 rounded-lg text-[9px] font-extrabold uppercase tracking-widest theme-transition">
                      <Tag size={10} /> {pubQuery.data.category}
                    </span>
                  ) : <span />}
                  <span className="text-[10px] font-mono font-extrabold text-zinc-400 bg-zinc-100 px-2.5 py-1 rounded-lg border border-zinc-200/40">
                    Communication N° {pubQuery.data.id}
                  </span>
                </div>
                
                <h2 className="text-xl font-extrabold text-zinc-950 mb-3 tracking-tight leading-snug font-display">
                  {pubQuery.data.title}
                </h2>
                
                <p className="text-sm font-semibold text-zinc-500 mb-5">
                  {pubQuery.data.authors || "Auteur principal"}
                </p>

                <div className="flex flex-wrap gap-2.5">
                  {pubQuery.data.session && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white text-zinc-650 rounded-xl text-xs font-semibold border border-zinc-200/60 shadow-sm">
                      <Clock size={12} className="text-theme-secondary animate-pulse" /> {pubQuery.data.session}
                    </span>
                  )}
                  {pubQuery.data.room && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white text-zinc-650 rounded-xl text-xs font-semibold border border-zinc-200/60 shadow-sm">
                      <MapPin size={12} className="text-theme-secondary" /> {pubQuery.data.room}
                    </span>
                  )}
                </div>
              </div>

              {/* Abstract section */}
              {(pubQuery.data.abstractText || pubQuery.data.description) && (
                <div className="p-8 border-b border-zinc-200/80 bg-white theme-transition">
                  <h4 className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-widest mb-4 font-display">Résumé Scientifique</h4>
                  <div className="max-h-[220px] overflow-y-auto pr-2 scrollbar-thin">
                    <p className="text-xs text-zinc-600 leading-relaxed whitespace-pre-wrap font-medium">
                      {pubQuery.data.abstractText || pubQuery.data.description}
                    </p>
                  </div>
                </div>
              )}

              {/* Associated Media switcher tab list */}
              <div className="p-8 border-b border-zinc-200/80 bg-zinc-50/50 flex-1 theme-transition">
                <h4 className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-widest mb-4 font-display">Pièces Jointes & Médias</h4>
                
                <div className="space-y-3">
                  {/* Default main poster */}
                  {posterUrl && (
                    <button
                      onClick={() => setActiveMedia(null)}
                      className={`w-full flex items-center gap-3.5 p-3 rounded-2xl border text-left transition-all shadow-sm ${
                        !activeMedia 
                          ? 'bg-white border-theme-primary/40 shadow-md shadow-theme-primary/5 font-bold text-zinc-900' 
                          : 'bg-white/50 border-zinc-200/60 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700'
                      }`}
                    >
                      <div className={`p-2.5 rounded-xl ${!activeMedia ? 'bg-theme-primary/10 text-theme-primary' : 'bg-zinc-100 text-zinc-400'}`}>
                        <FileText size={16} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold truncate">Poster Principal</p>
                        <p className="text-[9px] text-zinc-400 mt-0.5 uppercase tracking-wider font-extrabold">PDF / IMAGE</p>
                      </div>
                    </button>
                  )}

                  {/* Associated documents/videos */}
                  {mediaList.map((media, idx) => {
                    const isActive = activeMedia?.id === media.id;
                    const isMediaVideo = media.fileType === "VIDEO";
                    return (
                      <button
                        key={media.id || idx}
                        onClick={() => setActiveMedia(media)}
                        className={`w-full flex items-center gap-3.5 p-3 rounded-2xl border text-left transition-all shadow-sm ${
                          isActive 
                            ? 'bg-white border-theme-primary/40 shadow-md shadow-theme-primary/5 font-bold text-zinc-900' 
                            : 'bg-white/50 border-zinc-200/60 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700'
                        }`}
                      >
                        {media.thumbnailPath ? (
                          <img 
                            src={getMediaUrl(media.thumbnailPath)} 
                            alt="thumb" 
                            className="w-10 h-10 rounded-xl object-cover border border-zinc-200 shrink-0" 
                          />
                        ) : (
                          <div className={`p-2.5 rounded-xl shrink-0 ${isActive ? 'bg-theme-primary/10 text-theme-primary' : 'bg-zinc-100 text-zinc-400'}`}>
                            {isMediaVideo ? <Video size={16} /> : <FileText size={16} />}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold truncate">{media.fileName || `Média Associé ${idx + 1}`}</p>
                          <p className="text-[9px] text-zinc-400 mt-0.5 uppercase tracking-wider font-extrabold">{media.fileType}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Mobile consultation QR */}
              {posterUrl && (
                <div className="p-8 flex items-center gap-4 bg-zinc-50/50 border-b border-zinc-200/80 theme-transition">
                  <div className="p-2.5 bg-white rounded-2xl shadow-md border border-zinc-200 shrink-0">
                    <QRCodeCanvas value={getMediaUrl(posterUrl)} size={80} level="M" fgColor="#18181b" />
                  </div>
                  <div>
                    <h4 className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-widest mb-1 font-display">Accès Mobile</h4>
                    <p className="text-xs text-zinc-800 font-semibold mb-1">Consulter sur mobile</p>
                    <p className="text-[9px] text-zinc-500 leading-relaxed font-medium">Scannez ce QR Code pour emporter cet e-poster et le lire sur votre smartphone.</p>
                  </div>
                </div>
              )}
              
              {/* Bottom footer pagination */}
              <div className="mt-auto bg-zinc-50/50 p-5 border-t border-zinc-200 theme-transition">
                <div className="flex justify-between items-center gap-3">
                  <button
                    disabled={!prevPub}
                    onClick={() => prevPub && navigate(`/totem/publications/${prevPub.id}${buildSearchParams()}`)}
                    className="totem-page-btn flex-1 justify-center"
                  >
                    <ChevronLeft size={16} /> Précédent
                  </button>
                  <span className="totem-page-info">
                    {currentIndex >= 0 ? `${currentIndex + 1} / ${pubsQuery.data?.totalElements || "?"}` : ""}
                  </span>
                  <button
                    disabled={!nextPub}
                    onClick={() => nextPub && navigate(`/totem/publications/${nextPub.id}${buildSearchParams()}`)}
                    className="totem-page-btn flex-1 justify-center"
                  >
                    Suivant <ChevronRight size={16} />
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
