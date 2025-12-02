import { Lot as SharedLot, Magasin as SharedMagasin } from '../Shared/type';

// On ré-exporte les types partagés pour une utilisation simple dans le module
export type Lot = SharedLot;
export type Magasin = SharedMagasin;

// Ce type représente l'objet à envoyer à l'API pour créer un transfert
export interface TransfertDto {
    campagneID: string;
    siteID: number;
    lotID: string;
    magasinExpeditionID: number;
    typeOperationID: number; // 1 pour transfert, 2 pour export
    modeTransfertID: number; // 1 pour total, 2 pour partiel
    nombreSacs: number;
    nombrePalette?: number;
    tareSac: number;
    tarePalette: number;
    poidsBrut: number;
    poidsNet: number;
    immTracteur: string;
    immRemorque: string;
    dateExpedition: string;
    magasinTheoReceptionID?: number;
    creationUser: string;
}