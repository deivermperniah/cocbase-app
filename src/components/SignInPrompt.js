import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function SignInPrompt({ icon, message }) {
    const navigation = useNavigation();

    return (
        <View style={styles.container}>
            <Ionicons name={icon} size={40} color="#facc15" />
            <Text style={styles.message}>{message}</Text>
            <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Auth')}>
                <Text style={styles.buttonText}>Iniciar sesión</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 15,
    },
    message: {
        color: '#fff',
        fontSize: 18,
        fontFamily: 'LilitaOne',
        textAlign: 'center',
        marginTop: 10,
        marginBottom: 15,
    },
    button: {
        backgroundColor: '#facc15',
        paddingHorizontal: 30,
        paddingVertical: 12,
        borderRadius: 25,
        boxShadow: '0px 2px 4px rgba(250, 204, 21, 0.3)',
    },
    buttonText: {
        color: '#000',
        fontSize: 14,
        fontFamily: 'LilitaOne',
    },
});
