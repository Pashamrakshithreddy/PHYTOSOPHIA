import React, { createContext, useContext, useState, useEffect } from 'react';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar: string;
  gardenerType?: string;
  plantCount?: string;
  goals?: string[];
  onboardingCompleted: boolean;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: UserProfile | null;
  login: (email: string, pass: string, remember: boolean) => Promise<boolean>;
  signup: (name: string, email: string, pass: string, avatar?: string) => Promise<boolean>;
  logout: () => void;
  sendPasswordReset: (email: string) => Promise<boolean>;
  completeOnboarding: (gardenerType: string, plantCount: string, goals: string[]) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('phytosophia_auth_user');
    return saved ? JSON.parse(saved) : {
      id: 'usr-default',
      name: 'Dedi Suheri',
      email: 'risuheri@hello.mail',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      onboardingCompleted: true,
    };
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    const saved = localStorage.getItem('phytosophia_auth_user');
    return !!saved;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('phytosophia_auth_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('phytosophia_auth_user');
    }
  }, [user]);

  const login = async (email: string, _pass: string, _remember: boolean): Promise<boolean> => {
    await new Promise((resolve) => setTimeout(resolve, 800));
    const newUser: UserProfile = {
      id: `usr-${Date.now()}`,
      name: email.split('@')[0] || 'Garden Keeper',
      email,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      onboardingCompleted: true,
    };
    setUser(newUser);
    setIsAuthenticated(true);
    return true;
  };

  const signup = async (name: string, email: string, _pass: string, avatar?: string): Promise<boolean> => {
    await new Promise((resolve) => setTimeout(resolve, 800));
    const newUser: UserProfile = {
      id: `usr-${Date.now()}`,
      name,
      email,
      avatar: avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      onboardingCompleted: false,
    };
    setUser(newUser);
    setIsAuthenticated(true);
    return true;
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('phytosophia_auth_user');
  };

  const sendPasswordReset = async (_email: string): Promise<boolean> => {
    await new Promise((resolve) => setTimeout(resolve, 800));
    return true;
  };

  const completeOnboarding = (gardenerType: string, plantCount: string, goals: string[]) => {
    if (user) {
      setUser({
        ...user,
        gardenerType,
        plantCount,
        goals,
        onboardingCompleted: true,
      });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        login,
        signup,
        logout,
        sendPasswordReset,
        completeOnboarding,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
