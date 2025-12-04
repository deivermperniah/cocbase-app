import React, { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, FlatList, Linking, ActivityIndicator } from 'react-native';
import { supabase } from '../../src/lib/supabase';
import { SafeAreaView } from 'react-native-safe-area-context';

// Mapeo de imágenes de ayuntamientos
const townHallImages = {
    3: require('../../assets/townhalls/level3.png'),
    4: require('../../assets/townhalls/level4.png'),
    5: require('../../assets/townhalls/level5.png'),
    6: require('../../assets/townhalls/level6.png'),
    7: require('../../assets/townhalls/level7.png'),
    8: require('../../assets/townhalls/level8.png'),
    9: require('../../assets/townhalls/level9.png'),
    10: require('../../assets/townhalls/level10.png'),
    11: require('../../assets/townhalls/level11.png'),
    12: require('../../assets/townhalls/level12.png'),
    13: require('../../assets/townhalls/level13.png'),
    14: require('../../assets/townhalls/level14.png'),
    15: require('../../assets/townhalls/level15.png'),
    16: require('../../assets/townhalls/level16.png'),
    17: require('../../assets/townhalls/level17.png'),
    18: require('../../assets/townhalls/level18.png'),
};

export default function BasesScreen() {
    // Generar array de ayuntamientos del 3 al 18
    const townHalls = Array.from({ length: 16 }, (_, i) => i + 3);
    // Estado para nivel seleccionado
    const [selectedLevel, setSelectedLevel] = useState(null);
    const [bases, setBases] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (selectedLevel) {
            fetchBases();
        }
    }, [selectedLevel]);

    const fetchBases = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('bases')
                .select('*')
                .eq('level_th', selectedLevel);

            if (error) throw error;
            setBases(data || []);
        } catch (error) {
            console.error('Error fetching bases:', error);
        } finally {
            setLoading(false);
        }
    };

    const renderBaseItem = ({ item }) => (
        <View style={styles.baseCard}>
            <Image
                source={{ uri: item.url_foto || 'https://via.placeholder.com/300' }}
                style={styles.baseImage}
                resizeMode="cover"
            />
            <View style={styles.baseInfo}>
                <View style={styles.typeContainer}>
                    <Ionicons name="pricetag" size={20} color="#facc15" />
                    <Text style={styles.baseType}>{item.type}</Text>
                </View>
                <View style={styles.baseButtons}>
                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => Linking.openURL(item.link)}
                    >
                        <Text style={styles.copyButtonText}>Copiar Base</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.actionButton, styles.detailsButton]}>
                        <Text style={styles.detailsButtonText}>Detalles</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );

    const renderTownHallCard = (level) => {
        return (
            <TouchableOpacity
                key={level}
                style={styles.card}
                activeOpacity={0.7}
                onPress={() => setSelectedLevel(level)}
            >
                <View style={styles.cardContent}>
                    {/* Imagen del ayuntamiento */}
                    <View style={styles.imageContainer}>
                        <Image
                            source={townHallImages[level]}
                            style={styles.townHallImage}
                            resizeMode="cover"
                        />
                    </View>

                    {/* Footer de la carta */}
                    <View style={styles.cardFooter}>
                        <Text style={styles.townHallText}>Nivel {level}</Text>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Header */}
            {selectedLevel !== null ? (
                <View style={styles.headerSelected}>
                    <TouchableOpacity onPress={() => setSelectedLevel(null)} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="#facc15" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitleSelected}>Nivel {selectedLevel}</Text>
                </View>
            ) : (
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Bases</Text>
                    <Text style={styles.headerSubtitle}>Selecciona tu nivel de ayuntamiento</Text>
                </View>
            )}

            {/* Content */}
            {selectedLevel === null ? (
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.grid}>
                        {townHalls.map(level => renderTownHallCard(level))}
                    </View>
                </ScrollView>
            ) : (
                <View style={styles.selectedContainer}>
                    {loading ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color="#facc15" />
                            <Text style={styles.loadingText}>Cargando...</Text>
                        </View>
                    ) : (
                        <FlatList
                            data={bases}
                            renderItem={renderBaseItem}
                            keyExtractor={item => item.id.toString()}
                            contentContainerStyle={styles.basesList}
                            ListEmptyComponent={
                                <Text style={styles.emptyText}>No hay bases disponibles para este nivel.</Text>
                            }
                        />
                    )}
                </View>
            )}
        </SafeAreaView >
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0a0a0a',
    },
    header: {
        paddingHorizontal: 15,
        paddingTop: 15,
        paddingBottom: 15,
        backgroundColor: '#0a0a0a',
        borderBottomWidth: 1,
        borderBottomColor: '#333',
    },
    headerTitle: {
        color: '#facc15',
        fontSize: 28,
        marginBottom: 5,
        fontFamily: 'LilitaOne',
    },
    headerSubtitle: {
        color: '#999',
        fontSize: 14,
        fontFamily: 'LilitaOne',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 15,
        paddingTop: 15,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    card: {
        width: '48%',
        marginBottom: 15,
        borderRadius: 12,
        backgroundColor: '#1a1a1a',
        overflow: 'hidden',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
    },
    cardContent: {
        width: '100%',
    },
    imageContainer: {
        width: '100%',
        aspectRatio: 1,
        backgroundColor: '#2a2a2a',
        justifyContent: 'center',
        alignItems: 'center',
        borderBottomWidth: 2,
        borderBottomColor: '#facc15',
    },
    townHallImage: {
        width: '100%',
        height: '100%',
    },
    cardFooter: {
        padding: 12,
        backgroundColor: '#1a1a1a',
    },
    townHallText: {
        color: '#facc15',
        fontSize: 18,
        textAlign: 'center',
        fontFamily: 'LilitaOne',
    },
    // Nuevo estilo para header cuando hay selección
    headerSelected: {
        flexDirection: 'row',
        alignItems: 'center',
        // keep space-between so back button stays left, title will be centered via flex
        justifyContent: 'space-between',
        paddingHorizontal: 15,
        paddingTop: 15,
        paddingBottom: 15,
        backgroundColor: '#0a0a0a',
        borderBottomWidth: 1,
        borderBottomColor: '#333',
    },

    // estilo para el título centrado en el header seleccionado
    headerTitleSelected: {
        flex: 1,
        textAlign: 'center',
        color: '#facc15',
        fontSize: 28,
        fontFamily: 'LilitaOne',
    },
    backButtonText: {
        color: '#facc15',
        fontFamily: 'LilitaOne',
        fontSize: 16,
    },
    // Contenedor y estilo para la vista del nivel seleccionado
    selectedContainer: {
        flex: 1,
        backgroundColor: '#0a0a0a',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        color: '#fff',
        marginTop: 10,
        fontFamily: 'LilitaOne',
        fontSize: 16,
    },
    basesList: {
        padding: 15,
    },
    baseCard: {
        backgroundColor: '#1a1a1a',
        borderRadius: 12,
        marginBottom: 20,
        overflow: 'hidden',
    },
    baseImage: {
        width: '100%',
        height: 200,
        backgroundColor: '#2a2a2a',
    },
    baseInfo: {
        padding: 15,
    },
    typeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
        gap: 8,
    },
    baseType: {
        color: '#fff',
        fontSize: 18,
        fontFamily: 'LilitaOne',
        textTransform: 'capitalize',
    },
    baseButtons: {
        flexDirection: 'row',
        gap: 10,
    },
    actionButton: {
        flex: 1,
        backgroundColor: '#facc15',
        paddingVertical: 10,
        borderRadius: 8,
        alignItems: 'center',
    },
    detailsButton: {
        backgroundColor: '#333',
    },
    copyButtonText: {
        color: '#000',
        fontFamily: 'LilitaOne',
        fontSize: 14,
    },
    detailsButtonText: {
        color: '#fff',
        fontFamily: 'LilitaOne',
        fontSize: 14,
    },
    emptyText: {
        color: '#999',
        textAlign: 'center',
        fontFamily: 'LilitaOne',
        fontSize: 18,
    },
});
