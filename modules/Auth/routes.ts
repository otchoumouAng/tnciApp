import axios from 'axios';
import { baseUrl } from '../../config';
import { LoginCredentials, User } from './types';

// On utilise un service d'API dédié pour l'authentification
export const authService = {
  login: async (credentials: LoginCredentials): Promise<User> => {
    // L'endpoint correspond au contrôleur C#
    const response = await axios.post(`${baseUrl}/user/login`, credentials);
    return response.data;
  },

  logout: async (): Promise<void> => {
    // Logique de déconnexion si nécessaire
  },
};