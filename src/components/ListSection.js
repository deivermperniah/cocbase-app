import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Animated from 'react-native-reanimated';
import usePulseStyle from './usePulseStyle';

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
            <Ionicons name={icon} size={20} color="#facc15" />
            <Text style={styles.rowLabel}>{label}</Text>
            {value != null && <Text style={styles.rowValue} numberOfLines={1}>{value}</Text>}
            {badgeLoading && <BadgeSkeleton />}
            {!badgeLoading && badge != null && (
                <View style={[styles.badge, badge === 0 && styles.badgeEmpty]}>
                    <Text style={[styles.badgeText, badge === 0 && styles.badgeTextEmpty]}>{badge}</Text>
                </View>
            )}
            {onPress && <Ionicons name="chevron-forward" size={18} color="#666" />}
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
        borderBottomColor: '#333',
    },
});

const styles = StyleSheet.create({
    section: {
        gap: 8,
    },
    sectionTitle: {
        color: '#999',
        fontSize: 14,
        fontFamily: 'LilitaOne',
        textTransform: 'uppercase',
        paddingHorizontal: 5,
    },
    sectionCard: {
        backgroundColor: '#1a1a1a',
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
        color: '#fff',
        fontSize: 16,
        fontFamily: 'LilitaOne',
    },
    rowValue: {
        flexShrink: 1,
        color: '#999',
        fontSize: 14,
        fontFamily: 'LilitaOne',
    },
    badge: {
        minWidth: 24,
        height: 24,
        paddingHorizontal: 7,
        borderRadius: 12,
        backgroundColor: '#facc15',
        justifyContent: 'center',
        alignItems: 'center',
    },
    badgeSkeleton: {
        width: 24,
        backgroundColor: '#333',
    },
    badgeEmpty: {
        backgroundColor: '#333',
    },
    badgeText: {
        color: '#000',
        fontSize: 13,
        fontFamily: 'LilitaOne',
    },
    badgeTextEmpty: {
        color: '#999',
    },
});
