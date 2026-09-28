import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { useFavorites } from '../context/FavoritesContext';
import { confirmAndDeleteBase } from '../lib/admin';
import ScreenHeader from '../components/ScreenHeader';
import SignInPrompt from '../components/SignInPrompt';
import BaseCard from '../components/BaseCard';
import BaseActionsSheet from '../components/BaseActionsSheet';
import ImageZoomModal from '../components/ImageZoomModal';
import StateMessage from '../components/StateMessage';
import { COLORS, FONT, REFRESH_CONTROL_THEME } from '../lib/theme';

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
                    <ActivityIndicator size="large" color={COLORS.primary} />
                    <Text style={styles.loadingText}>Cargando...</Text>
                </View>
            );
        }

        if (error && favorites.length === 0) {
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
                        {...REFRESH_CONTROL_THEME}
                    />
                }
                ListEmptyComponent={
                    <StateMessage icon="heart-outline" message="Aún no tienes bases favoritas." />
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
        backgroundColor: COLORS.background,
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
    loadingText: {
        color: COLORS.text,
        marginTop: 10,
        fontFamily: FONT,
        fontSize: 16,
    },
    basesList: {
        flexGrow: 1,
        paddingTop: 15,
        paddingLeft: 15,
        paddingRight: 15,
    },
});
