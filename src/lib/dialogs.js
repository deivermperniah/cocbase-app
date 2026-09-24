import { Alert, Platform } from 'react-native';

export function showMessage(title, message) {
    if (Platform.OS === 'web') {
        window.alert(`${title}\n\n${message}`);
        return;
    }
    Alert.alert(title, message);
}

export function confirmAction(title, message, confirmText) {
    if (Platform.OS === 'web') {
        return Promise.resolve(window.confirm(`${title}\n\n${message}`));
    }
    return new Promise((resolve) => {
        Alert.alert(title, message, [
            { text: 'Cancelar', style: 'cancel', onPress: () => resolve(false) },
            { text: confirmText, style: 'destructive', onPress: () => resolve(true) },
        ], { cancelable: true, onDismiss: () => resolve(false) });
    });
}
