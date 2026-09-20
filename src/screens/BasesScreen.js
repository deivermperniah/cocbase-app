import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, FlatList, Linking, ActivityIndicator, Modal, BackHandler } from 'react-native';
import { supabase } from '../../src/lib/supabase';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';

const townHallImages = {
    3: require('../../assets/townhalls/th3.webp'),
    4: require('../../assets/townhalls/th4.webp'),
    5: require('../../assets/townhalls/th5.webp'),
    6: require('../../assets/townhalls/th6.webp'),
    7: require('../../assets/townhalls/th7.webp'),
    8: require('../../assets/townhalls/th8.webp'),
    9: require('../../assets/townhalls/th9.webp'),
    10: require('../../assets/townhalls/th10.webp'),
    11: require('../../assets/townhalls/th11.webp'),
    12: require('../../assets/townhalls/th12.webp'),
    13: require('../../assets/townhalls/th13.webp'),
    14: require('../../assets/townhalls/th14.webp'),
    15: require('../../assets/townhalls/th15.webp'),
    16: require('../../assets/townhalls/th16.webp'),
    17: require('../../assets/townhalls/th17.webp'),
    18: require('../../assets/townhalls/th18.webp'),
};

export default function BasesScreen() {
    const townHalls = Array.from({ length: 16 }, (_, i) => i + 3);
    const [selectedLevel, setSelectedLevel] = useState(null);
    const [selectedType, setSelectedType] = useState('Todos');
    const [bases, setBases] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [infoModalVisible, setInfoModalVisible] = useState(false);
    const [selectedBase, setSelectedBase] = useState(null);
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

    const filteredBases = useMemo(() => {
        return bases.filter(base => selectedType === 'Todos' || base.type === selectedType);
    }, [bases, selectedType]);

    useFocusEffect(
        useCallback(() => {
            const onBackPress = () => {
                if (selectedLevel !== null) {
                    setSelectedLevel(null);
                    setBases([]);
                    return true;
                }
                return false;
            };

            const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);

            return () => subscription.remove();
        }, [selectedLevel])
    );

    const fetchBases = async (isRetry = false) => {
        setLoading(true);
        setIsOffline(false);
        const startTime = Date.now();

        try {
            let query = supabase
                .from('bases')
                .select('*')
                .eq('level_th', selectedLevel)
                .order('created_at', { ascending: false });

            const { data, error } = await query;

            if (error) {
                setIsOffline(true);
            } else {
                setBases(data || []);
                setIsOffline(false);
            }
        } catch (error) {
            console.error('Error fetching bases:', error);
            setIsOffline(true);
        } finally {
            if (isRetry) {
                const duration = Date.now() - startTime;
                if (duration < 600) {
                    await new Promise(resolve => setTimeout(resolve, 600 - duration));
                }
            }
            setLoading(false);
        }
    };

    const renderBaseItem = ({ item }) => {
        const isNew = () => {
            if (!item.created_at) return false;
            const createdDate = new Date(item.created_at);
            const now = new Date();
            const diffInDays = (now - createdDate) / (1000 * 60 * 60 * 24);
            return diffInDays <= 7;
        };

        return (
            <View style={styles.baseCard}>
                <View style={styles.imageContainerList}>
                    <Image
                        source={{ uri: item.url_foto || 'https://via.placeholder.com/300' }}
                        style={styles.baseImage}
                        resizeMode="cover"
                    />
                    {isNew() && (
                        <View style={styles.newBadge}>
                            <Text style={styles.newBadgeText}>Nuevo</Text>
                        </View>
                    )}
                </View>
                <View style={styles.baseInfo}>
                <View style={styles.typeContainer}>
                    <Ionicons name="pricetag" size={20} color="#facc15" />
                    <Text style={styles.baseType}>{item.type}</Text>
                </View>
                <View style={styles.baseButtons}>
                    <TouchableOpacity
                        style={[styles.actionButton, selectedLevel === 3 && styles.disabledButton]}
                        onPress={() => Linking.openURL(item.link)}
                        disabled={selectedLevel === 3}
                    >
                        <Text style={[styles.copyButtonText, selectedLevel === 3 && styles.disabledButtonText]}>Copiar Base</Text>
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
    };

    const renderTownHallCard = (level) => {
        return (
            <TouchableOpacity
                key={level}
                style={styles.card}
                activeOpacity={0.7}
                onPress={() => {
                    setBases([]);
                    setLoading(true);
                    setSelectedLevel(level);
                    setSelectedType('Todos');
                }}
            >
                <View style={styles.cardContent}>

                    <View style={styles.imageContainer}>
                        <Image
                            source={townHallImages[level]}
                            style={styles.townHallImage}
                            resizeMode="cover"
                        />
                    </View>


                    <View style={styles.cardFooter}>
                        <Text style={styles.townHallText}>Nivel {level}</Text>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>

            {selectedLevel !== null ? (
                <View>
                    <View style={styles.headerSelected}>
                        <TouchableOpacity 
                            onPress={() => {
                                setSelectedLevel(null);
                                setBases([]);
                            }} 
                            style={styles.backButton}
                        >
                            <Ionicons name="arrow-back" size={25} color="#facc15" />
                        </TouchableOpacity>
                        <Text style={styles.headerTitleSelected}>Nivel {selectedLevel}</Text>
                        <TouchableOpacity
                            onPress={() => setInfoModalVisible(true)}
                            style={styles.infoButton}
                        >
                            <Ionicons
                                name="information-circle-outline"
                                size={25}
                                color="#facc15"
                            />
                        </TouchableOpacity>
                    </View>

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
                            <TouchableOpacity style={styles.retryButton} onPress={() => fetchBases(true)}>
                                <Text style={styles.retryButtonText}>Reintentar</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <FlatList
                            data={filteredBases}
                            renderItem={renderBaseItem}
                            keyExtractor={item => item.id.toString()}
                            contentContainerStyle={styles.basesList}
                            showsVerticalScrollIndicator={false}
                            initialNumToRender={10}
                            maxToRenderPerBatch={10}
                            windowSize={5}
                            removeClippedSubviews={true}
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
        height: 160,
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
        padding: 10,
        backgroundColor: '#1a1a1a',
    },
    townHallText: {
        color: '#facc15',
        fontSize: 16,
        textAlign: 'center',
        fontFamily: 'LilitaOne',
    },
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
    backButton: {
        padding: 5,
    },
    infoButton: {
        padding: 5,
    },
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
    imageContainerList: {
        position: 'relative',
    },
    newBadge: {
        position: 'absolute',
        top: 10,
        left: 10,
        backgroundColor: '#facc15',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 5,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 2,
    },
    newBadgeText: {
        color: '#000',
        fontFamily: 'LilitaOne',
        fontSize: 12,
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
    disabledButton: {
        backgroundColor: '#333',
        opacity: 0.6,
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
    disabledButtonText: {
        color: '#888',
    },
    emptyText: {
        color: '#999',
        textAlign: 'center',
        fontFamily: 'LilitaOne',
        fontSize: 16,
    },
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
    modalTitle: {
        color: '#facc15',
        fontSize: 18,
        fontFamily: 'LilitaOne',
        marginBottom: 5,
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
});
