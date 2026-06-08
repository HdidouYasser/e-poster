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
    <div className="min-h-screen flex flex-col bg-theme-bg-light text-zinc-900 font-sans transition-colors duration-500 bg-dot-grid theme-transition relative overflow-hidden">

      {/* Header Panel */}
      <header className="flex flex-col md:flex-row items-center justify-between px-8 py-5 bg-white/80 backdrop-blur-md border-b border-zinc-200/60 gap-4 sticky top-0 z-20 shadow-sm theme-transition">
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
            <Home size={16} /> Congrès
          </Link>

          
          {selectedEvent?.logoUrl && (
            <img 
              src={getMediaUrl(selectedEvent.logoUrl)} 
              alt="Logo" 
              className="h-10 max-w-[120px] object-contain hidden sm:block bg-zinc-50 p-1 rounded-lg border border-zinc-200 shadow-sm" 
            />
          )}
          <div className="hidden lg:block">
            <h2 className="text-sm font-bold text-zinc-950 truncate max-w-[200px] font-display theme-transition">
              {selectedEvent?.title || "Congrès E-Poster"}
            </h2>
            <p className="text-[10px] text-zinc-500 font-medium">Recherche communications</p>
          </div>
        </div>

        {/* Styled search container */}
        <div className="relative flex-1 w-full md:max-w-xl">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 peer-focus:text-blue-600 transition-colors" size={18} />
          <input
            className="peer w-full bg-white border border-zinc-200 focus:border-blue-600 focus:ring-1 focus:ring-blue-500/20 text-zinc-900 placeholder-zinc-400 pl-11 pr-12 py-3 rounded-2xl text-sm outline-none transition-all shadow-sm hover:shadow-md"
            value={q}
            onChange={(e) => { setQ(e.target.value); setPage(0); }}
            onFocus={() => setShowKeyboard(true)}
            placeholder="Rechercher par titre, auteur, mot-clé..."
          />
          <button 
            onClick={() => setShowKeyboard(!showKeyboard)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1.5 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-all rounded-lg"
          >
            {showKeyboard ? <X size={18} /> : <KeyboardIcon size={18} />}
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
            style={{ backgroundColor: 'var(--theme-primary)', color: 'var(--theme-foreground)' }}
            className="w-full md:w-auto px-5 py-2.5 hover:opacity-90 hover:brightness-110 rounded-xl text-sm font-bold shadow-sm transition-all flex items-center justify-center gap-2 shrink-0 active:scale-95 theme-transition font-display"
          >
            <Monitor size={16} /> Écran {screen === '1' ? '2' : '1'}
          </button>
        )}
      </header>

      {/* ── Navigation Stepper ── */}
      <div className="max-w-7xl mx-auto px-8 pt-8 w-full">
        <div className="flex items-center justify-center bg-white/60 backdrop-blur-sm border border-zinc-200/60 rounded-2xl py-3 px-6 shadow-sm w-fit mx-auto gap-4 md:gap-8 text-[10px] md:text-xs font-bold uppercase tracking-wider text-zinc-400 theme-transition">
          <Link to="/" className="flex items-center gap-2 text-zinc-550 hover:text-zinc-900 transition-colors">
            <span className="w-5 h-5 rounded-full bg-zinc-100 flex items-center justify-center text-[10px]">1</span>
            <span className="hidden sm:inline">Portail</span>
          </Link>
          <span className="text-zinc-300">/</span>
          <Link to={`/totem?screen=${screen}`} className="flex items-center gap-2 text-zinc-550 hover:text-zinc-900 transition-colors">
            <span className="w-5 h-5 rounded-full bg-zinc-100 flex items-center justify-center text-[10px]">2</span>
            <span className="hidden sm:inline">Sélection Congrès</span>
          </Link>
          <span className="text-zinc-300">/</span>
          <div className="flex items-center gap-2 text-blue-600">
            <span className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center text-[10px]">3</span>
            <span className="hidden sm:inline">E-Posters</span>
          </div>
          <span className="text-zinc-300">/</span>
          <div className="flex items-center gap-2 opacity-50">
            <span className="w-5 h-5 rounded-full bg-zinc-150 flex items-center justify-center text-[10px] text-zinc-500">4</span>
            <span className="hidden sm:inline">Lecture Poster</span>
          </div>
        </div>
      </div>

      {/* Categories & Select Filter Toolbar */}
      <div className="bg-white/50 backdrop-blur-sm border-b border-zinc-200/60 px-8 py-4 flex flex-col sm:flex-row gap-4 items-center justify-between z-10">
        {eventCategories?.length > 0 ? (
          <div className="flex-1 flex items-center gap-2 overflow-x-auto pb-1.5 max-w-full scrollbar-thin">
            <button
              onClick={() => { setCategory(""); setPage(0); }}
              style={!category ? { backgroundColor: 'var(--theme-primary)', color: 'var(--theme-foreground)' } : {}}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border shrink-0 theme-transition font-display ${!category ? 'border-transparent shadow-md' : 'bg-white text-zinc-600 border-zinc-200/80 hover:bg-zinc-50'}`}
            >
              Tous les thèmes
            </button>
            {eventCategories.map(c => (
              <button
                key={c.id}
                onClick={() => { setCategory(c.name); setPage(0); }}
                style={category === c.name ? { backgroundColor: 'var(--theme-primary)', color: 'var(--theme-foreground)' } : {}}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border shrink-0 theme-transition font-display ${category === c.name ? 'border-transparent shadow-md' : 'bg-white text-zinc-600 border-zinc-200/80 hover:bg-zinc-50'}`}
              >
                {c.name}
              </button>
            ))}
          </div>
        ) : <div className="flex-1"></div>}
        
        <div className="flex gap-3 w-full sm:w-auto justify-end shrink-0">
          <select
            value={sort}
            onChange={(e) => { setSort(e.target.value); setPage(0); }}
            className="bg-white border border-zinc-200 text-zinc-700 text-xs font-bold rounded-xl px-3 py-2 outline-none hover:bg-zinc-50 transition-colors focus:border-theme-primary shadow-sm theme-transition"
          >
            <option value="id,asc">Trier par N° (Croissant)</option>
            <option value="title,asc">Trier par Titre (A-Z)</option>
            <option value="createdAt,desc">Trier par Nouveauté</option>
          </select>
          {availableSessions.length > 0 && (
            <select
              value={session}
              onChange={(e) => { setSession(e.target.value); setPage(0); }}
              className="bg-white border border-zinc-200 text-zinc-700 text-xs font-bold rounded-xl px-3 py-2 outline-none hover:bg-zinc-50 transition-colors focus:border-theme-primary shadow-sm theme-transition"
            >
              <option value="">Toutes les sessions</option>
              {availableSessions.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          )}
          {availableRooms.length > 0 && (
            <select
              value={room}
              onChange={(e) => { setRoom(e.target.value); setPage(0); }}
              className="bg-white border border-zinc-200 text-zinc-700 text-xs font-bold rounded-xl px-3 py-2 outline-none hover:bg-zinc-50 transition-colors focus:border-theme-primary shadow-sm theme-transition"
            >
              <option value="">Toutes les salles</option>
              {availableRooms.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          )}
        </div>
      </div>

      {/* Main Grid View */}
      <main className="flex-1 p-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {pubsQuery.isLoading ? (
          <>
            {Array.from({ length: 8 }).map((_, idx) => (
              <div key={idx} className="skeleton-card shimmer-pulse">
                <div className="skeleton-thumb" />
                <div className="p-5 flex-1 flex flex-col gap-2.5">
                  <div className="flex justify-between items-center gap-4">
                    <div className="h-3.5 w-16 skeleton-text" />
                    <div className="h-3.5 w-8 skeleton-text" />
                  </div>
                  <div className="h-4 w-full skeleton-text mt-1" />
                  <div className="h-4 w-3/4 skeleton-text" />
                  <div className="h-3 w-24 skeleton-text mt-1" />
                  <div className="mt-4 pt-3 border-t border-zinc-100 flex gap-2">
                    <div className="h-5 w-14 skeleton-text" />
                    <div className="h-5 w-14 skeleton-text" />
                  </div>
                </div>
              </div>
            ))}
          </>
        ) : data.items?.length === 0 ? (
          <div className="col-span-full text-center p-20 bg-white/60 backdrop-blur-md border border-zinc-200/60 rounded-3xl shadow-sm max-w-lg mx-auto w-full animate-fade-in my-12">
            <Search size={48} className="mx-auto text-zinc-305 mb-4 animate-pulse" />
            <h2 className="text-xl font-bold text-zinc-800 mb-2 font-display">Aucun e-poster trouvé</h2>
            <p className="text-xs text-zinc-500 leading-relaxed">
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
                  eventId    ? `eventId=${encodeURIComponent(eventId)}`     : '',
                  q          ? `q=${encodeURIComponent(q)}`                 : '',
                  category   ? `category=${encodeURIComponent(category)}`   : '',
                  session    ? `session=${encodeURIComponent(session)}`     : '',
                  room       ? `room=${encodeURIComponent(room)}`           : '',
                ].filter(Boolean).join('&');
                const path = `/totem/publications/${p.id}?${searchParamStr}`;
                navigate(path);
              }}
              className="text-left bg-white/80 backdrop-blur-sm border border-zinc-200/60 rounded-3xl overflow-hidden flex flex-col transition-all duration-300 hover:shadow-xl hover:-translate-y-1.5 animate-fade-in group cursor-pointer theme-transition hover:border-theme-primary/20"
            >
              {/* Card Thumbnail Canvas */}
              <div className="w-full aspect-[3/4] bg-zinc-50 relative border-b border-zinc-100 overflow-hidden flex items-center justify-center">


                {p.posterUrl ? (
                  <img 
                    src={getPosterThumbnail(p.posterUrl)} 
                    alt={p.title} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                  />
                ) : (
                  <div className="w-full h-full bg-zinc-50 flex flex-col items-center justify-center gap-2">
                    <ImageIcon size={32} className="text-zinc-300" />
                    <span className="text-[10px] text-zinc-400 font-bold tracking-wider">Affiche non disponible</span>
                  </div>
                )}
                
                {/* Visual Status Indicator */}
                {p.status === 'PUBLISHED' && (
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm text-zinc-800 px-2.5 py-1 text-[10px] font-bold rounded-lg shadow-sm border border-zinc-200/50 flex items-center gap-1.5 theme-transition">
                    <span className="w-1.5 h-1.5 rounded-full bg-theme-secondary animate-pulse" />
                    Interactif
                  </div>
                )}
              </div>

              {/* Card metadata details */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  {/* Category & ID badge */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    {p.category ? (
                      <span className="inline-flex items-center gap-1 text-[9px] font-extrabold text-theme-primary uppercase tracking-wider theme-transition">
                        <Tag size={10} /> {p.category}
                      </span>
                    ) : <span />}
                    <span className="text-[9px] font-mono font-extrabold text-zinc-400 bg-zinc-100 px-2 py-0.5 rounded-lg border border-zinc-200/40">
                      N° {p.id}
                    </span>
                  </div>
                  
                  {/* Title */}
                  <h3 className="text-sm font-bold line-clamp-2 leading-snug mb-1 text-zinc-900 group-hover:text-theme-primary transition-colors duration-300 font-display theme-transition">
                    {p.title}
                  </h3>

                  {/* Authors */}
                  <p className="text-xs text-zinc-500 line-clamp-1 mb-4 font-medium">
                    {p.authors || "Auteurs non renseignés"}
                  </p>
                </div>

                {/* Date/Location Details */}
                <div className="mt-auto pt-3 border-t border-zinc-100 flex flex-wrap gap-2">
                  {p.session && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-zinc-50 text-zinc-650 rounded-lg text-[10px] font-semibold border border-zinc-200/60 theme-transition">
                      <Clock size={10} className="text-theme-secondary" /> {p.session}
                    </span>
                  )}
                  {p.room && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-zinc-50 text-zinc-650 rounded-lg text-[10px] font-semibold border border-zinc-200/60 theme-transition">
                      <MapPin size={10} className="text-theme-secondary" /> {p.room}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </main>

      {/* Pagination Footer */}
      <footer className="border-t border-zinc-200 bg-white/80 backdrop-blur-md px-8 py-4 flex justify-between items-center sticky bottom-0 z-20 shadow-md theme-transition">
        <div className="totem-page-nav">
          <button
            disabled={page <= 0}
            onClick={() => setPage((x) => x - 1)}
            className="totem-page-btn"
          >
            <ChevronLeft size={16} /> Précédent
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
            Suivant <ChevronRight size={16} />
          </button>
        </div>
      </footer>


    </div>
  );
}
