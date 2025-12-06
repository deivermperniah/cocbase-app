import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ColaborarScreen() {
    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Colaborar</Text>
                <Text style={styles.headerSubtitle}>Escribenos un mensaje</Text>
            </View>
            <View style={styles.content}>
                <View style={styles.developmentContainer}>
                    <Text style={styles.emoji}>👨‍💻</Text>
                    <Text style={styles.title}>En desarrollo</Text>
                    <Text style={styles.message}>Estamos trabajando en esta funcionalidad.</Text>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0a0a0a',
    },
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
    content: {
        flex: 1,
        padding: 15,
        justifyContent: 'center',
        alignItems: 'center',
    },
    developmentContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    emoji: {
        fontSize: 50,
        marginBottom: 15,
    },
    title: {
        color: '#facc15',
        fontSize: 28,
        fontFamily: 'LilitaOne',
        marginBottom: 5,
    },
    message: {
        color: '#ccc',
        fontSize: 14,
        textAlign: 'center',
        fontFamily: 'LilitaOne',
    }
});
