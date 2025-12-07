import { CameraView, useCameraPermissions } from 'expo-camera';
import { GLView, ExpoWebGLRenderingContext } from 'expo-gl';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { COLORS, FONTS } from '../constants/theme';
import { useGameStore } from '../store';

// Vertex shader - passes through position and texture coordinates
const vertexShaderSource = `#version 300 es
precision highp float;

in vec2 position;
out vec2 uv;

void main() {
    uv = position * 0.5 + 0.5;
    // Flip Y for camera orientation
    uv.y = 1.0 - uv.y;
    gl_Position = vec4(position, 0.0, 1.0);
}
`;

// Fragment shaders for different effects
const SHADERS: Record<string, string> = {
    none: `#version 300 es
precision highp float;

uniform sampler2D cameraTexture;
in vec2 uv;
out vec4 fragColor;

void main() {
    fragColor = texture(cameraTexture, uv);
}
`,
    noir: `#version 300 es
precision highp float;

uniform sampler2D cameraTexture;
in vec2 uv;
out vec4 fragColor;

void main() {
    vec4 color = texture(cameraTexture, uv);
    // Convert to grayscale with high contrast
    float gray = dot(color.rgb, vec3(0.299, 0.587, 0.114));
    // Increase contrast
    gray = (gray - 0.5) * 1.5 + 0.5;
    gray = clamp(gray, 0.0, 1.0);
    // Add slight sepia tint
    vec3 sepia = vec3(gray * 1.1, gray, gray * 0.9);
    fragColor = vec4(sepia, 1.0);
}
`,
    chrome: `#version 300 es
precision highp float;

uniform sampler2D cameraTexture;
in vec2 uv;
out vec4 fragColor;

void main() {
    vec4 color = texture(cameraTexture, uv);
    // Shift hue toward blue/purple
    vec3 chrome = vec3(
        color.r * 0.7 + color.b * 0.3,
        color.g * 0.8 + color.b * 0.2,
        color.b * 1.2
    );
    // Add metallic sheen
    float luminance = dot(color.rgb, vec3(0.299, 0.587, 0.114));
    chrome += vec3(0.1, 0.05, 0.2) * luminance;
    fragColor = vec4(clamp(chrome, 0.0, 1.0), 1.0);
}
`,
    thermal: `#version 300 es
precision highp float;

uniform sampler2D cameraTexture;
in vec2 uv;
out vec4 fragColor;

void main() {
    vec4 color = texture(cameraTexture, uv);
    // Convert to heat map based on luminance
    float heat = dot(color.rgb, vec3(0.299, 0.587, 0.114));

    vec3 thermal;
    if (heat < 0.25) {
        thermal = mix(vec3(0.0, 0.0, 0.5), vec3(0.0, 0.0, 1.0), heat * 4.0);
    } else if (heat < 0.5) {
        thermal = mix(vec3(0.0, 0.0, 1.0), vec3(0.0, 1.0, 0.0), (heat - 0.25) * 4.0);
    } else if (heat < 0.75) {
        thermal = mix(vec3(0.0, 1.0, 0.0), vec3(1.0, 1.0, 0.0), (heat - 0.5) * 4.0);
    } else {
        thermal = mix(vec3(1.0, 1.0, 0.0), vec3(1.0, 0.0, 0.0), (heat - 0.75) * 4.0);
    }
    fragColor = vec4(thermal, 1.0);
}
`,
    comic: `#version 300 es
precision highp float;

uniform sampler2D cameraTexture;
uniform vec2 resolution;
in vec2 uv;
out vec4 fragColor;

void main() {
    vec4 color = texture(cameraTexture, uv);

    // Posterize - reduce color levels for cartoon look
    float levels = 5.0;
    vec3 posterized = floor(color.rgb * levels + 0.5) / levels;

    // Simple edge detection using color difference with neighbors
    vec2 texelSize = 1.0 / resolution;
    vec4 left = texture(cameraTexture, uv - vec2(texelSize.x, 0.0));
    vec4 right = texture(cameraTexture, uv + vec2(texelSize.x, 0.0));
    vec4 up = texture(cameraTexture, uv - vec2(0.0, texelSize.y));
    vec4 down = texture(cameraTexture, uv + vec2(0.0, texelSize.y));

    float edge = length(left.rgb - right.rgb) + length(up.rgb - down.rgb);
    edge = step(0.2, edge);

    // Combine posterized color with dark edges
    vec3 result = mix(posterized, vec3(0.0), edge * 0.8);

    // Boost saturation slightly
    float gray = dot(result, vec3(0.299, 0.587, 0.114));
    result = mix(vec3(gray), result, 1.3);

    fragColor = vec4(clamp(result, 0.0, 1.0), 1.0);
}
`,
    pastel: `#version 300 es
precision highp float;

uniform sampler2D cameraTexture;
uniform vec2 resolution;
in vec2 uv;
out vec4 fragColor;

void main() {
    vec4 color = texture(cameraTexture, uv);

    // Soften colors toward pastel
    vec3 pastel = mix(color.rgb, vec3(1.0), 0.4);

    // Reduce saturation slightly
    float gray = dot(pastel, vec3(0.299, 0.587, 0.114));
    pastel = mix(vec3(gray), pastel, 0.7);

    // Edge detection for outline
    vec2 texelSize = 2.0 / resolution;
    float edge = 0.0;

    for (float x = -1.0; x <= 1.0; x += 1.0) {
        for (float y = -1.0; y <= 1.0; y += 1.0) {
            if (x == 0.0 && y == 0.0) continue;
            vec4 neighbor = texture(cameraTexture, uv + vec2(x, y) * texelSize);
            edge += length(color.rgb - neighbor.rgb);
        }
    }
    edge = edge / 8.0;
    edge = smoothstep(0.1, 0.3, edge);

    // Dark purple/blue outline
    vec3 outlineColor = vec3(0.3, 0.2, 0.4);
    vec3 result = mix(pastel, outlineColor, edge * 0.9);

    fragColor = vec4(result, 1.0);
}
`,
};

export function GLCameraLayer() {
    const [permission, requestPermission] = useCameraPermissions();
    const cameraFilter = useGameStore((state) => state.cameraFilter);
    const cameraRef = useRef<CameraView>(null);
    const glViewRef = useRef<GLView>(null);
    const [glReady, setGlReady] = useState(false);
    const rafRef = useRef<number | null>(null);
    const glRef = useRef<ExpoWebGLRenderingContext | null>(null);
    const programRef = useRef<WebGLProgram | null>(null);
    const textureRef = useRef<WebGLTexture | null>(null);

    // Auto-request permission on mount
    useEffect(() => {
        if (permission && !permission.granted && permission.canAskAgain) {
            requestPermission();
        }
    }, [permission]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (rafRef.current) {
                cancelAnimationFrame(rafRef.current);
            }
        };
    }, []);

    const onContextCreate = async (gl: ExpoWebGLRenderingContext) => {
        glRef.current = gl;

        // Create shader program
        const vertexShader = gl.createShader(gl.VERTEX_SHADER)!;
        gl.shaderSource(vertexShader, vertexShaderSource);
        gl.compileShader(vertexShader);

        if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
            console.error('Vertex shader error:', gl.getShaderInfoLog(vertexShader));
            return;
        }

        const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER)!;
        const shaderSource = SHADERS[cameraFilter] || SHADERS.none;
        gl.shaderSource(fragmentShader, shaderSource);
        gl.compileShader(fragmentShader);

        if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
            console.error('Fragment shader error:', gl.getShaderInfoLog(fragmentShader));
            return;
        }

        const program = gl.createProgram()!;
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);

        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            console.error('Program link error:', gl.getProgramInfoLog(program));
            return;
        }

        programRef.current = program;
        gl.useProgram(program);

        // Create vertex buffer for full-screen quad
        const vertices = new Float32Array([
            -1, -1,
            1, -1,
            -1, 1,
            1, 1,
        ]);
        const vertexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

        const positionLocation = gl.getAttribLocation(program, 'position');
        gl.enableVertexAttribArray(positionLocation);
        gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

        // Set resolution uniform for edge detection
        const resolutionLocation = gl.getUniformLocation(program, 'resolution');
        if (resolutionLocation) {
            gl.uniform2f(resolutionLocation, gl.drawingBufferWidth, gl.drawingBufferHeight);
        }

        // Create camera texture
        if (cameraRef.current && glViewRef.current) {
            try {
                const texture = await glViewRef.current.createCameraTextureAsync(cameraRef.current);
                textureRef.current = texture;
                setGlReady(true);
                startRenderLoop(gl, program, texture);
            } catch (error) {
                console.error('Failed to create camera texture:', error);
            }
        }
    };

    const startRenderLoop = (gl: ExpoWebGLRenderingContext, program: WebGLProgram, texture: WebGLTexture) => {
        const textureLocation = gl.getUniformLocation(program, 'cameraTexture');

        const render = () => {
            gl.clearColor(0, 0, 0, 1);
            gl.clear(gl.COLOR_BUFFER_BIT);

            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, texture);
            gl.uniform1i(textureLocation, 0);

            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
            gl.endFrameEXP();

            rafRef.current = requestAnimationFrame(render);
        };

        render();
    };

    // Recreate shader when filter changes
    useEffect(() => {
        if (glRef.current && programRef.current && glReady) {
            const gl = glRef.current;

            // Create new fragment shader with updated filter
            const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER)!;
            const shaderSource = SHADERS[cameraFilter] || SHADERS.none;
            gl.shaderSource(fragmentShader, shaderSource);
            gl.compileShader(fragmentShader);

            if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
                console.error('Fragment shader recompile error:', gl.getShaderInfoLog(fragmentShader));
                return;
            }

            // Create new vertex shader
            const vertexShader = gl.createShader(gl.VERTEX_SHADER)!;
            gl.shaderSource(vertexShader, vertexShaderSource);
            gl.compileShader(vertexShader);

            // Create new program
            const newProgram = gl.createProgram()!;
            gl.attachShader(newProgram, vertexShader);
            gl.attachShader(newProgram, fragmentShader);
            gl.linkProgram(newProgram);

            if (gl.getProgramParameter(newProgram, gl.LINK_STATUS)) {
                gl.useProgram(newProgram);
                programRef.current = newProgram;

                // Re-setup vertex attributes
                const positionLocation = gl.getAttribLocation(newProgram, 'position');
                gl.enableVertexAttribArray(positionLocation);
                gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

                // Set resolution uniform
                const resolutionLocation = gl.getUniformLocation(newProgram, 'resolution');
                if (resolutionLocation) {
                    gl.uniform2f(resolutionLocation, gl.drawingBufferWidth, gl.drawingBufferHeight);
                }
            }
        }
    }, [cameraFilter, glReady]);

    if (!permission) {
        return (
            <View style={styles.container}>
                <ActivityIndicator size="large" color={COLORS.accent} />
                <Text style={styles.message}>Loading camera...</Text>
            </View>
        );
    }

    if (!permission.granted) {
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
            {/* Hidden camera view that provides the texture */}
            <CameraView
                ref={cameraRef}
                style={styles.hiddenCamera}
                facing="front"
            />
            {/* GL view that renders the processed camera feed */}
            <GLView
                ref={glViewRef}
                style={styles.glView}
                onContextCreate={onContextCreate}
            />
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
    hiddenCamera: {
        position: 'absolute',
        width: 1,
        height: 1,
        opacity: 0,
    },
    glView: {
        flex: 1,
        width: '100%',
    },
});
