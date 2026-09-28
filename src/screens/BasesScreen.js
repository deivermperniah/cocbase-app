import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList, Modal, BackHandler, RefreshControl } from 'react-native';
import { Image } from 'expo-image';
import Animated from 'react-native-reanimated';
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
import usePulseStyle from '../components/usePulseStyle';
import StateMessage from '../components/StateMessage';
import { COLORS, FONT, REFRESH_CONTROL_THEME } from '../lib/theme';

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

function TownHallCard({ level, onPress }) {
    return (
        <TouchableOpacity
            style={styles.card}
            activeOpacity={0.7}
            onPress={onPress}
            accessibilityRole="button"
            accessibilityLabel={`Nivel ${level}`}
        >
            <Image source={townHallImages[level]} style={styles.townHallImage} contentFit="cover" />
            <View style={styles.levelChip}>
                <Text style={styles.levelText}>Nivel {level}</Text>
            </View>
        </TouchableOpacity>
    );
}

const FILTER_OPTIONS = ['Todos', ...BASE_TYPES];

const FILTER_DESCRIPTIONS = {
    'Guerra': 'Bases estratégicas para Guerras de Clanes, enfocadas en evitar que el rival consiga 3 estrellas.',
    'Liga': 'Bases competitivas para Liga de Guerra de Clanes, enfocadas en evitar que el rival consiga pleno.',
    'Mejora': 'Bases de progreso diseñadas para identificar fácilmente qué edificios necesitas mejorar.',
    'Recursos': 'Diseños de Farming optimizados para la máxima protección de tus almacenes de oro, elixir y oscuro.'
};

function BaseCardSkeleton() {
    return (
        <View style={styles.skeletonCard}>
            <View style={styles.skeletonImage} />
            <View style={styles.skeletonButtons}>
                <View style={[styles.skeletonBlock, styles.skeletonCopy]} />
                <View style={[styles.skeletonBlock, styles.skeletonIcon]} />
                <View style={[styles.skeletonBlock, styles.skeletonIcon]} />
            </View>
        </View>
    );
}

function BasesSkeleton() {
    const pulseStyle = usePulseStyle();

    return (
        <Animated.View style={[styles.basesList, pulseStyle]} accessibilityLabel="Cargando bases">
            <BaseCardSkeleton />
            <BaseCardSkeleton />
        </Animated.View>
    );
}

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

    useEffect(() => {
        if (selectedLevel) {
            fetchBases(selectedLevel);
        }
    }, [selectedLevel]);

    const openLevel = (level) => {
        setBases([]);
        setLoading(true);
        setSelectedLevel(level);
        setSelectedType('Todos');
    };

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

    const fetchBases = async (level, { isRefresh = false } = {}) => {
        if (isRefresh) {
            setRefreshing(true);
        } else {
            setLoading(true);
        }
        setErrorText(null);

        const { data, error } = await supabase
            .from('bases')
            .select(BASE_COLUMNS)
            .eq('level_th', level)
            .eq('status', 'approved')
            .order('created_at', { ascending: false });

        if (levelRef.current !== level) return;

        if (error) {
            setErrorText(/network|fetch/i.test(error.message) ? 'Sin conexión' : 'No se pudo cargar');
        } else {
            setBases(data);
        }
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
            onToggleFavorite={handleToggleFavorite}
            onPressImage={setZoomImage}
            onOpenActions={setActionsBase}
        />
    ), [favoriteIds, handleToggleFavorite]);

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
                            {FILTER_OPTIONS.map((type) => {
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
                                                color={isActive ? COLORS.onPrimary : COLORS.textMuted}
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
                        {TOWN_HALL_LEVELS.map(level => (
                            <TownHallCard
                                key={level}
                                level={level}
                                onPress={() => openLevel(level)}
                            />
                        ))}
                    </View>
                </ScrollView>
            ) : (
                <View style={styles.selectedContainer}>
                    {loading ? (
                        <BasesSkeleton />
                    ) : errorText ? (
                        <StateMessage
                            icon="cloud-offline-outline"
                            message={errorText}
                            actionLabel="Reintentar"
                            onAction={() => fetchBases(selectedLevel)}
                        />
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
                                    {...REFRESH_CONTROL_THEME}
                                />
                            }
                            ListEmptyComponent={
                                <StateMessage
                                    iconSet="mci"
                                    icon={selectedType === 'Todos' ? 'castle' : getBaseTypeIcon(selectedType)}
                                    message={selectedType === 'Todos'
                                        ? 'Aún no hay bases para este nivel.'
                                        : 'No hay bases de este tipo en este nivel.'}
                                />
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
                            {Object.entries(FILTER_DESCRIPTIONS).map(([type, description]) => (
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
        backgroundColor: COLORS.background,
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
        backgroundColor: COLORS.surface,
        overflow: 'hidden',
        boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.3)',
    },
    townHallImage: {
        width: '100%',
        height: 180,
        backgroundColor: COLORS.surfaceAlt,
    },
    levelChip: {
        position: 'absolute',
        left: 10,
        right: 10,
        bottom: 10,
        alignItems: 'center',
        paddingVertical: 6,
        borderRadius: 8,
        backgroundColor: 'rgba(10, 10, 10, 0.75)',
    },
    levelText: {
        color: COLORS.text,
        fontSize: 16,
        fontFamily: FONT,
    },
    skeletonCard: {
        backgroundColor: COLORS.surface,
        borderRadius: 12,
        marginBottom: 15,
        overflow: 'hidden',
    },
    skeletonImage: {
        height: 200,
        backgroundColor: COLORS.surfaceAlt,
    },
    skeletonButtons: {
        flexDirection: 'row',
        gap: 10,
        padding: 15,
    },
    skeletonBlock: {
        height: 36,
        borderRadius: 8,
        backgroundColor: COLORS.surfaceAlt,
    },
    skeletonCopy: {
        flex: 1,
    },
    skeletonIcon: {
        width: 44,
    },
    filterContainer: {
        backgroundColor: COLORS.background,
        paddingBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
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
        backgroundColor: COLORS.surface,
    },
    filterButtonActive: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    filterText: {
        color: COLORS.textMuted,
        fontFamily: FONT,
        fontSize: 14,
    },
    filterTextActive: {
        color: COLORS.onPrimary,
    },
    selectedContainer: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    basesList: {
        flexGrow: 1,
        paddingTop: 15,
        paddingLeft: 15,
        paddingRight: 15,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: COLORS.surface,
        borderRadius: 20,
        padding: 15,
        alignItems: 'center',
        width: '80%',
    },
    modalTitle: {
        color: COLORS.primary,
        fontSize: 18,
        fontFamily: FONT,
        marginBottom: 5,
    },
    modalButton: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: 30,
        paddingVertical: 12,
        borderRadius: 25,
    },
    modalButtonText: {
        color: COLORS.onPrimary,
        fontSize: 14,
        fontFamily: FONT,
    },
    infoScroll: {
        paddingTop: 5,
        width: '100%',
    },
    infoItem: {
        marginBottom: 15,
        borderLeftWidth: 3,
        borderLeftColor: COLORS.primary,
        paddingLeft: 10,
    },
    infoTypeTitle: {
        color: COLORS.primary,
        fontSize: 18,
        fontFamily: FONT,
        marginBottom: 5,
    },
    infoTypeDescription: {
        color: COLORS.textSoft,
        fontSize: 14,
        fontFamily: FONT,
        lineHeight: 18,
    },
});
