import { useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { publicApi } from "../api";
import { Presentation, ArrowRight, Calendar, Monitor } from "lucide-react";
import { useIdleTimer } from "../hooks/useIdleTimer";

export default function TotemHome() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const screen = params.get("screen") || "1";
  const [selectedScreen, setSelectedScreen] = useState(screen);

  const activeEventQuery = useQuery({
    queryKey: ["totem-active-event"],
    queryFn: async () => (await publicApi.get("/events/active")).data,
    retry: false
  });

  const eventsQuery = useQuery({
    queryKey: ["totem-events", 0, 20],
    queryFn: async () => (await publicApi.get("/events?page=0&size=20")).data,
    enabled: activeEventQuery.isError
  });

  const selectedEvent = useMemo(
    () => activeEventQuery.data || eventsQuery.data?.items?.[0],
    [activeEventQuery.data, eventsQuery.data]
  );

  useIdleTimer({
    timeoutMs: 60_000,
    onIdle: () => navigate(`/totem/slideshow?eventId=${selectedEvent?.id || ""}&screen=${screen}`),
    enabled: true
  });

  const formatDate = (dateStr) => {
    if (!dateStr) return null;
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: 'numeric', month: 'long', year: 'numeric'
    });
  };

  const cp = selectedEvent?.colorPrimary || '#18181b';

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 text-zinc-900 font-sans" style={{ '--color-primary': cp }}>
      {/* Header */}
      <header className="flex items-center justify-between px-8 py-5 bg-white border-b border-zinc-200">
        <div className="flex items-center gap-4">
          {selectedEvent?.logoUrl ? (
            <img src={selectedEvent.logoUrl} alt="Event Logo" className="h-10 object-contain" />
          ) : (
            <div className="w-10 h-10 rounded-md flex items-center justify-center text-white" style={{ backgroundColor: cp }}>
              <Presentation size={20} />
            </div>
          )}
          <div>
            <h1 className="text-xl font-bold tracking-tight text-zinc-900">
              E-Poster Platform
            </h1>
          </div>
        </div>
        <div className="flex gap-3">
          <Link
            to={`/totem/publications?screen=${selectedScreen}`}
            className="px-4 py-2 bg-white hover:bg-zinc-50 border border-zinc-200 text-zinc-700 rounded-md text-sm font-medium transition-colors flex items-center gap-2"
          >
            Posters
          </Link>
          <button
            onClick={() => {
              const newScreen = selectedScreen === '1' ? '2' : '1';
              setSelectedScreen(newScreen);
              window.open(`${window.location.origin}/totem?screen=${newScreen}`, `totem-screen-${newScreen}`);
            }}
            className="px-4 py-2 text-white rounded-md text-sm font-medium transition-colors flex items-center gap-2"
            style={{ backgroundColor: cp }}
          >
            <Monitor size={16} /> Écran {selectedScreen === '1' ? '2' : '1'}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-8">
        <div className="max-w-4xl w-full">
          {(activeEventQuery.isLoading || eventsQuery.isLoading) ? (
            <div className="flex flex-col items-center justify-center space-y-4 animate-fade-in">
              <div className="w-8 h-8 border-2 border-zinc-200 rounded-full animate-spin" style={{ borderTopColor: cp }} />
              <p className="text-sm text-zinc-500 font-medium">Chargement...</p>
            </div>
          ) : !selectedEvent ? (
            <div className="text-center p-12 bg-white border border-zinc-200 rounded-xl shadow-sm animate-fade-in">
              <Calendar size={48} className="mx-auto text-zinc-300 mb-4" />
              <h2 className="text-2xl font-semibold text-zinc-900 mb-2">Aucun événement actif</h2>
              <p className="text-sm text-zinc-500">Veuillez configurer un événement dans l'interface d'administration.</p>
            </div>
          ) : (
            <div className="bg-white border border-zinc-200 shadow-sm rounded-2xl overflow-hidden flex flex-col md:flex-row animate-fade-in">
              <div className="p-8 md:p-12 flex-1 flex flex-col justify-center">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md text-xs font-semibold mb-6 bg-zinc-100 text-zinc-700 border border-zinc-200">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cp }} />
                  Événement en cours
                </div>

                <h2 className="text-4xl md:text-5xl font-bold text-zinc-900 mb-4 tracking-tight leading-tight">
                  {selectedEvent.title}
                </h2>

                {(selectedEvent.startDate || selectedEvent.endDate) && (
                  <div className="flex items-center gap-2 text-zinc-500 mb-6 text-sm font-medium">
                    <Calendar size={16} />
                    {formatDate(selectedEvent.startDate)}
                    {selectedEvent.endDate && ` — ${formatDate(selectedEvent.endDate)}`}
                  </div>
                )}

                <p className="text-base text-zinc-600 mb-10 leading-relaxed">
                  {selectedEvent.description}
                </p>

                <button
                  onClick={() => navigate(`/totem/publications?eventId=${selectedEvent.id}&screen=${selectedScreen}`)}
                  className="w-full sm:w-auto px-8 py-4 text-white rounded-lg text-base font-medium transition-opacity hover:opacity-90 flex items-center justify-center gap-3"
                  style={{ backgroundColor: cp }}
                >
                  Voir les publications
                  <ArrowRight size={20} />
                </button>
              </div>
              
              {selectedEvent.bannerUrl && (
                <div className="w-full md:w-2/5 min-h-[300px] bg-zinc-100 border-l border-zinc-200">
                  <img src={selectedEvent.bannerUrl} alt="Banner" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
