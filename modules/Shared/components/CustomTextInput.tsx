// Fichier: modules/Shared/components/CustomTextInput.tsx

import React from 'react';
import { View, TextInput, Text, StyleSheet, TextInputProps } from 'react-native';
// On importe uniquement Colors pour les couleurs du texte saisi, le reste est défini localement.
import { Colors } from '../../../styles/style'; 

interface CustomTextInputProps extends TextInputProps {
  placeholder: string;
}

const CustomTextInput = (props: CustomTextInputProps) => {
  const { placeholder, value, style, multiline, ...otherProps } = props;
  
  const containerStyle = multiline ? [styles.container, styles.multilineContainer] : styles.container;
  const inputStyle = multiline ? [styles.input, styles.multilineInput] : styles.input;

  return (
    <View style={[containerStyle, style]}>
      {!value && (
        <Text style={styles.placeholderText} numberOfLines={1}>
          {placeholder}
        </Text>
      )}
      
      <TextInput
        {...otherProps}
        value={value}
        multiline={multiline}
        style={inputStyle}
        underlineColorAndroid="transparent"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 50,
    backgroundColor: '#fff',
    // ## CORRECTION COULEUR ## : Une bordure gris clair, discrète et standard.
    borderColor: '#E3E3E3', 
    borderWidth: 1,
    borderRadius: 5,
    width: '100%',
    marginBottom: 15,
    justifyContent: 'center',
  },
  multilineContainer: {
    height: 100,
    justifyContent: 'flex-start',
  },
  input: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 15,
    right: 15,
    color: Colors.dark, // La couleur du texte saisi reste foncée
    fontSize: 16,
    backgroundColor: 'transparent',
  },
  multilineInput: {
    textAlignVertical: 'top',
    paddingTop: 15,
  },
  placeholderText: {
    position: 'absolute',
    left: 15,
    right: 15,
    fontSize: 16,
    // ## CORRECTION COULEUR ## : Une couleur de placeholder plus douce, non agressive.
    color: '#999999', 
    pointerEvents: 'none',
  },
});

export default CustomTextInput;