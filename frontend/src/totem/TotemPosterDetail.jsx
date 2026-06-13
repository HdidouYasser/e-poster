import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { publicApi, getMediaUrl, getPosterThumbnail } from "../api";
import { useIdleTimer } from "../hooks/useIdleTimer";
import { createTotemSync } from "./totemSync";
import {
  ArrowLeft, ZoomIn, ZoomOut, Maximize, Minimize, RefreshCcw,
  FileImage, Tag, MapPin, Clock, ChevronLeft, ChevronRight,
  Video, FileText, Info, X
} from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";
import { useDynamicTheme } from "../hooks/useDynamicTheme";

const sync = createTotemSync();

function NavPreviewBtn({ pub, direction, onClick, eventId, buildSearchParams }) {
  const [hovered, setHovered] = useState(false);
  const thumbUrl = pub?.posterUrl ? getPosterThumbnail(pub.posterUrl) : null;

  return (
    <div className="relative">
      <button
        onClick={onClick}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className={`absolute ${direction === 'left' ? 'left-4' : 'right-4'} top-1/2 -translate-y-1/2 z-10 w-11 h-11 bg-white hover:bg-zinc-900 hover:text-white border border-zinc-200 text-zinc-700 rounded-full flex items-center justify-center active:scale-95 transition-all`}
        title={direction === 'left' ? 'Poster Précédent' : 'Poster Suivant'}
      >
        {direction === 'left' ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
      </button>

      {hovered && pub && (
        <div
          className={`absolute z-20 top-1/2 -translate-y-1/2 ${direction === 'left' ? 'left-20' : 'right-20'} 
            w-52 bg-white border border-zinc-200 rounded-xl p-3 pointer-events-none`}
          style={{ animation: 'fadeIn 0.12s ease' }}
        >
          {thumbUrl ? (
            <img src={thumbUrl} alt={pub.title} className="w-full aspect-[3/4] object-cover rounded-lg border border-zinc-100 mb-2" />
          ) : (
            <div className="w-full aspect-[3/4] rounded-lg border border-zinc-100 mb-2 bg-zinc-50 flex items-center justify-center">
              <FileImage size={24} className="text-zinc-300" />
            </div>
          )}
          <p className="text-xs font-bold text-zinc-900 line-clamp-2 leading-snug">{pub.title}</p>
          {pub.authors && (
            <p className="text-[10px] text-zinc-400 font-medium mt-1 truncate">{pub.authors}</p>
          )}
          <div className="flex items-center gap-1 mt-2">
            <Info size={10} className="text-zinc-300" />
            <span className="text-[9px] text-zinc-400 font-semibold uppercase tracking-wider">
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
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);

  /** Build a scannable URL pointing to the visitor detail page (not the raw poster file) */
  const visitorUrl = useMemo(() => {
    const base = `${window.location.origin}/totem/publications/${id}?screen=visitor`;
    return base;
  }, [id]);

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
    if (id) {
      publicApi.post(`/publications/${id}/view`).catch(() => { });
    }
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
    if (screen === "visitor") {
      sync.send({ type: "NAVIGATE", screen, path: location.pathname + location.search });
    }
  }, [location, screen]);

  useEffect(() => {
    return sync.onMessage((msg) => {
      if (!msg || msg.type !== "NAVIGATE") return;
      if (String(msg.screen) === String(screen)) return;
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

  const handleDoubleTap = () => {
    setZoom((z) => (z === 1 ? 2 : 1));
  };

  let lastTap = 0;
  const handleTouchEnd = (e) => {
    const now = Date.now();
    if (now - lastTap < 300) {
      e.preventDefault();
      handleDoubleTap();
    }
    lastTap = now;
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
    <div className="h-screen flex flex-col bg-white text-zinc-900 font-sans theme-transition relative overflow-hidden">

      {/* Header */}
      <header className="flex items-center justify-between px-6 py-3 bg-white border-b border-zinc-100 z-10 shrink-0">
        <Link
          to={`/totem/publications${buildSearchParams()}`}
          className="totem-back-btn"
        >
          <ArrowLeft size={14} /> Retour aux communications
        </Link>

        <div className="flex items-center gap-2">
          {!isPdf && !isVideo && (
            <div className="flex bg-zinc-50 p-0.5 rounded-lg border border-zinc-200 items-center gap-0.5">
              <button
                onClick={() => setZoom((z) => Math.max(0.6, Number((z - 0.1).toFixed(2))))}
                className="p-1.5 hover:bg-white hover:text-zinc-900 rounded-md text-zinc-500 transition-all active:scale-90"
                title="Dé-zoomer"
              >
                <ZoomOut size={13} />
              </button>
              <div className="flex items-center justify-center w-10 font-mono text-[10px] font-bold text-zinc-500">
                {Math.round(zoom * 100)}%
              </div>
              <button
                onClick={() => setZoom((z) => Math.min(3, Number((z + 0.1).toFixed(2))))}
                className="p-1.5 hover:bg-white hover:text-zinc-900 rounded-md text-zinc-500 transition-all active:scale-90"
                title="Zoomer"
              >
                <ZoomIn size={13} />
              </button>
              <div className="w-px h-3.5 bg-zinc-200 mx-0.5" />
              <button
                onClick={() => setZoom(1)}
                className="p-1.5 hover:bg-white hover:text-zinc-900 rounded-md text-zinc-500 transition-all active:scale-90"
                title="Réinitialiser zoom"
              >
                <RefreshCcw size={12} />
              </button>
            </div>
          )}
          <button onClick={requestFullscreen} className="totem-cta-btn text-[11px]">
            {isFullscreen ? <Minimize size={12} /> : <Maximize size={12} />}
            <span>{isFullscreen ? "Quitter" : "Plein Écran"}</span>
          </button>
        </div>
      </header>

      {/* Stepper */}
      <div className="max-w-6xl mx-auto px-6 pt-4 w-full">
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

      {/* Main */}
      <main className="flex-1 flex overflow-hidden relative">
        {pubQuery.isLoading ? (
          <div className="flex-1 flex flex-col lg:flex-row w-full h-full animate-pulse">
            <div className="flex-1 bg-zinc-50 flex items-center justify-center vh-media-viewport">
              <div className="w-2/3 aspect-[3/4] bg-zinc-100 rounded-xl" />
            </div>
            <div className="w-full lg:w-[380px] bg-white border-l border-zinc-100 flex flex-col gap-5 p-8">
              <div className="skeleton-text h-4 w-1/3 shimmer-pulse" />
              <div className="skeleton-text h-6 w-4/5 shimmer-pulse" style={{ animationDelay: '0.1s' }} />
              <div className="skeleton-text h-4 w-3/5 shimmer-pulse" style={{ animationDelay: '0.2s' }} />
              <div className="skeleton-text h-4 w-full shimmer-pulse" style={{ animationDelay: '0.3s' }} />
            </div>
          </div>
        ) : !pubQuery.data ? (
          <div className="flex-1 flex flex-col items-center justify-center bg-white m-8 rounded-xl border border-zinc-200">
            <FileImage size={48} className="text-zinc-300 mb-4" />
            <div className="text-lg font-bold text-zinc-900 mb-2 font-display">Poster introuvable</div>
            <div className="text-xs text-zinc-500">Ce document n'existe plus ou a été archivé.</div>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row w-full h-full">

            {/* Media Canvas */}
            <div className="flex-1 bg-zinc-50 relative overflow-hidden vh-media-viewport">
              {prevPub && (
                <NavPreviewBtn
                  pub={prevPub}
                  direction="left"
                  onClick={() => navigate(`/totem/publications/${prevPub.id}${buildSearchParams()}`)}
                  buildSearchParams={buildSearchParams}
                />
              )}
              {nextPub && (
                <NavPreviewBtn
                  pub={nextPub}
                  direction="right"
                  onClick={() => navigate(`/totem/publications/${nextPub.id}${buildSearchParams()}`)}
                  buildSearchParams={buildSearchParams}
                />
              )}

              <div className="absolute inset-0 flex items-center justify-center px-16 py-6 overflow-auto">
                {isVideo ? (
                  <div className="w-full h-full max-w-4xl flex-shrink-0 aspect-video rounded-xl overflow-hidden border border-zinc-200 bg-black">
                    <video src={activeMediaUrl} controls autoPlay className="w-full h-full object-contain" />
                  </div>
                ) : isPdf ? (
                  <div className="w-full h-full rounded-xl overflow-hidden border border-zinc-200 bg-white relative">
                    <iframe src={activeMediaUrl} className="w-full h-full bg-white border-none" title="PDF Poster Viewer" />
                  </div>
                ) : activeMediaUrl ? (
                  <div
                    className="transition-all duration-200 flex items-center justify-center"
                    style={{
                      width: `${zoom * 100}%`,
                      height: `${zoom * 100}%`,
                      minWidth: '100%',
                      minHeight: '100%',
                    }}
                  >
                    <img
                      src={activeMediaUrl}
                      alt={pubQuery.data.title}
                      className="max-w-full max-h-full object-contain rounded-lg border border-zinc-200 bg-white"
                      draggable={false}
                      onTouchEnd={handleTouchEnd}
                      onDoubleClick={handleDoubleTap}
                    />
                  </div>
                ) : (
                  <div className="flex flex-col items-center text-zinc-400 max-w-sm text-center">
                    <FileImage size={48} className="mb-4 text-zinc-300" />
                    <h3 className="text-sm font-bold text-zinc-900 mb-2 font-display">Aucun visuel associé</h3>
                    <p className="text-xs text-zinc-500">Le support visuel de cet e-poster n'a pas encore été téléversé.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="w-full lg:w-[380px] bg-white border-t lg:border-t-0 lg:border-l border-zinc-100 flex flex-col shrink-0 overflow-y-auto">

              {/* Header details */}
              <div className="p-6 border-b border-zinc-100 bg-zinc-50/50">
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {pubQuery.data.category && (
                      <span className="totem-badge totem-badge-primary theme-transition">
                        <Tag size={9} /> {pubQuery.data.category}
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-zinc-100 text-zinc-500 rounded border border-zinc-200 text-[9px] font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-theme-primary animate-pulse" />
                      {pubQuery.data.viewCount || 0} consultations
                    </span>
                  </div>
                  <span className="text-[9px] font-mono font-bold text-zinc-400 bg-zinc-50 px-2 py-0.5 rounded border border-zinc-100">
                    Communication N° {pubQuery.data.id}
                  </span>
                </div>

                <h2 className="text-base font-bold text-zinc-900 mb-2 tracking-tight leading-snug font-display">
                  {pubQuery.data.title}
                </h2>

                {pubQuery.data.authorsList && pubQuery.data.authorsList.length > 0 ? (
                  <div className="mb-4 space-y-1.5 text-[11px]">
                    {pubQuery.data.authorsList.filter(a => a.isCorresponding).length > 0 && (
                      <div>
                        <span className="font-bold text-zinc-700">Auteur correspondant : </span>
                        <span className="text-zinc-600 font-medium">
                          {pubQuery.data.authorsList.filter(a => a.isCorresponding).map(a => `${a.firstName} ${a.lastName}`).join(", ")}
                        </span>
                      </div>
                    )}
                    {pubQuery.data.authorsList.filter(a => !a.isCorresponding).length > 0 && (
                      <div>
                        <span className="font-semibold text-zinc-400">Co-auteurs : </span>
                        <span className="text-zinc-500 font-medium">
                          {pubQuery.data.authorsList.filter(a => !a.isCorresponding).map(a => `${a.firstName} ${a.lastName}`).join(", ")}
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-xs font-medium text-zinc-500 mb-4">
                    {pubQuery.data.authors || "Auteur principal"}
                  </p>
                )}

                <div className="flex flex-wrap gap-1.5 mb-3">
                  {pubQuery.data.session && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white text-zinc-600 rounded-lg text-[10px] font-semibold border border-zinc-200">
                      <Clock size={12} className="text-theme-secondary" /> {pubQuery.data.session}
                    </span>
                  )}
                  {pubQuery.data.room && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white text-zinc-600 rounded-lg text-[10px] font-semibold border border-zinc-200">
                      <MapPin size={12} className="text-theme-secondary" /> {pubQuery.data.room}
                    </span>
                  )}
                </div>
              </div>

              {/* Abstract */}
              {(pubQuery.data.abstractText || pubQuery.data.description) && (
                <div className="p-6 border-b border-zinc-100">
                  <h4 className="totem-section-label">Résumé Scientifique</h4>
                  <div className="max-h-[200px] overflow-y-auto pr-1 scrollbar-thin">
                    <p className="text-xs text-zinc-600 leading-relaxed whitespace-pre-wrap">
                      {pubQuery.data.abstractText || pubQuery.data.description}
                    </p>
                  </div>
                </div>
              )}

              {/* Media switcher */}
              <div className="p-6 border-b border-zinc-100 bg-zinc-50/50 flex-1">
                <h4 className="totem-section-label">Pièces Jointes & Médias</h4>
                <div className="space-y-2">
                  {posterUrl && (
                    <button
                      onClick={() => setActiveMedia(null)}
                      className={`w-full flex items-center gap-2.5 p-3 rounded-lg border text-left transition-all ${!activeMedia
                        ? 'bg-white border-theme-primary/30 font-bold text-zinc-900'
                        : 'bg-white border-zinc-200 text-zinc-500 hover:bg-zinc-50 hover:text-zinc-700'
                        }`}
                    >
                      <div className={`p-2 rounded-lg ${!activeMedia ? 'bg-theme-primary/10 text-theme-primary' : 'bg-zinc-50 text-zinc-400'}`}>
                        <FileText size={14} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-semibold truncate">Poster Principal</p>
                        <p className="text-[9px] text-zinc-400 mt-0.5 uppercase tracking-wider font-bold">PDF / IMAGE</p>
                      </div>
                    </button>
                  )}

                  {mediaList.map((media, idx) => {
                    const isActive = activeMedia?.id === media.id;
                    const isMediaVideo = media.fileType === "VIDEO";
                    return (
                      <button
                        key={media.id || idx}
                        onClick={() => setActiveMedia(media)}
                        className={`w-full flex items-center gap-2.5 p-3 rounded-lg border text-left transition-all ${isActive
                          ? 'bg-white border-theme-primary/30 font-bold text-zinc-900'
                          : 'bg-white border-zinc-200 text-zinc-500 hover:bg-zinc-50 hover:text-zinc-700'
                          }`}
                      >
                        {media.thumbnailPath ? (
                          <img src={getMediaUrl(media.thumbnailPath)} alt="thumb" className="w-9 h-9 rounded-lg object-cover border border-zinc-200 shrink-0" />
                        ) : (
                          <div className={`p-2 rounded-lg shrink-0 ${isActive ? 'bg-theme-primary/10 text-theme-primary' : 'bg-zinc-50 text-zinc-400'}`}>
                            {isMediaVideo ? <Video size={14} /> : <FileText size={14} />}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-[11px] font-semibold truncate">{media.fileName || `Média Associé ${idx + 1}`}</p>
                          <p className="text-[9px] text-zinc-400 mt-0.5 uppercase tracking-wider font-bold">{media.fileType}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* QR Code */}
              {posterUrl && (
                <div className="p-5 border-b border-zinc-100 bg-zinc-50/50">
                  <div
                    onClick={() => setIsQrModalOpen(true)}
                    className="flex items-center gap-3 bg-white p-3 rounded-lg border border-zinc-200 cursor-pointer hover:border-zinc-300 active:scale-[0.99] transition-all"
                  >
                    <div className="p-1 bg-zinc-50 rounded-lg border border-zinc-100 shrink-0">
                      <QRCodeCanvas value={visitorUrl} size={64} level="M" fgColor="#18181b" />
                    </div>
                    <div className="flex-1">
                      <h4 className="totem-section-label mb-0.5">Accès Mobile</h4>
                      <p className="text-[10px] font-bold text-zinc-900 mb-0.5 flex items-center justify-between">
                        <span>Consulter sur mobile</span>
                        <span className="text-[9px] text-theme-primary font-bold uppercase tracking-wider theme-transition">Agrandir</span>
                      </p>
                      <p className="text-[9px] text-zinc-500 leading-relaxed">Scannez pour consulter cette publication et ses médias sur votre smartphone.</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Bottom pagination */}
              <div className="mt-auto bg-white p-4 border-t border-zinc-100">
                <div className="flex justify-between items-center gap-2">
                  <button
                    disabled={!prevPub}
                    onClick={() => prevPub && navigate(`/totem/publications/${prevPub.id}${buildSearchParams()}`)}
                    className="totem-page-btn flex-1 justify-center"
                  >
                    <ChevronLeft size={14} /> Précédent
                  </button>
                  <span className="totem-page-info">
                    {currentIndex >= 0 ? `${currentIndex + 1} / ${pubsQuery.data?.totalElements || "?"}` : ""}
                  </span>
                  <button
                    disabled={!nextPub}
                    onClick={() => nextPub && navigate(`/totem/publications/${nextPub.id}${buildSearchParams()}`)}
                    className="totem-page-btn flex-1 justify-center"
                  >
                    Suivant <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
      {isQrModalOpen && posterUrl && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-md animate-fade-in" onClick={() => setIsQrModalOpen(false)}>
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center relative border border-zinc-100 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setIsQrModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded-xl transition-colors"
            >
              <X size={18} />
            </button>
            <h3 className="text-base font-bold text-zinc-900 mb-2 font-display">Accès Mobile</h3>
            <p className="text-xs text-zinc-500 mb-6">Scannez ce QR Code avec votre smartphone pour emporter et lire ce poster scientifique.</p>
            <div className="inline-block p-4 bg-zinc-50 border border-zinc-100 rounded-2xl mb-4">
              <QRCodeCanvas value={visitorUrl} size={200} level="H" fgColor="#18181b" />
            </div>
            <p className="text-[10px] font-mono text-zinc-400 select-all truncate bg-zinc-50 px-3 py-2 rounded-xl border border-zinc-100">
              {visitorUrl}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}