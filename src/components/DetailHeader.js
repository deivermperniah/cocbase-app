import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS, FONT, FONT_SIZE } from '../lib/theme';

export default function DetailHeader({ title, onBack, right, bordered = true }) {
    const navigation = useNavigation();

    return (
        <View style={[styles.header, bordered && styles.bordered]}>
            <TouchableOpacity
                onPress={onBack ?? (() => navigation.goBack())}
                style={styles.sideButton}
                accessibilityRole="button"
                accessibilityLabel="Volver"
            >
                <Ionicons name="arrow-back" size={25} color={COLORS.primary} />
            </TouchableOpacity>
            <Text style={styles.title} numberOfLines={1}>{title}</Text>
            {right ?? <View style={styles.sidePlaceholder} />}
        </View>
    );
}

export function DetailHeaderButton({ icon, label, onPress }) {
    return (
        <TouchableOpacity
            onPress={onPress}
            style={styles.sideButton}
            accessibilityRole="button"
            accessibilityLabel={label}
        >
            <Ionicons name={icon} size={25} color={COLORS.primary} />
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 15,
        paddingTop: 15,
        paddingBottom: 15,
        backgroundColor: COLORS.background,
    },
    bordered: {
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    sideButton: {
        padding: 5,
    },
    sidePlaceholder: {
        width: 35,
    },
    title: {
        flexShrink: 1,
        color: COLORS.primary,
        fontSize: FONT_SIZE.title,
        fontFamily: FONT,
    },
});
