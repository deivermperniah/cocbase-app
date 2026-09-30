import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { confirmAndDeleteImage, fetchImagesPage, fetchUsedImageUrls } from '../lib/admin';
import DetailHeader from '../components/DetailHeader';
import ImageZoomModal from '../components/ImageZoomModal';
import StateMessage from '../components/StateMessage';
import BaseListSkeleton from '../components/BaseListSkeleton';
import { COLORS, FONT, REFRESH_CONTROL_THEME, FONT_SIZE, RADIUS } from '../lib/theme';
import { CARD_MIN_WIDTH, useGrid } from '../lib/layout';

function formatMegabytes(bytes) {
    return (bytes / (1024 * 1024)).toFixed(2);
}

function ImageCard({ image, inUse, onPressImage, onDelete }) {
    return (
        <View style={styles.card}>
            <TouchableOpacity activeOpacity={0.9} onPress={() => onPressImage(image.url)}>
                <Image source={{ uri: image.url }} style={styles.image} contentFit="cover" cachePolicy="memory-disk" />
            </TouchableOpacity>
            <View style={[styles.usageBadge, inUse ? styles.usageBadgeInUse : styles.usageBadgeOrphan]}>
                <Text style={[styles.usageText, inUse ? styles.usageTextInUse : styles.usageTextOrphan]}>
                    {inUse ? 'En uso' : 'Huérfana'}
                </Text>
            </View>
            <View style={styles.cardBody}>
                <Text style={styles.imageName} numberOfLines={1}>{image.name}</Text>
                <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => onDelete(image)}
                    hitSlop={4}
                    accessibilityRole="button"
                    accessibilityLabel="Eliminar imagen"
                >
                    <Ionicons name="trash-outline" size={20} color={COLORS.danger} />
                </TouchableOpacity>
            </View>
        </View>
    );
}

export default function ImagesScreen() {
    const [images, setImages] = useState([]);
    const [usedUrls, setUsedUrls] = useState(new Set());
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [hasMore, setHasMore] = useState(false);
    const [error, setError] = useState(false);
    const [zoomImage, setZoomImage] = useState(null);
    const loadingMoreRef = useRef(false);
    const { columns, itemWidth, onLayout } = useGrid(CARD_MIN_WIDTH);

    const loadFirstPage = useCallback(async () => {
        try {
            const [nextUsedUrls, page] = await Promise.all([fetchUsedImageUrls(), fetchImagesPage(0)]);
            setUsedUrls(nextUsedUrls);
            setImages(page.images);
            setHasMore(page.hasMore);
            setError(false);
        } catch {
            setError(true);
        }
    }, []);

    useEffect(() => {
        loadFirstPage().finally(() => setLoading(false));
    }, [loadFirstPage]);

    const handleRefresh = useCallback(async () => {
        setRefreshing(true);
        await loadFirstPage();
        setRefreshing(false);
    }, [loadFirstPage]);

    const loadMore = useCallback(async () => {
        if (!hasMore || loadingMoreRef.current) return;
        loadingMoreRef.current = true;
        setLoadingMore(true);
        try {
            const page = await fetchImagesPage(images.length);
            setImages(previous => [...previous, ...page.images]);
            setHasMore(page.hasMore);
        } catch {
            setHasMore(false);
        } finally {
            loadingMoreRef.current = false;
            setLoadingMore(false);
        }
    }, [hasMore, images.length]);

    const handleDelete = useCallback(async (image) => {
        const inUse = usedUrls.has(image.url);
        if (await confirmAndDeleteImage(image, inUse)) {
            setImages(previous => previous.filter(item => item.name !== image.name));
        }
    }, [usedUrls]);

    const renderItem = useCallback(({ item }) => {
        const card = (
            <ImageCard
                image={item}
                inUse={usedUrls.has(item.url)}
                onPressImage={setZoomImage}
                onDelete={handleDelete}
            />
        );
        return itemWidth ? <View style={{ width: itemWidth }}>{card}</View> : card;
    }, [usedUrls, handleDelete, itemWidth]);

    const totalBytes = images.reduce((sum, image) => sum + image.size, 0);
    const statsHeader = images.length > 0 ? (
        <View style={styles.stats}>
            <View style={styles.stat}>
                <Ionicons name="images-outline" size={16} color={COLORS.primary} />
                <Text style={styles.statText}>{images.length}{hasMore ? '+' : ''} imágenes</Text>
            </View>
            <View style={styles.stat}>
                <Ionicons name="server-outline" size={16} color={COLORS.primary} />
                <Text style={styles.statText}>{formatMegabytes(totalBytes)} MB</Text>
            </View>
        </View>
    ) : null;

    const renderContent = () => {
        if (loading) {
            return <BaseListSkeleton imageHeight={180} label="Cargando imágenes" />;
        }

        if (error && images.length === 0) {
            return (
                <StateMessage
                    icon="cloud-offline-outline"
                    message="No se pudo cargar"
                    actionLabel="Reintentar"
                    onAction={handleRefresh}
                />
            );
        }

        return (
            <FlatList
                key={columns}
                data={images}
                renderItem={renderItem}
                keyExtractor={item => item.name}
                numColumns={columns}
                columnWrapperStyle={columns > 1 ? styles.gridRow : undefined}
                contentContainerStyle={styles.list}
                showsVerticalScrollIndicator={false}
                ListHeaderComponent={statsHeader}
                onEndReached={loadMore}
                onEndReachedThreshold={0.5}
                initialNumToRender={6}
                windowSize={5}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                        {...REFRESH_CONTROL_THEME}
                    />
                }
                ListFooterComponent={loadingMore ? <ActivityIndicator color={COLORS.primary} style={styles.footerLoader} /> : null}
                ListEmptyComponent={
                    <StateMessage icon="images-outline" message="No hay imágenes." />
                }
            />
        );
    };

    return (
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
            <DetailHeader title="Imágenes" />
            <View style={styles.flex} onLayout={onLayout}>{renderContent()}</View>
            <ImageZoomModal uri={zoomImage} onClose={() => setZoomImage(null)} />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    flex: {
        flex: 1,
    },
    list: {
        padding: 15,
        gap: 15,
        flexGrow: 1,
    },
    gridRow: {
        gap: 15,
    },
    stats: {
        flexDirection: 'row',
        gap: 20,
    },
    stat: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    statText: {
        color: COLORS.text,
        fontSize: FONT_SIZE.small,
        fontFamily: FONT,
    },
    footerLoader: {
        paddingVertical: 10,
    },
    card: {
        backgroundColor: COLORS.surface,
        borderRadius: RADIUS.md,
        overflow: 'hidden',
    },
    image: {
        width: '100%',
        height: 180,
        backgroundColor: COLORS.surfaceAlt,
    },
    usageBadge: {
        position: 'absolute',
        top: 10,
        left: 10,
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: RADIUS.sm,
    },
    usageBadgeInUse: {
        backgroundColor: COLORS.primary,
    },
    usageBadgeOrphan: {
        backgroundColor: COLORS.dangerStrong,
    },
    usageText: {
        fontSize: FONT_SIZE.caption,
        fontFamily: FONT,
    },
    usageTextInUse: {
        color: COLORS.onPrimary,
    },
    usageTextOrphan: {
        color: COLORS.text,
    },
    cardBody: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        padding: 15,
    },
    imageName: {
        flex: 1,
        color: COLORS.text,
        fontSize: FONT_SIZE.body,
        fontFamily: FONT,
    },
    deleteButton: {
        width: 44,
        height: 36,
        borderRadius: RADIUS.sm,
        backgroundColor: COLORS.border,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
