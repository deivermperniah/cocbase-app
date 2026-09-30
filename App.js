import React, { useCallback } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { View } from 'react-native';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { AuthProvider, useAuth } from './src/context/AuthContext';
import { FavoritesProvider } from './src/context/FavoritesContext';
import DialogProvider from './src/components/DialogProvider';
import BasesScreen from './src/screens/BasesScreen';
import BaseListScreen from './src/screens/BaseListScreen';
import FavoritesScreen from './src/screens/FavoritesScreen';
import ContributeScreen from './src/screens/ContributeScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import AuthScreen from './src/screens/AuthScreen';
import PanelScreen from './src/screens/PanelScreen';
import NewBaseScreen from './src/screens/NewBaseScreen';
import ReviewScreen from './src/screens/ReviewScreen';
import ImagesScreen from './src/screens/ImagesScreen';
import { COLORS, FONT } from './src/lib/theme';
import { useIsWide } from './src/lib/layout';

SplashScreen.preventAutoHideAsync();

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const TAB_ICONS = {
  Bases: ['home', 'home-outline'],
  Favoritos: ['heart', 'heart-outline'],
  Contribuir: ['add-circle', 'add-circle-outline'],
  Panel: ['grid', 'grid-outline'],
  Ajustes: ['settings', 'settings-outline'],
};

function MainTabs() {
  const insets = useSafeAreaInsets();
  const { isAdmin } = useAuth();
  const isWide = useIsWide();
  const TAB_BAR_HEIGHT = 60;
  const DEFAULT_PADDING_BOTTOM = 10;
  const paddingBottom = insets.bottom > 0 ? insets.bottom + 10 : DEFAULT_PADDING_BOTTOM;
  const height = TAB_BAR_HEIGHT + paddingBottom;

  return (
    <Tab.Navigator
        detachInactiveScreens={false}
        screenOptions={({ route }) => ({
        sceneStyle: { backgroundColor: COLORS.background },
        tabBarIcon: ({ focused, color, size }) => {
          const [activeIcon, inactiveIcon] = TAB_ICONS[route.name];
          return <Ionicons name={focused ? activeIcon : inactiveIcon} size={size} color={color} />;
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarPosition: isWide ? 'left' : 'bottom',
        tabBarVariant: isWide ? 'material' : 'uikit',
        tabBarLabelPosition: isWide ? 'below-icon' : undefined,
        tabBarStyle: isWide
          ? {
            backgroundColor: COLORS.surfaceDeep,
            borderRightColor: COLORS.border,
          }
          : {
            backgroundColor: COLORS.surfaceDeep,
            borderTopColor: COLORS.border,
            height: height,
            paddingBottom: paddingBottom,
            paddingTop: 10,
          },
        tabBarLabelStyle: {
          fontFamily: FONT,
        },
        headerShown: false,
        lazy: false,
      })}
    >
      <Tab.Screen name="Bases" component={BasesScreen} />
      <Tab.Screen name="Favoritos" component={FavoritesScreen} />
      {isAdmin
        ? <Tab.Screen name="Panel" component={PanelScreen} />
        : <Tab.Screen name="Contribuir" component={ContributeScreen} />}
      <Tab.Screen name="Ajustes" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

function RootNavigator() {
  const { isAdmin } = useAuth();

  return (
    <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: COLORS.background } }}>
      <Stack.Screen name="Tabs" component={MainTabs} />
      <Stack.Screen name="BaseList" component={BaseListScreen} options={{ animation: 'none' }} />
      <Stack.Screen name="Auth" component={AuthScreen} options={{ presentation: 'modal' }} />
      {isAdmin && (
        <Stack.Group screenOptions={{ animation: 'none' }}>
          <Stack.Screen name="NewBase" component={NewBaseScreen} />
          <Stack.Screen name="Review" component={ReviewScreen} />
          <Stack.Screen name="Images" component={ImagesScreen} />
        </Stack.Group>
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  const [fontsLoaded] = useFonts({
    [FONT]: require('./assets/fonts/LilitaOne-Regular.ttf'),
    ...Ionicons.font,
    ...MaterialCommunityIcons.font,
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
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <DialogProvider>
          <AuthProvider>
            <FavoritesProvider>
              <View style={{ flex: 1, backgroundColor: COLORS.background }} onLayout={onLayoutRootView}>
                <NavigationContainer>
                  <StatusBar style="light" />
                  <RootNavigator />
                </NavigationContainer>
              </View>
            </FavoritesProvider>
          </AuthProvider>
        </DialogProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
