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
    if (q.trim()) base = `/publications/search?q=${encodeURIComponent(q)}&page=${page}&size=${size}`;
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
    return Array.from(new Set(allPubsQuery.data.items.map(p => p.session).filter(Boolean))).sort();
  }, [allPubsQuery.data]);

  const availableRooms = useMemo(() => {
    if (!allPubsQuery.data?.items) return [];
    return Array.from(new Set(allPubsQuery.data.items.map(p => p.room).filter(Boolean))).sort();
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

  useIdleTimer({ timeoutMs: 60_000, onIdle: () => navigate(`/totem?screen=${screen}`), enabled: true });

  useEffect(() => {
    return sync.onMessage((msg) => {
      if (!msg || msg.type !== "NAVIGATE") return;
      if (String(msg.screen) === String(screen)) return;
      navigate(msg.path);
    });
  }, [navigate, screen]);

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 text-zinc-900 font-sans theme-transition bg-dot-grid relative overflow-hidden">

      {/* ── Header ── */}
      <header className="flex flex-col md:flex-row items-center justify-between px-7 py-4 bg-white border-b border-zinc-200/70 gap-3 sticky top-0 z-20 shadow-sm theme-transition">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <Link
            to={`/totem?screen=${screen}`}
            className="px-3 py-2 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 text-zinc-700 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 shrink-0 active:scale-95"
          >
            <Home size={14} /> Accueil
          </Link>

          {selectedEvent?.logoUrl && (
            <img
              src={getMediaUrl(selectedEvent.logoUrl)}
              alt="Logo"
              className="h-9 max-w-[100px] object-contain hidden sm:block bg-zinc-50 p-1 rounded-lg border border-zinc-200"
            />
          )}
          <div className="hidden lg:block">
            <h2 className="text-sm font-bold text-zinc-900 truncate max-w-[200px] font-display theme-transition">
              {selectedEvent?.title || "Congrès E-Poster"}
            </h2>
            <p className="text-[10px] text-zinc-400 font-medium">Recherche communications</p>
          </div>
        </div>

        {/* Search bar */}
        <div className="relative flex-1 w-full md:max-w-xl">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
          <input
            className="w-full bg-zinc-50 border border-zinc-200 focus:border-zinc-400 focus:bg-white text-zinc-900 placeholder-zinc-400 pl-10 pr-11 py-2.5 rounded-xl text-sm outline-none transition-all"
            value={q}
            onChange={(e) => { setQ(e.target.value); setPage(0); }}
            onFocus={() => setShowKeyboard(true)}
            placeholder="Rechercher par titre, auteur, mot-clé..."
          />
          <button
            onClick={() => setShowKeyboard(!showKeyboard)}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-zinc-400 hover:text-zinc-700 transition-colors rounded-lg hover:bg-zinc-100"
          >
            {showKeyboard ? <X size={16} /> : <KeyboardIcon size={16} />}
          </button>

          {showKeyboard && (
            <div className="absolute top-full left-0 right-0 mt-2 p-3 bg-white border border-zinc-200 rounded-2xl shadow-2xl z-50 animate-scale-in">
              <Keyboard
                keyboardRef={r => (window.keyboard = r)}
                layoutName="default"
                onChange={(input) => { setQ(input); setPage(0); }}
                onKeyPress={(button) => { if (button === "{enter}") setShowKeyboard(false); }}
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
                display={{ "{bksp}": "effacer", "{enter}": "valider", "{space}": "espace" }}
              />
            </div>
          )}
        </div>

        <button
          onClick={() => window.open(`${window.location.origin}/totem/publications?screen=${Number(screen) + 1}`, `totem-screen-${Number(screen) + 1}`)}
          style={{ backgroundColor: 'var(--theme-primary)', color: 'var(--theme-foreground)' }}
          className="w-full md:w-auto px-4 py-2 hover:opacity-90 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shrink-0 active:scale-95 font-display"
        >
          <Monitor size={14} /> Écran {screen === '1' ? '2' : '1'}
        </button>
      </header>

      {/* ── Filter Toolbar ── */}
      <div className="bg-white border-b border-zinc-100 px-7 py-3 flex flex-col sm:flex-row gap-3 items-center justify-between z-10">
        {eventCategories?.length > 0 ? (
          <div className="flex-1 flex items-center gap-2 overflow-x-auto pb-0.5 max-w-full">
            <button
              onClick={() => { setCategory(""); setPage(0); }}
              style={!category ? { backgroundColor: 'var(--theme-primary)', color: 'var(--theme-foreground)' } : {}}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border shrink-0 theme-transition ${
                !category ? 'border-transparent shadow-sm' : 'bg-zinc-50 text-zinc-600 border-zinc-200 hover:bg-zinc-100'
              }`}
            >
              Tous les thèmes
            </button>
            {eventCategories.map(c => (
              <button
                key={c.id}
                onClick={() => { setCategory(c.name); setPage(0); }}
                style={category === c.name ? { backgroundColor: 'var(--theme-primary)', color: 'var(--theme-foreground)' } : {}}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border shrink-0 theme-transition ${
                  category === c.name ? 'border-transparent shadow-sm' : 'bg-zinc-50 text-zinc-600 border-zinc-200 hover:bg-zinc-100'
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>
        ) : <div className="flex-1" />}

        <div className="flex gap-2 w-full sm:w-auto justify-end shrink-0">
          {availableSessions.length > 0 && (
            <select
              value={session}
              onChange={(e) => { setSession(e.target.value); setPage(0); }}
              className="bg-zinc-50 border border-zinc-200 text-zinc-700 text-xs font-semibold rounded-lg px-3 py-1.5 outline-none hover:bg-zinc-100 transition-colors focus:border-zinc-400"
            >
              <option value="">Toutes les sessions</option>
              {availableSessions.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          )}
          {availableRooms.length > 0 && (
            <select
              value={room}
              onChange={(e) => { setRoom(e.target.value); setPage(0); }}
              className="bg-zinc-50 border border-zinc-200 text-zinc-700 text-xs font-semibold rounded-lg px-3 py-1.5 outline-none hover:bg-zinc-100 transition-colors focus:border-zinc-400"
            >
              <option value="">Toutes les salles</option>
              {availableRooms.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          )}
        </div>
      </div>

      {/* ── Grid ── */}
      <main className="flex-1 p-7 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {pubsQuery.isLoading ? (
          <div className="col-span-full flex flex-col items-center justify-center p-20 animate-fade-in">
            <div className="loading-spinner mb-4" style={{ borderTopColor: 'var(--theme-primary)' }} />
            <p className="text-sm text-zinc-400 font-semibold">Recherche des communications...</p>
          </div>

        ) : data.items?.length === 0 ? (
          <div className="col-span-full text-center p-16 bg-white border border-zinc-200 rounded-3xl shadow-sm max-w-md mx-auto w-full animate-fade-in my-10">
            <Search size={40} className="mx-auto text-zinc-300 mb-4" />
            <h2 className="text-lg font-bold text-zinc-800 mb-2 font-display">Aucun e-poster trouvé</h2>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Aucun document ne correspond à vos critères. Essayez de modifier vos filtres.
            </p>
          </div>

        ) : (
          data.items?.map((p, i) => (
            <div
              key={p.id}
              onClick={() => {
                const path = `/totem/publications/${p.id}?screen=${screen}`;
                sync.send({ type: "NAVIGATE", screen, path });
                navigate(path);
              }}
              style={{ animationDelay: `${i * 40}ms` }}
              className="text-left bg-white border border-zinc-200 rounded-3xl overflow-hidden flex flex-col transition-all duration-200 hover:shadow-lg hover:-translate-y-1 animate-fade-in group cursor-pointer"
            >
              {/* Thumbnail */}
              <div className="w-full aspect-[3/4] bg-zinc-50 relative border-b border-zinc-100 overflow-hidden flex items-center justify-center">
                {p.posterUrl ? (
                  <img
                    src={getPosterThumbnail(p.posterUrl)}
                    alt={p.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full bg-zinc-50 flex flex-col items-center justify-center gap-2">
                    <ImageIcon size={28} className="text-zinc-300" />
                    <span className="text-[10px] text-zinc-400 font-bold tracking-wider">Affiche non disponible</span>
                  </div>
                )}

                {p.status === 'PUBLISHED' && (
                  <div className="absolute top-3 right-3 bg-white text-zinc-800 px-2 py-0.5 text-[10px] font-bold rounded-lg shadow-sm border border-zinc-200/50 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-theme-secondary animate-pulse" />
                    Interactif
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  {p.category && (
                    <span className="inline-flex items-center gap-1 text-[9px] font-extrabold text-theme-primary uppercase tracking-wider mb-1.5 theme-transition">
                      <Tag size={9} /> {p.category}
                    </span>
                  )}
                  <h3 className="text-sm font-bold line-clamp-2 leading-snug mb-1 text-zinc-900 group-hover:text-theme-secondary transition-colors duration-200 font-display theme-transition">
                    {p.title}
                  </h3>
                  <p className="text-xs text-zinc-400 line-clamp-1 mb-3">
                    {p.authors || "Auteurs non renseignés"}
                  </p>
                </div>

                <div className="mt-auto pt-3 border-t border-zinc-100 flex flex-wrap gap-1.5">
                  {p.session && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-zinc-50 text-zinc-600 rounded-lg text-[10px] font-semibold border border-zinc-100">
                      <Clock size={9} className="text-theme-secondary" /> {p.session}
                    </span>
                  )}
                  {p.room && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-zinc-50 text-zinc-600 rounded-lg text-[10px] font-semibold border border-zinc-100">
                      <MapPin size={9} className="text-theme-secondary" /> {p.room}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </main>

      {/* ── Pagination Footer ── */}
      <footer className="border-t border-zinc-200 bg-white px-7 py-4 flex flex-col md:flex-row justify-between items-center gap-3 sticky bottom-0 z-20 shadow-md theme-transition">
        <button
          disabled={page <= 0}
          onClick={() => setPage((x) => x - 1)}
          className="w-full md:w-auto px-5 py-2 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 disabled:opacity-40 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 text-zinc-700 active:scale-95"
        >
          <ChevronLeft size={13} /> Précédent
        </button>
        <div className="text-xs font-bold text-zinc-400 tracking-wider">
          PAGE {data.page + 1} / {Math.max(data.totalPages, 1)}
        </div>
        <button
          disabled={page + 1 >= data.totalPages}
          onClick={() => setPage((x) => x + 1)}
          className="w-full md:w-auto px-5 py-2 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 disabled:opacity-40 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 text-zinc-700 active:scale-95"
        >
          Suivant <ChevronRight size={13} />
        </button>
      </footer>
    </div>
  );
}
