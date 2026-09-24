import React, { useRef } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { Image } from 'expo-image';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Zoomable } from '@likashefqet/react-native-image-zoom';

export default function ImageZoomModal({ uri, onClose }) {
    const insets = useSafeAreaInsets();
    const lastUri = useRef(uri);
    if (uri) lastUri.current = uri;
    const shownUri = lastUri.current;

    return (
        <Modal
            visible={uri !== null}
            animationType="fade"
            statusBarTranslucent
            onRequestClose={onClose}
        >
            <GestureHandlerRootView style={styles.zoomContainer}>
                <Zoomable
                    minScale={1}
                    maxScale={5}
                    doubleTapScale={3}
                    isDoubleTapEnabled
                    style={styles.zoomable}
                >
                    <Image
                        source={shownUri ? { uri: shownUri } : null}
                        style={styles.zoomImage}
                        contentFit="contain"
                        cachePolicy="memory-disk"
                    />
                </Zoomable>
                <TouchableOpacity
                    style={[styles.zoomCloseButton, { top: insets.top + 15 }]}
                    onPress={onClose}
                    accessibilityRole="button"
                    accessibilityLabel="Cerrar"
                >
                    <Ionicons name="close" size={25} color="#facc15" />
                </TouchableOpacity>
            </GestureHandlerRootView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    zoomContainer: {
        flex: 1,
        backgroundColor: '#000',
    },
    zoomable: {
        flex: 1,
    },
    zoomImage: {
        width: '100%',
        height: '100%',
    },
    zoomCloseButton: {
        position: 'absolute',
        right: 15,
        padding: 5,
    },
});
