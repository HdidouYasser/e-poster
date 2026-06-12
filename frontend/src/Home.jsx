import { useState, useMemo, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "./stores/authStore";
import { publicApi, getMediaUrl } from "./api";
import {
  Presentation, Search, Calendar, ArrowRight,
  Lock, LayoutDashboard, MapPin, Users,
  ChevronRight, ChevronLeft, Globe, Award, BookOpen,
  Sparkles, Monitor, Layers, QrCode, Heart, Brain,
  Scissors, Stethoscope, Baby, HelpCircle, ChevronDown,
  ChevronUp, Activity
} from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";

/** Replace localhost with current hostname + port for cross-device QR scanning */
const toScannableUrl = (url) => {
  if (!url) return "";
  try {
    const u = new URL(url);
    u.hostname = window.location.hostname;
    u.port = window.location.port;
    return u.toString();
  } catch {
    return url;
  }
};

export default function Home() {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const username = useAuthStore((s) => s.username);
  const [searchQuery, setSearchQuery] = useState("");
  const [openFaqIndex, setOpenFaqIndex] = useState(null);

  const categoriesList = [
    { name: "Cardiologie", icon: Heart, count: "12 posters" },
    { name: "Neurologie", icon: Brain, count: "8 posters" },
    { name: "Chirurgie", icon: Scissors, count: "15 posters" },
    { name: "Pédiatrie", icon: Baby, count: "6 posters" },
    { name: "Infectiologie", icon: Activity, count: "9 posters" },
    { name: "Général", icon: Stethoscope, count: "24 posters" }
  ];

  const faqs = [
    {
      question: "Qu'est-ce qu'un E-Poster ?",
      answer: "Un E-Poster (ou poster électronique) est une version numérique d'un poster scientifique traditionnel. Il permet une consultation interactive sur écran vertical tactile avec zoom fluide, accès aux figures et consultation de documents et vidéos associés."
    },
    {
      question: "Comment consulter un poster sur mon mobile ?",
      answer: "Chaque poster affiche un QR Code unique sur son profil de détail. Ouvrez l'appareil photo ou le lecteur QR Code de votre smartphone, scannez le code et le poster s'ouvrira directement dans le navigateur de votre mobile."
    },
    {
      question: "Comment fonctionne le mode multi-écrans ?",
      answer: "La plateforme gère plusieurs totems physiques de manière coordonnée. Le gestionnaire d'événement peut affecter les thèmes à des bornes spécifiques et synchroniser la navigation en temps réel."
    },
    {
      question: "Je suis auteur, comment ajouter mon poster ?",
      answer: "Les téléversements et configurations de fichiers se font via l'espace d'administration sécurisé. Si vous disposez d'un compte manager ou administrateur, cliquez sur 'Admin' en haut de la page pour vous connecter."
    }
  ];

  const scrollContainerRef = useRef(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setShowLeftArrow(scrollLeft > 10);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = 400; // scroll by roughly one card width
      scrollContainerRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth"
      });
    }
  };

  const { data: eventsData, isLoading } = useQuery({
    queryKey: ["home-events"],
    queryFn: async () => (await publicApi.get("/events?page=0&size=100")).data,
  });

  const allEvents = useMemo(() => eventsData?.items || [], [eventsData]);
  const activeEvents = useMemo(
    () => allEvents.filter((e) => e.status?.toUpperCase() === "ACTIVE"),
    [allEvents]
  );

  useEffect(() => {
    const checkScrollable = () => {
      if (scrollContainerRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
        setShowLeftArrow(scrollLeft > 10);
        setShowRightArrow(scrollWidth > clientWidth + 10 && scrollLeft < scrollWidth - clientWidth - 10);
      }
    };

    const timer = setTimeout(checkScrollable, 200);
    window.addEventListener("resize", checkScrollable);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", checkScrollable);
    };
  }, [activeEvents]);

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
              <Presentation size={20} />
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
          Espace de consultation des communications scientifiques
        </div>

        <h1 className="vh-hero-title">
          Explorez les communications<br />
          <span className="vh-hero-accent">scientifiques & académiques</span>
        </h1>

        <p className="vh-hero-desc">
          Accédez aux e-posters des congrès, consultez les abstracts
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
              <span className="vh-search-btn-text">Rechercher</span>
              <ArrowRight size={14} />
            </button>
          </div>
          <div className="vh-search-tags">
            <span className="vh-tags-label">Tendances :</span>
            {["Médecine", "Infectiologie", "Sciences", "Technologie", "Recherche"].map((tag) => (
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
              Congrès en cours
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
          <div className="vh-events-slider-wrapper">
            {showLeftArrow && (
              <button
                type="button"
                className="vh-scroll-btn vh-scroll-prev"
                onClick={() => scroll("left")}
                aria-label="Défiler à gauche"
              >
                <ChevronLeft size={24} className="vh-arrow-icon-left" />
              </button>
            )}

            <div
              ref={scrollContainerRef}
              onScroll={handleScroll}
              className="vh-events-scroll-container"
            >
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

            {showRightArrow && (
              <button
                type="button"
                className="vh-scroll-btn vh-scroll-next"
                onClick={() => scroll("right")}
                aria-label="Défiler à droite"
              >
                <ChevronRight size={24} className="vh-arrow-icon-right" />
              </button>
            )}
          </div>
        )}
      </section>

      {/* ── PRESENTATION / CARACTÉRISTIQUES ── */}
      <section className="vh-presentation-section">
        <div className="vh-presentation-inner">
          <div className="vh-section-header centered">
            <div>
              <h2 className="vh-section-title centered">
                <Sparkles size={20} />
                Une Plateforme 100% Dynamique
              </h2>
              <p className="vh-section-sub centered">
                Conçue selon le cahier des charges pour s'adapter à tous vos congrès et événements
              </p>
            </div>
          </div>

          <div className="vh-presentation-grid">
            <div className="vh-presentation-card">
              <div className="vh-presentation-icon-wrap">
                <Sparkles size={22} />
              </div>
              <h3>Gestion Centralisée & Dynamique</h3>
              <p>
                Terminé le code figé ou les injections manuelles. Les événements, les publications (e-posters) et les thématiques sont administrables instantanément depuis le back-office.
              </p>
            </div>

            <div className="vh-presentation-card">
              <div className="vh-presentation-icon-wrap">
                <Monitor size={22} />
              </div>
              <h3>Optimisé pour Totem Tactile</h3>
              <p>
                Interface de consultation fluide avec de grands boutons tactiles, recherche instantanée (titre, auteur, département), filtres avancés et clavier virtuel intégré.
              </p>
            </div>

            <div className="vh-presentation-card">
              <div className="vh-presentation-icon-wrap">
                <Layers size={22} />
              </div>
              <h3>Mode Multi-Écrans</h3>
              <p>
                Associez dynamiquement vos publications et médias à différents écrans de diffusion (Écran 1, Écran 2, etc.) avec transition en temps réel et mode diaporama.
              </p>
            </div>

            <div className="vh-presentation-card">
              <div className="vh-presentation-icon-wrap">
                <QrCode size={22} />
              </div>
              <h3>Accès Mobile par QR Code</h3>
              <p>
                Chaque publication dispose de son QR Code unique généré automatiquement, permettant aux visiteurs de télécharger le e-poster ou le programme sur leur mobile.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── CATEGORIES THÉMATIQUES ── */}
      <section className="max-w-[1200px] mx-auto px-6 pb-20 w-full">
        <div className="vh-section-header centered">
          <div>
            <h2 className="vh-section-title centered">
              <Activity size={20} />
              Recherche par Spécialité
            </h2>
            <p className="vh-section-sub centered">
              Explorez directement les communications scientifiques selon leur domaine thérapeutique
            </p>
          </div>
        </div>

        <div className="sci-categories-grid">
          {categoriesList.map((cat, i) => {
            const IconComponent = cat.icon;
            return (
              <div
                key={i}
                className="sci-category-card"
                onClick={() => navigate(`/totem/publications?category=${encodeURIComponent(cat.name)}&screen=visitor`)}
              >
                <div className="sci-category-icon">
                  <IconComponent size={22} />
                </div>
                <h3 className="text-sm font-extrabold text-zinc-900 mb-1">{cat.name}</h3>
                <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">{cat.count}</span>
              </div>
            );
          })}
        </div>
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
              <p>Sélectionnez l'événement qui vous intéresse parmi les congrès actifs.</p>
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

      {/* ── FAQ SECTION ── */}
      <section className="max-w-[1200px] mx-auto px-6 pb-20 w-full">
        <div className="vh-section-header centered">
          <div>
            <h2 className="vh-section-title centered">
              <HelpCircle size={20} />
              Questions Fréquentes
            </h2>
            <p className="vh-section-sub centered">Tout savoir sur la plateforme E-Poster et son utilisation</p>
          </div>
        </div>

        <div className="faq-container">
          {faqs.map((faq, i) => (
            <div key={i} className="faq-item">
              <button
                type="button"
                className="faq-header"
                onClick={() => setOpenFaqIndex(openFaqIndex === i ? null : i)}
              >
                <span>{faq.question}</span>
                {openFaqIndex === i ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
              {openFaqIndex === i && (
                <div className="faq-content animate-fade-in">
                  <p>{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="vh-footer">
        <div className="vh-footer-inner">
          <div className="vh-footer-brand">
            <div className="vh-logo-icon sm">
              <Presentation size={14} />
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
          <div className="flex flex-wrap gap-2">
            {event.programUrl && (
              <div
                className="vh-card-qr"
                onClick={(e) => e.stopPropagation()}
                title="Scanner pour accéder au programme"
              >
                <QRCodeCanvas value={toScannableUrl(event.programUrl)} size={56} level="H" fgColor="#18181b" />
                <span>Programme</span>
              </div>
            )}
            {event.revueUrl && (
              <div
                className="vh-card-qr"
                onClick={(e) => e.stopPropagation()}
                title="Scanner pour accéder à la revue"
              >
                <QRCodeCanvas value={toScannableUrl(event.revueUrl)} size={56} level="H" fgColor="#18181b" />
                <span>La Revue</span>
              </div>
            )}
          </div>
          <button className="vh-card-cta">
            Explorer les posters
            <ArrowRight size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}