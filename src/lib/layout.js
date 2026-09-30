import { useCallback, useState } from 'react';
import { useWindowDimensions } from 'react-native';

export const WIDE_BREAKPOINT = 600;
export const GRID_GAP = 15;
export const GRID_PADDING = 15;
export const CARD_MIN_WIDTH = 280;
export const COLUMN_MIN_WIDTH = 340;

const ESTIMATED_RAIL_WIDTH = 88;

export function useIsWide() {
    return useWindowDimensions().width >= WIDE_BREAKPOINT;
}

export function useGrid(minItemWidth, { snap } = {}) {
    const { width: windowWidth } = useWindowDimensions();
    const [measuredWidth, setMeasuredWidth] = useState(null);

    const onLayout = useCallback(({ nativeEvent }) => {
        setMeasuredWidth(nativeEvent.layout.width);
    }, []);

    const estimatedWidth = windowWidth >= WIDE_BREAKPOINT ? windowWidth - ESTIMATED_RAIL_WIDTH : windowWidth;
    const width = Math.min(measuredWidth ?? estimatedWidth);
    const available = width - GRID_PADDING * 2;

    let columns = Math.max(1, Math.floor((available + GRID_GAP) / (minItemWidth + GRID_GAP)));
    if (snap) {
        const fitting = snap.filter(value => value <= columns);
        columns = fitting.length > 0 ? Math.max(...fitting) : snap[0];
    }

    const itemWidth = columns > 1
        ? (available - GRID_GAP * (columns - 1)) / columns
        : undefined;

    return { columns, itemWidth, onLayout };
}
