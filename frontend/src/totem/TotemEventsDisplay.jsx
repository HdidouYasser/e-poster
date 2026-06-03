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
    if (!status) return "bg-zinc-200/60 text-zinc-700 border-zinc-300";
    const upper = status.toUpperCase();
    if (upper === "ACTIVE") return "bg-emerald-100 text-emerald-700 border-emerald-300";
    if (upper === "UPCOMING") return "bg-blue-100 text-blue-700 border-blue-300";
    if (upper === "PAST") return "bg-zinc-200/60 text-zinc-700 border-zinc-300";
    return "bg-zinc-200/60 text-zinc-700";
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
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-30 pointer-events-none bg-zinc-100"></div>

      <div className="relative z-10">
        {/* Header */}
        <div className="px-8 py-12 md:px-16 lg:px-24">
          <div className="flex items-center gap-3 mb-3">
            <Sparkles className="w-8 h-8 text-blue-600" />
            <span className="text-xs font-bold tracking-widest text-blue-600 uppercase">Événements</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-zinc-900 mb-3 leading-tight">
            Découvrez nos
            <br />
            <span className="text-blue-600">Événements</span>
          </h1>
          <p className="text-zinc-600 text-lg max-w-2xl">
            Explorez nos conférences, séminaires et rencontres professionnelles. Sélectionnez un événement pour voir les publications en direct.
          </p>
        </div>

        {/* Events Grid */}
        <div className="px-8 md:px-16 lg:px-24 pb-24">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 auto-rows-max">
            {events.map((event) => (
              <div
                key={event.id}
                onClick={() => onEventSelect(event)}
                onMouseEnter={() => setHoveredId(event.id)}
                onMouseLeave={() => setHoveredId(null)}
                className="group relative cursor-pointer h-full"
              >
                {/* Card Container */}
                <div className={`relative h-full rounded-2xl overflow-hidden border transition-all duration-300 bg-white shadow-sm hover:shadow-lg ${
                  hoveredId === event.id ? 'border-zinc-300 shadow-lg' : 'border-zinc-200'
                }`}>
                  
                  {/* Image Section */}
                  <div className={`relative h-48 overflow-hidden ${getStatusColor(event.status)} flex items-center justify-center`}>
                    {event.logoUrl ? (
                      <img
                        src={getMediaUrl(event.logoUrl)}
                        alt={event.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-zinc-400">
                        <Sparkles className="w-12 h-12 opacity-50 mb-2" />
                        <p className="text-sm font-semibold opacity-70">{event.name}</p>
                      </div>
                    )}

                    {/* Status Badge */}
                    <div className="absolute top-4 right-4">
                      <span className={`inline-flex items-center px-4 py-2 rounded-full text-xs font-bold border ${getStatusBadgeColor(event.status)}`}>
                        <span className={`w-2 h-2 rounded-full mr-2 ${getStatusDotColor(event.status)}`}></span>
                        {event.status || "N/A"}
                      </span>
                    </div>

                    {/* Overlay on hover */}
                    <div className="absolute inset-0 bg-white/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>

                  {/* Content Section */}
                  <div className="p-6 flex flex-col h-full">
                    {/* Title */}
                    <h3 className="text-xl font-bold text-zinc-900 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors duration-300">
                      {event.name}
                    </h3>

                    {/* Description */}
                    {event.description && (
                      <p className="text-zinc-600 text-sm mb-4 line-clamp-2">
                        {event.description}
                      </p>
                    )}

                    {/* Meta Information */}
                    <div className="space-y-3 mb-6 flex-grow">
                      {/* Date */}
                      <div className="flex items-center gap-3 text-zinc-700 group-hover:text-blue-600 transition-colors">
                        <div className="p-2 rounded-lg bg-zinc-100 group-hover:bg-blue-100 transition-colors">
                          <Calendar className="w-4 h-4" />
                        </div>
                        <span className="text-sm font-medium">{formatDate(event.startDate)}</span>
                      </div>

                      {/* Location */}
                      {event.location && (
                        <div className="flex items-center gap-3 text-zinc-700 group-hover:text-blue-600 transition-colors">
                          <div className="p-2 rounded-lg bg-zinc-100 group-hover:bg-blue-100 transition-colors">
                            <MapPin className="w-4 h-4" />
                          </div>
                          <span className="text-sm font-medium truncate">{event.location}</span>
                        </div>
                      )}

                      {/* Participants Count */}
                      <div className="flex items-center gap-3 text-zinc-700 group-hover:text-blue-600 transition-colors">
                        <div className="p-2 rounded-lg bg-zinc-100 group-hover:bg-blue-100 transition-colors">
                          <Users className="w-4 h-4" />
                        </div>
                        <span className="text-sm font-medium">{event.participantCount || 0} participants</span>
                      </div>
                    </div>

                    {/* Primary Color Indicator */}
                    {event.colorPrimary && (
                      <div className="flex items-center gap-2 mb-4 pt-4 border-t border-zinc-200">
                        <div
                          className="w-3 h-3 rounded-full ring-2 ring-zinc-300"
                          style={{ backgroundColor: event.colorPrimary }}
                        ></div>
                        <span className="text-xs text-zinc-500">Couleur du thème</span>
                      </div>
                    )}

                    {/* CTA Button */}
                    <button
                      className={`w-full py-3 px-4 rounded-lg font-semibold text-sm transition-all duration-300 flex items-center justify-center gap-2 ${
                        selectedEvent?.id === event.id
                          ? "bg-blue-600 text-white shadow-lg"
                          : "bg-zinc-100 hover:bg-blue-600 hover:text-white text-zinc-900 border border-zinc-200"
                      }`}
                    >
                      <span>{selectedEvent?.id === event.id ? "Sélectionné" : "Sélectionner"}</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {events.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center py-24">
              <div className="w-16 h-16 rounded-full bg-zinc-200 flex items-center justify-center mb-4">
                <Sparkles className="w-8 h-8 text-zinc-400" />
              </div>
              <h3 className="text-xl font-bold text-zinc-900 mb-2">Aucun événement</h3>
              <p className="text-zinc-600">Les événements seront affichés ici dès qu'ils seront disponibles.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
