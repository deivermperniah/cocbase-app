import React, { useCallback, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { useFavorites } from '../context/FavoritesContext';
import { confirmAndDeleteBase } from '../lib/admin';
import ScreenHeader from '../components/ScreenHeader';
import SignInPrompt from '../components/SignInPrompt';
import BaseCard from '../components/BaseCard';
import BaseActionsSheet from '../components/BaseActionsSheet';
import ImageZoomModal from '../components/ImageZoomModal';

export default function FavoritesScreen() {
    const { user, isAdmin } = useAuth();
    const { favorites, favoriteIds, loading, error, refresh, toggleFavorite } = useFavorites();
    const [refreshing, setRefreshing] = useState(false);
    const [actionsBase, setActionsBase] = useState(null);
    const [zoomImage, setZoomImage] = useState(null);

    const handleRefresh = useCallback(async () => {
        setRefreshing(true);
        await refresh();
        setRefreshing(false);
    }, [refresh]);

    const handleDelete = useCallback(async (base) => {
        if (await confirmAndDeleteBase(base)) refresh();
    }, [refresh]);

    const renderBaseItem = useCallback(({ item }) => (
        <BaseCard
            base={item}
            isFavorite={favoriteIds.has(item.id)}
            onToggleFavorite={toggleFavorite}
            onPressImage={setZoomImage}
            onOpenActions={setActionsBase}
        />
    ), [favoriteIds, toggleFavorite]);

    const renderContent = () => {
        if (!user) {
            return <SignInPrompt icon="heart-outline" message="Inicia sesión para guardar tus bases favoritas." />;
        }

        if (loading) {
            return (
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color="#facc15" />
                    <Text style={styles.loadingText}>Cargando...</Text>
                </View>
            );
        }

        if (error && favorites.length === 0) {
            return (
                <View style={styles.centerContainer}>
                    <Ionicons name="cloud-offline-outline" size={40} color="#facc15" />
                    <Text style={styles.messageText}>No se pudo cargar</Text>
                    <TouchableOpacity style={styles.primaryButton} onPress={handleRefresh}>
                        <Text style={styles.primaryButtonText}>Reintentar</Text>
                    </TouchableOpacity>
                </View>
            );
        }

        return (
            <FlatList
                data={favorites}
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
                        onRefresh={handleRefresh}
                        colors={['#facc15']}
                        tintColor="#facc15"
                        progressBackgroundColor="#1a1a1a"
                    />
                }
                ListEmptyComponent={
                    <View style={styles.empty}>
                        <Ionicons name="heart-outline" size={40} color="#facc15" />
                        <Text style={styles.emptyText}>Aún no tienes bases favoritas.</Text>
                    </View>
                }
            />
        );
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <ScreenHeader title="Favoritos" subtitle="Tus bases guardadas" />
            <View style={styles.content}>
                {renderContent()}
            </View>
            <BaseActionsSheet
                base={actionsBase}
                onClose={() => setActionsBase(null)}
                onDelete={isAdmin ? handleDelete : undefined}
            />
            <ImageZoomModal uri={zoomImage} onClose={() => setZoomImage(null)} />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0a0a0a',
    },
    content: {
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
        textAlign: 'center',
        marginTop: 10,
        marginBottom: 15,
    },
    loadingText: {
        color: '#fff',
        marginTop: 10,
        fontFamily: 'LilitaOne',
        fontSize: 16,
    },
    primaryButton: {
        backgroundColor: '#facc15',
        paddingHorizontal: 30,
        paddingVertical: 12,
        borderRadius: 25,
        boxShadow: '0px 2px 4px rgba(250, 204, 21, 0.3)',
    },
    primaryButtonText: {
        color: '#000',
        fontSize: 14,
        fontFamily: 'LilitaOne',
    },
    basesList: {
        flexGrow: 1,
        paddingTop: 15,
        paddingLeft: 15,
        paddingRight: 15,
    },
    empty: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 10,
    },
    emptyText: {
        color: '#999',
        textAlign: 'center',
        fontFamily: 'LilitaOne',
        fontSize: 16,
    },
});
