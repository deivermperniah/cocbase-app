import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome } from '@expo/vector-icons';

export default function CollaborateScreen() {
    const openWhatsApp = () => {
        Linking.openURL('https://wa.me/51943458410');
    };

    const openTelegram = () => {
        Linking.openURL('https://t.me/deivermperniah');
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Colaborar</Text>
                <Text style={styles.headerSubtitle}>Escríbenos un mensaje</Text>
            </View>
            <View style={styles.content}>
                <Text style={styles.description}>
                    ¡Comparte tus mejores diseños con la comunidad! Tu base podría ser la próxima en ayudar a miles de jugadores.
                </Text>

                <TouchableOpacity style={[styles.button, styles.whatsappButton]} onPress={openWhatsApp}>
                    <FontAwesome name="whatsapp" size={30} color="white" />
                    <Text style={styles.buttonText}>WhatsApp</Text>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.button, styles.telegramButton]} onPress={openTelegram}>
                    <FontAwesome name="telegram" size={30} color="white" />
                    <Text style={styles.buttonText}>Telegram</Text>
                </TouchableOpacity>
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
    description: {
        color: '#ffffff',
        fontSize: 18,
        textAlign: 'center',
        marginBottom: 15,
        fontFamily: 'LilitaOne',
        lineHeight: 24,
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 15,
        paddingHorizontal: 30,
        borderRadius: 12,
        marginBottom: 15,
        width: '100%',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    whatsappButton: {
        backgroundColor: '#25D366',
    },
    telegramButton: {
        backgroundColor: '#0088cc',
    },
    buttonText: {
        color: 'white',
        fontSize: 18,
        fontFamily: 'LilitaOne',
        marginLeft: 15,
    }
});
