/**
 * Represents the data of a palette, matching the C# Palette model from the API.
 * Identical to DeclarationPalette/type.ts as we are dealing with the same entity.
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
  rowVersionKey: string; // byte[] is often serialized as a base64 string
}

/**
 * Modèle pour initier un déplacement (Mise en Transit)
 */
export interface PaletteDeplacementRequest {
    paletteId: string; // Guid
    typeOperationID: number;
    creationUser: string;
    description: string;
}

export interface PaletteDeplacementResponse {
    message: string;
    transfertID: string;
}
