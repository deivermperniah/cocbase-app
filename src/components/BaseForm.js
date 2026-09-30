import React, { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { BASE_TYPES, TOWN_HALL_LEVELS } from '../lib/constants';
import { showMessage } from '../lib/dialogs';
import {
    ALLOWED_IMAGE_TYPES,
    MAX_IMAGE_BYTES,
    SubmissionError,
    getBaseLinkId,
    submitBase,
} from '../lib/baseSubmission';
import { COLORS, FONT, FONT_SIZE, RADIUS, BUTTON, INPUT } from '../lib/theme';
import { COLUMN_MIN_WIDTH, useGrid } from '../lib/layout';

const LINK_FREE_LEVEL = 3;

function ChipSelector({ options, selected, onSelect, disabled, renderLabel = String }) {
    return (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
            {options.map((option) => {
                const isActive = option === selected;
                return (
                    <TouchableOpacity
                        key={option}
                        style={[styles.chip, isActive && styles.chipActive]}
                        onPress={() => onSelect(option)}
                        hitSlop={{ top: 5, bottom: 5 }}
                        disabled={disabled}
                    >
                        <Text style={[styles.chipText, isActive && styles.chipTextActive]}>{renderLabel(option)}</Text>
                    </TouchableOpacity>
                );
            })}
        </ScrollView>
    );
}

export default function BaseForm({ userId, publish = false, onSubmitted }) {
    const [level, setLevel] = useState(null);
    const [type, setType] = useState(null);
    const [link, setLink] = useState('');
    const [linkFocused, setLinkFocused] = useState(false);
    const [asset, setAsset] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const { columns, onLayout } = useGrid(COLUMN_MIN_WIDTH);
    const split = columns > 1;

    const requiresLink = level !== LINK_FREE_LEVEL;
    const linkError = link.trim() && !getBaseLinkId(link) ? 'Usa un enlace de link.clashofclans.com.' : null;
    const isFormValid = level !== null && type !== null && asset !== null
        && (requiresLink ? Boolean(link.trim()) && !linkError : true);

    const selectLevel = (nextLevel) => {
        setLevel(nextLevel);
        if (nextLevel === LINK_FREE_LEVEL) setLink('');
    };

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 1 });
        if (result.canceled) return;

        const pickedAsset = result.assets[0];
        if (pickedAsset.mimeType && !ALLOWED_IMAGE_TYPES.includes(pickedAsset.mimeType)) {
            showMessage('Formato no válido', 'Elige una captura en JPG, PNG o WebP.');
            return;
        }
        if (pickedAsset.fileSize && pickedAsset.fileSize > MAX_IMAGE_BYTES) {
            showMessage('Imagen muy pesada', 'Elige una captura de 5 MB o menos.');
            return;
        }
        setAsset(pickedAsset);
    };

    const resetForm = () => {
        setLevel(null);
        setType(null);
        setLink('');
        setAsset(null);
    };

    const handleSubmit = async () => {
        setSubmitting(true);
        try {
            const base = await submitBase({ level, type, link, asset, userId, publish });
            resetForm();
            onSubmitted(base);
        } catch (error) {
            showMessage('No se pudo enviar', error instanceof SubmissionError
                ? error.message
                : 'Algo salió mal. Inténtalo de nuevo.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <View style={styles.card} onLayout={onLayout}>
            <Text style={styles.cardTitle}>Nueva base</Text>

            <View style={split && styles.columns}>
                <View style={split && styles.column}>
                    <Text style={styles.label}>Nivel</Text>
                    <ChipSelector
                        options={TOWN_HALL_LEVELS}
                        selected={level}
                        onSelect={selectLevel}
                        disabled={submitting}
                        renderLabel={value => `Nivel ${value}`}
                    />

                    <Text style={styles.label}>Categoría</Text>
                    <ChipSelector options={BASE_TYPES} selected={type} onSelect={setType} disabled={submitting} />

                    {requiresLink && (
                        <>
                            <Text style={styles.label}>Link</Text>
                            <TextInput
                                style={[styles.input, linkFocused && styles.inputFocused, linkError && styles.inputError]}
                                onFocus={() => setLinkFocused(true)}
                                onBlur={() => setLinkFocused(false)}
                                placeholder="https://link.clashofclans.com/..."
                                placeholderTextColor={COLORS.placeholder}
                                value={link}
                                onChangeText={setLink}
                                autoCapitalize="none"
                                autoCorrect={false}
                                keyboardType="url"
                                editable={!submitting}
                            />
                            {linkError && <Text style={styles.errorText}>{linkError}</Text>}
                        </>
                    )}
                </View>

                <View style={split && styles.column}>
                    <Text style={styles.label}>Fotografía</Text>
                    {asset ? (
                        <View>
                            <TouchableOpacity activeOpacity={0.8} onPress={pickImage} disabled={submitting}>
                                <Image source={{ uri: asset.uri }} style={styles.preview} contentFit="cover" />
                                <View style={styles.changeImageBadge}>
                                    <Text style={styles.changeImageText}>Cambiar</Text>
                                </View>
                            </TouchableOpacity>
                            {!submitting && (
                                <TouchableOpacity
                                    style={styles.removeImageButton}
                                    onPress={() => setAsset(null)}
                                    hitSlop={8}
                                    accessibilityRole="button"
                                    accessibilityLabel="Quitar fotografía"
                                >
                                    <Ionicons name="close" size={18} color={COLORS.text} />
                                </TouchableOpacity>
                            )}
                        </View>
                    ) : (
                        <TouchableOpacity style={styles.imagePicker} onPress={pickImage} activeOpacity={0.7} disabled={submitting}>
                            <Ionicons name="image-outline" size={28} color={COLORS.textMuted} />
                            <Text style={styles.imagePickerTitle}>Subir captura</Text>
                            <Text style={styles.imagePickerHint}>JPG, PNG o WebP · máx. 5 MB</Text>
                        </TouchableOpacity>
                    )}

                    <TouchableOpacity
                        style={[styles.submitButton, (!isFormValid || submitting) && styles.submitButtonDisabled]}
                        onPress={handleSubmit}
                        disabled={!isFormValid || submitting}
                    >
                        {submitting
                            ? <ActivityIndicator color={COLORS.onPrimary} />
                            : <Ionicons name={publish ? 'checkmark-circle-outline' : 'add-circle-outline'} size={20} color={COLORS.onPrimary} />}
                        <Text style={styles.submitButtonText}>
                            {submitting ? 'Procesando...' : publish ? 'Publicar' : 'Enviar a revisión'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: COLORS.surface,
        borderRadius: RADIUS.md,
        padding: 15,
    },
    cardTitle: {
        color: COLORS.primary,
        fontSize: FONT_SIZE.title,
        fontFamily: FONT,
        marginBottom: 5,
    },
    columns: {
        flexDirection: 'row',
        gap: 20,
    },
    column: {
        flex: 1,
    },
    label: {
        color: COLORS.textMuted,
        fontSize: FONT_SIZE.small,
        fontFamily: FONT,
        marginTop: 15,
        marginBottom: 8,
    },
    chips: {
        gap: 10,
    },
    chip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: RADIUS.lg,
        backgroundColor: COLORS.surfaceAlt,
    },
    chipActive: {
        backgroundColor: COLORS.primary,
    },
    chipText: {
        color: COLORS.textMuted,
        fontFamily: FONT,
        fontSize: FONT_SIZE.small,
    },
    chipTextActive: {
        color: COLORS.onPrimary,
    },
    input: {
        ...INPUT,
    },
    inputFocused: {
        borderColor: COLORS.primary,
    },
    inputError: {
        borderColor: COLORS.danger,
    },
    errorText: {
        color: COLORS.danger,
        fontSize: FONT_SIZE.caption,
        fontFamily: FONT,
        marginTop: 6,
    },
    imagePicker: {
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
        paddingVertical: 25,
        borderRadius: RADIUS.md,
        borderWidth: 2,
        borderStyle: 'dashed',
        borderColor: COLORS.border,
        backgroundColor: COLORS.surfaceDeep,
    },
    imagePickerTitle: {
        color: COLORS.text,
        fontSize: FONT_SIZE.body,
        fontFamily: FONT,
    },
    imagePickerHint: {
        color: COLORS.textMuted,
        fontSize: FONT_SIZE.caption,
        fontFamily: FONT,
    },
    preview: {
        width: '100%',
        height: 180,
        borderRadius: RADIUS.md,
        backgroundColor: COLORS.surfaceAlt,
    },
    changeImageBadge: {
        position: 'absolute',
        bottom: 10,
        left: 10,
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: RADIUS.sm,
        backgroundColor: 'rgba(10, 10, 10, 0.7)',
    },
    changeImageText: {
        color: COLORS.text,
        fontSize: FONT_SIZE.caption,
        fontFamily: FONT,
    },
    removeImageButton: {
        position: 'absolute',
        top: 10,
        right: 10,
        width: 32,
        height: 32,
        borderRadius: RADIUS.pill,
        backgroundColor: 'rgba(10, 10, 10, 0.7)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    submitButton: {
        ...BUTTON,
        marginTop: 20,
        backgroundColor: COLORS.primary,
        boxShadow: '0px 2px 4px rgba(250, 204, 21, 0.3)',
    },
    submitButtonDisabled: {
        opacity: 0.5,
    },
    submitButtonText: {
        color: COLORS.onPrimary,
        fontSize: FONT_SIZE.body,
        fontFamily: FONT,
    },
});
