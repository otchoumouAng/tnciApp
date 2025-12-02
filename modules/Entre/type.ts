// Interface pour les données du formulaire de réception
export interface ReceptionData {
    dateReception: string;
    destinationID: number;
    modificationUser: string;
    immTracteurRec: string;
    immRemorqueRec: string;
    numBordereauRec: string;
    commentaireRec: string;
    statut: string;
    nombreSac: number;
    nombrePalette: number;
    poidsNetRecu: number;
    tareSacRecu: number;
    poidsBrut: number;
    tarePaletteArrive: number;
    rowVersionKey: any; // Le format exact dépend de votre gestion (ex: string base64)
    
    // --- CHAMP CORRIGÉ (requis par le 'Dual-Step' backend) ---
    // Correction: 'mouvementTypeId' (camelCase) pour correspondre au Postman
    mouvementTypeId: number;
}

/**
 * Type générique pour les listes des sélecteurs (Picker)
 */
export interface DropdownItem {
  id: number;
  designation: string;
  nom?: string; // Pour Exportateur
}



/**
 * Type pour les détails d'un lot en attente de réception.
 * Correspond au DTO `LotDetailReceptionDto` du backend (via V4_Lot_GetForReception)
 */
export interface LotDetailReception {
    // --- CORRECTION DE CASSE ---
    // Toutes les propriétés sont maintenant en camelCase pour correspondre au JSON de l'API
    id: string; 
    campagneID: string;
    siteID: number;
    numeroLot: string;
    dateExpedition: string;
    
    // C'est l'ID du transfert (tfID), crucial pour la validation !
    idTransfert: string; 
    
    numeroTransfert: string;
    bordereauExpedition: string;
    immTracteurExpedition: string;
    // Corrigé de 'mmRemorqueExpedition' à 'immRemorqueExpedition'
    immRemorqueExpedition: string; 
    
    magasinID: number;
    magasinNom: string;
    
    nombreSacs: number;
    poidsBrut: number;
    tarePalettes: number;
    tareSacs: number;
    poidsNet: number;
    nombrePalette: number;

    statut: string;
    rowVersionKey: any; // string (base64) ou byte[]
}

