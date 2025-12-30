import React, { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, FlatList, Linking, ActivityIndicator, Modal } from 'react-native';
import { supabase } from '../../src/lib/supabase';
import { SafeAreaView } from 'react-native-safe-area-context';

// Mapeo de imágenes de ayuntamientos
const townHallImages = {
    3: require('../../assets/townhalls/level3.webp'),
    4: require('../../assets/townhalls/level4.webp'),
    5: require('../../assets/townhalls/level5.webp'),
    6: require('../../assets/townhalls/level6.webp'),
    7: require('../../assets/townhalls/level7.webp'),
    8: require('../../assets/townhalls/level8.webp'),
    9: require('../../assets/townhalls/level9.webp'),
    10: require('../../assets/townhalls/level10.webp'),
    11: require('../../assets/townhalls/level11.webp'),
    12: require('../../assets/townhalls/level12.webp'),
    13: require('../../assets/townhalls/level13.webp'),
    14: require('../../assets/townhalls/level14.webp'),
    15: require('../../assets/townhalls/level15.webp'),
    16: require('../../assets/townhalls/level16.webp'),
    17: require('../../assets/townhalls/level17.webp'),
    18: require('../../assets/townhalls/level18.webp'),
};

export default function BasesScreen() {
    // Generar array de ayuntamientos del 3 al 18
    const townHalls = Array.from({ length: 16 }, (_, i) => i + 3);
    // Estado para nivel seleccionado
    const [selectedLevel, setSelectedLevel] = useState(null);
    const [selectedType, setSelectedType] = useState('Todos');
    const [bases, setBases] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);

    const filterOptions = ['Todos', 'Guerra', 'Liga', 'Mejora', 'Recursos'];

    useEffect(() => {
        if (selectedLevel) {
            fetchBases();
        }
    }, [selectedLevel]);

    const fetchBases = async () => {
        setLoading(true);
        try {
            let query = supabase
                .from('bases')
                .select('*')
                .eq('level_th', selectedLevel);

            // Removed server-side filtering by type to allow client-side filtering
            // if (selectedType !== 'Todos') {
            //     query = query.eq('type', selectedType);
            // }

            const { data, error } = await query;

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
                    <TouchableOpacity
                        style={[styles.actionButton, styles.detailsButton]}
                        onPress={() => setModalVisible(true)}
                    >
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
                onPress={() => {
                    setSelectedLevel(level);
                    setSelectedType('Todos'); // Reset filter when changing level
                }}
            >
                <View style={styles.cardContent}>
                    {/* Imagen del ayuntamiento */}
                    <View style={styles.imageContainer}>
                        <Image
                            source={townHallImages[level]}
                            style={styles.townHallImage}
                            resizeMode="contain"
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
                <View>
                    <View style={styles.headerSelected}>
                        <TouchableOpacity onPress={() => setSelectedLevel(null)} style={styles.backButton}>
                            <Ionicons name="arrow-back" size={24} color="#facc15" />
                        </TouchableOpacity>
                        <Text style={styles.headerTitleSelected}>Nivel {selectedLevel}</Text>
                        <View style={{ width: 24 }} />
                    </View>
                    {/* Filtros */}
                    <View style={styles.filterContainer}>
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.filterContent}
                        >
                            {filterOptions.map((type) => (
                                <TouchableOpacity
                                    key={type}
                                    style={[
                                        styles.filterButton,
                                        selectedType === type && styles.filterButtonActive
                                    ]}
                                    onPress={() => setSelectedType(type)}
                                >
                                    <Text style={[
                                        styles.filterText,
                                        selectedType === type && styles.filterTextActive
                                    ]}>
                                        {type}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
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
                            data={bases.filter(base => selectedType === 'Todos' || base.type === selectedType)}
                            renderItem={renderBaseItem}
                            keyExtractor={item => item.id.toString()}
                            contentContainerStyle={styles.basesList}
                            showsVerticalScrollIndicator={false}
                            ListEmptyComponent={
                                <Text style={styles.emptyText}>
                                    {selectedType === 'Todos'
                                        ? "No hay bases disponibles para este nivel."
                                        : "No hay bases disponibles para este filtro."}
                                </Text>
                            }
                        />
                    )}
                </View>
            )}
            {/* Modal de En Desarrollo */}
            <Modal
                transparent={true}
                visible={modalVisible}
                animationType="fade"
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalEmoji}>👨‍💻</Text>
                        <Text style={styles.modalTitle}>En desarrollo</Text>
                        <Text style={styles.modalMessage}>Estamos trabajando en esta funcionalidad.</Text>
                        <TouchableOpacity
                            style={styles.modalButton}
                            onPress={() => setModalVisible(false)}
                        >
                            <Text style={styles.modalButtonText}>Entendido</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
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
        height: 160, // Fixed height instead of aspect ratio
        backgroundColor: '#2a2a2a',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 10, // Add padding to prevent edge touching
        borderBottomWidth: 2,
        borderBottomColor: '#facc15',
    },
    townHallImage: {
        width: '100%',
        height: '100%',
    },
    cardFooter: {
        padding: 10,
        backgroundColor: '#1a1a1a',
    },
    townHallText: {
        color: '#facc15',
        fontSize: 16,
        textAlign: 'center',
        fontFamily: 'LilitaOne',
    },
    // Nuevo estilo para header cuando hay selección
    headerSelected: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 15,
        paddingTop: 15,
        paddingBottom: 15,
        backgroundColor: '#0a0a0a',
    },
    headerTitleSelected: {
        color: '#facc15',
        fontSize: 18,
        fontFamily: 'LilitaOne',
    },
    // Estilos para los filtros
    filterContainer: {
        backgroundColor: '#0a0a0a',
        paddingBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#333',
    },
    filterContent: {
        paddingHorizontal: 15,
        gap: 10,
    },
    filterButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#1a1a1a',
    },
    filterButtonActive: {
        backgroundColor: '#facc15',
        borderColor: '#facc15',
    },
    filterText: {
        color: '#999',
        fontFamily: 'LilitaOne',
        fontSize: 14,
    },
    filterTextActive: {
        color: '#000',
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
        paddingTop: 15,
        paddingLeft: 15,
        paddingRight: 15,
    },
    baseCard: {
        backgroundColor: '#1a1a1a',
        borderRadius: 12,
        marginBottom: 15,
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
        fontSize: 16,
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
        fontSize: 16,
    },
    // Estilos del Modal
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: '#1a1a1a',
        borderRadius: 20,
        padding: 15,
        alignItems: 'center',
        width: '80%',
    },
    modalEmoji: {
        fontSize: 50,
        marginBottom: 15,
    },
    modalTitle: {
        color: '#facc15',
        fontSize: 28,
        fontFamily: 'LilitaOne',
        marginBottom: 5,
    },
    modalMessage: {
        color: '#ffffffff',
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 15,
        fontFamily: 'LilitaOne',
    },
    modalButton: {
        backgroundColor: '#facc15',
        paddingHorizontal: 30,
        paddingVertical: 12,
        borderRadius: 25,
    },
    modalButtonText: {
        color: '#000',
        fontSize: 14,
        fontFamily: 'LilitaOne',
    },
});
