import React, { useCallback } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { View } from 'react-native';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';

import BasesScreen from './src/screens/BasesScreen';
import ColaborarScreen from './src/screens/ColaborarScreen';

SplashScreen.preventAutoHideAsync();

const Tab = createBottomTabNavigator();

function MainTabs() {
  const insets = useSafeAreaInsets();
  const TAB_BAR_HEIGHT = 60;
  const DEFAULT_PADDING_BOTTOM = 10;
  const paddingBottom = insets.bottom > 0 ? insets.bottom + 10 : DEFAULT_PADDING_BOTTOM;
  const height = TAB_BAR_HEIGHT + paddingBottom;

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Bases') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Colaborar') {
            iconName = focused ? 'add-circle' : 'add-circle-outline';
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#facc15',
        tabBarInactiveTintColor: '#999999',
        tabBarStyle: {
          backgroundColor: '#121212',
          borderTopColor: '#333',
          height: height,
          paddingBottom: paddingBottom,
          paddingTop: 10,
        },
        tabBarLabelStyle: {
          fontFamily: 'LilitaOne',
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Bases" component={BasesScreen} />
      <Tab.Screen name="Colaborar" component={ColaborarScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  const [fontsLoaded] = useFonts({
    LilitaOne: require('./assets/fonts/LilitaOne-Regular.ttf'),
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <View style={{ flex: 1, backgroundColor: '#0a0a0a' }} onLayout={onLayoutRootView}>
        <NavigationContainer>
          <StatusBar style="light" />
          <MainTabs />
        </NavigationContainer>
      </View>
    </SafeAreaProvider>
  );
}
