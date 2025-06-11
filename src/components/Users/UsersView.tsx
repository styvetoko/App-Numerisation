import React, { useState, useEffect } from 'react';
import { Users, UserPlus, Shield, User, Trash2, Search } from 'lucide-react';
import { User as UserType } from '../../types';
import { useAuth } from '../../context/AuthContext';

// Mock data for demonstration
const mockUsers: UserType[] = [
  {
    id: '1',
    name: 'Admin User',
    email: 'admin@docflow.com',
    role: 'admin',
    createdAt: '2024-01-10T08:00:00Z',
  },
  {
    id: '2',
    name: 'Marie Dupont',
    email: 'marie.dupont@docflow.com',
    role: 'user',
    createdAt: '2024-01-15T10:30:00Z',
  },
  {
    id: '3',
    name: 'Jean Martin',
    email: 'jean.martin@docflow.com',
    role: 'user',
    createdAt: '2024-01-20T14:20:00Z',
  },
  {
    id: '4',
    name: 'Sophie Bernard',
    email: 'sophie.bernard@docflow.com',
    role: 'user',
    createdAt: '2024-02-01T09:15:00Z',
  },
];

const USERS_KEY = 'app_users';
const getStoredUsers = () => {
  const stored = localStorage.getItem(USERS_KEY);
  return stored ? JSON.parse(stored) : mockUsers;
};
const setStoredUsers = (users: UserType[]) => {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

export const UsersView: React.FC = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<UserType[]>(getStoredUsers());
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<'all' | 'admin' | 'user'>('all');
  const [showAddAdmin, setShowAddAdmin] = useState(false);
  const [newAdmin, setNewAdmin] = useState({ name: '', email: '' });

  const filteredUsers = users.filter(user => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === 'all' || user.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  useEffect(() => {
    // Rafraîchir la liste à chaque affichage (utile si un nouvel utilisateur vient de s'inscrire)
    setUsers(getStoredUsers());
  }, []);

  const handleDeleteUser = (userId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      const updated = users.filter(user => user.id !== userId);
      setUsers(updated);
      setStoredUsers(updated);
    }
  };

  const handleAddAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdmin.name || !newAdmin.email) return;
    const adminUser: UserType = {
      id: Date.now().toString(),
      name: newAdmin.name,
      email: newAdmin.email,
      role: 'admin',
      createdAt: new Date().toISOString(),
    };
    const updated = [adminUser, ...users];
    setUsers(updated);
    setStoredUsers(updated);
    setShowAddAdmin(false);
    setNewAdmin({ name: '', email: '' });
  };

  const getRoleColor = (role: string) => {
    return role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700';
  };

  const getRoleIcon = (role: string) => {
    return role === 'admin' ? Shield : User;
  };

  // Seul l'administrateur principal (id === '1') peut ajouter ou supprimer un utilisateur ou un autre administrateur
  const isSuperAdmin = user?.role === 'admin' && user?.id === '1';

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Utilisateurs</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{users.length}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Administrateurs</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {users.filter(u => u.role === 'admin').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Utilisateurs</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {users.filter(u => u.role === 'user').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
              <User className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex-1 max-w-lg">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Rechercher des utilisateurs..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <select
              value={selectedRole}
              onChange={e => setSelectedRole(e.target.value as 'all' | 'admin' | 'user')}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              title="Filtrer par rôle"
            >
              <option value="all">Tous les rôles</option>
              <option value="admin">Administrateurs</option>
              <option value="user">Utilisateurs</option>
            </select>
            {isSuperAdmin && (
              <button
                className="bg-gradient-to-r from-blue-500 to-teal-500 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-teal-600 transition-all duration-200 flex items-center space-x-2"
                onClick={() => setShowAddAdmin(true)}
              >
                <UserPlus className="w-4 h-4" />
                <span>Nouvel administrateur</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-4 px-6 font-medium text-gray-900">Utilisateur</th>
                <th className="text-left py-4 px-6 font-medium text-gray-900">Rôle</th>
                <th className="text-left py-4 px-6 font-medium text-gray-900">Date d'inscription</th>
                <th className="text-right py-4 px-6 font-medium text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredUsers.map((userRow) => {
                const RoleIcon = getRoleIcon(userRow.role);
                const canDelete = isSuperAdmin && userRow.id !== '1';
                return (
                  <tr key={userRow.id} className="hover:bg-gray-50 transition-colors duration-200">
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-teal-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                          {userRow.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{userRow.name}</p>
                          <p className="text-sm text-gray-500">{userRow.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium ${getRoleColor(userRow.role)}`}>
                          <RoleIcon className="w-3 h-3" />
                          <span className="capitalize">{userRow.role}</span>
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-gray-600">
                      {new Date(userRow.createdAt).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-end space-x-2">
                        {canDelete && (
                          <button
                            onClick={() => handleDeleteUser(userRow.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                            title="Supprimer l'utilisateur"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun utilisateur trouvé</h3>
            <p className="text-gray-500">Essayez de modifier vos critères de recherche</p>
          </div>
        )}
      </div>

      {showAddAdmin && isSuperAdmin && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <form onSubmit={handleAddAdmin} className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md space-y-4 relative">
            <button type="button" onClick={() => setShowAddAdmin(false)} className="absolute top-2 right-2 text-gray-400 hover:text-red-500 text-2xl">×</button>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Ajouter un administrateur</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
              <input type="text" className="w-full px-4 py-2 border rounded-lg" value={newAdmin.name} onChange={e => setNewAdmin({ ...newAdmin, name: e.target.value })} required placeholder="Nom complet" title="Nom de l'administrateur" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" className="w-full px-4 py-2 border rounded-lg" value={newAdmin.email} onChange={e => setNewAdmin({ ...newAdmin, email: e.target.value })} required placeholder="Adresse email" title="Email de l'administrateur" />
            </div>
            <button type="submit" className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition">Ajouter</button>
          </form>
        </div>
      )}
    </div>
  );
};