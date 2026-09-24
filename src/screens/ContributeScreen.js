import React, { useCallback, useEffect, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, KeyboardAvoidingView, RefreshControl, Platform, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../lib/supabase';
import { STATUS_LABELS } from '../lib/constants';
import { confirmAction, showMessage } from '../lib/dialogs';
import { SUBMISSION_COLUMNS, deleteRejectedSubmission } from '../lib/baseSubmission';
import { useAuth } from '../context/AuthContext';
import ScreenHeader from '../components/ScreenHeader';
import SignInPrompt from '../components/SignInPrompt';
import BaseForm from '../components/BaseForm';

function SubmissionItem({ submission, onDelete }) {
    return (
        <View style={styles.submission}>
            <View style={styles.submissionInfo}>
                <Text style={styles.submissionCode} numberOfLines={1}>{submission.code}</Text>
                <Text style={styles.submissionMeta}>Nivel {submission.level_th} · {submission.type}</Text>
                {submission.review_note ? (
                    <Text style={styles.submissionNote} numberOfLines={2}>{submission.review_note}</Text>
                ) : null}
            </View>
            <View style={[styles.statusBadge, styles[`status_${submission.status}`]]}>
                <Text style={[styles.statusText, styles[`statusText_${submission.status}`]]}>
                    {STATUS_LABELS[submission.status]}
                </Text>
            </View>
            {submission.status === 'rejected' && (
                <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => onDelete(submission)}
                    hitSlop={4}
                    accessibilityRole="button"
                    accessibilityLabel="Eliminar base rechazada"
                >
                    <Ionicons name="trash-outline" size={20} color="#f87171" />
                </TouchableOpacity>
            )}
        </View>
    );
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
                                {submissions.map(submission => (
                                    <SubmissionItem key={submission.id} submission={submission} onDelete={handleDelete} />
                                ))}
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
        gap: 10,
        marginTop: 10,
    },
    submission: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        padding: 12,
        borderRadius: 8,
        backgroundColor: '#2a2a2a',
    },
    submissionInfo: {
        flex: 1,
        gap: 2,
    },
    submissionCode: {
        color: '#fff',
        fontSize: 15,
        fontFamily: 'LilitaOne',
    },
    submissionMeta: {
        color: '#999',
        fontSize: 13,
        fontFamily: 'LilitaOne',
    },
    submissionNote: {
        color: '#f87171',
        fontSize: 12,
        fontFamily: 'LilitaOne',
        marginTop: 2,
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 5,
    },
    statusText: {
        fontSize: 12,
        fontFamily: 'LilitaOne',
    },
    status_pending: {
        backgroundColor: '#333',
    },
    status_approved: {
        backgroundColor: '#facc15',
    },
    status_rejected: {
        backgroundColor: 'rgba(248, 113, 113, 0.15)',
    },
    statusText_pending: {
        color: '#ccc',
    },
    statusText_approved: {
        color: '#000',
    },
    statusText_rejected: {
        color: '#f87171',
    },
    deleteButton: {
        width: 44,
        height: 36,
        borderRadius: 8,
        backgroundColor: '#333',
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: {
        color: '#999',
        fontSize: 14,
        fontFamily: 'LilitaOne',
        textAlign: 'center',
        paddingVertical: 20,
    },
});
