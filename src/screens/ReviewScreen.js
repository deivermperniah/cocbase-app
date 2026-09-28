import React, { useCallback, useEffect, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator, RefreshControl, Modal, TextInput, Linking, KeyboardAvoidingView, Platform } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../lib/supabase';
import { REVIEW_COLUMNS, reviewBase } from '../lib/admin';
import { showMessage } from '../lib/dialogs';
import { getBaseTypeIcon } from '../lib/constants';
import { formatRelativeDate } from '../lib/format';
import DetailHeader from '../components/DetailHeader';
import ImageZoomModal from '../components/ImageZoomModal';
import InfoBadge from '../components/InfoBadge';
import StateMessage from '../components/StateMessage';
import BaseListSkeleton from '../components/BaseListSkeleton';
import { COLORS, FONT, REFRESH_CONTROL_THEME, FONT_SIZE, RADIUS, BUTTON, INPUT } from '../lib/theme';

function PendingCard({ base, busy, onApprove, onReject, onPressImage }) {
    const authorName = base.profiles?.full_name || 'Sin nombre';

    return (
        <View style={styles.card}>
            <TouchableOpacity activeOpacity={0.9} disabled={!base.url_foto} onPress={() => onPressImage(base.url_foto)}>
                <Image
                    source={base.url_foto ? { uri: base.url_foto } : null}
                    style={styles.image}
                    contentFit="cover"
                    cachePolicy="memory-disk"
                />
                <LinearGradient
                    colors={['transparent', 'rgba(0, 0, 0, 0.7)']}
                    style={styles.imageShade}
                />
                <View style={styles.badges}>
                    <InfoBadge icon="castle" label={base.level_th} />
                    <InfoBadge icon={getBaseTypeIcon(base.type)} label={base.type} />
                </View>
            </TouchableOpacity>

            <View style={styles.cardBody}>
                <View style={styles.authorRow}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>{authorName.charAt(0).toUpperCase()}</Text>
                    </View>
                    <Text style={styles.authorName} numberOfLines={1}>{authorName}</Text>
                    <Text style={styles.date}>{formatRelativeDate(base.created_at)}</Text>
                </View>

                <View style={styles.actions}>
                    <TouchableOpacity
                        style={[styles.actionButton, styles.approveButton, busy && styles.actionDisabled]}
                        onPress={() => onApprove(base)}
                        disabled={busy}
                    >
                        {busy
                            ? <ActivityIndicator size="small" color={COLORS.onPrimary} />
                            : <Ionicons name="checkmark" size={18} color={COLORS.onPrimary} />}
                        <Text style={styles.approveText}>Aprobar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.actionButton, styles.rejectButton, busy && styles.actionDisabled]}
                        onPress={() => onReject(base)}
                        disabled={busy}
                    >
                        <Ionicons name="close" size={18} color={COLORS.danger} />
                        <Text style={styles.rejectText}>Rechazar</Text>
                    </TouchableOpacity>
                    {base.link && (
                        <TouchableOpacity
                            style={styles.linkButton}
                            onPress={() => Linking.openURL(base.link).catch(() => {})}
                            hitSlop={4}
                            accessibilityRole="button"
                            accessibilityLabel="Abrir enlace de la base"
                        >
                            <Ionicons name="open-outline" size={20} color={COLORS.primary} />
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        </View>
    );
}

function RejectModal({ base, onCancel, onConfirm }) {
    const [note, setNote] = useState('');
    const [noteFocused, setNoteFocused] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (base) setNote('');
    }, [base]);

    const confirm = async () => {
        setSubmitting(true);
        await onConfirm(base, note.trim() || null);
        setSubmitting(false);
    };

    return (
        <Modal transparent visible={base !== null} animationType="fade" onRequestClose={onCancel}>
            <KeyboardAvoidingView style={styles.modalOverlay} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>Rechazar base</Text>
                    <Text style={styles.modalLabel}>Motivo (opcional)</Text>
                    <TextInput
                        style={[styles.noteInput, noteFocused && styles.noteInputFocused]}
                        onFocus={() => setNoteFocused(true)}
                        onBlur={() => setNoteFocused(false)}
                        value={note}
                        onChangeText={setNote}
                        placeholder="Ej: la captura no corresponde a la base"
                        placeholderTextColor={COLORS.placeholder}
                        multiline
                        maxLength={200}
                        editable={!submitting}
                    />
                    <View style={styles.modalActions}>
                        <TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={onCancel} disabled={submitting}>
                            <Text style={styles.cancelText}>Cancelar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.modalButton, styles.confirmRejectButton]} onPress={confirm} disabled={submitting}>
                            {submitting
                                ? <ActivityIndicator size="small" color={COLORS.text} />
                                : <Text style={styles.confirmRejectText}>Rechazar</Text>}
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
}

export default function ReviewScreen() {
    const [pending, setPending] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [busyId, setBusyId] = useState(null);
    const [rejectingBase, setRejectingBase] = useState(null);
    const [zoomImage, setZoomImage] = useState(null);

    const fetchPending = useCallback(async () => {
        const { data, error: fetchError } = await supabase
            .from('bases')
            .select(REVIEW_COLUMNS)
            .eq('status', 'pending')
            .order('created_at', { ascending: false });

        setError(Boolean(fetchError));
        if (!fetchError) setPending(data);
    }, []);

    useEffect(() => {
        fetchPending().finally(() => setLoading(false));
    }, [fetchPending]);

    const handleRefresh = useCallback(async () => {
        setRefreshing(true);
        await fetchPending();
        setRefreshing(false);
    }, [fetchPending]);

    const removeFromList = (baseId) => setPending(previous => previous.filter(item => item.id !== baseId));

    const handleApprove = useCallback(async (base) => {
        setBusyId(base.id);
        try {
            await reviewBase(base.id, 'approved');
            removeFromList(base.id);
        } catch {
            showMessage('No se pudo aprobar', 'Revisa tu conexión e inténtalo de nuevo.');
        } finally {
            setBusyId(null);
        }
    }, []);

    const handleConfirmReject = async (base, note) => {
        try {
            await reviewBase(base.id, 'rejected', note);
            removeFromList(base.id);
            setRejectingBase(null);
        } catch {
            showMessage('No se pudo rechazar', 'Revisa tu conexión e inténtalo de nuevo.');
        }
    };

    const renderItem = useCallback(({ item }) => (
        <PendingCard
            base={item}
            busy={busyId === item.id}
            onApprove={handleApprove}
            onReject={setRejectingBase}
            onPressImage={setZoomImage}
        />
    ), [busyId, handleApprove]);

    const renderContent = () => {
        if (loading) {
            return <BaseListSkeleton label="Cargando bases pendientes" />;
        }

        if (error && pending.length === 0) {
            return (
                <StateMessage
                    icon="cloud-offline-outline"
                    message="No se pudo cargar"
                    actionLabel="Reintentar"
                    onAction={handleRefresh}
                />
            );
        }

        return (
            <FlatList
                data={pending}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.list}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                        {...REFRESH_CONTROL_THEME}
                    />
                }
                ListEmptyComponent={
                    <StateMessage icon="checkmark-done-outline" message="No hay bases pendientes de revisión." />
                }
            />
        );
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <DetailHeader title="Comunidad" />
            <View style={styles.flex}>{renderContent()}</View>
            <RejectModal base={rejectingBase} onCancel={() => setRejectingBase(null)} onConfirm={handleConfirmReject} />
            <ImageZoomModal uri={zoomImage} onClose={() => setZoomImage(null)} />
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
    list: {
        padding: 15,
        gap: 15,
        flexGrow: 1,
    },
    card: {
        backgroundColor: COLORS.surface,
        borderRadius: RADIUS.md,
        overflow: 'hidden',
    },
    image: {
        width: '100%',
        height: 200,
        backgroundColor: COLORS.surfaceAlt,
    },
    imageShade: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        height: 90,
        pointerEvents: 'none',
    },
    badges: {
        position: 'absolute',
        left: 12,
        bottom: 12,
        flexDirection: 'row',
        gap: 8,
        pointerEvents: 'none',
    },
    cardBody: {
        padding: 15,
        gap: 15,
    },
    authorRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    avatar: {
        width: 38,
        height: 38,
        borderRadius: RADIUS.pill,
        backgroundColor: COLORS.border,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        color: COLORS.primary,
        fontSize: FONT_SIZE.body,
        fontFamily: FONT,
    },
    authorName: {
        flex: 1,
        color: COLORS.text,
        fontSize: FONT_SIZE.body,
        fontFamily: FONT,
    },
    date: {
        color: COLORS.textMuted,
        fontSize: FONT_SIZE.caption,
        fontFamily: FONT,
    },
    actions: {
        flexDirection: 'row',
        gap: 10,
    },
    actionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        height: 36,
        borderRadius: RADIUS.sm,
    },
    actionDisabled: {
        opacity: 0.6,
    },
    approveButton: {
        backgroundColor: COLORS.primary,
    },
    approveText: {
        color: COLORS.onPrimary,
        fontSize: FONT_SIZE.small,
        fontFamily: FONT,
    },
    rejectButton: {
        backgroundColor: COLORS.border,
    },
    rejectText: {
        color: COLORS.danger,
        fontSize: FONT_SIZE.small,
        fontFamily: FONT,
    },
    linkButton: {
        width: 44,
        height: 36,
        borderRadius: RADIUS.sm,
        backgroundColor: COLORS.border,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
    },
    noteInputFocused: {
        borderColor: COLORS.primary,
    },
    modalContent: {
        width: '100%',
        maxWidth: 420,
        gap: 10,
        padding: 24,
        borderRadius: RADIUS.lg,
        borderWidth: 1,
        borderColor: 'rgba(239, 68, 68, 0.3)',
        backgroundColor: COLORS.surface,
    },
    modalTitle: {
        color: COLORS.text,
        fontSize: FONT_SIZE.heading,
        fontFamily: FONT,
        textAlign: 'center',
        marginBottom: 5,
    },
    modalLabel: {
        color: COLORS.textMuted,
        fontSize: FONT_SIZE.caption,
        fontFamily: FONT,
    },
    noteInput: {
        ...INPUT,
        height: undefined,
        minHeight: 90,
        paddingVertical: 12,
        textAlignVertical: 'top',
    },
    modalActions: {
        flexDirection: 'row',
        gap: 10,
        marginTop: 5,
    },
    modalButton: {
        ...BUTTON,
        flex: 1,
    },
    cancelButton: {
        backgroundColor: COLORS.surfaceAlt,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    cancelText: {
        color: COLORS.textMuted,
        fontSize: FONT_SIZE.body,
        fontFamily: FONT,
    },
    confirmRejectButton: {
        backgroundColor: COLORS.dangerStrong,
    },
    confirmRejectText: {
        color: COLORS.text,
        fontSize: FONT_SIZE.body,
        fontFamily: FONT,
    },
});
