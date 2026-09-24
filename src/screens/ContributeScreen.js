import React, { useCallback, useEffect, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, KeyboardAvoidingView, RefreshControl, Platform, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../lib/supabase';
import { getBaseTypeIcon } from '../lib/constants';
import { formatRelativeDate } from '../lib/format';
import { confirmAction, showMessage } from '../lib/dialogs';
import { SUBMISSION_COLUMNS, deleteRejectedSubmission } from '../lib/baseSubmission';
import { useAuth } from '../context/AuthContext';
import ScreenHeader from '../components/ScreenHeader';
import SignInPrompt from '../components/SignInPrompt';
import BaseForm from '../components/BaseForm';
import InfoBadge from '../components/InfoBadge';

const STATUS_GROUPS = [
    { status: 'pending', title: 'En revisión', icon: 'time-outline', color: '#999' },
    { status: 'approved', title: 'Aprobadas', icon: 'checkmark-circle-outline', color: '#facc15' },
    { status: 'rejected', title: 'Rechazadas', icon: 'close-circle-outline', color: '#f87171' },
];

function SubmissionItem({ submission, onDelete }) {
    const isRejected = submission.status === 'rejected';

    return (
        <View style={[styles.submission, isRejected && styles.submissionRejected]}>
            <View style={styles.submissionRow}>
                <InfoBadge icon="castle" label={submission.level_th} />
                <InfoBadge icon={getBaseTypeIcon(submission.type)} label={submission.type} />
                <Text style={styles.dateText} numberOfLines={1}>{formatRelativeDate(submission.created_at)}</Text>
            </View>
            {isRejected && (
                <View style={styles.rejection}>
                    <Text style={styles.noteText} numberOfLines={2}>
                        <Text style={styles.noteLabel}>Motivo: </Text>
                        {submission.review_note || 'sin especificar'}
                    </Text>
                    <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={() => onDelete(submission)}
                        accessibilityRole="button"
                        accessibilityLabel="Eliminar base rechazada"
                    >
                        <Ionicons name="trash-outline" size={18} color="#f87171" />
                        <Text style={styles.deleteText}>Eliminar</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
}

function SubmissionGroups({ submissions, onDelete }) {
    return STATUS_GROUPS.map(({ status, title, icon, color }) => {
        const items = submissions.filter(submission => submission.status === status);
        if (items.length === 0) return null;

        return (
            <View key={status} style={styles.group}>
                <View style={styles.groupHeader}>
                    <Ionicons name={icon} size={16} color={color} />
                    <Text style={[styles.groupTitle, { color }]}>{title}</Text>
                </View>
                {items.map(submission => (
                    <SubmissionItem key={submission.id} submission={submission} onDelete={onDelete} />
                ))}
            </View>
        );
    });
}

export default function ContributeScreen() {
    const { user } = useAuth();
    const [submissions, setSubmissions] = useState([]);
    const [loadingSubmissions, setLoadingSubmissions] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    const userId = user?.id;

    const fetchSubmissions = useCallback(async () => {
        if (!userId) return;

        const { data, error } = await supabase
            .from('bases')
            .select(SUBMISSION_COLUMNS)
            .eq('author_id', userId)
            .order('created_at', { ascending: false });

        if (!error) setSubmissions(data);
    }, [userId]);

    useEffect(() => {
        setSubmissions([]);
        if (!userId) return;

        setLoadingSubmissions(true);
        fetchSubmissions().finally(() => setLoadingSubmissions(false));
    }, [userId, fetchSubmissions]);

    const handleRefresh = useCallback(async () => {
        setRefreshing(true);
        await fetchSubmissions();
        setRefreshing(false);
    }, [fetchSubmissions]);

    const handleSubmitted = (submission) => {
        setSubmissions(previous => [submission, ...previous]);
        showMessage('¡Base registrada!', 'Tu base quedó en revisión. Un administrador la revisará pronto.');
    };

    const handleDelete = async (submission) => {
        const confirmed = await confirmAction(
            'Eliminar base',
            `Se eliminará ${submission.code} de tus envíos. Esta acción no se puede deshacer.`,
            'Eliminar',
        );
        if (!confirmed) return;

        try {
            await deleteRejectedSubmission(submission.id);
            setSubmissions(previous => previous.filter(item => item.id !== submission.id));
        } catch (error) {
            showMessage('Eliminar base', error.message);
        }
    };

    if (!user) {
        return (
            <SafeAreaView style={styles.container} edges={['top']}>
                <ScreenHeader title="Contribuir" subtitle="Comparte tu diseño con la comunidad" />
                <SignInPrompt icon="add-circle-outline" message="Inicia sesión para compartir tus bases" />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <ScreenHeader title="Contribuir" subtitle="Comparte tu diseño con la comunidad" />
            <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                <ScrollView
                    contentContainerStyle={styles.content}
                    keyboardShouldPersistTaps="handled"
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
                >
                    <View style={styles.notice}>
                        <Ionicons name="information-circle-outline" size={20} color="#facc15" />
                        <Text style={styles.noticeText}>
                            Revisa que la base no esté repetida y que la captura sea clara. Las bases aprobadas aparecen para todos.
                        </Text>
                    </View>

                    <BaseForm userId={userId} onSubmitted={handleSubmitted} />

                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>Mis envíos</Text>
                        {loadingSubmissions ? (
                            <ActivityIndicator color="#facc15" style={styles.submissionsLoader} />
                        ) : submissions.length > 0 ? (
                            <View style={styles.submissions}>
                                <SubmissionGroups submissions={submissions} onDelete={handleDelete} />
                            </View>
                        ) : (
                            <Text style={styles.emptyText}>Aún no has enviado bases.</Text>
                        )}
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
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
    content: {
        padding: 15,
        gap: 15,
    },
    notice: {
        flexDirection: 'row',
        gap: 10,
        padding: 15,
        borderRadius: 12,
        backgroundColor: '#1a1a1a',
        borderWidth: 1,
        borderColor: 'rgba(250, 204, 21, 0.2)',
    },
    noticeText: {
        flex: 1,
        color: '#999',
        fontSize: 14,
        fontFamily: 'LilitaOne',
        lineHeight: 18,
    },
    card: {
        backgroundColor: '#1a1a1a',
        borderRadius: 12,
        padding: 15,
    },
    cardTitle: {
        color: '#facc15',
        fontSize: 18,
        fontFamily: 'LilitaOne',
        marginBottom: 5,
    },
    submissionsLoader: {
        paddingVertical: 20,
    },
    submissions: {
        gap: 18,
        marginTop: 10,
    },
    group: {
        gap: 10,
    },
    groupHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    groupTitle: {
        fontSize: 13,
        fontFamily: 'LilitaOne',
        textTransform: 'uppercase',
    },
    submission: {
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#333',
        backgroundColor: '#2a2a2a',
        overflow: 'hidden',
    },
    submissionRejected: {
        borderColor: 'rgba(239, 68, 68, 0.4)',
    },
    submissionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        padding: 12,
    },
    rejection: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingHorizontal: 12,
        paddingVertical: 10,
        backgroundColor: 'rgba(239, 68, 68, 0.15)',
    },
    noteLabel: {
        color: '#f87171',
    },
    noteText: {
        flex: 1,
        color: '#fca5a5',
        fontSize: 13,
        fontFamily: 'LilitaOne',
    },
    deleteButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        height: 36,
        paddingHorizontal: 14,
        borderRadius: 8,
        backgroundColor: '#1a1a1a',
    },
    deleteText: {
        color: '#f87171',
        fontSize: 14,
        fontFamily: 'LilitaOne',
    },
    dateText: {
        flex: 1,
        textAlign: 'right',
        color: '#999',
        fontSize: 13,
        fontFamily: 'LilitaOne',
    },
    emptyText: {
        color: '#999',
        fontSize: 14,
        fontFamily: 'LilitaOne',
        textAlign: 'center',
        paddingVertical: 20,
    },
});
