import React from 'react';
import { StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { showMessage } from '../lib/dialogs';
import DetailHeader from '../components/DetailHeader';
import BaseForm from '../components/BaseForm';
import { COLORS } from '../lib/theme';

export default function NewBaseScreen({ navigation }) {
    const { user } = useAuth();

    const handleSubmitted = (base) => {
        showMessage('¡Base publicada!', 'Ya está disponible para todos.');
        navigation.goBack();
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <DetailHeader title="Nueva base" />
            <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                <ScrollView
                    contentContainerStyle={styles.content}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    <BaseForm userId={user.id} publish onSubmitted={handleSubmitted} />
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    flex: {
        flex: 1,
    },
    content: {
        padding: 15,
    },
});
