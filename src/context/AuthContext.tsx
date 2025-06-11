import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { User, AuthState } from '../types';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type AuthAction =
  | { type: 'LOGIN_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'LOGOUT' }
  | { type: 'UPDATE_USER'; payload: User }
  | { type: 'SET_LOADING'; payload: boolean };

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
      };
    case 'LOGOUT':
      return {
        user: null,
        token: null,
        isAuthenticated: false,
      };
    case 'UPDATE_USER':
      return {
        ...state,
        user: action.payload,
      };
    default:
      return state;
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, {
    user: null,
    token: null,
    isAuthenticated: false,
  });

  useEffect(() => {
    // Check for existing token in localStorage
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (token && userData) {
      try {
        const user = JSON.parse(userData);
        dispatch({ type: 'LOGIN_SUCCESS', payload: { user, token } });
      } catch (error) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
  }, []);

  // Ajout du stockage des utilisateurs dans le localStorage pour la vue admin
  const USERS_KEY = 'app_users';

  const getStoredUsers = (): User[] => {
    const stored = localStorage.getItem(USERS_KEY);
    return stored ? JSON.parse(stored) : [
      {
        id: '1',
        name: 'Admin User',
        email: 'admin@docflow.com',
        role: 'admin',
        createdAt: '2024-01-10T08:00:00Z'
      }
    ];
  };

  const setStoredUsers = (users: User[]) => {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  };

  const login = async (email: string, password: string) => {
    try {
      // Recherche dans la liste globale des utilisateurs
      const allUsers = getStoredUsers();
      const foundUser = allUsers.find(u => u.email === email);
      if (!foundUser) throw new Error('Utilisateur non trouvé');
      const token = 'mock_jwt_token_' + Date.now();
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(foundUser));
      dispatch({ type: 'LOGIN_SUCCESS', payload: { user: foundUser, token } });
    } catch (error) {
      throw new Error('Erreur de connexion');
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      // Simulate API call - replace with actual API endpoint
      const newUser: User = {
        id: Date.now().toString(),
        name,
        email,
        role: 'user',
        createdAt: new Date().toISOString(),
      };
      // Ajout du nouvel utilisateur à la liste globale
      const allUsers = [newUser, ...getStoredUsers()];
      setStoredUsers(allUsers);
      const token = 'mock_jwt_token_' + Date.now();
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(newUser));
      dispatch({ type: 'LOGIN_SUCCESS', payload: { user: newUser, token } });
    } catch (error) {
      throw new Error('Erreur lors de l\'inscription');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    dispatch({ type: 'LOGOUT' });
  };

  const updateUser = (user: User) => {
    localStorage.setItem('user', JSON.stringify(user));
    dispatch({ type: 'UPDATE_USER', payload: user });
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};