import React from 'react';
import { Modal, View, Text, Button, ScrollView } from 'react-native';
import { MouvementStock } from '../type';
import { Styles, Colors } from '../../../styles/style';

interface MouvementStockDetailModalProps {
  visible: boolean;
  item: MouvementStock | null;
  onClose: () => void;
}

const DetailRow: React.FC<{ label: string; value: any }> = ({ label, value }) => (
    value ? (
        <View style={Styles.modalRow}>
            <Text style={Styles.modalLabel}>{label}:</Text>
            <Text style={Styles.modalValue}>{String(value)}</Text>
        </View>
    ) : null
);

const MouvementStockDetailModal: React.FC<MouvementStockDetailModalProps> = ({ visible, item, onClose }) => {
  if (!item) {
    return null;
  }

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={Styles.modalCenteredView}>
        <View style={Styles.modalView}>
          <Text style={Styles.modalTitle}>Détails du Mouvement</Text>
          <ScrollView style={Styles.modalScrollView}>
            <DetailRow label="Date" value={new Date(item.dateMouvement).toLocaleString()} />
            <DetailRow label="Magasin" value={item.MagasinNom} />
            <DetailRow label="Campagne" value={item.campagneID} />
            <DetailRow label="Type Mouvement" value={item.mouvementTypeDesignation} />
            <DetailRow label="Exportateur" value={item.exportateurNom} />
            <DetailRow label="Numéro Lot" value={item.reference2} />
            <DetailRow label="Référence 1" value={item.reference1} />
            <DetailRow label="Référence 3 (Immat.)" value={item.reference3} />
            <DetailRow label="Sens" value={item.sens === 1 ? 'Entrée' : 'Sortie'} />
            <DetailRow label="Quantité" value={item.quantite} />
            <DetailRow label="Poids Brut" value={item.poidsBrut} />
            <DetailRow label="Tare Sacs" value={item.tareSacs} />
            <DetailRow label="Tare Palettes" value={item.tarePalettes} />
            <DetailRow label="Poids Net Livré" value={item.poidsNetLivre} />
            <DetailRow label="Poids Net Accepté" value={item.poidsNetAccepte} />
            <DetailRow label="Statut" value={item.statut} />
            <DetailRow label="Certification" value={item.certificationDesignation} />
            <DetailRow label="Emplacement" value={item.emplacementDesignation} />
            <DetailRow label="Site" value={item.siteNom} />
            <DetailRow label="Commentaire" value={item.commentaire} />
            <DetailRow label="Créé par" value={`${item.creationUtilisateur} le ${new Date(item.creationDate).toLocaleDateString()}`} />
          </ScrollView>
          <Button title="Fermer" onPress={onClose} color={Colors.primary} />
        </View>
      </View>
    </Modal>
  );
};

export default MouvementStockDetailModal;
