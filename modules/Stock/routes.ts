import { api, handleNetworkError } from '../Shared/route';
import { LotFilters } from '../Shared/components/Filtre';
import { StockLot } from './type';


// Dans Stock/routes.ts

export const getStockLots = async (filters: StockFilters): Promise<StockLot[]> => {
  try {
    const params = new URLSearchParams();
    
    if (filters.magasinID) params.append('magasinID', filters.magasinID);
    if (filters.campagneID) params.append('campagneID', filters.campagneID);
    if (filters.exportateurID) params.append('exportateurID', filters.exportateurID);
    if (filters.produitID) params.append('produitID', filters.produitID);
    if (filters.certificationID) params.append('certificationID', filters.certificationID);
    if (filters.typeLotID) params.append('typeLotID', filters.typeLotID);
    if (filters.gradeLotID) params.append('gradeLotID', filters.gradeLotID); 
    
    //console.log("Requesting /stock/lots with params:", params.toString());
    const response = await api.get('/stock/lots', { params });
    return response.data;
  } catch (error) {
    throw handleNetworkError(error, 'getStockLots');
  }
};


