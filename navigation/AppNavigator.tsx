import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { House, User, Gear, Users, Package, ShoppingCart } from 'phosphor-react-native';
import HomeScreen from '../modules/Home/HomeScreen';
import SettingsScreen from '../modules/Settings/SettingsScreen';
import ProfileScreen from '../modules/Profil/ProfileScreen';
import MouvementStockScreen from '../modules/MouvementStock/MouvementStockScreen';
import EntreScreen from '../modules/Entre/EntreScreen';
import SortieScreen from '../modules/Sortie/SortieScreen';
import TransfertScreen from '../modules/Sortie/TransfertScreen';
import ReceptionScreen from '../modules/Entre/ReceptionScreen';
import StockScreen from '../modules/Stock/StockScreen';
import DeclarationPaletteScreen from '../modules/DeclarationPalette/DeclarationPaletteScreen';
// import Palette from '../screens/Palette';
// import OrderPlaceholder from '../screens/OrderPlaceholder';
import { Colors } from '../styles/style';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function HomeStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="HomeMain" 
        component={HomeScreen} 
        options={{ headerTitle: 'Digital Commodity Sourcing' }}
      />
      <Stack.Screen
        name="MouvementStock"
        component={MouvementStockScreen}
        options={{ headerTitle: 'Mouvement' }}
      />
      <Stack.Screen
        name="Entre"
        component={EntreScreen}
        options={{ headerTitle: 'Entrée de Lots' }}
      />
      <Stack.Screen
        name="Sortie"
        component={SortieScreen}
        options={{ headerTitle: 'Sortie de Lots' }}
      />
      <Stack.Screen
        name="Transfert"
        component={TransfertScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="ReceptionScreen" 
        component={ReceptionScreen} 
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="Stock"
        component={StockScreen}
        options={{ headerTitle: 'Stock' }}
      />
      <Stack.Screen
        name="DeclarationPalette"
        component={DeclarationPaletteScreen}
        options={{ headerTitle: 'Déclaration Palette' }}
      />
      
    </Stack.Navigator>
  );
}

// Composant pour les icônes de tab
const TabBarIcon = ({ icon: Icon, color, size }: { icon: React.ComponentType<any>, color: string, size: number }) => {
  return <Icon size={size} color={color} />;
};

export default function AppNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let IconComponent: React.ComponentType<any>;
          
          if (route.name === 'Accueil') IconComponent = House;
          else if (route.name === 'Profil') IconComponent = User;
          else if (route.name === 'Paramètres') IconComponent = Gear;
          else IconComponent = House;
          
          return <TabBarIcon icon={IconComponent} color={color} size={size} />;
        },
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.secondary,
      })}
    >
      <Tab.Screen 
        name="Accueil" 
        component={HomeStack} 
        options={{ headerShown: false }} 
      />
      <Tab.Screen 
        name="Paramètres" 
        component={SettingsScreen} 
        listeners={{
          tabPress: (e) => {
            e.preventDefault(); // ⛔ empêche la navigation
            console.log('En cours de développement', 'Ce module sera disponible prochainement.');
          },
        }}
      />
      <Tab.Screen 
        name="Profil" 
        component={ProfileScreen} 
      />
    </Tab.Navigator>
  );
}