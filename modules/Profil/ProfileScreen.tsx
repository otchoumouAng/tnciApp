import React, { useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { AuthContext } from '../../contexts/AuthContext';
import { Spacing, Styles, Typography, Colors } from '../../styles/style';
import { UserCircle, At, Briefcase, MapPinLine, Storefront, SignOut } from 'phosphor-react-native';

// Composant réutilisable pour afficher une ligne d'information avec une icône
const InfoRow = ({ icon, label, value }: { icon: React.ReactNode, label: string, value?: string | null }) => {
    if (!value) return null; // Ne rien afficher si la valeur est absente

    return (
        <View style={localStyles.infoRow}>
            <View style={localStyles.infoIcon}>
                {icon}
            </View>
            <View style={localStyles.infoTextContainer}>
                <Text style={localStyles.infoLabel}>{label}</Text>
                <Text style={localStyles.infoValue}>{value}</Text>
            </View>
        </View>
    );
};

export default function ProfileScreen() {
  const { user, logout, isLoading } = useContext(AuthContext);

  if (isLoading) {
    return <ActivityIndicator style={Styles.loader} size="large" color={Colors.primary} />;
  }

  if (!user) {
    return (
      <View style={[Styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={Typography.body}>Utilisateur non trouvé.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={Styles.container} contentContainerStyle={{ padding: Spacing.lg }}>
      <View style={localStyles.headerContainer}>
        <UserCircle size={80} color={Colors.primary} weight="light" />
        <Text style={[Typography.h2, { marginTop: Spacing.md }]}>{user.name}</Text>
        <Text style={[Typography.body, { color: Colors.darkGray }]}>@{user.userName}</Text>
      </View>
      
      <View style={[Styles.card, { marginTop: Spacing.lg }]}>
        <Text style={localStyles.cardTitle}>Informations Professionnelles</Text>
        <InfoRow icon={<Briefcase size={24} color={Colors.primary} />} label="Fonction" value={user.functionName} />
        <InfoRow icon={<MapPinLine size={24} color={Colors.primary} />} label="Site de travail" value={user.locationName} />
        <InfoRow icon={<Storefront size={24} color={Colors.primary} />} label="Magasin par défaut" value={user.magasinNom} />
      </View>

      <View style={[Styles.card, { marginTop: Spacing.lg }]}>
        <Text style={localStyles.cardTitle}>Contact</Text>
        <InfoRow icon={<At size={24} color={Colors.primary} />} label="Email" value={user.email} />
        {/* Vous pouvez ajouter d'autres champs de contact ici si nécessaire */}
      </View>
      
      <TouchableOpacity
        style={[Styles.buttonSecondary, localStyles.logoutButton]}
        onPress={logout}
        accessibilityLabel="Se déconnecter"
      >
        <SignOut size={20} color={Colors.error} />
        <Text style={[Styles.textButton, localStyles.logoutButtonText]}>Se déconnecter</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const localStyles = StyleSheet.create({
    headerContainer: {
        alignItems: 'center',
        marginBottom: Spacing.lg,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: Colors.dark,
        marginBottom: Spacing.md,
        paddingBottom: Spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: Colors.lightGray,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Spacing.md,
    },
    infoIcon: {
        marginRight: Spacing.md,
    },
    infoTextContainer: {
        flex: 1,
    },
    infoLabel: {
        fontSize: 12,
        color: Colors.darkGray,
    },
    infoValue: {
        fontSize: 16,
        color: Colors.dark,
        fontWeight: '500',
    },
    logoutButton: {
        marginTop: Spacing.xl,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 0, 0, 0.1)',
        borderColor: Colors.error,
        borderWidth: 1,
    },
    logoutButtonText: {
        color: Colors.error,
        marginLeft: Spacing.sm,
    }
});