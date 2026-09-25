import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Pressable } from 'react-native';
import { registerDialogPresenter } from '../lib/dialogs';

export default function DialogProvider({ children }) {
    const [dialog, setDialog] = useState(null);
    const resolveRef = useRef(null);
    const lastDialog = useRef(null);
    if (dialog) lastDialog.current = dialog;
    const shown = lastDialog.current;

    const close = useCallback((result) => {
        resolveRef.current?.(result);
        resolveRef.current = null;
        setDialog(null);
    }, []);

    useEffect(() => registerDialogPresenter((nextDialog) => new Promise((resolve) => {
        resolveRef.current?.(false);
        resolveRef.current = resolve;
        setDialog(nextDialog);
    })), []);

    const isConfirm = Boolean(shown?.confirmText);

    return (
        <>
            {children}
            <Modal transparent visible={dialog !== null} animationType="fade" onRequestClose={() => close(false)}>
                <Pressable style={styles.overlay} onPress={() => close(false)}>
                    <Pressable style={styles.dialog} accessibilityRole="alert">
                        {shown && (
                            <>
                                <View style={[styles.iconCircle, isConfirm && styles.iconCircleDanger]}>
                                    <Ionicons name={shown.icon} size={28} color={isConfirm ? '#f87171' : '#facc15'} />
                                </View>
                                <Text style={styles.title}>{shown.title}</Text>
                                {shown.message ? <Text style={styles.message}>{shown.message}</Text> : null}

                                {isConfirm ? (
                                    <View style={styles.actions}>
                                        <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={() => close(false)}>
                                            <Text style={styles.cancelText}>Cancelar</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity style={[styles.button, styles.dangerButton]} onPress={() => close(true)}>
                                            <Text style={styles.dangerText}>{shown.confirmText}</Text>
                                        </TouchableOpacity>
                                    </View>
                                ) : (
                                    <TouchableOpacity style={[styles.button, styles.primaryButton]} onPress={() => close(true)}>
                                        <Text style={styles.primaryText}>Entendido</Text>
                                    </TouchableOpacity>
                                )}
                            </>
                        )}
                    </Pressable>
                </Pressable>
            </Modal>
        </>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
    },
    dialog: {
        width: '100%',
        maxWidth: 380,
        alignItems: 'center',
        gap: 10,
        padding: 24,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#333',
        backgroundColor: '#1a1a1a',
    },
    iconCircle: {
        width: 56,
        height: 56,
        marginBottom: 4,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(250, 204, 21, 0.1)',
    },
    iconCircleDanger: {
        backgroundColor: 'rgba(248, 113, 113, 0.12)',
    },
    title: {
        color: '#fff',
        fontSize: 20,
        fontFamily: 'LilitaOne',
        textAlign: 'center',
    },
    message: {
        color: '#999',
        fontSize: 15,
        fontFamily: 'LilitaOne',
        textAlign: 'center',
        lineHeight: 20,
    },
    actions: {
        flexDirection: 'row',
        gap: 10,
        width: '100%',
        marginTop: 10,
    },
    button: {
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
        color: '#ccc',
        fontSize: 15,
        fontFamily: 'LilitaOne',
    },
    dangerButton: {
        backgroundColor: '#dc2626',
    },
    dangerText: {
        color: '#fff',
        fontSize: 15,
        fontFamily: 'LilitaOne',
    },
    primaryButton: {
        flex: 0,
        alignSelf: 'stretch',
        marginTop: 10,
        backgroundColor: '#facc15',
    },
    primaryText: {
        color: '#000',
        fontSize: 15,
        fontFamily: 'LilitaOne',
    },
});
