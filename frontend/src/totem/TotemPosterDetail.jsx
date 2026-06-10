import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { publicApi, getMediaUrl, getPosterThumbnail } from "../api";
import { useIdleTimer } from "../hooks/useIdleTimer";
import { createTotemSync } from "./totemSync";
import {
  ArrowLeft, ZoomIn, ZoomOut, Maximize, Minimize, RefreshCcw,
  FileImage, Tag, MapPin, Clock, ChevronLeft, ChevronRight,
  Video, FileText, Info
} from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";
import { useDynamicTheme } from "../hooks/useDynamicTheme";

const sync = createTotemSync();

// ── Poster navigation preview tooltip ──
function NavPreviewBtn({ pub, direction, onClick, eventId, buildSearchParams }) {
  const [hovered, setHovered] = useState(false);
  const thumbUrl = pub?.posterUrl ? getPosterThumbnail(pub.posterUrl) : null;

  return (
    <div className="relative">
      <button
        onClick={onClick}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className={`absolute ${direction === 'left' ? 'left-5' : 'right-5'} top-1/2 -translate-y-1/2 z-10 w-14 h-14 bg-white hover:bg-zinc-900 hover:text-white border border-zinc-200 text-zinc-800 rounded-full flex items-center justify-center active:scale-95 transition-all`}
        style={{ boxShadow: 'var(--totem-shadow-elevated)' }}
        title={direction === 'left' ? 'Poster Précédent' : 'Poster Suivant'}
      >
        {direction === 'left' ? <ChevronLeft size={24} /> : <ChevronRight size={24} />}
      </button>

      {/* Hover tooltip preview */}
      {hovered && pub && (
        <div
          className={`absolute z-20 top-1/2 -translate-y-1/2 ${direction === 'left' ? 'left-24' : 'right-24'} 
            w-60 bg-white border border-zinc-200 rounded-2xl p-4 pointer-events-none`}
          style={{ animation: 'fadeIn 0.15s ease', boxShadow: 'var(--totem-shadow-elevated)' }}
        >
          {thumbUrl ? (
            <img
              src={thumbUrl}
              alt={pub.title}
              className="w-full aspect-[3/4] object-cover rounded-xl border border-zinc-100 mb-3"
            />
          ) : (
            <div className="w-full aspect-[3/4] rounded-xl border border-zinc-100 mb-3 bg-zinc-100 flex items-center justify-center">
              <FileImage size={28} className="text-zinc-300" />
            </div>
          )}
          <p className="text-sm font-bold text-zinc-900 line-clamp-2 leading-snug">{pub.title}</p>
          {pub.authors && (
            <p className="text-xs text-zinc-400 font-semibold mt-1.5 truncate">{pub.authors}</p>
          )}
          <div className="flex items-center gap-1.5 mt-2.5">
            <Info size={11} className="text-zinc-300" />
            <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
              {direction === 'left' ? '← Précédent' : 'Suivant →'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export default function TotemPosterDetail() {
  const navigate = useNavigate();
  const location = useLocation();
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

  useEffect(() => {
    setActiveMedia(null);
    setZoom(1);
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

  // Broadcast navigation if this is the controller (visitor screen)
  useEffect(() => {
    if (screen === "visitor") {
      sync.send({ type: "NAVIGATE", screen, path: location.pathname + location.search });
    }
  }, [location, screen]);

  // Listen to navigation from other screens
  useEffect(() => {
    return sync.onMessage((msg) => {
      if (!msg || msg.type !== "NAVIGATE") return;
      if (String(msg.screen) === String(screen)) return;

      // Rewrite screen parameter in path to match local screen
      const url = new URL(msg.path, window.location.origin);
      url.searchParams.set("screen", screen);
      navigate(url.pathname + url.search);
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
    } catch { /* ignore */ }
  };

  const buildSearchParams = () => {
    let p = `?screen=${screen}&page=${page}`;
    if (q) p += `&q=${encodeURIComponent(q)}`;
    if (category) p += `&category=${encodeURIComponent(category)}`;
    if (eventId) p += `&eventId=${encodeURIComponent(eventId)}`;
    if (session) p += `&session=${encodeURIComponent(session)}`;
    if (room) p += `&room=${encodeURIComponent(room)}`;
    return p;
  };

  const activeMediaUrl = useMemo(() => {
    return getMediaUrl(activeMedia?.filePath || posterUrl);
  }, [activeMedia, posterUrl]);

  const isPdf = useMemo(() => {
    if (activeMedia?.fileType === "PDF") return true;
    if (!activeMedia && posterUrl && posterUrl.toLowerCase().endsWith('.pdf')) return true;
    return false;
  }, [activeMedia, posterUrl]);

  const isVideo = useMemo(() => activeMedia?.fileType === "VIDEO", [activeMedia]);

  return (
    <div className="h-screen flex flex-col bg-zinc-50 text-zinc-900 font-sans transition-colors duration-500 selection:bg-theme-secondary/20 selection:text-zinc-900 theme-transition relative overflow-hidden">

      {/* ── Header Toolbar ── */}
      <header className="flex items-center justify-between px-8 py-4 bg-white border-b-[1.5px] border-zinc-200 z-10 shrink-0 theme-transition" style={{ boxShadow: 'var(--totem-shadow)' }}>
        <Link
          to={`/totem/publications${buildSearchParams()}`}
          className="totem-back-btn"
        >
          <ArrowLeft size={15} /> Retour aux communications
        </Link>

        <div className="flex items-center gap-3">
          {/* Zoom controls — image only */}
          {!isPdf && !isVideo && (
            <div className="flex bg-zinc-100 p-1 rounded-xl border border-zinc-200 items-center gap-1">
              <button
                onClick={() => setZoom((z) => Math.max(0.6, Number((z - 0.1).toFixed(2))))}
                className="p-2 hover:bg-white hover:text-zinc-900 rounded-lg text-zinc-500 transition-all active:scale-90"
                title="Dé-zoomer"
              >
                <ZoomOut size={14} />
              </button>
              <div className="flex items-center justify-center w-12 font-mono text-[11px] font-bold text-zinc-600">
                {Math.round(zoom * 100)}%
              </div>
              <button
                onClick={() => setZoom((z) => Math.min(3, Number((z + 0.1).toFixed(2))))}
                className="p-2 hover:bg-white hover:text-zinc-900 rounded-lg text-zinc-500 transition-all active:scale-90"
                title="Zoomer"
              >
                <ZoomIn size={14} />
              </button>
              <div className="w-px h-4 bg-zinc-200 mx-0.5" />
              <button
                onClick={() => setZoom(1)}
                className="p-2 hover:bg-white hover:text-zinc-900 rounded-lg text-zinc-500 transition-all active:scale-90"
                title="Réinitialiser zoom"
              >
                <RefreshCcw size={13} />
              </button>
            </div>
          )}
          <button
            onClick={requestFullscreen}
            className="totem-cta-btn"
          >
            {isFullscreen ? <Minimize size={13} /> : <Maximize size={13} />}
            <span>{isFullscreen ? "Quitter" : "Plein Écran"}</span>
          </button>
        </div>
      </header>

      {/* ── Navigation Stepper Breadcrumb ── */}
      <div className="max-w-7xl mx-auto px-8 pt-5 w-full">
        <div className="totem-stepper">
          <Link to="/" className="totem-stepper-step">
            <span className="totem-stepper-num">1</span>
            <span className="hidden sm:inline">Portail</span>
          </Link>
          <span className="totem-stepper-divider">/</span>
          <Link to={`/totem?screen=${screen}`} className="totem-stepper-step">
            <span className="totem-stepper-num">2</span>
            <span className="hidden sm:inline">Sélection Congrès</span>
          </Link>
          <span className="totem-stepper-divider">/</span>
          <Link to={`/totem/publications${buildSearchParams()}`} className="totem-stepper-step">
            <span className="totem-stepper-num">3</span>
            <span className="hidden sm:inline">E-Posters</span>
          </Link>
          <span className="totem-stepper-divider">/</span>
          <div className="totem-stepper-step active">
            <span className="totem-stepper-num">4</span>
            <span className="hidden sm:inline">Lecture Poster</span>
          </div>
        </div>
      </div>

      {/* ── Main Content ── */}
      <main className="flex-1 flex overflow-hidden relative">
        {pubQuery.isLoading ? (
          /* ── Skeleton loader instead of plain spinner ── */
          <div className="flex-1 flex flex-col lg:flex-row w-full h-full animate-pulse">
            {/* Media canvas skeleton */}
            <div className="flex-1 bg-zinc-100 flex items-center justify-center vh-media-viewport">
              <div className="w-2/3 aspect-[3/4] bg-zinc-200 rounded-2xl" />
            </div>
            {/* Sidebar skeleton */}
            <div className="w-full lg:w-[420px] bg-white border-l border-zinc-200 flex flex-col gap-7 p-10">
              <div className="skeleton-text h-5 w-1/3 shimmer-pulse" />
              <div className="skeleton-text h-7 w-4/5 shimmer-pulse" style={{ animationDelay: '0.1s' }} />
              <div className="skeleton-text h-5 w-3/5 shimmer-pulse" style={{ animationDelay: '0.2s' }} />
              <div className="skeleton-text h-5 w-full shimmer-pulse" style={{ animationDelay: '0.3s' }} />
              <div className="skeleton-text h-5 w-5/6 shimmer-pulse" style={{ animationDelay: '0.4s' }} />
            </div>
          </div>
        ) : !pubQuery.data ? (
          <div className="flex-1 flex flex-col items-center justify-center bg-white m-10 rounded-2xl border border-zinc-200" style={{ boxShadow: 'var(--totem-shadow-elevated)' }}>
            <FileImage size={64} className="text-zinc-300 mb-5" />
            <div className="text-2xl font-bold text-zinc-900 mb-3 font-display">Poster introuvable</div>
            <div className="text-base text-zinc-500">Ce document n'existe plus ou a été archivé.</div>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row w-full h-full">

            {/* ── Media Canvas ── */}
            <div className="flex-1 bg-zinc-100 relative overflow-hidden vh-media-viewport">
              {/* Left nav arrow with preview tooltip */}
              {prevPub && (
                <NavPreviewBtn
                  pub={prevPub}
                  direction="left"
                  onClick={() => navigate(`/totem/publications/${prevPub.id}${buildSearchParams()}`)}
                  buildSearchParams={buildSearchParams}
                />
              )}

              {/* Right nav arrow with preview tooltip */}
              {nextPub && (
                <NavPreviewBtn
                  pub={nextPub}
                  direction="right"
                  onClick={() => navigate(`/totem/publications/${nextPub.id}${buildSearchParams()}`)}
                  buildSearchParams={buildSearchParams}
                />
              )}

              {/* Media display */}
              <div className="absolute inset-0 flex items-center justify-center px-20 py-8 overflow-auto">
                {isVideo ? (
                  <div className="w-full h-full max-w-5xl flex-shrink-0 aspect-video rounded-2xl overflow-hidden border border-zinc-200 bg-black" style={{ boxShadow: 'var(--totem-shadow-elevated)' }}>
                    <video src={activeMediaUrl} controls autoPlay className="w-full h-full object-contain" />
                  </div>
                ) : isPdf ? (
                  <div className="w-full h-full rounded-2xl overflow-hidden border border-zinc-200 bg-white relative" style={{ boxShadow: 'var(--totem-shadow-elevated)' }}>
                    <iframe src={activeMediaUrl} className="w-full h-full bg-white border-none" title="PDF Poster Viewer" />
                  </div>
                ) : activeMediaUrl ? (
                  <img
                    src={activeMediaUrl}
                    alt={pubQuery.data.title}
                    className="max-w-full max-h-full object-contain origin-center transition-transform duration-200 ease-out rounded-xl border border-zinc-200 bg-white"
                    style={{ transform: `scale(${zoom})`, boxShadow: 'var(--totem-shadow-elevated)' }}
                    draggable={false}
                  />
                ) : (
                  <div className="flex flex-col items-center text-zinc-400 max-w-sm text-center">
                    <FileImage size={64} className="mb-5 text-zinc-300" />
                    <h3 className="text-xl font-bold text-zinc-900 mb-3 font-display">Aucun visuel associé</h3>
                    <p className="text-sm text-zinc-500">Le support visuel de cet e-poster n'a pas encore été téléversé.</p>
                  </div>
                )}
              </div>
            </div>

            {/* ── Premium Details Sidebar ── */}
            <div className="w-full lg:w-[420px] bg-white border-t lg:border-t-0 lg:border-l-[1.5px] border-zinc-200 flex flex-col shrink-0 overflow-y-auto" style={{ boxShadow: '-2px 0 8px rgba(0,0,0,0.02)' }}>

              {/* Header details block */}
              <div className="p-8 border-b border-zinc-100 bg-zinc-50 theme-transition">
                <div className="flex items-center justify-between gap-3 mb-4">
                  {pubQuery.data.category ? (
                    <span className="totem-badge totem-badge-primary theme-transition">
                      <Tag size={10} /> {pubQuery.data.category}
                    </span>
                  ) : <span />}
                  <span className="text-[10px] font-mono font-extrabold text-zinc-400 bg-zinc-100 px-2.5 py-1 rounded-lg border border-zinc-200">
                    Communication N° {pubQuery.data.id}
                  </span>
                </div>

                <h2 className="text-xl font-extrabold text-zinc-900 mb-3 tracking-tight leading-snug font-display">
                  {pubQuery.data.title}
                </h2>

                <p className="text-sm font-semibold text-zinc-500 mb-5">
                  {pubQuery.data.authors || "Auteur principal"}
                </p>

                {/* Session / Room badges */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {pubQuery.data.session && (
                    <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-white text-zinc-600 rounded-xl text-xs font-semibold border border-zinc-200" style={{ boxShadow: 'var(--totem-shadow)' }}>
                      <Clock size={13} className="text-theme-secondary" /> {pubQuery.data.session}
                    </span>
                  )}
                  {pubQuery.data.room && (
                    <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-white text-zinc-600 rounded-xl text-xs font-semibold border border-zinc-200" style={{ boxShadow: 'var(--totem-shadow)' }}>
                      <MapPin size={13} className="text-theme-secondary" /> {pubQuery.data.room}
                    </span>
                  )}
              </div>
            </div>

            {/* Abstract section */}
              {(pubQuery.data.abstractText || pubQuery.data.description) && (
                <div className="p-8 border-b border-zinc-100 bg-white theme-transition">
                  <h4 className="totem-section-label">Résumé Scientifique</h4>
                  <div className="max-h-[220px] overflow-y-auto pr-2 scrollbar-thin">
                    <p className="text-sm text-zinc-600 leading-relaxed whitespace-pre-wrap font-medium">
                      {pubQuery.data.abstractText || pubQuery.data.description}
                    </p>
                  </div>
                </div>
              )}

              {/* Associated Media switcher */}
              <div className="p-8 border-b border-zinc-100 bg-zinc-50 flex-1 theme-transition">
                <h4 className="totem-section-label">Pièces Jointes & Médias</h4>

                <div className="space-y-2.5">
                  {/* Default main poster */}
                  {posterUrl && (
                    <button
                      onClick={() => setActiveMedia(null)}
                      className={`w-full flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all ${
                        !activeMedia
                          ? 'bg-white border-theme-primary/40 font-bold text-zinc-900'
                          : 'bg-white border-zinc-200 text-zinc-500 hover:bg-zinc-50 hover:text-zinc-700'
                      }`}
                      style={{ boxShadow: !activeMedia ? 'var(--totem-shadow)' : 'none' }}
                    >
                      <div className={`p-2.5 rounded-xl ${!activeMedia ? 'bg-theme-primary/10 text-theme-primary' : 'bg-zinc-100 text-zinc-400'}`}>
                        <FileText size={16} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold truncate">Poster Principal</p>
                        <p className="text-[10px] text-zinc-400 mt-0.5 uppercase tracking-wider font-extrabold">PDF / IMAGE</p>
                      </div>
                    </button>
                  )}

                  {/* Additional media */}
                  {mediaList.map((media, idx) => {
                    const isActive = activeMedia?.id === media.id;
                    const isMediaVideo = media.fileType === "VIDEO";
                    return (
                      <button
                        key={media.id || idx}
                        onClick={() => setActiveMedia(media)}
                        className={`w-full flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all ${
                          isActive
                            ? 'bg-white border-theme-primary/40 font-bold text-zinc-900'
                            : 'bg-white border-zinc-200 text-zinc-500 hover:bg-zinc-50 hover:text-zinc-700'
                        }`}
                        style={{ boxShadow: isActive ? 'var(--totem-shadow)' : 'none' }}
                      >
                        {media.thumbnailPath ? (
                          <img
                            src={getMediaUrl(media.thumbnailPath)}
                            alt="thumb"
                            className="w-11 h-11 rounded-xl object-cover border border-zinc-200 shrink-0"
                          />
                        ) : (
                          <div className={`p-2.5 rounded-xl shrink-0 ${isActive ? 'bg-theme-primary/10 text-theme-primary' : 'bg-zinc-100 text-zinc-400'}`}>
                            {isMediaVideo ? <Video size={16} /> : <FileText size={16} />}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold truncate">{media.fileName || `Média Associé ${idx + 1}`}</p>
                          <p className="text-[10px] text-zinc-400 mt-0.5 uppercase tracking-wider font-extrabold">{media.fileType}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Mobile consultation QR */}
              {posterUrl && (
                <div className="p-7 border-b border-zinc-100 bg-zinc-50 theme-transition">
                  <div className="flex items-center gap-4 bg-white p-4 rounded-xl border border-zinc-200" style={{ boxShadow: 'var(--totem-shadow)' }}>
                    <div className="p-1.5 bg-zinc-50 rounded-xl border border-zinc-100 shrink-0">
                      <QRCodeCanvas value={getMediaUrl(posterUrl)} size={72} level="M" fgColor="#18181b" />
                    </div>
                    <div>
                      <h4 className="totem-section-label mb-0.5">Accès Mobile</h4>
                      <p className="text-xs font-bold text-zinc-900 mb-0.5">Consulter sur mobile</p>
                      <p className="text-[10px] text-zinc-500 leading-relaxed font-medium">Scannez pour emporter cet e-poster et le lire sur votre smartphone.</p>
                    </div>
                  </div>
                </div>
              )}


              {/* ── Bottom footer pagination ── */}
              <div className="mt-auto bg-white p-5 border-t-[1.5px] border-zinc-200 theme-transition">
                <div className="flex justify-between items-center gap-3">
                  <button
                    disabled={!prevPub}
                    onClick={() => prevPub && navigate(`/totem/publications/${prevPub.id}${buildSearchParams()}`)}
                    className="totem-page-btn flex-1 justify-center"
                  >
                    <ChevronLeft size={15} /> Précédent
                  </button>
                  <span className="totem-page-info">
                    {currentIndex >= 0 ? `${currentIndex + 1} / ${pubsQuery.data?.totalElements || "?"}` : ""}
                  </span>
                  <button
                    disabled={!nextPub}
                    onClick={() => nextPub && navigate(`/totem/publications/${nextPub.id}${buildSearchParams()}`)}
                    className="totem-page-btn flex-1 justify-center"
                  >
                    Suivant <ChevronRight size={15} />
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
