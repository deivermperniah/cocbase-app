import React, { useCallback, useState } from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { BASE_TYPES, getBaseTypeIcon } from '../lib/constants';
import { fetchDashboardStats } from '../lib/admin';
import ScreenHeader from '../components/ScreenHeader';
import { ListRow, ListSection } from '../components/ListSection';
import usePulseStyle from '../components/usePulseStyle';
import StateMessage from '../components/StateMessage';
import { COLORS, FONT, REFRESH_CONTROL_THEME } from '../lib/theme';

function StatCard({ type, count }) {
    return (
        <View style={styles.statCard}>
            <View style={styles.statIcon}>
                <MaterialCommunityIcons name={getBaseTypeIcon(type)} size={22} color={COLORS.primary} />
            </View>
            <Text style={styles.statLabel}>{type}</Text>
            <Text style={styles.statValue}>{count}</Text>
        </View>
    );
}

function PanelSkeleton() {
    const pulseStyle = usePulseStyle();

    return (
        <Animated.View style={[styles.skeleton, pulseStyle]} accessibilityLabel="Cargando estadísticas">
            <View style={[styles.hero, styles.skeletonHero]}>
                <View style={[styles.skeletonLine, styles.skeletonHeroValue]} />
                <View style={[styles.skeletonLine, styles.skeletonHeroLabel]} />
            </View>
            <View style={styles.statsGrid}>
                {BASE_TYPES.map(type => (
                    <View key={type} style={styles.statCard}>
                        <View style={[styles.statIcon, styles.skeletonIcon]} />
                        <View style={[styles.skeletonLine, styles.skeletonLabel]} />
                        <View style={[styles.skeletonLine, styles.skeletonValue]} />
                    </View>
                ))}
            </View>
        </Animated.View>
    );
}

export default function PanelScreen() {
    const navigation = useNavigation();
    const [stats, setStats] = useState(null);
    const [error, setError] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    const loadStats = useCallback(async () => {
        try {
            setStats(await fetchDashboardStats());
            setError(false);
        } catch {
            setError(true);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            loadStats();
        }, [loadStats])
    );

    const handleRefresh = useCallback(async () => {
        setRefreshing(true);
        await loadStats();
        setRefreshing(false);
    }, [loadStats]);

    const renderStats = () => {
        if (!stats) {
            return error ? (
                <View style={styles.statusBox}>
                    <StateMessage
                        icon="cloud-offline-outline"
                        message="No se pudo cargar"
                        actionLabel="Reintentar"
                        onAction={handleRefresh}
                    />
                </View>
            ) : (
                <PanelSkeleton />
            );
        }

        return (
            <>
                <LinearGradient
                    colors={[COLORS.primaryLight, COLORS.primary, COLORS.primaryDark]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.hero}
                >
                    <Text style={styles.heroValue}>{stats.approved}</Text>
                    <Text style={styles.heroLabel}>Bases publicadas</Text>
                </LinearGradient>

                <View style={styles.statsGrid}>
                    {BASE_TYPES.map(type => (
                        <StatCard key={type} type={type} count={stats.byType[type]} />
                    ))}
                </View>
            </>
        );
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <ScreenHeader title="Panel" subtitle="Administración de cocbase" />
            <ScrollView
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                        {...REFRESH_CONTROL_THEME}
                    />
                }
            >
                {renderStats()}

                <ListSection title="Gestión">
                    <ListRow icon="add-circle-outline" label="Nueva base" onPress={() => navigation.navigate('NewBase')} />
                    <ListRow
                        icon="people-outline"
                        label="Comunidad"
                        badge={stats?.pending}
                        badgeLoading={!stats && !error}
                        onPress={() => navigation.navigate('Review')}
                    />
                    <ListRow icon="images-outline" label="Imágenes" onPress={() => navigation.navigate('Images')} />
                </ListSection>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    content: {
        padding: 15,
        gap: 15,
    },
    statusBox: {
        height: 200,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 10,
        borderRadius: 12,
        backgroundColor: COLORS.surface,
    },
    skeleton: {
        gap: 15,
    },
    skeletonHero: {
        backgroundColor: COLORS.surface,
        boxShadow: 'none',
        gap: 10,
    },
    skeletonLine: {
        borderRadius: 6,
        backgroundColor: COLORS.surfaceAlt,
    },
    skeletonHeroValue: {
        width: 70,
        height: 40,
    },
    skeletonHeroLabel: {
        width: 120,
        height: 14,
    },
    skeletonIcon: {
        backgroundColor: COLORS.surfaceAlt,
    },
    skeletonLabel: {
        width: '60%',
        height: 16,
        marginTop: 2,
    },
    skeletonValue: {
        width: '35%',
        height: 26,
        marginTop: 6,
    },
    hero: {
        height: 140,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        boxShadow: '0px 10px 20px rgba(250, 204, 21, 0.15)',
    },
    heroValue: {
        color: COLORS.onPrimary,
        fontSize: 44,
        fontFamily: FONT,
        lineHeight: 48,
    },
    heroLabel: {
        color: 'rgba(0, 0, 0, 0.6)',
        fontSize: 14,
        fontFamily: FONT,
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        rowGap: 15,
    },
    statCard: {
        width: '48%',
        padding: 15,
        gap: 4,
        borderRadius: 12,
        backgroundColor: COLORS.surface,
    },
    statIcon: {
        width: 44,
        height: 44,
        marginBottom: 8,
        borderRadius: 12,
        backgroundColor: 'rgba(250, 204, 21, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    statLabel: {
        color: COLORS.text,
        fontSize: 16,
        fontFamily: FONT,
    },
    statValue: {
        color: COLORS.primary,
        fontSize: 28,
        fontFamily: FONT,
    },
});
