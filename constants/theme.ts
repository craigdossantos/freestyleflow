import { StyleSheet } from 'react-native';

export const COLORS = {
    background: '#fffdf0',
    text: '#2c3e50',
    accent: '#e74c3c',
    cardBorder: '#2c3e50',
    cardBg: 'transparent',
    dimmed: 'rgba(44, 62, 80, 0.5)',
};

export const FONTS = {
    main: 'PermanentMarker_400Regular',
};

export const SHAPES = {
    // Hand-drawn rectangle look (subtle)
    rect: {
        borderTopLeftRadius: 2,
        borderTopRightRadius: 5,
        borderBottomRightRadius: 3,
        borderBottomLeftRadius: 4,
    },
    pill: {
        borderRadius: 100, // Standard pill for some buttons if needed, or use rect
    }
};

export const COMMON_STYLES = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    text: {
        fontFamily: FONTS.main,
        color: COLORS.text,
    },
    card: {
        backgroundColor: COLORS.cardBg,
        borderWidth: 2,
        borderColor: COLORS.cardBorder,
        ...SHAPES.rect,
        padding: 15,
        alignItems: 'center',
        justifyContent: 'center',
    },
    button: {
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderColor: COLORS.text,
        paddingVertical: 12,
        paddingHorizontal: 24,
        ...SHAPES.rect,
        alignItems: 'center',
    },
    buttonText: {
        fontFamily: FONTS.main,
        color: COLORS.text,
        fontSize: 16,
    },
});
