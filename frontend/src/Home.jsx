import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuthStore } from "./stores/authStore";
import {
  Presentation, Monitor, LayoutDashboard, Search, Database,
  Activity, FileText, Users, UploadCloud, Download, ArrowRight,
  ChevronRight, Calendar, Lock, Play, MousePointerClick, Sliders,
  ShieldCheck, CheckCircle2, Layers, BookOpen, Settings, Eye, RefreshCw
} from "lucide-react";

export default function Home() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const username = useAuthStore((s) => s.username);
  const [activeTab, setActiveTab] = useState("totem");

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 font-sans relative overflow-hidden bg-dot-grid">

      {/* ── Navbar ── */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-zinc-200/60 shadow-sm transition-all duration-200">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-zinc-900 flex items-center justify-center text-white shadow-md">
              <Presentation size={18} />
            </div>
            <div>
              <h1 className="text-base font-extrabold text-zinc-900 tracking-tight font-display flex items-center gap-2">
                E-Poster
                <span className="px-2 py-0.5 rounded-full text-[9px] bg-zinc-100 text-zinc-600 font-bold border border-zinc-200/60 uppercase tracking-widest">
                  v2.0
                </span>
              </h1>
              <p className="text-[10px] text-zinc-400 font-semibold tracking-wide uppercase">Interactive Platform</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Link
              to="/totem"
              className="text-xs font-bold text-zinc-600 hover:text-zinc-900 transition-colors px-3 py-2 rounded-lg hover:bg-zinc-50"
            >
              Borne Totem
            </Link>
            
            {isAuthenticated ? (
              <Link
                to="/admin/stats"
                className="btn btn-primary btn-sm flex items-center gap-1.5 font-display"
              >
                <LayoutDashboard size={13} />
                Dashboard ({username || "Admin"})
              </Link>
            ) : (
              <Link
                to="/login"
                className="btn btn-ghost btn-sm flex items-center gap-1.5 text-zinc-700 font-display"
              >
                <Lock size={13} />
                Connexion Admin
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* ── Hero Section ── */}
      <section className="relative pt-20 pb-16 px-6 max-w-5xl mx-auto text-center z-10">
        <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[10px] font-bold tracking-widest uppercase mb-4 bg-zinc-900 text-white shadow-sm">
          <Activity size={10} className="animate-pulse text-orange-400" />
          Refonte Numérique Événementielle
        </span>

        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-zinc-950 tracking-tight leading-[1.1] mb-6 font-display max-w-4xl mx-auto">
          L'excellence de la communication scientifique, <span className="text-[#f1785b]">interactive</span> et <span className="underline decoration-zinc-900 decoration-3 underline-offset-4">administrable</span>.
        </h1>

        <p className="text-base text-zinc-500 max-w-2xl mx-auto leading-relaxed mb-10">
          Transformez vos affichages papiers traditionnels en une expérience tactile fluide et immersive. 
          Gérez vos congrès, suivez l'intérêt des participants et diffusez les communications médicales en un instant.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/totem"
            className="w-full sm:w-auto px-6 py-3.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-2xl text-sm font-bold flex items-center justify-center gap-2 shadow-md active:scale-95 transition-all font-display group"
          >
            Lancer la Borne Totem
            <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
          </Link>
          <Link
            to={isAuthenticated ? "/admin/stats" : "/login"}
            className="w-full sm:w-auto px-6 py-3.5 bg-white hover:bg-zinc-50 border border-zinc-200 text-zinc-700 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 shadow-sm active:scale-95 transition-all font-display"
          >
            {isAuthenticated ? "Aller au Back-Office" : "Accéder à l'Administration"}
          </Link>
        </div>
      </section>

      {/* ── Interactive Demo tabs ── */}
      <section className="px-6 max-w-6xl mx-auto mb-20 z-10 relative">
        <div className="text-center mb-8">
          <h2 className="text-xl font-bold tracking-tight text-zinc-900 font-display">Prévisualisez les deux modules phares</h2>
          <p className="text-xs text-zinc-400 mt-1">Cliquez sur un onglet pour explorer l'interface simulée correspondante.</p>
        </div>

        {/* Tab triggers */}
        <div className="flex justify-center mb-6">
          <div className="bg-zinc-200/60 p-1.5 rounded-2xl border border-zinc-300/40 flex gap-1 shadow-inner">
            <button
              onClick={() => setActiveTab("totem")}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === "totem"
                  ? "bg-white text-zinc-950 shadow-sm"
                  : "text-zinc-500 hover:text-zinc-800"
              }`}
            >
              <Monitor size={14} />
              Borne Visiteur (Totem)
            </button>
            <button
              onClick={() => setActiveTab("admin")}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === "admin"
                  ? "bg-white text-zinc-950 shadow-sm"
                  : "text-zinc-500 hover:text-zinc-800"
              }`}
            >
              <LayoutDashboard size={14} />
              Administration (Back-Office)
            </button>
          </div>
        </div>

        {/* Mockup viewer container */}
        <div className="bg-white border border-zinc-200/80 rounded-[32px] shadow-lg overflow-hidden min-h-[480px] flex flex-col md:flex-row items-stretch select-none">
          
          {/* Left panel: Info & Feature list */}
          <div className="w-full md:w-2/5 p-8 border-b md:border-b-0 md:border-r border-zinc-200/60 flex flex-col justify-between bg-zinc-50/40">
            <div>
              {activeTab === "totem" ? (
                <div className="space-y-4 animate-fade-in">
                  <div className="w-10 h-10 rounded-xl bg-orange-100 text-[#f1785b] flex items-center justify-center">
                    <Monitor size={18} />
                  </div>
                  <h3 className="text-xl font-bold tracking-tight text-zinc-900 font-display">Borne Interactive Totem</h3>
                  <p className="text-xs text-zinc-500 leading-relaxed">
                    Une interface tactile conçue pour les halls d'exposition. Elle permet aux congressistes d'explorer de manière autonome et intuitive les publications scientifiques de l'événement.
                  </p>
                  <ul className="space-y-2.5 pt-2">
                    <li className="flex items-start gap-2 text-xs text-zinc-600 font-medium">
                      <CheckCircle2 size={14} className="text-emerald-500 mt-0.5 shrink-0" />
                      <span>Recherche par mots-clés (Index FULLTEXT MySQL)</span>
                    </li>
                    <li className="flex items-start gap-2 text-xs text-zinc-600 font-medium">
                      <CheckCircle2 size={14} className="text-emerald-500 mt-0.5 shrink-0" />
                      <span>Clavier virtuel complet à l'écran</span>
                    </li>
                    <li className="flex items-start gap-2 text-xs text-zinc-600 font-medium">
                      <CheckCircle2 size={14} className="text-emerald-500 mt-0.5 shrink-0" />
                      <span>Thématique et logos configurables par événement</span>
                    </li>
                    <li className="flex items-start gap-2 text-xs text-zinc-600 font-medium">
                      <CheckCircle2 size={14} className="text-emerald-500 mt-0.5 shrink-0" />
                      <span>QR codes pour emporter le poster sur smartphone</span>
                    </li>
                  </ul>
                </div>
              ) : (
                <div className="space-y-4 animate-fade-in">
                  <div className="w-10 h-10 rounded-xl bg-zinc-100 text-zinc-900 flex items-center justify-center border border-zinc-200">
                    <LayoutDashboard size={18} />
                  </div>
                  <h3 className="text-xl font-bold tracking-tight text-zinc-900 font-display">Console Back-Office</h3>
                  <p className="text-xs text-zinc-500 leading-relaxed">
                    Le centre de contrôle complet. Destiné aux administrateurs de la plateforme pour configurer les congrès, suivre les statistiques en temps réel et valider l'activité du système.
                  </p>
                  <ul className="space-y-2.5 pt-2">
                    <li className="flex items-start gap-2 text-xs text-zinc-600 font-medium">
                      <CheckCircle2 size={14} className="text-emerald-500 mt-0.5 shrink-0" />
                      <span>Tableau de bord statistique (consultations, top posters)</span>
                    </li>
                    <li className="flex items-start gap-2 text-xs text-zinc-600 font-medium">
                      <CheckCircle2 size={14} className="text-emerald-500 mt-0.5 shrink-0" />
                      <span>Import massif d'e-posters par fichier CSV/Excel</span>
                    </li>
                    <li className="flex items-start gap-2 text-xs text-zinc-600 font-medium">
                      <CheckCircle2 size={14} className="text-emerald-500 mt-0.5 shrink-0" />
                      <span>Exports simplifiés (PDF Apache PDFBox, CSV, JSON)</span>
                    </li>
                    <li className="flex items-start gap-2 text-xs text-zinc-600 font-medium">
                      <CheckCircle2 size={14} className="text-emerald-500 mt-0.5 shrink-0" />
                      <span>Sécurité renforcée avec journal d'audit des actions</span>
                    </li>
                  </ul>
                </div>
              )}
            </div>

            <div className="pt-6 border-t border-zinc-200/60 mt-6 md:mt-0">
              <Link
                to={activeTab === "totem" ? "/totem" : (isAuthenticated ? "/admin/stats" : "/login")}
                className="w-full py-3 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors font-display"
              >
                {activeTab === "totem" ? "Lancer le Totem réel" : "Ouvrir l'Espace Admin"}
                <ChevronRight size={14} />
              </Link>
            </div>
          </div>

          {/* Right panel: The Visual Mockup */}
          <div className="w-full md:w-3/5 bg-zinc-50 p-6 sm:p-8 flex items-center justify-center overflow-hidden">
            {activeTab === "totem" ? (
              /* TOTEM PREVIEW MOCKUP */
              <div className="w-full max-w-sm bg-white rounded-2xl border border-zinc-200 shadow-xl flex flex-col aspect-[9/14] overflow-hidden animate-fade-in">
                {/* Mock header */}
                <div className="bg-white border-b border-zinc-200/70 p-3.5 flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-[#f1785b] flex items-center justify-center text-white text-[10px] font-bold">EP</div>
                    <div>
                      <h4 className="text-[10px] font-extrabold text-zinc-900 leading-none">AMPIIC E-Poster</h4>
                      <p className="text-[8px] text-zinc-400 font-semibold uppercase mt-0.5">Borne Active 1</p>
                    </div>
                  </div>
                  <div className="flex bg-zinc-100 p-0.5 rounded-md border text-[9px] font-bold text-zinc-600 gap-1">
                    <span className="bg-white px-1.5 py-0.5 rounded shadow-sm text-zinc-900">Écran 1</span>
                    <span className="px-1.5 py-0.5 text-zinc-400">Écran 2</span>
                  </div>
                </div>

                {/* Mock filters / search */}
                <div className="p-3 border-b border-zinc-100 shrink-0">
                  <div className="relative mb-2">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400" size={12} />
                    <div className="w-full bg-zinc-50 border border-zinc-200/80 rounded-lg text-[10px] pl-7 pr-3 py-1.5 text-zinc-400 font-medium">
                      Rechercher par titre, auteur...
                    </div>
                  </div>
                  <div className="flex gap-1 overflow-hidden">
                    <span className="px-2 py-1 bg-zinc-900 text-white rounded-md text-[8px] font-bold">Tous</span>
                    <span className="px-2 py-1 bg-zinc-50 border rounded-md text-[8px] text-zinc-500 font-semibold">Cardiologie</span>
                    <span className="px-2 py-1 bg-zinc-50 border rounded-md text-[8px] text-zinc-500 font-semibold">Neurologie</span>
                  </div>
                </div>

                {/* Mock posters list */}
                <div className="flex-1 p-3 overflow-y-auto space-y-3 bg-zinc-50/40">
                  {/* Mock item 1 */}
                  <div className="bg-white rounded-xl border border-zinc-200 p-2.5 flex items-start gap-2.5 shadow-sm hover:border-zinc-300">
                    <div className="w-12 aspect-[3/4] bg-zinc-100 rounded-md shrink-0 border border-zinc-200 flex items-center justify-center">
                      <FileText size={16} className="text-zinc-300" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-[7px] font-extrabold text-[#f1785b] uppercase tracking-wider">Neurologie</span>
                      <h5 className="text-[10px] font-bold text-zinc-900 leading-snug line-clamp-1">AVC aigu et l'impact de l'IA</h5>
                      <p className="text-[8px] text-zinc-400 truncate mt-0.5">Dr. Sarah Alami · CHU de Fès</p>
                      <div className="flex items-center gap-1.5 mt-2">
                        <span className="text-[8px] font-bold text-zinc-500 bg-zinc-100 px-1 py-0.5 rounded">Salle A</span>
                        <span className="text-[8px] font-bold text-[#f1785b] bg-orange-50 px-1 py-0.5 rounded">Session 1</span>
                      </div>
                    </div>
                  </div>

                  {/* Mock item 2 */}
                  <div className="bg-white rounded-xl border border-zinc-200 p-2.5 flex items-start gap-2.5 shadow-sm hover:border-zinc-300">
                    <div className="w-12 aspect-[3/4] bg-zinc-100 rounded-md shrink-0 border border-zinc-200 flex items-center justify-center">
                      <FileText size={16} className="text-zinc-300" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-[7px] font-extrabold text-[#f1785b] uppercase tracking-wider">Cardiologie</span>
                      <h5 className="text-[10px] font-bold text-zinc-900 leading-snug line-clamp-1">Biomarqueurs dans l'infarctus</h5>
                      <p className="text-[8px] text-zinc-400 truncate mt-0.5">Prof. Karim Benjelloun</p>
                      <div className="flex items-center gap-1.5 mt-2">
                        <span className="text-[8px] font-bold text-zinc-500 bg-zinc-100 px-1 py-0.5 rounded">Salle B</span>
                        <span className="text-[8px] font-bold text-[#f1785b] bg-orange-50 px-1 py-0.5 rounded">Session 2</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer simulation */}
                <div className="bg-white border-t border-zinc-200/60 p-2 text-center text-[7px] text-zinc-400 font-semibold shrink-0">
                  © 2026 AMPIIC · Tactile Kiosk Mode
                </div>
              </div>
            ) : (
              /* ADMIN DASHBOARD PREVIEW MOCKUP */
              <div className="w-full max-w-md bg-white rounded-2xl border border-zinc-200 shadow-xl flex flex-col aspect-[1.4] overflow-hidden animate-fade-in">
                {/* Mock header */}
                <div className="bg-zinc-950 text-white p-3 flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-md bg-white text-zinc-950 flex items-center justify-center"><Settings size={10} /></div>
                    <span className="text-[9px] font-bold uppercase tracking-wider">Console E-Poster Admin</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[8px] font-bold text-emerald-400">Système En Ligne</span>
                  </div>
                </div>

                <div className="flex-1 flex overflow-hidden">
                  {/* Mock Sidebar */}
                  <div className="w-24 bg-zinc-50 border-r border-zinc-200 p-2 space-y-1 shrink-0">
                    <div className="px-2 py-1 bg-zinc-900 text-white rounded-md text-[8px] font-bold flex items-center gap-1"><LayoutDashboard size={9} />Stats</div>
                    <div className="px-2 py-1 text-zinc-500 rounded-md text-[8px] font-medium flex items-center gap-1 hover:bg-zinc-100"><FileText size={9} />E-Posters</div>
                    <div className="px-2 py-1 text-zinc-500 rounded-md text-[8px] font-medium flex items-center gap-1 hover:bg-zinc-100"><Calendar size={9} />Congrès</div>
                    <div className="px-2 py-1 text-zinc-500 rounded-md text-[8px] font-medium flex items-center gap-1 hover:bg-zinc-100"><UploadCloud size={9} />Import Bulk</div>
                    <div className="px-2 py-1 text-zinc-500 rounded-md text-[8px] font-medium flex items-center gap-1 hover:bg-zinc-100"><Activity size={9} />Audit Logs</div>
                  </div>

                  {/* Mock Stats panel */}
                  <div className="flex-1 p-3.5 space-y-3.5 overflow-y-auto">
                    <h4 className="text-[10px] font-extrabold text-zinc-900 font-display">Tableau de bord statistique</h4>
                    
                    {/* Mock stats grid */}
                    <div className="grid grid-cols-3 gap-2">
                      <div className="bg-white border rounded-xl p-2 shadow-sm text-center">
                        <span className="text-[7px] text-zinc-400 font-bold uppercase block">E-Posters</span>
                        <span className="text-xs font-black text-zinc-950 font-display block mt-0.5">342</span>
                      </div>
                      <div className="bg-white border rounded-xl p-2 shadow-sm text-center">
                        <span className="text-[7px] text-zinc-400 font-bold uppercase block">Lectures</span>
                        <span className="text-xs font-black text-zinc-950 font-display block mt-0.5">14.2K</span>
                      </div>
                      <div className="bg-white border rounded-xl p-2 shadow-sm text-center">
                        <span className="text-[7px] text-zinc-400 font-bold uppercase block">Zone Kiosque</span>
                        <span className="text-xs font-black text-emerald-600 font-display block mt-0.5">4 Actifs</span>
                      </div>
                    </div>

                    {/* Table overview simulation */}
                    <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
                      <div className="bg-zinc-50 border-b p-1.5 flex justify-between text-[7px] font-bold text-zinc-400 uppercase">
                        <span>Événements</span>
                        <span>Statut</span>
                      </div>
                      <div className="divide-y text-[8px] text-zinc-700">
                        <div className="p-1.5 flex justify-between items-center">
                          <span className="font-semibold">Congrès AMPIIC 2026</span>
                          <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold uppercase text-[6px]">ACTIF</span>
                        </div>
                        <div className="p-1.5 flex justify-between items-center">
                          <span className="font-semibold">Symposium Endocrino</span>
                          <span className="px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-500 font-bold uppercase text-[6px]">BROUILLON</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── Core Concept Pillars ── */}
      <section className="py-16 bg-zinc-900 text-white relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-[#f1785b] text-[10px] font-bold uppercase tracking-widest bg-orange-500/10 px-3 py-1 rounded-full border border-orange-500/20">
              Architecture Écosystème
            </span>
            <h2 className="text-3xl font-extrabold tracking-tight mt-3 font-display">Une architecture modulaire et performante</h2>
            <p className="text-sm text-zinc-400 max-w-xl mx-auto mt-2 leading-relaxed">
              La plateforme associe un moteur d'affichage rapide destiné au public et une interface d'administration consolidée pour les organisateurs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* Totem card */}
            <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-8 shadow-md hover:border-zinc-700 transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-[#f1785b]">
                    <Monitor size={22} />
                  </div>
                  <span className="px-2.5 py-1 rounded-lg text-[9px] bg-zinc-900 border border-zinc-800 font-extrabold tracking-wider uppercase text-zinc-400">
                    Front-Office
                  </span>
                </div>
                <h3 className="text-xl font-bold tracking-tight mb-3 font-display text-white">Le Mode Totem Tactile</h3>
                <p className="text-sm text-zinc-400 leading-relaxed mb-6">
                  Déployée sur des bornes tactiles dans les espaces d'exposition, cette interface garantit une fluidité absolue. 
                  Grâce au cache géré par React Query et aux transitions CSS adaptées, l'expérience utilisateur est instantanée et intuitive.
                </p>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#f1785b]" />
                    <span className="text-xs text-zinc-300 font-medium">Recherche MySQL FULLTEXT tolérante aux gros volumes</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#f1785b]" />
                    <span className="text-xs text-zinc-300 font-medium">Clavier virtuel sur mesure pour écrans tactiles</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#f1785b]" />
                    <span className="text-xs text-zinc-300 font-medium">Slideshow automatique de veille (autoplay) configurable</span>
                  </div>
                </div>
              </div>
              <div className="pt-8 mt-8 border-t border-zinc-900">
                <Link
                  to="/totem"
                  className="inline-flex items-center gap-2 text-xs font-bold text-[#f1785b] hover:text-white transition-colors group font-display"
                >
                  Tester la borne tactile
                  <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>
            </div>

            {/* Admin card */}
            <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-8 shadow-md hover:border-zinc-700 transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-white">
                    <LayoutDashboard size={22} />
                  </div>
                  <span className="px-2.5 py-1 rounded-lg text-[9px] bg-zinc-900 border border-zinc-800 font-extrabold tracking-wider uppercase text-zinc-400">
                    Back-Office
                  </span>
                </div>
                <h3 className="text-xl font-bold tracking-tight mb-3 font-display text-white">La Console d'Administration</h3>
                <p className="text-sm text-zinc-400 leading-relaxed mb-6">
                  Sécurisé par une authentification JWT, cet espace offre un contrôle total de la plateforme. 
                  Il permet aux organisateurs d'intégrer des milliers de posters d'un coup et de piloter l'apparence de chaque totem à distance.
                </p>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-white" />
                    <span className="text-xs text-zinc-300 font-medium">Statistiques d'audience (KPI, classement des posters)</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-white" />
                    <span className="text-xs text-zinc-300 font-medium">Importateur Excel/CSV en bloc via Apache POI</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-white" />
                    <span className="text-xs text-zinc-300 font-medium">Journal d'audit historique des actions de sécurité</span>
                  </div>
                </div>
              </div>
              <div className="pt-8 mt-8 border-t border-zinc-900">
                <Link
                  to={isAuthenticated ? "/admin/stats" : "/login"}
                  className="inline-flex items-center gap-2 text-xs font-bold text-white hover:text-[#f1785b] transition-colors group font-display"
                >
                  Accéder à l'administration
                  <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Technical Features Grid ── */}
      <section className="py-20 px-6 max-w-7xl mx-auto z-10 relative">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-extrabold tracking-tight text-zinc-950 font-display">Sous le capot technique</h2>
          <p className="text-sm text-zinc-400 mt-2 max-w-xl mx-auto leading-relaxed">
            Une architecture moderne reposant sur des technologies éprouvées, optimisées pour la sécurité, l'évolutivité et la vitesse.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Tech 1 */}
          <div className="bg-white border border-zinc-200/80 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all">
            <div className="w-10 h-10 rounded-xl bg-zinc-50 border border-zinc-200/80 flex items-center justify-center mb-5 text-zinc-800">
              <Search size={18} />
            </div>
            <h4 className="text-base font-bold text-zinc-900 tracking-tight font-display mb-2">Recherche FULLTEXT MySQL</h4>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Indexation multi-colonnes (titres, auteurs, résumés) permettant de retrouver instantanément des communications même parmi des milliers d'e-posters.
            </p>
          </div>

          {/* Tech 2 */}
          <div className="bg-white border border-zinc-200/80 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all">
            <div className="w-10 h-10 rounded-xl bg-zinc-50 border border-zinc-200/80 flex items-center justify-center mb-5 text-zinc-800">
              <Layers size={18} />
            </div>
            <h4 className="text-base font-bold text-zinc-900 tracking-tight font-display mb-2">Charte Graphique Dynamique</h4>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Utilisation de variables CSS dynamiques pour adapter l'ensemble de l'interface totem (boutons, thèmes) à la charte et au logo de chaque congrès en temps réel.
            </p>
          </div>

          {/* Tech 3 */}
          <div className="bg-white border border-zinc-200/80 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all">
            <div className="w-10 h-10 rounded-xl bg-zinc-50 border border-zinc-200/80 flex items-center justify-center mb-5 text-zinc-800">
              <Download size={18} />
            </div>
            <h4 className="text-base font-bold text-zinc-900 tracking-tight font-display mb-2">Exports Multi-Formats</h4>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Récupération propre au format CSV (UTF-8 BOM), JSON et PDF généré avec translittération pour préserver les caractères accentués scientifiques.
            </p>
          </div>

          {/* Tech 4 */}
          <div className="bg-white border border-zinc-200/80 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all">
            <div className="w-10 h-10 rounded-xl bg-zinc-50 border border-zinc-200/80 flex items-center justify-center mb-5 text-zinc-800">
              <RefreshCw size={18} />
            </div>
            <h4 className="text-base font-bold text-zinc-900 tracking-tight font-display mb-2">Synchronisation et Nettoyage</h4>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Un algorithme de déduplication transactionnel côté Spring Boot permettant de fusionner automatiquement les publications importées en double.
            </p>
          </div>

          {/* Tech 5 */}
          <div className="bg-white border border-zinc-200/80 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all">
            <div className="w-10 h-10 rounded-xl bg-zinc-50 border border-zinc-200/80 flex items-center justify-center mb-5 text-zinc-800">
              <ShieldCheck size={18} />
            </div>
            <h4 className="text-base font-bold text-zinc-900 tracking-tight font-display mb-2">Logs d'Audit de Sécurité</h4>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Traçabilité complète à travers un journal d'audit en base de données répertoriant la date, l'auteur et les détails de chaque modification.
            </p>
          </div>

          {/* Tech 6 */}
          <div className="bg-white border border-zinc-200/80 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all">
            <div className="w-10 h-10 rounded-xl bg-zinc-50 border border-zinc-200/80 flex items-center justify-center mb-5 text-zinc-800">
              <BookOpen size={18} />
            </div>
            <h4 className="text-base font-bold text-zinc-900 tracking-tight font-display mb-2">Interactivité Tactile Optimisée</h4>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Mise en page épurée avec gestionnaire d'inactivité (Idle Timer), zoom fluide sur posters, et détection de mouvements physiques pour écrans haute définition.
            </p>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-white border-t border-zinc-200/60 py-12 px-6 relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-zinc-900 flex items-center justify-center text-white"><Presentation size={14} /></div>
            <div>
              <span className="text-sm font-extrabold text-zinc-950 font-display">Plateforme E-Poster</span>
              <p className="text-[10px] text-zinc-400 font-medium leading-none">© 2026 AMPIIC · Tous droits réservés</p>
            </div>
          </div>

          <div className="flex items-center gap-6 text-xs text-zinc-400 font-semibold tracking-wide">
            <Link to="/totem" className="hover:text-zinc-900 transition-colors">Interface Totem</Link>
            <span className="text-zinc-200">|</span>
            <Link to="/login" className="hover:text-zinc-900 transition-colors">Portail Admin</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}
