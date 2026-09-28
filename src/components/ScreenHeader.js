import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, FONT } from '../lib/theme';

export default function ScreenHeader({ title, subtitle }) {
    return (
        <View style={styles.header}>
            <Text style={styles.headerTitle}>{title}</Text>
            <Text style={styles.headerSubtitle}>{subtitle}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    header: {
        paddingHorizontal: 15,
        paddingTop: 15,
        paddingBottom: 15,
        backgroundColor: COLORS.background,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    headerTitle: {
        color: COLORS.primary,
        fontSize: 28,
        marginBottom: 5,
        fontFamily: FONT,
    },
    headerSubtitle: {
        color: COLORS.textMuted,
        fontSize: 14,
        fontFamily: FONT,
    },
});
