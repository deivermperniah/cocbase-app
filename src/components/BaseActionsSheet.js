import React, { useRef } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, StyleSheet, TouchableOpacity, Pressable, Modal, Share, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { showMessage } from '../lib/dialogs';
import { getBaseTypeIcon } from '../lib/constants';
import InfoBadge from './InfoBadge';
import { COLORS, FONT } from '../lib/theme';

const DEFAULT_DESIGNER = 'Deiver Pernia';

function formatDate(value) {
    if (!value) return '—';
    return new Date(value).toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    });
}

async function shareBase(base) {
    const url = base.link || base.url_foto;
    const message = `Base de ${base.type} · Nivel ${base.level_th}\n${url}`;

    if (Platform.OS === 'web' && !navigator.share) {
        await navigator.clipboard.writeText(url);
        showMessage('Enlace copiado', 'Pégalo donde quieras compartir la base.');
        return;
    }

    await Share.share({ message });
}

function DetailRow({ label, value, isFirst }) {
    return (
        <View style={[styles.detailRow, !isFirst && styles.divider]}>
            <Text style={styles.detailLabel}>{label}</Text>
            <Text style={styles.detailValue} numberOfLines={1}>{value}</Text>
        </View>
    );
}

function ActionRow({ icon, label, onPress, danger, isFirst }) {
    const color = danger ? COLORS.danger : COLORS.text;

    return (
        <TouchableOpacity style={[styles.actionRow, !isFirst && styles.divider]} onPress={onPress} activeOpacity={0.7}>
            <Ionicons name={icon} size={20} color={danger ? COLORS.danger : COLORS.primary} />
            <Text style={[styles.actionLabel, { color }]}>{label}</Text>
        </TouchableOpacity>
    );
}

export default function BaseActionsSheet({ base, onClose, onDelete }) {
    const insets = useSafeAreaInsets();
    const lastBase = useRef(base);
    if (base) lastBase.current = base;
    const shownBase = lastBase.current;

    const canShare = Boolean(shownBase?.link || shownBase?.url_foto);
    const hasActions = canShare || Boolean(onDelete);

    const handleShare = () => {
        onClose();
        shareBase(shownBase).catch(() => {});
    };

    const handleDelete = () => {
        onClose();
        onDelete(shownBase);
    };

    return (
        <Modal transparent visible={base !== null} animationType="slide" onRequestClose={onClose}>
            <Pressable style={styles.overlay} onPress={onClose} accessibilityLabel="Cerrar">
                <Pressable style={[styles.sheet, { paddingBottom: 20 + insets.bottom }]}>
                    <View style={styles.handle} />

                    {shownBase && (
                        <>
                            <View style={styles.badges}>
                                <InfoBadge icon="castle" label={shownBase.level_th} />
                                <InfoBadge icon={getBaseTypeIcon(shownBase.type)} label={shownBase.type} />
                            </View>

                            <View style={styles.group}>
                                <DetailRow label="Diseñador" value={shownBase.profiles?.full_name || DEFAULT_DESIGNER} isFirst />
                                <DetailRow label="Publicado" value={formatDate(shownBase.created_at)} />
                            </View>

                            {hasActions && (
                                <View style={styles.group}>
                                    {canShare && <ActionRow icon="share-social-outline" label="Compartir" onPress={handleShare} isFirst />}
                                    {onDelete && <ActionRow icon="trash-outline" label="Eliminar base" onPress={handleDelete} danger isFirst={!canShare} />}
                                </View>
                            )}
                        </>
                    )}

                    <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                        <Text style={styles.closeButtonText}>Cerrar</Text>
                    </TouchableOpacity>
                </Pressable>
            </Pressable>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
    },
    sheet: {
        backgroundColor: COLORS.surface,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingHorizontal: 20,
        paddingTop: 10,
        gap: 15,
    },
    handle: {
        alignSelf: 'center',
        width: 40,
        height: 4,
        borderRadius: 2,
        backgroundColor: COLORS.borderStrong,
        marginBottom: 5,
    },
    badges: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 10,
    },
    group: {
        backgroundColor: COLORS.surfaceAlt,
        borderRadius: 12,
        overflow: 'hidden',
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 10,
        paddingHorizontal: 15,
        paddingVertical: 12,
    },
    divider: {
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: COLORS.borderStrong,
    },
    detailLabel: {
        color: COLORS.textMuted,
        fontSize: 15,
        fontFamily: FONT,
    },
    detailValue: {
        flexShrink: 1,
        color: COLORS.text,
        fontSize: 15,
        fontFamily: FONT,
    },
    actionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingHorizontal: 15,
        paddingVertical: 14,
    },
    actionLabel: {
        fontSize: 16,
        fontFamily: FONT,
    },
    closeButton: {
        height: 48,
        borderRadius: 24,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    closeButtonText: {
        color: COLORS.onPrimary,
        fontSize: 16,
        fontFamily: FONT,
    },
});
