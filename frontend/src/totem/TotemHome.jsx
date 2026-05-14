import { useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "../api";
import { Presentation, MonitorPlay, ArrowRight, Calendar, Monitor } from "lucide-react";
import { useIdleTimer } from "../hooks/useIdleTimer";

export default function TotemHome() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const screen = params.get("screen") || "1";
  const [selectedScreen, setSelectedScreen] = useState(screen);

  const activeEventQuery = useQuery({
    queryKey: ["totem-active-event"],
    queryFn: async () => (await api.get("/events/active")).data,
    retry: false
  });

  const eventsQuery = useQuery({
    queryKey: ["totem-events", 0, 20],
    queryFn: async () => (await api.get("/events?page=0&size=20")).data,
    enabled: activeEventQuery.isError
  });

  const selectedEvent = useMemo(
    () => activeEventQuery.data || eventsQuery.data?.items?.[0],
    [activeEventQuery.data, eventsQuery.data]
  );

  useIdleTimer({
    timeoutMs: 60_000,
    onIdle: () => navigate(`/totem/slideshow?eventId=${selectedEvent?.id || ""}&screen=${screen}`),
    enabled: true
  });

  const formatDate = (dateStr) => {
    if (!dateStr) return null;
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: 'numeric', month: 'long', year: 'numeric'
    });
  };

  const dynamicStyles = useMemo(() => {
    if (!selectedEvent) return {};
    return {
      '--color-primary': selectedEvent.colorPrimary || '#10b981',
      '--color-secondary': selectedEvent.colorSecondary || '#0ea5e9'
    };
  }, [selectedEvent]);

  return (
    <div className="min-h-screen text-slate-800 flex flex-col relative overflow-hidden" style={dynamicStyles}>
      {/* Dynamic background blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] blur-[120px] rounded-full pointer-events-none opacity-40" style={{ backgroundColor: selectedEvent?.colorPrimary || '#10b981' }} />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] blur-[100px] rounded-full pointer-events-none opacity-30" style={{ backgroundColor: selectedEvent?.colorSecondary || '#0ea5e9' }} />

      {/* Header - Banner if available */}
      {selectedEvent?.bannerUrl && (
        <div className="relative z-5 w-full h-32 md:h-48 overflow-hidden">
          <img
            src={selectedEvent.bannerUrl}
            alt="Event Banner"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/20" />
        </div>
      )}

      {/* Header */}
      <header className="flex items-center justify-between px-6 md:px-10 py-4 md:py-6 relative z-10 bg-white/80 backdrop-blur-md border-b shadow-sm transition-all" style={{ borderColor: `${selectedEvent?.colorPrimary}20` }}>
        <div className="flex items-center gap-3 md:gap-4">
          {selectedEvent?.logoUrl ? (
            <img
              src={selectedEvent.logoUrl}
              alt="Event Logo"
              className="h-12 md:h-16 object-contain"
            />
          ) : (
            <div 
              className="w-12 md:w-16 h-12 md:h-16 rounded-2xl flex items-center justify-center shadow-md text-white"
              style={{ backgroundColor: selectedEvent?.colorPrimary || '#10b981' }}
            >
              <Presentation size={30} />
            </div>
          )}
          <div>
            <h1 className="text-xl md:text-3xl font-extrabold tracking-tight text-slate-800">
              E-Poster <span style={{ color: selectedEvent?.colorPrimary || '#10b981' }}>Platform</span>
            </h1>
            <p className="text-xs md:text-sm text-slate-400">Système d'affichage scientifique</p>
          </div>
        </div>
        <div className="flex gap-2 md:gap-3 flex-col sm:flex-row">
          <Link
            to={`/totem/publications?screen=${selectedScreen}`}
            className="px-4 md:px-6 py-3 md:py-4 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 rounded-2xl text-sm md:text-base font-semibold transition-all flex items-center gap-2 justify-center"
          >
            Voir les Posters
          </Link>
          <button
            onClick={() => {
              const newScreen = selectedScreen === '1' ? '2' : '1';
              setSelectedScreen(newScreen);
              window.open(`${window.location.origin}/totem?screen=${newScreen}`, `totem-screen-${newScreen}`);
            }}
            className="px-4 md:px-6 py-3 md:py-4 text-white rounded-2xl text-sm md:text-base font-semibold transition-all flex items-center gap-2 justify-center shadow-md"
            style={{ backgroundColor: selectedEvent?.colorPrimary || '#10b981' }}
          >
            <Monitor size={20} /> Écran {selectedScreen === '1' ? '2' : '1'}
          </button>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 flex items-center justify-center p-6 md:p-10 relative z-10">
        <div className="max-w-3xl w-full">
          {(activeEventQuery.isLoading || eventsQuery.isLoading) ? (
            <div className="flex flex-col items-center justify-center space-y-6">
              <div className="w-16 h-16 border-4 rounded-full animate-spin" style={{ borderColor: `${selectedEvent?.colorPrimary || '#10b981'}40`, borderTopColor: selectedEvent?.colorPrimary || '#10b981' }} />
              <div className="text-lg md:text-xl text-slate-400 font-medium">Chargement de l'événement...</div>
            </div>
          ) : !selectedEvent ? (
            <div className="text-center p-8 md:p-16 bg-white border border-slate-200 rounded-3xl shadow-sm">
              <Calendar size={80} className="mx-auto text-slate-300 mb-6" />
              <h2 className="text-2xl md:text-4xl font-bold text-slate-700 mb-4">Aucun événement actif</h2>
              <p className="text-base md:text-lg text-slate-400">Veuillez configurer un événement dans l'interface d'administration.</p>
            </div>
          ) : (
            <div className="bg-white/90 backdrop-blur-xl border shadow-soft hover:shadow-2xl transition-all duration-500 rounded-[2rem] p-8 md:p-12 animate-fade-in" style={{ borderColor: `${selectedEvent?.colorPrimary}30` }}>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full font-semibold text-sm mb-6 border w-fit" style={{ backgroundColor: `${selectedEvent?.colorPrimary}15`, color: selectedEvent?.colorPrimary || '#10b981', borderColor: selectedEvent?.colorPrimary || '#10b981' }}>
                <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: selectedEvent?.colorPrimary || '#10b981' }} />
                Événement en cours
              </div>
              <h2 className="text-3xl md:text-5xl font-extrabold text-slate-800 mb-5 leading-tight">{selectedEvent.title}</h2>
              
              {(selectedEvent.startDate || selectedEvent.endDate) && (
                <div className="flex items-center gap-2 font-medium mb-6 px-4 py-3 rounded-xl border w-fit" style={{ backgroundColor: `${selectedEvent?.colorPrimary}15`, color: selectedEvent?.colorPrimary || '#10b981', borderColor: `${selectedEvent?.colorPrimary}40` }}>
                  <Calendar size={20} />
                  <span className="text-sm md:text-base">
                    {formatDate(selectedEvent.startDate)} 
                    {selectedEvent.endDate && ` - ${formatDate(selectedEvent.endDate)}`}
                  </span>
                </div>
              )}

              <p className="text-lg md:text-xl text-slate-500 mb-8 md:mb-12 leading-relaxed">{selectedEvent.description}</p>

              <button
                onClick={() => navigate(`/totem/publications?eventId=${selectedEvent.id}&screen=${selectedScreen}`)}
                className="w-full px-8 md:px-12 py-5 md:py-6 text-white rounded-2xl text-lg md:text-2xl font-bold transition-all shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] flex items-center justify-center gap-4 group hover:scale-105 hover:-translate-y-1 transform"
                style={{ backgroundColor: selectedEvent?.colorPrimary || '#10b981', boxShadow: `0 15px 40px -10px ${selectedEvent?.colorPrimary}80` }}
              >
                Voir les publications
                <ArrowRight size={28} className="group-hover:translate-x-2 transition-transform" />
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
