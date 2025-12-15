import React, { useContext } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  ImageBackground, 
  StyleSheet, 
  Dimensions, 
  SafeAreaView, 
  StatusBar 
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from '../../contexts/AuthContext';
import { Truck, TrayArrowDown, Package, UserCircle, CaretRight } from "phosphor-react-native";
import { Colors, Spacing } from '../../styles/style'; 
import BackgroundImage from '../../assets/background.png'; 

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - (Spacing.lg * 2) - Spacing.md) / 2;

const modules = [
  { id: "declarationPalette", title: "Déclaration", icon: Package, screen: "DeclarationPalette", color: "#4F46E5", description: "Déclarer une palette" },
  { id: "deplacerPalette", title: "Enlèvement", icon: Truck, screen: "DeplacerPalette", color: "#F59E0B", description: "Scanner pour soulever" },
  { id: "receptionPalette", title: "Dépose", icon: TrayArrowDown, screen: "ReceptionPalette", color: "#10B981", description: "Scanner pour déposer" },
  { id: "profil", title: "Mon Profil", icon: UserCircle, screen: "Profil", color: "#EC4899", description: "Gérer mon compte" },
];

export default function HomeScreen() {
  const navigation = useNavigation();
  const { user } = useContext(AuthContext);

  return (
    <ImageBackground 
      source={BackgroundImage} 
      resizeMode="cover" 
      style={DesignStyles.background}
    >
      <View style={DesignStyles.overlay}>
        <SafeAreaView style={{ flex: 1 }}>
          <StatusBar barStyle="light-content" />
          
          <ScrollView 
            contentContainerStyle={{ flexGrow: 1, paddingBottom: Spacing.xl }}
            showsVerticalScrollIndicator={false}
          >
            {/* --- HEADER SECTION --- */}
            <View style={DesignStyles.headerContainer}>
              <View style={[DesignStyles.welcomeContainer, { marginTop: 80 }]}>
                <Text style={DesignStyles.welcomeLabel}>Bonjour,</Text>
                <Text style={DesignStyles.userName}>{user?.name || "Utilisateur"}</Text>
                <Text style={DesignStyles.subtitle}>Que voulez-vous faire aujourd'hui ?</Text>
              </View>
            </View>

            {/* --- GRID SECTION --- */}
            <View style={DesignStyles.gridContainer}>
              {modules.map((module) => (
                <TouchableOpacity
                  key={module.id}
                  style={DesignStyles.card}
                  onPress={() => navigation.navigate(module.screen as never)}
                  activeOpacity={0.9}
                >
                  {/* Header de la carte avec l'icône centrée */}
                  <View style={[DesignStyles.iconBubble, { backgroundColor: module.color + '15' }]}>
                    <module.icon size={32} color={module.color} weight="fill" />
                  </View>

                  {/* Textes centrés */}
                  <View style={DesignStyles.textContainer}>
                    <Text style={DesignStyles.cardTitle}>{module.title}</Text>
                    <Text style={DesignStyles.cardDesc} numberOfLines={2}>{module.description}</Text>
                  </View>

                  {/* Indicateur d'action (Flèche seule) centré */}
                  <View style={DesignStyles.actionRow}>
                    <CaretRight size={16} color={module.color} weight="bold" />
                  </View>
                </TouchableOpacity>
              ))}
            </View>

          </ScrollView>
        </SafeAreaView>
      </View>
    </ImageBackground>
  );
}

const DesignStyles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
  },
  headerContainer: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  welcomeContainer: {
    marginBottom: Spacing.lg,
  },
  welcomeLabel: {
    fontSize: 16,
    color: '#64748B', 
    fontWeight: '500',
  },
  userName: {
    fontSize: 32, 
    fontWeight: '800',
    color: '#1E293B',
    letterSpacing: -0.5,
    marginTop: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#94A3B8',
    marginTop: 4,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
  },
  card: {
    width: CARD_WIDTH,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingVertical: Spacing.xl, // Espace vertical augmenté pour l'équilibre
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.md,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    justifyContent: 'space-between',
    alignItems: 'center', // Centre tout le contenu horizontalement
    minHeight: 180, 
  },
  iconBubble: {
    width: 56, 
    height: 56,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  textContainer: {
    flex: 1,
    alignItems: 'center', // Centre les textes dans leur conteneur
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 6,
    textAlign: 'center', // Centre le texte du titre
  },
  cardDesc: {
    fontSize: 13,
    color: '#94A3B8',
    textAlign: 'center', // Centre le texte de description
    lineHeight: 18,
  },
  actionRow: {
    marginTop: Spacing.md,
    justifyContent: 'center', // Centre la flèche horizontalement
    alignItems: 'center',
    width: '100%',
  },
});