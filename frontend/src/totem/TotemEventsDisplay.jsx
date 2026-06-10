import { useMemo, useState } from "react";
import { Calendar, MapPin, Users, Sparkles, ArrowRight } from "lucide-react";
import { getMediaUrl } from "../api";

export default function TotemEventsDisplay({ events, onEventSelect, selectedEvent }) {
  const [hoveredId, setHoveredId] = useState(null);

  const getStatusColor = (status) => {
    if (!status) return "bg-zinc-100";
    const upper = status.toUpperCase();
    if (upper === "ACTIVE") return "bg-emerald-50";
    if (upper === "UPCOMING") return "bg-blue-50";
    if (upper === "PAST") return "bg-zinc-100";
    return "bg-zinc-100";
  };

  const getStatusBadgeColor = (status) => {
    if (!status) return "bg-zinc-100 text-zinc-700 border-zinc-200";
    const upper = status.toUpperCase();
    if (upper === "ACTIVE") return "bg-emerald-50 text-emerald-700 border-emerald-200";
    if (upper === "UPCOMING") return "bg-blue-50 text-blue-700 border-blue-200";
    if (upper === "PAST") return "bg-zinc-100 text-zinc-600 border-zinc-200";
    return "bg-zinc-100 text-zinc-700";
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
    <div className="min-h-screen bg-zinc-50 relative overflow-hidden">

      <div className="relative z-10">
        {/* Header */}
        <div className="px-10 py-12 md:px-16 lg:px-24">
          <div className="flex items-center gap-3 mb-3">
            <Sparkles className="w-6 h-6" style={{ color: 'var(--theme-primary)' }} />
            <span className="text-[11px] font-bold tracking-widest uppercase" style={{ color: 'var(--theme-primary)' }}>Événements</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-zinc-900 mb-3 leading-tight font-display">
            Découvrez nos
            <br />
            <span style={{ color: 'var(--theme-primary)' }}>Événements</span>
          </h1>
          <p className="text-zinc-500 text-base max-w-2xl leading-relaxed font-medium">
            Explorez nos conférences, séminaires et rencontres professionnelles. Sélectionnez un événement pour voir les publications en direct.
          </p>
        </div>

        {/* Events Grid */}
        <div className="px-10 md:px-16 lg:px-24 pb-20">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-max">
            {events.map((event) => (
              <div
                key={event.id}
                onClick={() => onEventSelect(event)}
                onMouseEnter={() => setHoveredId(event.id)}
                onMouseLeave={() => setHoveredId(null)}
                className="group relative cursor-pointer h-full"
              >
                {/* Card Container */}
                <div className="totem-card h-full">
                  
                  {/* Image Section */}
                  <div className={`relative h-48 overflow-hidden ${getStatusColor(event.status)} flex items-center justify-center`}>
                    {event.logoUrl ? (
                      <img
                        src={getMediaUrl(event.logoUrl)}
                        alt={event.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-103"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-zinc-400">
                        <Sparkles className="w-10 h-10 opacity-50 mb-2" />
                        <p className="text-xs font-semibold opacity-70">{event.name}</p>
                      </div>
                    )}

                    {/* Status Badge */}
                    <div className="absolute top-3 right-3">
                      <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-[10px] font-bold border ${getStatusBadgeColor(event.status)}`}>
                        <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${getStatusDotColor(event.status)}`}></span>
                        {event.status || "N/A"}
                      </span>
                    </div>
                  </div>

                  {/* Content Section */}
                  <div className="p-6 flex flex-col h-full">
                    {/* Title */}
                    <h3 className="text-base font-bold text-zinc-900 mb-2 line-clamp-2 group-hover:text-theme-primary transition-colors duration-200 font-display">
                      {event.name}
                    </h3>

                    {/* Description */}
                    {event.description && (
                      <p className="text-zinc-500 text-xs mb-4 line-clamp-2 leading-relaxed font-medium">
                        {event.description}
                      </p>
                    )}

                    {/* Meta Information */}
                    <div className="space-y-2.5 mb-5 flex-grow">
                      {/* Date */}
                      <div className="flex items-center gap-3 text-zinc-600">
                        <div className="p-2 rounded-xl bg-zinc-100 transition-colors">
                          <Calendar className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-xs font-semibold">{formatDate(event.startDate)}</span>
                      </div>

                      {/* Location */}
                      {event.location && (
                        <div className="flex items-center gap-3 text-zinc-600">
                          <div className="p-2 rounded-xl bg-zinc-100 transition-colors">
                            <MapPin className="w-3.5 h-3.5" />
                          </div>
                          <span className="text-xs font-semibold truncate">{event.location}</span>
                        </div>
                      )}

                      {/* Participants Count */}
                      <div className="flex items-center gap-3 text-zinc-600">
                        <div className="p-2 rounded-xl bg-zinc-100 transition-colors">
                          <Users className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-xs font-semibold">{event.participantCount || 0} participants</span>
                      </div>
                    </div>

                    {/* Primary Color Indicator */}
                    {event.colorPrimary && (
                      <div className="flex items-center gap-2 mb-4 pt-4 border-t border-zinc-100">
                        <div
                          className="w-3.5 h-3.5 rounded-full ring-2 ring-zinc-200"
                          style={{ backgroundColor: event.colorPrimary }}
                        ></div>
                        <span className="text-[10px] text-zinc-500 font-semibold">Couleur du thème</span>
                      </div>
                    )}

                    {/* CTA Button */}
                    <button
                      className={`totem-cta-btn w-full ${selectedEvent?.id !== event.id ? 'opacity-0 group-hover:opacity-100' : ''}`}
                      style={
                        selectedEvent?.id === event.id
                          ? { backgroundColor: 'var(--theme-primary)', color: 'var(--theme-foreground)' }
                          : {}
                      }
                    >
                      <span>{selectedEvent?.id === event.id ? "Sélectionné" : "Sélectionner"}</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {events.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center py-24">
              <div className="w-16 h-16 rounded-2xl bg-zinc-100 flex items-center justify-center mb-4">
                <Sparkles className="w-7 h-7 text-zinc-400" />
              </div>
              <h3 className="text-lg font-bold text-zinc-900 mb-2 font-display">Aucun événement</h3>
              <p className="text-sm text-zinc-500 font-medium">Les événements seront affichés ici dès qu'ils seront disponibles.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
