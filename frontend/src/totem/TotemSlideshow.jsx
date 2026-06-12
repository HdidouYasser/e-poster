import { useEffect, useState, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { publicApi, getMediaUrl } from "../api";
import { useIdleTimer } from "../hooks/useIdleTimer";
import { X, Image as ImageIcon, Monitor, Play, Pause, SkipBack, SkipForward } from "lucide-react";
import { useDynamicTheme } from "../hooks/useDynamicTheme";

export default function TotemSlideshow() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const eventId = params.get("eventId") || "";
  const screen = params.get("screen") || "1";

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [speed, setSpeed] = useState(10000);

  const { data: pubsData } = useQuery({
    queryKey: ["totem-slideshow-pubs", eventId],
    queryFn: async () => {
      const endpoint = eventId ? `/publications?eventId=${eventId}&size=100` : `/publications?size=100`;
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

  useDynamicTheme(selectedEvent?.colorPrimary, selectedEvent?.logoUrl);

  const publications = useMemo(() => pubsData?.items || [], [pubsData]);

  useEffect(() => {
    if (publications.length === 0 || !isPlaying) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % publications.length);
    }, speed);
    return () => clearInterval(interval);
  }, [publications.length, isPlaying, speed]);

  useIdleTimer({
    timeoutMs: 1000,
    onActive: () => navigate(`/totem?screen=${screen}`),
    enabled: true
  });

  if (!publications.length) {
    return (
      <div className="h-screen bg-white flex flex-col items-center justify-center text-zinc-900 font-sans gap-3 overflow-hidden">
        <ImageIcon size={36} className="text-zinc-300" />
        <p className="text-xs text-zinc-500 font-semibold">Aucune publication disponible</p>
        <button onClick={() => navigate(`/totem?screen=${screen}`)} className="totem-cta-btn">
          Retour à l'accueil
        </button>
      </div>
    );
  }

  if (!selectedEvent) {
    return (
      <div className="h-screen bg-white flex flex-col items-center justify-center text-zinc-900 font-sans gap-3 overflow-hidden">
        <Monitor size={36} className="text-zinc-300" />
        <p className="text-xs text-zinc-500 font-semibold">Événement non trouvé</p>
        <button onClick={() => navigate(`/totem?screen=${screen}`)} className="totem-cta-btn">
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
    <div className="h-screen bg-zinc-50/60 text-zinc-900 flex flex-col font-sans overflow-hidden relative">
      {/* Blurred background banner */}
      {selectedEvent?.bannerUrl && (
        <div
          className="absolute inset-0 bg-cover bg-center filter blur-3xl opacity-15 scale-110 pointer-events-none z-0"
          style={{ backgroundImage: `url(${getMediaUrl(selectedEvent.bannerUrl)})` }}
        />
      )}

      {/* Top Bar */}
      <header className="flex items-center justify-between px-8 py-3 bg-white/80 backdrop-blur-md border-b border-zinc-100 z-20 shrink-0">
        <div className="flex items-center gap-3">
          {selectedEvent?.logoUrl ? (
            <img src={getMediaUrl(selectedEvent.logoUrl)} alt="logo" className="h-9 object-contain" />
          ) : (
            <div className="w-9 h-9 rounded-lg flex items-center justify-center text-white" style={{ backgroundColor: 'var(--theme-primary)' }}>
              <Monitor size={14} />
            </div>
          )}
          <div>
            <h1 className="text-xs font-bold text-zinc-900 font-display">Diaporama</h1>
            <p className="text-[10px] text-zinc-400 mt-0.5">{selectedEvent?.title || "En direct"}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 bg-zinc-50 rounded-lg border border-zinc-200 text-[11px] font-bold text-zinc-600 font-mono">
            {currentIndex + 1} / {publications.length}
          </div>
          <button
            onClick={() => navigate(`/totem?screen=${screen}`)}
            className="p-2 hover:bg-zinc-50 rounded-lg transition-all border border-zinc-200"
            title="Quitter le diaporama"
          >
            <X size={14} />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col lg:flex-row gap-8 lg:gap-10 items-center justify-center p-8 w-full max-w-5xl mx-auto z-10">

        {/* Poster Display */}
        <div className="w-full lg:w-2/3 flex items-center justify-center">
          <div
            key={currentPub?.id}
            className="w-full aspect-[3/4] bg-white border border-zinc-200 rounded-2xl shadow-lg overflow-hidden flex items-center justify-center animate-fade-in"
          >
            {currentPub?.posterUrl ? (
              <img
                src={getMediaUrl(currentPub.posterUrl)}
                alt={currentPub?.title}
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full space-y-3 text-zinc-400">
                <ImageIcon size={40} className="opacity-50" />
                <p className="text-xs font-medium">Pas d'image disponible</p>
              </div>
            )}
          </div>
        </div>

        {/* Info & Controls */}
        <div className="w-full lg:w-1/3 flex flex-col justify-between h-full py-4 min-h-[300px]">
          <div key={currentPub?.id} className="animate-fade-in flex flex-col gap-4">
            {categoryName && (
              <span className="totem-badge totem-badge-primary w-fit">
                {categoryName}
              </span>
            )}

            <h2 className="text-lg lg:text-xl font-bold leading-tight tracking-tight text-zinc-900 font-display line-clamp-4">
              {currentPub?.title}
            </h2>

            {currentPub?.authors && (
              <p className="text-xs text-zinc-500 font-medium line-clamp-2">
                par {currentPub.authors}
              </p>
            )}

            {/* Info items */}
            <div className="flex flex-col gap-2.5 py-3 border-t border-b border-zinc-100">
              {currentPub?.session && (
                <div className="flex items-center gap-2.5 text-xs">
                  <span className="font-bold text-zinc-700 min-w-16">Session :</span>
                  <span className="text-zinc-500">{currentPub.session}</span>
                </div>
              )}
              {currentPub?.room && (
                <div className="flex items-center gap-2.5 text-xs">
                  <span className="font-bold text-zinc-700 min-w-16">Salle :</span>
                  <span className="text-zinc-500">{currentPub.room}</span>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4 mt-auto">
            {/* Playback Controls */}
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="p-2.5 text-white rounded-lg transition-all active:scale-95"
                style={{ backgroundColor: 'var(--theme-primary)', color: 'var(--theme-foreground)' }}
              >
                {isPlaying ? <Pause size={14} /> : <Play size={14} className="fill-current" />}
              </button>
              <span className="text-[10px] font-semibold text-zinc-500">
                {isPlaying ? "En lecture" : "Pause"}
              </span>
            </div>

            {/* Speed Control */}
            <div className="segmented-control mt-0.5">
              {[5000, 10000, 15000, 20000].map(duration => {
                const isActive = speed === duration;
                return (
                  <button
                    key={duration}
                    onClick={() => setSpeed(duration)}
                    style={isActive ? { backgroundColor: 'var(--theme-primary)', color: 'var(--theme-foreground)' } : {}}
                    className={`segmented-item ${isActive ? 'active' : ''}`}
                  >
                    {duration / 1000}s
                  </button>
                );
              })}
            </div>

            {/* Navigation */}
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
                className="totem-page-btn flex-1 justify-center py-2"
              >
                <SkipBack size={12} /> Précédent
              </button>
              <button
                onClick={() => setCurrentIndex(Math.min(publications.length - 1, currentIndex + 1))}
                className="totem-page-btn flex-1 justify-center py-2"
              >
                Suivant <SkipForward size={12} />
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Progress Bar */}
      <div className="w-full h-0.5 bg-zinc-100">
        <div
          className="h-full transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / publications.length) * 100}%`, backgroundColor: 'var(--theme-primary)' }}
        />
      </div>
    </div>
  );
}