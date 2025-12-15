import React, { useContext } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView, 
  ActivityIndicator, 
  ImageBackground, 
  SafeAreaView, 
  StatusBar,
  Dimensions
} from 'react-native';
import { AuthContext } from '../../contexts/AuthContext';
// On garde les imports de base pour la logique
import { Spacing, Styles, Colors } from '../../styles/style';
import { UserCircle, At, Briefcase, MapPinLine, Storefront, SignOut, CaretRight, ShieldCheck } from 'phosphor-react-native';
// On réutilise la même image de fond pour la cohérence
import BackgroundImage from '../../assets/background.png';

// --- COMPOSANTS UI REUTILISABLES POUR CE SCREEN ---

// Une ligne d'info stylisée "Premium"
const InfoRow = ({ icon, label, value, isLast }: { icon: React.ReactNode, label: string, value?: string | null, isLast?: boolean }) => {
    if (!value) return null;

    return (
        <View style={[DesignStyles.infoRow, !isLast && DesignStyles.infoRowBorder]}>
            {/* Icône dans une bulle subtile */}
            <View style={DesignStyles.iconContainer}>
                {icon}
            </View>
            
            <View style={DesignStyles.infoContent}>
                <Text style={DesignStyles.infoLabel}>{label}</Text>
                <Text style={DesignStyles.infoValue}>{value}</Text>
            </View>
        </View>
    );
};

// Séparateur de section visuel
const SectionHeader = ({ title }: { title: string }) => (
    <View style={DesignStyles.sectionHeader}>
        <Text style={DesignStyles.sectionTitle}>{title}</Text>
    </View>
);

export default function ProfileScreen() {
  const { user, logout, isLoading } = useContext(AuthContext);

  if (isLoading) {
    return (
        <View style={[DesignStyles.centerContainer, { backgroundColor: '#F8FAFC' }]}>
            <ActivityIndicator size="large" color="#4F46E5" />
        </View>
    );
  }

  if (!user) {
    return (
      <View style={DesignStyles.centerContainer}>
        <Text style={DesignStyles.errorText}>Utilisateur non trouvé.</Text>
      </View>
    );
  }

  return (
    <ImageBackground 
      source={BackgroundImage} 
      resizeMode="cover" 
      style={DesignStyles.background}
    >
        {/* Overlay pour unifier avec le HomeScreen */}
        <View style={DesignStyles.overlay}>
            <SafeAreaView style={{ flex: 1 }}>
                <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
                
                <ScrollView 
                    contentContainerStyle={{ paddingBottom: Spacing.xl }}
                    showsVerticalScrollIndicator={false}
                >
                    {/* --- HERO SECTION (Avatar) --- */}
                    <View style={DesignStyles.headerContainer}>
                        <View style={DesignStyles.avatarWrapper}>
                            <View style={DesignStyles.avatarShadow}>
                                <UserCircle size={100} color="#4F46E5" weight="light" />
                            </View>
                            <View style={DesignStyles.statusBadge}>
                                <ShieldCheck size={16} color="#FFFFFF" weight="fill" />
                            </View>
                        </View>
                        
                        <Text style={DesignStyles.userName}>{user.name}</Text>
                        <Text style={DesignStyles.userHandle}>@{user.userName}</Text>
                        
                        {/* Petit badge de rôle style "chip" */}
                        <View style={DesignStyles.roleBadge}>
                            <Text style={DesignStyles.roleText}>{user.functionName || "Collaborateur"}</Text>
                        </View>
                    </View>
      
                    {/* --- CONTENU --- */}
                    <View style={DesignStyles.contentContainer}>
                        
                        {/* Carte Infos Pro */}
                        <View style={DesignStyles.card}>
                            <SectionHeader title="Informations Professionnelles" />
                            <InfoRow 
                                icon={<Briefcase size={22} color="#4F46E5" weight="duotone" />} 
                                label="Fonction" 
                                value={user.functionName} 
                            />
                            <InfoRow 
                                icon={<MapPinLine size={22} color="#F59E0B" weight="duotone" />} 
                                label="Site de travail" 
                                value={user.locationName} 
                            />
                            <InfoRow 
                                icon={<Storefront size={22} color="#10B981" weight="duotone" />} 
                                label="Magasin par défaut" 
                                value={user.magasinNom} 
                                isLast
                            />
                        </View>

                        {/* Carte Contact */}
                        <View style={DesignStyles.card}>
                            <SectionHeader title="Coordonnées" />
                            <InfoRow 
                                icon={<At size={22} color="#EC4899" weight="duotone" />} 
                                label="Email professionnel" 
                                value={user.email} 
                                isLast
                            />
                        </View>
                        
                        {/* Bouton Déconnexion - Design "Danger Zone" mais propre */}
                        <TouchableOpacity
                            style={DesignStyles.logoutButton}
                            onPress={logout}
                            activeOpacity={0.8}
                            accessibilityLabel="Se déconnecter"
                        >
                            <View style={DesignStyles.logoutIconWrapper}>
                                <SignOut size={20} color="#EF4444" weight="bold" />
                            </View>
                            <Text style={DesignStyles.logoutText}>Se déconnecter</Text>
                            <CaretRight size={16} color="#EF4444" weight="bold" />
                        </TouchableOpacity>

                        <Text style={DesignStyles.versionText}>Version 1.0.2</Text>
                    </View>
                </ScrollView>
            </SafeAreaView>
        </View>
    </ImageBackground>
  );
}

// --- STYLE GOD TIER ---
const DesignStyles = StyleSheet.create({
    background: {
        flex: 1,
        width: '100%',
    },
    overlay: {
        flex: 1,
        // Même fond "Ice White" que l'accueil pour la transition fluide
        backgroundColor: 'rgba(248, 250, 252, 0.95)', 
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorText: {
        fontSize: 16,
        color: '#64748B',
    },

    // --- HEADER ---
    headerContainer: {
        alignItems: 'center',
        paddingTop: Spacing.xl,
        paddingBottom: Spacing.lg,
    },
    avatarWrapper: {
        marginBottom: Spacing.md,
        position: 'relative',
    },
    avatarShadow: {
        // Effet de profondeur sous l'avatar
        shadowColor: "#4F46E5",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 20,
        elevation: 10,
        backgroundColor: '#fff',
        borderRadius: 100,
        padding: 4, // Bordure blanche autour de l'icone
    },
    statusBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: '#10B981', // Vert connecté
        borderRadius: 12,
        width: 28,
        height: 28,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: '#F8FAFC', // Couleur du fond pour détacher le badge
    },
    userName: {
        fontSize: 26,
        fontWeight: '800',
        color: '#1E293B',
        marginBottom: 2,
    },
    userHandle: {
        fontSize: 14,
        color: '#64748B',
        fontWeight: '500',
        marginBottom: Spacing.md,
    },
    roleBadge: {
        backgroundColor: '#EEF2FF', // Indigo très clair
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#E0E7FF',
    },
    roleText: {
        color: '#4F46E5',
        fontWeight: '700',
        fontSize: 12,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },

    // --- CONTENU ---
    contentContainer: {
        paddingHorizontal: Spacing.lg,
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: Spacing.lg,
        marginBottom: Spacing.lg,
        // Ombres sophistiquées
        shadowColor: "#64748B",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.06,
        shadowRadius: 12,
        elevation: 3,
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    sectionHeader: {
        marginBottom: Spacing.md,
    },
    sectionTitle: {
        fontSize: 13,
        fontWeight: '700',
        color: '#94A3B8',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },

    // --- INFO ROW ---
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
    },
    infoRowBorder: {
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    iconContainer: {
        width: 44,
        height: 44,
        borderRadius: 14,
        backgroundColor: '#F8FAFC', // Gris très clair
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: Spacing.md,
    },
    infoContent: {
        flex: 1,
    },
    infoLabel: {
        fontSize: 12,
        color: '#64748B',
        marginBottom: 2,
    },
    infoValue: {
        fontSize: 15,
        color: '#0F172A',
        fontWeight: '600',
    },

    // --- LOGOUT BUTTON ---
    logoutButton: {
        backgroundColor: '#FEF2F2', // Rouge très clair
        borderRadius: 16,
        padding: Spacing.md,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#FEE2E2',
        marginBottom: Spacing.xl,
    },
    logoutIconWrapper: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: Spacing.md,
    },
    logoutText: {
        flex: 1,
        color: '#EF4444',
        fontSize: 16,
        fontWeight: '700',
    },
    versionText: {
        textAlign: 'center',
        color: '#CBD5E1',
        fontSize: 11,
        marginTop: -Spacing.md, // Remonte un peu
        marginBottom: Spacing.xl,
    }
});