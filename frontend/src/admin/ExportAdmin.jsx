import React, { useState } from 'react';
import { Download, FileText, RefreshCw } from 'lucide-react';
import { api } from '../api';
import toast from 'react-hot-toast';

/**
 * Page d'exports pour administrateurs
 * Permet de télécharger/exporter les données en différents formats
 */
export const ExportAdmin = () => {
  const [isExporting, setIsExporting] = useState({
    csv: false,
    json: false,
    pdf: false
  });

  const handleExport = async (format) => {
    setIsExporting(prev => ({ ...prev, [format]: true }));
    try {
      let endpoint = '';
      let filename = `export_${new Date().toISOString().split('T')[0]}`;
      let contentType = '';

      switch (format) {
        case 'csv':
          endpoint = '/publications/export/csv';
          filename += '.csv';
          contentType = 'text/csv';
          break;
        case 'json':
          endpoint = '/publications/export/json';
          filename += '.json';
          contentType = 'application/json';
          break;
        case 'pdf':
          endpoint = '/publications/export/pdf';
          filename += '.pdf';
          contentType = 'application/pdf';
          break;
        default:
          return;
      }

      const response = await api.get(endpoint, {
        responseType: format === 'pdf' ? 'blob' : 'blob',
      });

      // Créer un blob et télécharger
      const blob = new Blob([response.data], { type: contentType });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success(`Données exportées en ${format.toUpperCase()}`);
    } catch (error) {
      toast.error(`Erreur lors de l'export ${format}: ${error.message}`);
    } finally {
      setIsExporting(prev => ({ ...prev, [format]: false }));
    }
  };

  const handleSyncDatabase = async () => {
    try {
      const response = await api.post('/admin/sync-database');
      toast.success('Synchronisation base de données réussie');
      console.log('Sync result:', response.data);
    } catch (error) {
      toast.error('Erreur synchronisation: ' + error.message);
    }
  };

  const exportCards = [
    {
      format: 'csv',
      title: 'Exporter en CSV',
      description: 'Fichier compatible avec Excel/Sheets',
      icon: FileText,
      color: 'bg-green-50 border-green-200'
    },
    {
      format: 'json',
      title: 'Exporter en JSON',
      description: 'Format standard pour données structurées',
      icon: FileText,
      color: 'bg-blue-50 border-blue-200'
    },
    {
      format: 'pdf',
      title: 'Exporter en PDF',
      description: 'Document formaté pour impression',
      icon: FileText,
      color: 'bg-red-50 border-red-200'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Exports & Données</h1>
        <p className="text-gray-600">Gérez les exports et la synchronisation de la base de données</p>
      </div>

      {/* Export Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {exportCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.format}
              className={`p-6 border rounded-lg ${card.color} hover:shadow-lg transition-shadow cursor-pointer`}
              onClick={() => handleExport(card.format)}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-gray-900">{card.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{card.description}</p>
                </div>
                <Icon size={24} className="text-gray-400" />
              </div>

              <button
                disabled={isExporting[card.format]}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-white text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed border border-gray-200 font-medium text-sm transition-colors"
              >
                {isExporting[card.format] ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-gray-600 border-t-transparent rounded-full" />
                    Export en cours...
                  </>
                ) : (
                  <>
                    <Download size={16} />
                    Télécharger
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* Database Sync Section */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Synchronisation Base de Données</h2>
        <p className="text-gray-600 mb-4">
          Nettoyez les doublons et resynchronisez les données de la base de données.
        </p>
        <button
          onClick={handleSyncDatabase}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
        >
          <RefreshCw size={18} />
          Synchroniser maintenant
        </button>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-semibold text-blue-900 mb-2">💡 Formats d'export</h3>
        <ul className="text-sm text-blue-800 space-y-2">
          <li><strong>CSV:</strong> Pour utilisation dans Excel, Google Sheets, ou bases de données</li>
          <li><strong>JSON:</strong> Pour intégration avec d'autres systèmes ou applications mobiles</li>
          <li><strong>PDF:</strong> Pour archivage et distribution formelle</li>
        </ul>
      </div>
    </div>
  );
};

export default ExportAdmin;
