import React, { useState, useEffect } from 'react';
import { View, Text, Button, TouchableOpacity, StyleSheet, Platform, ActivityIndicator } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { CalendarBlank } from 'phosphor-react-native';
import * as apiService from '../../Shared/route';
import { Styles, Colors } from '../../../styles/style';

export interface MouvementStockFilters {
    dateDebut?: string;
    dateFin?: string;
    magasinID?: string;
    exportateurID?: string;
    campagneID?: string;
    mouvementTypeID?: string;
    sens?: string;
}

interface MouvementStockFilterProps {
    filters: MouvementStockFilters;
    onReset: () => void;
    onApply: (filters: MouvementStockFilters) => void;
}

const MouvementStockFilter: React.FC<MouvementStockFilterProps> = ({ filters, onReset, onApply }) => {
    // COMPOSANT SIMPLIFIÉ : Plus de gestion d'accordéon interne
    const [dropdownsLoaded, setDropdownsLoaded] = useState<boolean>(false);
    const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
    const [datePickerTarget, setDatePickerTarget] = useState<'dateDebut' | 'dateFin' | null>(null);

    const [localFilters, setLocalFilters] = useState<MouvementStockFilters>(filters);

    const [exportateurs, setExportateurs] = useState<any[]>([]);
    const [types, setTypes] = useState<any[]>([]);
    const [campagnes, setCampagnes] = useState<string[]>([]);

    // Synchronise l'état local si les filtres parents changent (ex: après un Reset)
    useEffect(() => {
        setLocalFilters(filters);
    }, [filters]);

    // Chargement des données au montage du composant
    useEffect(() => {
        const loadDropdownData = async () => {
            try {
                const [exps, typs, camps] = await Promise.all([
                    apiService.getExportateurs(),
                    apiService.getMouvementStockTypes(),
                    apiService.getCampagnes()
                ]);
                setExportateurs(exps);
                setTypes(typs);
                setCampagnes(camps);
            } catch (error) {
                console.error("Failed to load filter data", error);
            } finally {
                setDropdownsLoaded(true);
            }
        };

        if (!dropdownsLoaded) {
            loadDropdownData();
        }
    }, [dropdownsLoaded]);

    const handleLocalValueChange = (name: keyof MouvementStockFilters, value: any) => {
        setLocalFilters(prev => ({ ...prev, [name]: value }));
    };

    const handleApply = () => {
        onApply(localFilters);
    };

    const handleDateChange = (event: any, selectedDate?: Date) => {
        setShowDatePicker(Platform.OS === 'ios');
        if (selectedDate && datePickerTarget) {
            const formattedDate = selectedDate.toISOString().split('T')[0];
            handleLocalValueChange(datePickerTarget, formattedDate);
        }
        setDatePickerTarget(null);
        setShowDatePicker(false);
    };

    const showPickerFor = (target: 'dateDebut' | 'dateFin') => {
        setDatePickerTarget(target);
        setShowDatePicker(true);
    };

    const renderPicker = (label: string, selectedValue: any, onValueChangeCallback: (value: any) => void, items: any[], labelKey: string, valueKey: string) => (
        <View style={Styles.filterPickerContainer}>
            <Text style={Styles.filterPickerLabel}>{label}</Text>
            <Picker
                selectedValue={selectedValue}
                onValueChange={onValueChangeCallback}
                mode="dropdown"
            >
                <Picker.Item label={`Tous`} value="" style={{ color: '#999999' }} />
                {items.map(item => (
                    <Picker.Item key={item[valueKey]} label={item[labelKey]} value={item[valueKey].toString()} />
                ))}
            </Picker>
        </View>
    );

    return (
        <View style={localStyles.contentContainer}>
            {!dropdownsLoaded ? (
                <ActivityIndicator size="small" color={Colors.primary} style={localStyles.loader} />
            ) : (
                <>
                    {renderPicker("Exportateurs", localFilters.exportateurID, (val) => handleLocalValueChange('exportateurID', val), exportateurs, 'nom', 'id')}
                    {renderPicker("Types", localFilters.mouvementTypeID, (val) => handleLocalValueChange('mouvementTypeID', val), types, 'designation', 'id')}

                    <View style={Styles.filterPickerContainer}>
                        <Text style={Styles.filterPickerLabel}>Sens</Text>
                        <Picker selectedValue={localFilters.sens} onValueChange={(val) => handleLocalValueChange('sens', val)} mode="dropdown">
                            <Picker.Item label="Tous" value="" style={{ color: '#999999' }} />
                            <Picker.Item label="Entrée" value="1" />
                            <Picker.Item label="Sortie" value="-1" />
                        </Picker>
                    </View>
                    
                    <View style={Styles.filterPickerContainer}>
                        <Text style={Styles.filterPickerLabel}>Campagnes</Text>
                        <Picker selectedValue={localFilters.campagneID} onValueChange={(val) => handleLocalValueChange('campagneID', val)} mode="dropdown">
                            <Picker.Item label="Toutes" value="" style={{ color: '#999999' }} />
                            {campagnes.map(c => <Picker.Item key={c} label={c} value={c} />)}
                        </Picker>
                    </View>
                    
                    <View style={Styles.filterPickerContainer}>
                        <Text style={Styles.filterPickerLabel}>Date de début</Text>
                        <TouchableOpacity style={[Styles.filterInput, localStyles.dateButtonContainer]} onPress={() => showPickerFor('dateDebut')}>
                            <View style={localStyles.dateButtonContent}>
                                <CalendarBlank size={20} color={Colors.darkGray} />
                                <Text style={localStyles.dateText}>
                                    {localFilters.dateDebut || "Sélectionner une date"}
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
                                    {/* ## CORRECTION DU BUG ICI : Utilisation de localFilters.dateFin ## */}
                                    {localFilters.dateFin || "Sélectionner une date"}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    </View>

                    <View style={Styles.filterButtonContainer}>
                        <Button title="Réinitialiser" onPress={onReset} color={Colors.secondary} />
                        <Button title="Rafraichir" onPress={handleApply} color={Colors.primary} />
                    </View>
                </>
            )}

            {showDatePicker && (
                <DateTimePicker
                    value={datePickerTarget && localFilters[datePickerTarget] ? new Date(localFilters[datePickerTarget]!) : new Date()}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={handleDateChange}
                />
            )}
        </View>
    );
};

const localStyles = StyleSheet.create({
    contentContainer: {
        paddingHorizontal: 16,
        paddingVertical: 8
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
    },
    loader: {
        paddingVertical: 32,
    }
});

export default MouvementStockFilter;
