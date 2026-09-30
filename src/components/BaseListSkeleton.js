import React from 'react';
import { View, StyleSheet } from 'react-native';
import Animated from 'react-native-reanimated';
import { COLORS, RADIUS } from '../lib/theme';
import { CARD_MIN_WIDTH, useGrid } from '../lib/layout';
import usePulseStyle from './usePulseStyle';

const SKELETON_ROWS = [0, 1];

function CardSkeleton({ imageHeight, width }) {
    return (
        <View style={[styles.card, width && { width }]}>
            <View style={[styles.image, { height: imageHeight }]} />
            <View style={styles.row}>
                <View style={[styles.block, styles.wide]} />
                <View style={[styles.block, styles.icon]} />
                <View style={[styles.block, styles.icon]} />
            </View>
        </View>
    );
}

export default function BaseListSkeleton({ imageHeight = 200, label = 'Cargando' }) {
    const pulseStyle = usePulseStyle();
    const { columns, itemWidth, onLayout } = useGrid(CARD_MIN_WIDTH);

    return (
        <Animated.View style={[styles.list, pulseStyle]} accessibilityLabel={label} onLayout={onLayout}>
            {columns > 1 ? SKELETON_ROWS.map(row => (
                <View key={row} style={styles.gridRow}>
                    {Array.from({ length: columns }, (_, index) => (
                        <CardSkeleton key={index} imageHeight={imageHeight} width={itemWidth} />
                    ))}
                </View>
            )) : SKELETON_ROWS.map(row => (
                <CardSkeleton key={row} imageHeight={imageHeight} />
            ))}
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    list: {
        flex: 1,
        padding: 15,
        gap: 15,
    },
    gridRow: {
        flexDirection: 'row',
        gap: 15,
    },
    card: {
        borderRadius: RADIUS.md,
        backgroundColor: COLORS.surface,
        overflow: 'hidden',
    },
    image: {
        backgroundColor: COLORS.surfaceAlt,
    },
    row: {
        flexDirection: 'row',
        gap: 10,
        padding: 15,
    },
    block: {
        height: 36,
        borderRadius: RADIUS.sm,
        backgroundColor: COLORS.surfaceAlt,
    },
    wide: {
        flex: 1,
    },
    icon: {
        width: 44,
    },
});
