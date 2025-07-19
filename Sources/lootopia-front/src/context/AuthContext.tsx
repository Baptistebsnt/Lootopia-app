import React, { createContext, useContext, useState, useEffect } from "react";
import { User } from "../types";
import api from "../services/api";
interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, username: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  updateProfile: (profileData: unknown) => Promise<void>;
  refreshUserData: () => Promise<void>;
}
const AuthContext = createContext<AuthContextType | undefined>(undefined);
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const refreshUserData = async () => {
    const token = localStorage.getItem("lootopia_token");
    if (token && user) {
      try {
        api.setToken(token);
        const response = await api.getUserProfile();
        const frontendUser: User = {
          id: response.user.id,
          email: response.user.email,
          username: response.user.pseudo || response.user.email.split("@")[0],
          crowns: response.user.crown_balance || 1000,
          level: 1,
          xp: 0,
          badges: [],
          joinDate: response.user.created_at
            ? new Date(response.user.created_at).toISOString().split("T")[0]
            : new Date().toISOString().split("T")[0],
          isPremium: false,
          lastName: response.user.lastName,
          surName: response.user.surName,
          pseudo: response.user.pseudo,
          role: response.user.role,
        };
        setUser(frontendUser);
        localStorage.setItem("lootopia_user", JSON.stringify(frontendUser));
      } catch (error) {
        console.error("Failed to refresh user data:", error);
      }
    }
  };
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem("lootopia_token");
      if (token) {
        try {
          api.setToken(token);
          const response = await api.getUserProfile();
          const frontendUser: User = {
            id: response.user.id,
            email: response.user.email,
            username: response.user.pseudo || response.user.email.split("@")[0],
            crowns: response.user.crown_balance || 1000,
            level: 1,
            xp: 0,
            badges: [],
            joinDate: response.user.created_at
              ? new Date(response.user.created_at).toISOString().split("T")[0]
              : new Date().toISOString().split("T")[0],
            isPremium: false,
            lastName: response.user.lastName,
            surName: response.user.surName,
            pseudo: response.user.pseudo,
            role: response.user.role,
          };
          setUser(frontendUser);
          localStorage.setItem("lootopia_user", JSON.stringify(frontendUser));
        } catch (error) {
          console.error("Failed to load user profile:", error);
          api.clearToken();
        }
      }
      setIsLoading(false);
    };
    initializeAuth();
  }, []);
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await api.login({ email, password });
      const frontendUser: User = {
        id: response.user.id,
        email: response.user.email,
        username: response.user.pseudo || response.user.email.split("@")[0],
        crowns: response.user.crown_balance || 1000,
        level: 1,
        xp: 0,
        badges: [],
        joinDate: new Date().toISOString().split("T")[0],
        isPremium: false,
        lastName: response.user.lastName,
        surName: response.user.surName,
        pseudo: response.user.pseudo,
        role: response.user.role,
      };
      localStorage.setItem("lootopia_user", JSON.stringify(frontendUser));
      setUser(frontendUser);
    } finally {
      setIsLoading(false);
    }
  };
  const signup = async (email: string, username: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await api.register({
        email,
        password,
        pseudo: username,
      });
      const frontendUser: User = {
        id: response.user.id,
        email: response.user.email,
        username: response.user.pseudo || username,
        crowns: response.user.crown_balance || 1000,
        level: 1,
        xp: 0,
        badges: [],
        joinDate: new Date().toISOString().split("T")[0],
        isPremium: false,
        pseudo: response.user.pseudo,
        role: response.user.role,
      };
      localStorage.setItem("lootopia_user", JSON.stringify(frontendUser));
      setUser(frontendUser);
    } finally {
      setIsLoading(false);
    }
  };
  const updateProfile = async (profileData: any) => {
    try {
      await api.updateUserProfile(profileData);
      if (user) {
        const updatedUser = {
          ...user,
          ...profileData,
          username: profileData.pseudo || user.username,
        };
        setUser(updatedUser);
        localStorage.setItem("lootopia_user", JSON.stringify(updatedUser));
      }
    } catch (error) {
      throw error;
    }
  };
  const logout = () => {
    setUser(null);
    api.clearToken();
    localStorage.removeItem("lootopia_user");
  };
  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        signup,
        logout,
        isLoading,
        updateProfile,
        refreshUserData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
