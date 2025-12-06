---
description: How to deploy the Expo app to iOS App Store and Google Play Store
---

# Deploying to App Stores (Expo EAS)

This workflow guides you through deploying your Expo app to the Apple App Store and Google Play Store using EAS (Expo Application Services).

## Prerequisites
1.  **Expo Account**: Sign up at [expo.dev](https://expo.dev).
2.  **Apple Developer Account**: Required for iOS ($99/year).
3.  **Google Play Console Account**: Required for Android ($25 one-time fee).
4.  **EAS CLI**: Installed globally (`npm install -g eas-cli`).

## 1. Configure Project
Ensure your `app.json` has unique identifiers.

```json
{
  "expo": {
    "ios": {
      "bundleIdentifier": "com.yourname.freestyleflow"
    },
    "android": {
      "package": "com.yourname.freestyleflow"
    },
    "extra": {
      "eas": {
        "projectId": "..."
      }
    }
  }
}
```

## 2. Setup EAS
Run the following commands in your terminal:

```bash
# Login to Expo
eas login

# Configure the project (creates eas.json)
eas build:configure
```

## 3. Create a Build
Build your app binary for the stores.

```bash
# Build for both platforms
eas build --platform all --profile production
```

*Note: You will need to provide your Apple/Google credentials during the build process to generate certificates and provisioning profiles.*

## 4. Submit to Stores
Once the build is complete, you can submit it directly.

### iOS (App Store)
```bash
eas submit --platform ios
```

### Android (Google Play)
```bash
eas submit --platform android
```

## 5. Release
- **iOS**: Go to App Store Connect, select the build, and submit for review.
- **Android**: Go to Google Play Console, promote the release from Internal Testing to Production (or Open Testing).
