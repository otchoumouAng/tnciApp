import React, { useState, useEffect } from 'react';
import { View, Text, Button, ScrollView, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { FadersHorizontal, CaretUp, CaretDown, CalendarBlank } from 'phosphor-react-native';
import * as apiService from '../../Shared/route';
import { Styles, Colors } from '../../../styles/style';

export interface LotFilters {
  magasinID?: string;
  campagneID?: string;
  exportateurID?: string;
  produitID?: string;
  typeLotID?: string;
  certificationID?: string;
  gradeID?: string;
  siteID?: string;
  // Champs pour les deux modes de date
  dateDebut?: string;
  dateFin?: string;
  endDate?: string; // Pour le mode date unique
}

interface FiltreProps {
  activeFilters: LotFilters; // ## NOUVELLE PROP ##
  onFilterChange: (filters: LotFilters) => void;
  onReset: () => void;
  showDateFilters?: boolean;
  showSiteFilter?: boolean;
  dateMode?: 'range' | 'single';
}

const Filtre: React.FC<FiltreProps> = ({
  activeFilters, // Destructurer la nouvelle prop
  onFilterChange,
  onReset,
  showDateFilters = true,
  showSiteFilter = true,
  dateMode = 'range'
}) => {
  // L'état interne est maintenant initialisé et synchronisé avec les props
  const [filters, setFilters] = useState<LotFilters>(activeFilters);

  // ## NOUVEAU HOOK ## : Synchronise l'état interne si les filtres actifs changent
  useEffect(() => {
    setFilters(activeFilters);
  }, [activeFilters]);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [dropdownsLoaded, setDropdownsLoaded] = useState<boolean>(false);
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
  // Le type est étendu pour inclure 'endDate'
  const [datePickerTarget, setDatePickerTarget] = useState<'dateDebut' | 'dateFin' | 'endDate' | null>(null);

  const [campagnes, setCampagnes] = useState<string[]>([]);
  const [exportateurs, setExportateurs] = useState<any[]>([]);
  const [produits, setProduits] = useState<any[]>([]);
  const [lotTypes, setLotTypes] = useState<any[]>([]);
  const [certifications, setCertifications] = useState<any[]>([]);
  const [grades, setGrades] = useState<any[]>([]);
  const [sites, setSites] = useState<any[]>([]);

  useEffect(() => {
    const loadDropdownData = async () => {
      try {
        setCampagnes(await apiService.getCampagnes());
        setExportateurs(await apiService.getExportateurs());
        setProduits(await apiService.getProduits()); 
        setLotTypes(await apiService.getLotTypes());
        setCertifications(await apiService.getCertifications());
        setGrades(await apiService.getGrades()); 
        if (showSiteFilter) {
            setSites(await apiService.getSites());
        }
        setDropdownsLoaded(true);
      } catch (error) {
        console.error("Failed to load filter data", error);
      }
    };
    if (isExpanded && !dropdownsLoaded) {
        loadDropdownData();
    }
  }, [isExpanded, dropdownsLoaded, showSiteFilter]);

  const handleValueChange = (name: keyof LotFilters, value: string | number) => {
    setFilters(prev => ({ ...prev, [name]: String(value) }));
  };

  const handleApplyFilters = () => {
    onFilterChange(filters);
    setIsExpanded(false);
  };

  const handleResetFilters = () => {
    setFilters({});
    onReset();
    setIsExpanded(false);
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate && datePickerTarget) {
      const formattedDate = selectedDate.toISOString().split('T')[0];
      handleValueChange(datePickerTarget, formattedDate);
    }
  };

  const showPickerFor = (target: 'dateDebut' | 'dateFin' | 'endDate') => {
    setDatePickerTarget(target);
    setShowDatePicker(true);
  };

  const renderPicker = (label: string, selectedValue: any, onValueChange: (value: any) => void, items: any[], labelKey: string, valueKey: string) => (
    <View style={Styles.filterPickerContainer}>
        <Text style={Styles.filterPickerLabel}>{label}</Text>
        <Picker
            selectedValue={selectedValue}
            onValueChange={onValueChange}
            style={Styles.filterPicker}
            mode="dropdown"
        >
            <Picker.Item label={`-- Tous les ${label.toLowerCase()} --`} value="" />
            {items.map(item => (
                <Picker.Item key={item[valueKey]} label={item[labelKey]} value={item[valueKey].toString()} />
            ))}
        </Picker>
    </View>
  );

  return (
    <View style={Styles.filterContainer}>
      <TouchableOpacity style={localStyles.header} onPress={() => setIsExpanded(!isExpanded)}>
        <View style={localStyles.headerLeft}>
          <FadersHorizontal size={24} color={Colors.darkGray} />
          <Text style={Styles.filterTitle}>Filtres</Text>
        </View>
        <View style={localStyles.headerRight}>
          <Text style={localStyles.toggleText}>{isExpanded ? 'Masquer' : 'Afficher'}</Text>
          {isExpanded ? <CaretUp size={20} color={Colors.primary} /> : <CaretDown size={20} color={Colors.primary} />}
        </View>
      </TouchableOpacity>

      {isExpanded && (
        <ScrollView>
          <View style={Styles.filterPickerContainer}>
              <Text style={Styles.filterPickerLabel}>Campagnes</Text>
              <Picker selectedValue={filters.campagneID} onValueChange={(val) => handleValueChange('campagneID', val)} style={Styles.filterPicker} mode="dropdown">
                  <Picker.Item label="-- Toutes les campagnes --" value="" />
                  {campagnes.map(c => <Picker.Item key={c} label={c} value={c} />)}
              </Picker>
          </View>

          {renderPicker("Exportateurs", filters.exportateurID, (val) => handleValueChange('exportateurID', val), exportateurs, 'nom', 'id')}
          {renderPicker("Produits", filters.produitID, (val) => handleValueChange('produitID', val), produits, 'designation', 'id')}
          {renderPicker("Types de Lot", filters.typeLotID, (val) => handleValueChange('typeLotID', val), lotTypes, 'designation', 'id')}
          {renderPicker("Certifications", filters.certificationID, (val) => handleValueChange('certificationID', val), certifications, 'designation', 'id')}
          {renderPicker("Grades", filters.gradeID, (val) => handleValueChange('gradeID', val), grades, 'designation', 'id')}
          
          {showSiteFilter && renderPicker("Sites", filters.siteID, (val) => handleValueChange('siteID', val), sites, 'nom', 'id')}

          {/* ## MODIFICATION ## : Affichage conditionnel des dates */}
          {showDateFilters && dateMode === 'range' && (
            <>
              <View style={Styles.filterPickerContainer}>
                <Text style={Styles.filterPickerLabel}>Date de début</Text>
                <TouchableOpacity style={[Styles.filterInput, localStyles.dateButtonContainer]} onPress={() => showPickerFor('dateDebut')}>
                    <View style={localStyles.dateButtonContent}>
                      <CalendarBlank size={20} color={Colors.darkGray} />
                      <Text style={localStyles.dateText}>
                          {filters.dateDebut || "Sélectionner une date"}
                      </Text>
                    </View>
                </TouchableOpacity>
              </View>
              <View style={Styles.filterPickerContainer}>
                <Text style={Styles.filterPickerLabel}>Date de fin</Text>
                <TouchableOpacity style={[Styles.filterInput, localStyles.dateButtonContainer]} onPress={() => showPickerFor('dateFin')}>
                    <View style={localStyles.dateButtonContent}>
                      <CalendarBlank size={20} color={Colors.darkGray} />
                      <Text style={localStyles.dateText}>
                          {filters.dateFin || "Sélectionner une date"}
                      </Text>
                    </View>
                </TouchableOpacity>
              </View>
            </>
          )}

          {showDateFilters && dateMode === 'single' && (
             <View style={Styles.filterPickerContainer}>
              <Text style={Styles.filterPickerLabel}>Date d'arrêté</Text>
              <TouchableOpacity style={[Styles.filterInput, localStyles.dateButtonContainer]} onPress={() => showPickerFor('endDate')}>
                  <View style={localStyles.dateButtonContent}>
                    <CalendarBlank size={20} color={Colors.darkGray} />
                    <Text style={localStyles.dateText}>{filters.endDate || "Sélectionner une date"}</Text>
                  </View>
              </TouchableOpacity>
            </View>
          )}

          <View style={Styles.filterButtonContainer}>
            <Button title="Réinitialiser" onPress={handleResetFilters} color={Colors.secondary} />
            <Button title="RAFRAICHIR" onPress={handleApplyFilters} color={Colors.primary}/>
          </View>
        </ScrollView>
      )}

      {showDatePicker && (
        <DateTimePicker
          value={datePickerTarget && filters[datePickerTarget] ? new Date(filters[datePickerTarget]!) : new Date()}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleDateChange}
        />
      )}
    </View>
  );
};

const localStyles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingBottom: 10,
        marginBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: Colors.lightGray,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    toggleText: {
        marginRight: 5,
        color: Colors.primary,
        fontWeight: 'bold',
    },
    dateButtonContainer: {
        justifyContent: 'center'
    },
    dateButtonContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    dateText: {
        marginLeft: 10,
        color: '#333',
    }
});

export default Filtre;