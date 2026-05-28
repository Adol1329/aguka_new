# Aguka Mobile App

Mobile application for the Aguka Smart Farming Kit - Flutter + BLoC + Clean Architecture.

## Prerequisites
- Flutter SDK >= 3.0.0
- Android Studio / Xcode (for platform-specific development)
- Android device/emulator or iOS simulator

## Installation

```bash
# Install dependencies
flutter pub get
```

## Configuration

The backend API URL is configured in `lib/core/config/app_config.dart`:

```dart
// Change this to your local machine IP for physical device testing
static const String _localIp = '10.24.0.151';
```

For physical device testing, update `_localIp` to your machine's local IP address.
For Android Emulator, you can use `10.0.2.2` instead of localhost.

## Running the Application

```bash
# Run on connected device/emulator
flutter run

# Run on specific device
flutter run -d <device-id>

# List available devices
flutter devices
```

## Supported Platforms

- **Android** - Minimum SDK 21
- **iOS** - Supported (requires macOS and Xcode)

## Building for Production

```bash
# Android APK
flutter build apk

# Android App Bundle
flutter build appbundle

# iOS
flutter build ios
```

## Project Structure

- `lib/` - Source code
  - `core/` - Core functionality (config, utils, localization)
  - `data/` - Data layer (datasources, repositories)
  - `features/` - Feature modules (auth, dashboard, irrigation, etc.)
  - `shared/` - Shared components and BLoCs
  - `services/` - External services (Firebase)
  - `widgets/` - Reusable widgets
  - `main.dart` - Application entry point
  - `injection_container.dart` - Dependency injection setup
- `assets/` - Static assets (images, translations, branding)
- `android/` - Android-specific code
- `ios/` - iOS-specific code (if present)

## Architecture

The app follows Clean Architecture principles:
- **Presentation Layer**: UI components and BLoCs
- **Domain Layer**: Use cases and business logic
- **Data Layer**: Data sources and repositories

## State Management

- **BLoC Pattern** - Business Logic Component for state management
- **Dependency Injection** - GetIt for service injection

## Features

- Multi-language support (English, Kinyarwanda, French)
- Offline data synchronization
- Real-time sensor data via Socket.IO
- Firebase push notifications
- Role-based authentication
