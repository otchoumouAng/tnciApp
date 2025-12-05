import React, { useState, useEffect, useRef, useContext } from 'react';
import {
  View,
  Text,
  Button,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Modal,
  TouchableOpacity,
  Animated,
  Easing,
  Dimensions
} from 'react-native';
import { Palette, Emplacement } from './type';
import { getPalettesEnTransit, getEmplacementById, receptionnerPalette } from './routes';
import { Styles, Colors } from '../../styles/style';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../../contexts/AuthContext';

const { width } = Dimensions.get('window');
const SCAN_SIZE = width * 0.7;

// Colors matching DeclarationPalette
const STATUS_COLORS = {
  success: '#2E7D32',
  warning: '#FFA000',
  error: '#C62828'
};

const ReceptionPaletteScreen = () => {
  const { user } = useContext(AuthContext);
  const [transitPalettes, setTransitPalettes] = useState<Palette[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Selection State
  const [selectedPalette, setSelectedPalette] = useState<Palette | null>(null);

  // Camera State
  const [isCameraVisible, setCameraVisible] = useState<boolean>(false);
  const [permission, requestPermission] = useCameraPermissions();
  const [torchEnabled, setTorchEnabled] = useState<boolean>(false);
  const scanAnim = useRef(new Animated.Value(0)).current;

  // Process State
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Result Modal State
  const [resultModal, setResultModal] = useState<{
    visible: boolean;
    type: 'success' | 'warning' | 'error';
    title: string;
    message: string;
  }>({
    visible: false,
    type: 'success',
    title: '',
    message: ''
  });

  const fetchTransitPalettes = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const palettes = await getPalettesEnTransit(user.id);
      setTransitPalettes(palettes);
    } catch (error) {
      console.error("Failed to fetch transit palettes:", error);
      setError("Impossible de charger la liste des palettes en transit.");
      setTransitPalettes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransitPalettes();
  }, []);

  useEffect(() => {
    if (isCameraVisible) {
      startScanAnimation();
    } else {
      scanAnim.setValue(0);
      setTorchEnabled(false);
    }
  }, [isCameraVisible]);

  const startScanAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scanAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(scanAnim, {
          toValue: 0,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        })
      ])
    ).start();
  };

  const showResult = (type: 'success' | 'warning' | 'error', title: string, message: string) => {
    setResultModal({ visible: true, type, title, message });
  };

  const closeResult = () => {
    setResultModal(prev => ({ ...prev, visible: false }));
    // If success, refresh list and close detail modal
    if (resultModal.type === 'success') {
        setSelectedPalette(null);
        fetchTransitPalettes();
    }
  };

  const handleEmplacementScanned = async ({ data }: { data: string }) => {
    // Only process if we have a selected palette and camera is open
    if (!isCameraVisible || !selectedPalette || !user) return;

    setCameraVisible(false);
    setIsProcessing(true);

    try {
        // 1. Parse Emplacement ID
        const emplacementId = parseInt(data, 10);
        if (isNaN(emplacementId)) {
            throw new Error("Le QR Code ne contient pas un ID d'emplacement valide.");
        }

        // 2. Fetch Emplacement Details
        const emplacement = await getEmplacementById(emplacementId);

        if (!emplacement) {
            throw new Error(`Emplacement ID ${emplacementId} introuvable.`);
        }

        if (!emplacement.magasinId) {
            throw new Error("L'emplacement scanné n'est associé à aucun magasin.");
        }

        // 3. Call Reception API
        await receptionnerPalette({
            paletteId: selectedPalette.id,
            magasinDestinationId: emplacement.magasinId,
            emplacementDestinationID: emplacement.id,
            creationUser: user.name
        });

        // 4. Success
        setTimeout(() => {
            showResult('success', 'Réception Réussie', `Palette réceptionnée à l'emplacement ${emplacement.designation}.`);
        }, 500);

    } catch (error: any) {
        const msg = error.message || "Une erreur est survenue lors de la réception.";
        setTimeout(() => {
            showResult('error', 'Échec Réception', msg);
        }, 500);
    } finally {
        setIsProcessing(false);
    }
  };

  const renderItem = ({ item }: { item: Palette }) => (
    <TouchableOpacity onPress={() => setSelectedPalette(item)}>
        <View style={localStyles.itemContainer}>
        <View style={localStyles.itemHeader}>
            <Ionicons name="cube-outline" size={24} color={Colors.primary} />
            <Text style={localStyles.itemTitle}>{item.numero}</Text>
        </View>
        <View style={localStyles.itemBody}>
            <Text style={localStyles.itemText}><Text style={localStyles.bold}>Article:</Text> {item.nomArticle}</Text>
            <Text style={localStyles.itemText}><Text style={localStyles.bold}>Produit:</Text> {item.produitDesignation}</Text>
            <Text style={localStyles.dateText}>{item.dateDeclaration ? new Date(item.dateDeclaration).toLocaleDateString() + ' ' + new Date(item.dateDeclaration).toLocaleTimeString() : 'N/A'}</Text>
        </View>
        </View>
    </TouchableOpacity>
  );

  const ListContent = () => {
    if (loading) return <ActivityIndicator size="large" color={Colors.primary} style={Styles.loader} />;
    if (error) return <Text style={Styles.errorText}>{error}</Text>;
    return (
      <FlatList
        data={transitPalettes}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <View style={localStyles.emptyContainer}>
            <Ionicons name="albums-outline" size={48} color="#ccc" />
            <Text style={Styles.emptyText}>Aucune palette à réceptionner.</Text>
          </View>
        }
        contentContainerStyle={Styles.list}
        onRefresh={fetchTransitPalettes}
        refreshing={loading}
      />
    );
  };

  if (!permission) return <View />;
  if (!permission.granted) {
    return (
      <View style={Styles.container}>
        <Text style={{ textAlign: 'center', marginBottom: 20 }}>Accès caméra requis.</Text>
        <Button onPress={requestPermission} title="Autoriser la caméra" />
      </View>
    );
  }

  // --- RENDU DE LA CAMÉRA ---
  if (isCameraVisible) {
    const laserTranslateY = scanAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0, SCAN_SIZE],
    });

    return (
      <View style={{ flex: 1, backgroundColor: 'black' }}>
        <CameraView
          style={StyleSheet.absoluteFillObject}
          onBarcodeScanned={isProcessing ? undefined : handleEmplacementScanned}
          enableTorch={torchEnabled}
          barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
        />

        <View style={localStyles.overlay}>
          <View style={localStyles.overlayTop} />
          <View style={localStyles.overlayCenterRow}>
            <View style={localStyles.overlaySide} />
            <View style={localStyles.scanWindow}>
              <Animated.View style={[localStyles.laser, { transform: [{ translateY: laserTranslateY }] }]} />
              <View style={[localStyles.corner, localStyles.topLeft]} />
              <View style={[localStyles.corner, localStyles.topRight]} />
              <View style={[localStyles.corner, localStyles.bottomLeft]} />
              <View style={[localStyles.corner, localStyles.bottomRight]} />
            </View>
            <View style={localStyles.overlaySide} />
          </View>
          <View style={localStyles.overlayBottom}>
            <Text style={localStyles.scanInstruction}>Scannez le code emplacement</Text>
            <View style={localStyles.cameraControls}>
              <TouchableOpacity
                style={[localStyles.iconButton, torchEnabled && localStyles.iconButtonActive]}
                onPress={() => setTorchEnabled(!torchEnabled)}
              >
                <Ionicons name={torchEnabled ? "flash" : "flash-off"} size={24} color="white" />
              </TouchableOpacity>
              <TouchableOpacity
                style={[localStyles.iconButton, localStyles.closeButton]}
                onPress={() => setCameraVisible(false)}
              >
                <Ionicons name="close" size={32} color="white" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={Styles.container}>

      {/* --- MODAL DE RÉSULTAT --- */}
      <Modal
        transparent={true}
        visible={resultModal.visible}
        animationType="slide"
        onRequestClose={closeResult}
      >
        <View style={localStyles.modalOverlay}>
          <View style={[localStyles.resultModalContent, { borderTopColor: STATUS_COLORS[resultModal.type] }]}>
            <View style={[localStyles.resultIconContainer, { backgroundColor: STATUS_COLORS[resultModal.type] }]}>
              <Ionicons
                name={
                  resultModal.type === 'success' ? 'checkmark-done' :
                  resultModal.type === 'warning' ? 'warning' : 'alert'
                }
                size={40}
                color="white"
              />
            </View>
            <Text style={[localStyles.resultTitle, { color: STATUS_COLORS[resultModal.type] }]}>
              {resultModal.title}
            </Text>
            <Text style={localStyles.resultMessage}>{resultModal.message}</Text>

            <TouchableOpacity
              style={[localStyles.resultButton, { backgroundColor: STATUS_COLORS[resultModal.type] }]}
              onPress={closeResult}
            >
              <Text style={localStyles.resultButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* --- MODAL DETAILS PALETTE --- */}
      <Modal
        transparent={true}
        visible={!!selectedPalette}
        animationType="fade"
        onRequestClose={() => setSelectedPalette(null)}
      >
        <View style={localStyles.modalOverlay}>
          <View style={localStyles.modalContent}>
            <View style={localStyles.modalHeader}>
              <Ionicons name="information-circle" size={50} color={Colors.primary} />
              <Text style={localStyles.modalTitle}>Réceptionner Palette</Text>
            </View>

            {selectedPalette && (
              <View style={localStyles.modalDetails}>
                 <Text style={localStyles.detailRow}><Text style={localStyles.bold}>Palette N°:</Text> {selectedPalette.numero}</Text>
                 <Text style={localStyles.detailRow}><Text style={localStyles.bold}>Article:</Text> {selectedPalette.nomArticle}</Text>
                 <Text style={localStyles.detailRow}><Text style={localStyles.bold}>Produit:</Text> {selectedPalette.produitDesignation}</Text>
                 <Text style={localStyles.detailRow}><Text style={localStyles.bold}>Poids Net:</Text> {selectedPalette.poidsNetPalette} kg</Text>
              </View>
            )}

            <View style={localStyles.modalButtonContainer}>
                <TouchableOpacity style={[localStyles.modalButton, localStyles.cancelBtn]} onPress={() => setSelectedPalette(null)}>
                  <Text style={localStyles.cancelBtnText}>ANNULER</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[localStyles.modalButton, localStyles.confirmBtn]} onPress={() => setCameraVisible(true)}>
                  <Text style={localStyles.confirmBtnText}>SCANNER EMPLACEMENT</Text>
                </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* --- MODAL CHARGEMENT --- */}
      <Modal
        transparent={true}
        visible={isProcessing}
        animationType="none"
      >
         <View style={localStyles.modalOverlay}>
            <View style={{backgroundColor: 'white', padding: 20, borderRadius: 10, alignItems: 'center'}}>
                <ActivityIndicator size="large" color={Colors.primary} />
                <Text style={{marginTop: 10, fontWeight: 'bold'}}>Traitement en cours...</Text>
            </View>
         </View>
      </Modal>

      <View style={localStyles.headerContainer}>
        <Text style={localStyles.headerTitle}>Réception Palette</Text>
        <Text style={localStyles.headerSubtitle}>Sélectionnez une palette à réceptionner</Text>
      </View>

      <View style={localStyles.listHeader}>
        <Text style={localStyles.listTitle}>En Transit</Text>
        <TouchableOpacity onPress={fetchTransitPalettes}>
            <Ionicons name="refresh" size={20} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      <ListContent />
    </View>
  );
};

const localStyles = StyleSheet.create({
  // --- STYLES CAMÉRA OVERLAY ---
  overlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center' },
  overlayTop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)' },
  overlayCenterRow: { flexDirection: 'row', height: SCAN_SIZE },
  overlaySide: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)' },
  scanWindow: { width: SCAN_SIZE, height: SCAN_SIZE, position: 'relative', overflow: 'hidden' },
  overlayBottom: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', alignItems: 'center', paddingTop: 30 },

  laser: { width: '100%', height: 2, backgroundColor: Colors.primary, shadowColor: Colors.primary, shadowOpacity: 1, shadowRadius: 10 },
  corner: { position: 'absolute', width: 30, height: 30, borderColor: Colors.primary, borderWidth: 5 },
  topLeft: { top: 0, left: 0, borderBottomWidth: 0, borderRightWidth: 0 },
  topRight: { top: 0, right: 0, borderBottomWidth: 0, borderLeftWidth: 0 },
  bottomLeft: { bottom: 0, left: 0, borderTopWidth: 0, borderRightWidth: 0 },
  bottomRight: { bottom: 0, right: 0, borderTopWidth: 0, borderLeftWidth: 0 },

  scanInstruction: { color: 'white', fontSize: 16, marginBottom: 40, fontWeight: '600', letterSpacing: 0.5 },
  cameraControls: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', width: '100%', paddingBottom: 40 },
  iconButton: { width: 50, height: 50, borderRadius: 25, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center', marginHorizontal: 15 },
  iconButtonActive: { backgroundColor: Colors.primary },
  closeButton: { backgroundColor: STATUS_COLORS.error, width: 60, height: 60, borderRadius: 30 },

  // --- UI PRINCIPALE ---
  headerContainer: { padding: 20, backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#eee' },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: Colors.textDark, textTransform: 'uppercase' },
  headerSubtitle: { fontSize: 13, color: '#666', marginTop: 5, fontWeight: '500' },

  listHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 10, marginTop: 15 },
  listTitle: { fontSize: 16, fontWeight: '700', color: '#444', textTransform: 'uppercase' },

  itemContainer: { backgroundColor: 'white', marginHorizontal: 20, marginBottom: 12, borderRadius: 8, padding: 15, borderLeftWidth: 5, borderLeftColor: Colors.primary, elevation: 2 },
  itemHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, paddingBottom: 5, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  itemTitle: { fontSize: 18, fontWeight: 'bold', marginLeft: 10, color: '#333' },
  itemBody: { paddingLeft: 0 },
  itemText: { fontSize: 14, color: '#555', marginBottom: 3 },
  dateText: { fontSize: 12, color: '#999', marginTop: 6, textAlign: 'right', fontStyle: 'italic' },
  bold: { fontWeight: '700', color: '#333' },
  emptyContainer: { alignItems: 'center', marginTop: 60 },

  // --- MODAL DETAILS ---
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '90%', backgroundColor: 'white', borderRadius: 12, padding: 0, alignItems: 'center', elevation: 10, overflow: 'hidden' },
  modalHeader: { width: '100%', alignItems: 'center', padding: 20, backgroundColor: '#f9f9f9', borderBottomWidth: 1, borderBottomColor: '#eee' },
  modalTitle: { fontSize: 20, fontWeight: '800', color: '#333', marginTop: 10, textTransform: 'uppercase', letterSpacing: 1 },
  modalDetails: { width: '100%', padding: 20, backgroundColor: 'white' },
  detailRow: { fontSize: 15, marginBottom: 8, color: '#444', borderBottomWidth: 1, borderBottomColor: '#f0f0f0', paddingBottom: 4 },
  modalButtonContainer: { flexDirection: 'row', width: '100%', borderTopWidth: 1, borderTopColor: '#eee' },
  modalButton: { flex: 1, padding: 20, alignItems: 'center', justifyContent: 'center' },
  cancelBtn: { backgroundColor: '#fff' },
  cancelBtnText: { color: '#777', fontWeight: 'bold', letterSpacing: 1 },
  confirmBtn: { backgroundColor: Colors.primary },
  confirmBtnText: { color: 'white', fontWeight: 'bold', letterSpacing: 1 },

  // --- MODAL DE RÉSULTAT ---
  resultModalContent: { width: '85%', backgroundColor: 'white', borderRadius: 12, padding: 30, alignItems: 'center', elevation: 10, borderTopWidth: 8 },
  resultIconContainer: { width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center', marginBottom: 20, elevation: 5 },
  resultTitle: { fontSize: 22, fontWeight: '900', marginBottom: 10, textTransform: 'uppercase', textAlign: 'center' },
  resultMessage: { fontSize: 16, color: '#666', textAlign: 'center', marginBottom: 25, lineHeight: 22 },
  resultButton: { paddingVertical: 12, paddingHorizontal: 40, borderRadius: 25, elevation: 3 },
  resultButtonText: { color: 'white', fontWeight: 'bold', letterSpacing: 1, fontSize: 16 }
});

export default ReceptionPaletteScreen;
