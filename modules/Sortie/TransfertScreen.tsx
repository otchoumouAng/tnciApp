import React, { useState, useEffect, useContext } from 'react';
import {
  View, Text, Button, Alert, ScrollView, StyleSheet,
  ActivityIndicator, SafeAreaView, KeyboardAvoidingView, Platform
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import SegmentedControl from '@react-native-segmented-control/segmented-control';
import Toast from 'react-native-toast-message';
import { Magasin, DropdownItem, StockLot, TransfertDto, LotDetailFull } from './type';
import { getMagasins, getParametres, getOperationType } from '../Shared/route';
import { createTransfert, getLotById } from './routes';
import { AuthContext } from '../../contexts/AuthContext';
import { Styles, Colors } from '../../styles/style';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import CustomTextInput from '../Shared/components/CustomTextInput';

/* ----------  TYPES  ---------- */
type TransfertScreenRouteParams = { item: StockLot };

/* ----------  UTILITAIRES  ---------- */
const InfoRow = ({ label, value }: { label: string; value: any }) => (
  <View style={localStyles.infoRow}>
    <Text style={localStyles.infoLabel}>{label}</Text>
    <Text style={localStyles.infoValue}>{value ?? 'N/A'}</Text>
  </View>
);

const FormLabel = ({ text }: { text: string }) => (
  <Text style={localStyles.formLabel}>{text}</Text>
);

/* ----------  COMPOSANT PRINCIPAL  ---------- */
const TransfertScreen = () => {
  const route = useRoute<RouteProp<{ params: TransfertScreenRouteParams }>>();
  const navigation = useNavigation();
  const { user } = useContext(AuthContext);

  // On récupère juste l'ID du lot depuis la navigation. 
  // Les autres données de 'navItem' ne sont PAS utilisées.
  const { item: navItem } = route.params;

  // TOUTES les infos affichées et utilisées pour le calcul viendront de 'lotDetail'
  const [lotDetail, setLotDetail] = useState<LotDetailFull | null>(null);

  /* --- États formulaire --- */
  const [operationTypeId, setOperationTypeId] = useState<string>('');
  const [transfertMode, setTransfertMode] = useState<'total' | 'partiel' | ''>('total');
  const [destinationMagasinId, setDestinationMagasinId] = useState<string>('');
  const [tracteur, setTracteur] = useState('');
  const [remorque, setRemorque] = useState('');
  const [numBordereau, setNumBordereau] = useState('');
  const [commentaire, setCommentaire] = useState('');

  /* --- Données référentielles --- */
  const [magasins, setMagasins] = useState<Magasin[]>([]);
  const [operationTypes, setOperationTypes] = useState<DropdownItem[]>([]);
  const [mouvementTypeID, setMouvementTypeID] = useState<string>('');
  const [campagneActuelle, setCampagneActuelle] = useState<string>('');

  /* --- États UI --- */
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  /* --- Champs calculés (valeurs à transférer) --- */
  const [nombreSacs, setNombreSacs] = useState<number | undefined>(undefined);
  const [nombrePalettes, setNombrePalettes] = useState<string>('0');
  const [poidsBrut, setPoidsBrut] = useState<string>('0');
  const [tareSacs, setTareSacs] = useState<string>('0');
  const [tarePalettes, setTarePalettes] = useState<string>('0');
  const [poidsNet, setPoidsNet] = useState<string>('0');

  const [sacsInputError, setSacsInputError] = useState<boolean>(false);

  /* =========================================================
   * 1. Chargement initial
   * ======================================================= */
  useEffect(() => {
    const load = async () => {
      try {
        // Chargement parallèle des référentiels ET du détail du lot
        // On cast le résultat de getLotById pour correspondre à LotDetailFull si nécessaire
        const [mags, params, opTypes, lotData] = await Promise.all([
          getMagasins(),
          getParametres(),
          getOperationType(),
          getLotById(navItem.lotID, navItem.magasinID) as Promise<LotDetailFull>,
        ]);

        setMagasins(mags.filter((m: Magasin) => m.id !== user?.magasinID));
        setCampagneActuelle(params.campagne);
        setOperationTypes(opTypes);
        setLotDetail(lotData);

        // Initialisation EXCLUSIVEMENT avec les données de lotData (/api/lot/{id})
        setNombreSacs(lotData.nombreSacs);
        setNombrePalettes(lotData.nombrePalette.toString());
        setPoidsBrut(Math.round(lotData.poidsBrut).toString());
        setPoidsNet(Math.round(lotData.poidsNet).toString());
        setTareSacs(Math.round(lotData.tareSacs).toString());
        setTarePalettes(Math.round(lotData.tarePalettes).toString());

      } catch (err: any) {
        Alert.alert('Erreur de chargement', err.message || 'Impossible de charger les données.');
        navigation.goBack();
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [user, navigation, navItem.lotID, navItem.magasinID]);

  /* =========================================================
   * 2. CALCULS DE QUANTITÉ AU PRORATA
   * ======================================================= */
  useEffect(() => {
    // On n'utilise QUE lotDetail pour les calculs
    if (!lotDetail) return;

    let q_transfert: number;

    // Étape 1: Déterminer le nombre de sacs cible
    if (transfertMode === 'total') {
      q_transfert = lotDetail.nombreSacs;
      if (nombreSacs !== q_transfert) {
        setNombreSacs(q_transfert);
        setSacsInputError(false);
        return; // On laisse le prochain cycle faire les mises à jour d'état
      }
    } else {
      q_transfert = nombreSacs ?? 0;
    }

    // Étape 2: Calculer le ratio basé sur le stock TOTAL du lot (selon /api/lot/{id})
    const stockTotalLot = lotDetail.nombreSacs || 1;
    // Protection contre la division par zéro si le lot est vide
    if (stockTotalLot === 0 && q_transfert === 0) {
      setPoidsBrut('0'); setTareSacs('0'); setTarePalettes('0'); setPoidsNet('0'); setNombrePalettes('0');
      return;
    }

    const ratio = q_transfert / stockTotalLot;
    // On s'assure que le ratio reste logique (entre 0 et 100%) pour les calculs automatiques
    // Si l'utilisateur saisit plus que le max, les calculs plafonnent au max du lot.
    const safeRatio = Math.min(Math.max(ratio, 0), 1);

    // Étape 3: Application du ratio sur les valeurs MASTER du lot
    setPoidsBrut(Math.round(safeRatio * lotDetail.poidsBrut).toString());
    setPoidsNet(Math.round(safeRatio * lotDetail.poidsNet).toString());
    setTareSacs(Math.round(safeRatio * lotDetail.tareSacs).toString());
    setTarePalettes(Math.round(safeRatio * lotDetail.tarePalettes).toString());

    // Calcul direct sur le nombre de palettes master (plus de constante SACS_PAR_PALETTE)
    setNombrePalettes(Math.round(safeRatio * lotDetail.nombrePalette).toString());

  }, [transfertMode, nombreSacs, lotDetail]);

  /* =========================================================
   * 3. Gestion destination (inchangé)
   * ======================================================= */
  useEffect(() => {
    if (operationTypeId === '1') { setDestinationMagasinId(''); setMouvementTypeID('30'); }
    else if (operationTypeId === '2') { setDestinationMagasinId(''); setMouvementTypeID('32'); }
    else if (operationTypeId === '3') { setDestinationMagasinId('-2'); setMouvementTypeID('33'); }
  }, [operationTypeId]);

  /* =========================================================
   * 4. Soumission
   * ======================================================= */
  const handleTransfert = async () => {
    if (!lotDetail) return;

    /* ----- validations ----- */
    if (!operationTypeId || !transfertMode || !numBordereau.trim() || !mouvementTypeID) {
      Alert.alert('Validation', 'Veuillez remplir tous les champs obligatoires (*).'); return;
    }
    if (!campagneActuelle) {
      Alert.alert('Erreur', 'Les données de la campagne ne sont pas chargées.'); return;
    }
    if ((operationTypeId === '1' || operationTypeId === '2') && !destinationMagasinId) {
      Alert.alert('Validation', 'Veuillez sélectionner un magasin de destination.'); return;
    }

    const sacsATransferer = Number(nombreSacs);
    // Validation UNIQUEMENT par rapport à lotDetail.nombreSacs
    if (!sacsATransferer || sacsATransferer <= 0 || sacsATransferer > lotDetail.nombreSacs) {
      Alert.alert('Validation', `Le nombre de sacs doit être > 0 et ≤ ${lotDetail.nombreSacs}.`);
      return;
    }
    if (!user?.magasinID || !user?.locationID || !user?.name) {
      Alert.alert('Erreur', 'Utilisateur non authentifié ou informations manquantes.'); return;
    }

    /* ----- préparation DTO ----- */
    setIsSubmitting(true);

    // Détermination du statut en fonction du type d'opération
    // Si operationTypeId est 2 ou 3, le statut est 'RE', sinon 'NA'
    const statutCalcule = (operationTypeId === '2' || operationTypeId === '3') ? 'RE' : 'NA';

    const dto: TransfertDto = {
      campagneID: lotDetail.campagneID,
      lotID: lotDetail.id,
      produitID: lotDetail.produitID,
      certificationID: lotDetail.certificationID,
      numeroLot: lotDetail.numeroLot,
      exportateurID: lotDetail.exportateurID,
      siteID: user.locationID,
      magasinExpeditionID: user.magasinID,
      creationUtilisateur: user.name,
      numBordereauExpedition: numBordereau.trim(),
      nombreSacsExpedition: sacsATransferer,
      immTracteurExpedition: tracteur.trim(),
      immRemorqueExpedition: remorque.trim(),
      dateExpedition: new Date().toISOString(),
      commentaireExpedition: commentaire.trim(),
      magReceptionTheoID: parseInt(destinationMagasinId, 10) || 0,
      modeTransfertID: transfertMode === 'total' ? 1 : 2,
      typeOperationID: parseInt(operationTypeId, 10),
      mouvementTypeID: parseInt(mouvementTypeID, 10),
      statut: statutCalcule, // Utilisation du statut calculé
      sacTypeID: lotDetail.typeSacID, // Vient du détail complet du lot
      nombrePaletteExpedition: parseInt(nombrePalettes, 10) || 0,
      poidsBrutExpedition: parseFloat(poidsBrut) || 0,
      poidsNetExpedition: parseFloat(poidsNet) || 0,
      tareSacsExpedition: parseFloat(tareSacs) || 0,
      tarePaletteExpedition: parseFloat(tarePalettes) || 0,
    };

    try {
      //console.log(dto)
      await createTransfert(dto);
      Toast.show({ type: 'success', text1: 'Opération réussie', text2: `Sortie du lot ${lotDetail.numeroLot} validée.` });
      navigation.goBack();
    } catch (err: any) {
      Alert.alert("Échec de l'opération", err.message || 'Erreur inattendue.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSacsChange = (txt: string) => {
    if (transfertMode === 'total' || !lotDetail) return;
    if (txt === '') { setNombreSacs(undefined); setSacsInputError(false); return; }

    let q = parseInt(txt.replace(/[^0-9]/g, ''), 10);
    // Validation par rapport à lotDetail.nombreSacs (et non plus item.quantite)
    if (isNaN(q)) { setNombreSacs(undefined); setSacsInputError(false); }
    else if (q > lotDetail.nombreSacs) { setSacsInputError(true); }
    else { setSacsInputError(false); }
    setNombreSacs(q);
  };

  /* =========================================================
   * 6. Rendu
   * ======================================================= */
  if (isLoading || !lotDetail) {
    return (
      <View style={[localStyles.pageContainer, localStyles.loaderContainer]}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={Styles.loadingText}>Chargement des détails...</Text>
      </View>
    );
  }

  const isEditable = transfertMode === 'partiel';
  const modeIndex = transfertMode === 'total' ? 0 : transfertMode === 'partiel' ? 1 : -1;

  return (
    <SafeAreaView style={localStyles.pageContainer}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView style={localStyles.scrollContainer} contentContainerStyle={localStyles.scrollContent} keyboardShouldPersistTaps="handled">
          <Text style={Styles.modalTitle}>SORTIE DU LOT</Text>
          <Text style={localStyles.lotNumberHeader}>{lotDetail.numeroLot}</Text>
          <Text style={localStyles.campagneHeader}>Campagne : {lotDetail.campagneID}</Text>

          {/* CARTE 1 : Infos Lot (UNIQUEMENT lotDetail) */}
          <View style={localStyles.sectionContainer}>
            <Text style={localStyles.sectionTitle}>Détails du Stock</Text>
            <InfoRow label="Produit" value={lotDetail.produitNom} />
            <InfoRow label="Grade" value={lotDetail.libelleGradeLot} />
            <InfoRow label="Certification" value={lotDetail.certificationDesignation} />
            {/* Affichage du magasin MASTER du lot, pas nécessairement le magasin courant */}
            <InfoRow label="Magasin" value={lotDetail.magasinDesignation} />
            <InfoRow label="Nombre de sacs" value={lotDetail.nombreSacs} />
            <InfoRow label="Palettes Totales" value={lotDetail.nombrePalette} />
            <InfoRow label="Poids Net Total" value={`${lotDetail.poidsNet?.toFixed(2)} kg`} />
            <InfoRow label="Poids Brut Total" value={`${lotDetail.poidsBrut?.toFixed(2)} kg`} />
          </View>

          {/* CARTE 2 : Opération (Inchangé) */}
          <View style={localStyles.sectionContainer}>
            <Text style={localStyles.sectionTitle}>Détails de l'Opération</Text>
            <FormLabel text="Numéro du Bordereau *" />
            <CustomTextInput placeholder="Saisir le numéro..." value={numBordereau} onChangeText={setNumBordereau} style={localStyles.inputMargin} />
            <FormLabel text="Type d'opération *" />
            <View style={localStyles.pickerContainer}>
              <Picker selectedValue={operationTypeId} onValueChange={setOperationTypeId} style={localStyles.pickerText}>
                <Picker.Item label="Sélectionner un type..." value="" enabled={false} style={{ color: '#999999' }} />
                {operationTypes.map((op) => (<Picker.Item key={op.id} label={op.designation} value={op.id.toString()} />))}
              </Picker>
            </View>
            <FormLabel text={operationTypeId === '3' ? 'Destination' : 'Destination *'} />
            {operationTypeId === '1' || operationTypeId === '2' ? (
              <View style={localStyles.pickerContainer}>
                <Picker selectedValue={destinationMagasinId} onValueChange={setDestinationMagasinId} style={localStyles.pickerText}>
                  <Picker.Item label="Sélectionner un magasin..." value="" enabled={false} style={{ color: '#999999' }} />
                  {magasins.map((mag) => (<Picker.Item key={mag.id} label={mag.designation} value={mag.id.toString()} />))}
                </Picker>
              </View>
            ) : (
              <CustomTextInput placeholder="Destination" value={operationTypeId === '3' ? 'Réusinage' : 'N/A'} editable={false} style={[localStyles.disabledInput, localStyles.inputMargin]} />
            )}
            <FormLabel text="Tracteur" />
            <CustomTextInput placeholder="N° immatriculation" value={tracteur} onChangeText={setTracteur} style={localStyles.inputMargin} />
            <FormLabel text="Remorque" />
            <CustomTextInput placeholder="N° immatriculation" value={remorque} onChangeText={setRemorque} style={localStyles.inputMargin} />
          </View>

          {/* CARTE 3 : Quantités (Inchangé, valeurs issues de lotDetail) */}
          <View style={localStyles.sectionContainer}>
            <Text style={localStyles.sectionTitle}>Quantités à sortir</Text>
            <FormLabel text="Mode de transfert *" />
            <SegmentedControl values={['Total', 'Partiel']} selectedIndex={modeIndex} onChange={(evt) => setTransfertMode(evt.nativeEvent.selectedSegmentIndex === 0 ? 'total' : 'partiel')} style={localStyles.inputMargin} tintColor={Colors.primary} />
            <FormLabel text="Nombre de sacs *" />
            <CustomTextInput placeholder="Saisir le nombre de sacs" value={nombreSacs?.toString() || ''} onChangeText={handleSacsChange} editable={isEditable} keyboardType="numeric" style={[!isEditable ? localStyles.disabledInput : {}, localStyles.inputMargin, sacsInputError ? localStyles.inputError : null]} />
            <FormLabel text="Nombre de palettes" />
            <CustomTextInput placeholder="Nombre de palettes" value={nombrePalettes} editable={false} style={[localStyles.disabledInput, localStyles.inputMargin]} />
            <FormLabel text="Poids Brut" />
            <CustomTextInput placeholder="Poids Brut" value={poidsBrut} editable={false} style={[localStyles.disabledInput, localStyles.inputMargin]} />
            <FormLabel text="Tare Sacs" />
            <CustomTextInput placeholder="Tare Sacs" value={tareSacs} editable={false} style={[localStyles.disabledInput, localStyles.inputMargin]} />
            <FormLabel text="Tare Palettes" />
            <CustomTextInput placeholder="Tare Palettes" value={tarePalettes} editable={false} style={[localStyles.disabledInput, localStyles.inputMargin]} />
            <FormLabel text="Poids Net" />
            <CustomTextInput placeholder="Poids Net" value={poidsNet} editable={false} style={[localStyles.disabledInput, localStyles.inputMargin]} />
            <FormLabel text="Commentaire" />
            <CustomTextInput placeholder="Optionnel" value={commentaire} onChangeText={setCommentaire} multiline />
          </View>
        </ScrollView>
        <View style={localStyles.footerContainer}>
          <View style={localStyles.footerButtonWrapper}><Button title="Annuler" onPress={() => navigation.goBack()} color={Colors.secondary} disabled={isSubmitting} /></View>
          <View style={localStyles.footerButtonWrapper}><Button title="Valider" onPress={handleTransfert} color={Colors.primary} disabled={isSubmitting || isLoading || sacsInputError} /></View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

// Styles inchangés
const localStyles = StyleSheet.create({
  pageContainer: { flex: 1, backgroundColor: Colors.background || '#f4f7f8' },
  scrollContainer: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 40 },
  loaderContainer: { justifyContent: 'center', alignItems: 'center', flex: 1 },
  footerContainer: { flexDirection: 'row', justifyContent: 'space-around', padding: 16, paddingBottom: Platform.OS === 'ios' ? 24 : 16, backgroundColor: '#ffffff', borderTopWidth: 1, borderTopColor: '#e0e0e0' },
  footerButtonWrapper: { flex: 1, marginHorizontal: 8 },
  sectionContainer: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 24, elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.22, shadowRadius: 2.22 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: Colors.primary, marginBottom: 16, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#eee', paddingBottom: 8 },
  lotNumberHeader: { textAlign: 'center', fontSize: 24, fontWeight: 'bold', color: Colors.primary, marginBottom: 8 },
  campagneHeader: { textAlign: 'center', fontSize: 16, color: Colors.darkGray, marginBottom: 20 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 },
  infoLabel: { fontSize: 15, color: Colors.darkGray },
  infoValue: { fontSize: 15, fontWeight: '500', color: Colors.dark, textAlign: 'right' },
  formLabel: { fontSize: 15, fontWeight: '600', color: '#333', marginBottom: 8, marginLeft: 2 },
  inputMargin: { marginBottom: 20 },
  disabledInput: { backgroundColor: '#e9ecef', color: '#6c757d', borderRadius: 5 },
  inputError: { borderColor: '#dc3545', borderWidth: 1, backgroundColor: 'rgba(220,53,69,0.1)' },
  pickerContainer: { backgroundColor: '#f9f9f9', borderColor: '#ddd', color: '#212529', borderWidth: 1, borderRadius: 8, marginBottom: 20, justifyContent: 'center' },
  pickerText: { color: Colors.textDark },
});

export default TransfertScreen;
