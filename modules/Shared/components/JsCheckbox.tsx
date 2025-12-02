import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Check } from 'phosphor-react-native';
import { Colors } from '../../../styles/style';

interface JsCheckboxProps {
  value: boolean;
  onValueChange: (newValue: boolean) => void;
  label?: string;
  disabled?: boolean;
}

const JsCheckbox: React.FC<JsCheckboxProps> = ({ value, onValueChange, label, disabled = false }) => {
  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={() => onValueChange(!value)}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <View style={[styles.box, value && styles.boxChecked, disabled && styles.boxDisabled]}>
        {value && <Check size={16} color="#ffffff" weight="bold" />}
      </View>
      {label && <Text style={[styles.label, disabled && styles.labelDisabled]}>{label}</Text>}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  box: {
    width: 22,
    height: 22,
    borderWidth: 2,
    borderColor: Colors.darkGray,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  boxChecked: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  boxDisabled: {
    backgroundColor: '#e9ecef',
    borderColor: '#ced4da',
  },
  label: {
    fontSize: 16,
    color: Colors.dark,
  },
  labelDisabled: {
    color: Colors.darkGray,
  }
});

export default JsCheckbox;