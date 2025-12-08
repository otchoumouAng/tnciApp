import { api, handleNetworkError } from '../Shared/route';
import { Palette, PaletteDeplacementRequest, PaletteDeplacementResponse, OperationType } from './type';

/**
 * Fetches palette details from the API using its ID.
 * @param id The unique identifier of the palette.
 */
export const getPaletteById = async (id: string): Promise<Palette | null> => {
  try {
    const response = await api.get(`/palette/${id}`);
    return response.data;
  } catch (error: any) {
    if (error.response && (error.response.status === 404 || error.response.status === 400)) {
      return null;
    }
    throw handleNetworkError(error, `getPaletteById(${id})`);
  }
};

/**
 * Moves a palette to transit.
 * @param request The displacement request details.
 */
export const deplacerPalette = async (request: PaletteDeplacementRequest): Promise<PaletteDeplacementResponse> => {
  try {
    const response = await api.post('/palette/deplacer', request);
    return response.data;
  } catch (error) {
    throw handleNetworkError(error, `deplacerPalette(${request.paletteId})`);
  }
};

/**
 * Fetches the list of palettes currently in transit for the user.
 * @param userId The ID of the user to filter palettes by.
 */
export const getPalettesEnTransit = async (userId: string): Promise<Palette[]> => {
    try {
        const response = await api.get('/palette/transite', {
            params: { userId }
        });
        return response.data;
    } catch (error) {
        throw handleNetworkError(error, 'getPalettesEnTransit');
    }
}

/**
 * Fetches the list of available operation types.
 */
export const getOperationTypes = async (): Promise<OperationType[]> => {
  try {
    const response = await api.get('/operationType');
    return response.data;
  } catch (error) {
    // If the API fails, we can return a default list or throw, depending on requirements.
    // For now, let's assume it should work and throw if not.
    console.error("Failed to fetch operation types", error);
     // Fallback if API fails? Or rethrow?
     // Rethrowing so the UI can handle or ignore.
     throw handleNetworkError(error, 'getOperationTypes');
  }
}
