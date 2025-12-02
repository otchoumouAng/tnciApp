import React from 'react';
// MODIFICATION: Import de StyleSheet et Archive
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'; 
import { ArrowUpRight, ArrowDownLeft, Archive } from 'phosphor-react-native';
import { MouvementStock } from '../type';
import { Styles, Colors } from '../../../styles/style';

interface MouvementStockCardProps {
  item: MouvementStock;
  onPress: (item: MouvementStock) => void;
}

const getStatusStyle = (status: string | null | undefined) => {
    switch (status) {
        case 'VAL': // Vous pouvez ajuster ce statut si 'AP' (Approuvé) est utilisé
            return {
                borderColor: Colors.success,
                statusText: 'Validé',
                statusColor: Colors.success
            };
        case 'CON':
            return {
                borderColor: Colors.warning,
                statusText: 'Confirmé',
                statusColor: Colors.warning
            };
        default:
            return {
                borderColor: Colors.secondary,
                statusText: status || 'N/A',
                statusColor: Colors.secondary
            };
    }
};

const MouvementStockCard: React.FC<MouvementStockCardProps> = ({ item, onPress }) => {
    const statusStyle = getStatusStyle(item.statut);
    const isEntree = item.sens === 1;

    return (
        <TouchableOpacity onPress={() => onPress(item)}>
            <View style={[Styles.mouvementStockCard, { borderLeftColor: statusStyle.borderColor }]}>
                <View style={Styles.mouvementStockCardIconContainer}>
                    {isEntree ? <ArrowDownLeft size={28} color={Colors.success} weight="bold" /> : <ArrowUpRight size={28} color={Colors.error} weight="bold" />}
                </View>

                <View style={Styles.mouvementStockCardDetailsContainer}>
                    <View style={Styles.mouvementStockCardRow}>
                        <Text style={Styles.mouvementStockCardTypeText} numberOfLines={1}>{item.mouvementTypeDesignation+' - '+item.reference2}</Text>
                        <Text style={Styles.mouvementStockCardDateText}>{new Date(item.dateMouvement).toLocaleDateString()}</Text>
                    </View>
                    
                    {/* ==================== MODIFICATION ICI ==================== */}
                    <View style={Styles.mouvementStockCardRow}>
                        {/* Conteneur pour Poids et Sacs */}
                        <View style={localStyles.infoContainer}>
                            {/* Poids (style importé) */}
                            <Text style={Styles.mouvementStockCardPoidsText}>{(item.poidsNetAccepte ?? 0).toFixed(2)} kg</Text>
                            
                            {/* Séparateur visuel (style local) */}
                            <Text style={localStyles.separator}>|</Text>

                            {/* Sacs (styles locaux) */}
                            <Archive size={16} color="#666" style={localStyles.iconSacs} />
                            <Text style={localStyles.sacsText}>{item.quantite ?? 0} Sacs</Text>
                        </View>
                        
                        {/* Statut (style importé) */}
                        <Text style={[Styles.mouvementStockCardStatusText, { color: statusStyle.statusColor }]}>{statusStyle.statusText}</Text>
                    </View>
                    {/* ================== FIN DE LA MODIFICATION ================== */}

                     <Text style={Styles.mouvementStockCardMagasinText}>{item.magasinNom} | {item.exportateurNom}</Text>
                </View>
            </View>
        </TouchableOpacity>
    );
};

// --- STYLES LOCAUX AJOUTÉS ---
// Styles spécifiques pour les nouveaux éléments,
// copiés de LotCard pour la cohérence.
const localStyles = StyleSheet.create({
    infoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flexShrink: 1, // Permet au conteneur de se réduire
        marginRight: 8, // Marge pour ne pas coller au statut
    },
    separator: {
        fontSize: 14,
        color: '#ccc',
        marginHorizontal: 8,
    },
    iconSacs: {
        marginRight: 4,
    },
    sacsText: {
        fontSize: 14, // Assurez-vous que cela correspond à mouvementStockCardPoidsText
        color: '#444', // Assurez-vous que cela correspond à mouvementStockCardPoidsText
        fontWeight: '500', // Assurez-vous que cela correspond à mouvementStockCardPoidsText
    },
});

export default MouvementStockCard;