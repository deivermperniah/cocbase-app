import React from 'react';
import { useNavigation } from '@react-navigation/native';
import StateMessage from './StateMessage';

export default function SignInPrompt({ icon, message }) {
    const navigation = useNavigation();

    return (
        <StateMessage
            icon={icon}
            message={message}
            actionLabel="Iniciar sesión"
            onAction={() => navigation.navigate('Auth')}
        />
    );
}
