import { api, handleNetworkError } from '../Shared/route';
import { Palette, PaletteDeplacementRequest, PaletteDeplacementResponse } from './type';

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
 */
export const getPalettesEnTransit = async (): Promise<Palette[]> => {
    try {
        const response = await api.get('/palette/transite');
        return response.data;
    } catch (error) {
        throw handleNetworkError(error, 'getPalettesEnTransit');
    }
}
