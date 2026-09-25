import { Alert } from 'react-native';

let presentDialog = null;

export function registerDialogPresenter(presenter) {
    presentDialog = presenter;
    return () => {
        if (presentDialog === presenter) presentDialog = null;
    };
}

export function showMessage(title, message, { icon = 'information-circle-outline' } = {}) {
    if (!presentDialog) {
        Alert.alert(title, message);
        return Promise.resolve();
    }
    return presentDialog({ title, message, icon });
}

export function confirmAction(title, message, confirmText, { icon = 'alert-circle-outline' } = {}) {
    if (!presentDialog) {
        return new Promise((resolve) => {
            Alert.alert(title, message, [
                { text: 'Cancelar', style: 'cancel', onPress: () => resolve(false) },
                { text: confirmText, style: 'destructive', onPress: () => resolve(true) },
            ], { cancelable: true, onDismiss: () => resolve(false) });
        });
    }
    return presentDialog({ title, message, icon, confirmText });
}
