export const COLORS = {
    background: '#0a0a0a',
    surfaceDeep: '#121212',
    surface: '#1a1a1a',
    surfaceAlt: '#2a2a2a',
    border: '#333',
    borderStrong: '#444',
    primary: '#facc15',
    primaryLight: '#fde047',
    primaryDark: '#eab308',
    onPrimary: '#000',
    text: '#fff',
    textSoft: '#ccc',
    textMuted: '#999',
    textSubtle: '#666',
    placeholder: '#808080',
    danger: '#f87171',
    dangerStrong: '#dc2626',
    dangerSoft: '#fca5a5',
};

export const FONT = 'LilitaOne';

export const FONT_SIZE = {
    caption: 12,
    small: 14,
    body: 16,
    title: 18,
    heading: 22,
    display: 28,
};

export const RADIUS = {
    sm: 8,
    md: 12,
    lg: 20,
    pill: 999,
};

export const BUTTON = {
    height: 44,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 24,
    borderRadius: RADIUS.pill,
};

export const INPUT = {
    height: 44,
    paddingHorizontal: 12,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surfaceAlt,
    color: COLORS.text,
    fontSize: FONT_SIZE.body,
};

export const REFRESH_CONTROL_THEME = {
    colors: [COLORS.primary],
    tintColor: COLORS.primary,
    progressBackgroundColor: COLORS.surface,
};
