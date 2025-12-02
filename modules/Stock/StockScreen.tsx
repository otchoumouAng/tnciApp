import React, { useState, useEffect, useMemo, useContext } from 'react';
import { View, FlatList, ActivityIndicator, Text, StyleSheet, RefreshControl } from 'react-native';
import { Stack, Archive, Barbell, Info } from 'phosphor-react-native';
import { Colors, Styles } from '../../styles/style';
import { StockLot } from './type';
import LotTableRow from '../Shared/components/LotTableRow';
import StockFiltre, { StockFilters } from './components/Filtre';
import StockDetailModal from './components/StockDetailModal';
import { getStockLots } from './routes';
import { AuthContext } from '../../contexts/AuthContext';

const TableHeader = () => (
    <View style={localStyles.headerRow}>
        <Text style={[localStyles.headerCell, localStyles.lotNumberCell]}>Numéro Lot</Text>
        <Text style={[localStyles.headerCell, localStyles.numericCell]}>Sacs</Text>
        <Text style={[localStyles.headerCell, localStyles.numericCell]}>Poids Net</Text>
    </View>
);

const EmptyState = () => (
    <View style={localStyles.emptyContainer}>
        <Info size={48} color={Colors.secondary} />
        <Text style={localStyles.emptyText}>Aucun lot en stock pour les critères sélectionnés.</Text>
    </View>
);

const StockScreen = () => {
  const { user } = useContext(AuthContext);
  const [stockLots, setStockLots] = useState<StockLot[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [filters, setFilters] = useState<StockFilters>({});
  const [selectedLot, setSelectedLot] = useState<StockLot | null>(null);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);

  const defaultFilters = useMemo(() => {
    if (user?.magasinID) {
      return { magasinID: user.magasinID.toString() };
    }
    return {};
  }, [user]);

  useEffect(() => {
    setFilters(defaultFilters);
  }, [defaultFilters]);


  useEffect(() => {
  const fetchLots = async () => {
    // Vérification plus robuste
    if (!filters.magasinID) {
      setStockLots([]);
      setLoading(false);
      return;
    }
    
    setLoading(true);
    try {
      const data = await getStockLots(filters);
      setStockLots(data);
    } catch (error) {
      console.error("Failed to fetch lots in stock:", error);
    } finally {
      setLoading(false);
    }
  };
  
  fetchLots();
}, [filters]); 

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      const data = await getStockLots(filters);
      setStockLots(data);
    } catch (error) {
      console.error("Failed to refresh lots:", error);
    }
    setRefreshing(false);
  };

  const summary = useMemo(() => {
    // Pour le résumé, nous devons d'abord dédoublonner les lots
    const uniqueLots = Array.from(new Map(stockLots.map(lot => [lot.numeroLot, lot])).values());
    return uniqueLots.reduce((acc, lot) => {
        acc.totalSacs += lot.quantite ?? 0;
        acc.totalPoidsNet += lot.poidsNetAccepte ?? 0;
        return acc;
    }, { lotCount: uniqueLots.length, totalSacs: 0, totalPoidsNet: 0 });
  }, [stockLots]);

  const handleFilterChange = (newFilters: StockFilters) => {
      setFilters(newFilters);
  };
  
  const handleResetFilters = () => {
      setFilters(defaultFilters);
  };
  
  const handleRowPress = (item: StockLot) => { setSelectedLot(item); setIsModalVisible(true); };
  const handleCloseModal = () => { setIsModalVisible(false); setSelectedLot(null); };
  
  return (
    <View style={Styles.container}>
      <StockFiltre 
        initialFilters={filters}
        onFilterChange={handleFilterChange} 
        onReset={handleResetFilters} 
        lockedMagasinID={user?.magasinID?.toString()}
        lockedMagasinNom={user?.magasinNom}
      />

      <View style={localStyles.card}>
        <Text style={localStyles.cardTitle}>Résumé du Stock</Text>
        <View style={localStyles.summaryContainer}>
            <View style={localStyles.summaryItem}><Stack size={28} color={Colors.primary} /><Text style={localStyles.summaryValue}>{summary.lotCount}</Text><Text style={localStyles.summaryLabel}>Lots</Text></View>
            <View style={localStyles.summaryItem}><Archive size={28} color={Colors.primary} /><Text style={localStyles.summaryValue}>{summary.totalSacs}</Text><Text style={localStyles.summaryLabel}>Sacs</Text></View>
            <View style={localStyles.summaryItem}><Barbell size={28} color={Colors.primary} /><Text style={localStyles.summaryValue}>{summary.totalPoidsNet.toFixed(0)} kg</Text><Text style={localStyles.summaryLabel}>Poids Net</Text></View>
        </View>
      </View>
      <View style={[localStyles.card, { flex: 1, padding: 0, overflow: 'hidden' }]}>
        {loading ? <ActivityIndicator size="large" color={Colors.primary} /> : (
            <FlatList
                data={stockLots}
                renderItem={({ item, index }) => (
                    <LotTableRow 
                        item={{
                            numeroLot: item.numeroLot, 
                            nombreSacs: item.quantite ?? 0, 
                            poidsNet: item.poidsNetAccepte ?? 0
                        }} 
                        index={index} 
                        onPress={() => handleRowPress(item)} 
                    />
                )}
                // ## CORRECTION APPLIQUÉE ICI ##
                // On crée une clé unique en combinant la référence avec les autres IDs.
                keyExtractor={(item, index) => 
                    `${item.numeroLot}-${item.produitID}-${item.certificationID}-${item.gradeLotID}-${item.typeLotID}-${index}`
                }
                ListHeaderComponent={<TableHeader />}
                stickyHeaderIndices={[0]}
                ListEmptyComponent={<EmptyState />}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />}
            />
        )}
      </View>
      <StockDetailModal visible={isModalVisible} item={selectedLot} onClose={handleCloseModal} />
    </View>
  );
};

const localStyles = StyleSheet.create({
    card: { backgroundColor: '#ffffff', borderRadius: 12, marginHorizontal: 12, marginBottom: 16, padding: 16, elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, },
    cardTitle: { fontSize: 16, fontWeight: 'bold', color: Colors.dark, marginBottom: 12, },
    summaryContainer: { flexDirection: 'row', justifyContent: 'space-around', },
    summaryItem: { alignItems: 'center', paddingHorizontal: 10, },
    summaryValue: { fontSize: 18, fontWeight: 'bold', color: Colors.dark, marginTop: 4, },
    summaryLabel: { fontSize: 12, color: Colors.darkGray, marginTop: 2, },
    headerRow: { flexDirection: 'row', backgroundColor: '#f8f9fa', paddingVertical: 12, paddingHorizontal: 10, borderBottomWidth: 1, borderBottomColor: '#e9ecef', },
    headerCell: { fontSize: 14, fontWeight: 'bold', color: '#343a40', },
    lotNumberCell: { flex: 2, },
    numericCell: { flex: 1, textAlign: 'right', },
    emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    emptyText: { marginTop: 10, fontSize: 16, color: Colors.darkGray, textAlign: 'center' },
});

export default StockScreen;