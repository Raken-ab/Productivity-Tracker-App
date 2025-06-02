# Productivity & Sobriety Tracker

A React Native app built with Expo and TypeScript to help students track daily tasks, build healthy habits, and maintain sobriety streaks.

## Features

- **Three Task Types:**
  - `unit`: Progress-based tasks (e.g., "Study 3 hours")
  - `daily`: Once-per-day tasks (e.g., "No social media")
  - `clean`: Sobriety tracking (e.g., "No alcohol")

- **Intuitive Interface:**
  - Swipe right to complete tasks
  - Tap to edit tasks
  - Visual progress bars for unit tasks
  - Streak counters for daily/clean tasks

- **Smart Features:**
  - Automatic daily reset at midnight
  - Local data storage with AsyncStorage
  - Pull-to-refresh functionality
  - Dark theme optimized for mobile

## Quick Start

1. **Create Expo Project:**
   ```bash
   npx create-expo-app productivity-tracker --template blank-typescript
   cd productivity-tracker
   ```

2. **Install Required Dependencies:**
   ```bash
   npm install @react-native-async-storage/async-storage react-native-gesture-handler
   ```

3. **Copy Project Files:**
   - Copy all the provided files to their respective folders
   - Replace the default App.tsx with the provided one

4. **Start the Development Server:**
   ```bash
   npx expo start
   ```

5. **Run on Device:**
   - Scan the QR code with Expo Go app (iOS/Android)
   - Or press `i` for iOS Simulator
   - Or press `a` for Android Emulator

## Installation Steps (Detailed)

If you're getting dependency errors, follow these exact steps:

1. **Create new Expo project:**
   ```bash
   npx create-expo-app@latest productivity-tracker --template blank-typescript
   cd productivity-tracker
   ```

2. **Install AsyncStorage:**
   ```bash
   npx expo install @react-native-async-storage/async-storage
   ```

3. **Install Gesture Handler:**
   ```bash
   npx expo install react-native-gesture-handler
   ```

4. **Verify installation:**
   ```bash
   npm list @react-native-async-storage/async-storage react-native-gesture-handler
   ```

## Project Structure

```
├── components/
│   ├── TaskCard.tsx      # Swipeable task component
│   └── TaskModal.tsx     # Add/edit task modal
├── screens/
│   └── HomeScreen.tsx    # Main task list screen
├── styles/
│   ├── colors.ts         # Color palette
│   └── taskStyles.ts     # Task-specific styles
├── utils/
│   ├── storage.ts        # AsyncStorage helpers
│   └── taskHelpers.ts    # Task logic and utilities
└── App.tsx               # Main entry point
```

## Task Types Explained

### Unit Tasks
- Have measurable progress (current/target values)
- Example: "Study for 3 hours" (progress: 1.5/3 hours)
- Visual progress bar shows completion status
- Completed when current value reaches target

### Daily Tasks
- Simple once-per-day completion
- Example: "No social media today"
- Tracks consecutive day streaks
- Resets every midnight

### Clean Tasks
- Sobriety and addiction recovery focused
- Example: "No alcohol", "No smoking"
- Tracks consecutive clean days
- Streak counter motivates continued sobriety

## How It Works

1. **Daily Reset:** Tasks automatically reset at midnight
2. **Streak Tracking:** Consecutive completions build streaks
3. **Local Storage:** All data stored locally using AsyncStorage
4. **Gesture Controls:** Swipe right to complete, tap to edit
5. **Progress Tracking:** Visual indicators show completion status

## Troubleshooting

### Common Issues:

1. **AsyncStorage not found:**
   ```bash
   npx expo install @react-native-async-storage/async-storage
   ```

2. **Gesture handler not working:**
   ```bash
   npx expo install react-native-gesture-handler
   ```

3. **TypeScript errors:**
   ```bash
   npm install --save-dev @types/react @types/react-native
   ```

4. **Metro bundler issues:**
   ```bash
   npx expo start --clear
   ```

## Technical Details

- **Framework:** React Native with Expo
- **Language:** TypeScript
- **Storage:** AsyncStorage (local device storage)
- **Gestures:** react-native-gesture-handler
- **State Management:** React hooks (useState, useEffect)
- **Navigation:** Built-in modals and screens

## Development

The app uses a modular architecture with clear separation of concerns:

- **Components:** Reusable UI elements
- **Screens:** Full-screen views
- **Utils:** Business logic and data handling
- **Styles:** Centralized styling and theming

## License

This project is open source and available under the MIT License.me-md.md…]()
