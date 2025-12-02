import React, { useState, useEffect, useCallback, useMemo, useContext } from 'react';
import { View, ActivityIndicator, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { 
    ArrowCircleUp, ArrowCircleDown, Archive, Stack, Barbell, 
    SlidersHorizontal, CaretDown, CaretUp 
} from 'phosphor-react-native';
import { AuthContext } from '../../contexts/AuthContext';

import MouvementStockFilter, { MouvementStockFilters } from './components/MouvementStockFilter';
import MouvementStockTable from './components/MouvementStockTable';
import MouvementStockDetailModal from './components/MouvementStockDetailModal';
import { MouvementStock } from './type';
import * as mouvementApiService from './routes';
import { Styles, Colors } from '../../styles/style';

const MouvementStockScreen = () => {
  const { user } = useContext(AuthContext); 

  const getTodayDateString = () => new Date().toISOString().split('T')[0];
  
  const [filters, setFilters] = useState<MouvementStockFilters>({
    dateDebut: getTodayDateString(),
    dateFin: getTodayDateString(),
    campagneID: '',
  });

  // État pour gérer la visibilité de l'accordéon de filtres
  const [isFilterVisible, setIsFilterVisible] = useState(false);

  const [mouvements, setMouvements] = useState<MouvementStock[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedItem, setSelectedItem] = useState<MouvementStock | null>(null);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);

  const summary = useMemo(() => {
    const initialSummary = {
        entree: { lots: 0, sacs: 0, poidsNet: 0 },
        sortie: { lots: 0, sacs: 0, poidsNet: 0 },
    };
    return mouvements.reduce((acc, mouvement) => {
        if (mouvement.sens === 1) {
            acc.entree.lots += 1;
            acc.entree.sacs += mouvement.quantite ?? 0;
            acc.entree.poidsNet += mouvement.poidsNetAccepte ?? 0;
        } else if (mouvement.sens === -1) {
            acc.sortie.lots += 1;
            acc.sortie.sacs += mouvement.quantite ?? 0;
            acc.sortie.poidsNet += mouvement.poidsNetAccepte ?? 0;
        }
        return acc;
    }, initialSummary);
  }, [mouvements]);


  const fetchMouvements = useCallback(async () => {
    if (!user?.magasinID) {
      setMouvements([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (filters.dateDebut) queryParams.append('DateDebut', filters.dateDebut);
      if (filters.dateFin) queryParams.append('DateFin', filters.dateFin);
      if (filters.exportateurID) queryParams.append('ExportateurID', filters.exportateurID);
      if (filters.campagneID) queryParams.append('CampagneID', filters.campagneID);
      if (filters.mouvementTypeID) queryParams.append('MouvementTypeID', filters.mouvementTypeID);
      if (filters.sens) queryParams.append('Sens', filters.sens);
      queryParams.append('MagasinID', user.magasinID.toString());
      const data = await mouvementApiService.getMouvements(queryParams);
      setMouvements(data);
    } catch (error) {
      console.error("Échec de la récupération des mouvements de stock:", error);
    } finally {
      setLoading(false);
    }
  }, [filters, user]); 

  useEffect(() => {
    fetchMouvements();
  }, [fetchMouvements]);

  
  const handleApplyFilters = (newFilters: MouvementStockFilters) => {
    setFilters(newFilters);
    setIsFilterVisible(false); // Ferme l'accordéon après application
  };

  const handleResetFilters = () => {
    setFilters({
      dateDebut: getTodayDateString(),
      dateFin: getTodayDateString(),
      campagneID: ''
    });
    setIsFilterVisible(false); // Ferme l'accordéon après réinitialisation
  }

  const handleRowPress = (item: MouvementStock) => {
    setSelectedItem(item);
    setIsModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
    setSelectedItem(null);
  };

  const renderSummaryHeader = () => (
    <View style={localStyles.summaryRow}>
      <View style={localStyles.card}>
          <View style={localStyles.cardTitleContainer}>
              <ArrowCircleDown size={22} color={Colors.success} />
              <Text style={localStyles.cardTitle}>Entrées</Text>
          </View>
          <View style={localStyles.summaryContainer}>
              <View style={localStyles.summaryItem}><Stack size={28} color={Colors.primary} /><Text style={localStyles.summaryValue}>{summary.entree.lots}</Text><Text style={localStyles.summaryLabel}>Mouvement</Text></View>
              <View style={localStyles.summaryItem}><Archive size={28} color={Colors.primary} /><Text style={localStyles.summaryValue}>{summary.entree.sacs}</Text><Text style={localStyles.summaryLabel}>Sacs</Text></View>
              <View style={localStyles.summaryItem}><Barbell size={28} color={Colors.primary} /><Text style={localStyles.summaryValue}>{summary.entree.poidsNet.toFixed(0)} kg</Text><Text style={localStyles.summaryLabel}>Poids Net</Text></View>
          </View>
      </View>
      <View style={localStyles.card}>
          <View style={localStyles.cardTitleContainer}>
              <ArrowCircleUp size={22} color={Colors.danger} />
              <Text style={localStyles.cardTitle}>Sorties</Text>
          </View>
          <View style={localStyles.summaryContainer}>
              <View style={localStyles.summaryItem}><Stack size={28} color={Colors.primary} /><Text style={localStyles.summaryValue}>{summary.sortie.lots}</Text><Text style={localStyles.summaryLabel}>Mouvement</Text></View>
              <View style={localStyles.summaryItem}><Archive size={28} color={Colors.primary} /><Text style={localStyles.summaryValue}>{summary.sortie.sacs}</Text><Text style={localStyles.summaryLabel}>Sacs</Text></View>
              <View style={localStyles.summaryItem}><Barbell size={28} color={Colors.primary} /><Text style={localStyles.summaryValue}>{summary.sortie.poidsNet.toFixed(0)} kg</Text><Text style={localStyles.summaryLabel}>Poids Net</Text></View>
          </View>
      </View>
    </View>
  );

  return (
    <View style={Styles.container}>
      {/* Accordéon de filtres moderne */}
      <View style={localStyles.filterContainer}>
        <TouchableOpacity 
          style={localStyles.filterHeader}
          onPress={() => setIsFilterVisible(prev => !prev)}
          activeOpacity={0.7}
        >
          <View style={localStyles.filterHeaderTitle}>
            <SlidersHorizontal size={20} color={Colors.primary} />
            <Text style={localStyles.filterTitle}>Filtres</Text>
          </View>
          {isFilterVisible ? <CaretUp size={20} color={Colors.darkGray} /> : <CaretDown size={20} color={Colors.darkGray} />}
        </TouchableOpacity>
        
        {isFilterVisible && (
          <MouvementStockFilter 
            filters={filters}
            onReset={handleResetFilters}
            onApply={handleApplyFilters}
          />
        )}
      </View>
      
      {loading ? (
        <ActivityIndicator size="large" color={Colors.primary} style={Styles.loader} />
      ) : (
        <MouvementStockTable 
          data={mouvements} 
          onRowPress={handleRowPress}
          ListHeader={renderSummaryHeader()}
        />
      )}

      <MouvementStockDetailModal
        visible={isModalVisible}
        item={selectedItem}
        onClose={handleCloseModal}
      />
    </View>
  );
};

export default MouvementStockScreen;

const localStyles = StyleSheet.create({
    card: { 
        backgroundColor: '#ffffff', 
        borderRadius: 12, 
        marginBottom: 16, 
        padding: 16, 
        elevation: 3, 
        shadowColor: '#000', 
        shadowOffset: { width: 0, height: 2 }, 
        shadowOpacity: 0.1, 
        shadowRadius: 4, 
    },
    summaryRow: {
        marginHorizontal: 12,
        marginTop: 16,
    },
    cardTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    cardTitle: { 
        fontSize: 16, 
        fontWeight: 'bold', 
        color: Colors.dark, 
        marginLeft: 8 
    },
    summaryContainer: { 
        flexDirection: 'row', 
        justifyContent: 'space-around',
    },
    summaryItem: { 
        alignItems: 'center', 
        flex: 1 
    },
    summaryValue: { 
        fontSize: 18, 
        fontWeight: 'normal', 
        color: Colors.dark, 
        marginTop: 4, 
    },
    summaryLabel: { 
        fontSize: 12, 
        color: Colors.darkGray, 
        marginTop: 2, 
        textAlign: 'center' 
    },
    // Styles pour l'accordéon de filtre
    filterContainer: {
      backgroundColor: '#fff',
      marginHorizontal: 12,
      marginTop: 16,
      borderRadius: 12,
      elevation: 3, 
      shadowColor: '#000', 
      shadowOffset: { width: 0, height: 1 }, 
      shadowOpacity: 0.1, 
      shadowRadius: 3,
      overflow: 'hidden',
    },
    filterHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 16,
      backgroundColor: '#f8f9fa',
    },
    filterHeaderTitle: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    filterTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      color: Colors.primary,
      marginLeft: 10,
    },
});
