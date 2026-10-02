import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList, Modal, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { BASE_COLUMNS, supabase } from '../lib/supabase';
import { BASE_TYPES, getBaseTypeIcon } from '../lib/constants';
import { useAuth } from '../context/AuthContext';
import { useFavorites } from '../context/FavoritesContext';
import { confirmAndDeleteBase } from '../lib/admin';
import DetailHeader, { DetailHeaderButton } from '../components/DetailHeader';
import BaseCard from '../components/BaseCard';
import BaseActionsSheet from '../components/BaseActionsSheet';
import ImageZoomModal from '../components/ImageZoomModal';
import StateMessage from '../components/StateMessage';
import BaseListSkeleton from '../components/BaseListSkeleton';
import { COLORS, FONT, REFRESH_CONTROL_THEME, FONT_SIZE, RADIUS, BUTTON } from '../lib/theme';
import { CARD_MIN_WIDTH, useGrid } from '../lib/layout';

const FILTER_OPTIONS = ['Todos', ...BASE_TYPES];

const FILTER_DESCRIPTIONS = {
    'Guerra': 'Bases estratégicas para Guerras de Clanes, enfocadas en evitar que el rival consiga 3 estrellas.',
    'Liga': 'Bases competitivas para Liga de Guerra de Clanes, enfocadas en evitar que el rival consiga pleno.',
    'Mejora': 'Bases de progreso diseñadas para identificar fácilmente qué edificios necesitas mejorar.',
    'Competitivo': 'Bases defensivas para Batallas Clasificatorias, diseñadas para no perder trofeos, ascender de liga y mantenerte en lo más alto del torneo semanal.'
};

export default function BaseListScreen() {
    const navigation = useNavigation();
    const { level } = useRoute().params;
    const { user, isAdmin } = useAuth();
    const { favoriteIds, toggleFavorite, refresh: refreshFavorites } = useFavorites();
    const [selectedType, setSelectedType] = useState('Todos');
    const [bases, setBases] = useState([]);
    const [loading, setLoading] = useState(true);
    const [infoModalVisible, setInfoModalVisible] = useState(false);
    const [actionsBase, setActionsBase] = useState(null);
    const [errorText, setErrorText] = useState(null);
    const [refreshing, setRefreshing] = useState(false);
    const [zoomImage, setZoomImage] = useState(null);
    const { columns, itemWidth, onLayout } = useGrid(CARD_MIN_WIDTH);

    useEffect(() => {
        fetchBases();
    }, [level]);

    const filteredBases = useMemo(() => {
        return bases.filter(base => selectedType === 'Todos' || base.type === selectedType);
    }, [bases, selectedType]);

    const fetchBases = async ({ isRefresh = false } = {}) => {
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

    const renderBaseItem = useCallback(({ item }) => {
        const card = (
            <BaseCard
                base={item}
                isFavorite={favoriteIds.has(item.id)}
                onToggleFavorite={handleToggleFavorite}
                onPressImage={setZoomImage}
                onOpenActions={setActionsBase}
            />
        );
        return itemWidth ? <View style={{ width: itemWidth }}>{card}</View> : card;
    }, [favoriteIds, handleToggleFavorite, itemWidth]);

    return (
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>

            <View>
                <DetailHeader
                    title={`Nivel ${level}`}
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
                                    hitSlop={{ top: 5, bottom: 5 }}
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

            <View style={styles.selectedContainer} onLayout={onLayout}>
                {loading ? (
                    <BaseListSkeleton label="Cargando bases" />
                ) : errorText ? (
                    <StateMessage
                        icon="cloud-offline-outline"
                        message={errorText}
                        actionLabel="Reintentar"
                        onAction={() => fetchBases()}
                    />
                ) : (
                    <FlatList
                        key={columns}
                        data={filteredBases}
                        renderItem={renderBaseItem}
                        keyExtractor={item => item.id}
                        numColumns={columns}
                        columnWrapperStyle={columns > 1 ? styles.gridRow : undefined}
                        contentContainerStyle={styles.basesList}
                        showsVerticalScrollIndicator={false}
                        initialNumToRender={10}
                        maxToRenderPerBatch={10}
                        windowSize={5}
                        removeClippedSubviews={true}
                        refreshControl={
                            <RefreshControl
                                refreshing={refreshing}
                                onRefresh={() => fetchBases({ isRefresh: true })}
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

            <BaseActionsSheet
                base={actionsBase}
                onClose={() => setActionsBase(null)}
                onDelete={isAdmin ? handleDelete : undefined}
            />

            <Modal
                transparent={true}
                visible={infoModalVisible}
                supportedOrientations={['portrait', 'landscape']}
                animationType="fade"
                onRequestClose={() => setInfoModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
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

        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
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
        borderRadius: RADIUS.lg,
        backgroundColor: COLORS.surface,
    },
    filterButtonActive: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    filterText: {
        color: COLORS.textMuted,
        fontFamily: FONT,
        fontSize: FONT_SIZE.small,
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
    gridRow: {
        gap: 15,
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
    },
    modalContent: {
        width: '100%',
        maxWidth: 420,
        maxHeight: '80%',
        alignItems: 'center',
        gap: 10,
        padding: 24,
        borderRadius: RADIUS.lg,
        borderWidth: 1,
        borderColor: COLORS.border,
        backgroundColor: COLORS.surface,
    },
    modalTitle: {
        color: COLORS.text,
        fontSize: FONT_SIZE.heading,
        fontFamily: FONT,
    },
    modalButton: {
        ...BUTTON,
        alignSelf: 'stretch',
        marginTop: 10,
        backgroundColor: COLORS.primary,
    },
    modalButtonText: {
        color: COLORS.onPrimary,
        fontSize: FONT_SIZE.body,
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
        fontSize: FONT_SIZE.title,
        fontFamily: FONT,
        marginBottom: 5,
    },
    infoTypeDescription: {
        color: COLORS.textSoft,
        fontSize: FONT_SIZE.small,
        fontFamily: FONT,
        lineHeight: 18,
    },
});
