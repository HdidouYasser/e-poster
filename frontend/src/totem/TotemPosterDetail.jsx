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
    if (q.trim()) base = `/publications/search?q=${encodeURIComponent(q)}&page=${page}&size=12`;
    if (eventId) base += `&eventId=${encodeURIComponent(eventId)}`;
    if (category) base += `&category=${encodeURIComponent(category)}`;
    return base;
  }, [q, page, eventId, category]);

  const pubsQuery = useQuery({
    queryKey: ["totem-pubs-nav", endpoint],
    queryFn: async () => (await publicApi.get(endpoint)).data
  });

  const posterUrl = useMemo(() => pubQuery.data?.posterUrl, [pubQuery.data]);
  const mediaList = useMemo(() => pubQuery.data?.mediaList || [], [pubQuery.data]);
  const [activeMedia, setActiveMedia] = useState(null);

  useEffect(() => { setActiveMedia(null); }, [id]);

  const { nextPub, prevPub, currentIndex } = useMemo(() => {
    const items = pubsQuery.data?.items || [];
    const currentIndex = items.findIndex(p => Number(p.id) === Number(id));
    return {
      prevPub: currentIndex > 0 ? items[currentIndex - 1] : null,
      nextPub: currentIndex >= 0 && currentIndex < items.length - 1 ? items[currentIndex + 1] : null,
      currentIndex
    };
  }, [pubsQuery.data, id]);

  useIdleTimer({ timeoutMs: 45_000, onIdle: () => navigate(`/totem?screen=${screen}`), enabled: true });

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
    } catch { /* ignore */ }
  };

  const buildSearchParams = () => {
    let p = `?screen=${screen}&page=${page}`;
    if (q) p += `&q=${encodeURIComponent(q)}`;
    if (category) p += `&category=${encodeURIComponent(category)}`;
    if (eventId) p += `&eventId=${encodeURIComponent(eventId)}`;
    return p;
  };

  const activeMediaUrl = useMemo(() => getMediaUrl(activeMedia?.filePath || posterUrl), [activeMedia, posterUrl]);
  const isPdf = useMemo(() => {
    if (activeMedia?.fileType === "PDF") return true;
    if (!activeMedia && posterUrl?.toLowerCase().endsWith('.pdf')) return true;
    return false;
  }, [activeMedia, posterUrl]);
  const isVideo = useMemo(() => activeMedia?.fileType === "VIDEO", [activeMedia]);

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 text-zinc-900 font-sans theme-transition bg-dot-grid relative overflow-hidden">

      {/* ── Header Toolbar ── */}
      <header className="flex items-center justify-between px-5 py-3 bg-white border-b border-zinc-200/70 z-10 shrink-0 shadow-sm theme-transition">
        <Link
          to={`/totem/publications${buildSearchParams()}`}
          className="px-3 py-2 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 text-zinc-700 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 active:scale-95"
        >
          <ArrowLeft size={13} /> Retour aux communications
        </Link>

        <div className="flex items-center gap-2">
          {!isPdf && !isVideo && (
            <div className="flex bg-zinc-100 p-0.5 rounded-xl border border-zinc-200/60 items-center">
              <button
                onClick={() => setZoom((z) => Math.max(0.6, Number((z - 0.1).toFixed(2))))}
                className="p-1.5 hover:bg-white rounded-lg text-zinc-500 hover:text-zinc-900 transition-all"
              >
                <ZoomOut size={13} />
              </button>
              <div className="flex items-center justify-center w-12 font-mono text-[11px] font-bold text-zinc-600">
                {Math.round(zoom * 100)}%
              </div>
              <button
                onClick={() => setZoom((z) => Math.min(3, Number((z + 0.1).toFixed(2))))}
                className="p-1.5 hover:bg-white rounded-lg text-zinc-500 hover:text-zinc-900 transition-all"
              >
                <ZoomIn size={13} />
              </button>
            </div>
          )}

          {!isPdf && !isVideo && (
            <button
              onClick={() => setZoom(1)}
              className="p-2 bg-white hover:bg-zinc-50 border border-zinc-200 rounded-xl transition-all text-zinc-500 hover:text-zinc-900 active:scale-95"
              title="Réinitialiser zoom"
            >
              <RefreshCcw size={13} />
            </button>
          )}

          <button
            onClick={requestFullscreen}
            style={{ backgroundColor: 'var(--theme-primary)', color: 'var(--theme-foreground)' }}
            className="px-3 py-2 hover:opacity-90 rounded-xl text-xs font-bold transition-all flex items-center gap-2 active:scale-95 shadow-sm font-display"
          >
            {isFullscreen ? <Minimize size={13} /> : <Maximize size={13} />}
            {isFullscreen ? "Quitter" : "Plein Écran"}
          </button>
        </div>
      </header>

      {/* ── Main Content ── */}
      <main className="flex-1 flex overflow-hidden relative">
        {pubQuery.isLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="loading-spinner mb-4" style={{ borderTopColor: 'var(--theme-secondary)' }} />
            <div className="text-sm text-zinc-400 font-semibold">Chargement du document...</div>
          </div>

        ) : !pubQuery.data ? (
          <div className="flex-1 flex flex-col items-center justify-center m-8 bg-white rounded-3xl border border-zinc-200 shadow-sm">
            <FileImage size={48} className="text-zinc-300 mb-4" />
            <div className="text-lg font-bold text-zinc-900 mb-1">Poster introuvable</div>
            <div className="text-sm text-zinc-400">Ce document n'existe plus ou a été archivé.</div>
          </div>

        ) : (
          <div className="flex flex-col lg:flex-row w-full h-full">

            {/* Media Viewport */}
            <div className="flex-1 bg-zinc-100/50 flex items-center justify-center p-6 sm:p-10 overflow-auto relative">
              {isVideo ? (
                <div className="w-full h-full max-w-5xl aspect-video rounded-2xl overflow-hidden border border-zinc-200 bg-black shadow-xl">
                  <video src={activeMediaUrl} controls autoPlay className="w-full h-full object-contain" />
                </div>
              ) : isPdf ? (
                <div className="w-full h-full rounded-2xl overflow-hidden border border-zinc-200 bg-white shadow-xl">
                  <iframe src={activeMediaUrl} className="w-full h-full bg-white border-none" title="PDF Poster Viewer" />
                </div>
              ) : activeMediaUrl ? (
                <div className="max-w-full max-h-full overflow-auto flex items-center justify-center">
                  <img
                    src={activeMediaUrl}
                    alt={pubQuery.data.title}
                    className="max-w-none origin-center transition-transform duration-200 ease-out rounded-xl border border-zinc-200 bg-white shadow-xl"
                    style={{ transform: `scale(${zoom})` }}
                    draggable={false}
                  />
                </div>
              ) : (
                <div className="flex flex-col items-center text-zinc-400 max-w-sm text-center">
                  <FileImage size={52} className="mb-4 text-zinc-300 animate-pulse" />
                  <h3 className="text-lg font-bold text-zinc-900 mb-2">Aucun visuel associé</h3>
                  <p className="text-xs text-zinc-400">Le support visuel n'a pas encore été téléversé.</p>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="w-full lg:w-[380px] bg-white border-t lg:border-t-0 lg:border-l border-zinc-200 flex flex-col shrink-0 overflow-y-auto">

              {/* Metadata block */}
              <div className="p-6 border-b border-zinc-100 bg-zinc-50/50 theme-transition">
                {pubQuery.data.category && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-zinc-100 text-zinc-700 border border-zinc-200/60 rounded-lg text-[9px] font-extrabold uppercase tracking-widest mb-3">
                    <Tag size={9} /> {pubQuery.data.category}
                  </span>
                )}

                <h2 className="text-lg font-extrabold text-zinc-900 mb-2 tracking-tight leading-snug font-display">
                  {pubQuery.data.title}
                </h2>

                <p className="text-sm font-medium text-zinc-500 mb-4">
                  {pubQuery.data.authors || "Auteur principal"}
                </p>

                <div className="flex flex-wrap gap-2">
                  {pubQuery.data.session && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-white text-zinc-600 rounded-xl text-xs font-semibold border border-zinc-200">
                      <Clock size={11} className="text-theme-secondary" /> {pubQuery.data.session}
                    </span>
                  )}
                  {pubQuery.data.room && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-white text-zinc-600 rounded-xl text-xs font-semibold border border-zinc-200">
                      <MapPin size={11} className="text-theme-secondary" /> {pubQuery.data.room}
                    </span>
                  )}
                </div>
              </div>

              {/* Abstract */}
              {(pubQuery.data.abstractText || pubQuery.data.description) && (
                <div className="p-6 border-b border-zinc-100 bg-white">
                  <h4 className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-widest mb-3">Résumé Scientifique</h4>
                  <div className="max-h-[200px] overflow-y-auto pr-1">
                    <p className="text-xs text-zinc-600 leading-relaxed whitespace-pre-wrap">
                      {pubQuery.data.abstractText || pubQuery.data.description}
                    </p>
                  </div>
                </div>
              )}

              {/* Media list */}
              <div className="p-6 border-b border-zinc-100 flex-1 bg-zinc-50/50">
                <h4 className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-widest mb-3">Pièces Jointes &amp; Médias</h4>

                <div className="space-y-2">
                  {posterUrl && (
                    <button
                      onClick={() => setActiveMedia(null)}
                      className={`w-full flex items-center gap-3 p-2.5 rounded-xl border text-left transition-all ${
                        !activeMedia
                          ? 'bg-white border-zinc-300 shadow-sm font-bold text-zinc-900'
                          : 'bg-white/50 border-zinc-200 text-zinc-500 hover:bg-zinc-100'
                      }`}
                    >
                      <div className={`p-2 rounded-lg shrink-0 ${!activeMedia ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-400'}`}>
                        <FileText size={14} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold truncate">Poster Principal</p>
                        <p className="text-[9px] text-zinc-400 uppercase tracking-wider">PDF / IMAGE</p>
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
                        className={`w-full flex items-center gap-3 p-2.5 rounded-xl border text-left transition-all ${
                          isActive
                            ? 'bg-white border-zinc-300 shadow-sm font-bold text-zinc-900'
                            : 'bg-white/50 border-zinc-200 text-zinc-500 hover:bg-zinc-100'
                        }`}
                      >
                        {media.thumbnailPath ? (
                          <img
                            src={getMediaUrl(media.thumbnailPath)}
                            alt="thumb"
                            className="w-9 h-9 rounded-lg object-cover border border-zinc-200 shrink-0"
                          />
                        ) : (
                          <div className={`p-2 rounded-lg shrink-0 ${isActive ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-400'}`}>
                            {isMediaVideo ? <Video size={14} /> : <FileText size={14} />}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold truncate">{media.fileName || `Média ${idx + 1}`}</p>
                          <p className="text-[9px] text-zinc-400 uppercase tracking-wider">{media.fileType}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* QR Code */}
              {posterUrl && (
                <div className="p-5 flex items-center gap-4 bg-white border-b border-zinc-100 theme-transition">
                  <div className="p-2 bg-zinc-50 rounded-xl border border-zinc-200 shrink-0">
                    <QRCodeCanvas value={getMediaUrl(posterUrl)} size={72} level="M" fgColor="#18181b" />
                  </div>
                  <div>
                    <h4 className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-widest mb-1">Accès Mobile</h4>
                    <p className="text-xs font-semibold text-zinc-800 mb-0.5">Consulter sur smartphone</p>
                    <p className="text-[10px] text-zinc-400 leading-relaxed">Scannez pour emporter cet e-poster sur votre téléphone.</p>
                  </div>
                </div>
              )}

              {/* Navigation prev/next */}
              <div className="p-4 border-t border-zinc-100 bg-zinc-50/50 mt-auto">
                <div className="flex justify-between items-center gap-2">
                  <button
                    disabled={!prevPub}
                    onClick={() => prevPub && navigate(`/totem/publications/${prevPub.id}${buildSearchParams()}`)}
                    className="flex-1 py-2.5 px-3 bg-white hover:bg-zinc-100 border border-zinc-200 disabled:opacity-30 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 text-zinc-700 active:scale-95"
                  >
                    <ChevronLeft size={13} /> Précédent
                  </button>
                  <div className="text-xs font-bold text-zinc-400 px-2 tracking-wider font-mono">
                    {currentIndex >= 0 ? `${currentIndex + 1}/${pubsQuery.data?.totalElements || "?"}` : ""}
                  </div>
                  <button
                    disabled={!nextPub}
                    onClick={() => nextPub && navigate(`/totem/publications/${nextPub.id}${buildSearchParams()}`)}
                    style={nextPub ? { backgroundColor: 'var(--theme-primary)', color: 'var(--theme-foreground)' } : {}}
                    className="flex-1 py-2.5 px-3 hover:opacity-90 disabled:opacity-30 disabled:bg-zinc-100 disabled:text-zinc-400 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 active:scale-95 shadow-sm font-display"
                  >
                    Suivant <ChevronRight size={13} />
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
