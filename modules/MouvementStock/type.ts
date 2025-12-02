// MouvementStock/type.ts

export interface MouvementStock {
  // ## CORRECTION : Passage de toutes les propriétés en camelCase ##
  id: string;
  magasinId: number;
  campagneID: string;
  exportateurId?: number;
  certificationId?: number;
  dateMouvement: string; 
  sens: number;
  mouvementTypeId: number;
  objectEnStockID?: string;
  objectEnStockType?: number;
  quantite: number;
  statut: string;
  reference1?: string;
  reference2?: string;
  poidsBrut: number;       
  tareSacs: number;        
  tarePalettes: number;    
  poidsNetLivre: number;   
  retentionPoids: number;  
  poidsNetAccepte: number; 
  
  nombrePalette?: number; 
  
  creationUtilisateur: string; 
  emplacementID?: number;
  sacTypeId?: number;      
  commentaire?: string;
  siteID: number;
  produitID?: number;
  lotID?: string;
  
  rowVersionKey: any; 

  magasinNom?: string;
  exportateurNom?: string;
  mouvementTypeDesignation?: string;
  certificationDesignation?: string;
  sacTypeDesignation?: string;
  emplacementDesignation?: string;
  siteNom?: string;
  reference3?: string;
  desactive?: boolean;
  approbationUtilisateur?: string;
  approbationDate?: string;
  creationDate?: string;
  modificationUtilisateur?: string;
  modificationDate?: string;
}