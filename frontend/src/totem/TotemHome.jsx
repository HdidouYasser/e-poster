import { useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { publicApi, getMediaUrl } from "../api";
import { Presentation, ArrowRight, Calendar, Monitor, HelpCircle, Sparkles, Search, Smartphone, Play } from "lucide-react";
import { useIdleTimer } from "../hooks/useIdleTimer";
import { useDynamicTheme } from "../hooks/useDynamicTheme";

export default function TotemHome() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const screen = params.get("screen") || "1";
  const [selectedScreen, setSelectedScreen] = useState(screen);
  const [hoveredEvent, setHoveredEvent] = useState(null);
  const [showWelcome, setShowWelcome] = useState(true);

  const eventsQuery = useQuery({
    queryKey: ["totem-all-events"],
    queryFn: async () => (await publicApi.get("/events?page=0&size=100")).data,
  });

  const activeEvents = useMemo(() => {
    const items = eventsQuery.data?.items || [];
    return items.filter(e => e.status?.toUpperCase() === "ACTIVE");
  }, [eventsQuery.data]);

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
      } else {
        setShowWelcome(true);
      }
    },
    enabled: true
  });

  const formatDate = (dateStr) => {
    if (!dateStr) return null;
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: 'numeric', month: 'long', year: 'numeric'
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 text-zinc-900 font-sans relative overflow-hidden bg-dot-grid theme-transition">

      {/* ── Header ── */}
      <header className="flex items-center justify-between px-8 py-5 bg-white border-b border-zinc-200/70 z-10 shadow-sm theme-transition">
        <div className="flex items-center gap-4">
          {themeEvent?.logoUrl ? (
            <img
              src={getMediaUrl(themeEvent.logoUrl)}
              alt="Event Logo"
              className="h-11 object-contain bg-white p-1.5 rounded-xl border border-zinc-200 shadow-sm"
            />
          ) : (
            <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-zinc-900 text-white shadow-sm theme-transition">
              <Presentation size={20} />
            </div>
          )}
          <div>
            <h1 className="text-lg font-bold tracking-tight text-zinc-900 font-display">
              Plateforme <span className="text-theme-secondary theme-transition">E-Poster</span>
            </h1>
            <p className="text-[11px] text-zinc-400 font-semibold tracking-wide uppercase">Borne tactile interactive</p>
          </div>
        </div>

        {/* Screen switcher */}
        <div className="flex items-center gap-2">
          {screensQuery.data && screensQuery.data.length > 0 ? (
            <div className="flex bg-zinc-100 p-1 rounded-xl border border-zinc-200/60 gap-1">
              {screensQuery.data.map(s => (
                <button
                  key={s.id}
                  onClick={() => {
                    setSelectedScreen(String(s.id));
                    window.open(`${window.location.origin}/totem?screen=${s.id}`, `totem-screen-${s.id}`);
                  }}
                  style={selectedScreen === String(s.id) ? { backgroundColor: 'var(--theme-primary)', color: 'var(--theme-foreground)' } : {}}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all theme-transition ${
                    selectedScreen === String(s.id) ? 'shadow-sm' : 'text-zinc-500 hover:text-zinc-900 hover:bg-white'
                  }`}
                >
                  <Monitor size={13} /> {s.name}
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
              className="px-3 py-1.5 bg-white hover:bg-zinc-50 text-zinc-600 border border-zinc-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all"
            >
              <Monitor size={13} /> Écran {selectedScreen === '1' ? '2' : '1'}
            </button>
          )}
        </div>
      </header>

      {/* ── Main ── */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-12 z-10 max-w-7xl mx-auto w-full">
        {eventsQuery.isLoading ? (
          <div className="flex flex-col items-center gap-4 animate-fade-in py-24">
            <div className="loading-spinner" style={{ borderTopColor: 'var(--theme-secondary)' }} />
            <p className="text-sm text-zinc-400 font-semibold">Chargement des congrès...</p>
          </div>

        ) : activeEvents.length === 0 ? (
          <div className="max-w-sm w-full text-center p-10 bg-white border border-zinc-200 rounded-3xl shadow-sm animate-fade-in">
            <Calendar size={48} className="mx-auto text-zinc-300 mb-5" />
            <h2 className="text-xl font-bold text-zinc-900 mb-2 font-display">Aucun événement actif</h2>
            <p className="text-sm text-zinc-400 mb-7 leading-relaxed">
              Aucun événement n'est configuré en statut actif pour le totem.
            </p>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-zinc-900 text-white rounded-xl text-sm font-semibold transition-all hover:bg-zinc-800 shadow-sm"
            >
              Accéder à l'Administration
            </Link>
          </div>

        ) : showWelcome ? (
          <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-10 items-center justify-between animate-fade-in my-auto py-4">
            {/* Left Info Panel */}
            <div className="lg:col-span-7 space-y-8 text-left animate-slide-in">
              <div className="space-y-4">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold tracking-widest uppercase bg-zinc-900 text-white shadow-sm">
                  <Sparkles size={11} className="text-[#f1785b]" />
                  Espace Tactile Interactif
                </span>
                <h2 className="text-4xl md:text-5xl font-black text-zinc-950 tracking-tight leading-none font-display">
                  Bienvenue sur l'Espace <span className="text-theme-secondary">E-Poster</span>
                </h2>
                <p className="text-sm text-zinc-500 max-w-xl leading-relaxed">
                  Découvrez et explorez les communications scientifiques et publications de nos congrès. 
                  Une solution numérique interactive conçue pour enrichir le partage des connaissances médicales.
                </p>
              </div>

              {/* Steps */}
              <div className="space-y-4 max-w-lg">
                {/* Step 1 */}
                <div className="flex items-start gap-4 p-4 bg-white border border-zinc-200/80 rounded-2xl shadow-sm hover:border-zinc-300 transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-zinc-900 text-white flex items-center justify-center shrink-0">
                    <Calendar size={18} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-zinc-900 uppercase tracking-wider mb-1 font-display">1. Sélectionnez votre Congrès</h4>
                    <p className="text-xs text-zinc-400 leading-relaxed">Choisissez l'événement ou la session active pour accéder à l'ensemble de ses e-posters.</p>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="flex items-start gap-4 p-4 bg-white border border-zinc-200/80 rounded-2xl shadow-sm hover:border-zinc-300 transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-zinc-900 text-white flex items-center justify-center shrink-0">
                    <Search size={18} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-zinc-900 uppercase tracking-wider mb-1 font-display">2. Recherchez &amp; Filtrez</h4>
                    <p className="text-xs text-zinc-400 leading-relaxed">Recherchez instantanément par titre, auteur ou mots-clés grâce au clavier virtuel intégré à l'écran tactile.</p>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="flex items-start gap-4 p-4 bg-white border border-zinc-200/80 rounded-2xl shadow-sm hover:border-zinc-300 transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-zinc-900 text-white flex items-center justify-center shrink-0">
                    <Smartphone size={18} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-zinc-900 uppercase tracking-wider mb-1 font-display">3. Emportez sur Mobile</h4>
                    <p className="text-xs text-zinc-400 leading-relaxed">Scannez le QR Code de n'importe quel poster scientifique pour le lire confortablement sur votre propre smartphone.</p>
                  </div>
                </div>
              </div>

              {/* CTA button */}
              <button
                onClick={() => setShowWelcome(false)}
                style={{ backgroundColor: 'var(--theme-primary)', color: 'var(--theme-foreground)' }}
                className="px-8 py-4 hover:opacity-90 rounded-2xl text-xs font-bold flex items-center gap-2.5 transition-all shadow-md active:scale-95 font-display shrink-0 w-full sm:w-auto justify-center cursor-pointer"
              >
                <Play size={13} className="fill-current" />
                Commencer l'exploration
              </button>
            </div>

            {/* Right Column: Illustration Image */}
            <div className="lg:col-span-5 flex items-center justify-center animate-scale-in">
              <div className="p-4 bg-white border border-zinc-200/80 rounded-[32px] shadow-xl max-w-sm w-full transition-all hover:scale-[1.01]">
                <img
                  src="/assets/medical_totem_concept.png"
                  alt="E-Poster Totem Concept"
                  className="w-full h-auto object-contain rounded-2xl"
                  draggable={false}
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="w-full flex flex-col items-center animate-fade-in">
            {/* Intro */}
            <div className="text-center mb-10 animate-fade-in">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase mb-3"
                style={{ backgroundColor: 'rgba(var(--theme-secondary-rgb, 241,120,91), 0.12)', color: 'var(--theme-secondary)' }}>
                Sessions Actives
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-900 mb-3 font-display">
                Sélectionnez un événement
              </h2>
              <p className="text-sm text-zinc-500 max-w-md mx-auto leading-relaxed">
                Touchez un événement pour explorer ses communications et posters scientifiques.
              </p>
            </div>

            {/* Events Grid */}
            <div className={`grid gap-6 w-full justify-center ${
              activeEvents.length === 1
                ? 'max-w-md grid-cols-1'
                : activeEvents.length === 2
                ? 'max-w-3xl grid-cols-1 md:grid-cols-2'
                : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
            }`}>
              {activeEvents.map((event, i) => {
                const isActive = themeEvent?.id === event.id;
                return (
                  <div
                    key={event.id}
                    onMouseEnter={() => setHoveredEvent(event)}
                    onMouseLeave={() => setHoveredEvent(null)}
                    onClick={() => navigate(`/totem/publications?eventId=${event.id}&screen=${selectedScreen}`)}
                    style={{ animationDelay: `${i * 80}ms` }}
                    className={`relative rounded-3xl overflow-hidden border transition-all duration-300 cursor-pointer flex flex-col group animate-fade-up ${
                      isActive
                        ? 'border-zinc-300 shadow-lg bg-white scale-[1.01]'
                        : 'border-zinc-200 bg-white hover:border-zinc-300 hover:shadow-md shadow-sm'
                    }`}
                  >
                    {/* Banner */}
                    <div className="h-28 w-full bg-zinc-100 relative overflow-hidden border-b border-zinc-100">
                      {event.bannerUrl ? (
                        <img
                          src={getMediaUrl(event.bannerUrl)}
                          alt="Banner"
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-90"
                        />
                      ) : (
                        <div className="w-full h-full bg-zinc-100 flex items-center justify-center">
                          <Presentation size={32} className="text-zinc-300" />
                        </div>
                      )}
                      {/* Logo floating */}
                      <div className="absolute bottom-3 left-5">
                        {event.logoUrl ? (
                          <img
                            src={getMediaUrl(event.logoUrl)}
                            alt="Logo"
                            className="h-12 w-12 object-contain bg-white rounded-xl p-1 shadow-md border border-zinc-200"
                          />
                        ) : (
                          <div className="h-12 w-12 bg-white rounded-xl flex items-center justify-center shadow-md border border-zinc-200 text-zinc-600 font-bold text-sm">
                            {event.title ? event.title.substring(0, 2).toUpperCase() : "EV"}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-5 flex-1 flex flex-col justify-between">
                      <div>
                        {(event.startDate || event.endDate) && (
                          <div className="flex items-center gap-1.5 text-zinc-400 mb-2 text-[11px] font-semibold">
                            <Calendar size={11} className="text-theme-secondary theme-transition" />
                            <span>{formatDate(event.startDate)}</span>
                            {event.endDate && <><span>—</span><span>{formatDate(event.endDate)}</span></>}
                          </div>
                        )}

                        <h3 className="text-base font-bold text-zinc-900 mb-1.5 tracking-tight group-hover:text-theme-secondary transition-colors duration-200 font-display theme-transition">
                          {event.title}
                        </h3>
                        <p className="text-xs text-zinc-400 mb-5 line-clamp-2 leading-relaxed">
                          {event.description || "Aucune description fournie."}
                        </p>
                      </div>

                      {/* QR codes + CTA */}
                      <div className="space-y-3 pt-4 border-t border-zinc-100">
                        {(event.programUrl || event.revueUrl) ? (
                          <div className="grid grid-cols-2 gap-2">
                            {event.programUrl && (
                              <div onClick={(e) => e.stopPropagation()}
                                className="flex items-center gap-2 bg-zinc-50 p-2 rounded-xl border border-zinc-200/60">
                                <img
                                  src={`https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=${encodeURIComponent(event.programUrl)}`}
                                  alt="QR Program"
                                  className="w-9 h-9 bg-white p-0.5 rounded-lg shrink-0 border border-zinc-200/50"
                                />
                                <div className="min-w-0">
                                  <h4 className="text-[9px] font-extrabold text-theme-primary uppercase tracking-wider theme-transition">Programme</h4>
                                  <p className="text-[8px] text-zinc-400">Scanner PDF</p>
                                </div>
                              </div>
                            )}
                            {event.revueUrl && (
                              <div onClick={(e) => e.stopPropagation()}
                                className="flex items-center gap-2 bg-zinc-50 p-2 rounded-xl border border-zinc-200/60">
                                <img
                                  src={`https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=${encodeURIComponent(event.revueUrl)}`}
                                  alt="QR Revue"
                                  className="w-9 h-9 bg-white p-0.5 rounded-lg shrink-0 border border-zinc-200/50"
                                />
                                <div className="min-w-0">
                                  <h4 className="text-[9px] font-extrabold text-theme-primary uppercase tracking-wider theme-transition">La Revue</h4>
                                  <p className="text-[8px] text-zinc-400">Scanner Journal</p>
                                </div>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-[10px] text-zinc-400 py-1.5 font-medium italic justify-center bg-zinc-50 rounded-xl border border-zinc-100">
                            <HelpCircle size={10} /> QR codes non disponibles
                          </div>
                        )}

                        <button
                          style={{ backgroundColor: 'var(--theme-primary)', color: 'var(--theme-foreground)' }}
                          className="w-full py-2.5 px-4 hover:opacity-90 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-sm font-display"
                        >
                          Accéder aux publications
                          <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
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
      <footer className="py-4 text-center text-[11px] text-zinc-400 border-t border-zinc-200/60 bg-white/50 z-10 shrink-0 theme-transition">
        © 2026 AMPIIC · Plateforme Digitale Interactive
      </footer>
    </div>
  );
}
