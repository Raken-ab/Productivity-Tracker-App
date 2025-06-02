/**
 * App.tsx
 * -----------
 * Main entry point for the Productivity Tracker app.
 * Now uses a bottom tab navigator to switch between three screens.
 */

import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

// Import your screens
import HomeScreen from './screen/HomeScreen';
import CalenderScreen from './screen/CalenderScreen'; // <-- Import your calendar screen

// Placeholder screen for demonstration
const Screen2 = () => <></>;

const Tab = createBottomTabNavigator();

export default function App() {
    return (
        <GestureHandlerRootView style={styles.container}>
            <NavigationContainer>
                <Tab.Navigator
                    screenOptions={{
                        headerShown: false,
                        tabBarStyle: {
                            backgroundColor: '#222',
                        },
                        tabBarActiveTintColor: '#fff',
                        tabBarInactiveTintColor: '#888',
                    }}
                >
                    <Tab.Screen name="Report" component={Screen2} />
                    <Tab.Screen name="Tasks" component={HomeScreen} />
                    <Tab.Screen name="Calendar" component={CalenderScreen} />
                </Tab.Navigator>
            </NavigationContainer>
            <StatusBar style="light" />
        </GestureHandlerRootView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});