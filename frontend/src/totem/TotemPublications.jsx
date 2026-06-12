import { useEffect, useMemo, useState, useRef } from "react";
import { Link, useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { publicApi, getMediaUrl, getPosterThumbnail } from "../api";
import { useIdleTimer } from "../hooks/useIdleTimer";
import { createTotemSync } from "./totemSync";
import { Home, Search, Monitor, ArrowLeft, ChevronLeft, ChevronRight, Image as ImageIcon, Keyboard as KeyboardIcon, X, MapPin, Clock, Tag } from "lucide-react";
import Keyboard from "react-simple-keyboard";
import "react-simple-keyboard/build/css/index.css";
import { useDynamicTheme } from "../hooks/useDynamicTheme";

const sync = createTotemSync();

export default function TotemPublications() {
  const navigate = useNavigate();
  const location = useLocation();
  const [params, setParams] = useSearchParams();
  const screen = params.get("screen") || "1";
  const eventId = params.get("eventId") || "";
  const [page, setPage] = useState(Number(params.get("page") || 0));
  const [category, setCategory] = useState(params.get("category") || "");
  const [session, setSession] = useState(params.get("session") || "");
  const [room, setRoom] = useState(params.get("room") || "");
  const size = 12;

  const [q, setQ] = useState(params.get("q") || "");
  const [showKeyboard, setShowKeyboard] = useState(false);
  const keyboardRef = useRef(null);

  const [sort, setSort] = useState("id,asc");

  // Sync virtual keyboard state when physical input changes
  useEffect(() => {
    if (keyboardRef.current) {
      keyboardRef.current.setInput(q);
    }
  }, [q]);

  const endpoint = useMemo(() => {
    let base = `/publications?page=${page}&size=${size}&sort=${sort}`;
    if (q.trim()) {
      base = `/publications/search?q=${encodeURIComponent(q)}&page=${page}&size=${size}&sort=${sort}`;
    }

    if (eventId) base += `&eventId=${encodeURIComponent(eventId)}`;
    if (category) base += `&category=${encodeURIComponent(category)}`;
    if (session) base += `&session=${encodeURIComponent(session)}`;
    if (room) base += `&room=${encodeURIComponent(room)}`;
    return base;
  }, [q, page, size, eventId, category, session, room, sort]);

  const pubsQuery = useQuery({
    queryKey: ["totem-pubs", page, size, q, eventId, category, session, room, sort],
    queryFn: async () => (await publicApi.get(endpoint)).data
  });

  const data = pubsQuery.data || { items: [], page: 0, totalPages: 1 };

  const { data: categoriesData } = useQuery({
    queryKey: ["totem-categories", eventId],
    queryFn: async () => (await publicApi.get(`/categories`)).data
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

  // Apply dynamic color theme of the selected event
  useDynamicTheme(selectedEvent?.colorPrimary, selectedEvent?.logoUrl);

  const eventCategories = useMemo(() => {
    if (!categoriesData) return [];
    if (!eventId) return categoriesData;
    return categoriesData.filter(c => !c.event || String(c.event.id) === String(eventId));
  }, [categoriesData, eventId]);

  const allPubsQuery = useQuery({
    queryKey: ["totem-all-pubs", eventId],
    queryFn: async () => (await publicApi.get(`/publications?eventId=${eventId}&page=0&size=1000`)).data,
    enabled: !!eventId
  });

  const availableSessions = useMemo(() => {
    if (!allPubsQuery.data?.items) return [];
    const sessions = new Set(allPubsQuery.data.items.map(p => p.session).filter(Boolean));
    return Array.from(sessions).sort();
  }, [allPubsQuery.data]);

  const availableRooms = useMemo(() => {
    if (!allPubsQuery.data?.items) return [];
    const rooms = new Set(allPubsQuery.data.items.map(p => p.room).filter(Boolean));
    return Array.from(rooms).sort();
  }, [allPubsQuery.data]);

  useEffect(() => {
    setParams((p) => {
      p.set("page", String(page));
      p.set("screen", screen);
      if (eventId) p.set("eventId", eventId);
      if (q) p.set("q", q); else p.delete("q");
      if (category) p.set("category", category); else p.delete("category");
      if (session) p.set("session", session); else p.delete("session");
      if (room) p.set("room", room); else p.delete("room");
      return p;
    });
  }, [page, q, category, session, room, eventId, screen, setParams]);

  useIdleTimer({
    timeoutMs: 60_000,
    onIdle: () => navigate(`/totem?screen=${screen}`),
    enabled: screen === "1" || screen === "2"
  });

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

  return (
    <div className="h-screen flex flex-col bg-theme-bg-light text-zinc-900 font-sans transition-colors duration-500 theme-transition relative overflow-hidden">

      {/* Header Panel */}
      <header className="flex flex-col md:flex-row items-center justify-between px-8 py-3 bg-white border-b-[1.5px] border-zinc-200 gap-3 sticky top-0 z-20 shrink-0 theme-transition" style={{ boxShadow: 'var(--totem-shadow)' }}>
        <div className="flex items-center gap-3 w-full md:w-auto">
          {screen === 'visitor' && (
            <Link to="/" className="totem-back-btn">
              <ArrowLeft size={15} /> Portail
            </Link>
          )}
          <Link
            to={`/totem?screen=${screen}`}
            className="totem-back-btn"
          >
            <Home size={15} /> Congrès
          </Link>


          {selectedEvent?.logoUrl && (
            <img
              src={getMediaUrl(selectedEvent.logoUrl)}
              alt="Logo"
              className="h-10 max-w-[110px] object-contain hidden sm:block bg-white p-1.5 rounded-lg border border-zinc-200"
              style={{ boxShadow: 'var(--totem-shadow)' }}
            />
          )}
          <div className="hidden lg:block">
            <h2 className="text-sm font-bold text-zinc-900 truncate max-w-[220px] font-display theme-transition">
              {selectedEvent?.title || "Congrès E-Poster"}
            </h2>
            <p className="text-[11px] text-zinc-400 font-semibold mt-0.5">Recherche communications</p>
          </div>
        </div>

        {/* Styled search container */}
        <div className="relative flex-1 w-full md:max-w-xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 transition-colors" size={15} />
          <input
            className="w-full bg-white border-[1.5px] border-zinc-200 focus:border-zinc-900 text-zinc-900 placeholder-zinc-400 pl-11 pr-12 py-2.5 rounded-xl text-sm outline-none transition-all font-semibold"
            style={{ boxShadow: 'var(--totem-shadow)' }}
            value={q}
            onChange={(e) => { setQ(e.target.value); setPage(0); }}
            onFocus={() => setShowKeyboard(true)}
            placeholder="Rechercher par titre, auteur, mot-clé..."
          />
          <button
            onClick={() => setShowKeyboard(!showKeyboard)}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-all rounded-lg"
          >
            {showKeyboard ? <X size={16} /> : <KeyboardIcon size={16} />}
          </button>

          {showKeyboard && (
            <div className="totem-keyboard-wrap">
              <Keyboard
                keyboardRef={r => { keyboardRef.current = r; }}
                layoutName="default"
                onChange={(input) => { setQ(input); setPage(0); }}
                onKeyPress={(button) => {
                  if (button === "{enter}") setShowKeyboard(false);
                }}
                input={q}
                layout={{
                  default: [
                    "1 2 3 4 5 6 7 8 9 0 - = {bksp}",
                    "a z e r t y u i o p [ ] \\",
                    "q s d f g h j k l m ' {enter}",
                    "w x c v b n , . /",
                    "{space}"
                  ]
                }}
                display={{
                  "{bksp}": "⌫ Effacer",
                  "{enter}": "✓ Valider",
                  "{space}": "Espace",
                }}
              />
            </div>
          )}
        </div>

        {(screen === "1" || screen === "2") && (
          <button
            onClick={() => window.open(`${window.location.origin}/totem/publications?screen=${Number(screen) + 1}`, `totem-screen-${Number(screen) + 1}`)}
            className="totem-cta-btn w-full md:w-auto shrink-0"
          >
            <Monitor size={15} /> Écran {screen === '1' ? '2' : '1'}
          </button>
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
          <Link to={`/totem?screen=${screen}`} className="totem-stepper-step">
            <span className="totem-stepper-num">2</span>
            <span className="hidden sm:inline">Sélection Congrès</span>
          </Link>
          <span className="totem-stepper-divider">/</span>
          <div className="totem-stepper-step active">
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

      {/* Categories & Select Filter Toolbar */}
      <div className="bg-white border-b-[1.5px] border-zinc-200 px-8 py-3 flex flex-col sm:flex-row gap-3 items-center justify-between z-10 mt-4 shrink-0" style={{ boxShadow: 'var(--totem-shadow)' }}>
        {eventCategories?.length > 0 ? (
          <div className="flex-1 flex items-center gap-2 overflow-x-auto pb-1 max-w-full scrollbar-none">
            <button
              onClick={() => { setCategory(""); setPage(0); }}
              className={`totem-filter-chip ${!category ? 'active' : ''}`}
            >
              Tous les thèmes
            </button>
            {eventCategories.map(c => (
              <button
                key={c.id}
                onClick={() => { setCategory(c.name); setPage(0); }}
                className={`totem-filter-chip ${category === c.name ? 'active' : ''}`}
              >
                {c.name}
              </button>
            ))}
          </div>
        ) : <div className="flex-1"></div>}

        <div className="flex gap-2 w-full sm:w-auto justify-end shrink-0">
          <select
            value={sort}
            onChange={(e) => { setSort(e.target.value); setPage(0); }}
            className="totem-select"
          >
            <option value="id,asc">Trier par N° (Croissant)</option>
            <option value="title,asc">Trier par Titre (A-Z)</option>
            <option value="createdAt,desc">Trier par Nouveauté</option>
          </select>
          {availableSessions.length > 0 && (
            <select
              value={session}
              onChange={(e) => { setSession(e.target.value); setPage(0); }}
              className="totem-select text-[11px]"
            >
              <option value="">Toutes les sessions</option>
              {availableSessions.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          )}
          {availableRooms.length > 0 && (
            <select
              value={room}
              onChange={(e) => { setRoom(e.target.value); setPage(0); }}
              className="totem-select text-[11px]"
            >
              <option value="">Toutes les salles</option>
              {availableRooms.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          )}
        </div>
      </div>

      {/* Main Grid View */}
      <main className="flex-1 min-h-0 overflow-y-auto p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {pubsQuery.isLoading ? (
            <>
              {Array.from({ length: 8 }).map((_, idx) => (
                <div key={idx} className="skeleton-card shimmer-pulse">
                  <div className="skeleton-thumb" />
                  <div className="p-5 flex-1 flex flex-col gap-3">
                    <div className="flex justify-between items-center gap-4">
                      <div className="h-3 w-14 skeleton-text" />
                      <div className="h-3 w-8 skeleton-text" />
                    </div>
                    <div className="h-4 w-full skeleton-text mt-1" />
                    <div className="h-4 w-3/4 skeleton-text" />
                    <div className="h-3 w-20 skeleton-text mt-1" />
                    <div className="mt-3 pt-3 border-t border-zinc-100 flex gap-2">
                      <div className="h-5 w-14 skeleton-text" />
                      <div className="h-5 w-14 skeleton-text" />
                    </div>
                  </div>
                </div>
              ))}
            </>
          ) : data.items?.length === 0 ? (
            <div className="col-span-full text-center p-16 bg-white border border-zinc-200 rounded-2xl max-w-lg mx-auto w-full animate-fade-in my-12" style={{ boxShadow: 'var(--totem-shadow-elevated)' }}>
              <Search size={40} className="mx-auto text-zinc-300 mb-4" />
              <h2 className="text-lg font-bold text-zinc-900 mb-2 font-display">Aucun e-poster trouvé</h2>
              <p className="text-sm text-zinc-500 leading-relaxed font-medium">
                Nous n'avons trouvé aucun document correspondant à vos critères de recherche. Essayez de simplifier ou de modifier vos filtres.
              </p>
            </div>
          ) : (
            data.items?.map((p) => (
              <div
                key={p.id}
                onClick={() => {
                  const searchParamStr = [
                    `screen=${screen}`,
                    `page=${page}`,
                    eventId ? `eventId=${encodeURIComponent(eventId)}` : '',
                    q ? `q=${encodeURIComponent(q)}` : '',
                    category ? `category=${encodeURIComponent(category)}` : '',
                    session ? `session=${encodeURIComponent(session)}` : '',
                    room ? `room=${encodeURIComponent(room)}` : '',
                  ].filter(Boolean).join('&');
                  const path = `/totem/publications/${p.id}?${searchParamStr}`;
                  navigate(path);
                }}
                className="totem-pub-card animate-fade-in group"
              >
                {/* Card Thumbnail Canvas */}
                <div className="totem-pub-card-thumb">

                  {p.posterUrl ? (
                    <img
                      src={getPosterThumbnail(p.posterUrl)}
                      alt={p.title}
                    />
                  ) : (
                    <div className="w-full h-full bg-zinc-50 flex flex-col items-center justify-center gap-2">
                      <ImageIcon size={28} className="text-zinc-300" />
                      <span className="text-[10px] text-zinc-400 font-bold tracking-wider uppercase">Affiche non disponible</span>
                    </div>
                  )}

                  {/* Visual Status Indicator */}
                  {p.status === 'PUBLISHED' && (
                    <div className="absolute top-3 right-3 bg-white text-zinc-700 px-2.5 py-1 text-[10px] font-bold rounded-lg border border-zinc-200 flex items-center gap-1.5 theme-transition" style={{ boxShadow: 'var(--totem-shadow)' }}>
                      <span className="w-1.5 h-1.5 rounded-full bg-theme-secondary animate-pulse" />
                      Interactif
                    </div>
                  )}
                </div>

                {/* Card metadata details */}
                <div className="totem-pub-card-body">
                  <div>
                    {/* Category & ID badge */}
                    <div className="flex items-center justify-between gap-2 mb-2">
                      {p.category ? (
                        <span className="totem-badge totem-badge-primary theme-transition">
                          <Tag size={9} /> {p.category}
                        </span>
                      ) : <span />}
                      <span className="text-[10px] font-mono font-extrabold text-zinc-400 bg-zinc-100 px-2 py-0.5 rounded-md border border-zinc-200">
                        N° {p.id}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-[11px] font-extrabold line-clamp-2 leading-snug mb-1 text-zinc-900 group-hover:text-theme-primary transition-colors duration-200 font-display theme-transition">
                      {p.title}
                    </h3>

                    {/* Authors */}
                    <p className="text-[10px] text-zinc-400 line-clamp-1 mb-2 font-semibold">
                      {p.authors || "Auteurs non renseignés"}
                    </p>
                  </div>

                  {/* Date/Location Details */}
                  <div className="mt-auto pt-2 border-t border-zinc-100 flex flex-wrap gap-1.5 items-center justify-between">
                    <div className="flex flex-wrap gap-1.5">
                      {p.session && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-zinc-100 text-zinc-500 rounded-lg text-[9px] font-bold uppercase tracking-wider theme-transition">
                          <Clock size={9} className="text-zinc-400" /> {p.session}
                        </span>
                      )}
                      {p.room && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-zinc-100 text-zinc-500 rounded-lg text-[9px] font-bold uppercase tracking-wider theme-transition">
                          <MapPin size={9} className="text-zinc-400" /> {p.room}
                        </span>
                      )}
                    </div>
                    <span className="text-[9px] font-bold text-zinc-400 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-theme-primary/60" />
                      {p.viewCount || 0} vues
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      {/* Pagination Footer */}
      <footer className="border-t-[1.5px] border-zinc-200 bg-white px-8 py-3 flex justify-between items-center sticky bottom-0 z-20 shrink-0 theme-transition" style={{ boxShadow: '0 -2px 8px rgba(0,0,0,0.03)' }}>
        <div className="totem-page-nav">
          <button
            disabled={page <= 0}
            onClick={() => setPage((x) => x - 1)}
            className="totem-page-btn"
          >
            <ChevronLeft size={15} /> Précédent
          </button>
        </div>
        <span className="totem-page-info">
          Page {data.page + 1} / {Math.max(data.totalPages, 1)}
        </span>
        <div className="totem-page-nav">
          <button
            disabled={page + 1 >= data.totalPages}
            onClick={() => setPage((x) => x + 1)}
            className="totem-page-btn"
          >
            Suivant <ChevronRight size={15} />
          </button>
        </div>
      </footer>


    </div>
  );
}