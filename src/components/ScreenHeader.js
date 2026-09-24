import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

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
        backgroundColor: '#0a0a0a',
        borderBottomWidth: 1,
        borderBottomColor: '#333',
    },
    headerTitle: {
        color: '#facc15',
        fontSize: 28,
        marginBottom: 5,
        fontFamily: 'LilitaOne',
    },
    headerSubtitle: {
        color: '#999',
        fontSize: 14,
        fontFamily: 'LilitaOne',
    },
});
