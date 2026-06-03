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
      <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center text-zinc-900 font-sans gap-4">
        <ImageIcon size={48} className="text-zinc-300" />
        <p className="text-zinc-600 font-semibold">Aucune publication disponible</p>
        <button
          onClick={() => navigate(`/totem?screen=${screen}`)}
          className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition-all shadow-md"
        >
          Retour à l'accueil
        </button>
      </div>
    );
  }

  if (!selectedEvent) {
    return (
      <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center text-zinc-900 font-sans gap-4">
        <Monitor size={48} className="text-zinc-300" />
        <p className="text-zinc-600 font-semibold">Événement non trouvé</p>
        <button
          onClick={() => navigate(`/totem?screen=${screen}`)}
          className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition-all shadow-md"
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
    <div className="min-h-screen bg-white text-zinc-900 flex flex-col font-sans">
      {/* ── Top Bar ── */}
      <header className="flex items-center justify-between px-8 py-4 bg-white border-b border-zinc-200 z-20 shrink-0 shadow-sm">
        <div className="flex items-center gap-4">
          {selectedEvent?.logoUrl ? (
            <img src={getMediaUrl(selectedEvent.logoUrl)} alt="logo" className="h-10 object-contain" />
          ) : (
            <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-blue-600 text-white">
              <Monitor size={16} />
            </div>
          )}
          <div>
            <h1 className="text-sm font-bold text-zinc-900">Diaporama</h1>
            <p className="text-xs text-zinc-500">{selectedEvent?.title || "En direct"}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-zinc-100 rounded-lg border border-zinc-200 text-sm font-semibold text-zinc-700">
            {currentIndex + 1} / {publications.length}
          </div>
          <button 
            onClick={() => navigate(`/totem?screen=${screen}`)}
            className="p-2 hover:bg-zinc-100 rounded-lg transition-all border border-zinc-200"
            title="Quitter le diaporama"
          >
            <X size={18} />
          </button>
        </div>
      </header>

      {/* ── Main Content ── */}
      <main className="flex-1 flex flex-col lg:flex-row gap-8 lg:gap-12 items-center justify-center p-8 w-full max-w-6xl mx-auto">
        
        {/* Poster Display */}
        <div className="w-full lg:w-2/3 flex items-center justify-center">
          <div className="w-full aspect-[3/4] bg-white border-2 border-zinc-200 rounded-2xl overflow-hidden flex items-center justify-center shadow-lg">
            {currentPub?.posterUrl ? (
              <img 
                src={getMediaUrl(currentPub.posterUrl)} 
                alt={currentPub?.title} 
                className="w-full h-full object-contain" 
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full space-y-4 text-zinc-400">
                <ImageIcon size={64} className="opacity-50" />
                <p>Pas d'image disponible</p>
              </div>
            )}
          </div>
        </div>

        
        {/* Publication Info & Controls */}
        <div className="w-full lg:w-1/3 flex flex-col gap-6">
           {categoryName && (
             <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-100 border border-blue-300 rounded-full text-xs font-semibold text-blue-700 w-fit">
               {categoryName}
             </div>
           )}

           <h2 className="text-2xl lg:text-3xl font-bold leading-tight tracking-tight mb-3 text-zinc-900">
             {currentPub?.title}
           </h2>
           
           {currentPub?.authors && (
             <p className="text-base lg:text-lg font-medium mb-6 text-zinc-600">
               par {currentPub.authors}
             </p>
           )}

           {/* Info items */}
           <div className="flex flex-col gap-3 mb-8 py-4 border-t border-b border-zinc-200">
             {currentPub?.session && (
               <div className="flex items-center gap-3 text-sm">
                 <span className="font-semibold text-zinc-900 min-w-20">Session :</span>
                 <span className="text-zinc-600">{currentPub.session}</span>
               </div>
             )}
             {currentPub?.room && (
               <div className="flex items-center gap-3 text-sm">
                 <span className="font-semibold text-zinc-900 min-w-20">Salle :</span>
                 <span className="text-zinc-600">{currentPub.room}</span>
               </div>
             )}
           </div>

           {/* Playback Controls */}
           <div className="flex items-center gap-3 mb-4">
             <button
               onClick={() => setIsPlaying(!isPlaying)}
               className="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all shadow-md"
             >
               {isPlaying ? <Pause size={20} /> : <Play size={20} className="fill-current" />}
             </button>
             <span className="text-xs font-semibold text-zinc-600">
               {isPlaying ? "En lecture" : "Pause"}
             </span>
           </div>

           {/* Speed Control */}
           <div className="flex gap-2 flex-wrap">
             {[5000, 10000, 15000, 20000].map(duration => (
               <button
                 key={duration}
                 onClick={() => setSpeed(duration)}
                 className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                   speed === duration
                     ? "bg-blue-600 text-white shadow-md"
                     : "bg-zinc-100 hover:bg-zinc-200 text-zinc-700 border border-zinc-200"
                 }`}
               >
                 {duration / 1000}s
               </button>
             ))}
           </div>

           {/* Navigation */}
           <div className="flex gap-2 mt-4">
             <button
               onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
               className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 border border-zinc-200 text-zinc-700 rounded-lg text-sm font-semibold transition-all"
             >
               <SkipBack size={16} className="inline mr-1" /> Précédent
             </button>
             <button
               onClick={() => setCurrentIndex(Math.min(publications.length - 1, currentIndex + 1))}
               className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 border border-zinc-200 text-zinc-700 rounded-lg text-sm font-semibold transition-all"
             >
               Suivant <SkipForward size={16} className="inline ml-1" />
             </button>
           </div>
        </div>
      </main>
      
      {/* ── Progress Bar ── */}
      <div className="w-full h-1 bg-zinc-200">
        <div 
          className="h-full bg-blue-600 transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / publications.length) * 100}%` }}
        />
      </div>
      
      <style>{`
        @keyframes progress {
          0% { width: 0%; }
          100% { width: 100%; }
        }
      `}</style>
    </div>
  );
}
