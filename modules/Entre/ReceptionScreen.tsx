import React, { useState, useContext, useEffect } from 'react';
import {
    View, Text, Button, Alert, ScrollView, StyleSheet,
    ActivityIndicator, SafeAreaView, KeyboardAvoidingView, Platform
} from 'react-native';
import Toast from 'react-native-toast-message';
import { AuthContext } from '../../contexts/AuthContext';
import { Styles, Colors } from '../../styles/style';
import { useRoute, useNavigation } from '@react-navigation/native';
import { LotDetailReception, ReceptionData } from './type';
// --- MODIFICATION --- : 'getTransfertById' est supprimé
import { validerReception, getLotDetailForReception } from './routes';
import { getMouvementStockTypes } from '../Shared/route';
import CustomTextInput from '../Shared/components/CustomTextInput';

// (Composants InfoRow et FormLabel inchangés)
const InfoRow = ({ label, value }: { label: string, value: any }) => (
    <View style={localStyles.infoRow}>
        <Text style={localStyles.infoLabel}>{label}</Text>
        <Text style={localStyles.infoValue}>{value ?? 'N/A'}</Text>
    </View>
);

const FormLabel = ({ text }: { text: string }) => (
    <Text style={localStyles.formLabel}>{text}</Text>
);

const ReceptionScreen = () => {
    const route = useRoute();
    const navigation = useNavigation();
    const { user } = useContext(AuthContext);
    
    // 'item' est l'objet de la liste (LotPourReceptionDto)
    const { item } = route.params as { item: any }; 
    
    // ltID (ID du Lot)
    const [lotId] = useState<string>(item.id); 

    // Données chargées depuis /reception-detail
    const [detailData, setDetailData] = useState<LotDetailReception | null>(null);
    
    // tfID (ID du Transfert)
    const [transfertId, setTransfertId] = useState<string | null>(null); 
    
    // --- MODIFICATION ---
    // 'correctRowVersion' est supprimé, nous utiliserons 'detailData.rowVersionKey'

    // États du formulaire
    const [commentaire, setCommentaire] = useState('');
    const [mouvementTypeID, setMouvementTypeID] = useState<string>('');
    const [mouvementTypeNom, setMouvementTypeNom] = useState<string>('Chargement...'); 
    
    const [loading, setLoading] = useState(true); 
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Étape 1: Chargement des données au démarrage
    useEffect(() => {
        const loadAllData = async () => {
            setLoading(true);
            try {
                // 1. Charger les détails ET le bon RowVersion
                // (La SP V4_Lot_GetForReception est maintenant corrigée)
                const details = await getLotDetailForReception(lotId);
                setDetailData(details);
                setTransfertId(details.idTransfert); // Stocke le tfID

                // --- MODIFICATION ---
                // L'appel à 'getTransfertById' est supprimé.

                // 2. Charger les types de mouvement
                const typesMvt = await getMouvementStockTypes();
                const defaultReceptionType = typesMvt.find(m => m.id === 31);
                
                if (defaultReceptionType) {
                    setMouvementTypeID(defaultReceptionType.id.toString());
                    setMouvementTypeNom(defaultReceptionType.designation); 
                } else {
                    Alert.alert("Erreur de config", "Type de mouvement '31' introuvable.");
                    if (typesMvt.length > 0) {
                        setMouvementTypeID(typesMvt[0].id.toString());
                        setMouvementTypeNom(typesMvt[0].designation);
                    }
                }
            } catch (error: any) {
                console.error("Failed to load data:", error);
                Alert.alert("Erreur de chargement", error.message || "Impossible de charger les données.");
                navigation.goBack();
            } finally {
                setLoading(false);
            }
        };
        loadAllData();
    }, [lotId, navigation]);


    // Étape 2: Validation
    const handleValidation = async () => {
        if (!user || !user.magasinID || !user.locationID || !user.name) {
            Alert.alert("Erreur d'utilisateur", "Vos informations utilisateur sont incomplètes.");
            return;
        }
        
        // --- MODIFICATION ---
        // On vérifie 'detailData' et 'detailData.rowVersionKey'
        if (!transfertId || !detailData?.rowVersionKey) { 
            Alert.alert("Erreur", "Données de transfert ou de version manquantes. Les données n'ont peut-être pas chargé.");
            setIsSubmitting(false);
            return;
        }
        
        if (!mouvementTypeID) {
            Alert.alert("Patientez", "Les données ne sont pas encore prêtes.");
            return;
        }

        setIsSubmitting(true);

        const receptionData: ReceptionData = {
            dateReception: new Date().toISOString(),
            destinationID: user.magasinID,
            modificationUser: user.name,
            
            numBordereauRec: detailData.bordereauExpedition ?? '',
            immTracteurRec: detailData.immTracteurExpedition ?? '',
            immRemorqueRec: detailData.immRemorqueExpedition ?? '',
            nombreSac: detailData.nombreSacs ?? 0,
            nombrePalette: detailData.nombrePalette ?? 0,
            poidsBrut: detailData.poidsBrut ?? 0,
            poidsNetRecu: detailData.poidsNet ?? 0,
            tareSacRecu: detailData.tareSacs ?? 0,
            tarePaletteArrive: detailData.tarePalettes ?? 0,
            
            mouvementTypeId: parseInt(mouvementTypeID, 10),
            commentaireRec: commentaire.trim(),
            statut: 'RE',
            
            // --- MODIFICATION ---
            // On utilise le RowVersion de 'detailData'
            rowVersionKey: detailData.rowVersionKey,
        };

        try {
            // On appelle l'API avec 'lotId' 
            await validerReception(lotId, receptionData);
            
            Toast.show({ type: 'success', text1: 'Opération Réussie', text2: `Le lot ${detailData.numeroLot} est entré en stock.` });
            navigation.goBack();
        } catch (receptionError: any) {
            const errorMessage = receptionError.message || 'Erreur inconnue';
            Alert.alert("Échec de la Réception", errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };


    if (loading || !detailData) { // Afficher le loader tant que detailData est null
        return (
            <View style={[localStyles.pageContainer, localStyles.loaderContainer]}>
                <ActivityIndicator size="large" color={Colors.primary} />
                <Text style={Styles.loadingText}>Chargement des détails...</Text>
            </View>
        );
    }

    // Le rendu (inchangé)
    return (
        <SafeAreaView style={localStyles.pageContainer}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView 
                    style={localStyles.scrollContainer} 
                    contentContainerStyle={localStyles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                >
                    <Text style={Styles.modalTitle}>RÉCEPTION DU LOT</Text>
                    <Text style={localStyles.lotNumberHeader}>{detailData.numeroLot}</Text>
                    
                    <View style={localStyles.sectionContainer}>
                        <Text style={localStyles.sectionTitle}>Détails de l'Expédition</Text>
                        <InfoRow label="Magasin Expéditeur" value={detailData.magasinNom} />
                        <InfoRow label="N° Bordereau Exp." value={detailData.bordereauExpedition} />
                        <InfoRow label="Tracteur Exp." value={detailData.immTracteurExpedition} />
                        <InfoRow label="Remorque Exp." value={detailData.immRemorqueExpedition} />
                    </View>

                    <View style={localStyles.sectionContainer}>
                        <Text style={localStyles.sectionTitle}>Données à Confirmer</Text>
                        <InfoRow label="Type de Mouvement" value={mouvementTypeNom} />
                        <InfoRow label="Nombre de sacs" value={detailData.nombreSacs} />
                        <InfoRow label="Nombre de palettes" value={detailData.nombrePalette} />
                        
                        <View style={localStyles.separator} /> 
                        
                        <InfoRow label="Poids Brut" value={`${detailData.poidsBrut} kg`} />
                        <InfoRow label="Tare Sacs" value={`${detailData.tareSacs} kg`} />
                        <InfoRow label="Tare Palettes" value={`${detailData.tarePalettes} kg`} />
                        
                        <View style={localStyles.separator} /> 

                        <InfoRow label="Poids Net Réception" value={detailData.poidsNet} /> 
                    </View>

                    <View style={localStyles.sectionContainer}>
                         <Text style={localStyles.sectionTitle}>Commentaire</Text>
                        <FormLabel text="Ajouter une note (optionnel)" />
                        <CustomTextInput 
                            placeholder="Saisir un commentaire..." 
                            value={commentaire} 
                            onChangeText={setCommentaire} 
                            multiline 
                            editable={true}
                        />
                    </View>

                </ScrollView>
                
                <View style={localStyles.footerContainer}>
                    <View style={localStyles.footerButtonWrapper}>
                        <Button title="Annuler" onPress={() => navigation.goBack()} color={Colors.secondary} disabled={isSubmitting} />
                    </View>
                    <View style={localStyles.footerButtonWrapper}>
                        <Button title="Valider" onPress={handleValidation} color={Colors.primary} disabled={isSubmitting || loading} />
                    </View>
                </View>

            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

// (Les styles localStyles sont inchangés)
const localStyles = StyleSheet.create({
    pageContainer: {
        flex: 1,
        backgroundColor: Colors.background || '#f4f7f8',
    },
    scrollContainer: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 40,
    },
    loaderContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    footerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        padding: 16,
        paddingBottom: Platform.OS === 'ios' ? 24 : 16,
        backgroundColor: '#ffffff',
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
    },
    footerButtonWrapper: {
        flex: 1,
        marginHorizontal: 8,
    },
    sectionContainer: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 24,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.22,
        shadowRadius: 2.22,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.primary,
        marginBottom: 16,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: '#eee',
        paddingBottom: 8,
    },
    lotNumberHeader: {
        textAlign: 'center',
        fontSize: 24,
        fontWeight: 'bold',
        color: Colors.primary,
        marginBottom: 20,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 10, 
        alignItems: 'center',
    },
    infoLabel: {
        fontSize: 16,
        color: Colors.darkGray,
    },
    infoValue: {
        fontSize: 16,
        fontWeight: 'bold', 
        color: Colors.dark,
        textAlign: 'right',
        flexShrink: 1, 
    },
    formLabel: {
        fontSize: 15,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
        marginLeft: 2,
    },
    separator: {
        height: 1,
        backgroundColor: '#f0f0f0',
        marginVertical: 8,
    },
});

export default ReceptionScreen;