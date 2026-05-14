import { useEffect, useState, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "../api";
import { useIdleTimer } from "../hooks/useIdleTimer";
import { X, Image as ImageIcon } from "lucide-react";

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
      return (await api.get(endpoint)).data;
    }
  });

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
      <div className="min-h-screen bg-black flex items-center justify-center text-white">
        <p>Chargement du diaporama...</p>
      </div>
    );
  }

  const currentPub = publications[currentIndex];

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden flex flex-col items-center justify-center p-8">
      <button 
        onClick={() => navigate(`/totem?screen=${screen}`)}
        className="absolute top-8 right-8 bg-white/10 hover:bg-white/20 p-4 rounded-full transition-all z-50"
      >
        <X size={32} />
      </button>

      <div className="flex-1 w-full flex flex-col md:flex-row gap-8 max-w-7xl items-center animate-fade-in transition-opacity duration-1000">
        <div className="w-full md:w-1/2 aspect-[3/4] bg-slate-900 rounded-3xl overflow-hidden shadow-2xl flex items-center justify-center">
           {currentPub.posterUrl ? (
             <img src={currentPub.posterUrl} alt={currentPub.title} className="w-full h-full object-contain" />
           ) : (
             <ImageIcon size={100} className="text-slate-700" />
           )}
        </div>
        <div className="w-full md:w-1/2 space-y-6 text-center md:text-left">
           <h1 className="text-4xl md:text-6xl font-extrabold leading-tight">{currentPub.title}</h1>
           <p className="text-xl md:text-3xl text-emerald-400">{currentPub.authors}</p>
           {currentPub.category && (
             <span className="inline-block px-6 py-2 bg-white/10 rounded-full text-lg">
               {currentPub.category.name}
             </span>
           )}
        </div>
      </div>
      
      {/* Progress Bar */}
      <div className="absolute bottom-0 left-0 w-full h-2 bg-slate-800">
        <div 
          className="h-full bg-emerald-500 transition-all duration-[10000ms] ease-linear"
          style={{ width: '100%', animation: 'progress 10s linear infinite' }}
        />
      </div>
      
      <style>{`
        @keyframes progress {
          0% { width: 0%; }
          100% { width: 100%; }
        }
        .animate-fade-in {
          animation: fadeIn 1s ease-in-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
