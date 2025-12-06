import React, { useCallback, useState } from 'react';
import { Dimensions, Platform, StyleSheet, View } from 'react-native';
import YoutubePlayer from 'react-native-youtube-iframe';

const { width, height } = Dimensions.get('window');

interface YouTubeLayerProps {
    videoId?: string;
}

export const YouTubeLayer: React.FC<YouTubeLayerProps> = ({ videoId = '5qap5aO4i9A' }) => {
    const [playing, setPlaying] = useState(true);

    const onStateChange = useCallback((state: string) => {
        if (state === 'ended') {
            setPlaying(false);
        }
    }, []);

    return (
        <View style={styles.container}>
            <View style={styles.videoContainer}>
                {Platform.OS === 'web' ? (
                    <iframe
                        width="100%"
                        height="100%"
                        src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&controls=0&loop=1&playlist=${videoId}&modestbranding=1&playsinline=1`}
                        frameBorder="0"
                        allow="autoplay; encrypted-media"
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            opacity: 0.6,
                            pointerEvents: 'none'
                        }}
                    />
                ) : (
                    <YoutubePlayer
                        height={height + 100}
                        width={width + 100}
                        play={playing}
                        videoId={videoId}
                        onChangeState={onStateChange}
                        initialPlayerParams={{
                            controls: true, // Enable controls so user can play/pause
                            modestbranding: true,
                            loop: true,
                            playsinline: true, // Force inline playback
                            rel: false, // Don't show related videos (if supported)
                        }}
                        webViewProps={{
                            allowsInlineMediaPlayback: true,
                            mediaPlaybackRequiresUserAction: false,
                            originWhitelist: ['*'],
                            // This helps keep navigation inside the webview
                            startInLoadingState: true,
                        }}
                    />
                )}
            </View>
            {/* Overlay to fade the video */}
            <View style={styles.overlay} pointerEvents="none" />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        // zIndex: -1, // Removed to prevent hiding behind parent on web
        backgroundColor: '#000',
        overflow: 'hidden',
    },
    videoContainer: {
        position: 'absolute',
        top: -50,
        left: -50,
        // opacity: 0.6, // Removed opacity from container to let video shine through
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.3)', // Lighter overlay (was 0.8)
    },
});
