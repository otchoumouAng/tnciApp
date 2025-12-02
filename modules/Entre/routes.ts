import { api, handleNetworkError } from '../Shared/route';
// Le type TransfertLot est défini dans un fichier partagé
import { TransfertLot } from '../Shared/type'; 
// --- MODIFICATION --- : Importation du nouveau type
import { ReceptionData, LotDetailReception } from './type';

/**
 * Récupère la liste des lots en transit destinés au magasin de l'utilisateur.
 */
export const getLotsARecevoir = async (magasinId: number): Promise<any[]> => {
    try {
        const params = new URLSearchParams();
        params.append('magasinId', magasinId.toString());
        
        const response = await api.get('/transfertlot/entransit', { params });
        return response.data;
    } catch (error) {
        // --- MODIFICATION --- : Ajout du contexte
        throw handleNetworkError(error, 'getLotsARecevoir');
    }
};

// =================================================================
// NOUVELLE FONCTION AJOUTÉE
// =================================================================

/**
 * Récupère les détails complets d'un lot pour la réception.
 * @param lotId L'ID du Lot (ltID).
 */
export const getLotDetailForReception = async (lotId: string): Promise<LotDetailReception> => {
    try {
        const response = await api.get(`/transfertlot/reception-detail/${lotId}`);
        return response.data;
    } catch (error) {
        throw handleNetworkError(error, 'getLotDetailForReception');
    }
};

// =================================================================
// FONCTION 'getTransfertById' SUPPRIMÉE
// (Elle causait le 404 et n'est plus nécessaire car la SP est corrigée)
// =================================================================


/**
 * Valide la réception d'un lot.
 * @param id L'ID du lot.
 * @param data Les données du formulaire de réception.
 */
export const validerReception = async (id: string, data: ReceptionData): Promise<any> => {
    try {
        const response = await api.put(`/transfertlot/${id}/reception`, data);
        return response.data;
    } catch (error: { response?: { data?: { message?: string, title?: string } }, message?: string }) {
        // --- MODIFICATION --- : Ajout du contexte
        // Affiche l'erreur de validation de l'API (ex: "Prière vérifier le magasin...")
        const serverMessage = error.response?.data?.message || error.response?.data?.title || error.message;
        throw new Error(serverMessage || "Une erreur inattendue est survenue lors de la validation de la réception.");
    }
};