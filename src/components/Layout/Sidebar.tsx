import React, { useState } from 'react';
import {
  FileText,
  Upload,
  Users,
  Settings,
  LogOut,
  Home,
  Search
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange }) => {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(true); // Pour le responsive

  const menuItems = [
    { id: 'dashboard', label: 'Tableau de bord', icon: Home },
    { id: 'documents', label: 'Mes Documents', icon: FileText },
    { id: 'upload', label: 'Nouveau Document', icon: Upload },
    { id: 'search', label: 'Rechercher', icon: Search },
    ...(user?.role === 'admin' ? [
      { id: 'users', label: 'Utilisateurs', icon: Users },
    ] : []),
    { id: 'settings', label: 'Paramètres', icon: Settings },
  ];

  // Animation d'apparition des items (sans style inline)
  const getItemAnimation = (index: number) => `transition-all duration-300 delay-${index * 50}`;

  return (
    <>
      {/* Bouton burger pour mobile */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 bg-blue-500 text-white p-2 rounded-lg shadow-lg focus:outline-none"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Ouvrir/fermer le menu"
      >
        <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" /></svg>
      </button>
      <div
        className={`bg-white w-64 min-h-screen shadow-lg border-r border-gray-200 fixed md:static z-40 top-0 left-0 transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 transition-transform duration-300 ease-in-out flex flex-col`}
      >
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-teal-500 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">DocFlow</h1>
              <p className="text-sm text-gray-500">Gestion Documentaire</p>
            </div>
          </div>
        </div>

        <div className="p-4 flex-1 flex flex-col">
          <div className="bg-gradient-to-r from-blue-50 to-teal-50 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-teal-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                {user?.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-medium text-gray-900">{user?.name}</p>
                <p className="text-sm text-gray-500 capitalize">{user?.role}</p>
              </div>
            </div>
          </div>

          <nav className="space-y-2 flex-1">
            {menuItems.map((item, idx) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => { onTabChange(item.id); setIsOpen(false); }}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left ${getItemAnimation(idx)} ${isActive
                    ? 'bg-gradient-to-r from-blue-500 to-teal-500 text-white shadow-lg scale-105'
                    : 'text-gray-700 hover:bg-blue-50 hover:scale-105'
                    }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
        <div className="p-4">
          <button
            onClick={logout}
            className="w-full flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors duration-200"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Déconnexion</span>
          </button>
        </div>
      </div>
    </>
  );
};