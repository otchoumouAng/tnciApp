//MouvementStock/routes.ts

import { api, handleNetworkError } from '../Shared/route';
import { MouvementStock } from './type';

/**
 * Récupère la liste des mouvements de stock en fonction des filtres.
 */
export const getMouvements = async (params: URLSearchParams): Promise<MouvementStock[]> => {
  try {
    const response = await api.get('/mouvementstock', { params });
    return response.data;
  } catch (error) {
    throw handleNetworkError(error, 'getMouvements');
  }
};

/**
 * Crée un nouveau mouvement de stock.
 * @param mouvementData L'objet contenant les données du mouvement à créer.
 */
export const createMouvementStock = async (mouvementData: Partial<MouvementStock>): Promise<any> => {
    try {
        const response = await api.post('/mouvementstock', mouvementData);
        return response.data;
    } catch (error) {
        throw handleNetworkError(error, 'createMouvementStock');
    }
};