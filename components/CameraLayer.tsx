import { CameraView, useCameraPermissions } from 'expo-camera';
import React, { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { COLORS, FONTS } from '../constants/theme';
import { useGameStore } from '../store';

// Filter overlay styles for different effects
const FILTER_OVERLAYS: Record<string, { colors: string[]; opacity: number; blendMode?: string }> = {
    none: { colors: [], opacity: 0 },
    noir: { colors: ['rgba(0,0,0,0.3)'], opacity: 1 },
    chrome: { colors: ['rgba(0,200,255,0.2)', 'rgba(255,0,200,0.15)'], opacity: 1 },
    thermal: { colors: ['rgba(255,100,0,0.3)', 'rgba(255,0,100,0.2)'], opacity: 1 },
    comic: { colors: ['rgba(255,255,0,0.15)', 'rgba(0,255,255,0.1)'], opacity: 1 },
};

export function CameraLayer() {
    const [permission, requestPermission] = useCameraPermissions();
    const cameraFilter = useGameStore((state) => state.cameraFilter);

    // Auto-request permission on mount if not determined
    useEffect(() => {
        if (permission && !permission.granted && permission.canAskAgain) {
            requestPermission();
        }
    }, [permission]);

    if (!permission) {
        // Camera permissions are still loading.
        return (
            <View style={styles.container}>
                <ActivityIndicator size="large" color={COLORS.accent} />
                <Text style={styles.message}>Loading camera...</Text>
            </View>
        );
    }

    if (!permission.granted) {
        // Camera permissions are not granted yet.
        return (
            <View style={styles.container}>
                <View style={styles.permissionContainer}>
                    <Text style={styles.message}>Camera permission needed for recording</Text>
                    <TouchableOpacity onPress={requestPermission} style={styles.permissionButton}>
                        <Text style={styles.permissionButtonText}>Grant Camera Access</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    const filterConfig = FILTER_OVERLAYS[cameraFilter] || FILTER_OVERLAYS.none;

    return (
        <View style={styles.container}>
            <CameraView style={styles.camera} facing="front" />

            {/* Filter overlays */}
            {filterConfig.colors.map((color, index) => (
                <View
                    key={index}
                    style={[
                        styles.filterOverlay,
                        { backgroundColor: color }
                    ]}
                    pointerEvents="none"
                />
            ))}

            {/* Special effects per filter */}
            {cameraFilter === 'noir' && (
                <View style={styles.noirOverlay} pointerEvents="none" />
            )}
            {cameraFilter === 'thermal' && (
                <View style={styles.thermalOverlay} pointerEvents="none" />
            )}
            {cameraFilter === 'comic' && (
                <View style={styles.comicOverlay} pointerEvents="none" />
            )}
            {cameraFilter === 'chrome' && (
                <View style={styles.chromeOverlay} pointerEvents="none" />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: '100%',
        backgroundColor: 'black',
        justifyContent: 'center',
        alignItems: 'center',
    },
    permissionContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: COLORS.background,
    },
    message: {
        textAlign: 'center',
        paddingBottom: 15,
        color: COLORS.text,
        fontFamily: FONTS.main,
        fontSize: 16,
    },
    permissionButton: {
        backgroundColor: COLORS.accent,
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
    },
    permissionButtonText: {
        color: COLORS.background,
        fontFamily: FONTS.main,
        fontSize: 16,
        fontWeight: 'bold',
    },
    camera: {
        flex: 1,
        width: '100%',
    },
    filterOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    // Noir: High contrast black & white effect
    noirOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(30,30,30,0.4)',
    },
    // Thermal: Orange/red heat vision effect
    thermalOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(255,50,0,0.25)',
    },
    // Comic: Bold, saturated pop-art effect
    comicOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(255,200,0,0.1)',
    },
    // Chrome: Metallic blue/purple effect
    chromeOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(100,0,255,0.15)',
    },
});
