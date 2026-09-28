import React from 'react';
import { View, StyleSheet } from 'react-native';
import Animated from 'react-native-reanimated';
import { COLORS, RADIUS } from '../lib/theme';
import usePulseStyle from './usePulseStyle';

function CardSkeleton({ imageHeight }) {
    return (
        <View style={styles.card}>
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

    return (
        <Animated.View style={[styles.list, pulseStyle]} accessibilityLabel={label}>
            <CardSkeleton imageHeight={imageHeight} />
            <CardSkeleton imageHeight={imageHeight} />
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    list: {
        flex: 1,
        padding: 15,
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
