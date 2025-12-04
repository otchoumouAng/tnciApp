/**
 * Represents the data of a palette.
 */
export interface Palette {
  id: string; // Guid
  ordreDeProductionID: string; // Guid
  numeroProduction: string;
  annee: number;
  semaine: number;
  numero: string;

  produitID?: number | null;
  produitDesignation: string;
  typeProduitID?: number | null;
  typeProduitDesignation: string;

  nbreUnite: number;
  codeConditionnement: number;
  condDesignation: string;
  condRefDesignation: string;

  nomArticle: string;
  codeArticle: string;
  codeReferenceConditionnement?: number | null;
  nbreUniteParPalette: number;
  uniteDePoidsID: number;

  poidsBrutUnitaire: number;
  tareUnitaireEmballage: number;
  poidsBrutPalette: number;
  tareEmballagePalette: number;
  poidsNetPalette: number;

  bestBeforeDate?: string | null; // DateTime
  nbreEtiquetteA4Demande: number;
  nbreEtiquetteA4Imprime: number;
  nbreEtiquetteA5Demande: number;
  nbreEtiquetteA5Imprime: number;
  dateFabrication?: string | null; // DateTime

  statut: string;
  qaStatut: string;
  codeSSCC: string;
  dateDeclaration?: string | null; // DateTime

  stockMagasinID?: number | null;
  stockEmplacement: string;

  creationUtilisateur: string;
  modificationDate?: string | null; // DateTime
  modificationUtilisateur: string;
  desactive: boolean;
  rowVersionKey: string; // byte[]
}

/**
 * Represents an Emplacement (Location).
 */
export interface Emplacement {
    id: number;
    magasinId?: number | null;
    magasinDesignation?: string | null;
    designation: string;
    desactive: boolean;
    creationDate: string; // DateTime
    creationUtilisateur: string;
    modificationUtilisateur?: string | null;
    modificationDate?: string | null; // DateTime
    rowVersionKey: string; // byte[]
}

/**
 * Request model for receiving a palette.
 */
export interface PaletteReceptionRequest {
    paletteId: string; // Guid
    magasinDestinationId: number;
    emplacementDestinationID: number;
    creationUser: string;
}
