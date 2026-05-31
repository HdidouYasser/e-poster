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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Tableau de Bord & Statistiques</h2>
          <p className="text-sm text-slate-500 mt-1">Rapport en temps réel des consultations d'e-posters</p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing || statsQuery.isLoading}
            className="flex-1 sm:flex-none btn-ghost"
          >
            <RefreshCw size={16} className={isRefreshing ? "animate-spin" : ""} />
            Actualiser
          </button>
          
          <button
            onClick={exportStatsCSV}
            disabled={statsQuery.isLoading || stats.topPublications.length === 0}
            className="flex-1 sm:flex-none btn-primary"
          >
            <Download size={16} />
            Exporter CSV
          </button>
        </div>
      </div>

      {statsQuery.isLoading ? (
        <div className="flex flex-col items-center justify-center py-32 bg-white/60 backdrop-blur-md rounded-3xl border border-zinc-200/60 shadow-sm">
          <div className="w-10 h-10 border-4 border-zinc-200 border-t-zinc-900 rounded-full animate-spin mb-4" />
          <p className="text-sm text-zinc-500 font-semibold tracking-wide">Chargement du tableau de bord...</p>
        </div>
      ) : (
        <>
          {/* KPI Dashboard Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {cardItems.map((card, i) => (
              <div 
                key={i} 
                className="bg-white border border-zinc-200/80 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden group"
              >
                {/* Floating graphic overlay */}
                <div className="absolute -right-6 -bottom-6 opacity-5 group-hover:scale-110 transition-transform duration-300">
                  <card.icon size={110} />
                </div>
                
                <div className="flex justify-between items-start mb-4">
                  <span className="text-xs text-zinc-400 font-bold uppercase tracking-wider">{card.title}</span>
                  <div className={`p-2.5 rounded-xl ${card.color} text-white shadow-sm shrink-0`}>
                    <card.icon size={16} />
                  </div>
                </div>

                <div className="text-2xl sm:text-3xl font-black text-zinc-900 tracking-tight mb-1 font-display">
                  {card.value?.toLocaleString() || 0}
                </div>
                <p className="text-[10px] text-zinc-400 font-semibold leading-relaxed">{card.desc}</p>
              </div>
            ))}
          </div>

          {/* Detailed Statistics Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Top 5 consulted e-posters */}
            <div className="bg-white border border-zinc-200/80 rounded-3xl p-6 shadow-sm lg:col-span-2 flex flex-col">
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-zinc-100">
                <div>
                  <h3 className="text-lg font-bold text-zinc-900 tracking-tight font-display">
                    Top 5 des E-Posters les plus Consultés
                  </h3>
                  <p className="text-xs text-zinc-400 font-medium mt-0.5">Publications récoltant le plus d'intérêt des visiteurs</p>
                </div>
                <span className="px-3 py-1 text-[10px] font-extrabold uppercase bg-theme-primary/10 text-theme-primary border border-theme-primary/15 rounded-lg">
                  Popularité
                </span>
              </div>

              {stats.topPublications?.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center py-20 text-center">
                  <BookOpen size={48} className="text-zinc-300 mb-4 animate-pulse" />
                  <h4 className="text-sm font-bold text-zinc-700">Aucune consultation enregistrée</h4>
                  <p className="text-xs text-zinc-400 max-w-xs mt-1">Consultez des publications sur le totem interactif pour voir les données s'actualiser ici.</p>
                </div>
              ) : (
                <div className="space-y-6 flex-1">
                  {stats.topPublications.map((pub, idx) => {
                    const pct = Math.round(((pub.viewCount || 0) / maxViews) * 100);
                    return (
                      <div key={pub.id} className="flex gap-4 items-start p-3 hover:bg-zinc-50/50 rounded-2xl border border-transparent hover:border-zinc-100 transition-all">
                        {/* Rank Badge */}
                        <div 
                          style={idx === 0 ? { backgroundColor: 'var(--theme-primary)', color: 'var(--theme-foreground)' } : {}}
                          className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black shrink-0 shadow-sm border ${
                            idx === 0 ? 'border-transparent' :
                            idx === 1 ? 'bg-zinc-900 text-white border-transparent' :
                            'bg-zinc-100 text-zinc-700 border-zinc-200'
                          }`}
                        >
                          {idx + 1}
                        </div>

                        {/* Visual Thumbnail */}
                        {pub.posterUrl ? (
                          <img
                            src={getPosterThumbnail(pub.posterUrl)}
                            alt="thumbnail"
                            className="w-11 h-14 object-cover rounded-lg border border-zinc-200 shadow-sm shrink-0 bg-white"
                          />
                        ) : (
                          <div className="w-11 h-14 bg-zinc-100 border border-zinc-200 rounded-lg flex items-center justify-center text-zinc-300 shrink-0">
                            <FileText size={16} />
                          </div>
                        )}

                        {/* Title, authors & popularity progression bar */}
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start gap-3 mb-1">
                            <h4 className="text-xs font-bold text-zinc-900 leading-snug line-clamp-1 flex-1 font-display">
                              {pub.title}
                            </h4>
                            <span className="text-xs font-extrabold text-zinc-700 shrink-0 font-mono flex items-center gap-1">
                              <Eye size={12} className="text-theme-secondary" /> {pub.viewCount || 0}
                            </span>
                          </div>
                          
                          <p className="text-[10px] text-zinc-400 font-medium truncate mb-2.5">
                            {pub.authors || "Auteur principal"}
                          </p>

                          {/* Progress bar represent views ratio */}
                          <div className="w-full bg-zinc-100 h-2 rounded-full overflow-hidden flex">
                            <div 
                              style={{ width: `${Math.max(pct, 4)}%`, backgroundColor: 'var(--theme-primary)' }}
                              className="rounded-full transition-all duration-1000"
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Informative / Overview Panel */}
            <div className="space-y-6">
              
              {/* Active configuration box */}
              <div className="bg-white border border-zinc-200/80 rounded-3xl p-6 shadow-sm">
                <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-wider mb-4 font-display">Branding & Thème Actif</h3>
                
                <div className="bg-zinc-50 p-4 rounded-2xl border border-zinc-100 space-y-4">
                  <div className="flex items-center gap-3">
                    <span className="w-3.5 h-3.5 rounded-full bg-theme-primary shrink-0 border border-black/10 shadow-sm" />
                    <div>
                      <h4 className="text-xs font-bold text-zinc-800">Couleur Primaire</h4>
                      <p className="text-[10px] text-zinc-400 font-mono uppercase font-semibold">Thème événementiel</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="w-3.5 h-3.5 rounded-full bg-theme-secondary shrink-0 border border-black/10 shadow-sm" />
                    <div>
                      <h4 className="text-xs font-bold text-zinc-800">Couleur Secondaire</h4>
                      <p className="text-[10px] text-zinc-400 font-mono uppercase font-semibold">Accents & Badges</p>
                    </div>
                  </div>
                  
                  <div className="pt-2 border-t border-zinc-200/60">
                    <p className="text-[10px] text-zinc-550 italic leading-relaxed font-medium">
                      Le totem adapte dynamiquement son apparence en fonction du congrès sélectionné sur la borne par le visiteur.
                    </p>
                  </div>
                </div>
              </div>

              {/* Informative checklist */}
              <div className="bg-zinc-900 text-white rounded-3xl p-6 shadow-lg relative overflow-hidden">

                <div className="flex items-center gap-3.5 mb-4">
                  <div className="p-2 bg-white/10 rounded-xl text-theme-secondary">
                    <ArrowUpRight size={18} />
                  </div>
                  <h3 className="text-sm font-bold tracking-tight font-display">Maximiser les consultations</h3>
                </div>

                <ul className="space-y-3.5 text-xs text-zinc-300 font-medium">
                  <li className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-theme-secondary mt-1.5 shrink-0" />
                    <span>Ajoutez des résumés détaillés (Abstracts) pour optimiser les recherches sur totem.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-theme-secondary mt-1.5 shrink-0" />
                    <span>Rattachez des pièces jointes (vidéos, résumés PDF) aux e-posters pour enrichir la consultation.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-theme-secondary mt-1.5 shrink-0" />
                    <span>Assignez correctement les thèmes et les salles pour faciliter le filtrage rapide par borne.</span>
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
