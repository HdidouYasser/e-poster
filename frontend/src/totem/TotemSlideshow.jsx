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

  // If user interacts, exit slideshow
  useIdleTimer({
    timeoutMs: 1000,
    onActive: () => navigate(`/totem?screen=${screen}`),
    enabled: true
  });

  if (!publications.length) {
    return (
      <div className="h-screen bg-zinc-50 flex flex-col items-center justify-center text-zinc-900 font-sans gap-4 overflow-hidden">
        <ImageIcon size={44} className="text-zinc-300" />
        <p className="text-sm text-zinc-600 font-bold">Aucune publication disponible</p>
        <button
          onClick={() => navigate(`/totem?screen=${screen}`)}
          className="totem-cta-btn"
        >
          Retour à l'accueil
        </button>
      </div>
    );
  }

  if (!selectedEvent) {
    return (
      <div className="h-screen bg-zinc-50 flex flex-col items-center justify-center text-zinc-900 font-sans gap-4 overflow-hidden">
        <Monitor size={44} className="text-zinc-300" />
        <p className="text-sm text-zinc-600 font-bold">Événement non trouvé</p>
        <button
          onClick={() => navigate(`/totem?screen=${screen}`)}
          className="totem-cta-btn"
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
    <div className="h-screen bg-white text-zinc-900 flex flex-col font-sans overflow-hidden">
      {/* ── Top Bar ── */}
      <header className="flex items-center justify-between px-10 py-4 bg-white border-b-[1.5px] border-zinc-200 z-20 shrink-0" style={{ boxShadow: 'var(--totem-shadow)' }}>
        <div className="flex items-center gap-4">
          {selectedEvent?.logoUrl ? (
            <img src={getMediaUrl(selectedEvent.logoUrl)} alt="logo" className="h-11 object-contain" />
          ) : (
            <div className="w-11 h-11 rounded-xl flex items-center justify-center text-white" style={{ backgroundColor: 'var(--theme-primary)' }}>
              <Monitor size={16} />
            </div>
          )}
          <div>
            <h1 className="text-sm font-bold text-zinc-900 font-display">Diaporama</h1>
            <p className="text-xs text-zinc-500 mt-0.5 font-medium">{selectedEvent?.title || "En direct"}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-zinc-100 rounded-xl border border-zinc-200 text-sm font-bold text-zinc-700 font-mono">
            {currentIndex + 1} / {publications.length}
          </div>
          <button 
            onClick={() => navigate(`/totem?screen=${screen}`)}
            className="p-2.5 hover:bg-zinc-100 rounded-xl transition-all border border-zinc-200"
            style={{ boxShadow: 'var(--totem-shadow)' }}
            title="Quitter le diaporama"
          >
            <X size={16} />
          </button>
        </div>
      </header>

      {/* ── Main Content ── */}
      <main className="flex-1 flex flex-col lg:flex-row gap-10 lg:gap-12 items-center justify-center p-10 w-full max-w-6xl mx-auto">
        
        {/* Poster Display */}
        <div className="w-full lg:w-2/3 flex items-center justify-center">
          <div className="w-full aspect-[3/4] bg-white border-[1.5px] border-zinc-200 rounded-2xl overflow-hidden flex items-center justify-center" style={{ boxShadow: 'var(--totem-shadow-elevated)' }}>
            {currentPub?.posterUrl ? (
              <img 
                src={getMediaUrl(currentPub.posterUrl)} 
                alt={currentPub?.title} 
                className="w-full h-full object-contain" 
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full space-y-4 text-zinc-400">
                <ImageIcon size={56} className="opacity-50" />
                <p className="text-sm font-medium">Pas d'image disponible</p>
              </div>
            )}
          </div>
        </div>

        
        {/* Publication Info & Controls */}
        <div className="w-full lg:w-1/3 flex flex-col gap-6">
           {categoryName && (
             <span className="totem-badge totem-badge-primary w-fit">
               {categoryName}
             </span>
           )}

           <h2 className="text-2xl lg:text-3xl font-bold leading-tight tracking-tight mb-2 text-zinc-900 font-display">
             {currentPub?.title}
           </h2>
           
           {currentPub?.authors && (
             <p className="text-base lg:text-lg font-medium mb-4 text-zinc-500">
               par {currentPub.authors}
             </p>
           )}

           {/* Info items */}
           <div className="flex flex-col gap-3 mb-6 py-4 border-t border-b border-zinc-200">
             {currentPub?.session && (
               <div className="flex items-center gap-3 text-sm">
                 <span className="font-bold text-zinc-900 min-w-20">Session :</span>
                 <span className="text-zinc-600 font-medium">{currentPub.session}</span>
               </div>
             )}
             {currentPub?.room && (
               <div className="flex items-center gap-3 text-sm">
                 <span className="font-bold text-zinc-900 min-w-20">Salle :</span>
                 <span className="text-zinc-600 font-medium">{currentPub.room}</span>
               </div>
             )}
           </div>

           {/* Playback Controls */}
           <div className="flex items-center gap-3 mb-4">
             <button
               onClick={() => setIsPlaying(!isPlaying)}
               className="p-3.5 text-white rounded-xl transition-all active:scale-95"
               style={{ backgroundColor: 'var(--theme-primary)', color: 'var(--theme-foreground)', boxShadow: 'var(--totem-shadow)' }}
             >
               {isPlaying ? <Pause size={20} /> : <Play size={20} className="fill-current" />}
             </button>
             <span className="text-xs font-bold text-zinc-600">
               {isPlaying ? "En lecture" : "Pause"}
             </span>
           </div>

           {/* Speed Control */}
           <div className="segmented-control mt-1 theme-transition">
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
           <div className="flex gap-3 mt-4">
             <button
               onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
               className="totem-page-btn flex-1 justify-center"
             >
               <SkipBack size={14} /> Précédent
             </button>
             <button
               onClick={() => setCurrentIndex(Math.min(publications.length - 1, currentIndex + 1))}
               className="totem-page-btn flex-1 justify-center"
             >
               Suivant <SkipForward size={14} />
             </button>
           </div>
        </div>
      </main>
      
      {/* ── Progress Bar ── */}
      <div className="w-full h-1 bg-zinc-200">
        <div 
          className="h-full transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / publications.length) * 100}%`, backgroundColor: 'var(--theme-primary)' }}
        />
      </div>
    </div>
  );
}
