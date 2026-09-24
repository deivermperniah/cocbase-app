import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList, ActivityIndicator, Modal, BackHandler, RefreshControl } from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { BASE_COLUMNS, supabase } from '../lib/supabase';
import { BASE_TYPES, TOWN_HALL_LEVELS, getBaseTypeIcon } from '../lib/constants';
import { useAuth } from '../context/AuthContext';
import { useFavorites } from '../context/FavoritesContext';
import { confirmAndDeleteBase } from '../lib/admin';
import ScreenHeader from '../components/ScreenHeader';
import DetailHeader, { DetailHeaderButton } from '../components/DetailHeader';
import BaseCard from '../components/BaseCard';
import BaseActionsSheet from '../components/BaseActionsSheet';
import ImageZoomModal from '../components/ImageZoomModal';

const townHallImages = {
    3: require('../../assets/images/townhalls/th3.webp'),
    4: require('../../assets/images/townhalls/th4.webp'),
    5: require('../../assets/images/townhalls/th5.webp'),
    6: require('../../assets/images/townhalls/th6.webp'),
    7: require('../../assets/images/townhalls/th7.webp'),
    8: require('../../assets/images/townhalls/th8.webp'),
    9: require('../../assets/images/townhalls/th9.webp'),
    10: require('../../assets/images/townhalls/th10.webp'),
    11: require('../../assets/images/townhalls/th11.webp'),
    12: require('../../assets/images/townhalls/th12.webp'),
    13: require('../../assets/images/townhalls/th13.webp'),
    14: require('../../assets/images/townhalls/th14.webp'),
    15: require('../../assets/images/townhalls/th15.webp'),
    16: require('../../assets/images/townhalls/th16.webp'),
    17: require('../../assets/images/townhalls/th17.webp'),
    18: require('../../assets/images/townhalls/th18.webp'),
};

export default function BasesScreen() {
    const navigation = useNavigation();
    const { user, isAdmin } = useAuth();
    const { favoriteIds, toggleFavorite, refresh: refreshFavorites } = useFavorites();
    const [selectedLevel, setSelectedLevel] = useState(null);
    const [selectedType, setSelectedType] = useState('Todos');
    const [bases, setBases] = useState([]);
    const [loading, setLoading] = useState(false);
    const [infoModalVisible, setInfoModalVisible] = useState(false);
    const [actionsBase, setActionsBase] = useState(null);
    const [errorText, setErrorText] = useState(null);
    const [refreshing, setRefreshing] = useState(false);
    const [zoomImage, setZoomImage] = useState(null);
    const levelRef = useRef(selectedLevel);
    levelRef.current = selectedLevel;

    const filterOptions = ['Todos', ...BASE_TYPES];

    const filterDescriptions = {
        'Guerra': 'Bases estratégicas para Guerras de Clanes, enfocadas en evitar que el rival consiga 3 estrellas.',
        'Liga': 'Bases competitivas para Liga de Guerra de Clanes, enfocadas en evitar que el rival consiga pleno.',
        'Mejora': 'Bases de progreso diseñadas para identificar fácilmente qué edificios necesitas mejorar.',
        'Recursos': 'Diseños de Farming optimizados para la máxima protección de tus almacenes de oro, elixir y oscuro.'
    };

    useEffect(() => {
        if (selectedLevel) {
            fetchBases(selectedLevel);
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

    const fetchBases = async (level, { isRetry = false, isRefresh = false } = {}) => {
        if (isRefresh) {
            setRefreshing(true);
        } else {
            setLoading(true);
        }
        setErrorText(null);
        const startTime = Date.now();
        let nextBases = null;
        let nextError = null;

        try {
            let query = supabase
                .from('bases')
                .select(BASE_COLUMNS)
                .eq('level_th', level)
                .eq('status', 'approved')
                .order('created_at', { ascending: false });

            const { data, error } = await query;

            if (error) {
                nextError = /network|fetch/i.test(error.message) ? 'Sin conexión' : 'Error al cargar';
            } else {
                nextBases = data || [];
            }
        } catch (error) {
            console.error('Error fetching bases:', error);
            nextError = 'Sin conexión';
        }

        if (isRetry) {
            const duration = Date.now() - startTime;
            if (duration < 600) {
                await new Promise(resolve => setTimeout(resolve, 600 - duration));
            }
        }

        if (levelRef.current !== level) return;

        if (nextBases) setBases(nextBases);
        setErrorText(nextError);
        setLoading(false);
        setRefreshing(false);
    };

    const handleToggleFavorite = useCallback((base) => {
        if (user) {
            toggleFavorite(base);
        } else {
            navigation.navigate('Auth');
        }
    }, [user, toggleFavorite, navigation]);

    const handleDelete = useCallback(async (base) => {
        if (await confirmAndDeleteBase(base)) {
            setBases(previous => previous.filter(item => item.id !== base.id));
            if (favoriteIds.has(base.id)) refreshFavorites();
        }
    }, [favoriteIds, refreshFavorites]);

    const renderBaseItem = useCallback(({ item }) => (
        <BaseCard
            base={item}
            isFavorite={favoriteIds.has(item.id)}
            showType={false}
            onToggleFavorite={handleToggleFavorite}
            onPressImage={setZoomImage}
            onOpenActions={setActionsBase}
        />
    ), [favoriteIds, handleToggleFavorite]);

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
                            contentFit="cover"
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
                    <DetailHeader
                        title={`Nivel ${selectedLevel}`}
                        onBack={() => {
                            setSelectedLevel(null);
                            setBases([]);
                        }}
                        right={
                            <DetailHeaderButton
                                icon="information-circle-outline"
                                label="Tipos de bases"
                                onPress={() => setInfoModalVisible(true)}
                            />
                        }
                        bordered={false}
                    />

                    <View style={styles.filterContainer}>
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.filterContent}
                        >
                            {filterOptions.map((type) => {
                                const isActive = selectedType === type;
                                return (
                                    <TouchableOpacity
                                        key={type}
                                        style={[
                                            styles.filterButton,
                                            isActive && styles.filterButtonActive
                                        ]}
                                        onPress={() => setSelectedType(type)}
                                    >
                                        {type !== 'Todos' && (
                                            <MaterialCommunityIcons
                                                name={getBaseTypeIcon(type)}
                                                size={16}
                                                color={isActive ? '#000' : '#999'}
                                            />
                                        )}
                                        <Text style={[
                                            styles.filterText,
                                            isActive && styles.filterTextActive
                                        ]}>
                                            {type}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </ScrollView>
                    </View>

                </View>
            ) : (
                <ScreenHeader title="Bases" subtitle="Selecciona tu nivel de ayuntamiento" />
            )}

            {selectedLevel === null ? (
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.grid}>
                        {TOWN_HALL_LEVELS.map(level => renderTownHallCard(level))}
                    </View>
                </ScrollView>
            ) : (
                <View style={styles.selectedContainer}>
                    {loading ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color="#facc15" />
                            <Text style={styles.loadingText}>Cargando...</Text>
                        </View>
                    ) : errorText ? (
                        <View style={styles.offlineContainer}>
                            <Ionicons name="cloud-offline-outline" size={40} color="#facc15" />
                            <Text style={styles.offlineText}>{errorText}</Text>
                            <TouchableOpacity style={styles.retryButton} onPress={() => fetchBases(selectedLevel, { isRetry: true })}>
                                <Text style={styles.retryButtonText}>Reintentar</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <FlatList
                            data={filteredBases}
                            renderItem={renderBaseItem}
                            keyExtractor={item => item.id}
                            contentContainerStyle={styles.basesList}
                            showsVerticalScrollIndicator={false}
                            initialNumToRender={10}
                            maxToRenderPerBatch={10}
                            windowSize={5}
                            removeClippedSubviews={true}
                            refreshControl={
                                <RefreshControl
                                    refreshing={refreshing}
                                    onRefresh={() => fetchBases(selectedLevel, { isRefresh: true })}
                                    colors={['#facc15']}
                                    tintColor="#facc15"
                                    progressBackgroundColor="#1a1a1a"
                                />
                            }
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

            <BaseActionsSheet
                base={actionsBase}
                onClose={() => setActionsBase(null)}
                onDelete={isAdmin ? handleDelete : undefined}
            />

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

            <ImageZoomModal uri={zoomImage} onClose={() => setZoomImage(null)} />

        </SafeAreaView >
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0a0a0a',
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
        boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.3)',
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
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
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
        boxShadow: '0px 2px 4px rgba(250, 204, 21, 0.3)',
    },
    retryButtonText: {
        color: '#000',
        fontSize: 14,
        fontFamily: 'LilitaOne',
    },
});
