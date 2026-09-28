import React from 'react';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, FONT } from '../lib/theme';

const ICON_SETS = {
    ionicons: Ionicons,
    mci: MaterialCommunityIcons,
};

export default function StateMessage({ icon, iconSet = 'ionicons', message, actionLabel, onAction }) {
    const Icon = ICON_SETS[iconSet];

    return (
        <View style={styles.container}>
            <Icon name={icon} size={40} color={COLORS.primary} />
            <Text style={[styles.message, actionLabel && styles.messageProminent]}>{message}</Text>
            {actionLabel && (
                <TouchableOpacity style={styles.button} onPress={onAction}>
                    <Text style={styles.buttonText}>{actionLabel}</Text>
                </TouchableOpacity>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 10,
        padding: 15,
    },
    message: {
        color: COLORS.textMuted,
        fontSize: 16,
        fontFamily: FONT,
        textAlign: 'center',
    },
    messageProminent: {
        color: COLORS.text,
        fontSize: 18,
    },
    button: {
        marginTop: 5,
        paddingHorizontal: 30,
        paddingVertical: 12,
        borderRadius: 25,
        backgroundColor: COLORS.primary,
        boxShadow: '0px 2px 4px rgba(250, 204, 21, 0.3)',
    },
    buttonText: {
        color: COLORS.onPrimary,
        fontSize: 14,
        fontFamily: FONT,
    },
});
