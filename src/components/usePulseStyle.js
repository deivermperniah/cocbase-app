import { useEffect } from 'react';
import { Easing, useAnimatedStyle, useReducedMotion, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';

export default function usePulseStyle() {
    const reduceMotion = useReducedMotion();
    const opacity = useSharedValue(1);

    useEffect(() => {
        if (reduceMotion) return;
        opacity.value = withRepeat(withTiming(0.4, { duration: 800, easing: Easing.inOut(Easing.ease) }), -1, true);
    }, [reduceMotion, opacity]);

    return useAnimatedStyle(() => ({ opacity: opacity.value }));
}
