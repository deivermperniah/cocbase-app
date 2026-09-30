import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { TOWN_HALL_LEVELS } from '../lib/constants';
import ScreenHeader from '../components/ScreenHeader';
import { COLORS, FONT, FONT_SIZE, RADIUS } from '../lib/theme';
import { useGrid } from '../lib/layout';

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

const MAX_IMAGE_HEIGHT = 200;

function TownHallCard({ level, onPress, width }) {
    return (
        <TouchableOpacity
            style={[styles.card, width && { flexBasis: width, flexGrow: 0 }]}
            activeOpacity={0.7}
            onPress={onPress}
            accessibilityRole="button"
            accessibilityLabel={`Nivel ${level}`}
        >
            <Image source={townHallImages[level]} style={[styles.townHallImage, width && { height: Math.min(width, MAX_IMAGE_HEIGHT) }]} contentFit="cover" />
            <View style={styles.levelChip}>
                <Text style={styles.levelText}>Nivel {level}</Text>
            </View>
        </TouchableOpacity>
    );
}

export default function BasesScreen() {
    const navigation = useNavigation();
    const { columns, itemWidth, onLayout } = useGrid(150, { snap: [2, 4, 8] });

    return (
        <SafeAreaView style={styles.container} edges={['top', 'right']}>
            <ScreenHeader title="Bases" subtitle="Selecciona tu nivel de ayuntamiento" />

            <ScrollView
                style={styles.scrollView}
                onLayout={onLayout}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.grid}>
                    {TOWN_HALL_LEVELS.map(level => (
                        <TownHallCard
                            key={level}
                            level={level}
                            width={columns > 2 ? itemWidth : undefined}
                            onPress={() => navigation.navigate('BaseList', { level })}
                        />
                    ))}
                </View>
            </ScrollView>
        </SafeAreaView>
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
        paddingVertical: 15,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 15,
    },
    card: {
        flexBasis: '40%',
        flexGrow: 1,
        borderRadius: RADIUS.md,
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
        borderRadius: RADIUS.sm,
        backgroundColor: 'rgba(10, 10, 10, 0.75)',
    },
    levelText: {
        color: COLORS.text,
        fontSize: FONT_SIZE.body,
        fontFamily: FONT,
    },
});
