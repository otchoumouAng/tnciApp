import React from 'react';
import { View, Text } from 'react-native';
import { Styles, Spacing,Typography } from '../../styles/style';

export default function SettingsScreen() {
  return (
    <View style={[Styles.container, { padding: Spacing.lg }]}>
      <Text style={Typography.h2}>Paramètres</Text>
      <Text style={{ marginTop: Spacing.md }}>Page de paramètres en construction</Text>
    </View>
  );
}