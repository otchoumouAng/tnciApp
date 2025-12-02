import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, Image } from 'react-native';
import { Styles, Colors, Spacing, Typography } from '../../../styles/style';
import Toast from 'react-native-toast-message';
import { Envelope, Lock, Eye, EyeSlash } from 'phosphor-react-native';

import Logo from '../../../assets/plant.png';

interface LoginFormProps {
  onLogin: (username: string, password: string) => Promise<void>;
  isLoading: boolean;
}

export default function LoginForm({ onLogin, isLoading }: LoginFormProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async () => {
    if (!username || !password) {
      Toast.show({
        type: 'error',
        text1: 'Erreur',
        text2: 'Veuillez remplir tous les champs',
      });
      return;
    }

    try {
      await onLogin(username, password);
    } catch (error) {
      // Gestion d'erreur déjà faite dans le contexte
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <ScrollView 
        contentContainerStyle={{ 
          flexGrow: 1, 
          justifyContent: 'center',
          backgroundColor: Colors.background,
          padding: Spacing.lg
        }}
      >
        <View style={{ alignItems: 'center', marginBottom: Spacing.xl }}>
          {/* Logo ou icône d'application */}
          
        <Image 
			  source={Logo} 
			  style={{ 
			    width: 140, 
			    height: 140, 
			    marginBottom: Spacing.lg,
			  }} 
			  resizeMode="contain"
			/>
          
          <Text style={[Typography.h1, { color: '#9C1D37', marginBottom: Spacing.sm }]}>
            Bienvenue
          </Text>
         
        </View>

        <View style={{
          backgroundColor: Colors.card,
          borderRadius: 16,
          padding: Spacing.lg,
          shadowColor: "#000",
          shadowOffset: {
            width: 0,
            height: 2,
          },
          shadowOpacity: 0.1,
          shadowRadius: 3.84,
          elevation: 5,
        }}>
          {/* Champ Nom d'utilisateur */}
          <View style={{ marginBottom: Spacing.lg }}>
            <Text style={[Typography.body, { marginBottom: Spacing.sm, fontWeight: '600' }]}>
              Nom d'utilisateur
            </Text>
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              borderWidth: 1,
              borderColor: Colors.border,
              borderRadius: 8,
              paddingHorizontal: Spacing.sm,
            }}>
              <Envelope size={20} color={Colors.secondary} style={{ marginRight: Spacing.sm }} />
              <TextInput
                style={{ flex: 1, padding: Spacing.sm, color: Colors.text }}
                placeholder="Votre nom d'utilisateur"
                value={username}
                onChangeText={setUsername}
                accessibilityLabel="Nom d'utilisateur"
                autoCapitalize="none"
                placeholderTextColor={Colors.secondary}
              />
            </View>
          </View>

          {/* Champ Mot de passe */}
          <View style={{ marginBottom: Spacing.xl }}>
            <Text style={[Typography.body, { marginBottom: Spacing.sm, fontWeight: '600' }]}>
              Mot de passe
            </Text>
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              borderWidth: 1,
              borderColor: Colors.border,
              borderRadius: 8,
              paddingHorizontal: Spacing.sm,
            }}>
              <Lock size={20} color={Colors.secondary} style={{ marginRight: Spacing.sm }} />
              <TextInput
                style={{ flex: 1, padding: Spacing.sm, color: Colors.text }}
                placeholder="Votre mot de passe"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                accessibilityLabel="Mot de passe"
                placeholderTextColor={Colors.secondary}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                {showPassword ? (
                  <EyeSlash size={20} color={Colors.secondary} />
                ) : (
                  <Eye size={20} color={Colors.secondary} />
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Bouton de connexion */}
          <TouchableOpacity
            style={[Styles.buttonPrimary, {
              borderRadius: 8,
              padding: Spacing.md,
              opacity: isLoading ? 0.7 : 1,
            }]}
            onPress={handleSubmit}
            disabled={isLoading}
            accessibilityLabel="Se connecter"
          >
            {isLoading ? (
              <ActivityIndicator color={Colors.card} />
            ) : (
              <Text style={[Styles.textButton, { fontWeight: '600' }]}>Se connecter</Text>
            )}
          </TouchableOpacity>

        </View>

        {/* Information de copyright */}
        <Text style={{ 
          textAlign: 'center', 
          color: Colors.primary,
          fontSize: 12,
          marginTop: Spacing.xl
        }}>
          © 2025 ODMTEC. Tous droits réservés.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}