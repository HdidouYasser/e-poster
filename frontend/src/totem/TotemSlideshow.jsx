import { useEffect, useState, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { publicApi } from "../api";
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

  const cp = selectedEvent?.colorPrimary || '#ffffff';

  const publications = useMemo(() => pubsData?.items || [], [pubsData]);

  useEffect(() => {
    if (publications.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % publications.length);
    }, 10000); // 10 seconds per slide
    return () => clearInterval(interval);
  }, [publications.length]);

  // If user interacts, exit slideshow
  useIdleTimer({
    timeoutMs: 1000,
    onActive: () => navigate(`/totem?screen=${screen}`),
    enabled: true
  });

  if (!publications.length) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center text-white font-sans">
        <div className="w-8 h-8 border-2 border-zinc-800 rounded-full animate-spin mb-4" style={{ borderTopColor: cp }} />
        <p className="text-zinc-500 text-sm font-medium">Chargement du diaporama...</p>
      </div>
    );
  }

  const currentPub = publications[currentIndex];
  const categoryName = typeof currentPub.category === 'object' ? currentPub.category.name : currentPub.category;

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col p-8 font-sans transition-opacity duration-500">
      
      {/* ── Top Bar ── */}
      <header className="flex items-center justify-between z-20 shrink-0">
        <div className="flex items-center gap-3">
          {selectedEvent?.logoUrl ? (
            <img src={selectedEvent.logoUrl} alt="logo" className="h-6 object-contain" />
          ) : (
            <div className="w-6 h-6 rounded flex items-center justify-center bg-zinc-800">
              <Monitor size={12} className="text-white" />
            </div>
          )}
          <span className="text-zinc-400 font-semibold text-xs tracking-wider uppercase">{selectedEvent?.title}</span>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="bg-zinc-900 px-3 py-1.5 rounded-md border border-zinc-800 text-zinc-400 font-mono text-xs font-semibold">
            <span className="text-white">{currentIndex + 1}</span> / {publications.length}
          </div>
          <button 
            onClick={() => navigate(`/totem?screen=${screen}`)}
            className="p-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-md transition-colors text-zinc-400 hover:text-white"
          >
            <X size={16} />
          </button>
        </div>
      </header>

      {/* ── Main Layout ── */}
      <main key={currentPub.id} className="flex-1 flex flex-col lg:flex-row gap-12 lg:gap-20 items-center justify-center animate-fade-in w-full max-w-7xl mx-auto my-12">
        
        {/* Poster Image */}
        <div className="w-full lg:w-1/2 aspect-[3/4] bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden flex items-center justify-center p-2 relative">
           {currentPub.posterUrl ? (
             <img 
               src={currentPub.posterUrl} 
               alt={currentPub.title} 
               className="w-full h-full object-contain" 
             />
           ) : (
             <ImageIcon size={64} className="text-zinc-800" />
           )}
        </div>
        
        {/* Poster Details */}
        <div className="w-full lg:w-1/2 flex flex-col items-start text-left">
           {categoryName && (
             <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-zinc-900 border border-zinc-800 rounded-md text-xs font-semibold mb-6 text-zinc-300">
               <Tag size={12} />
               {categoryName}
             </div>
           )}

           <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight tracking-tight mb-6 text-white">
             {currentPub.title}
           </h1>
           
           <p className="text-xl lg:text-2xl font-medium mb-12 text-zinc-400">
             {currentPub.authors}
           </p>

           <div className="flex flex-col gap-4">
             {currentPub.session && (
               <div className="flex items-center gap-3">
                 <Clock size={16} className="text-zinc-500" />
                 <span className="text-sm font-medium text-zinc-300">Session : {currentPub.session}</span>
               </div>
             )}
             {currentPub.room && (
               <div className="flex items-center gap-3">
                 <MapPin size={16} className="text-zinc-500" />
                 <span className="text-sm font-medium text-zinc-300">Salle : {currentPub.room}</span>
               </div>
             )}
           </div>
        </div>
      </main>
      
      {/* ── Progress Bar ── */}
      <div className="fixed bottom-0 left-0 w-full h-1 bg-zinc-900">
        <div 
          key={currentIndex}
          className="h-full bg-white"
          style={{ 
            width: '100%', 
            animation: 'progress 10s linear forwards' 
          }}
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
