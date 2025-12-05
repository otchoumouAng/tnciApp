//SHARED/ROUTE.TS

import axios from 'axios';
import { baseUrl } from '../../config';
// --- MODIFICATION ---
import { Magasin, Parametres } from './type'; // Assurez-vous que Parametres est aussi dans './type'
// --- FIN MODIFICATION ---


// Create an axios instance with a base URL
export const api = axios.create({
  baseURL: baseUrl,
  timeout: 10000,
});


export const handleNetworkError = (error: any, context: string) => {
  if (error.response) {
    // Erreur de l'API (4xx, 5xx)
    console.error(`Erreur ${error.response.status} dans ${context}:`, error.response.data);
    const serverMessage = error.response.data?.message || error.response.data?.title || JSON.stringify(error.response.data);
    return new Error(`Erreur API: ${serverMessage}`);
  } else if (error.request) {
    // Pas de réponse (timeout, réseau)
    console.error(`Pas de réponse du serveur dans ${context}:`, error.request);
    return new Error("Pas de réponse du serveur. Vérifiez votre connexion.");
  } else {
    // Erreur de configuration
    console.error(`Erreur de configuration dans ${context}:`, error.message);
    return new Error("Erreur de configuration de la requête.");
  }
};

/**
 * Fetches a list of items for a dropdown.
 * @param endpoint - The API endpoint to fetch from (e.g., 'magasin', 'exportateur').
 */
const getDropdownData = async (endpoint: string): Promise<any[]> => {
    try {
        const response = await api.get(`/${endpoint}`);
        return response.data;
    } catch (error) {
        throw handleNetworkError(error, `getDropdownData(${endpoint})`);
    }
};

// --- NOUVEAU ---
/**
 * Récupère les paramètres globaux de l'application (ex: campagne actuelle).
 */
export const getParametres = async (): Promise<Parametres> => {
    try {
        const response = await api.get('/parametre');
        return response.data;
    } catch (error) {
        throw handleNetworkError(error, 'getParametres');
    }
};
// --- FIN NOUVEAU ---


export const getExportateurs = () => getDropdownData('exportateur');
export const getSites = () => getDropdownData('site');
export const getMagasins = () => getDropdownData('magasin');
export const getCertifications = () => getDropdownData('certification'); 
export const getGrades = () => getDropdownData('grade');
export const getLotTypes = () => getDropdownData('lottype');
export const getProduits = () => getDropdownData('produit');


/**
 * Fetches the list of campaigns, derived from lots.
 */
export const getCampagnes = async (): Promise<string[]> => {
    try {
        const lots = await getDropdownData('lot');
        const campagnes = [...new Set(lots.map((lot: any) => lot.campagneID).filter(Boolean))];
        return campagnes;
    } catch (error) {
        console.error('Error fetching campaigns from lots:', error);
        throw error;
    }
}

