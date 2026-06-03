import { useState } from 'react';
import { Download, FileText, Braces, FileType2, RefreshCw, Database, Info } from 'lucide-react';
import { api } from '../api';
import toast from 'react-hot-toast';

const exportCards = [
  {
    format: 'csv',
    title: 'Export CSV',
    description: 'Compatible Excel & Google Sheets',
    icon: FileText,
    iconBg: 'bg-emerald-50 text-emerald-600',
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  {
    format: 'json',
    title: 'Export JSON',
    description: 'Format structuré pour intégrations',
    icon: Braces,
    iconBg: 'bg-blue-50 text-blue-600',
    badge: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  {
    format: 'pdf',
    title: 'Export PDF',
    description: 'Document formaté pour archivage',
    icon: FileType2,
    iconBg: 'bg-red-50 text-red-500',
    badge: 'bg-red-50 text-red-600 border-red-200',
  },
];

export default function ExportAdmin() {
  const [isExporting, setIsExporting] = useState({ csv: false, json: false, pdf: false });
  const [isSyncing, setIsSyncing] = useState(false);

  const handleExport = async (format) => {
    setIsExporting(prev => ({ ...prev, [format]: true }));
    try {
      const endpoints = {
        csv: '/publications/export/csv',
        json: '/publications/export/json',
        pdf: '/publications/export/pdf',
      };
      const mimes = {
        csv: 'text/csv',
        json: 'application/json',
        pdf: 'application/pdf',
      };

      const response = await api.get(endpoints[format], { responseType: 'blob' });
      const blob = new Blob([response.data], { type: mimes[format] });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `export_${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success(`Export ${format.toUpperCase()} téléchargé`);
    } catch (error) {
      toast.error(`Erreur d'export ${format.toUpperCase()} : ${error.message}`);
    } finally {
      setIsExporting(prev => ({ ...prev, [format]: false }));
    }
  };

  const handleSyncDatabase = async () => {
    setIsSyncing(true);
    try {
      await api.post('/admin/sync-database');
      toast.success('Base de données synchronisée avec succès');
    } catch (error) {
      toast.error('Erreur de synchronisation : ' + error.message);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto font-sans animate-fade-in">

      {/* Header */}
      <div className="page-header">
        <div>
          <h2 className="page-title">Exports &amp; Données</h2>
          <p className="page-subtitle">Téléchargez vos données en différents formats ou synchronisez la base</p>
        </div>
      </div>

      {/* Info banner */}
      <div className="alert alert-neutral">
        <Info size={15} className="text-zinc-400 shrink-0 mt-0.5" />
        <p className="text-xs text-zinc-500 leading-relaxed">
          Les exports incluent toutes les publications de la plateforme. Pour un export filtré par événement ou catégorie, utilisez les filtres dans la section <strong className="text-zinc-700">E-Posters</strong>.
        </p>
      </div>

      {/* Export cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {exportCards.map((card) => {
          const Icon = card.icon;
          const loading = isExporting[card.format];
          return (
            <div key={card.format} className="card card-body flex flex-col gap-5 group">
              {/* Top */}
              <div className="flex items-start justify-between">
                <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${card.iconBg}`}>
                  <Icon size={20} />
                </div>
                <span className={`badge border ${card.badge} uppercase`}>{card.format}</span>
              </div>

              {/* Info */}
              <div className="flex-1">
                <h3 className="text-sm font-bold text-zinc-900 font-display">{card.title}</h3>
                <p className="text-xs text-zinc-400 mt-0.5">{card.description}</p>
              </div>

              {/* Action */}
              <button
                onClick={() => handleExport(card.format)}
                disabled={loading}
                className="btn btn-ghost w-full"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-zinc-400 border-t-zinc-900 rounded-full animate-spin" />
                    Export en cours...
                  </>
                ) : (
                  <>
                    <Download size={15} />
                    Télécharger
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* Database sync section */}
      <div className="card card-body">
        <div className="flex items-start gap-4">
          <div className="w-11 h-11 rounded-2xl bg-zinc-100 flex items-center justify-center shrink-0">
            <Database size={20} className="text-zinc-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-bold text-zinc-900 font-display">Synchronisation Base de Données</h3>
            <p className="text-xs text-zinc-400 mt-0.5 mb-4">
              Nettoyez les doublons, reindexez les publications et vérifiez l'intégrité des données.
            </p>
            <button
              onClick={handleSyncDatabase}
              disabled={isSyncing}
              className="btn btn-primary btn-sm"
            >
              <RefreshCw size={14} className={isSyncing ? 'animate-spin' : ''} />
              {isSyncing ? 'Synchronisation...' : 'Synchroniser maintenant'}
            </button>
          </div>
        </div>
      </div>

      {/* Info box */}
      <div className="card-dark p-6 rounded-3xl">
        <h3 className="text-sm font-bold text-white mb-4 font-display">📋 Formats disponibles</h3>
        <ul className="space-y-3 text-xs text-zinc-300">
          <li className="flex items-start gap-2.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
            <span><strong className="text-white">CSV</strong> — Pour analyse dans Excel, Google Sheets, ou import dans d'autres systèmes.</span>
          </li>
          <li className="flex items-start gap-2.5">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 shrink-0" />
            <span><strong className="text-white">JSON</strong> — Pour intégration API, applications mobiles ou archivage structuré.</span>
          </li>
          <li className="flex items-start gap-2.5">
            <span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 shrink-0" />
            <span><strong className="text-white">PDF</strong> — Pour archivage formel, impression ou distribution officielle.</span>
          </li>
        </ul>
      </div>

    </div>
  );
}
