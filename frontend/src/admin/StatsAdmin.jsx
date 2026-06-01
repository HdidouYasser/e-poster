import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api, getPosterThumbnail } from "../api";
import { FileText, Eye, Calendar, Monitor, Tags, Download, RefreshCw, BookOpen, User, Tag, HelpCircle, ArrowUpRight } from "lucide-react";
import { toast } from "react-hot-toast";

export default function StatsAdmin() {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const statsQuery = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const response = await api.get("/dashboard/stats");
      return response.data;
    },
    refetchOnWindowFocus: false
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    toast.loading("Actualisation des statistiques...", { id: "refresh-stats" });
    try {
      await statsQuery.refetch();
      toast.success("Statistiques actualisées", { id: "refresh-stats" });
    } catch {
      toast.error("Erreur d'actualisation", { id: "refresh-stats" });
    } finally {
      setIsRefreshing(false);
    }
  };

  const exportStatsCSV = () => {
    const data = statsQuery.data;
    if (!data || !data.topPublications || data.topPublications.length === 0) {
      toast.error("Aucune donnée à exporter");
      return;
    }

    toast.loading("Génération du rapport CSV...", { id: "export" });
    try {
      let csvContent = "\uFEFF"; // BOM for Excel UTF-8
      csvContent += "Classement;Titre;Auteurs;Session;Catégorie;Salle;Nombre de Vues\n";

      data.topPublications.forEach((p, index) => {
        const cleanTitle = (p.title || "").replace(/"/g, '""');
        const cleanAuthors = (p.authors || "").replace(/"/g, '""');
        const cleanSession = (p.session || "").replace(/"/g, '""');
        const cleanCategory = (p.category || "").replace(/"/g, '""');
        const cleanRoom = (p.room || "").replace(/"/g, '""');
        csvContent += `${index + 1};"${cleanTitle}";"${cleanAuthors}";"${cleanSession}";"${cleanCategory}";"${cleanRoom}";${p.viewCount || 0}\n`;
      });

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `rapport_consultations_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Rapport CSV téléchargé", { id: "export" });
    } catch (e) {
      toast.error("Erreur de téléchargement", { id: "export" });
    }
  };

  const stats = statsQuery.data || {
    totalEvents: 0,
    totalPublications: 0,
    totalScreens: 0,
    totalCategories: 0,
    totalViews: 0,
    topPublications: []
  };

  // Safe maximum view count for progress bar percentage mapping
  const maxViews = stats.topPublications?.length > 0 
    ? Math.max(...stats.topPublications.map(p => p.viewCount || 0), 1) 
    : 1;

  const cardItems = [
    { title: "Consultations", value: stats.totalViews, icon: Eye, color: "bg-zinc-900", desc: "Total des e-posters lus" },
    { title: "E-Posters", value: stats.totalPublications, icon: FileText, color: "bg-slate-700", desc: "Publications insérées" },
    { title: "Événements", value: stats.totalEvents, icon: Calendar, color: "bg-blue-600", desc: "Congrès configurés" },
    { title: "Écrans", value: stats.totalScreens, icon: Monitor, color: "bg-emerald-600", desc: "Totems interactifs" },
    { title: "Catégories", value: stats.totalCategories, icon: Tags, color: "bg-amber-600", desc: "Thèmes & sessions" }
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h2 className="page-title">Tableau de Bord &amp; Statistiques</h2>
          <p className="page-subtitle">Rapport en temps réel des consultations d'e-posters</p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing || statsQuery.isLoading}
            className="btn btn-ghost flex-1 sm:flex-none"
          >
            <RefreshCw size={15} className={isRefreshing ? "animate-spin" : ""} />
            Actualiser
          </button>
          
          <button
            onClick={exportStatsCSV}
            disabled={statsQuery.isLoading || stats.topPublications.length === 0}
            className="btn btn-primary flex-1 sm:flex-none"
          >
            <Download size={15} />
            Exporter CSV
          </button>
        </div>
      </div>

      {statsQuery.isLoading ? (
        <div className="card flex flex-col items-center justify-center py-28">
          <div className="loading-spinner mb-4" />
          <p className="text-sm text-zinc-400 font-semibold">Chargement du tableau de bord...</p>
        </div>
      ) : (
        <>
          {/* KPI Dashboard Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
            {cardItems.map((card, i) => (
              <div key={i} className="stat-card group">
                {/* Icon watermark */}
                <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-[0.07] group-hover:scale-110 transition-all duration-300 pointer-events-none">
                  <card.icon size={90} />
                </div>
                
                <div className="flex justify-between items-start mb-3">
                  <span className="stat-card-label">{card.title}</span>
                  <div className={`p-2 rounded-xl ${card.color} text-white shrink-0`}>
                    <card.icon size={15} />
                  </div>
                </div>

                <div className="stat-card-value">
                  {card.value?.toLocaleString() || 0}
                </div>
                <p className="stat-card-desc">{card.desc}</p>
              </div>
            ))}
          </div>

          {/* Detailed Statistics Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Top 5 consulted e-posters */}
            <div className="card lg:col-span-2 flex flex-col">
              <div className="card-body flex-1 flex flex-col">
              <div className="flex justify-between items-center mb-5 pb-4 border-b border-zinc-100">
                <div>
                  <h3 className="text-base font-bold text-zinc-900 tracking-tight font-display">
                    Top 5 — E-Posters les plus Consultés
                  </h3>
                  <p className="text-xs text-zinc-400 font-medium mt-0.5">Publications récoltant le plus d'intérêt</p>
                </div>
                <span className="badge badge-dark">
                  Popularité
                </span>
              </div>

              {stats.topPublications?.length === 0 ? (
                <div className="empty-state flex-1">
                  <BookOpen size={40} className="empty-state-icon animate-pulse" />
                  <h4 className="empty-state-title">Aucune consultation enregistrée</h4>
                  <p className="empty-state-desc">Consultez des publications sur le totem pour voir les données ici.</p>
                </div>
              ) : (
                <div className="space-y-4 flex-1">
                  {stats.topPublications.map((pub, idx) => {
                    const pct = Math.round(((pub.viewCount || 0) / maxViews) * 100);
                    return (
                      <div key={pub.id} className="flex gap-3 items-start p-3 hover:bg-zinc-50/60 rounded-2xl border border-transparent hover:border-zinc-100 transition-all">
                        {/* Rank Badge */}
                        <div 
                          className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black shrink-0 border ${
                            idx === 0 ? 'bg-zinc-900 text-white border-transparent' :
                            idx === 1 ? 'bg-zinc-700 text-white border-transparent' :
                            'bg-zinc-100 text-zinc-600 border-zinc-200'
                          }`}
                        >
                          {idx + 1}
                        </div>

                        {/* Visual Thumbnail */}
                        {pub.posterUrl ? (
                          <img
                            src={getPosterThumbnail(pub.posterUrl)}
                            alt="thumbnail"
                            className="w-10 h-13 object-cover rounded-lg border border-zinc-200 shrink-0 bg-white"
                          />
                        ) : (
                          <div className="w-10 h-13 bg-zinc-100 border border-zinc-200 rounded-lg flex items-center justify-center text-zinc-300 shrink-0">
                            <FileText size={14} />
                          </div>
                        )}

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start gap-2 mb-0.5">
                            <h4 className="text-xs font-bold text-zinc-900 line-clamp-1 flex-1 font-display">
                              {pub.title}
                            </h4>
                            <span className="text-xs font-bold text-zinc-600 shrink-0 flex items-center gap-1 font-mono">
                              <Eye size={11} className="text-theme-secondary" /> {pub.viewCount || 0}
                            </span>
                          </div>
                          <p className="text-[10px] text-zinc-400 truncate mb-2">
                            {pub.authors || "Auteur principal"}
                          </p>
                          <div className="w-full bg-zinc-100 h-1.5 rounded-full overflow-hidden">
                            <div 
                              style={{ width: `${Math.max(pct, 4)}%`, backgroundColor: 'var(--theme-primary)' }}
                              className="h-full rounded-full transition-all duration-1000"
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              </div>
            </div>

            {/* Informative / Overview Panel */}
            <div className="space-y-6">
              
              {/* Active configuration box */}
              <div className="card card-body">
                <h3 className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-4">Branding &amp; Thème Actif</h3>
                
                <div className="card-muted p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="w-3 h-3 rounded-full bg-theme-primary shrink-0 border border-black/10" />
                    <div>
                      <h4 className="text-xs font-bold text-zinc-800">Couleur Primaire</h4>
                      <p className="text-[10px] text-zinc-400 font-mono uppercase">Thème événementiel</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="w-3 h-3 rounded-full bg-theme-secondary shrink-0 border border-black/10" />
                    <div>
                      <h4 className="text-xs font-bold text-zinc-800">Couleur Secondaire</h4>
                      <p className="text-[10px] text-zinc-400 font-mono uppercase">Accents &amp; Badges</p>
                    </div>
                  </div>
                  
                  <div className="pt-3 border-t border-zinc-200/60">
                    <p className="text-[10px] text-zinc-400 italic leading-relaxed">
                      Le totem adapte dynamiquement son apparence en fonction du congrès sélectionné.
                    </p>
                  </div>
                </div>
              </div>

              {/* Informative checklist */}
              <div className="card-dark p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-1.5 bg-white/10 rounded-xl">
                    <ArrowUpRight size={16} className="text-theme-secondary" />
                  </div>
                  <h3 className="text-sm font-bold tracking-tight font-display">Maximiser les consultations</h3>
                </div>

                <ul className="space-y-3 text-xs text-zinc-300">
                  <li className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-theme-secondary mt-1.5 shrink-0" />
                    <span>Ajoutez des résumés (Abstracts) pour optimiser les recherches sur le totem.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-theme-secondary mt-1.5 shrink-0" />
                    <span>Rattachez des pièces jointes (vidéos, PDF) aux e-posters pour enrichir la consultation.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-theme-secondary mt-1.5 shrink-0" />
                    <span>Assignez correctement les thèmes et salles pour faciliter le filtrage rapide.</span>
                  </li>
                </ul>
              </div>

            </div>

          </div>
        </>
      )}
    </div>
  );
}
