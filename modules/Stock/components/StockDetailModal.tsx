import React from 'react';
import { Modal, View, Text, StyleSheet, Button, ScrollView } from 'react-native';
import { StockLot } from '../type'; 
import { Styles, Colors, Typography } from '../../../styles/style'; 

interface StockDetailModalProps {
  visible: boolean;
  item: StockLot | null;
  onClose: () => void;
}

const DetailRow = ({ label, value }: { label: string; value: string | number | undefined | null }) => (
    <View style={localStyles.row}>
        <Text style={localStyles.label}>{label}</Text>
        <Text style={localStyles.value}>{value || 'N/A'}</Text>
    </View>
);

const StockDetailModal: React.FC<StockDetailModalProps> = ({ visible, item, onClose }) => {
  if (!item) {
    return null;
  }

  return (
    <Modal animationType="slide" transparent={true} visible={visible} onRequestClose={onClose}>
      <View style={localStyles.centeredView}>
        <View style={localStyles.modalView}>
          <Text style={Styles.modalTitle}>Détail du Lot en Stock</Text>
          <Text style={Styles.lotInfoBold}>{item.reference}</Text>
          
          <ScrollView>
            <DetailRow label="Magasin" value={item.magasinNom} />
            <DetailRow label="Exportateur" value={item.exportateurNom} />
            <DetailRow label="Produit" value={item.libelleProduit} />
            <DetailRow label="Type de Lot" value={item.libelleTypeLot} />
            <DetailRow label="Certification" value={item.nomCertification} />
            <DetailRow label="Grade" value={item.libelleGradeLot} />
            <DetailRow label="Nombre de Sacs" value={item.quantite} />
            <DetailRow label="Poids Brut" value={`${item.poidsBrut.toFixed(2)} kg`} />
            <DetailRow label="Poids Net" value={`${item.poidsNetAccepte.toFixed(2)} kg`} />
          </ScrollView>

          <View style={{marginTop: 20}}>
             <Button title="Fermer" onPress={onClose} color={Colors.primary} />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const localStyles = StyleSheet.create({
  centeredView: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalView: { margin: 20, backgroundColor: 'white', borderRadius: 20, padding: 35, alignItems: 'stretch', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 5, width: '90%', maxHeight: '80%' },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: Colors.lightGray },
  label: { ...Typography.body, color: Colors.darkGray, fontWeight: 'bold' },
  value: { ...Typography.body, color: Colors.dark },
});

export default StockDetailModal;