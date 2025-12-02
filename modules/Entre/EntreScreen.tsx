import React, { useState, useContext } from 'react';
import { View, FlatList, ActivityIndicator, Text, Alert } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Colors, Styles } from '../../styles/style';
import LotCard from '../Shared/components/LotCard';
import { AuthContext } from '../../contexts/AuthContext';
import { getLotsARecevoir } from './routes';
// Le type TransfertLot est défini dans un fichier partagé
import { TransfertLot } from '../Shared/type'; 

const EntreeScreen = () => {
    const { user } = useContext(AuthContext);
    // 'lots' est de type 'any[]' ici car l'objet retourné par l'API (LotPourReceptionDto)
    // ne correspond pas au type 'TransfertLot' (le modèle complet)
    const [lots, setLots] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const navigation = useNavigation();

    useFocusEffect(
        React.useCallback(() => {
            const fetchLots = async () => {
                if (!user?.magasinID) {
                    Alert.alert("Erreur", "Magasin de l'utilisateur non défini.");
                    setLoading(false);
                    return;
                }
                setLoading(true);
                try {
                    // Appelle l'API /api/transfertlot/entransit
                    // La réponse est un 'LotPourReceptionDto[]' (pas un 'TransfertLot[]')
                    const data = await getLotsARecevoir(user.magasinID);
                    
                    // --- 1. Filtrer les lots sans numeroLot ---
                    const filteredData = data.filter(lot => lot.numeroLot && lot.numeroLot.trim() !== '');
                    
                    // --- 2. MODIFICATION : Dédupliquer les lots par ID ---
                    // Résout l'erreur "Encountered two children with the same key"
                    // Crée un Map pour ne garder que la première occurrence de chaque ID
                    const uniqueLotsMap = new Map();
                    filteredData.forEach(lot => {
                        if (!uniqueLotsMap.has(lot.id)) {
                            uniqueLotsMap.set(lot.id, lot);
                        }
                    });
                    
                    // Convertit le Map en Array
                    const uniqueData = Array.from(uniqueLotsMap.values());
                    // --- FIN DE LA MODIFICATION ---

                    setLots(uniqueData); // Utilise les données dédupliquées
                    
                } catch (error: any) {
                    Alert.alert("Erreur", error.message || "Impossible de charger les lots à recevoir.");
                } finally {
                    setLoading(false);
                }
            };
            fetchLots();
        }, [user])
    );

    const handleCardPress = (item: any) => {
        // Navigue vers l'écran de formulaire en passant l'objet 'item' (LotPourReceptionDto)
        // 'ReceptionScreen' n'utilisera que 'item.id' (le ltID)
        navigation.navigate('ReceptionScreen', { item });
    };

    if (loading) {
        return <ActivityIndicator size="large" color={Colors.primary} style={Styles.loader} />;
    }

    return (
        <View style={[Styles.container, { backgroundColor: Colors.lightGray }]}>
            <FlatList
                data={lots}
                renderItem={({ item }) => (
                    // --- Mappage Corrigé ---
                    // Nous mappons les champs de 'LotPourReceptionDto' (l'API)
                    // vers ce que 'LotCard' attend (le type 'Lot')
                    <LotCard 
                        item={{
                            id: item.id, // ID du Lot (ltID)
                            numeroLot: item.numeroLot,
                            
                            // --- CORRECTION DU BUG ---
                            // L'API renvoie 'poidsNet', pas 'poidsNetExpedition'
                            poidsNet: item.poidsNet ?? 0, 
                            nombreSacs: item.nombreSacs ?? 0,
                            poidsBrut: item.poidsBrut ?? 0,
                            tareSacs: item.tareSacs ?? 0,
                            tarePalettes: item.tarePalettes ?? 0,
                            
                            // L'API 'entransit' ne renvoie pas l'exportateur
                            // On met 'N/A' pour correspondre au screenshot
                            exportateurNom: 'N/A', 
                            exportateurID: 0,
                            
                            statut: item.statut, // Statut du transfert (ex: 'AP')
                            campagneID: item.campagneID,
                            dateLot: item.dateExpedition, // La date pertinente est la date d'expédition
                            
                            // --- Champs requis par 'Lot' (type du LotCard) ---
                            // Fournir des valeurs par défaut
                            typeLotID: 0,
                            typeLotDesignation: "Transfert",
                            certificationID: 0,
                            certificationDesignation: "N/A", // Ceci s'affiche en 'N/A'
                            productionID: '', 
                            numeroProduction: '',
                            estQueue: false,
                            estManuel: false,
                            estReusine: false,
                            desactive: false,
                            creationUtilisateur: '', // Non fourni par l'API 'entransit'
                            creationDate: item.dateExpedition, // Utilise dateExpedition comme fallback
                            rowVersionKey: null, // Non fourni par l'API 'entransit'
                            estQueueText: 'No',
                            estManuelText: 'Yes',
                            estReusineText: 'No',
                            estFictif: false,
                        }}
                        onPress={() => handleCardPress(item)}
                        // --- Appliquer le style "entrée" (vert) ---
                        movementType="entree"
                    />
                )}
                keyExtractor={(item) => item.id} // L'ID du lot (ltID) est unique
                contentContainerStyle={Styles.list}
                ListEmptyComponent={<Text style={Styles.emptyText}>Aucun lot en attente de réception.</Text>}
            />
        </View>
    );
};

export default EntreeScreen;