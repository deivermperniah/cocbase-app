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
import { COLORS, FONT, FONT_SIZE, RADIUS } from '../lib/theme';
import { COLUMN_MIN_WIDTH, useGrid } from '../lib/layout';

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
    const { columns, onLayout } = useGrid(COLUMN_MIN_WIDTH);
    const split = columns > 1;

    const confirmSignOut = async () => {
        if (await confirmAction('¿Cerrar sesión?', 'Tus favoritos quedan guardados en tu cuenta.', 'Cerrar sesión', { icon: 'log-out-outline' })) {
            signOut();
        }
    };

    const openWeb = (path) => Linking.openURL(`${WEB_URL}${path}`).catch(() => {});

    return (
        <SafeAreaView style={styles.container} edges={['top', 'right']}>
            <ScreenHeader title="Ajustes" subtitle="Cuenta y aplicación" />
            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} onLayout={onLayout}>
                <View style={[styles.sections, split && styles.sectionsSplit]}>
                    <View style={split && styles.column}>
                        <ListSection title="Cuenta">
                            {user ? [
                                <ProfileHeader key="profile" name={profile?.full_name || 'Usuario'} email={user.email} isAdmin={isAdmin} />,
                                <ListRow key="signOut" icon="log-out-outline" label="Cerrar sesión" onPress={confirmSignOut} />,
                            ] : (
                                <ListRow icon="log-in-outline" label="Iniciar sesión" onPress={() => navigation.navigate('Auth')} />
                            )}
                        </ListSection>
                    </View>

                    <View style={split && styles.column}>
                        <ListSection title="Información">
                            <ListRow icon="information-circle-outline" label="Versión" value={Constants.expoConfig?.version} />
                            <ListRow icon="document-text-outline" label="Aviso legal" onPress={() => openWeb('/aviso-legal')} />
                            <ListRow icon="shield-checkmark-outline" label="Privacidad" onPress={() => openWeb('/privacidad')} />
                        </ListSection>
                    </View>
                </View>

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
        backgroundColor: COLORS.background,
    },
    content: {
        padding: 15,
        gap: 20,
    },
    sections: {
        gap: 20,
    },
    sectionsSplit: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 15,
    },
    column: {
        flex: 1,
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
        borderRadius: RADIUS.pill,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        color: COLORS.onPrimary,
        fontSize: FONT_SIZE.heading,
        fontFamily: FONT,
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
        color: COLORS.text,
        fontSize: FONT_SIZE.title,
        fontFamily: FONT,
    },
    profileEmail: {
        color: COLORS.textMuted,
        fontSize: FONT_SIZE.small,
        fontFamily: FONT,
    },
    roleBadge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: RADIUS.sm,
        backgroundColor: 'rgba(250, 204, 21, 0.15)',
    },
    roleBadgeText: {
        color: COLORS.primary,
        fontSize: FONT_SIZE.caption,
        fontFamily: FONT,
    },
    disclaimer: {
        color: COLORS.textMuted,
        fontSize: FONT_SIZE.caption,
        fontFamily: FONT,
        textAlign: 'center',
        lineHeight: 16,
        paddingHorizontal: 10,
    },
});
