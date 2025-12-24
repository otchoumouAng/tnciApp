import React, { createContext, useState, useEffect, ReactNode, useRef, useCallback } from 'react';
import { View, PanResponder } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import Toast from 'react-native-toast-message';
import { authService } from '../modules/Auth/routes';
import { AuthContextType, User, LoginCredentials } from '../modules/Auth/types';

export const AuthContext = createContext<AuthContextType>({} as AuthContextType);

interface AuthProviderProps {
  children: ReactNode;
}

const INACTIVITY_LIMIT_MS = 15 * 60 * 1000; // 15 minutes

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const inactivityTimer = useRef<NodeJS.Timeout | null>(null);

  const clearSession = useCallback(async () => {
    setToken(null);
    setUser(null);
    if (inactivityTimer.current) {
      clearTimeout(inactivityTimer.current);
      inactivityTimer.current = null;
    }
    await SecureStore.deleteItemAsync('authToken');
    await SecureStore.deleteItemAsync('user');
  }, []);

  const logout = useCallback(async (isAutoLogout = false) => {
    setIsLoading(true);
    try {
      await clearSession();
      if (isAutoLogout) {
        Toast.show({
            type: 'info',
            text1: 'Session expirée',
            text2: 'Vous avez été déconnecté pour inactivité.',
        });
      }
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    } finally {
      setIsLoading(false);
    }
  }, [clearSession]);

  const startInactivityTimer = useCallback(() => {
    if (inactivityTimer.current) {
      clearTimeout(inactivityTimer.current);
    }

    if (token) {
      // console.log("Timer (re)démarré pour 5 minutes"); // Décommentez pour déboguer
      inactivityTimer.current = setTimeout(() => {
        console.log("Timer expiré ! Déconnexion auto.");
        logout(true);
      }, INACTIVITY_LIMIT_MS);
    }
  }, [token, logout]);

  const resetInactivityTimer = useCallback(() => {
    if (token) {
        startInactivityTimer();
    }
  }, [token, startInactivityTimer]);

  // Utilisation de useMemo pour le PanResponder pour éviter de le recréer à chaque rendu,
  // mais il doit dépendre de resetInactivityTimer qui lui-même dépend de token.
  // En réalité, useRef est souvent suffisant si on ne veut pas qu'il change.
  // Ici, on veut qu'il appelle la version la plus récente de resetInactivityTimer.
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponderCapture: () => {
        resetInactivityTimer();
        return false;
      },
    })
  ).current;

  // Effet pour gérer le timer initial et lors des changements de token
  useEffect(() => {
      if (token) {
          startInactivityTimer();
      } else {
           if (inactivityTimer.current) {
             clearTimeout(inactivityTimer.current);
             inactivityTimer.current = null;
           }
      }
  }, [token, startInactivityTimer]);

  // Initialisation au lancement
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        await clearSession();
      } catch (error) {
        console.error('Erreur lors du nettoyage de la session:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    return () => {
      if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    };
  }, [clearSession]);

  const login = async (credentials: LoginCredentials) => {
    setIsLoading(true);
    try {
      const userData = await authService.login(credentials);

      if (userData.isDisabled) {
        Toast.show({
          type: 'error',
          text1: 'Échec de la connexion',
          text2: 'Votre compte est désactivé.',
        });
        throw new Error('User account is disabled.');
      }

      const userToken = userData.id;
      setToken(userToken);
      setUser(userData);

      await SecureStore.setItemAsync('authToken', userToken);
      await SecureStore.setItemAsync('user', JSON.stringify(userData));

      Toast.show({
        type: 'success',
        text1: 'Connexion réussie',
        text2: `Bienvenue, ${userData.name} !`,
      });
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Échec de la connexion',
        text2: error.response?.data || 'Identifiants incorrects ou erreur serveur.',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, token, login, logout: () => logout(false), isLoading, resetInactivityTimer }}
    >
      <View style={{ flex: 1 }} {...panResponder.panHandlers}>
        {children}
      </View>
    </AuthContext.Provider>
  );
}
