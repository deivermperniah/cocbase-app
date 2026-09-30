import React, { useEffect, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator, KeyboardAvoidingView, ScrollView, Platform } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { Easing, useAnimatedStyle, useReducedMotion, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { COLORS, FONT, FONT_SIZE, RADIUS, BUTTON, INPUT } from '../lib/theme';

const MIN_PASSWORD_LENGTH = 6;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const AUTH_ERRORS = {
    invalid_credentials: 'Correo o contraseña incorrectos.',
    email_not_confirmed: 'Confirma tu correo antes de entrar. Revisa también la carpeta de spam.',
    user_already_exists: 'Ya existe una cuenta con este correo.',
    over_email_send_rate_limit: 'Demasiados intentos. Espera unos minutos.',
    over_request_rate_limit: 'Demasiados intentos. Espera unos minutos.',
};

const MODES = {
    signIn: {
        title: 'Iniciar sesión',
        icon: 'log-in-outline',
        submit: 'Iniciar sesión',
        submitting: 'Iniciando sesión...',
        switchPrompt: '¿No tienes cuenta? ',
        switchAction: 'Crea una',
    },
    signUp: {
        title: 'Crear cuenta',
        icon: 'person-add-outline',
        submit: 'Crear cuenta',
        submitting: 'Creando cuenta...',
        switchPrompt: '¿Ya tienes cuenta? ',
        switchAction: 'Inicia sesión',
    },
};

function getAuthErrorMessage(error) {
    return AUTH_ERRORS[error.code] || 'Algo salió mal. Inténtalo de nuevo.';
}

function GlowCard({ children }) {
    const reduceMotion = useReducedMotion();
    const rotation = useSharedValue(0);
    const [size, setSize] = useState(null);

    useEffect(() => {
        if (reduceMotion) return;
        rotation.value = withRepeat(withTiming(360, { duration: 4000, easing: Easing.linear }), -1, false);
    }, [reduceMotion, rotation]);

    const glowStyle = useAnimatedStyle(() => ({
        transform: [{ rotate: `${rotation.value}deg` }],
    }));

    const diagonal = size ? Math.hypot(size.width, size.height) : 0;

    return (
        <View
            style={styles.glowCard}
            onLayout={({ nativeEvent }) => setSize(nativeEvent.layout)}
        >
            {size && (
                <Animated.View
                    style={[
                        styles.glow,
                        {
                            width: diagonal,
                            height: diagonal,
                            left: (size.width - diagonal) / 2,
                            top: (size.height - diagonal) / 2,
                        },
                        glowStyle,
                    ]}
                >
                    <LinearGradient
                        style={StyleSheet.absoluteFill}
                        start={{ x: 0, y: 0.5 }}
                        end={{ x: 1, y: 0.5 }}
                        colors={['transparent', 'transparent', COLORS.primary, COLORS.primaryLight, 'transparent']}
                        locations={[0, 0.58, 0.72, 0.8, 0.92]}
                    />
                </Animated.View>
            )}
            <View style={styles.card}>{children}</View>
        </View>
    );
}

function Field({ label, style, ...inputProps }) {
    const [focused, setFocused] = useState(false);

    return (
        <View style={styles.field}>
            <Text style={styles.label}>{label}</Text>
            <TextInput
                placeholderTextColor={COLORS.placeholder}
                {...inputProps}
                style={[styles.input, focused && styles.inputFocused, style]}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
            />
        </View>
    );
}

export default function AuthScreen({ navigation }) {
    const { signIn, signUp } = useAuth();
    const [mode, setMode] = useState('signIn');
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [errorText, setErrorText] = useState(null);
    const [successText, setSuccessText] = useState(null);

    const isSignUp = mode === 'signUp';
    const copy = MODES[mode];

    const switchMode = () => {
        setMode(isSignUp ? 'signIn' : 'signUp');
        setErrorText(null);
        setSuccessText(null);
    };

    const validate = () => {
        if (isSignUp && !fullName.trim()) return 'Escribe tu nombre.';
        if (!EMAIL_PATTERN.test(email.trim())) return 'Escribe un correo válido.';
        if (password.length < MIN_PASSWORD_LENGTH) return `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres.`;
        return null;
    };

    const handleSubmit = async () => {
        const validationError = validate();
        setErrorText(validationError);
        setSuccessText(null);
        if (validationError) return;

        setSubmitting(true);
        const { error } = isSignUp
            ? await signUp(fullName.trim(), email.trim(), password)
            : await signIn(email.trim(), password);
        setSubmitting(false);

        if (error) {
            setErrorText(getAuthErrorMessage(error));
            return;
        }

        if (isSignUp) {
            setMode('signIn');
            setPassword('');
            setSuccessText('Te enviamos un correo. Confírmalo para poder entrar.');
            return;
        }

        navigation.goBack();
    };

    return (
        <SafeAreaView style={styles.container} edges={['top', 'bottom', 'left', 'right']}>
            <View style={styles.topBar}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={styles.closeButton}
                    hitSlop={8}
                    accessibilityRole="button"
                    accessibilityLabel="Cerrar"
                >
                    <Ionicons name="close" size={28} color={COLORS.primary} />
                </TouchableOpacity>
            </View>

            <KeyboardAvoidingView
                style={styles.flex}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    <GlowCard>
                        <View style={styles.cardHeader}>
                            <Image source={require('../../assets/images/logo.png')} style={styles.logo} contentFit="contain" />
                            <Text style={styles.title}>{copy.title}</Text>
                        </View>

                        {errorText && (
                            <View style={[styles.alert, styles.alertError]}>
                                <Text style={[styles.alertText, styles.alertErrorText]}>{errorText}</Text>
                            </View>
                        )}
                        {successText && (
                            <View style={[styles.alert, styles.alertSuccess]}>
                                <Text style={[styles.alertText, styles.alertSuccessText]}>{successText}</Text>
                            </View>
                        )}

                        {isSignUp && (
                            <Field
                                label="Nombre completo *"
                                placeholder="Tu nombre"
                                value={fullName}
                                onChangeText={setFullName}
                                autoCapitalize="words"
                                autoComplete="name"
                                textContentType="name"
                                returnKeyType="next"
                                editable={!submitting}
                            />
                        )}
                        <Field
                            label="Correo electrónico *"
                            placeholder="tucorreo@ejemplo.com"
                            value={email}
                            onChangeText={setEmail}
                            autoCapitalize="none"
                            autoCorrect={false}
                            autoComplete="email"
                            keyboardType="email-address"
                            textContentType="emailAddress"
                            returnKeyType="next"
                            editable={!submitting}
                        />
                        <View>
                            <Field
                                label="Contraseña *"
                                placeholder={showPassword ? '12345678' : '••••••••'}
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry={!showPassword}
                                autoCapitalize="none"
                                autoComplete={isSignUp ? 'new-password' : 'current-password'}
                                textContentType={isSignUp ? 'newPassword' : 'password'}
                                returnKeyType="done"
                                onSubmitEditing={handleSubmit}
                                editable={!submitting}
                                style={styles.passwordInput}
                            />
                            <TouchableOpacity
                                style={styles.eyeButton}
                                onPress={() => setShowPassword(value => !value)}
                                hitSlop={8}
                                accessibilityRole="button"
                                accessibilityLabel={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                            >
                                <Ionicons name={showPassword ? 'eye-outline' : 'eye-off-outline'} size={18} color={COLORS.textMuted} />
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity
                            style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
                            onPress={handleSubmit}
                            disabled={submitting}
                        >
                            {submitting
                                ? <ActivityIndicator size="small" color={COLORS.onPrimary} />
                                : <Ionicons name={copy.icon} size={18} color={COLORS.onPrimary} />}
                            <Text style={styles.submitButtonText}>{submitting ? copy.submitting : copy.submit}</Text>
                        </TouchableOpacity>

                        <Text style={styles.switchText}>
                            {copy.switchPrompt}
                            <Text style={styles.switchAction} onPress={submitting ? undefined : switchMode}>
                                {copy.switchAction}
                            </Text>
                        </Text>
                    </GlowCard>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    flex: {
        flex: 1,
    },
    topBar: {
        alignItems: 'flex-end',
        paddingHorizontal: 15,
        paddingTop: 10,
    },
    closeButton: {
        padding: 5,
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        paddingHorizontal: 20,
        paddingBottom: 48,
    },
    glowCard: {
        width: '100%',
        maxWidth: 420,
        alignSelf: 'center',
        padding: 1,
        borderRadius: RADIUS.lg,
        overflow: 'hidden',
        backgroundColor: COLORS.surfaceAlt,
        boxShadow: '0px 20px 40px rgba(250, 204, 21, 0.1)',
    },
    glow: {
        position: 'absolute',
    },
    card: {
        borderRadius: 19,
        backgroundColor: COLORS.surface,
        padding: 24,
        gap: 15,
    },
    cardHeader: {
        alignItems: 'center',
        gap: 15,
        marginBottom: 5,
    },
    logo: {
        width: 64,
        height: 64,
    },
    title: {
        color: COLORS.primary,
        fontSize: FONT_SIZE.display,
        fontFamily: FONT,
    },
    alert: {
        borderRadius: RADIUS.sm,
        borderWidth: 1,
        paddingHorizontal: 12,
        paddingVertical: 10,
    },
    alertText: {
        fontSize: FONT_SIZE.small,
        fontFamily: FONT,
        lineHeight: 18,
    },
    alertError: {
        borderColor: 'rgba(239, 68, 68, 0.4)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
    },
    alertErrorText: {
        color: COLORS.dangerSoft,
    },
    alertSuccess: {
        borderColor: 'rgba(250, 204, 21, 0.4)',
        backgroundColor: 'rgba(250, 204, 21, 0.1)',
    },
    alertSuccessText: {
        color: COLORS.primaryLight,
    },
    field: {
        gap: 8,
    },
    label: {
        color: COLORS.textMuted,
        fontSize: FONT_SIZE.caption,
        fontFamily: FONT,
    },
    input: {
        ...INPUT,
    },
    inputFocused: {
        borderColor: COLORS.primary,
    },
    passwordInput: {
        paddingRight: 44,
    },
    eyeButton: {
        position: 'absolute',
        right: 12,
        bottom: 13,
    },
    submitButton: {
        ...BUTTON,
        marginTop: 5,
        backgroundColor: COLORS.primary,
        boxShadow: '0px 10px 20px rgba(250, 204, 21, 0.1)',
    },
    submitButtonDisabled: {
        opacity: 0.5,
    },
    submitButtonText: {
        color: COLORS.onPrimary,
        fontSize: FONT_SIZE.body,
        fontFamily: FONT,
    },
    switchText: {
        marginTop: 5,
        color: COLORS.textMuted,
        fontSize: FONT_SIZE.caption,
        fontFamily: FONT,
        textAlign: 'center',
    },
    switchAction: {
        color: COLORS.primary,
    },
});
