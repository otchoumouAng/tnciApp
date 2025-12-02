import { api, handleNetworkError } from '../Shared/route';
import { Palette } from './type';

/**
 * Fetches palette details from the API using its ID.
 * The QR code should contain the palette's unique ID (GUID).
 * @param id The unique identifier of the palette.
 */


export const getPaletteById = async (id: string): Promise<Palette | null> => {
  try {
    // The endpoint is GET /api/palette/{id}
    const response = await api.get(`/palette/${id}`);
    return response.data;
  } catch (error: any) {
    if (error.response && (error.response.status === 404 || error.response.status === 400)) {
      return null;
    }
    // Pour les autres erreurs (500, réseau...), on laisse le gestionnaire habituel
    throw handleNetworkError(error, `getPaletteById(${id})`);
  }
};

/**
 * Declares a palette and creates a stock movement.
 * @param palette The full palette object to be declared.
 */
export const declarePalette = async (palette: Palette): Promise<Palette> => {
  try {
    // The endpoint is POST /api/palette/declarer
    const response = await api.post('/palette/declarer', palette);
    return response.data;
  } catch (error) {
    throw handleNetworkError(error, `declarePalette(${palette.id})`);
  }
};

/**
 * Fetches the list of declared palettes.
 * Assumes that "declared" palettes have a specific status we can filter by.
 */
export const getDeclaredPalettes = async (): Promise<Palette[]> => {
    try {
        // The endpoint is GET /api/palette, filtering by status "DC" for declared palettes.
        const response = await api.get('/palette', {
            params: {
                Statut: 'DC'
            }
        });
        return response.data;
    } catch (error) {
        throw handleNetworkError(error, 'getDeclaredPalettes');
    }
}
