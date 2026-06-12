import { useMemo, useState } from "react";
import { Calendar, MapPin, Users, Sparkles, ArrowRight } from "lucide-react";
import { getMediaUrl } from "../api";

export default function TotemEventsDisplay({ events, onEventSelect, selectedEvent }) {
  const [hoveredId, setHoveredId] = useState(null);

  const getStatusBadgeColor = (status) => {
    if (!status) return "bg-zinc-50 text-zinc-600 border-zinc-200";
    const upper = status.toUpperCase();
    if (upper === "ACTIVE") return "bg-emerald-50 text-emerald-700 border-emerald-200";
    if (upper === "UPCOMING") return "bg-blue-50 text-blue-700 border-blue-200";
    if (upper === "PAST") return "bg-zinc-50 text-zinc-500 border-zinc-200";
    return "bg-zinc-50 text-zinc-600 border-zinc-200";
  };

  const getStatusDotColor = (status) => {
    if (!status) return "bg-zinc-400";
    const upper = status.toUpperCase();
    if (upper === "ACTIVE") return "bg-emerald-500 animate-pulse";
    if (upper === "UPCOMING") return "bg-blue-400";
    if (upper === "PAST") return "bg-zinc-400";
    return "bg-zinc-400";
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "Date TBD";
    const date = new Date(dateStr);
    return date.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  };

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">

      <div className="relative z-10">
        {/* Header */}
        <div className="px-8 py-10 md:px-12 lg:px-16">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4" style={{ color: 'var(--theme-primary)' }} />
            <span className="text-[10px] font-bold tracking-widest uppercase" style={{ color: 'var(--theme-primary)' }}>Événements</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-zinc-900 mb-2 leading-tight font-display">
            Découvrez nos
            <br />
            <span style={{ color: 'var(--theme-primary)' }}>Événements</span>
          </h1>
          <p className="text-zinc-500 text-xs max-w-xl leading-relaxed">
            Explorez nos conférences, séminaires et rencontres professionnelles. Sélectionnez un événement pour voir les publications en direct.
          </p>
        </div>

        {/* Events Grid */}
        <div className="px-8 md:px-12 lg:px-16 pb-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-max">
            {events.map((event) => (
              <div
                key={event.id}
                onClick={() => onEventSelect(event)}
                onMouseEnter={() => setHoveredId(event.id)}
                onMouseLeave={() => setHoveredId(null)}
                className="group relative cursor-pointer h-full"
              >
                <div className="totem-card h-full">
                  
                  {/* Image Section */}
                  <div className="relative h-40 overflow-hidden bg-zinc-50 flex items-center justify-center">
                    {event.logoUrl ? (
                      <img
                        src={getMediaUrl(event.logoUrl)}
                        alt={event.name}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-102"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-zinc-300">
                        <Sparkles className="w-8 h-8 opacity-50 mb-1.5" />
                        <p className="text-[10px] font-medium">{event.name}</p>
                      </div>
                    )}

                    {/* Status Badge */}
                    <div className="absolute top-2.5 right-2.5">
                      <span className={`inline-flex items-center px-2 py-1 rounded-md text-[9px] font-bold border ${getStatusBadgeColor(event.status)}`}>
                        <span className={`w-1.5 h-1.5 rounded-full mr-1 ${getStatusDotColor(event.status)}`}></span>
                        {event.status || "N/A"}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5 flex flex-col h-full">
                    <h3 className="text-sm font-bold text-zinc-900 mb-1.5 line-clamp-2 group-hover:text-theme-primary transition-colors duration-150 font-display">
                      {event.name}
                    </h3>

                    {event.description && (
                      <p className="text-zinc-500 text-[11px] mb-3 line-clamp-2 leading-relaxed">
                        {event.description}
                      </p>
                    )}

                    {/* Meta */}
                    <div className="space-y-2 mb-4 flex-grow">
                      <div className="flex items-center gap-2.5 text-zinc-500">
                        <div className="p-1.5 rounded-lg bg-zinc-50 transition-colors">
                          <Calendar className="w-3 h-3" />
                        </div>
                        <span className="text-[10px] font-semibold">{formatDate(event.startDate)}</span>
                      </div>

                      {event.location && (
                        <div className="flex items-center gap-2.5 text-zinc-500">
                          <div className="p-1.5 rounded-lg bg-zinc-50 transition-colors">
                            <MapPin className="w-3 h-3" />
                          </div>
                          <span className="text-[10px] font-semibold truncate">{event.location}</span>
                        </div>
                      )}

                      <div className="flex items-center gap-2.5 text-zinc-500">
                        <div className="p-1.5 rounded-lg bg-zinc-50 transition-colors">
                          <Users className="w-3 h-3" />
                        </div>
                        <span className="text-[10px] font-semibold">{event.participantCount || 0} participants</span>
                      </div>
                    </div>

                    {/* Color indicator */}
                    {event.colorPrimary && (
                      <div className="flex items-center gap-1.5 mb-3 pt-3 border-t border-zinc-100">
                        <div
                          className="w-3 h-3 rounded-full ring-1 ring-zinc-200"
                          style={{ backgroundColor: event.colorPrimary }}
                        ></div>
                        <span className="text-[9px] text-zinc-400 font-medium">Couleur du thème</span>
                      </div>
                    )}

                    {/* CTA */}
                    <button
                      className={`totem-cta-btn w-full text-[11px] ${selectedEvent?.id !== event.id ? 'opacity-0 group-hover:opacity-100' : ''}`}
                      style={
                        selectedEvent?.id === event.id
                          ? { backgroundColor: 'var(--theme-primary)', color: 'var(--theme-foreground)' }
                          : {}
                      }
                    >
                      <span>{selectedEvent?.id === event.id ? "Sélectionné" : "Sélectionner"}</span>
                      <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {events.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center py-20">
              <div className="w-12 h-12 rounded-xl bg-zinc-50 flex items-center justify-center mb-3 border border-zinc-100">
                <Sparkles className="w-5 h-5 text-zinc-300" />
              </div>
              <h3 className="text-sm font-bold text-zinc-900 mb-1 font-display">Aucun événement</h3>
              <p className="text-[11px] text-zinc-500 font-medium">Les événements seront affichés ici dès qu'ils seront disponibles.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
