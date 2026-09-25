import React, { memo } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { Image } from 'expo-image';
import { isNewBase } from '../lib/format';

function IconButton({ icon, label, onPress }) {
    return (
        <TouchableOpacity
            style={styles.iconButton}
            onPress={onPress}
            hitSlop={4}
            accessibilityRole="button"
            accessibilityLabel={label}
        >
            <Ionicons name={icon} size={20} color="#facc15" />
        </TouchableOpacity>
    );
}

function BaseCard({ base, isFavorite, onToggleFavorite, onPressImage, onOpenActions }) {
    const copyDisabled = base.level_th === 3 || !base.link;

    return (
        <View style={styles.baseCard}>
            <View style={styles.imageContainer}>
                <TouchableOpacity
                    activeOpacity={0.9}
                    disabled={!base.url_foto}
                    onPress={() => onPressImage(base.url_foto)}
                >
                    <Image
                        source={base.url_foto ? { uri: base.url_foto } : null}
                        style={styles.baseImage}
                        contentFit="cover"
                        cachePolicy="memory-disk"
                    />
                </TouchableOpacity>
                {isNewBase(base.created_at) && (
                    <View style={styles.newBadge}>
                        <Text style={styles.newBadgeText}>Nuevo</Text>
                    </View>
                )}
            </View>
            <View style={styles.baseInfo}>
                <View style={styles.baseButtons}>
                    <TouchableOpacity
                        style={[styles.actionButton, copyDisabled && styles.disabledButton]}
                        onPress={() => Linking.openURL(base.link).catch(() => {})}
                        disabled={copyDisabled}
                    >
                        <Text style={[styles.copyButtonText, copyDisabled && styles.disabledButtonText]}>Copiar Base</Text>
                    </TouchableOpacity>
                    <IconButton
                        icon={isFavorite ? 'heart' : 'heart-outline'}
                        label={isFavorite ? 'Quitar de favoritos' : 'Guardar en favoritos'}
                        onPress={() => onToggleFavorite(base)}
                    />
                    <IconButton
                        icon="ellipsis-horizontal"
                        label="Más opciones"
                        onPress={() => onOpenActions(base)}
                    />
                </View>
            </View>
        </View>
    );
}

export default memo(BaseCard);

const styles = StyleSheet.create({
    baseCard: {
        backgroundColor: '#1a1a1a',
        borderRadius: 12,
        marginBottom: 15,
        overflow: 'hidden',
    },
    imageContainer: {
        position: 'relative',
    },
    baseImage: {
        width: '100%',
        height: 200,
        backgroundColor: '#2a2a2a',
    },
    newBadge: {
        position: 'absolute',
        top: 10,
        left: 10,
        backgroundColor: '#facc15',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 5,
        boxShadow: '0px 2px 2px rgba(0, 0, 0, 0.3)',
    },
    newBadgeText: {
        color: '#000',
        fontFamily: 'LilitaOne',
        fontSize: 12,
    },
    baseInfo: {
        padding: 15,
    },
    baseButtons: {
        flexDirection: 'row',
        gap: 10,
    },
    actionButton: {
        flex: 1,
        height: 36,
        backgroundColor: '#facc15',
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    iconButton: {
        width: 44,
        height: 36,
        backgroundColor: '#333',
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    disabledButton: {
        backgroundColor: '#333',
        opacity: 0.6,
    },
    copyButtonText: {
        color: '#000',
        fontFamily: 'LilitaOne',
        fontSize: 14,
    },
    disabledButtonText: {
        color: '#888',
    },
});
