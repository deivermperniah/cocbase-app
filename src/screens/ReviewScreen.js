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
                            ? <ActivityIndicator size="small" color="#000" />
                            : <Ionicons name="checkmark" size={18} color="#000" />}
                        <Text style={styles.approveText}>Aprobar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.actionButton, styles.rejectButton, busy && styles.actionDisabled]}
                        onPress={() => onReject(base)}
                        disabled={busy}
                    >
                        <Ionicons name="close" size={18} color="#f87171" />
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
                            <Ionicons name="open-outline" size={20} color="#facc15" />
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        </View>
    );
}

function RejectModal({ base, onCancel, onConfirm }) {
    const [note, setNote] = useState('');
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
                        style={styles.noteInput}
                        value={note}
                        onChangeText={setNote}
                        placeholder="Ej: la captura no corresponde a la base"
                        placeholderTextColor="#666"
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
                                ? <ActivityIndicator size="small" color="#fff" />
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
            showMessage('Comunidad', 'No se pudo aprobar la base.');
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
            showMessage('Comunidad', 'No se pudo rechazar la base.');
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
            return (
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color="#facc15" />
                </View>
            );
        }

        if (error && pending.length === 0) {
            return (
                <View style={styles.centerContainer}>
                    <Ionicons name="cloud-offline-outline" size={40} color="#facc15" />
                    <Text style={styles.messageText}>Error al cargar</Text>
                    <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
                        <Text style={styles.retryButtonText}>Reintentar</Text>
                    </TouchableOpacity>
                </View>
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
                        colors={['#facc15']}
                        tintColor="#facc15"
                        progressBackgroundColor="#1a1a1a"
                    />
                }
                ListEmptyComponent={
                    <View style={styles.empty}>
                        <Ionicons name="checkmark-done-outline" size={40} color="#facc15" />
                        <Text style={styles.emptyText}>No hay bases pendientes de revisión.</Text>
                    </View>
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
        backgroundColor: '#0a0a0a',
    },
    flex: {
        flex: 1,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 15,
    },
    messageText: {
        color: '#fff',
        fontSize: 18,
        fontFamily: 'LilitaOne',
        marginTop: 10,
        marginBottom: 15,
    },
    retryButton: {
        backgroundColor: '#facc15',
        paddingHorizontal: 30,
        paddingVertical: 12,
        borderRadius: 25,
    },
    retryButtonText: {
        color: '#000',
        fontSize: 14,
        fontFamily: 'LilitaOne',
    },
    list: {
        padding: 15,
        gap: 15,
        flexGrow: 1,
    },
    empty: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 10,
    },
    emptyText: {
        color: '#999',
        fontSize: 16,
        fontFamily: 'LilitaOne',
        textAlign: 'center',
    },
    card: {
        backgroundColor: '#1a1a1a',
        borderRadius: 12,
        overflow: 'hidden',
    },
    image: {
        width: '100%',
        height: 200,
        backgroundColor: '#2a2a2a',
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
        borderRadius: 19,
        backgroundColor: '#333',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        color: '#facc15',
        fontSize: 17,
        fontFamily: 'LilitaOne',
    },
    authorName: {
        flex: 1,
        color: '#fff',
        fontSize: 16,
        fontFamily: 'LilitaOne',
    },
    date: {
        color: '#999',
        fontSize: 13,
        fontFamily: 'LilitaOne',
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
        borderRadius: 8,
    },
    actionDisabled: {
        opacity: 0.6,
    },
    approveButton: {
        backgroundColor: '#facc15',
    },
    approveText: {
        color: '#000',
        fontSize: 14,
        fontFamily: 'LilitaOne',
    },
    rejectButton: {
        backgroundColor: '#333',
    },
    rejectText: {
        color: '#f87171',
        fontSize: 14,
        fontFamily: 'LilitaOne',
    },
    linkButton: {
        width: 44,
        height: 36,
        borderRadius: 8,
        backgroundColor: '#333',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        width: '90%',
        maxWidth: 420,
        backgroundColor: '#1a1a1a',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(239, 68, 68, 0.2)',
        padding: 20,
        gap: 10,
    },
    modalTitle: {
        color: '#facc15',
        fontSize: 20,
        fontFamily: 'LilitaOne',
        textAlign: 'center',
        marginBottom: 5,
    },
    modalLabel: {
        color: '#999',
        fontSize: 12,
        fontFamily: 'LilitaOne',
    },
    noteInput: {
        minHeight: 90,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#333',
        backgroundColor: '#2a2a2a',
        padding: 12,
        color: '#fff',
        fontSize: 15,
        textAlignVertical: 'top',
    },
    modalActions: {
        flexDirection: 'row',
        gap: 10,
        marginTop: 5,
    },
    modalButton: {
        flex: 1,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cancelButton: {
        backgroundColor: '#2a2a2a',
        borderWidth: 1,
        borderColor: '#333',
    },
    cancelText: {
        color: '#999',
        fontSize: 14,
        fontFamily: 'LilitaOne',
    },
    confirmRejectButton: {
        backgroundColor: '#dc2626',
    },
    confirmRejectText: {
        color: '#fff',
        fontSize: 14,
        fontFamily: 'LilitaOne',
    },
});
