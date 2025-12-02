import React from 'react';
import { Modal, View, Text, Button, ScrollView, Alert } from 'react-native';
import { Lot } from '../type';
import { Styles, Colors } from '../../../styles/style';

interface EntreDetailModalProps {
  visible: boolean;
  item: Lot | null;
  onClose: () => void;
  onEntre: (item: Lot) => void;
}

const DetailRow: React.FC<{ label: string; value?: any }> = ({ label, value }) => (
    value || value === 0 || value === false ? (
        <View style={Styles.modalRow}>
            <Text style={Styles.modalLabel}>{label}:</Text>
            <Text style={Styles.modalValue}>{String(value)}</Text>
        </View>
    ) : null
);

const EntreDetailModal: React.FC<EntreDetailModalProps> = ({ visible, item, onClose, onEntre }) => {
  if (!item) {
    return null;
  }

  const handleEntre = () => {
    // Simulate the reception action
    Alert.alert(
        "Confirmation",
        `Voulez-vous vraiment entrer le lot ${item.numeroLot} ?`,
        [
            { text: "Annuler", style: "cancel" },
            { text: "Confirmer", onPress: () => onEntre(item) }
        ]
    );
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={Styles.modalCenteredView}>
        <View style={Styles.modalView}>
          <Text style={Styles.modalTitle}>Détails du Lot</Text>
          <ScrollView style={Styles.modalScrollView}>
            <DetailRow label="Numéro Lot" value={item.numeroLot} />
            <DetailRow label="Campagne" value={item.campagneID} />
            <DetailRow label="Exportateur" value={item.exportateurNom} />
            <DetailRow label="Poids Net" value={`${item.poidsNet.toFixed(2)} kg`} />
            <DetailRow label="Nombre de Sacs" value={item.nombreSacs} />
            <DetailRow label="Certification" value={item.certificationDesignation} />
            <DetailRow label="Date du Lot" value={new Date(item.dateLot).toLocaleString()} />
            <DetailRow label="Statut" value={item.statut} />
            <DetailRow label="Manuel" value={item.estManuelText} />
            <DetailRow label="Queue" value={item.estQueueText} />
          </ScrollView>
          <View style={Styles.modalButtonContainer}>
            <Button title="Fermer" onPress={onClose} color={Colors.secondary} />
            <Button title="ENTRER" onPress={handleEntre} color={Colors.success} />
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default EntreDetailModal;
