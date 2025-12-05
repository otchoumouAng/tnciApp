export interface Lot {
  id: string; // GUID
  campagneID: string;
  exportateurID: number;
  exportateurNom: string;
  productionID: string; // GUID
  numeroProduction: string;
  typeLotID: number;
  typeLotDesignation: string;
  certificationID: number;
  certificationDesignation: string;
  dateLot: string; // DateTime
  dateProduction?: string | null; // DateTime
  numeroLot: string;
  nombreSacs: number;
  poidsBrut: number; // decimal
  tareSacs: number;
  tarePalettes: number;
  poidsNet: number;
  estQueue: boolean;
  estManuel: boolean;
  estReusine: boolean;
  statut: string;
  desactive: boolean;
  creationUtilisateur: string;
  creationDate: string; // DateTime
  modificationUtilisateur?: string | null;
  modificationDate?: string | null; // DateTime
  rowVersionKey: any; // byte[]
  estQueueText: string;
  estManuelText: string;
  estReusineText: string;
  estFictif: boolean;

  // Fields for detail view, may not be in all responses
  siteNom?: string;
  magasinReceptionNom?: string;
  dateExpedition?: string;
  magasinExpeditionNom?: string;
  numeroTransfert?: string;
  nombrePalettes?: number;
}


export interface Magasin {
    id: number;
    designation: string;
    stockTypeID: number;
    stockTypeDesignation: string;
    magasinLocalisation: string;
    estExterne: boolean;
    estTransit: boolean;
    desactive: boolean;
    creationUtilisateur: string;
    creationDate: string;
    modificationUtilisateur: string;
    modificationDate: string | null;
    rowVersionKey: string;
    siteID: number;
    siteNom: string;
    estMagasinParDefaut: boolean | null;
    visibleInStockDashboard: boolean | null;
    visible: boolean | null;
    pontBascule: boolean;
}


export interface TransfertLot {
    id: string;
    campagneID: string;
    siteID: number;
    siteNom: string | null;
    lotID: string;
    numeroLot: string;
    exportateurID: number;
    exportateurNom: string | null;
    numeroExpedition: string;
    numBordereauExpedition: string;
    magasinExpeditionID: number;
    magasinExpeditionNom: string | null;
    nombreSacsExpedition: number;
    nombrePaletteExpedition: number;
    tareSacsExpedition: number;
    tarePaletteExpedition: number;
    poidsBrutExpedition: number;
    poidsNetExpedition: number;
    immTracteurExpedition: string;
    immRemorqueExpedition: string;
    dateExpedition: string;
    commentaireExpedition: string;
    numBordereauReception: string | null;
    magasinReceptionID: number | null;
    magasinReceptionNom: string | null;
    nombreSacsReception: number | null;
    nombrePaletteReception: number | null;
    poidsNetReception: number | null;
    poidsBrutReception: number | null;
    tareSacsReception: number | null;
    tarePaletteReception: number | null;
    immTracteurReception: string | null;
    immRemorqueReception: string | null;
    commentaireReception: string | null;
    dateReception: string | null;
    statut: string;
    desactive: boolean | null;
    creationUtilisateur: string;
    creationDate: string;
    modificationUtilisateur: string | null;
    modificationDate: string | null;
    rowVersionKey: any;
    magReceptionTheoID: number;
    magReceptionTheoNom: string | null;
    modeTransfertID: number;
    typeOperationID: number;
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
