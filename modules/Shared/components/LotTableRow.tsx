// Shared/components/LotTableRow.tsx (Version Complète)

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Lot } from '../type';

interface LotTableRowProps {
  item: Lot;
  index: number; // On ajoute l'index pour la couleur de fond
  onPress: (item: Lot) => void;
}

const LotTableRow: React.FC<LotTableRowProps> = ({ item, index, onPress }) => {
  // Détermine la couleur de fond en fonction de l'index (pair/impair)
  const backgroundColor = index % 2 === 0 ? '#ffffff' : '#f8f9fa';

  return (
    <TouchableOpacity
      style={[styles.row, { backgroundColor }]}
      onPress={() => onPress(item)}
      activeOpacity={0.6} // Ajoute un effet visuel au clic
    >
      <Text style={[styles.cell, styles.lotNumberCell]} numberOfLines={1}>{item.numeroLot}</Text>
      <Text style={[styles.cell, styles.numericCell]}>{item.nombreSacs}</Text>
      <Text style={[styles.cell, styles.numericCell]}>{(item.poidsNet ?? 0).toFixed(0)}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    paddingVertical: 14,
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  cell: {
    fontSize: 14,
    color: '#333',
  },
  lotNumberCell: {
    flex: 2,
    fontWeight: 'bold',
  },
  numericCell: {
    flex: 1,
    textAlign: 'right',
  },
});

export default LotTableRow;