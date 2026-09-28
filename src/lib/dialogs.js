let presentDialog = null;

export function registerDialogPresenter(presenter) {
    presentDialog = presenter;
    return () => {
        if (presentDialog === presenter) presentDialog = null;
    };
}

export function showMessage(title, message, { icon = 'information-circle-outline' } = {}) {
    return presentDialog({ title, message, icon });
}

export function confirmAction(title, message, confirmText, { icon = 'alert-circle-outline' } = {}) {
    return presentDialog({ title, message, icon, confirmText });
}
