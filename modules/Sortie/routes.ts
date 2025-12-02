import { api, handleNetworkError } from '../Shared/route';
import { LotFilters } from '../Shared/components/Filtre';
// Import des nouveaux types définis localement
import { StockLot, TransfertDto, LotDetail } from './type';

/**
 * Récupère la liste complète des lots disponibles pour une sortie.
 * L'endpoint /api/stock/lots retourne un objet StockLot.
 */
export const getStockLots = async (filters: LotFilters): Promise<StockLot[]> => {
    try {
        const params = new URLSearchParams();
        
        // On vérifie et ajoute chaque filtre s'il est présent.
        if (filters.magasinID) params.append('magasinID', filters.magasinID);
        if (filters.campagneID) params.append('campagneID', filters.campagneID);
        if (filters.exportateurID) params.append('exportateurID', filters.exportateurID);
        if (filters.produitID) params.append('produitID', filters.produitID);
        if (filters.typeLotID) params.append('typeLotID', filters.typeLotID);
        if (filters.certificationID) params.append('certificationID', filters.certificationID);
        if (filters.gradeID) params.append('gradeID', filters.gradeID);
        
        const response = await api.get('/stock/lots', { params });
        return response.data;
    } catch (error) {
        throw handleNetworkError(error, 'getStockLots');
    }
};


/**
 * Récupère les détails complets d'un lot unique (notamment les tares).
 * @param id Le GUID du lot à récupérer.
 * @param magasinID L'ID du magasin pour lequel calculer le stock.
 */
export const getLotById = async (id: string, magasinID: number): Promise<LotDetailFull> => {
    try {
        // 3. Ajouter 'params' à l'appel api.get
        const response = await api.get(`/lot/${id}`, {
            params: { magasinId: magasinID } 
        });
        return response.data;
    } catch (error) {
        throw handleNetworkError(error, `getLotById(${id}, ${magasinID})`);
    }
};

/**
 * Crée une nouvelle sortie de lot (transfert).
 * @param transfertData L'objet DTO contenant les données du transfert à envoyer.
 */
export const createTransfert = async (transfertData: TransfertDto): Promise<any> => {
    try {
        // L'endpoint pour la création est /api/transfertlot (POST)
        const response = await api.post('/transfertlot', transfertData);
        return response.data;
    } catch (error: any) {
        // Affiche l'erreur de validation de l'API (ex: "CampagneID is required")
        const serverMessage = error.response?.data?.message || error.response?.data?.title || error.message;
        throw new Error(serverMessage || "Une erreur inattendue est survenue lors de la création du transfert.");
    }
};

