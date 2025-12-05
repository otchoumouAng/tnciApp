import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Package } from 'phosphor-react-native';
import { Lot } from '../type'; // Adaptez le chemin si nécessaire
import { Colors } from '../../../styles/style'; // Adaptez le chemin si nécessaire

interface LotGridItemProps {
  item: Lot;
  onPress: (item: Lot) => void;
}

const LotGridItem: React.FC<LotGridItemProps> = ({ item, onPress }) => {
  return (
    <TouchableOpacity style={styles.container} onPress={() => onPress(item)}>
      <View style={styles.iconContainer}>
        <Package size={32} color={Colors.primary} weight="bold" />
      </View>
      <Text style={styles.lotNumber} numberOfLines={1}>{item.numeroLot}</Text>
      <View style={styles.infoRow}>
        <Text style={styles.infoText}>{item.nombreSacs} sacs</Text>
        <Text style={styles.infoText}>{(item.poidsNet ?? 0).toFixed(2)} kg</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    margin: 8,
    padding: 12,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  iconContainer: {
    marginBottom: 10,
  },
  lotNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  infoText: {
    fontSize: 12,
    color: '#666',
  },
});

export default LotGridItem;