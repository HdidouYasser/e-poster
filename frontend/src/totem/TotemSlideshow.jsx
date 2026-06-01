import { useEffect, useState, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { publicApi, getMediaUrl, getPosterThumbnail } from "../api";
import { useIdleTimer } from "../hooks/useIdleTimer";
import { X, Image as ImageIcon, Monitor, Clock, MapPin, Tag } from "lucide-react";

export default function TotemSlideshow() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const eventId = params.get("eventId") || "";
  const screen = params.get("screen") || "1";

  const [currentIndex, setCurrentIndex] = useState(0);

  const { data: pubsData } = useQuery({
    queryKey: ["totem-slideshow-pubs", eventId],
    queryFn: async () => {
      const endpoint = eventId
        ? `/publications?eventId=${eventId}&size=100`
        : `/publications?size=100`;
      return (await publicApi.get(endpoint)).data;
    }
  });

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

  const publications = useMemo(() => pubsData?.items || [], [pubsData]);

  useEffect(() => {
    if (publications.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % publications.length);
    }, 10000);
    return () => clearInterval(interval);
  }, [publications.length]);

  // Any interaction exits slideshow
  useIdleTimer({
    timeoutMs: 1000,
    onActive: () => navigate(`/totem?screen=${screen}`),
    enabled: true
  });

  // ── Loading / Empty states ──
  if (!publications.length) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center text-white font-sans gap-4">
        <ImageIcon size={40} className="text-zinc-700" />
        <p className="text-zinc-500 text-sm font-semibold">Aucune publication disponible</p>
      </div>
    );
  }

  if (!selectedEvent) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center text-white font-sans gap-4">
        <Monitor size={40} className="text-zinc-700" />
        <p className="text-zinc-500 text-sm font-semibold">Événement non trouvé</p>
        <button
          onClick={() => navigate(`/totem`)}
          className="mt-2 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-xl text-xs font-semibold transition-colors"
        >
          Retour à l'accueil
        </button>
      </div>
    );
  }

  const currentPub = publications[currentIndex];
  const categoryName = currentPub?.category
    ? (typeof currentPub.category === 'object' ? currentPub.category.name : currentPub.category)
    : "";

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col font-sans select-none">

      {/* ── Top Bar ── */}
      <header className="flex items-center justify-between px-8 py-4 bg-zinc-950 border-b border-zinc-900 shrink-0 z-20">
        <div className="flex items-center gap-3">
          {selectedEvent?.logoUrl ? (
            <img
              src={getMediaUrl(selectedEvent.logoUrl)}
              alt="logo"
              className="h-7 object-contain opacity-90"
            />
          ) : (
            <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-zinc-900 border border-zinc-800">
              <Monitor size={14} className="text-zinc-400" />
            </div>
          )}
          <span className="text-zinc-500 font-semibold text-xs tracking-wider uppercase">
            {selectedEvent?.title}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Slide counter */}
          <div className="bg-zinc-900 px-3 py-1.5 rounded-lg border border-zinc-800 font-mono text-xs">
            <span className="text-white font-bold">{currentIndex + 1}</span>
            <span className="text-zinc-600 mx-1">/</span>
            <span className="text-zinc-400">{publications.length}</span>
          </div>

          {/* Dot indicators (max 10) */}
          {publications.length <= 10 && (
            <div className="flex items-center gap-1.5">
              {publications.map((_, i) => (
                <div
                  key={i}
                  className={`rounded-full transition-all duration-300 ${
                    i === currentIndex
                      ? 'w-4 h-1.5 bg-white'
                      : 'w-1.5 h-1.5 bg-zinc-700'
                  }`}
                />
              ))}
            </div>
          )}

          <button
            onClick={() => navigate(`/totem?screen=${screen}`)}
            className="p-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-lg transition-colors text-zinc-400 hover:text-white"
          >
            <X size={15} />
          </button>
        </div>
      </header>

      {/* ── Main Slide Layout ── */}
      <main
        key={currentPub.id}
        className="flex-1 flex flex-col lg:flex-row gap-0 items-stretch animate-fade-in"
      >
        {/* Poster image — left / top */}
        <div className="w-full lg:w-1/2 bg-zinc-900 border-r border-zinc-900 flex items-center justify-center p-8 relative overflow-hidden">
          {currentPub.posterUrl ? (
            <img
              src={getPosterThumbnail(currentPub.posterUrl)}
              alt={currentPub.title}
              className="max-w-full max-h-[70vh] object-contain rounded-xl shadow-2xl ring-1 ring-white/5"
            />
          ) : (
            <div className="flex flex-col items-center gap-3 text-zinc-700">
              <ImageIcon size={64} />
              <span className="text-sm font-semibold">Aucune affiche</span>
            </div>
          )}

          {/* Subtle slide number watermark */}
          <div className="absolute bottom-4 right-4 text-zinc-800 font-mono text-[10px] font-bold tracking-wider">
            #{currentIndex + 1}
          </div>
        </div>

        {/* Poster details — right / bottom */}
        <div className="w-full lg:w-1/2 flex flex-col justify-center p-10 lg:p-14 overflow-auto">
          {/* Category badge */}
          {categoryName && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-zinc-900 border border-zinc-800 rounded-lg text-xs font-semibold mb-6 text-zinc-300 w-fit">
              <Tag size={11} className="text-zinc-500" />
              {categoryName}
            </div>
          )}

          {/* Title */}
          <h1 className="text-3xl lg:text-4xl xl:text-5xl font-bold leading-tight tracking-tight mb-5 text-white" style={{ fontFamily: "'Outfit', sans-serif" }}>
            {currentPub.title}
          </h1>

          {/* Authors */}
          <p className="text-lg lg:text-xl font-medium mb-8 text-zinc-400">
            {currentPub.authors}
          </p>

          {/* Meta info */}
          <div className="flex flex-col gap-3">
            {currentPub.session && (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0">
                  <Clock size={14} className="text-zinc-500" />
                </div>
                <span className="text-sm text-zinc-300 font-medium">Session : {currentPub.session}</span>
              </div>
            )}
            {currentPub.room && (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0">
                  <MapPin size={14} className="text-zinc-500" />
                </div>
                <span className="text-sm text-zinc-300 font-medium">Salle : {currentPub.room}</span>
              </div>
            )}
          </div>

          {/* Abstract excerpt */}
          {currentPub.abstractText && (
            <div className="mt-8 p-5 bg-zinc-900/70 border border-zinc-800 rounded-2xl">
              <p className="text-[11px] font-bold text-zinc-600 uppercase tracking-widest mb-2">Résumé</p>
              <p className="text-sm text-zinc-400 line-clamp-4 leading-relaxed">
                {currentPub.abstractText}
              </p>
            </div>
          )}

          {/* Hint */}
          <p className="mt-10 text-[11px] text-zinc-700 font-semibold tracking-wider uppercase">
            Touchez l'écran pour interagir
          </p>
        </div>
      </main>

      {/* ── Progress Bar ── */}
      <div className="fixed bottom-0 left-0 w-full h-0.5 bg-zinc-900 z-30">
        <div
          key={currentIndex}
          className="h-full bg-zinc-400"
          style={{
            width: '100%',
            animation: 'slideProgress 10s linear forwards'
          }}
        />
      </div>

      <style>{`
        @keyframes slideProgress {
          0%   { width: 0%; }
          100% { width: 100%; }
        }
      `}</style>
    </div>
  );
}
