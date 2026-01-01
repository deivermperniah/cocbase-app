import React, { useState, useEffect, useCallback } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, FlatList, Linking, ActivityIndicator, Modal, BackHandler, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '../../src/lib/supabase';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import ImageViewer from 'react-native-image-zoom-viewer';

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
    const [infoModalVisible, setInfoModalVisible] = useState(false);
    const [imageModalVisible, setImageModalVisible] = useState(false);
    const [selectedImageUrl, setSelectedImageUrl] = useState(null);
    const [selectedBase, setSelectedBase] = useState(null);
    const [zoomButtonsVisible, setZoomButtonsVisible] = useState(false);
    const [isOffline, setIsOffline] = useState(false);

    const filterOptions = ['Todos', 'Guerra', 'Liga', 'Mejora', 'Recursos'];

    const filterDescriptions = {
        'Guerra': 'Bases estratégicas para Guerras de Clanes, enfocadas en evitar que el rival consiga 3 estrellas.',
        'Liga': 'Bases competitivas para Liga de Guerra de Clanes, enfocadas en evitar que el rival consiga pleno.',
        'Mejora': 'Bases de progreso diseñadas para identificar fácilmente qué edificios necesitas mejorar.',
        'Recursos': 'Diseños de Farming optimizados para la máxima protección de tus almacenes de oro, elixir y oscuro.'
    };

    useEffect(() => {
        if (selectedLevel) {
            fetchBases();
        }
    }, [selectedLevel]);

    useFocusEffect(
        useCallback(() => {
            const onBackPress = () => {
                if (zoomButtonsVisible) {
                    setZoomButtonsVisible(false);
                    return true;
                }
                if (imageModalVisible) {
                    setImageModalVisible(false);
                    return true;
                }
                if (selectedLevel !== null) {
                    setSelectedLevel(null);
                    return true;
                }
                return false;
            };

            const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);

            return () => subscription.remove();
        }, [selectedLevel, imageModalVisible])
    );

    const fetchBases = async () => {
        setLoading(true);
        setIsOffline(false);
        try {
            let query = supabase
                .from('bases')
                .select('*')
                .eq('level_th', selectedLevel);

            const { data, error } = await query;

            if (error) {
                setIsOffline(true);
                return;
            }

            setBases(data || []);
            setIsOffline(false);
        } catch (error) {
            console.error('Error fetching bases:', error);
            setIsOffline(true);
        } finally {
            setLoading(false);
        }
    };

    const renderBaseItem = ({ item }) => (
        <View style={styles.baseCard}>
            <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => {
                    setSelectedBase(item);
                    setSelectedImageUrl(item.url_foto);
                    setImageModalVisible(true);
                    setZoomButtonsVisible(false); // Reset buttons state
                }}
            >
                <Image
                    source={{ uri: item.url_foto || 'https://via.placeholder.com/300' }}
                    style={styles.baseImage}
                    resizeMode="cover"
                />
                <View style={styles.zoomIconContainer}>
                    <Ionicons name="expand" size={20} color="#fff" />
                </View>
            </TouchableOpacity>
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
                        onPress={() => {
                            setSelectedBase(item);
                            setModalVisible(true);
                        }}
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
                        <TouchableOpacity
                            onPress={() => setInfoModalVisible(true)}
                            style={styles.infoButton}
                        >
                            <Ionicons
                                name="information-circle-outline"
                                size={24}
                                color="#facc15"
                            />
                        </TouchableOpacity>
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
                    ) : isOffline ? (
                        <View style={styles.offlineContainer}>
                            <Ionicons name="cloud-offline-outline" size={40} color="#facc15" />
                            <Text style={styles.offlineText}>Sin conexión</Text>
                            <TouchableOpacity style={styles.retryButton} onPress={fetchBases}>
                                <Text style={styles.retryButtonText}>Reintentar</Text>
                            </TouchableOpacity>
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
            {/* Modal de Detalles de Base */}
            <Modal
                transparent={true}
                visible={modalVisible}
                animationType="fade"
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Detalles</Text>

                        {selectedBase && (
                            <View style={styles.detailsContainer}>
                                <View style={styles.detailRow}>
                                    <Text style={styles.detailLabel}>Diseñador:</Text>
                                    <Text style={styles.detailValue}>Deiver Pernia</Text>
                                </View>
                                <View style={styles.detailRow}>
                                    <Text style={styles.detailLabel}>Publicado:</Text>
                                    <Text style={styles.detailValue}>
                                        {new Date(selectedBase.created_at).toLocaleDateString('es-ES', {
                                            day: '2-digit',
                                            month: '2-digit',
                                            year: 'numeric'
                                        })}
                                    </Text>
                                </View>
                            </View>
                        )}

                        <TouchableOpacity
                            style={styles.modalButton}
                            onPress={() => setModalVisible(false)}
                        >
                            <Text style={styles.modalButtonText}>Cerrar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Modal de Información de Tipos de Bases */}
            <Modal
                transparent={true}
                visible={infoModalVisible}
                animationType="fade"
                onRequestClose={() => setInfoModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { width: '90%', maxHeight: '80%' }]}>
                        <Text style={styles.modalTitle}>Tipos de bases</Text>

                        <ScrollView style={styles.infoScroll} showsVerticalScrollIndicator={false}>
                            {Object.entries(filterDescriptions).map(([type, description]) => (
                                <View key={type} style={styles.infoItem}>
                                    <Text style={styles.infoTypeTitle}>{type}</Text>
                                    <Text style={styles.infoTypeDescription}>{description}</Text>
                                </View>
                            ))}
                        </ScrollView>

                        <TouchableOpacity
                            style={styles.modalButton}
                            onPress={() => setInfoModalVisible(false)}
                        >
                            <Text style={styles.modalButtonText}>Entendido</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Zoom de Imagen (Ahora como Overlay en lugar de Modal) */}
            {imageModalVisible && selectedImageUrl && (
                <View style={styles.zoomOverlay}>
                    <ImageViewer
                        imageUrls={[{ url: selectedImageUrl }]}
                        onCancel={() => {
                            setImageModalVisible(false);
                            setZoomButtonsVisible(false);
                        }}
                        enableSwipeDown={false}
                        renderIndicator={() => null}
                        onLongPress={() => setZoomButtonsVisible(!zoomButtonsVisible)}
                        onClick={() => setZoomButtonsVisible(!zoomButtonsVisible)}
                        renderHeader={() => (
                            <View style={styles.zoomHeader}>
                                <TouchableOpacity
                                    style={styles.backButtonZoom}
                                    onPress={() => {
                                        setImageModalVisible(false);
                                        setZoomButtonsVisible(false);
                                    }}
                                >
                                    <Ionicons name="close" size={24} color="#facc15" />
                                </TouchableOpacity>
                            </View>
                        )}
                        renderFooter={() => (
                            zoomButtonsVisible && selectedBase && (
                                <View style={styles.zoomFooter}>
                                    <View style={styles.baseButtons}>
                                        <TouchableOpacity
                                            style={styles.actionButton}
                                            onPress={() => Linking.openURL(selectedBase.link)}
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
                            )
                        )}
                        footerContainerStyle={{ bottom: 10, width: '100%' }}
                        backgroundColor="black"
                    />
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
        fontSize: 18,
        fontFamily: 'LilitaOne',
        marginBottom: 5,
    },
    modalMessage: {
        color: '#ffffffff',
        fontSize: 14,
        textAlign: 'justify',
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
    detailsContainer: {
        width: '100%',
        marginBottom: 15,
        gap: 10,
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 5,
        borderBottomWidth: 1,
        borderBottomColor: '#333',
    },
    detailLabel: {
        color: '#999',
        fontSize: 16,
        fontFamily: 'LilitaOne',
    },
    detailValue: {
        color: '#fff',
        fontSize: 16,
        fontFamily: 'LilitaOne',
    },
    // Estilos del Modal de Información
    infoScroll: {
        paddingTop: 5,
        width: '100%',
    },
    infoItem: {
        marginBottom: 15,
        borderLeftWidth: 3,
        borderLeftColor: '#facc15',
        paddingLeft: 10,
    },
    infoTypeTitle: {
        color: '#facc15',
        fontSize: 18,
        fontFamily: 'LilitaOne',
        marginBottom: 5,
    },
    infoTypeDescription: {
        color: '#ccc',
        fontSize: 14,
        fontFamily: 'LilitaOne',
        lineHeight: 18,
    },
    // Estilos para modo sin conexión
    offlineContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 15,
    },
    offlineText: {
        color: '#fff',
        fontSize: 18,
        fontFamily: 'LilitaOne',
        marginBottom: 15,
    },
    retryButton: {
        backgroundColor: '#facc15',
        paddingHorizontal: 30,
        paddingVertical: 12,
        borderRadius: 25,
        elevation: 3,
        shadowColor: '#facc15',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
    },
    retryButtonText: {
        color: '#000',
        fontSize: 14,
        fontFamily: 'LilitaOne',
    },
    // Estilos para Zoom de Imagen
    zoomModalContainer: {
        flex: 1,
        backgroundColor: '#000',
    },
    zoomHeader: {
        position: 'absolute',
        top: 15,
        left: 15,
        zIndex: 10,
    },
    backButtonZoom: {
        borderRadius: 25,
    },
    zoomIconContainer: {
        position: 'absolute',
        top: 10,
        right: 10,
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderRadius: 15,
        padding: 5,
    },
    zoomOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'black',
        zIndex: 1000,
    },
    zoomFooter: {
        paddingHorizontal: 15,
        paddingBottom: 15,
        width: '100%',
    },
});
