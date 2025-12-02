import React, { useState, useEffect, useContext, useMemo } from 'react';
import { View, FlatList, ActivityIndicator, Text } from 'react-native';
// MODIFICATION: Import de useIsFocused
import { useNavigation, useIsFocused } from '@react-navigation/native'; 
import { Colors, Styles } from '../../styles/style';
import LotCard from '../Shared/components/LotCard'; // Composant partagé
import Filtre, { LotFilters } from '../Shared/components/Filtre'; // Composant partagé
// Import du type StockLot depuis le fichier local du module
import { StockLot } from './type';
import { getStockLots } from './routes';
import { AuthContext } from '../../contexts/AuthContext';

const SortieScreen = () => {
  const { user } = useContext(AuthContext);
  const [lots, setLots] = useState<StockLot[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filters, setFilters] = useState<LotFilters>({});
  const navigation = useNavigation();
  // MODIFICATION: Ajout du hook useIsFocused
  const isFocused = useIsFocused();

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
      if (!filters.magasinID) {
        setLots([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const data = await getStockLots(filters);
        setLots(data);
      } catch (error) {
        console.error("Failed to load lots for sortie:", error);
        // Gérer l'erreur (ex: afficher un message)
      } finally {
        setLoading(false);
      }
    };

    // MODIFICATION:
    // Ne déclenche le fetch que si l'écran est actuellement "focus"
    // Cela permet le rafraîchissement au retour de TransfertScreen
    if (isFocused) {
      fetchLots();
    }
  }, [filters, isFocused]); // MODIFICATION: Ajout de isFocused comme dépendance
  
  /**
   * Navigue vers l'écran de transfert en passant l'objet StockLot complet.
   */
  const handleCardPress = (item: StockLot) => {
    // 'item' est l'objet StockLot complet retourné par /api/stock/lots
    navigation.navigate('Transfert', { item });
  };

  const handleFilterChange = (newFilters: LotFilters) => {
    setFilters({ ...defaultFilters, ...newFilters });
  };

  const handleResetFilters = () => {
    setFilters(defaultFilters);
  }

  if (loading) {
    return <ActivityIndicator size="large" color={Colors.primary} style={Styles.loader} />;
  }

  return (
    <View style={[Styles.container, { backgroundColor: Colors.lightGray }]}>
      {/* <Filtre
        activeFilters={filters}
        onFilterChange={handleFilterChange}
        onReset={handleResetFilters}
      /> 
      */}
      <FlatList
        data={lots}
        renderItem={({ item }) => (
            <LotCard 
                // Mappage de StockLot (API) vers Lot (attendu par LotCard)
                // Le type 'Lot' (utilisé par LotCard) peut être différent
                // de 'StockLot' (utilisé ici).
                item={{
                    id: item.lotID, // GUID
                    numeroLot: item.numeroLot,
                    poidsNet: item.poidsNetAccepte ?? 0,
                    exportateurNom: item.exportateurNom ?? 'N/A',
                    campagneID: item.campagneID,
                    dateLot: new Date().toISOString(), // Fallback
                    statut: 'AP', // Statut par défaut
                    exportateurID: item.exportateurID,
                    typeLotID: item.typeLotID,
                    typeLotDesignation: item.libelleTypeLot,
                    certificationID: item.certificationID,
                    certificationDesignation: item.nomCertification,
                    nombreSacs: item.quantite,
                    poidsBrut: item.poidsBrut,
                    
                    // --- Champs requis par 'Lot' (type du LotCard) ---
                    // Fournir des valeurs par défaut
                    productionID: '', 
                    numeroProduction: '',
                    tareSacs: 0, // Inconnu à ce stade
                    tarePalettes: 0, // Inconnu à ce stade
                    estQueue: false,
                    estManuel: false,
                    estReusine: false,
                    desactive: false,
                    creationUtilisateur: '',
                    creationDate: new Date().toISOString(),
                    rowVersionKey: '', 
                    estQueueText: 'No',
                    estManuelText: 'Yes',
                    estReusineText: 'No',
                    estFictif: false,
                }}
                // OnPress passe l'objet 'item' (StockLot) original et complet
                onPress={() => handleCardPress(item)} 
            />
        )}
        // Utilisation du lotID (GUID) comme clé unique
        keyExtractor={(item) => item.lotID}
        contentContainerStyle={Styles.list}
        ListEmptyComponent={<Text style={Styles.emptyText}>Aucun lot à expédier pour les critères sélectionnés.</Text>}
      />
    </View>
  );
};

export default SortieScreen;