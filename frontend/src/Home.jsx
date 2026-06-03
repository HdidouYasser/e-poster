import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "./stores/authStore";
import { publicApi, getMediaUrl } from "./api";
import {
  Presentation, Search, Calendar, ArrowRight,
  Lock, LayoutDashboard, MapPin, Users, Stethoscope,
  ChevronRight, Globe, Award, BookOpen
} from "lucide-react";

export default function Home() {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const username = useAuthStore((s) => s.username);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: eventsData, isLoading } = useQuery({
    queryKey: ["home-events"],
    queryFn: async () => (await publicApi.get("/events?page=0&size=100")).data,
  });

  const allEvents = useMemo(() => eventsData?.items || [], [eventsData]);
  const activeEvents = useMemo(
    () => allEvents.filter((e) => e.status?.toUpperCase() === "ACTIVE"),
    [allEvents]
  );

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/totem/publications?q=${encodeURIComponent(searchQuery)}&screen=visitor`);
    } else {
      navigate(`/totem?screen=visitor`);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return null;
    return new Date(dateStr).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const formatDateShort = (dateStr) => {
    if (!dateStr) return null;
    return new Date(dateStr).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="visitor-home">
      {/* ── HEADER ── */}
      <header className="vh-header">
        <div className="vh-header-inner">
          <div className="vh-logo">
            <div className="vh-logo-icon">
              <Stethoscope size={20} />
            </div>
            <div>
              <span className="vh-logo-name">E-Poster</span>
              <span className="vh-logo-sub">Plateforme Scientifique</span>
            </div>
          </div>

          <nav className="vh-nav">
            <Link to="/totem?screen=visitor" className="vh-nav-link">Congrès</Link>
            <Link to="/totem/publications?screen=visitor" className="vh-nav-link">E-Posters</Link>
          </nav>

          <div className="vh-header-actions">
            {isAuthenticated ? (
              <Link to="/admin/stats" className="vh-btn-primary">
                <LayoutDashboard size={14} />
                Dashboard
              </Link>
            ) : (
              <Link to="/login" className="vh-btn-ghost">
                <Lock size={14} />
                Admin
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* ── HERO ── */}
      <section className="vh-hero">
        <div className="vh-hero-badge">
          <Globe size={12} />
          Espace de consultation des communications médicales
        </div>

        <h1 className="vh-hero-title">
          Explorez les communications<br />
          <span className="vh-hero-accent">scientifiques médicales</span>
        </h1>

        <p className="vh-hero-desc">
          Accédez aux e-posters des congrès médicaux, consultez les abstracts
          et scannez les QR codes pour retrouver les publications sur votre mobile.
        </p>

        {/* Search bar */}
        <form className="vh-search-form" onSubmit={handleSearch}>
          <div className="vh-search-box">
            <Search size={18} className="vh-search-icon" />
            <input
              type="text"
              className="vh-search-input"
              placeholder="Rechercher par titre, auteur, thème..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit" className="vh-search-btn">
              Rechercher
              <ArrowRight size={14} />
            </button>
          </div>
          <div className="vh-search-tags">
            <span className="vh-tags-label">Tendances :</span>
            {["Cardiologie", "Oncologie", "Neurologie", "AVC", "Infarctus"].map((tag) => (
              <button
                key={tag}
                type="button"
                className="vh-tag"
                onClick={() => {
                  setSearchQuery(tag);
                  navigate(`/totem/publications?q=${encodeURIComponent(tag)}&screen=visitor`);
                }}
              >
                {tag}
              </button>
            ))}
          </div>
        </form>

        {/* Stats strip */}
        <div className="vh-stats">
          <div className="vh-stat">
            <span className="vh-stat-num">{activeEvents.length}</span>
            <span className="vh-stat-label">Congrès actifs</span>
          </div>
          <div className="vh-stat-divider" />
          <div className="vh-stat">
            <span className="vh-stat-num">100+</span>
            <span className="vh-stat-label">E-Posters disponibles</span>
          </div>
          <div className="vh-stat-divider" />
          <div className="vh-stat">
            <span className="vh-stat-num">QR</span>
            <span className="vh-stat-label">Accès mobile</span>
          </div>
        </div>
      </section>

      {/* ── EVENTS SECTION ── */}
      <section className="vh-events-section">
        <div className="vh-section-header">
          <div>
            <h2 className="vh-section-title">
              <Award size={20} />
              Congrès Médicaux en cours
            </h2>
            <p className="vh-section-sub">
              Sélectionnez un congrès pour parcourir ses communications scientifiques
            </p>
          </div>
          <Link to="/totem?screen=visitor" className="vh-see-all">
            Voir tous <ChevronRight size={14} />
          </Link>
        </div>

        {isLoading ? (
          <div className="vh-loader">
            <div className="vh-spinner" />
            <p>Chargement des événements...</p>
          </div>
        ) : activeEvents.length === 0 ? (
          <div className="vh-empty">
            <Calendar size={40} />
            <h3>Aucun congrès actif pour le moment</h3>
            <p>Revenez prochainement ou contactez l'administrateur.</p>
          </div>
        ) : (
          <div className={`vh-events-grid ${activeEvents.length === 1 ? "vh-grid-1" : activeEvents.length === 2 ? "vh-grid-2" : "vh-grid-3"}`}>
            {activeEvents.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                formatDate={formatDate}
                formatDateShort={formatDateShort}
                onClick={() => navigate(`/totem/publications?eventId=${event.id}&screen=visitor`)}
              />
            ))}
          </div>
        )}
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="vh-how-section">
        <div className="vh-how-inner">
          <div className="vh-section-header centered">
            <div>
              <h2 className="vh-section-title centered">
                <BookOpen size={20} />
                Comment ça fonctionne ?
              </h2>
              <p className="vh-section-sub centered">En 3 étapes simples, accédez à toutes les communications</p>
            </div>
          </div>

          <div className="vh-steps">
            <div className="vh-step">
              <div className="vh-step-num">1</div>
              <h3>Choisissez un congrès</h3>
              <p>Sélectionnez l'événement médical qui vous intéresse parmi les congrès actifs.</p>
            </div>
            <div className="vh-step-arrow"><ChevronRight size={20} /></div>
            <div className="vh-step">
              <div className="vh-step-num">2</div>
              <h3>Explorez les e-posters</h3>
              <p>Parcourez, filtrez et recherchez parmi toutes les communications scientifiques.</p>
            </div>
            <div className="vh-step-arrow"><ChevronRight size={20} /></div>
            <div className="vh-step">
              <div className="vh-step-num">3</div>
              <h3>Scannez le QR Code</h3>
              <p>Emportez le poster sur votre mobile en scannant le QR Code affiché.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="vh-footer">
        <div className="vh-footer-inner">
          <div className="vh-footer-brand">
            <div className="vh-logo-icon sm">
              <Stethoscope size={14} />
            </div>
            <div>
              <span className="vh-footer-name">Plateforme E-Poster</span>
              <span className="vh-footer-copy">© 2026 AMPIIC · Tous droits réservés</span>
            </div>
          </div>
          <div className="vh-footer-links">
            <Link to="/totem?screen=visitor" className="vh-footer-link">Accès Visiteurs</Link>
            <span className="vh-footer-sep">·</span>
            <Link to="/totem?screen=1" className="vh-footer-link">Mode Borne</Link>
            <span className="vh-footer-sep">·</span>
            <Link to="/login" className="vh-footer-link">Administration</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function EventCard({ event, formatDate, formatDateShort, onClick }) {
  return (
    <div className="vh-event-card" onClick={onClick}>
      {/* Banner */}
      <div className="vh-card-banner">
        {event.bannerUrl ? (
          <img src={getMediaUrl(event.bannerUrl)} alt="Banner" className="vh-card-banner-img" />
        ) : (
          <div className="vh-card-banner-placeholder">
            <Presentation size={32} />
          </div>
        )}
        <div className="vh-card-banner-overlay" />

        {/* Status badge */}
        <div className="vh-card-status">
          <span className="vh-status-dot" />
          En cours
        </div>

        {/* Logo */}
        {event.logoUrl && (
          <div className="vh-card-logo-wrap">
            <img src={getMediaUrl(event.logoUrl)} alt="Logo" className="vh-card-logo" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="vh-card-body">
        <div className="vh-card-meta">
          {event.startDate && (
            <span className="vh-card-date">
              <Calendar size={11} />
              {formatDateShort(event.startDate)}
              {event.endDate && ` → ${formatDateShort(event.endDate)}`}
            </span>
          )}
          {event.location && (
            <span className="vh-card-loc">
              <MapPin size={11} />
              {event.location}
            </span>
          )}
        </div>

        <h3 className="vh-card-title">{event.title}</h3>
        <p className="vh-card-desc">{event.description || "Cliquez pour explorer les communications de ce congrès."}</p>

        <div className="vh-card-footer">
          {event.programUrl && (
            <div
              className="vh-card-qr"
              onClick={(e) => e.stopPropagation()}
              title="Scanner pour accéder au programme"
            >
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=64x64&data=${encodeURIComponent(event.programUrl)}`}
                alt="QR Programme"
              />
              <span>Programme</span>
            </div>
          )}
          <button className="vh-card-cta">
            Explorer les posters
            <ArrowRight size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}
