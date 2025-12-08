import React, { useState, useEffect, useRef, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Modal,
  TouchableOpacity,
  Animated,
  Easing,
  Dimensions,
  StatusBar,
  ScrollView
} from 'react-native';
import { Palette, OperationType } from './type';
import { getPaletteById, deplacerPalette, getOperationTypes } from './routes';
import { Styles, Colors } from '../../styles/style';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../../contexts/AuthContext';

const { width } = Dimensions.get('window');
const SCAN_SIZE = width * 0.7;

// Couleurs et Thèmes
const STATUS_COLORS = {
  success: '#2E7D32',
  warning: '#FFA000',
  error: '#C62828'
};

const DeplacerPaletteScreen = () => {
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState<boolean>(false);
  const [isCameraVisible, setCameraVisible] = useState<boolean>(false);
  const [scannedPalette, setScannedPalette] = useState<Palette | null>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [isValidationLoading, setValidationLoading] = useState<boolean>(false);

  // Operation Types State
  const [operationTypes, setOperationTypes] = useState<OperationType[]>([]);
  const [selectedOperationTypeId, setSelectedOperationTypeId] = useState<number>(1);
  const [isOperationTypesLoading, setIsOperationTypesLoading] = useState<boolean>(false);

  // UX Camera States
  const [torchEnabled, setTorchEnabled] = useState<boolean>(false);
  const scanAnim = useRef(new Animated.Value(0)).current;
  
  // UX Home Button Animation (Pulse)
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // UX Result Modal State
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

  useEffect(() => {
    fetchOperationTypes();
  }, []);

  const fetchOperationTypes = async () => {
    setIsOperationTypesLoading(true);
    try {
        const types = await getOperationTypes();
        setOperationTypes(types);
        // Ensure "Transfert" (ID 1) is selected by default, or the first one if not present
        const defaultOp = types.find(t => t.id === 1) || types[0];
        if (defaultOp) {
            setSelectedOperationTypeId(defaultOp.id);
        }
    } catch (error) {
        console.error("Failed to fetch operation types", error);
        // Fallback hardcoded if API fails, though routes.ts might throw.
        // If routes throws, we might want to just handle it gracefully or retry.
        // For now, let's keep the default ID 1.
    } finally {
        setIsOperationTypesLoading(false);
    }
  };

  // Animation de pulsation du bouton principal
  useEffect(() => {
    if (!isCameraVisible) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [isCameraVisible]);

  // Animation du laser scanner
  useEffect(() => {
    if (isCameraVisible) {
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
    } else {
      scanAnim.setValue(0);
      setTorchEnabled(false);
    }
  }, [isCameraVisible]);

  const showResult = (type: 'success' | 'warning' | 'error', title: string, message: string) => {
    setResultModal({ visible: true, type, title, message });
  };

  const closeResult = () => {
    setResultModal(prev => ({ ...prev, visible: false }));
  };

  const handleBarCodeScanned = async ({ data }: { data: string }) => {
    setCameraVisible(false);
    setLoading(true);
    try {
      const palette = await getPaletteById(data);
      if (!palette) {
        showResult('error', 'Introuvable', "Palette introuvable.");
      } else {
        setScannedPalette(palette);
      }
    } catch (error) {
      showResult('error', 'Erreur Scan', "Impossible de récupérer les infos de la palette.");
    } finally {
      setLoading(false);
    }
  };

  const handleValidation = async () => {
    if (!scannedPalette || !user) return;

    setValidationLoading(true);
    try {
      await deplacerPalette({
        paletteId: scannedPalette.id,
        typeOperationID: selectedOperationTypeId,
        creationUser: user.name,
        description: "Départ vers zone de transit"
      });

      // On ferme d'abord le détail
      setScannedPalette(null);

      // Puis on affiche le succès
      setTimeout(() => {
        showResult(
          'success',
          'Succès',
          `Palette ${scannedPalette.numero} en transit.`
        );
      }, 300);

    } catch (error: any) {
      const backendError = error?.response?.data?.Error;
      const finalMessage = backendError || error.message || "Une erreur inconnue est survenue.";

      setScannedPalette(null);

      if (finalMessage.toLowerCase().includes("déjà en cours de transit")) {
        setTimeout(() => {
          showResult('warning', 'Déjà parti', "Cette palette est déjà en transit.");
        }, 300);
      } else {
        setTimeout(() => {
          showResult('error', 'Échec', finalMessage);
        }, 300);
      }
    } finally {
      setValidationLoading(false);
    }
  };

  const handleCancelValidation = () => {
    setScannedPalette(null);
  };

  // --- RENDU PERMISSION ---
  if (!permission) return <View style={Styles.container} />;
  if (!permission.granted) {
    return (
      <View style={[Styles.container, { justifyContent: 'center', padding: 20 }]}>
        <Ionicons name="camera-off-outline" size={60} color="#ccc" style={{ alignSelf: 'center', marginBottom: 20 }} />
        <Text style={{ textAlign: 'center', marginBottom: 20, fontSize: 16, color: '#555' }}>
          L'accès à la caméra est nécessaire pour le scan.
        </Text>
        <TouchableOpacity onPress={requestPermission} style={{backgroundColor: Colors.primary, padding: 15, borderRadius: 10}}>
             <Text style={{color: 'white', fontWeight: 'bold'}}>Autoriser la caméra</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // --- RENDU CAMERA (MODE SCAN) ---
  if (isCameraVisible) {
    const laserTranslateY = scanAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0, SCAN_SIZE],
    });

    return (
      <View style={{ flex: 1, backgroundColor: 'black' }}>
        <StatusBar hidden />
        <CameraView
          style={StyleSheet.absoluteFillObject}
          onBarcodeScanned={scannedPalette || resultModal.visible ? undefined : handleBarCodeScanned}
          enableTorch={torchEnabled}
          barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
        />

        <View style={localStyles.overlay}>
          <View style={localStyles.overlayTop}>
             <TouchableOpacity style={localStyles.topCloseButton} onPress={() => setCameraVisible(false)}>
                <Ionicons name="close-circle" size={40} color="white" />
             </TouchableOpacity>
          </View>
          
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
            <Text style={localStyles.scanInstruction}>Scannez le QR Code Palette</Text>
            <TouchableOpacity
              style={[localStyles.flashButton, torchEnabled && localStyles.flashButtonActive]}
              onPress={() => setTorchEnabled(!torchEnabled)}
            >
              <Ionicons name={torchEnabled ? "flash" : "flash-off"} size={24} color={torchEnabled ? Colors.primary : "white"} />
              <Text style={{color: 'white', marginTop: 5, fontSize: 12}}>Lampe</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  // --- RENDU PRINCIPAL (MODE STANDBY ULTRA MODERNE) ---
  return (
    <View style={localStyles.mainContainer}>
      <StatusBar barStyle="dark-content" backgroundColor="#F5F7FA" />

      {/* --- HEADER --- */}
      <View style={localStyles.modernHeader}>
        <View>
          <Text style={localStyles.modernTitle}>Enlever Une Palette</Text>
          <Text style={localStyles.modernSubtitle}>Deplacer vers un autre emplacement</Text>
        </View>
        <View style={localStyles.headerIconBg}>
           <Ionicons name="cube" size={24} color={Colors.primary} />
        </View>
      </View>

      {/* --- BODY CENTRAL --- */}
      <View style={localStyles.centerContent}>
        {loading ? (
          <ActivityIndicator size="large" color={Colors.primary} />
        ) : (
          <TouchableOpacity 
            activeOpacity={0.8}
            onPress={() => setCameraVisible(true)}
            style={{ alignItems: 'center' }}
          >
            <Animated.View style={[localStyles.scanTriggerCircle, { transform: [{ scale: pulseAnim }] }]}>
              <Ionicons name="qr-code" size={60} color="white" />
            </Animated.View>
            <Text style={localStyles.triggerText}>APPUYER POUR SCANNER</Text>
            <Text style={localStyles.triggerSubText}>Déplacer vers zone de transit</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* --- FOOTER INFO --- */}
      <View style={localStyles.footerInfo}>
        <Ionicons name="information-circle-outline" size={20} color="#999" />
        <Text style={localStyles.footerText}>
          Assurez-vous que la palette est prête physiquement avant de valider le scan.
        </Text>
      </View>

      {/* --- MODALS (Code existant conservé pour la logique) --- */}
      
      {/* RESULT MODAL */}
      <Modal
        transparent={true}
        visible={resultModal.visible}
        animationType="fade"
        onRequestClose={closeResult}
      >
        <View style={localStyles.modalOverlay}>
          <View style={[localStyles.resultCard, { borderLeftColor: STATUS_COLORS[resultModal.type] }]}>
            <View style={[localStyles.resultIconBubble, { backgroundColor: STATUS_COLORS[resultModal.type] + '20' }]}>
               <Ionicons 
                 name={resultModal.type === 'success' ? 'checkmark' : 'alert'} 
                 size={32} 
                 color={STATUS_COLORS[resultModal.type]} 
               />
            </View>
            <Text style={localStyles.resultCardTitle}>{resultModal.title}</Text>
            <Text style={localStyles.resultCardMessage}>{resultModal.message}</Text>
            <TouchableOpacity 
              style={[localStyles.resultCardButton, { backgroundColor: STATUS_COLORS[resultModal.type] }]}
              onPress={closeResult}
            >
              <Text style={localStyles.resultCardButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* CONFIRMATION MODAL */}
      <Modal
        transparent={true}
        visible={!!scannedPalette}
        animationType="slide"
        onRequestClose={handleCancelValidation}
      >
        <View style={localStyles.modalOverlay}>
          <View style={localStyles.confirmCard}>
            <View style={localStyles.confirmHeader}>
              <Text style={localStyles.confirmTitle}>Confirmation</Text>
              <TouchableOpacity onPress={handleCancelValidation}>
                <Ionicons name="close" size={24} color="#999" />
              </TouchableOpacity>
            </View>

            <ScrollView>
            {scannedPalette && (
              <View style={localStyles.confirmBody}>
                 <View style={localStyles.paletteIdBadge}>
                    <Text style={localStyles.paletteIdText}>{scannedPalette.numero}</Text>
                 </View>
                 
                 <View style={localStyles.detailGrid}>
                    <View style={localStyles.detailItem}>
                        <Text style={localStyles.detailLabel}>Article</Text>
                        <Text style={localStyles.detailValue} numberOfLines={1}>{scannedPalette.nomArticle}</Text>
                    </View>
                    <View style={localStyles.detailItem}>
                        <Text style={localStyles.detailLabel}>Quantité</Text>
                        <Text style={localStyles.detailValue}>{scannedPalette.nbreUnite}</Text>
                    </View>
                 </View>

                 {/* --- OPERATION TYPE SELECTOR --- */}
                 <View style={localStyles.operationSection}>
                    <Text style={localStyles.sectionTitle}>Type d'opération</Text>
                    {isOperationTypesLoading ? (
                        <ActivityIndicator color={Colors.primary} size="small" />
                    ) : (
                        <View style={localStyles.operationList}>
                            {operationTypes.map((op) => (
                                <TouchableOpacity
                                    key={op.id}
                                    style={[
                                        localStyles.operationChip,
                                        selectedOperationTypeId === op.id && localStyles.operationChipActive
                                    ]}
                                    onPress={() => setSelectedOperationTypeId(op.id)}
                                >
                                    <Text style={[
                                        localStyles.operationChipText,
                                        selectedOperationTypeId === op.id && localStyles.operationChipTextActive
                                    ]}>
                                        {op.designation}
                                    </Text>
                                    {selectedOperationTypeId === op.id && (
                                        <Ionicons name="checkmark" size={16} color="white" style={{marginLeft: 5}} />
                                    )}
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}
                 </View>

                 <View style={localStyles.actionWarning}>
                    <Ionicons name="arrow-forward-circle" size={20} color={Colors.primary} style={{marginRight:8}} />
                    <Text style={{color: Colors.textDark, fontSize: 13, fontWeight: '600'}}>
                       Départ vers le Transit
                    </Text>
                 </View>
              </View>
            )}
            </ScrollView>

            <View style={localStyles.confirmFooter}>
              {isValidationLoading ? (
                <ActivityIndicator color={Colors.primary} />
              ) : (
                <TouchableOpacity style={localStyles.validateButton} onPress={handleValidation}>
                  <Text style={localStyles.validateButtonText}>VALIDER LE DÉPART</Text>
                  <Ionicons name="checkmark-circle-outline" size={22} color="white" style={{marginLeft: 8}} />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </Modal>

    </View>
  );
};

const localStyles = StyleSheet.create({
  // --- LAYOUT PRINCIPAL ---
  mainContainer: { flex: 1, backgroundColor: '#F5F7FA', flexDirection: 'column' },
  modernHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: 25, 
    paddingTop: 60, 
    paddingBottom: 20 
  },
  modernTitle: { fontSize: 28, fontWeight: '800', color: '#1A202C', letterSpacing: -0.5 },
  modernSubtitle: { fontSize: 14, color: '#718096', fontWeight: '500', marginTop: 2 },
  headerIconBg: { 
    width: 48, height: 48, borderRadius: 14, 
    backgroundColor: 'white', alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 3
  },

  centerContent: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scanTriggerCircle: {
    width: 160, height: 160, borderRadius: 80,
    backgroundColor: Colors.primary,
    justifyContent: 'center', alignItems: 'center',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.4, shadowRadius: 20,
    elevation: 15,
    marginBottom: 30
  },
  triggerText: { fontSize: 18, fontWeight: '800', color: '#2D3748', letterSpacing: 1 },
  triggerSubText: { fontSize: 14, color: '#A0AEC0', marginTop: 5 },

  footerInfo: { 
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', 
    padding: 30, paddingBottom: 50, opacity: 0.7 
  },
  footerText: { marginLeft: 10, fontSize: 12, color: '#718096', textAlign: 'center', maxWidth: '80%' },

  // --- CAMERA OVERLAY ---
  overlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center' },
  overlayTop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', alignItems: 'flex-end', padding: 20 },
  topCloseButton: { marginTop: 40 },
  overlayCenterRow: { flexDirection: 'row', height: SCAN_SIZE },
  overlaySide: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)' },
  scanWindow: { width: SCAN_SIZE, height: SCAN_SIZE, position: 'relative', overflow: 'hidden', borderRadius: 20 },
  overlayBottom: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', alignItems: 'center', paddingTop: 40 },
  
  laser: { width: '100%', height: 3, backgroundColor: '#00E676', shadowColor: '#00E676', shadowOpacity: 0.8, shadowRadius: 10 },
  corner: { position: 'absolute', width: 40, height: 40, borderColor: 'white', borderWidth: 4, borderRadius: 4 },
  topLeft: { top: 0, left: 0, borderBottomWidth: 0, borderRightWidth: 0 },
  topRight: { top: 0, right: 0, borderBottomWidth: 0, borderLeftWidth: 0 },
  bottomLeft: { bottom: 0, left: 0, borderTopWidth: 0, borderRightWidth: 0 },
  bottomRight: { bottom: 0, right: 0, borderTopWidth: 0, borderLeftWidth: 0 },
  
  scanInstruction: { color: 'white', fontSize: 16, fontWeight: '600', marginBottom: 30, opacity: 0.9 },
  flashButton: { alignItems: 'center', justifyContent: 'center', padding: 10 },
  flashButtonActive: { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 12 },

  // --- MODAL CARDS MODERN ---
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  
  // Confirmation Card
  confirmCard: { width: '100%', maxHeight: '80%', backgroundColor: 'white', borderRadius: 24, overflow: 'hidden' },
  confirmHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  confirmTitle: { fontSize: 18, fontWeight: 'bold', color: '#2D3748' },
  confirmBody: { padding: 25 },
  paletteIdBadge: { alignSelf: 'center', backgroundColor: '#EDF2F7', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 8, marginBottom: 20 },
  paletteIdText: { fontSize: 20, fontWeight: '900', color: '#2D3748', letterSpacing: 1 },
  
  detailGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  detailItem: { flex: 1, backgroundColor: '#FAFAFA', padding: 12, borderRadius: 12, marginRight: 10 },
  detailLabel: { fontSize: 11, color: '#A0AEC0', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: 4 },
  detailValue: { fontSize: 14, color: '#4A5568', fontWeight: '600' },

  // Operations
  operationSection: { marginBottom: 20 },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: '#2D3748', marginBottom: 10 },
  operationList: { flexDirection: 'row', flexWrap: 'wrap' },
  operationChip: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 8, paddingHorizontal: 15,
    borderRadius: 20, backgroundColor: '#F0F4F8', marginRight: 10, marginBottom: 10,
    borderWidth: 1, borderColor: '#E2E8F0'
  },
  operationChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  operationChipText: { fontSize: 13, color: '#4A5568', fontWeight: '600' },
  operationChipTextActive: { color: 'white' },
  
  actionWarning: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#EBF8FF', padding: 15, borderRadius: 12 },
  
  confirmFooter: { padding: 20, borderTopWidth: 1, borderTopColor: '#F0F0F0' },
  validateButton: { backgroundColor: Colors.primary, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 16, borderRadius: 16, shadowColor: Colors.primary, shadowOffset: {width:0,height:4}, shadowOpacity:0.3, shadowRadius:8 },
  validateButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold', letterSpacing: 0.5 },

  // Result Card
  resultCard: { width: '90%', backgroundColor: 'white', borderRadius: 20, padding: 25, alignItems: 'center', borderLeftWidth: 6, elevation: 5 },
  resultIconBubble: { width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
  resultCardTitle: { fontSize: 20, fontWeight: '800', color: '#2D3748', marginBottom: 8 },
  resultCardMessage: { fontSize: 15, color: '#718096', textAlign: 'center', marginBottom: 20, lineHeight: 22 },
  resultCardButton: { paddingVertical: 12, paddingHorizontal: 30, borderRadius: 12 },
  resultCardButtonText: { color: 'white', fontWeight: 'bold' }
});

export default DeplacerPaletteScreen;