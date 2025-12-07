import { CameraView, useCameraPermissions } from 'expo-camera';
import React, { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { COLORS, FONTS } from '../constants/theme';

export function CameraLayer() {
    const [permission, requestPermission] = useCameraPermissions();

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

    return (
        <View style={styles.container}>
            <CameraView style={styles.camera} facing="front" />
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
});
