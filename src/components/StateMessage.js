import React from 'react';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, FONT, FONT_SIZE, BUTTON } from '../lib/theme';

const ICON_SETS = {
    ionicons: Ionicons,
    mci: MaterialCommunityIcons,
};

export default function StateMessage({ icon, iconSet = 'ionicons', message, actionLabel, onAction }) {
    const Icon = ICON_SETS[iconSet];

    return (
        <View style={styles.container}>
            <Icon name={icon} size={40} color={COLORS.primary} />
            <Text style={styles.message}>{message}</Text>
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
        fontSize: FONT_SIZE.body,
        fontFamily: FONT,
        textAlign: 'center',
    },
    button: {
        ...BUTTON,
        marginTop: 5,
        backgroundColor: COLORS.primary,
        boxShadow: '0px 2px 4px rgba(250, 204, 21, 0.3)',
    },
    buttonText: {
        color: COLORS.onPrimary,
        fontSize: FONT_SIZE.body,
        fontFamily: FONT,
    },
});
