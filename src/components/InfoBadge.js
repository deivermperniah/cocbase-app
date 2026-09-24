import React from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { View, Text, StyleSheet } from 'react-native';

export default function InfoBadge({ icon, label }) {
    return (
        <View style={styles.badge}>
            <MaterialCommunityIcons name={icon} size={16} color="#000" />
            <Text style={styles.badgeText}>{label}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        backgroundColor: '#facc15',
        boxShadow: '0px 2px 2px rgba(0, 0, 0, 0.3)',
    },
    badgeText: {
        color: '#000',
        fontSize: 15,
        fontFamily: 'LilitaOne',
    },
});
