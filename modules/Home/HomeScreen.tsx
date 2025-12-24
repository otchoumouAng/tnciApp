import React, { useContext } from 'react';
// ImageBackground est importé ici
import { View, Text, TouchableOpacity, ScrollView, Image, ImageBackground } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from '../../contexts/AuthContext';
import { Users, Truck, TrayArrowDown, ArrowsLeftRight, Package, UserCircle } from "phosphor-react-native";
import { Styles, Colors, Spacing, Typography } from '../../styles/style';
import Logo from '../../assets/Logo.png';
// Vous avez importé votre image de fond (actuellement la même que le logo)
import BackgroundImage from '../../assets/background.png'; 



const modules = [
  { id: "declarationPalette", title: "Déclaration", icon: Package, screen: "DeclarationPalette" },
  { id: "deplacerPalette", title: "Enlèvement", icon: Truck, screen: "DeplacerPalette" },
  { id: "receptionPalette", title: "Dépose", icon: TrayArrowDown, screen: "ReceptionPalette" },
  { id: "profil", title: "Profil", icon: UserCircle, screen: "Profil" },
];

export default function HomeScreen() {
  const navigation = useNavigation();
  const { user } = useContext(AuthContext);

  return (
    // 1. Utilisez ImageBackground comme composant racine
    <ImageBackground 
      source={BackgroundImage} 
      resizeMode="cover" // "cover" remplit l'écran, "stretch" étire, etc.
      // 2. Appliquez le style du conteneur principal ici
      style={Styles.container} 
    >
      {/* 3. Placez le ScrollView à l'intérieur */}
      <ScrollView 
        // 4. Assurez-vous que le contenu du ScrollView peut grandir
        contentContainerStyle={{ flexGrow: 1 }}
      >
        {/* Le reste de votre contenu reste identique */}
        <View style={{ padding: Spacing.lg, borderBottomLeftRadius: 20, borderBottomRightRadius: 20 }}>
          <View style={{ alignItems: 'center', marginBottom: Spacing.md }}>
            <Image
              source={Logo}
              style={{ width: 150, height: 50, resizeMode: 'contain' }}
            />
          </View>
          <View style={{ alignItems: 'center' }}>
            <Text style={[Typography.h2, { color: Colors.textDark }]}>Bienvenue, {user?.name}!</Text>
            {/* Magasin removed as requested */}
          </View>
        </View>
        
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', marginTop: Spacing.lg }}>
          {modules.map((module) => (
            <TouchableOpacity
              key={module.id}
              style={[
                Styles.card, 
                { 
                  width: '40%', 
                  alignItems: 'center',
                  margin: Spacing.sm 
                }
              ]}
              onPress={() => navigation.navigate(module.screen as never)}
              accessibilityLabel={`Ouvrir le module ${module.title}`}
            >
              <module.icon size={32} color={Colors.primary} />
              <Text style={{ marginTop: Spacing.sm, textAlign: 'center' }}>
                {module.title}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </ImageBackground>
  );
}
