import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';
// Update the import path to the correct location of HomeScreen
import HomeScreen from './screen/HomeScreen';


export default function App() {
    return (
        <GestureHandlerRootView style={styles.container}>
            <HomeScreen />
            <StatusBar style="light" />
        </GestureHandlerRootView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});