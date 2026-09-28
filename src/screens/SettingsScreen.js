import React from 'react';
import { View, Text, StyleSheet, ScrollView, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Constants from 'expo-constants';
import { useAuth } from '../context/AuthContext';
import { confirmAction } from '../lib/dialogs';
import { WEB_URL } from '../lib/constants';
import ScreenHeader from '../components/ScreenHeader';
import { ListRow, ListSection, listStyles } from '../components/ListSection';

function ProfileHeader({ name, email, isAdmin, isLast }) {
    return (
        <View style={[styles.profile, !isLast && listStyles.divider]}>
            <View style={styles.avatar}>
                <Text style={styles.avatarText}>{name.charAt(0).toUpperCase()}</Text>
            </View>
            <View style={styles.profileInfo}>
                <View style={styles.profileNameRow}>
                    <Text style={styles.profileName} numberOfLines={1}>{name}</Text>
                    {isAdmin && (
                        <View style={styles.roleBadge}>
                            <Text style={styles.roleBadgeText}>Admin</Text>
                        </View>
                    )}
                </View>
                <Text style={styles.profileEmail} numberOfLines={1}>{email}</Text>
            </View>
        </View>
    );
}

export default function SettingsScreen() {
    const navigation = useNavigation();
    const { user, profile, isAdmin, signOut } = useAuth();

    const confirmSignOut = async () => {
        if (await confirmAction('¿Cerrar sesión?', 'Tus favoritos quedan guardados en tu cuenta.', 'Cerrar sesión', { icon: 'log-out-outline' })) {
            signOut();
        }
    };

    const openWeb = (path) => Linking.openURL(`${WEB_URL}${path}`).catch(() => {});

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <ScreenHeader title="Ajustes" subtitle="Cuenta y aplicación" />
            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <ListSection title="Cuenta">
                    {user ? [
                        <ProfileHeader key="profile" name={profile?.full_name || 'Usuario'} email={user.email} isAdmin={isAdmin} />,
                        <ListRow key="signOut" icon="log-out-outline" label="Cerrar sesión" onPress={confirmSignOut} />,
                    ] : (
                        <ListRow icon="log-in-outline" label="Iniciar sesión" onPress={() => navigation.navigate('Auth')} />
                    )}
                </ListSection>

                <ListSection title="Información">
                    <ListRow icon="information-circle-outline" label="Versión" value={Constants.expoConfig?.version} />
                    <ListRow icon="document-text-outline" label="Aviso legal" onPress={() => openWeb('/aviso-legal')} />
                    <ListRow icon="shield-checkmark-outline" label="Privacidad" onPress={() => openWeb('/privacidad')} />
                </ListSection>

                <Text style={styles.disclaimer}>
                    Clash of Clans es una marca registrada de Supercell Oy. cocbase es un proyecto de la comunidad y no está afiliado, patrocinado ni respaldado por Supercell.
                </Text>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0a0a0a',
    },
    content: {
        padding: 15,
        gap: 20,
    },
    profile: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        padding: 15,
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#facc15',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        color: '#000',
        fontSize: 22,
        fontFamily: 'LilitaOne',
    },
    profileInfo: {
        flex: 1,
        gap: 2,
    },
    profileNameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    profileName: {
        flexShrink: 1,
        color: '#fff',
        fontSize: 18,
        fontFamily: 'LilitaOne',
    },
    profileEmail: {
        color: '#999',
        fontSize: 14,
        fontFamily: 'LilitaOne',
    },
    roleBadge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 5,
        backgroundColor: 'rgba(250, 204, 21, 0.15)',
    },
    roleBadgeText: {
        color: '#facc15',
        fontSize: 12,
        fontFamily: 'LilitaOne',
    },
    disclaimer: {
        color: '#666',
        fontSize: 12,
        fontFamily: 'LilitaOne',
        textAlign: 'center',
        lineHeight: 16,
        paddingHorizontal: 10,
    },
});
