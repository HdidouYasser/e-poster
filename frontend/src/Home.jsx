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
  ChevronUp, Activity, ShieldCheck, Zap, Star, ArrowUpRight
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
    { name: "Cardiologie", icon: Heart, color: "#ef4444", bg: "#fef2f2" },
    { name: "Neurologie", icon: Brain, color: "#8b5cf6", bg: "#f5f3ff" },
    { name: "Chirurgie", icon: Scissors, color: "#f97316", bg: "#fff7ed" },
    { name: "Pédiatrie", icon: Baby, color: "#ec4899", bg: "#fdf2f8" },
    { name: "Infectiologie", icon: Activity, color: "#10b981", bg: "#f0fdf4" },
    { name: "Général", icon: Stethoscope, color: "#2563eb", bg: "#eff6ff" }
  ];

  const features = [
    {
      icon: Sparkles,
      color: "#f59e0b",
      bg: "linear-gradient(135deg, #fffbeb, #fef3c7)",
      title: "Gestion 100% Dynamique",
      desc: "Événements, publications et thématiques administrables en temps réel depuis le back-office. Zéro code figé."
    },
    {
      icon: Monitor,
      color: "#2563eb",
      bg: "linear-gradient(135deg, #eff6ff, #dbeafe)",
      title: "Optimisé Totem Tactile",
      desc: "Interface fluide avec grands boutons tactiles, recherche instantanée et clavier virtuel intégré."
    },
    {
      icon: Layers,
      color: "#7c3aed",
      bg: "linear-gradient(135deg, #f5f3ff, #ede9fe)",
      title: "Mode Multi-Écrans",
      desc: "Associez publications et médias à différents écrans avec transition en temps réel et diaporama."
    },
    {
      icon: QrCode,
      color: "#059669",
      bg: "linear-gradient(135deg, #f0fdf4, #dcfce7)",
      title: "Accès Mobile QR Code",
      desc: "Chaque publication dispose d'un QR Code unique permettant un accès instantané depuis smartphone."
    }
  ];

  const faqs = [
    {
      question: "Qu'est-ce qu'un E-Poster ?",
      answer: "Un E-Poster est une version numérique interactive d'un poster scientifique. Il permet une consultation avec zoom fluide, accès aux résumés et figures associés depuis un écran tactile vertical."
    },
    {
      question: "Comment consulter un poster sur mon mobile ?",
      answer: "Chaque poster affiche un QR Code unique. Ouvrez l'appareil photo de votre smartphone, scannez le code et la publication s'ouvre directement dans votre navigateur."
    },
    {
      question: "Comment fonctionne le mode multi-écrans ?",
      answer: "La plateforme gère plusieurs totems physiques de manière coordonnée. Le gestionnaire peut affecter les thèmes à des bornes spécifiques et synchroniser la navigation en temps réel."
    },
    {
      question: "Je suis responsable, comment accéder à la gestion ?",
      answer: "Cliquez sur 'Espace Organisateurs' en haut de la page. Vous pouvez vous connecter avec vos identifiants ou votre compte Google si votre accès a été configuré par l'administrateur."
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
      scrollContainerRef.current.scrollBy({
        left: direction === "left" ? -420 : 420,
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

  const formatDateShort = (dateStr) => {
    if (!dateStr) return null;
    return new Date(dateStr).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const [currentSlide, setCurrentSlide] = useState(0);

  const fallbackSlides = useMemo(() => [
    {
      title: "Totems Tactiles Interactifs",
      desc: "Consultez les posters scientifiques avec zoom fluide, accès aux résumés et figures sur grand écran tactile.",
      icon: Monitor,
      bg: "linear-gradient(135deg, #0f172a, #1e293b)",
      tag: "Technologie"
    },
    {
      title: "Accès Mobile QR Code",
      desc: "Scannez le code QR unique de chaque publication pour l'emporter et la relire sur votre smartphone.",
      icon: QrCode,
      bg: "linear-gradient(135deg, #064e3b, #0f766e)",
      tag: "Mobilité"
    },
    {
      title: "Gestion Simplifiée",
      desc: "Administrez vos congrès, thématiques et e-posters en temps réel depuis l'Espace Organisateurs.",
      icon: ShieldCheck,
      bg: "linear-gradient(135deg, #581c87, #6d28d9)",
      tag: "Administration"
    }
  ], []);

  const slides = useMemo(() => {
    if (activeEvents && activeEvents.length > 0) {
      return activeEvents.slice(0, 5).map((event) => ({
        id: event.id,
        title: event.title,
        desc: event.description || "Cliquez pour explorer les communications de ce congrès.",
        image: (event.bannerUrl && event.bannerUrl.trim()) ? getMediaUrl(event.bannerUrl) : ((event.logoUrl && event.logoUrl.trim()) ? getMediaUrl(event.logoUrl) : null),
        date: formatDateShort(event.startDate),
        location: event.location,
        type: "event",
        event: event
      }));
    }
    return fallbackSlides;
  }, [activeEvents, fallbackSlides]);

  // Auto-play timer for slideshow
  useEffect(() => {
    if (slides.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [slides.length]);

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
              <Link to="/login" className="vh-btn-organizer">
                <ShieldCheck size={14} />
                Espace Organisateurs
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* ── HERO ── */}
      <section className="vh-hero">
        <div className="vh-hero-bg" aria-hidden="true">
          <div className="vh-hero-blob vh-hero-blob-1" />
          <div className="vh-hero-blob vh-hero-blob-2" />
          <div className="vh-hero-blob vh-hero-blob-3" />
        </div>
        <div className="vh-hero-container">
          {/* Left Column: Info & Search */}
          <div className="vh-hero-left">
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
                <span className="vh-stat-num">{activeEvents.length || "—"}</span>
                <span className="vh-stat-label">Congrès actifs</span>
              </div>
              <div className="vh-stat-divider" />
              <div className="vh-stat">
                <span className="vh-stat-num">100+</span>
                <span className="vh-stat-label">E-Posters</span>
              </div>
              <div className="vh-stat-divider" />
              <div className="vh-stat">
                <span className="vh-stat-num">QR</span>
                <span className="vh-stat-label">Accès mobile</span>
              </div>
            </div>
          </div>

          {/* Right Column: Slideshow */}
          <div className="vh-hero-right">
            <div className="vh-hero-slider">
              {slides.map((slide, index) => {
                const isActive = index === currentSlide;
                const SlideIcon = slide.icon;
                return (
                  <div
                    key={index}
                    className={`vh-slide ${isActive ? "active" : ""}`}
                    style={slide.bg ? { background: slide.bg } : {}}
                  >
                    {slide.image && (
                      <img
                        src={slide.image}
                        alt={slide.title}
                        className="vh-slide-img"
                      />
                    )}
                    <div className="vh-slide-overlay" />
                    
                    <div className="vh-slide-content">
                      {slide.tag && (
                        <span className="vh-slide-tag">{slide.tag}</span>
                      )}
                      {slide.type === "event" && (
                        <span className="vh-slide-tag event">CONGRÈS À L'AFFICHE</span>
                      )}

                      <h3 className="vh-slide-title">{slide.title}</h3>
                      <p className="vh-slide-desc">{slide.desc}</p>
                      
                      {slide.type === "event" && (
                        <div className="vh-slide-meta">
                          {slide.date && (
                            <span className="vh-slide-meta-item">
                              <Calendar size={12} />
                              {slide.date}
                            </span>
                          )}
                          {slide.location && (
                            <span className="vh-slide-meta-item">
                              <MapPin size={12} />
                              {slide.location}
                            </span>
                          )}
                        </div>
                      )}

                      <div className="vh-slide-actions">
                        {slide.type === "event" ? (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/totem/publications?eventId=${slide.id}&screen=visitor`);
                            }}
                            className="vh-slide-btn"
                          >
                            Explorer le Congrès
                            <ArrowRight size={14} />
                          </button>
                        ) : (
                          <div className="vh-slide-icon-wrap">
                            <SlideIcon size={24} color="#ffffff" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Navigation Arrows */}
              {slides.length > 1 && (
                <>
                  <button
                    type="button"
                    className="vh-slider-arrow prev"
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
                    }}
                    aria-label="Diapositive précédente"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button
                    type="button"
                    className="vh-slider-arrow next"
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentSlide((prev) => (prev + 1) % slides.length);
                    }}
                    aria-label="Diapositive suivante"
                  >
                    <ChevronRight size={20} />
                  </button>
                </>
              )}

              {/* Slider Dots */}
              {slides.length > 1 && (
                <div className="vh-slider-dots">
                  {slides.map((_, index) => (
                    <button
                      key={index}
                      type="button"
                      className={`vh-slider-dot ${index === currentSlide ? "active" : ""}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentSlide(index);
                      }}
                      aria-label={`Aller au slide ${index + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── SPOTLIGHT SECTION ── */}
      {activeEvents.length > 0 && (
        <section className="prt-spotlight-section">
          <div className="prt-spotlight-inner">
            <div className="prt-section-header centered">
              <div>
                <div className="prt-spotlight-badge">
                  <Sparkles size={12} />
                  À LA UNE — ÉVÉNEMENT PHARE
                </div>
                <h2 className="vh-section-title centered">
                  <Award size={20} />
                  Le Congrès Vedette
                </h2>
                <p className="vh-section-sub centered">
                  Découvrez l'événement scientifique le plus marquant du moment et ses communications.
                </p>
              </div>
            </div>

            <div className="prt-spotlight-card">
              <div className="prt-spotlight-card-glass" />
              
              {/* Left Side: Banner / Info */}
              <div className="prt-spotlight-banner-wrap">
                {(activeEvents[0].bannerUrl && activeEvents[0].bannerUrl.trim()) || (activeEvents[0].logoUrl && activeEvents[0].logoUrl.trim()) ? (
                  <img
                    src={getMediaUrl(activeEvents[0].bannerUrl || activeEvents[0].logoUrl)}
                    alt={activeEvents[0].title}
                    className="prt-spotlight-banner-img"
                  />
                ) : (
                  <div className="prt-spotlight-banner-placeholder">
                    <Presentation size={48} />
                  </div>
                )}
                <div className="prt-spotlight-banner-overlay" />
                <span className="prt-spotlight-status">En cours</span>
              </div>

              {/* Right Side: Details & Action */}
              <div className="prt-spotlight-details">
                <div className="prt-spotlight-meta">
                  {activeEvents[0].startDate && (
                    <span className="prt-spotlight-date">
                      <Calendar size={13} />
                      {formatDateShort(activeEvents[0].startDate)}
                      {activeEvents[0].endDate && ` → ${formatDateShort(activeEvents[0].endDate)}`}
                    </span>
                  )}
                  {activeEvents[0].location && (
                    <span className="prt-spotlight-loc">
                      <MapPin size={13} />
                      {activeEvents[0].location}
                    </span>
                  )}
                </div>

                <h3 className="prt-spotlight-title">{activeEvents[0].title}</h3>
                <p className="prt-spotlight-desc">
                  {activeEvents[0].description || "Explorez les thématiques de recherche et les posters scientifiques de ce congrès."}
                </p>

                <div className="prt-spotlight-extras">
                  <div className="prt-spotlight-qrs">
                    {activeEvents[0].programUrl && (
                      <div className="prt-spotlight-qr-box" onClick={(e) => e.stopPropagation()}>
                        <QRCodeCanvas value={toScannableUrl(activeEvents[0].programUrl)} size={64} level="H" fgColor="#0f172a" />
                        <span>Programme</span>
                      </div>
                    )}
                    {activeEvents[0].revueUrl && (
                      <div className="prt-spotlight-qr-box" onClick={(e) => e.stopPropagation()}>
                        <QRCodeCanvas value={toScannableUrl(activeEvents[0].revueUrl)} size={64} level="H" fgColor="#0f172a" />
                        <span>La Revue</span>
                      </div>
                    )}
                  </div>
                  
                  <button
                    onClick={() => navigate(`/totem/publications?eventId=${activeEvents[0].id}&screen=visitor`)}
                    className="prt-spotlight-cta"
                  >
                    Explorer le congrès
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

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
          <div className="vh-events-loading">
            {[1, 2, 3].map(i => (
              <div key={i} className="vh-event-skeleton">
                <div className="vh-skeleton-banner" />
                <div className="vh-skeleton-body">
                  <div className="vh-skeleton-line" style={{width:"60%"}} />
                  <div className="vh-skeleton-line" style={{width:"40%"}} />
                  <div className="vh-skeleton-line" style={{width:"85%"}} />
                </div>
              </div>
            ))}
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

      {/* ── DUAL AUDIENCE PANELS ── */}
      <section className="prt-audience-section">
        <div className="prt-audience-inner">
          {/* Visitors Panel */}
          <div className="prt-audience-card visitors">
            <div className="prt-audience-glow visitors-glow" />
            <div className="prt-audience-icon-ring visitors-ring">
              <Users size={26} />
            </div>
            <span className="prt-audience-eyebrow">Pour les participants</span>
            <h2 className="prt-audience-title">Espace Visiteurs<br/>&amp; Praticiens</h2>
            <p className="prt-audience-desc">
              Consultez les communications scientifiques en direct depuis n'importe quel totem,
              recherchez par auteur ou spécialité, et emportez les posters sur votre mobile.
            </p>
            <ul className="prt-audience-list">
              {[
                { icon: Search,      text: "Recherche full-text par auteur ou thème" },
                { icon: QrCode,      text: "Scan QR Code — accès mobile instantané" },
                { icon: Monitor,     text: "Navigation tactile sur les totems" },
                { icon: BookOpen,    text: "Consultation des abstracts & figures" },
              ].map(({ icon: Icon, text }, i) => (
                <li key={i} className="prt-audience-list-item">
                  <span className="prt-list-dot visitors-dot"><Icon size={13}/></span>
                  {text}
                </li>
              ))}
            </ul>
            <Link to="/totem?screen=visitor" className="prt-audience-btn visitors-btn">
              Accéder en tant que visiteur
              <ArrowRight size={15} />
            </Link>
          </div>

          {/* Organizers Panel */}
          <div className="prt-audience-card organizers">
            <div className="prt-audience-glow organizers-glow" />
            <div className="prt-audience-icon-ring organizers-ring">
              <ShieldCheck size={26} />
            </div>
            <span className="prt-audience-eyebrow">Pour les responsables</span>
            <h2 className="prt-audience-title">Espace Organisateurs<br/>&amp; Gestionnaires</h2>
            <p className="prt-audience-desc">
              Administrez vos congrès, gérez les publications et thématiques, configurez
              vos écrans en temps réel et importez vos données depuis Excel ou CSV.
            </p>
            <ul className="prt-audience-list">
              {[
                { icon: Layers,      text: "Gestion multi-écrans en temps réel" },
                { icon: Zap,         text: "Import Excel / CSV avec multi-auteurs" },
                { icon: Award,       text: "Configuration des congrès & thèmes" },
                { icon: Star,        text: "Tableau de bord avec statistiques live" },
              ].map(({ icon: Icon, text }, i) => (
                <li key={i} className="prt-audience-list-item">
                  <span className="prt-list-dot organizers-dot"><Icon size={13}/></span>
                  {text}
                </li>
              ))}
            </ul>
            <Link to="/login" className="prt-audience-btn organizers-btn">
              <ShieldCheck size={15} />
              Accéder à l'espace pro
            </Link>
          </div>
        </div>
      </section>

      {/* ── PARTNERS MARQUEE ── */}
      <section className="prt-partners-section">
        <p className="prt-partners-label">Nos partenaires académiques &amp; institutionnels</p>
        <div className="prt-marquee-wrapper">
          <div className="prt-marquee-track">
            {[
              "Société Marocaine de Cardiologie",
              "AMPIIC",
              "Faculté de Médecine Rabat",
              "CHU Ibn Sina",
              "Société Marocaine de Neurologie",
              "Association Med-Tech",
              "Université Mohammed V",
              "Société de Pédiatrie du Maroc",
              "Société Marocaine de Cardiologie",
              "AMPIIC",
              "Faculté de Médecine Rabat",
              "CHU Ibn Sina",
            ].map((name, i) => (
              <div key={i} className="prt-partner-chip">
                <div className="prt-partner-dot" />
                {name}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── DARK STATS STRIP ── */}
      <section className="prt-stats-strip">
        <div className="prt-stats-inner">
          {[
            { num: activeEvents.length || "—", label: "Congrès actifs", icon: Award },
            { num: "500+",  label: "E-Posters publiés",    icon: BookOpen },
            { num: "12",    label: "Spécialités couvertes", icon: Activity },
            { num: "100%",  label: "Accessible en mobile",  icon: QrCode  },
          ].map(({ num, label, icon: Icon }, i) => (
            <div key={i} className="prt-stat-item">
              <div className="prt-stat-icon"><Icon size={18} /></div>
              <span className="prt-stat-num">{num}</span>
              <span className="prt-stat-label">{label}</span>
            </div>
          ))}
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
              <div className="vh-step-icon-wrap"><Globe size={20} /></div>
              <h3>Choisissez un congrès</h3>
              <p>Sélectionnez l'événement qui vous intéresse parmi les congrès actifs.</p>
            </div>
            <div className="vh-step-connector"><ArrowRight size={18} /></div>
            <div className="vh-step">
              <div className="vh-step-num">2</div>
              <div className="vh-step-icon-wrap"><Search size={20} /></div>
              <h3>Explorez les e-posters</h3>
              <p>Parcourez, filtrez et recherchez parmi toutes les communications scientifiques.</p>
            </div>
            <div className="vh-step-connector"><ArrowRight size={18} /></div>
            <div className="vh-step">
              <div className="vh-step-num">3</div>
              <div className="vh-step-icon-wrap"><QrCode size={20} /></div>
              <h3>Scannez le QR Code</h3>
              <p>Emportez le poster sur votre mobile en scannant le QR Code affiché.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── CATEGORIES ── */}
      <section className="vh-categories-section">
        <div className="vh-categories-inner">
          <div className="vh-section-header centered">
            <div>
              <h2 className="vh-section-title centered">
                <Activity size={20} />
                Recherche par Spécialité
              </h2>
              <p className="vh-section-sub centered">
                Explorez directement les communications selon leur domaine thérapeutique
              </p>
            </div>
          </div>
          <div className="vh-cat-grid">
            {categoriesList.map((cat, i) => {
              const Icon = cat.icon;
              return (
                <button
                  key={i}
                  className="vh-cat-card"
                  onClick={() => navigate(`/totem/publications?category=${encodeURIComponent(cat.name)}&screen=visitor`)}
                >
                  <div className="vh-cat-icon" style={{ background: cat.bg, color: cat.color }}>
                    <Icon size={22} />
                  </div>
                  <h3>{cat.name}</h3>
                  <span className="vh-cat-count">Explorer →</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="vh-faq-section">
        <div className="vh-faq-inner">
          <div className="vh-section-header centered">
            <div>
              <h2 className="vh-section-title centered">
                <HelpCircle size={20} />
                Questions Fréquentes
              </h2>
              <p className="vh-section-sub centered">Tout savoir sur la plateforme E-Poster et son utilisation</p>
            </div>
          </div>
          <div className="vh-faq-list">
            {faqs.map((faq, i) => (
              <div key={i} className={`vh-faq-item ${openFaqIndex === i ? "open" : ""}`}>
                <button
                  type="button"
                  className="vh-faq-trigger"
                  onClick={() => setOpenFaqIndex(openFaqIndex === i ? null : i)}
                >
                  <span>{faq.question}</span>
                  <div className="vh-faq-icon">
                    {openFaqIndex === i ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </div>
                </button>
                {openFaqIndex === i && (
                  <div className="vh-faq-body animate-fade-in">
                    <p>{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PROFESSIONAL MULTI-COLUMN FOOTER ── */}
      <footer className="prt-footer">
        <div className="prt-footer-top">
          <div className="prt-footer-inner">
            {/* Brand column */}
            <div className="prt-footer-brand">
              <div className="prt-footer-logo">
                <div className="vh-logo-icon">
                  <Presentation size={18} />
                </div>
                <div>
                  <span className="prt-footer-logo-name">E-Poster</span>
                  <span className="prt-footer-logo-sub">Plateforme Scientifique</span>
                </div>
              </div>
              <p className="prt-footer-brand-desc">
                La solution de référence pour la présentation et la consultation de communications
                scientifiques lors des congrès médicaux et académiques.
              </p>
              <div className="prt-footer-badges">
                <span className="prt-footer-badge"><Globe size={11} /> Accessible partout</span>
                <span className="prt-footer-badge"><QrCode size={11} /> QR Mobile</span>
              </div>
            </div>

            {/* Visitors column */}
            <div className="prt-footer-col">
              <p className="prt-footer-col-title">Espace Visiteurs</p>
              <ul className="prt-footer-links-list">
                <li><Link to="/totem?screen=visitor" className="prt-footer-link"><ChevronRight size={12}/>Accueil Congrès</Link></li>
                <li><Link to="/totem/publications?screen=visitor" className="prt-footer-link"><ChevronRight size={12}/>Tous les E-Posters</Link></li>
                <li><Link to="/totem?screen=visitor" className="prt-footer-link"><ChevronRight size={12}/>Mode Borne Tactile</Link></li>
              </ul>
            </div>

            {/* Organizers column */}
            <div className="prt-footer-col">
              <p className="prt-footer-col-title">Espace Organisateurs</p>
              <ul className="prt-footer-links-list">
                <li><Link to="/login" className="prt-footer-link"><ChevronRight size={12}/>Connexion</Link></li>
                <li><Link to="/admin/stats" className="prt-footer-link"><ChevronRight size={12}/>Tableau de bord</Link></li>
                <li><Link to="/admin/events" className="prt-footer-link"><ChevronRight size={12}/>Gestion des Congrès</Link></li>
                <li><Link to="/admin/publications" className="prt-footer-link"><ChevronRight size={12}/>Gestion des Publications</Link></li>
              </ul>
            </div>

            {/* Totem column */}
            <div className="prt-footer-col">
              <p className="prt-footer-col-title">Modes Borne</p>
              <ul className="prt-footer-links-list">
                <li><Link to="/totem?screen=1" className="prt-footer-link"><ChevronRight size={12}/>Totem Écran 1</Link></li>
                <li><Link to="/totem?screen=2" className="prt-footer-link"><ChevronRight size={12}/>Totem Écran 2</Link></li>
                <li><Link to="/totem?screen=3" className="prt-footer-link"><ChevronRight size={12}/>Totem Écran 3</Link></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="prt-footer-bottom">
          <div className="prt-footer-bottom-inner">
            <span className="prt-footer-copy">© 2026 AMPIIC — Plateforme E-Poster. Tous droits réservés.</span>
            <div className="prt-footer-bottom-links">
              <Link to="/login" className="prt-footer-bottom-link">Espace Organisateurs</Link>
              <span className="prt-footer-sep">·</span>
              <Link to="/totem?screen=visitor" className="prt-footer-bottom-link">Accès Visiteurs</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function EventCard({ event, formatDateShort, onClick }) {
  return (
    <div className="vh-event-card" onClick={onClick}>
      <div className="vh-card-banner">
        {(event.bannerUrl && event.bannerUrl.trim()) || (event.logoUrl && event.logoUrl.trim()) ? (
          <img src={getMediaUrl(event.bannerUrl || event.logoUrl)} alt="Banner" className="vh-card-banner-img" />
        ) : (
          <div className="vh-card-banner-placeholder">
            <Presentation size={32} />
          </div>
        )}
        <div className="vh-card-banner-overlay" />
        <div className="vh-card-status">
          <span className="vh-status-dot" />
          En cours
        </div>
        {event.logoUrl && (
          <div className="vh-card-logo-wrap">
            <img src={getMediaUrl(event.logoUrl)} alt="Logo" className="vh-card-logo" />
          </div>
        )}
      </div>

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
              <div className="vh-card-qr" onClick={(e) => e.stopPropagation()} title="Scanner pour accéder au programme">
                <QRCodeCanvas value={toScannableUrl(event.programUrl)} size={48} level="H" fgColor="#0f172a" />
                <span>Programme</span>
              </div>
            )}
            {event.revueUrl && (
              <div className="vh-card-qr" onClick={(e) => e.stopPropagation()} title="Scanner pour accéder à la revue">
                <QRCodeCanvas value={toScannableUrl(event.revueUrl)} size={48} level="H" fgColor="#0f172a" />
                <span>La Revue</span>
              </div>
            )}
          </div>
          <button className="vh-card-cta">
            Explorer <ArrowRight size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}