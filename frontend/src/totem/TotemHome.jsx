import { useMemo } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "../api";
import { Presentation, MonitorPlay, ArrowRight, Calendar } from "lucide-react";

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
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col relative overflow-hidden">
      {/* Soft background blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-100/60 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-100/40 blur-[100px] rounded-full pointer-events-none" />

      {/* Header */}
      <header className="flex items-center justify-between px-10 py-6 relative z-10 bg-white border-b border-slate-200 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-md shadow-emerald-200">
            <Presentation size={30} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-800">
              E-Poster <span className="text-emerald-600">Platform</span>
            </h1>
            <p className="text-sm text-slate-400">Système d'affichage scientifique</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Link
            to={`/totem/publications?screen=${screen}`}
            className="px-6 py-3 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 rounded-xl text-base font-semibold transition-all flex items-center gap-2"
          >
            Explorer les Posters
          </Link>
          <button
            onClick={() => window.open(`${window.location.origin}/totem?screen=2`, "totem-screen-2")}
            className="px-6 py-3 bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 rounded-xl text-base font-semibold transition-all flex items-center gap-2"
          >
            <MonitorPlay size={20} /> Mode 2nd Écran
          </button>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 flex items-center justify-center p-10 relative z-10">
        <div className="max-w-3xl w-full">
          {(activeEventQuery.isLoading || eventsQuery.isLoading) ? (
            <div className="flex flex-col items-center justify-center space-y-6">
              <div className="w-16 h-16 border-4 border-emerald-200 border-t-emerald-500 rounded-full animate-spin" />
              <div className="text-xl text-slate-400 font-medium">Chargement de l'événement...</div>
            </div>
          ) : !selectedEvent ? (
            <div className="text-center p-16 bg-white border border-slate-200 rounded-3xl shadow-sm">
              <Calendar size={64} className="mx-auto text-slate-300 mb-6" />
              <h2 className="text-3xl font-bold text-slate-700 mb-4">Aucun événement actif</h2>
              <p className="text-lg text-slate-400">Veuillez configurer un événement dans l'interface d'administration.</p>
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-[2rem] p-12 shadow-lg hover:shadow-xl hover:border-emerald-200 transition-all duration-500">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold text-sm mb-6 border border-emerald-200">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                Événement en cours
              </div>
              <h2 className="text-5xl font-extrabold text-slate-800 mb-5 leading-tight">{selectedEvent.title}</h2>
              <p className="text-xl text-slate-500 mb-12 leading-relaxed">{selectedEvent.description}</p>

              <button
                onClick={() => navigate(`/totem/publications?eventId=${selectedEvent.id}&screen=${screen}`)}
                className="w-full sm:w-auto px-10 py-5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl text-xl font-bold transition-all shadow-lg shadow-emerald-200 flex items-center justify-center gap-4 group"
              >
                Voir les publications
                <ArrowRight size={24} className="group-hover:translate-x-2 transition-transform" />
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
