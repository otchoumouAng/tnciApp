import React, { useContext } from 'react';
import { View } from 'react-native';
import { AuthContext } from '../../contexts/AuthContext';
import LoginForm from '../Auth/components/LoginForm';
import { Styles } from '../../styles/style';

export default function LoginScreen() {
  const { login, isLoading } = useContext(AuthContext);

  return (
    <View style={Styles.container}>
      <LoginForm onLogin={(username, password) => login({ username, password })} isLoading={isLoading} />
    </View>
  );
}