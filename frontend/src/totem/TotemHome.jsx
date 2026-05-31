import { useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { publicApi, getMediaUrl } from "../api";
import { Presentation, ArrowRight, Calendar, Monitor, BookOpen, HelpCircle } from "lucide-react";
import { useIdleTimer } from "../hooks/useIdleTimer";
import { useDynamicTheme } from "../hooks/useDynamicTheme";

export default function TotemHome() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const screen = params.get("screen") || "1";
  const [selectedScreen, setSelectedScreen] = useState(screen);
  const [hoveredEvent, setHoveredEvent] = useState(null);

  // Fetch all events and filter active ones in the frontend
  const eventsQuery = useQuery({
    queryKey: ["totem-all-events"],
    queryFn: async () => (await publicApi.get("/events?page=0&size=100")).data,
  });

  const activeEvents = useMemo(() => {
    const items = eventsQuery.data?.items || [];
    return items.filter(e => e.status?.toUpperCase() === "ACTIVE");
  }, [eventsQuery.data]);

  // Apply theme dynamically from hovered or first active event
  const themeEvent = hoveredEvent || activeEvents[0];
  useDynamicTheme(themeEvent?.colorPrimary, themeEvent?.logoUrl);

  const screensQuery = useQuery({
    queryKey: ["totem-screens", themeEvent?.id],
    queryFn: async () => (await publicApi.get(`/screens?eventId=${themeEvent.id}`)).data,
    enabled: !!themeEvent?.id
  });

  useIdleTimer({
    timeoutMs: 60_000,
    onIdle: () => {
      if (themeEvent?.id) {
        navigate(`/totem/slideshow?eventId=${themeEvent.id}&screen=${screen}`);
      }
    },
    enabled: !!themeEvent?.id
  });

  const formatDate = (dateStr) => {
    if (!dateStr) return null;
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: 'numeric', month: 'long', year: 'numeric'
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 text-zinc-900 font-sans relative overflow-hidden selection:bg-theme-secondary/20 selection:text-zinc-900 bg-dot-grid theme-transition">


      {/* Header */}
      <header className="relative flex items-center justify-between px-8 py-6 bg-white/40 backdrop-blur-md border-b border-zinc-200/60 z-10 shadow-sm theme-transition">
        <div className="flex items-center gap-4">
          {themeEvent?.logoUrl ? (
            <img src={getMediaUrl(themeEvent.logoUrl)} alt="Event Logo" className="h-12 object-contain bg-white p-1.5 rounded-xl border border-zinc-200 shadow-sm" />
          ) : (
            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-white border border-zinc-200 text-theme-secondary shadow-sm theme-transition">
              <Presentation size={24} />
            </div>
          )}
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 flex items-center gap-2 font-display">
              Plateforme <span className="text-theme-secondary theme-transition">E-Poster</span>
            </h1>
            <p className="text-xs text-zinc-500 font-medium">Borne tactile interactive</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {screensQuery.data && screensQuery.data.length > 0 ? (
            <div className="flex bg-zinc-100/80 p-1 rounded-xl border border-zinc-200/60 gap-1 theme-transition">
              {screensQuery.data.map(s => (
                <button
                  key={s.id}
                  onClick={() => {
                    setSelectedScreen(String(s.id));
                    window.open(`${window.location.origin}/totem?screen=${s.id}`, `totem-screen-${s.id}`);
                  }}
                  style={selectedScreen === String(s.id) ? { backgroundColor: 'var(--theme-primary)', color: 'var(--theme-foreground)' } : {}}
                  className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all theme-transition ${selectedScreen === String(s.id) ? 'shadow-md' : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-200/40'}`}
                >
                  <Monitor size={14} /> {s.name}
                </button>
              ))}
            </div>
          ) : (
            <button
              onClick={() => {
                const newScreen = selectedScreen === '1' ? '2' : '1';
                setSelectedScreen(newScreen);
                window.open(`${window.location.origin}/totem?screen=${newScreen}`, `totem-screen-${newScreen}`);
              }}
              className="px-4 py-2 bg-white hover:bg-zinc-50 text-zinc-600 border border-zinc-200 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-sm transition-all"
            >
              <Monitor size={14} /> Écran {selectedScreen === '1' ? '2' : '1'}
            </button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 sm:p-12 z-10 max-w-7xl mx-auto w-full">
        {eventsQuery.isLoading ? (
          <div className="flex flex-col items-center justify-center space-y-4 animate-fade-in py-20">
            <div className="w-10 h-10 border-4 border-zinc-200 border-t-theme-secondary rounded-full animate-spin" />
            <p className="text-sm text-zinc-500 font-semibold tracking-wide">Chargement des congrès...</p>
          </div>
        ) : activeEvents.length === 0 ? (
          <div className="max-w-md w-full text-center p-10 bg-white/80 backdrop-blur-lg border border-zinc-200/60 rounded-3xl shadow-xl animate-fade-in">
            <Calendar size={64} className="mx-auto text-zinc-300 mb-6" />
            <h2 className="text-2xl font-bold text-zinc-900 mb-3 font-display">Aucun événement actif</h2>
            <p className="text-sm text-zinc-550 mb-8 leading-relaxed">
              Il n'y a actuellement aucun événement configuré en statut actif pour le totem.
            </p>
            <Link 
              to="/login"
              className="inline-flex items-center gap-2 px-6 py-3 bg-zinc-100 hover:bg-zinc-200 border border-zinc-200 rounded-xl text-sm font-semibold transition-all hover:scale-105 shadow-sm"
            >
              Accéder à l'Administration
            </Link>
          </div>
        ) : (
          <div className="w-full flex flex-col items-center">
            {/* Catchy intro */}
            <div className="text-center mb-12 animate-fade-in">
              <span className="px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase bg-theme-secondary/15 text-theme-secondary border border-theme-secondary/20 mb-4 inline-block theme-transition">
                Sessions Actives
              </span>
              <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-zinc-900 mb-4 font-display">
                Sélectionnez un événement
              </h2>
              <p className="text-sm sm:text-base text-zinc-500 max-w-lg mx-auto font-medium">
                Touchez un événement ci-dessous pour explorer ses communications et posters scientifiques interactifs.
              </p>
            </div>

            {/* Dynamic Grid of Active Events */}
            <div className={`grid gap-8 w-full justify-center ${activeEvents.length === 1 ? 'max-w-xl grid-cols-1' : activeEvents.length === 2 ? 'max-w-4xl grid-cols-1 md:grid-cols-2' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
              {activeEvents.map((event) => {
                const isCurrentTheme = themeEvent?.id === event.id;
                return (
                  <div
                    key={event.id}
                    onMouseEnter={() => setHoveredEvent(event)}
                    onMouseLeave={() => setHoveredEvent(null)}
                    onClick={() => navigate(`/totem/publications?eventId=${event.id}&screen=${selectedScreen}`)}
                    className={`relative rounded-3xl overflow-hidden border transition-all duration-500 cursor-pointer flex flex-col group theme-transition ${
                      isCurrentTheme 
                        ? 'border-theme-primary/30 shadow-[0_20px_50px_-15px_rgba(var(--theme-primary-rgb),0.12)] scale-[1.02] bg-white/90' 
                        : 'border-zinc-200/60 bg-white/40 hover:bg-white/60 hover:border-zinc-300 shadow-sm'
                    }`}
                  >
                    {/* Event Banner background */}
                    <div className="h-32 w-full bg-zinc-100 relative overflow-hidden border-b border-zinc-200/60 theme-transition">
                      {event.bannerUrl ? (
                        <img 
                          src={getMediaUrl(event.bannerUrl)} 
                          alt="Banner" 
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-80" 
                        />
                      ) : (
                        <div className="w-full h-full bg-zinc-100 flex items-center justify-center">
                          <Presentation size={36} className="text-zinc-300" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-white/40" />
                      
                      {/* Logo positioned floating */}
                      <div className="absolute bottom-4 left-6 flex items-end gap-3">
                        {event.logoUrl ? (
                          <img 
                            src={getMediaUrl(event.logoUrl)} 
                            alt="Logo" 
                            className="h-14 w-14 object-contain bg-white rounded-2xl p-1.5 shadow-md border border-zinc-200 shrink-0" 
                          />
                        ) : (
                          <div className="h-14 w-14 bg-zinc-50 rounded-2xl flex items-center justify-center shadow-md border border-zinc-200 text-zinc-500 font-bold text-sm shrink-0">
                            {event.title ? event.title.substring(0, 2).toUpperCase() : "EV"}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="p-6 flex-1 flex flex-col justify-between">
                      <div>
                        {/* Dates */}
                        {(event.startDate || event.endDate) && (
                          <div className="flex items-center gap-1.5 text-zinc-400 mb-3 text-xs font-semibold">
                            <Calendar size={12} className="text-theme-secondary theme-transition" />
                            <span>{formatDate(event.startDate)}</span>
                            {event.endDate && (
                              <>
                                <span>&mdash;</span>
                                <span>{formatDate(event.endDate)}</span>
                              </>
                            )}
                          </div>
                        )}

                        {/* Title */}
                        <h3 className="text-lg sm:text-xl font-bold text-zinc-900 mb-2 tracking-tight group-hover:text-theme-secondary transition-colors duration-300 font-display theme-transition">
                          {event.title}
                        </h3>

                        {/* Description */}
                        <p className="text-xs text-zinc-550 mb-6 line-clamp-3 leading-relaxed">
                          {event.description || "Aucune description fournie."}
                        </p>
                      </div>

                      {/* QR Access section */}
                      <div className="space-y-3 pt-4 border-t border-zinc-200/60 theme-transition">
                        {(event.programUrl || event.revueUrl) ? (
                          <div className="grid grid-cols-2 gap-3">
                            {event.programUrl && (
                              <div 
                                onClick={(e) => e.stopPropagation()} 
                                className="flex items-center gap-2 bg-zinc-50/50 p-2 rounded-xl border border-zinc-200/60 theme-transition"
                              >
                                <img 
                                  src={`https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=${encodeURIComponent(event.programUrl)}`} 
                                  alt="QR Program" 
                                  className="w-10 h-10 bg-white p-1 rounded-lg shrink-0 border border-zinc-200/50"
                                />
                                <div className="min-w-0">
                                  <h4 className="text-[9px] font-extrabold text-theme-primary uppercase tracking-wider theme-transition">Programme</h4>
                                  <p className="text-[8px] text-zinc-450 truncate">Scanner PDF</p>
                                </div>
                              </div>
                            )}
                            {event.revueUrl && (
                              <div 
                                onClick={(e) => e.stopPropagation()} 
                                className="flex items-center gap-2 bg-zinc-50/50 p-2 rounded-xl border border-zinc-200/60 theme-transition"
                              >
                                <img 
                                  src={`https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=${encodeURIComponent(event.revueUrl)}`} 
                                  alt="QR Revue" 
                                  className="w-10 h-10 bg-white p-1 rounded-lg shrink-0 border border-zinc-200/50"
                                />
                                <div className="min-w-0">
                                  <h4 className="text-[9px] font-extrabold text-theme-primary uppercase tracking-wider theme-transition">La Revue</h4>
                                  <p className="text-[8px] text-zinc-450 truncate">Scanner Journal</p>
                                </div>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-[10px] text-zinc-400 py-1.5 font-semibold italic justify-center bg-zinc-50/50 rounded-xl border border-zinc-200/45 theme-transition">
                            <HelpCircle size={10} /> QR codes non disponibles
                          </div>
                        )}

                        {/* CTA button */}
                        <button
                          style={{ backgroundColor: 'var(--theme-primary)', color: 'var(--theme-foreground)' }}
                          className="w-full mt-2 py-3 px-4 hover:opacity-90 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md group-hover:scale-[1.02] theme-transition font-display"
                        >
                          Accéder aux publications
                          <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="relative py-6 text-center text-xs text-zinc-450 border-t border-zinc-200/60 bg-white/30 z-10 shrink-0 theme-transition">
        <p>&copy; 2026 AMPIIC. Plateforme Digitale Interactive. Tous droits réservés.</p>
      </footer>
    </div>
  );
}
