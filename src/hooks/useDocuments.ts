import { useState, useEffect } from 'react';
import { Document, DocumentFilters } from '../types';
import { useAuth } from '../context/AuthContext';

const API_URL = 'http://localhost:4000';

// Ajout d'un champ fileData (base64) pour permettre l'aperçu et le téléchargement sans backend
const mockDocuments: Document[] = [
  {
    id: '1',
    title: 'Document 1',
    description: 'Description du document 1',
    category: 'cat1',
    fileUrl: '',
    fileName: 'document1.pdf',
    fileSize: 1234,
    fileType: 'application/pdf',
    uploadedBy: { id: 'user1', name: 'User One' },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    fileData: '', // base64
  },
  {
    id: '2',
    title: 'Document 2',
    description: 'Description du document 2',
    category: 'cat2',
    fileUrl: '',
    fileName: 'document2.pdf',
    fileSize: 5678,
    fileType: 'application/pdf',
    uploadedBy: { id: 'user2', name: 'User Two' },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    fileData: '', // base64
  },
];

const STORAGE_KEY = 'app_documents';

const getStoredDocuments = (): Document[] => {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : mockDocuments;
};

const setStoredDocuments = (docs: Document[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(docs));
};

// Convertit un fichier en base64
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const useDocuments = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    fetchDocuments();
  }, [user]);

  const fetchDocuments = async (filters?: DocumentFilters) => {
    try {
      setLoading(true);
      setError(null);
      await new Promise(resolve => setTimeout(resolve, 300));
      let allDocs = getStoredDocuments();
      let filteredDocs = allDocs;
      if (user?.role === 'user') {
        filteredDocs = filteredDocs.filter(doc => doc.uploadedBy.id === user.id);
      }
      if (filters?.search) {
        const searchTerm = filters.search.toLowerCase();
        filteredDocs = filteredDocs.filter(doc =>
          doc.title.toLowerCase().includes(searchTerm) ||
          doc.description.toLowerCase().includes(searchTerm) ||
          doc.category.toLowerCase().includes(searchTerm)
        );
      }
      if (filters?.category && filters.category !== 'all') {
        filteredDocs = filteredDocs.filter(doc => doc.category === filters.category);
      }
      if (filters?.sortBy) {
        filteredDocs.sort((a, b) => {
          let aValue, bValue;
          switch (filters.sortBy) {
            case 'title':
              aValue = a.title.toLowerCase();
              bValue = b.title.toLowerCase();
              break;
            case 'category':
              aValue = a.category.toLowerCase();
              bValue = b.category.toLowerCase();
              break;
            case 'date':
            default:
              aValue = new Date(a.createdAt).getTime();
              bValue = new Date(b.createdAt).getTime();
              break;
          }
          if (filters.sortOrder === 'desc') {
            return aValue > bValue ? -1 : 1;
          }
          return aValue < bValue ? -1 : 1;
        });
      }
      setDocuments(filteredDocs);
    } catch (err) {
      setError('Erreur lors du chargement des documents');
    } finally {
      setLoading(false);
    }
  };

  // Upload d'un document (mock, stockage base64)
  const uploadDocument = async (formData: FormData) => {
    try {
      const file = formData.get('file') as File;
      const fileData = file ? await fileToBase64(file) : '';
      const newDoc: Document & { fileData?: string } = {
        id: Date.now().toString(),
        title: formData.get('title') as string,
        description: formData.get('description') as string,
        category: formData.get('category') as string,
        fileUrl: '', // sera généré dynamiquement
        fileName: file?.name || 'uploaded_file.pdf',
        fileSize: file?.size || 0,
        fileType: file?.type || 'application/pdf',
        uploadedBy: user!,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        fileData, // base64
      };
      const allDocs = [newDoc, ...getStoredDocuments()];
      setStoredDocuments(allDocs);
      setDocuments(prev => [newDoc, ...prev]);
      return newDoc;
    } catch (err) {
      throw new Error('Erreur lors de l\'upload du document');
    }
  };

  const deleteDocument = async (id: string) => {
    try {
      const allDocs = getStoredDocuments().filter(doc => doc.id !== id);
      setStoredDocuments(allDocs);
      setDocuments(prev => prev.filter(doc => doc.id !== id));
    } catch (err) {
      throw new Error('Erreur lors de la suppression du document');
    }
  };

  // Génère dynamiquement fileUrl à partir du base64 (fileData)
  const documentsWithFileUrl = documents.map(doc => ({
    ...doc,
    fileUrl: doc.fileData || '', // fileData est déjà un dataURL (base64)
  }));

  return {
    documents: documentsWithFileUrl,
    loading,
    error,
    fetchDocuments,
    uploadDocument,
    deleteDocument,
  };
};