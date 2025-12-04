import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { ActivityIndicator, View } from 'react-native';
import { useFonts } from 'expo-font';

import BasesScreen from './src/screens/BasesScreen';
import ColaborarScreen from './src/screens/ColaborarScreen';

const Tab = createBottomTabNavigator();

function MainTabs() {
  const insets = useSafeAreaInsets();

  const TAB_BAR_HEIGHT = 60;
  const DEFAULT_PADDING_BOTTOM = 10;

  const paddingBottom = insets.bottom > 0 ? insets.bottom : DEFAULT_PADDING_BOTTOM;
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
        tabBarInactiveTintColor: 'gray',
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

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#facc15" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar style="light" />
        <MainTabs />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
