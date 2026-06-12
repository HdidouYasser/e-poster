import { useMemo, useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { publicApi, getMediaUrl, getPosterThumbnail } from "../api";
import { Presentation, ArrowRight, ArrowLeft, Calendar, Monitor, BookOpen, HelpCircle } from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";
import { useIdleTimer } from "../hooks/useIdleTimer";
import { useDynamicTheme } from "../hooks/useDynamicTheme";
import { createTotemSync } from "./totemSync";

const sync = createTotemSync();

/** Replace localhost with current hostname + current port so QR codes work from phones via Vite proxy */
const toScannableUrl = (url) => {
  if (!url) return "";
  try {
    const u = new URL(url);
    u.hostname = window.location.hostname;
    u.port = window.location.port;
    return u.toString();
  } catch {
    return url;
  }
};

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

  const statsQuery = useQuery({
    queryKey: ["totem-stats"],
    queryFn: async () => (await publicApi.get("/platform/statistics")).data
  });

  const location = useLocation();

  // Broadcast navigation if this is the controller (visitor screen)
  useEffect(() => {
    if (screen === "visitor") {
      sync.send({ type: "NAVIGATE", screen, path: location.pathname + location.search });
    }
  }, [location, screen]);

  // Listen to navigation from other screens (visitor)
  useEffect(() => {
    return sync.onMessage((msg) => {
      if (!msg || msg.type !== "NAVIGATE") return;
      if (String(msg.screen) === String(screen)) return;

      // Rewrite screen parameter in path to match local screen
      const url = new URL(msg.path, window.location.origin);
      url.searchParams.set("screen", screen);
      navigate(url.pathname + url.search);
    });
  }, [navigate, screen]);

  useIdleTimer({
    timeoutMs: 60_000,
    onIdle: () => {
      if (themeEvent?.id) {
        navigate(`/totem/slideshow?eventId=${themeEvent.id}&screen=${screen}`);
      }
    },
    enabled: !!themeEvent?.id && (screen === "1" || screen === "2")
  });

  const formatDate = (dateStr) => {
    if (!dateStr) return null;
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: 'numeric', month: 'long', year: 'numeric'
    });
  };

  return (
    <div className="h-screen flex flex-col bg-zinc-50 text-zinc-900 font-sans relative overflow-hidden selection:bg-theme-secondary/20 selection:text-zinc-900 theme-transition">

      {/* Header */}
      <header className="relative flex items-center justify-between px-8 py-3 bg-white border-b-[1.5px] border-zinc-200 z-10 shrink-0 theme-transition" style={{ boxShadow: 'var(--totem-shadow)' }}>
        <div className="flex items-center gap-5">
          {/* Back to portal button (visitor mode) */}
          {screen === 'visitor' && (
            <Link to="/" className="totem-back-btn mr-2">
              <ArrowLeft size={15} /> Portail
            </Link>
          )}
          {themeEvent?.logoUrl ? (
            <img src={getMediaUrl(themeEvent.logoUrl)} alt="Event Logo" className="h-11 object-contain bg-white p-1.5 rounded-xl border border-zinc-200" style={{ boxShadow: 'var(--totem-shadow)' }} />
          ) : (
            <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-white border border-zinc-200 text-theme-secondary theme-transition" style={{ boxShadow: 'var(--totem-shadow)' }}>
              <Presentation size={20} />
            </div>
          )}
          <div>
            <h1 className="text-lg font-extrabold tracking-tight text-zinc-900 flex items-center gap-2 font-display">
              Plateforme <span className="text-theme-secondary theme-transition">E-Poster</span>
            </h1>
            <p className="text-[11px] text-zinc-400 font-semibold tracking-wide">Borne tactile interactive</p>
          </div>
        </div>

        {(screen === "1" || screen === "2") && (
          <div className="flex items-center gap-3">
            {screensQuery.data && screensQuery.data.length > 0 ? (
              <div className="segmented-control theme-transition">
                {screensQuery.data.map(s => {
                  const isActive = selectedScreen === String(s.id);
                  return (
                    <button
                      key={s.id}
                      onClick={() => {
                        setSelectedScreen(String(s.id));
                        window.open(`${window.location.origin}/totem?screen=${s.id}`, `totem-screen-${s.id}`);
                      }}
                      className={`segmented-item ${isActive ? 'active' : ''}`}
                    >
                      Écran {s.name || s.id}
                    </button>
                  );
                })}
              </div>
            ) : null}
            {selectedScreen && (
              <button
                onClick={() => {
                  navigate(`/totem/slideshow?eventId=${themeEvent?.id || ""}&screen=${selectedScreen}`);
                }}
                className="px-4 py-2.5 bg-white hover:bg-zinc-50 text-zinc-600 border border-zinc-200 rounded-xl text-xs font-bold flex items-center gap-2 transition-all active:scale-95"
                style={{ boxShadow: 'var(--totem-shadow)' }}
              >
                <Monitor size={14} /> Diaporama
              </button>
            )}
          </div>
        )}
      </header>

      {/* ── Navigation Stepper ── */}
      <div className="max-w-7xl mx-auto px-8 pt-4 w-full shrink-0">
        <div className="totem-stepper">
          <Link to="/" className="totem-stepper-step">
            <span className="totem-stepper-num">1</span>
            <span className="hidden sm:inline">Portail</span>
          </Link>
          <span className="totem-stepper-divider">/</span>
          <div className="totem-stepper-step active">
            <span className="totem-stepper-num">2</span>
            <span className="hidden sm:inline">Sélection Congrès</span>
          </div>
          <span className="totem-stepper-divider">/</span>
          <div className="totem-stepper-step">
            <span className="totem-stepper-num">3</span>
            <span className="hidden sm:inline">E-Posters</span>
          </div>
          <span className="totem-stepper-divider">/</span>
          <div className="totem-stepper-step">
            <span className="totem-stepper-num">4</span>
            <span className="hidden sm:inline">Lecture Poster</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 z-10 max-w-7xl mx-auto w-full">
        {eventsQuery.isLoading ? (
          <div className="flex flex-col items-center justify-center space-y-4 animate-fade-in py-12">
            <div className="w-10 h-10 border-[3px] border-zinc-200 rounded-full animate-spin" style={{ borderTopColor: 'var(--theme-primary)' }} />
            <p className="text-xs text-zinc-500 font-bold tracking-wide">Chargement des congrès...</p>
          </div>
        ) : activeEvents.length === 0 ? (
          <div className="max-w-md w-full text-center p-10 bg-white border border-zinc-200 rounded-2xl animate-fade-in" style={{ boxShadow: 'var(--totem-shadow-elevated)' }}>
            <Calendar size={44} className="mx-auto text-zinc-300 mb-5" />
            <h2 className="text-lg font-bold text-zinc-900 mb-3 font-display">Aucun événement actif</h2>
            <p className="text-sm text-zinc-500 mb-7 leading-relaxed font-medium">
              Aucun événement n'est actuellement configuré en statut actif pour cette borne tactile.
            </p>
            <Link
              to="/login"
              className="totem-cta-btn"
            >
              Accéder à l'Administration
            </Link>
          </div>
        ) : (
          <div className="w-full flex flex-col items-center">
            {/* Catchy intro */}
            <div className="text-center mb-6 animate-fade-in">
              <span className="totem-badge totem-badge-primary mb-3 inline-block theme-transition">
                Sessions Actives
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-zinc-900 mb-2 font-display">
                Sélectionnez un événement
              </h2>
              <p className="text-sm sm:text-base text-zinc-500 max-w-xl mx-auto font-medium leading-relaxed">
                Touchez un événement ci-dessous pour explorer ses communications et posters scientifiques.
              </p>
            </div>

            {/* Tutorial/Guide */}
            <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 animate-fade-in">
              {[
                { num: 1, title: "Sélectionnez", desc: "Touchez un congrès pour explorer ses posters." },
                { num: 2, title: "Recherchez", desc: "Filtrez par titre, auteur ou thématique." },
                { num: 3, title: "Scannez", desc: "Scanner le QR code pour lire sur mobile." },
              ].map(step => (
                <div key={step.num} className="flex items-center gap-4 bg-white border border-zinc-200 p-5 rounded-2xl transition-all hover:border-zinc-300" style={{ boxShadow: 'var(--totem-shadow-card)' }}>
                  <div className="w-10 h-10 rounded-xl bg-zinc-50 text-zinc-700 border border-zinc-200 flex items-center justify-center font-extrabold text-sm shrink-0 font-display">{step.num}</div>
                  <div>
                    <h4 className="text-[11px] font-extrabold text-zinc-900 uppercase tracking-widest font-display">{step.title}</h4>
                    <p className="text-[11px] text-zinc-500 font-medium mt-1">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Dynamic Grid of Active Events */}
            <div className={`grid gap-5 w-full justify-center ${activeEvents.length === 1 ? 'max-w-xl grid-cols-1' : activeEvents.length === 2 ? 'max-w-4xl grid-cols-1 md:grid-cols-2' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
              {activeEvents.map((event) => {
                const isCurrentTheme = themeEvent?.id === event.id;
                return (
                  <div
                    key={event.id}
                    onMouseEnter={() => setHoveredEvent(event)}
                    onMouseLeave={() => setHoveredEvent(null)}
                    onClick={() => navigate(`/totem/publications?eventId=${event.id}&screen=${selectedScreen}`)}
                    className={`totem-event-card group theme-transition ${isCurrentTheme ? 'border-zinc-300' : ''
                      }`}
                    style={{
                      boxShadow: isCurrentTheme ? 'var(--totem-shadow-card-hover)' : 'var(--totem-shadow-card)',
                      transform: isCurrentTheme ? 'translateY(-3px)' : undefined
                    }}
                  >
                    {/* Event Banner background */}
                    <div className="totem-event-card-banner theme-transition">
                      {event.bannerUrl ? (
                        <img
                          src={getMediaUrl(event.bannerUrl)}
                          alt="Banner"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-zinc-100 flex items-center justify-center">
                          <Presentation size={32} className="text-zinc-300" />
                        </div>
                      )}

                      {/* Logo positioned floating */}
                      <div className="absolute bottom-3 left-5 flex items-end gap-3">
                        {event.logoUrl ? (
                          <img
                            src={getMediaUrl(event.logoUrl)}
                            alt="Logo"
                            className="h-11 w-11 object-contain bg-white rounded-xl p-1.5 border border-zinc-200 shrink-0"
                            style={{ boxShadow: 'var(--totem-shadow)' }}
                          />
                        ) : (
                          <div className="h-11 w-11 bg-white rounded-xl flex items-center justify-center border border-zinc-200 text-zinc-500 font-bold text-xs shrink-0" style={{ boxShadow: 'var(--totem-shadow)' }}>
                            {event.title ? event.title.substring(0, 2).toUpperCase() : "EV"}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="p-5 flex-1 flex flex-col justify-between">
                      <div>
                        {/* Dates */}
                        {(event.startDate || event.endDate) && (
                          <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-zinc-100 text-zinc-600 rounded-lg text-[10px] font-bold uppercase tracking-wider mb-3 w-fit theme-transition">
                            <Calendar size={11} className="text-zinc-500" />
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
                        <h3 className="text-[15px] font-bold text-zinc-900 mb-2 tracking-tight group-hover:text-theme-secondary transition-colors duration-200 font-display theme-transition line-clamp-2">
                          {event.title}
                        </h3>

                        {/* Description */}
                        <p className="text-xs text-zinc-500 mb-4 line-clamp-2 leading-relaxed font-medium">
                          {event.description || "Aucune description fournie."}
                        </p>
                      </div>

                      {/* QR Access section */}
                      <div className="space-y-3 pt-4 border-t border-zinc-100 theme-transition">
                        {(event.programUrl || event.revueUrl) ? (
                          <div className={`grid gap-3 ${
                            (event.programUrl && event.revueUrl) ? 'grid-cols-2' : 'grid-cols-1 max-w-xs'
                          }`}>
                            {event.programUrl && (
                              <div
                                onClick={(e) => e.stopPropagation()}
                                className="flex flex-col items-center gap-2 bg-zinc-50 p-4 rounded-xl border border-zinc-200 theme-transition"
                              >
                                <div className="bg-white p-2 rounded-xl border border-zinc-200 flex items-center justify-center">
                                  <QRCodeCanvas value={toScannableUrl(event.programUrl)} size={80} level="H" fgColor={event.colorPrimary || '#18181b'} />
                                </div>
                                <div className="text-center">
                                  <h4 className="text-[10px] font-extrabold uppercase tracking-wider theme-transition" style={{ color: event.colorPrimary || 'var(--theme-primary)' }}>Programme</h4>
                                  <p className="text-[10px] text-zinc-400 mt-0.5 font-medium">Scanner le PDF</p>
                                </div>
                              </div>
                            )}
                            {event.revueUrl && (
                              <div
                                onClick={(e) => e.stopPropagation()}
                                className="flex flex-col items-center gap-2 bg-zinc-50 p-4 rounded-xl border border-zinc-200 theme-transition"
                              >
                                <div className="bg-white p-2 rounded-xl border border-zinc-200 flex items-center justify-center">
                                  <QRCodeCanvas value={toScannableUrl(event.revueUrl)} size={80} level="H" fgColor={event.colorPrimary || '#18181b'} />
                                </div>
                                <div className="text-center">
                                  <h4 className="text-[10px] font-extrabold uppercase tracking-wider theme-transition" style={{ color: event.colorPrimary || 'var(--theme-primary)' }}>La Revue</h4>
                                  <p className="text-[10px] text-zinc-400 mt-0.5 font-medium">Scanner le Journal</p>
                                </div>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-xs text-zinc-400 py-2 font-semibold italic justify-center bg-zinc-50 rounded-xl border border-zinc-200 theme-transition">
                            <HelpCircle size={12} /> QR codes non disponibles
                          </div>
                        )}

                        {/* CTA button */}
                        <button className="totem-cta-btn w-full">
                          Accéder aux publications
                          <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Posters Populaires (Top Publications) */}
            {statsQuery.data?.topPublications?.length > 0 && (
              <div className="w-full max-w-6xl mt-14 border-t border-zinc-200 pt-10 animate-fade-in">
                <div className="text-center mb-8">
                  <span className="totem-badge totem-badge-primary mb-2 inline-block theme-transition">
                    Tendances
                  </span>
                  <h3 className="text-xl sm:text-2xl font-extrabold text-zinc-900 font-display">
                    Communications les plus consultées
                  </h3>
                  <p className="text-xs text-zinc-500 font-medium mt-1">
                    Découvrez les e-posters scientifiques suscitant le plus d'intérêt auprès des congressistes.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {statsQuery.data.topPublications.slice(0, 3).map((pub) => {
                    const thumb = pub.posterUrl ? getPosterThumbnail(pub.posterUrl) : null;
                    return (
                      <div
                        key={pub.id}
                        onClick={() => navigate(`/totem/publications/${pub.id}?eventId=${pub.eventId || ""}&screen=${selectedScreen}`)}
                        className="bg-white border border-zinc-200 hover:border-zinc-300 rounded-2xl p-4 flex gap-4 cursor-pointer transition-all hover:-translate-y-1 hover:shadow-md group"
                        style={{ boxShadow: 'var(--totem-shadow-card)' }}
                      >
                        <div className="w-16 h-20 bg-zinc-50 rounded-lg overflow-hidden border border-zinc-100 shrink-0 flex items-center justify-center relative">
                          {thumb ? (
                            <img src={thumb} alt={pub.title} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                          ) : (
                            <Presentation size={20} className="text-zinc-300" />
                          )}
                          <span className="absolute bottom-1 right-1 bg-black/60 text-white text-[8px] font-bold px-1 py-0.5 rounded">
                            N° {pub.id}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0 flex flex-col justify-between">
                          <div>
                            {pub.category && (
                              <span className="text-[9px] font-extrabold text-theme-primary uppercase tracking-wider theme-transition mb-1 block">
                                {pub.category}
                              </span>
                            )}
                            <h4 className="text-xs font-bold text-zinc-900 line-clamp-2 leading-snug group-hover:text-theme-secondary transition-colors duration-150 font-display">
                              {pub.title}
                            </h4>
                            <p className="text-[10px] text-zinc-400 mt-1 truncate font-semibold">
                              {pub.authors || "Auteurs non renseignés"}
                            </p>
                          </div>
                          <div className="flex items-center justify-between mt-2 pt-2 border-t border-zinc-50 text-[10px] text-zinc-400 font-bold">
                            <span className="flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-theme-primary animate-pulse" />
                              {pub.viewCount || 0} vues
                            </span>
                            <span className="text-theme-secondary theme-transition group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                              Consulter &rarr;
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="relative py-3 text-center text-[11px] text-zinc-400 border-t-[1.5px] border-zinc-200 bg-white z-10 shrink-0 theme-transition font-medium">
        <p>&copy; 2026 AMPIIC. Plateforme Digitale Interactive. Tous droits réservés.</p>
      </footer>
    </div>
  );
}