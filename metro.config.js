const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add mp3 to asset extensions
config.resolver.assetExts.push('mp3');

module.exports = config;
