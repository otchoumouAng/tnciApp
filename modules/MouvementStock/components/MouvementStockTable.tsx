// MouvementStockTable.tsx

import React from 'react';
import { View, Text, FlatList } from 'react-native';
import { MouvementStock } from '../type';
import MouvementStockCard from './MouvementStockCard';
import { Styles, Colors } from '../../../styles/style';

interface MouvementStockTableProps {
  data: MouvementStock[];
  onRowPress: (item: MouvementStock) => void;
  ListHeader?: React.ComponentType<any> | React.ReactElement | null | undefined;
}

const MouvementStockTable: React.FC<MouvementStockTableProps> = ({ data, onRowPress, ListHeader }) => {
  const renderItem = ({ item }: { item: MouvementStock }) => (
    <MouvementStockCard item={item} onPress={() => onRowPress(item)} />
  );

  return (
    <View style={[Styles.container, { backgroundColor: Colors.lightGray }]}>
      <FlatList
        data={data}
        renderItem={renderItem}
        // ## CORRECTION ## : La clé est maintenant item.id (minuscule)
        keyExtractor={(item) => item.id}
        contentContainerStyle={Styles.list}
        ListEmptyComponent={<Text style={Styles.emptyText}>Aucun mouvement à afficher.</Text>}
        ListHeaderComponent={ListHeader}
      />
    </View>
  );
};

export default MouvementStockTable;