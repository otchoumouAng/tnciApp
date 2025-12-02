/**
 * Interfaces pour le module de Sortie (Transfert)
 */

/**
 * Représente l'objet retourné par l'API /api/stock/lots
 * C'est l'objet "item" utilisé pour la navigation initiale.
 */
export interface StockLot {
  lotID: string; // GUID
  numeroLot: string;
  magasinID: number;
  magasinNom: string;
  exportateurID: number;
  exportateurNom: string;
  quantite: number; // Stock dispo
  poidsBrut: number; // Poids brut du stock dispo
  poidsNetAccepte: number; // Poids net du stock dispo
  tareSac: number;
  tarePalette: number;
  produitID: number;
  libelleProduit: string;
  certificationID: number;
  nomCertification: string;
  gradeLotID: number;
  libelleGradeLot: string;
  typeLotID: number;
  libelleTypeLot: string;
  campagneID: string; // Campagne d'origine du lot
}

/**
 * Représente l'objet DTO (Data Transfer Object) attendu par l'API
 * POST /api/transfertlot
 */
export interface TransfertDto {
  campagneID: string;
  siteID: number;
  lotID: string; // GUID
  numeroLot: string;
  numBordereauExpedition: string;
  magasinExpeditionID: number;
  nombreSacsExpedition: number;
  nombrePaletteExpedition: number;
  tareSacsExpedition: number;
  tarePaletteExpedition: number;
  poidsBrutExpedition: number;
  poidsNetExpedition: number;
  immTracteurExpedition: string;
  immRemorqueExpedition: string;
  dateExpedition: string; // ISO Date String
  commentaireExpedition: string;
  statut: string;
  magReceptionTheoID: number;
  produitID: number;
  exportateurID: number;
  modeTransfertID: number;
  typeOperationID: number;
  mouvementTypeID: number;
  creationUtilisateur: string;
  certificationID: number | null;
  sacTypeID: number | null;
}

/**
 * NOUVEAU Type correspondant à la réponse de /api/lot/{id}
 */
export interface LotDetailFull {
    id: string;
    campagneID: string;
    exportateurID: number;
    exportateurNom: string;
    productionID: string | null;
    numeroProduction: string | null;
    typeLotID: number;
    typeLotDesignation: string;
    certificationID: number | null;
    certificationDesignation: string;
    dateLot: string;
    dateProduction: string | null;
    numeroLot: string;
    nombreSacs: number;
    poidsBrut: number;
    tareSacs: number;
    tarePalettes: number;
    poidsNet: number;
    estQueue: boolean;
    estManuel: boolean;
    estReusine: boolean;
    statut: string;
    desactive: boolean;
    creationUtilisateur: string;
    creationDate: string;
    modificationUtilisateur: string;
    modificationDate: string;
    rowVersionKey: string;
    estQueueText: string | null;
    estManuelText: string | null;
    estReusineText: string | null;
    estFictif: boolean | null;
    produitID: number;
    siteID: number;
    siteNom: string;
    produitNom: string;
    magasinID: number;
    magasinDesignation: string;
    nombrePalette: number; 
    isApproved: boolean;
    gradeLotID: number;
    libelleGradeLot: string;
    typeSacID: number;
    libelleTypeSac: string;
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
 * Type pour /api/magasin
 */
export interface Magasin {
  id: number;
  designation: string;
}

/**
 * Représente la réponse de l'API /api/parametre
 */
export interface Parametres {
  sites: any | null;
  campagne: string;
  exportateur: number;
  exportateurNom: string;
  nomSociete: string;
  adresseSociete: string;
  telSociete: string;
}