import React, { useState, useEffect } from 'react';
import { Search, Grid, List } from 'lucide-react';
import { DocumentCard } from './DocumentCard';
import { useDocuments } from '../../hooks/useDocuments';
import { useAuth } from '../../context/AuthContext';
import { Document, DocumentFilters } from '../../types';

export const DocumentsView: React.FC = () => {
  const { user } = useAuth();
  const { documents, loading, fetchDocuments, deleteDocument } = useDocuments();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filters, setFilters] = useState<DocumentFilters>({
    search: '',
    category: 'all',
    sortBy: 'date',
    sortOrder: 'desc'
  });
  const [preview, setPreview] = useState<{ url: string; type: string; name: string } | null>(null);

  const categories = ['all', 'Contrats', 'Paie', 'Formation', 'Autres'];

  useEffect(() => {
    fetchDocuments(filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const handleSearch = (value: string) => {
    setFilters(prev => ({ ...prev, search: value }));
  };

  const handleCategoryFilter = (category: string) => {
    setFilters(prev => ({ ...prev, category }));
  };

  const handleView = (document: Document) => {
    if (document.fileUrl && document.fileType.startsWith('application/pdf')) {
      setPreview({ url: document.fileUrl, type: 'pdf', name: document.fileName });
    } else if (document.fileUrl && document.fileType.startsWith('image/')) {
      setPreview({ url: document.fileUrl, type: 'image', name: document.fileName });
    } else if (document.fileUrl) {
      // Pour les autres types, téléchargement direct
      const link = document.createElement('a');
      link.href = document.fileUrl;
      link.download = document.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      alert('Aperçu non disponible');
    }
  };

  // Fonction utilitaire pour forcer le téléchargement d'un fichier data: ou url
  function forceDownload(url: string, filename: string) {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    // Pour certains navigateurs, il faut ajouter le lien au DOM
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  const handleDownload = (document: Document) => {
    // Télécharge le document (base64 ou url)
    if (document.fileUrl) {
      forceDownload(document.fileUrl, document.fileName);
    } else {
      alert('Téléchargement non disponible');
    }
  };

  const handleDelete = async (document: Document) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce document ?')) {
      try {
        await deleteDocument(document.id);
      } catch {
        alert('Erreur lors de la suppression du document');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Aperçu dans une modale */}
      {preview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 md:p-8">
          <div className="bg-white rounded-lg shadow-lg p-2 md:p-4 w-full max-w-3xl max-h-[90vh] flex flex-col relative">
            <button
              className="absolute top-2 right-2 text-gray-600 hover:text-red-500 text-2xl font-bold z-10"
              onClick={() => setPreview(null)}
              aria-label="Fermer l'aperçu"
              title="Fermer l'aperçu"
            >
              ×
            </button>
            <div className="flex-1 flex items-center justify-center overflow-auto">
              {preview.type === 'pdf' ? (
                <iframe
                  src={preview.url}
                  title="Aperçu PDF"
                  className="w-full h-[60vh] md:h-[70vh] rounded border min-h-[300px] max-h-[80vh]"
                />
              ) : preview.type === 'image' ? (
                <img
                  src={preview.url}
                  alt={preview.name}
                  className="max-h-[60vh] md:max-h-[70vh] w-auto max-w-full mx-auto rounded border min-h-[200px]"
                />
              ) : null}
            </div>
            <div className="mt-4 text-center">
              <a
                href={preview.url}
                download={preview.name}
                className="inline-block px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                title="Télécharger le fichier"
              >
                Télécharger
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex-1 max-w-lg">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Rechercher des documents..."
                value={filters.search}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <select
              value={filters.category}
              onChange={(e) => handleCategoryFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              title="Filtrer par catégorie"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category === 'all' ? 'Toutes les catégories' : category}
                </option>
              ))}
            </select>

            <div className="flex items-center border border-gray-300 rounded-lg">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 ${viewMode === 'grid' ? 'bg-blue-500 text-white' : 'text-gray-500'} rounded-l-lg transition-colors duration-200`}
                title="Vue grille"
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 ${viewMode === 'list' ? 'bg-blue-500 text-white' : 'text-gray-500'} rounded-r-lg transition-colors duration-200`}
                title="Vue liste"
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Documents Grid */}
      {documents.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun document trouvé</h3>
          <p className="text-gray-500">Essayez de modifier vos critères de recherche</p>
        </div>
      ) : (
        <div className={`grid gap-6 ${viewMode === 'grid'
          ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
          : 'grid-cols-1'
          }`}>
          {documents.map(document => (
            <DocumentCard
              key={document.id}
              document={document}
              onView={handleView}
              onDownload={handleDownload}
              onDelete={handleDelete}
              canDelete={user?.role === 'admin' || document.uploadedBy.id === user?.id}
            />
          ))}
        </div>
      )}
    </div>
  );
};