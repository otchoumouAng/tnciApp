import { api, handleNetworkError } from '../Shared/route';
import { Palette, Emplacement, PaletteReceptionRequest } from './type';

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
 * Fetches emplacement details by ID.
 * @param id The ID of the emplacement.
 */
export const getEmplacementById = async (id: number): Promise<Emplacement | null> => {
    try {
        const response = await api.get(`/emplacement/${id}`);
        return response.data;
    } catch (error: any) {
        if (error.response && error.response.status === 404) {
            return null;
        }
        throw handleNetworkError(error, `getEmplacementById(${id})`);
    }
}

/**
 * Finalizes the reception of a palette.
 * @param request The reception request details.
 */
export const receptionnerPalette = async (request: PaletteReceptionRequest): Promise<any> => {
    try {
        const response = await api.post('/palette/reception', request);
        return response.data;
    } catch (error) {
        throw handleNetworkError(error, 'receptionnerPalette');
    }
}
