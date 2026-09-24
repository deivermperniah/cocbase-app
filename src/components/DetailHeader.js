import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

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
                <Ionicons name="arrow-back" size={25} color="#facc15" />
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
            <Ionicons name={icon} size={25} color="#facc15" />
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
        backgroundColor: '#0a0a0a',
    },
    bordered: {
        borderBottomWidth: 1,
        borderBottomColor: '#333',
    },
    sideButton: {
        padding: 5,
    },
    sidePlaceholder: {
        width: 35,
    },
    title: {
        flexShrink: 1,
        color: '#facc15',
        fontSize: 18,
        fontFamily: 'LilitaOne',
    },
});
