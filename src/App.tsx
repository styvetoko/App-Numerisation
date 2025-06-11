import React, { useState } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AuthPage } from './components/Auth/AuthPage';
import { Sidebar } from './components/Layout/Sidebar';
import { Header } from './components/Layout/Header';
import Footer from './components/Layout/Footer';
import { DashboardView } from './components/Dashboard/DashboardView';
import { DocumentsView } from './components/Documents/DocumentsView';
import { UploadView } from './components/Documents/UploadView';
import { UsersView } from './components/Users/UsersView';

const AppContent: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  if (!isAuthenticated) {
    return <AuthPage />;
  }

  const getTabTitle = (tab: string) => {
    const titles = {
      dashboard: 'Tableau de bord',
      documents: 'Mes Documents',
      upload: 'Nouveau Document',
      search: 'Recherche',
      users: 'Gestion des Utilisateurs',
      settings: 'Paramètres'
    };
    return titles[tab as keyof typeof titles] || 'DocFlow';
  };

  const getTabSubtitle = (tab: string) => {
    const subtitles = {
      dashboard: 'Vue d\'ensemble de votre activité documentaire',
      documents: 'Consultez et gérez vos documents',
      upload: 'Ajouter un nouveau document à votre bibliothèque',
      search: 'Rechercher dans tous vos documents',
      users: 'Gérer les utilisateurs et leurs permissions',
      settings: 'Configurez vos préférences'
    };
    return subtitles[tab as keyof typeof subtitles];
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView />;
      case 'documents':
      case 'search':
        return <DocumentsView />;
      case 'upload':
        return <UploadView />;
      case 'users':
        return user?.role === 'admin' ? <UsersView /> : <DashboardView />;
      case 'settings':
        return (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Paramètres</h3>
            <p className="text-gray-600">Les paramètres seront disponibles dans une prochaine version.</p>
          </div>
        );
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          title={getTabTitle(activeTab)}
          subtitle={getTabSubtitle(activeTab)}
        />
        <main className="flex-1 overflow-y-auto p-6">
          {renderContent()}
        </main>
        <Footer />
      </div>
    </div>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;