import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "../api";
import { useIdleTimer } from "../hooks/useIdleTimer";
import { createTotemSync } from "./totemSync";
import { Home, Search, MonitorPlay, ChevronLeft, ChevronRight, Image as ImageIcon, Keyboard as KeyboardIcon, X } from "lucide-react";
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
    queryKey: ["totem-pubs", page, size, q, eventId],
    queryFn: async () => (await api.get(endpoint)).data
  });

  const data = pubsQuery.data || { items: [], page: 0, totalPages: 1 };

  const { data: categoriesData } = useQuery({
    queryKey: ["totem-categories", eventId],
    queryFn: async () => (await api.get(`/categories`)).data
  });

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
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col p-6 relative overflow-hidden">
      {/* Soft accent */}
      <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-emerald-100/50 blur-[100px] rounded-full pointer-events-none" />

      {/* Header */}
      <header className="flex flex-col md:flex-row items-center justify-between mb-6 md:mb-8 relative z-10 bg-white/80 backdrop-blur-xl p-4 rounded-3xl border border-white/50 shadow-soft gap-4">
        <Link
          to={`/totem?screen=${screen}`}
          className="px-6 md:px-8 py-3 md:py-4 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 rounded-2xl text-base md:text-lg font-bold transition-all flex items-center gap-3"
        >
          <Home size={24} /> Accueil
        </Link>
        <div className="relative flex-1 w-full md:max-w-2xl">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={24} />
          <input
            className="w-full bg-slate-50/80 backdrop-blur-sm border-2 border-slate-100 focus:border-emerald-400 focus:bg-white text-slate-800 placeholder-slate-400 pl-14 pr-14 py-3 md:py-4 rounded-2xl text-base md:text-lg outline-none transition-all shadow-inner"
            value={q}
            onChange={(e) => { setQ(e.target.value); setPage(0); }}
            onFocus={() => setShowKeyboard(true)}
            placeholder="Rechercher un poster..."
          />
          <button 
            onClick={() => setShowKeyboard(!showKeyboard)}
            className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-600 transition-colors"
          >
            {showKeyboard ? <X size={24} /> : <KeyboardIcon size={24} />}
          </button>

          {showKeyboard && (
            <div className="absolute top-full left-0 right-0 mt-4 p-4 bg-white rounded-3xl shadow-2xl border border-slate-200 z-50">
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
          className="px-6 md:px-8 py-3 md:py-4 bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 rounded-2xl text-base md:text-lg font-bold transition-all flex items-center gap-3 shrink-0"
        >
          <MonitorPlay size={24} /> Écran {screen === '1' ? '2' : '1'}
        </button>
      </header>

      {/* Categories Filter */}
      {eventCategories?.length > 0 && (
        <div className="flex items-center gap-2 md:gap-3 mb-6 md:mb-8 overflow-x-auto pb-2 custom-scrollbar relative z-10">
          <button
            onClick={() => { setCategory(""); setPage(0); }}
            className={`px-4 md:px-5 py-2.5 md:py-3 rounded-full text-sm md:text-base font-bold transition-all whitespace-nowrap shadow-sm border ${!category ? 'bg-emerald-500 text-white border-emerald-600 shadow-emerald-200' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
          >
            Tous
          </button>
          {eventCategories.map(c => (
            <button
              key={c.id}
              onClick={() => { setCategory(c.name); setPage(0); }}
              className={`px-4 md:px-5 py-2.5 md:py-3 rounded-full text-sm md:text-base font-bold transition-all whitespace-nowrap shadow-sm border ${category === c.name ? 'bg-emerald-500 text-white border-emerald-600 shadow-emerald-200' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
            >
              {c.name}
            </button>
          ))}
        </div>
      )}

      {/* Grid */}
      <main className="flex-1 relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5">
        {pubsQuery.isLoading ? (
          <div className="col-span-full flex flex-col items-center justify-center p-20">
            <div className="w-16 h-16 border-4 border-emerald-200 border-t-emerald-500 rounded-full animate-spin mb-6" />
            <div className="text-xl text-slate-400">Chargement des publications...</div>
          </div>
        ) : data.items?.length === 0 ? (
          <div className="col-span-full text-center p-20 bg-white border border-slate-200 rounded-3xl shadow-sm">
            <Search size={64} className="mx-auto text-slate-300 mb-6" />
            <h2 className="text-3xl font-bold text-slate-600 mb-4">Aucun poster trouvé</h2>
            <p className="text-xl text-slate-400">Essayez une autre recherche.</p>
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
              className="group text-left bg-white/90 backdrop-blur-md border border-white/60 hover:border-emerald-300 rounded-[2rem] p-5 flex flex-col gap-4 transition-all duration-300 hover:scale-105 hover:-translate-y-2 hover:shadow-2xl hover:shadow-emerald-500/10 shadow-soft animate-fade-in"
            >
              <div className="w-full aspect-[3/4] bg-slate-50 rounded-2xl overflow-hidden border border-slate-100 flex items-center justify-center relative shadow-inner">
                {p.posterUrl ? (
                  <img src={p.posterUrl} alt={p.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                ) : (
                  <ImageIcon size={56} className="text-slate-300" />
                )}
                {p.status === 'PUBLISHED' && (
                  <div className="absolute top-3 right-3 bg-emerald-500 text-white px-3 py-1.5 text-xs md:text-sm font-bold rounded-full shadow-sm">
                    En Ligne
                  </div>
                )}
              </div>
              <div className="flex-1">
                <h3 className="text-lg md:text-xl font-bold line-clamp-2 leading-tight mb-1 text-slate-800 group-hover:text-emerald-700 transition-colors">{p.title}</h3>
                <p className="text-sm md:text-base text-slate-400 line-clamp-2">{p.authors || "Auteurs"}</p>
              </div>
            </button>
          ))
        )}
      </main>

      {/* Footer pagination */}
      <footer className="mt-8 flex flex-col md:flex-row justify-between items-center gap-4 bg-white/80 backdrop-blur-xl p-4 md:p-6 rounded-3xl border border-white/50 shadow-soft relative z-10">
        <button
          disabled={page <= 0}
          onClick={() => setPage((x) => x - 1)}
          className="w-full md:w-auto px-6 md:px-8 py-4 md:py-5 bg-slate-100 hover:bg-slate-200 border border-slate-200 disabled:opacity-50 rounded-2xl text-base md:text-lg font-bold transition-all flex items-center justify-center gap-3 text-slate-700"
        >
          <ChevronLeft size={28} /> Précédent
        </button>
        <div className="text-base md:text-xl font-bold text-slate-600 bg-slate-50 px-6 md:px-8 py-3 md:py-4 rounded-2xl border border-slate-200">
          Page {data.page + 1} <span className="text-slate-300 mx-2">/</span> {Math.max(data.totalPages, 1)}
        </div>
        <button
          disabled={page + 1 >= data.totalPages}
          onClick={() => setPage((x) => x + 1)}
          className="w-full md:w-auto px-6 md:px-8 py-4 md:py-5 bg-slate-100 hover:bg-slate-200 border border-slate-200 disabled:opacity-50 rounded-2xl text-base md:text-lg font-bold transition-all flex items-center justify-center gap-3 text-slate-700"
        >
          Suivant <ChevronRight size={28} />
        </button>
      </footer>
    </div>
  );
}
