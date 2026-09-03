import 'react-native-gesture-handler';
import React from 'react';
import { Platform, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { enableScreens } from 'react-native-screens';

if (Platform.OS === 'web') {
  enableScreens(false);
}

import WelcomeScreen from './src/screens/WelcomeScreen';
import PetInputScreen from './src/screens/PetInputScreen';
import OwnerInputScreen from './src/screens/OwnerInputScreen';
import LoadingRevealScreen from './src/screens/LoadingRevealScreen';
import PetReadingScreen from './src/screens/PetReadingScreen';
import CompatibilityScreen from './src/screens/CompatibilityScreen';
import ShareCardScreen from './src/screens/ShareCardScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <GestureHandlerRootView style={styles.flex}>
      <SafeAreaProvider>
        <StatusBar style="light" />
        <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: '#0f1729' },
            animation: Platform.OS === 'web' ? 'fade' : 'slide_from_right',
          }}
        >
          <Stack.Screen name="Welcome" component={WelcomeScreen} />
          <Stack.Screen name="PetInput" component={PetInputScreen} />
          <Stack.Screen name="OwnerInput" component={OwnerInputScreen} />
          <Stack.Screen name="LoadingReveal" component={LoadingRevealScreen} />
          <Stack.Screen name="PetReading" component={PetReadingScreen} />
          <Stack.Screen name="Compatibility" component={CompatibilityScreen} />
          <Stack.Screen
            name="ShareCard"
            component={ShareCardScreen}
            options={{ presentation: 'modal' }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
});
