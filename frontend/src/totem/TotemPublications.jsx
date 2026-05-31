import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { publicApi, getMediaUrl, getPosterThumbnail } from "../api";
import { useIdleTimer } from "../hooks/useIdleTimer";
import { createTotemSync } from "./totemSync";
import { Home, Search, Monitor, ChevronLeft, ChevronRight, Image as ImageIcon, Keyboard as KeyboardIcon, X, MapPin, Clock, Tag } from "lucide-react";
import Keyboard from "react-simple-keyboard";
import "react-simple-keyboard/build/css/index.css";
import { useDynamicTheme } from "../hooks/useDynamicTheme";

const sync = createTotemSync();

export default function TotemPublications() {
  const navigate = useNavigate();
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
  
  const endpoint = useMemo(() => {
    let base = `/publications?page=${page}&size=${size}`;
    if (q.trim()) {
      base = `/publications/search?q=${encodeURIComponent(q)}&page=${page}&size=${size}`;
    }
    
    if (eventId) base += `&eventId=${encodeURIComponent(eventId)}`;
    if (category) base += `&category=${encodeURIComponent(category)}`;
    if (session) base += `&session=${encodeURIComponent(session)}`;
    if (room) base += `&room=${encodeURIComponent(room)}`;
    return base;
  }, [q, page, size, eventId, category, session, room]);

  const pubsQuery = useQuery({
    queryKey: ["totem-pubs", page, size, q, eventId, category, session, room],
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
    enabled: true
  });

  useEffect(() => {
    return sync.onMessage((msg) => {
      if (!msg || msg.type !== "NAVIGATE") return;
      if (String(msg.screen) === String(screen)) return;
      navigate(msg.path);
    });
  }, [navigate, screen]);

  return (
    <div className="min-h-screen flex flex-col bg-theme-bg-light text-zinc-900 font-sans transition-colors duration-500 bg-dot-grid theme-transition relative overflow-hidden">

      {/* Header Panel */}
      <header className="flex flex-col md:flex-row items-center justify-between px-8 py-5 bg-white/80 backdrop-blur-md border-b border-zinc-200/60 gap-4 sticky top-0 z-20 shadow-sm theme-transition">
        <div className="flex items-center gap-4 w-full md:w-auto">
          <Link
            to={`/totem?screen=${screen}`}
            className="px-4 py-2.5 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 text-zinc-700 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 shadow-sm shrink-0 active:scale-95 theme-transition"
          >
            <Home size={16} /> Accueil
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
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-theme-primary theme-transition" size={18} />
          <input
            className="w-full bg-zinc-50/70 border border-zinc-200 focus:border-theme-primary focus:bg-white text-zinc-900 placeholder-zinc-400 pl-11 pr-12 py-3 rounded-2xl text-sm outline-none transition-all shadow-inner theme-transition"
            value={q}
            onChange={(e) => { setQ(e.target.value); setPage(0); }}
            onFocus={() => setShowKeyboard(true)}
            placeholder="Rechercher par titre, auteur, mot-clé..."
          />
          <button 
            onClick={() => setShowKeyboard(!showKeyboard)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-zinc-400 hover:text-zinc-700 transition-colors rounded-lg hover:bg-zinc-200/50"
          >
            {showKeyboard ? <X size={18} /> : <KeyboardIcon size={18} />}
          </button>

          {showKeyboard && (
            <div className="absolute top-full left-0 right-0 mt-3 p-4 bg-white border border-zinc-200/80 rounded-2xl shadow-2xl z-50 animate-fade-in ring-1 ring-black/5">
              <Keyboard
                keyboardRef={r => (window.keyboard = r)}
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
                  "{bksp}": "effacer",
                  "{enter}": "valider",
                  "{space}": "espace",
                }}
              />
            </div>
          )}
        </div>

        <button
          onClick={() => window.open(`${window.location.origin}/totem/publications?screen=${Number(screen) + 1}`, `totem-screen-${Number(screen) + 1}`)}
          style={{ backgroundColor: 'var(--theme-primary)', color: 'var(--theme-foreground)' }}
          className="w-full md:w-auto px-5 py-2.5 hover:opacity-90 rounded-xl text-sm font-bold shadow-sm transition-all flex items-center justify-center gap-2 shrink-0 active:scale-95 theme-transition font-display"
        >
          <Monitor size={16} /> Écran {screen === '1' ? '2' : '1'}
        </button>
      </header>

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
          <div className="col-span-full flex flex-col items-center justify-center p-24 animate-fade-in">
            <div className="w-10 h-10 border-4 border-zinc-200 border-t-theme-primary rounded-full animate-spin mb-4" />
            <p className="text-sm text-zinc-550 font-semibold tracking-wide">Recherche des communications...</p>
          </div>
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
                const path = `/totem/publications/${p.id}?screen=${screen}`;
                sync.send({ type: "NAVIGATE", screen, path });
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
                  {/* Category badge */}
                  {p.category && (
                    <span className="inline-flex items-center gap-1 text-[9px] font-extrabold text-theme-primary uppercase tracking-wider mb-2 theme-transition">
                      <Tag size={10} /> {p.category}
                    </span>
                  )}
                  
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
      <footer className="border-t border-zinc-200 bg-white/80 backdrop-blur-md px-8 py-5 flex flex-col md:flex-row justify-between items-center gap-4 sticky bottom-0 z-20 shadow-md theme-transition">
        <button
          disabled={page <= 0}
          onClick={() => setPage((x) => x - 1)}
          className="w-full md:w-auto px-5 py-2.5 bg-white hover:bg-zinc-50 border border-zinc-200 disabled:opacity-50 disabled:hover:bg-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2 text-zinc-700 shadow-sm active:scale-95 theme-transition font-display"
        >
          <ChevronLeft size={14} /> Précédent
        </button>
        <div className="text-xs font-bold text-zinc-600 tracking-wider">
          PAGE {data.page + 1} / {Math.max(data.totalPages, 1)}
        </div>
        <button
          disabled={page + 1 >= data.totalPages}
          onClick={() => setPage((x) => x + 1)}
          className="w-full md:w-auto px-5 py-2.5 bg-white hover:bg-zinc-50 border border-zinc-200 disabled:opacity-50 disabled:hover:bg-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2 text-zinc-700 shadow-sm active:scale-95 theme-transition font-display"
        >
          Suivant <ChevronRight size={14} />
        </button>
      </footer>
    </div>
  );
}
