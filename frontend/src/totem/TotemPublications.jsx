import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { publicApi } from "../api";
import { useIdleTimer } from "../hooks/useIdleTimer";
import { createTotemSync } from "./totemSync";
import { Home, Search, MonitorPlay, ChevronLeft, ChevronRight, Image as ImageIcon, Keyboard as KeyboardIcon, X, MapPin, Clock } from "lucide-react";
import Keyboard from "react-simple-keyboard";
import "react-simple-keyboard/build/css/index.css";

const sync = createTotemSync();

export default function TotemPublications() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const screen = params.get("screen") || "1";
  const eventId = params.get("eventId") || "";
  const [page, setPage] = useState(Number(params.get("page") || 0));
  const [category, setCategory] = useState(params.get("category") || "");
  const size = 12;

  const [q, setQ] = useState(params.get("q") || "");
  const [showKeyboard, setShowKeyboard] = useState(false);
  const endpoint = useMemo(() => {
    let base = `/publications?page=${page}&size=${size}`;
    if (q.trim()) {
      base = `/publications/search?q=${encodeURIComponent(q)}&page=${page}&size=${size}`;
    } else if (category || eventId) {
      base = `/publications?page=${page}&size=${size}`;
    }
    
    if (eventId) base += `&eventId=${encodeURIComponent(eventId)}`;
    if (category) base += `&category=${encodeURIComponent(category)}`;
    return base;
  }, [q, page, size, eventId, category]);

  const pubsQuery = useQuery({
    queryKey: ["totem-pubs", page, size, q, eventId, category],
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

  const cp = selectedEvent?.colorPrimary || '#18181b';

  const eventCategories = useMemo(() => {
    if (!categoriesData) return [];
    if (!eventId) return categoriesData;
    return categoriesData.filter(c => !c.event || String(c.event.id) === String(eventId));
  }, [categoriesData, eventId]);

  useEffect(() => {
    setParams((p) => {
      p.set("page", String(page));
      p.set("screen", screen);
      if (eventId) p.set("eventId", eventId);
      if (q) p.set("q", q); else p.delete("q");
      if (category) p.set("category", category); else p.delete("category");
      return p;
    });
  }, [page, q, category, eventId, screen, setParams]);

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
    <div className="min-h-screen flex flex-col bg-zinc-50 text-zinc-900 font-sans" style={{ '--color-primary': cp }}>
      {/* Header */}
      <header className="flex flex-col md:flex-row items-center justify-between px-6 py-4 bg-white border-b border-zinc-200 gap-4 sticky top-0 z-20">
        <Link
          to={`/totem?screen=${screen}`}
          className="px-4 py-2 bg-white hover:bg-zinc-50 border border-zinc-200 text-zinc-700 rounded-md text-sm font-medium transition-colors flex items-center gap-2"
        >
          <Home size={18} /> Accueil
        </Link>
        <div className="relative flex-1 w-full md:max-w-xl">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
          <input
            className="w-full bg-zinc-50 border border-zinc-200 focus:border-zinc-400 focus:bg-white text-zinc-900 placeholder-zinc-400 pl-10 pr-10 py-2 rounded-md text-sm outline-none transition-all"
            value={q}
            onChange={(e) => { setQ(e.target.value); setPage(0); }}
            onFocus={() => setShowKeyboard(true)}
            placeholder="Rechercher un poster..."
          />
          <button 
            onClick={() => setShowKeyboard(!showKeyboard)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors"
          >
            {showKeyboard ? <X size={18} /> : <KeyboardIcon size={18} />}
          </button>

          {showKeyboard && (
            <div className="absolute top-full left-0 right-0 mt-2 p-3 bg-white border border-zinc-200 rounded-lg shadow-lg z-50 animate-fade-in">
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
          className="px-4 py-2 text-white rounded-md text-sm font-medium transition-opacity hover:opacity-90 flex items-center gap-2 shrink-0"
          style={{ backgroundColor: cp }}
        >
          <MonitorPlay size={18} /> Écran {screen === '1' ? '2' : '1'}
        </button>
      </header>

      {/* Categories */}
      {eventCategories?.length > 0 && (
        <div className="bg-white border-b border-zinc-200 px-6 py-3">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
            <button
              onClick={() => { setCategory(""); setPage(0); }}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors whitespace-nowrap border ${!category ? 'text-white border-transparent' : 'bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-50'}`}
              style={!category ? { backgroundColor: cp } : {}}
            >
              Tous
            </button>
            {eventCategories.map(c => (
              <button
                key={c.id}
                onClick={() => { setCategory(c.name); setPage(0); }}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors whitespace-nowrap border ${category === c.name ? 'text-white border-transparent' : 'bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-50'}`}
                style={category === c.name ? { backgroundColor: cp } : {}}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Grid */}
      <main className="flex-1 p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {pubsQuery.isLoading ? (
          <div className="col-span-full flex flex-col items-center justify-center p-20 animate-fade-in">
            <div className="w-8 h-8 border-2 border-zinc-200 rounded-full animate-spin mb-4" style={{ borderTopColor: cp }} />
            <p className="text-sm text-zinc-500 font-medium">Chargement...</p>
          </div>
        ) : data.items?.length === 0 ? (
          <div className="col-span-full text-center p-16 bg-white border border-zinc-200 rounded-xl shadow-sm animate-fade-in">
            <Search size={32} className="mx-auto text-zinc-300 mb-4" />
            <h2 className="text-lg font-semibold text-zinc-900 mb-2">Aucun poster trouvé</h2>
            <p className="text-sm text-zinc-500">Essayez une autre recherche.</p>
          </div>
        ) : (
          data.items?.map((p) => (
            <button
              key={p.id}
              onClick={() => {
                const path = `/totem/publications/${p.id}?screen=${screen}`;
                sync.send({ type: "NAVIGATE", screen, path });
                navigate(path);
              }}
              className="text-left bg-white border border-zinc-200 rounded-xl overflow-hidden flex flex-col transition-shadow hover:shadow-md animate-fade-in group"
            >
              <div className="w-full aspect-[3/4] bg-zinc-100 flex items-center justify-center relative border-b border-zinc-200">
                {p.posterUrl ? (
                  <img src={p.posterUrl} alt={p.title} className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon size={32} className="text-zinc-300" />
                )}
                {p.status === 'PUBLISHED' && (
                  <div className="absolute top-3 right-3 bg-white text-zinc-900 px-2 py-1 text-xs font-bold rounded shadow-sm border border-zinc-200 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: cp }} />
                    En Ligne
                  </div>
                )}
              </div>
              <div className="p-4 flex-1 flex flex-col">
                <h3 className="text-base font-semibold line-clamp-2 leading-snug mb-1 text-zinc-900 group-hover:text-blue-600 transition-colors">
                  {p.title}
                </h3>
                <p className="text-sm text-zinc-500 line-clamp-1 mb-3">{p.authors || "Auteurs non spécifiés"}</p>
                <div className="mt-auto flex flex-wrap gap-2">
                  {p.session && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-zinc-50 text-zinc-600 rounded text-xs font-medium border border-zinc-200">
                      <Clock size={12} /> {p.session}
                    </span>
                  )}
                  {p.room && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-zinc-50 text-zinc-600 rounded text-xs font-medium border border-zinc-200">
                      <MapPin size={12} /> {p.room}
                    </span>
                  )}
                </div>
              </div>
            </button>
          ))
        )}
      </main>

      {/* Pagination */}
      <footer className="border-t border-zinc-200 bg-white px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
        <button
          disabled={page <= 0}
          onClick={() => setPage((x) => x - 1)}
          className="w-full md:w-auto px-4 py-2 bg-white hover:bg-zinc-50 border border-zinc-200 disabled:opacity-50 disabled:hover:bg-white rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-2 text-zinc-700"
        >
          <ChevronLeft size={16} /> Précédent
        </button>
        <div className="text-sm font-medium text-zinc-600">
          Page {data.page + 1} / {Math.max(data.totalPages, 1)}
        </div>
        <button
          disabled={page + 1 >= data.totalPages}
          onClick={() => setPage((x) => x + 1)}
          className="w-full md:w-auto px-4 py-2 bg-white hover:bg-zinc-50 border border-zinc-200 disabled:opacity-50 disabled:hover:bg-white rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-2 text-zinc-700"
        >
          Suivant <ChevronRight size={16} />
        </button>
      </footer>
    </div>
  );
}
