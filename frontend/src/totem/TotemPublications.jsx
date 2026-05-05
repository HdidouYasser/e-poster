import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "../api";
import { useIdleTimer } from "../hooks/useIdleTimer";
import { createTotemSync } from "./totemSync";
import { Home, Search, MonitorPlay, ChevronLeft, ChevronRight, Image as ImageIcon } from "lucide-react";

const sync = createTotemSync();

export default function TotemPublications() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const screen = params.get("screen") || "1";
  const eventId = params.get("eventId") || "";
  const [page, setPage] = useState(Number(params.get("page") || 0));
  const size = 12;

  const [q, setQ] = useState(params.get("q") || "");
  const endpoint = useMemo(() => {
    const base = q.trim()
      ? `/publications/search?q=${encodeURIComponent(q)}&page=${page}&size=${size}`
      : `/publications?page=${page}&size=${size}`;
    return eventId ? `${base}&eventId=${encodeURIComponent(eventId)}` : base;
  }, [q, page, size, eventId]);

  const pubsQuery = useQuery({
    queryKey: ["totem-pubs", page, size, q, eventId],
    queryFn: async () => (await api.get(endpoint)).data
  });

  const data = pubsQuery.data || { items: [], page: 0, totalPages: 1 };

  useEffect(() => {
    setParams((p) => {
      p.set("page", String(page));
      p.set("screen", screen);
      if (eventId) p.set("eventId", eventId);
      if (q) p.set("q", q);
      else p.delete("q");
      return p;
    });
  }, [page, q, eventId, screen, setParams]);

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
    <div className="min-h-screen bg-slate-950 text-white flex flex-col p-6 relative overflow-hidden">
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-blue-600/10 blur-[150px] rounded-full pointer-events-none" />

      <header className="flex items-center justify-between mb-8 relative z-10 bg-slate-900/40 p-4 rounded-3xl border border-slate-800/50 backdrop-blur-md">
        <Link to={`/totem?screen=${screen}`} className="px-6 py-4 bg-slate-800 hover:bg-slate-700 rounded-2xl text-xl font-bold transition-all flex items-center gap-3">
          <Home size={28} /> Accueil
        </Link>
        <div className="flex items-center gap-4 flex-1 justify-center max-w-2xl">
          <div className="relative w-full">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={28} />
            <input
              className="w-full bg-slate-950 border-2 border-slate-700/50 focus:border-indigo-500 text-white pl-16 pr-6 py-4 rounded-2xl text-xl outline-none transition-all shadow-inner"
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setPage(0);
              }}
              placeholder="Rechercher un poster (titre, auteur, mots-clés)..."
            />
          </div>
        </div>
        <button
          onClick={() => window.open(`${window.location.origin}/totem/publications?screen=${Number(screen) + 1}`, `totem-screen-${Number(screen) + 1}`)}
          className="px-6 py-4 bg-indigo-600/20 text-indigo-400 hover:bg-indigo-600/30 border border-indigo-500/30 rounded-2xl text-xl font-bold transition-all flex items-center gap-3"
        >
          <MonitorPlay size={28} /> Lier Écran
        </button>
      </header>

      <main className="flex-1 relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {pubsQuery.isLoading ? (
          <div className="col-span-full flex flex-col items-center justify-center p-20 animate-pulse">
            <div className="w-20 h-20 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mb-6" />
            <div className="text-2xl text-slate-400">Chargement des publications...</div>
          </div>
        ) : data.items?.length === 0 ? (
          <div className="col-span-full text-center p-20 bg-slate-900/50 border border-slate-800 rounded-3xl backdrop-blur-sm">
            <Search size={64} className="mx-auto text-slate-600 mb-6" />
            <h2 className="text-3xl font-bold mb-4">Aucun poster trouvé</h2>
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
              className="group text-left bg-slate-900/80 border border-slate-800 hover:border-indigo-500/50 rounded-3xl p-6 flex flex-col gap-4 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-indigo-500/10 backdrop-blur-sm"
            >
              <div className="w-full aspect-[3/4] bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 flex items-center justify-center relative shadow-inner">
                {p.posterUrl ? (
                  <img src={p.posterUrl} alt={p.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                ) : (
                  <ImageIcon size={48} className="text-slate-700" />
                )}
                {p.status === 'PUBLISHED' && (
                  <div className="absolute top-4 right-4 bg-emerald-500/90 text-white px-3 py-1 text-sm font-bold rounded-full backdrop-blur-md shadow-lg">
                    En Ligne
                  </div>
                )}
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold line-clamp-2 leading-tight mb-2 group-hover:text-indigo-300 transition-colors">{p.title}</h3>
                <p className="text-lg text-slate-400 line-clamp-2">{p.authors || "Auteurs multiples"}</p>
              </div>
            </button>
          ))
        )}
      </main>

      <footer className="mt-8 flex justify-between items-center bg-slate-900/40 p-4 rounded-3xl border border-slate-800/50 backdrop-blur-md relative z-10">
        <button 
          disabled={page <= 0} 
          onClick={() => setPage((x) => x - 1)}
          className="px-8 py-4 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:hover:bg-slate-800 rounded-2xl text-xl font-bold transition-all flex items-center gap-3"
        >
          <ChevronLeft size={28} /> Précédent
        </button>
        <div className="text-2xl font-bold text-slate-300 bg-slate-950 px-8 py-3 rounded-2xl border border-slate-800">
          Page {data.page + 1} <span className="text-slate-600 mx-2">/</span> {Math.max(data.totalPages, 1)}
        </div>
        <button 
          disabled={page + 1 >= data.totalPages} 
          onClick={() => setPage((x) => x + 1)}
          className="px-8 py-4 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:hover:bg-slate-800 rounded-2xl text-xl font-bold transition-all flex items-center gap-3"
        >
          Suivant <ChevronRight size={28} />
        </button>
      </footer>
    </div>
  );
}
