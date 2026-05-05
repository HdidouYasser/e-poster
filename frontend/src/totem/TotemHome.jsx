import { useMemo } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "../api";
import { Presentation, MonitorPlay, ArrowRight } from "lucide-react";

export default function TotemHome() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const screen = params.get("screen") || "1";

  const activeEventQuery = useQuery({
    queryKey: ["totem-active-event"],
    queryFn: async () => (await api.get("/events/active")).data,
    retry: false
  });

  const eventsQuery = useQuery({
    queryKey: ["totem-events", 0, 20],
    queryFn: async () => (await api.get("/events?page=0&size=20")).data,
    enabled: activeEventQuery.isError
  });

  const selectedEvent = useMemo(
    () => activeEventQuery.data || eventsQuery.data?.items?.[0],
    [activeEventQuery.data, eventsQuery.data]
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col relative overflow-hidden">
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-blue-600/10 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-indigo-600/10 blur-[150px] rounded-full pointer-events-none" />

      <header className="flex items-center justify-between p-8 relative z-10 border-b border-slate-800/50 bg-slate-950/50 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <Presentation size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">E-Poster <span className="text-indigo-400">Totem</span></h1>
        </div>
        <div className="flex gap-4">
          <Link to={`/totem/publications?screen=${screen}`} className="px-8 py-4 bg-slate-900 border border-slate-700 hover:border-slate-500 rounded-2xl text-xl font-semibold transition-all hover:bg-slate-800 flex items-center gap-3">
            Explorer les Posters
          </Link>
          <button
            onClick={() => window.open(`${window.location.origin}/totem?screen=2`, "totem-screen-2")}
            className="px-8 py-4 bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 hover:bg-indigo-600/30 rounded-2xl text-xl font-semibold transition-all flex items-center gap-3"
          >
            <MonitorPlay size={24} /> Mode 2nd Écran
          </button>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-8 relative z-10">
        <div className="max-w-4xl w-full">
          {(activeEventQuery.isLoading || eventsQuery.isLoading) ? (
            <div className="flex flex-col items-center justify-center space-y-6 animate-pulse">
              <div className="w-24 h-24 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
              <div className="text-2xl text-slate-400">Chargement de l'événement...</div>
            </div>
          ) : !selectedEvent ? (
            <div className="text-center p-16 bg-slate-900/50 border border-slate-800 rounded-3xl backdrop-blur-sm">
              <Presentation size={64} className="mx-auto text-slate-600 mb-6" />
              <h2 className="text-3xl font-bold text-white mb-4">Aucun événement actif</h2>
              <p className="text-xl text-slate-400">Veuillez configurer un événement dans l'interface d'administration.</p>
            </div>
          ) : (
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-[2rem] p-12 backdrop-blur-xl shadow-2xl hover:border-indigo-500/30 transition-all duration-500">
              <div className="inline-block px-4 py-1.5 rounded-full bg-indigo-500/20 text-indigo-300 font-semibold text-sm mb-6 border border-indigo-500/20">
                Événement en cours
              </div>
              <h2 className="text-5xl font-extrabold text-white mb-6 leading-tight">{selectedEvent.title}</h2>
              <p className="text-2xl text-slate-400 mb-12 leading-relaxed">{selectedEvent.description}</p>
              
              <button
                onClick={() => navigate(`/totem/publications?eventId=${selectedEvent.id}&screen=${screen}`)}
                className="w-full sm:w-auto px-10 py-5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white rounded-2xl text-2xl font-bold transition-all shadow-xl shadow-indigo-600/20 flex items-center justify-center gap-4 group"
              >
                Voir les publications
                <ArrowRight size={28} className="group-hover:translate-x-2 transition-transform" />
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
