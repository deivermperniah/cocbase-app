import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Animated from 'react-native-reanimated';
import usePulseStyle from './usePulseStyle';
import { COLORS, FONT } from '../lib/theme';

function BadgeSkeleton() {
    const pulseStyle = usePulseStyle();
    return <Animated.View style={[styles.badge, styles.badgeSkeleton, pulseStyle]} />;
}

export function ListRow({ icon, label, value, badge, badgeLoading, onPress, isLast }) {
    return (
        <TouchableOpacity
            style={[styles.row, !isLast && listStyles.divider]}
            onPress={onPress}
            disabled={!onPress}
            activeOpacity={0.7}
        >
            <Ionicons name={icon} size={20} color={COLORS.primary} />
            <Text style={styles.rowLabel}>{label}</Text>
            {value != null && <Text style={styles.rowValue} numberOfLines={1}>{value}</Text>}
            {badgeLoading && <BadgeSkeleton />}
            {!badgeLoading && badge != null && (
                <View style={[styles.badge, badge === 0 && styles.badgeEmpty]}>
                    <Text style={[styles.badgeText, badge === 0 && styles.badgeTextEmpty]}>{badge}</Text>
                </View>
            )}
            {onPress && <Ionicons name="chevron-forward" size={18} color={COLORS.textSubtle} />}
        </TouchableOpacity>
    );
}

export function ListSection({ title, children }) {
    const rows = React.Children.toArray(children);

    return (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>{title}</Text>
            <View style={styles.sectionCard}>
                {rows.map((row, index) => React.cloneElement(row, { isLast: index === rows.length - 1 }))}
            </View>
        </View>
    );
}

export const listStyles = StyleSheet.create({
    divider: {
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: COLORS.border,
    },
});

const styles = StyleSheet.create({
    section: {
        gap: 8,
    },
    sectionTitle: {
        color: COLORS.textMuted,
        fontSize: 14,
        fontFamily: FONT,
        paddingHorizontal: 5,
    },
    sectionCard: {
        backgroundColor: COLORS.surface,
        borderRadius: 12,
        overflow: 'hidden',
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingHorizontal: 15,
        paddingVertical: 14,
    },
    rowLabel: {
        flex: 1,
        color: COLORS.text,
        fontSize: 16,
        fontFamily: FONT,
    },
    rowValue: {
        flexShrink: 1,
        color: COLORS.textMuted,
        fontSize: 14,
        fontFamily: FONT,
    },
    badge: {
        minWidth: 24,
        height: 24,
        paddingHorizontal: 7,
        borderRadius: 12,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    badgeSkeleton: {
        width: 24,
        backgroundColor: COLORS.border,
    },
    badgeEmpty: {
        backgroundColor: COLORS.border,
    },
    badgeText: {
        color: COLORS.onPrimary,
        fontSize: 13,
        fontFamily: FONT,
    },
    badgeTextEmpty: {
        color: COLORS.textMuted,
    },
});
