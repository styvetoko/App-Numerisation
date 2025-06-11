import React from 'react';
import { FileText, Upload, Users, TrendingUp } from 'lucide-react';
import { StatsCard } from './StatsCard';
import { useAuth } from '../../context/AuthContext';
import { useDocuments } from '../../hooks/useDocuments';

export const DashboardView: React.FC = () => {
  const { user } = useAuth();
  const { documents } = useDocuments();

  const stats = [
    {
      title: 'Total Documents',
      value: documents.length,
      icon: FileText,
      color: 'blue' as const,
      trend: { value: 12, isPositive: true }
    },
    {
      title: 'Uploads ce mois',
      value: 8,
      icon: Upload,
      color: 'green' as const,
      trend: { value: 8, isPositive: true }
    },
    ...(user?.role === 'admin' ? [{
      title: 'Utilisateurs actifs',
      value: 15,
      icon: Users,
      color: 'purple' as const,
      trend: { value: 5, isPositive: true }
    }] : []),
    {
      title: 'Croissance',
      value: '+23%',
      icon: TrendingUp,
      color: 'orange' as const,
    }
  ];

  const recentDocuments = documents.slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Documents récents</h3>
          <div className="space-y-3">
            {recentDocuments.map((doc) => (
              <div key={doc.id} className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors duration-200">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-teal-500 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{doc.title}</p>
                  <p className="text-xs text-gray-500">{doc.category} • {new Date(doc.createdAt).toLocaleDateString('fr-FR')}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Répartition par catégorie</h3>
          <div className="space-y-4">
            {['Contrats', 'Paie', 'Formation', 'Autres'].map((category, index) => {
              const count = documents.filter(doc => doc.category === category).length;
              const percentage = documents.length > 0 ? (count / documents.length) * 100 : 0;
              
              return (
                <div key={category} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-700">{category}</span>
                    <span className="font-medium text-gray-900">{count}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-teal-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};