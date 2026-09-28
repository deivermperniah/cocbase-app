import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { confirmAndDeleteImage, fetchImagesPage, fetchUsedImageUrls } from '../lib/admin';
import DetailHeader from '../components/DetailHeader';
import ImageZoomModal from '../components/ImageZoomModal';

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
                    <Ionicons name="trash-outline" size={20} color="#f87171" />
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

    const renderItem = useCallback(({ item }) => (
        <ImageCard
            image={item}
            inUse={usedUrls.has(item.url)}
            onPressImage={setZoomImage}
            onDelete={handleDelete}
        />
    ), [usedUrls, handleDelete]);

    const totalBytes = images.reduce((sum, image) => sum + image.size, 0);
    const statsHeader = images.length > 0 ? (
        <View style={styles.stats}>
            <View style={styles.stat}>
                <Ionicons name="images-outline" size={16} color="#facc15" />
                <Text style={styles.statText}>{images.length}{hasMore ? '+' : ''} imágenes</Text>
            </View>
            <View style={styles.stat}>
                <Ionicons name="server-outline" size={16} color="#facc15" />
                <Text style={styles.statText}>{formatMegabytes(totalBytes)} MB</Text>
            </View>
        </View>
    ) : null;

    const renderContent = () => {
        if (loading) {
            return (
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color="#facc15" />
                </View>
            );
        }

        if (error && images.length === 0) {
            return (
                <View style={styles.centerContainer}>
                    <Ionicons name="cloud-offline-outline" size={40} color="#facc15" />
                    <Text style={styles.messageText}>No se pudo cargar</Text>
                    <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
                        <Text style={styles.retryButtonText}>Reintentar</Text>
                    </TouchableOpacity>
                </View>
            );
        }

        return (
            <FlatList
                data={images}
                renderItem={renderItem}
                keyExtractor={item => item.name}
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
                        colors={['#facc15']}
                        tintColor="#facc15"
                        progressBackgroundColor="#1a1a1a"
                    />
                }
                ListFooterComponent={loadingMore ? <ActivityIndicator color="#facc15" style={styles.footerLoader} /> : null}
                ListEmptyComponent={
                    <View style={styles.empty}>
                        <Ionicons name="images-outline" size={40} color="#facc15" />
                        <Text style={styles.emptyText}>No hay imágenes.</Text>
                    </View>
                }
            />
        );
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <DetailHeader title="Imágenes" />
            <View style={styles.flex}>{renderContent()}</View>
            <ImageZoomModal uri={zoomImage} onClose={() => setZoomImage(null)} />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0a0a0a',
    },
    flex: {
        flex: 1,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 15,
    },
    messageText: {
        color: '#fff',
        fontSize: 18,
        fontFamily: 'LilitaOne',
        marginTop: 10,
        marginBottom: 15,
    },
    retryButton: {
        backgroundColor: '#facc15',
        paddingHorizontal: 30,
        paddingVertical: 12,
        borderRadius: 25,
    },
    retryButtonText: {
        color: '#000',
        fontSize: 14,
        fontFamily: 'LilitaOne',
    },
    list: {
        padding: 15,
        gap: 15,
        flexGrow: 1,
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
        color: '#fff',
        fontSize: 14,
        fontFamily: 'LilitaOne',
    },
    footerLoader: {
        paddingVertical: 10,
    },
    empty: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 10,
    },
    emptyText: {
        color: '#999',
        fontSize: 16,
        fontFamily: 'LilitaOne',
    },
    card: {
        backgroundColor: '#1a1a1a',
        borderRadius: 12,
        overflow: 'hidden',
    },
    image: {
        width: '100%',
        height: 180,
        backgroundColor: '#2a2a2a',
    },
    usageBadge: {
        position: 'absolute',
        top: 10,
        left: 10,
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 5,
    },
    usageBadgeInUse: {
        backgroundColor: '#facc15',
    },
    usageBadgeOrphan: {
        backgroundColor: '#dc2626',
    },
    usageText: {
        fontSize: 12,
        fontFamily: 'LilitaOne',
    },
    usageTextInUse: {
        color: '#000',
    },
    usageTextOrphan: {
        color: '#fff',
    },
    cardBody: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        padding: 15,
    },
    imageName: {
        flex: 1,
        color: '#fff',
        fontSize: 15,
        fontFamily: 'LilitaOne',
    },
    deleteButton: {
        width: 44,
        height: 36,
        borderRadius: 8,
        backgroundColor: '#333',
        justifyContent: 'center',
        alignItems: 'center',
    },
});
