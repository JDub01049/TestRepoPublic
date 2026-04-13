import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { AppProvider } from './src/context/AppContext';
import DashboardScreen from './src/screens/DashboardScreen';
import CryptoDetailScreen from './src/screens/CryptoDetailScreen';
import SearchScreen from './src/screens/SearchScreen';
import PortfolioScreen from './src/screens/PortfolioScreen';
import AIAssistantScreen from './src/screens/AIAssistantScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import { colors } from './src/theme';

const Tab = createBottomTabNavigator();
const HomeStack = createNativeStackNavigator();

function HomeStackNavigator() {
  return (
    <HomeStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.text.primary,
        headerTitleStyle: { fontWeight: '700', color: colors.text.primary },
        headerShadowVisible: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <HomeStack.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{ headerShown: false }}
      />
      <HomeStack.Screen
        name="CryptoDetail"
        component={CryptoDetailScreen}
        options={({ route }) => ({
          title: route.params?.coinName || 'Details',
          headerBackTitle: '',
        })}
      />
      <HomeStack.Screen
        name="Search"
        component={SearchScreen}
        options={{ headerShown: false }}
      />
    </HomeStack.Navigator>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AppProvider>
        <NavigationContainer
          theme={{
            dark: true,
            colors: {
              primary: colors.primary,
              background: colors.background,
              card: colors.surface,
              text: colors.text.primary,
              border: colors.border,
              notification: colors.primary,
            },
          }}
        >
          <StatusBar style="light" />
          <Tab.Navigator
            screenOptions={({ route }) => ({
              tabBarIcon: ({ focused, color, size }) => {
                const icons = {
                  Home: focused ? 'home' : 'home-outline',
                  Portfolio: focused ? 'wallet' : 'wallet-outline',
                  AI: focused ? 'sparkles' : 'sparkles-outline',
                  Settings: focused ? 'settings' : 'settings-outline',
                };
                return <Ionicons name={icons[route.name]} size={size} color={color} />;
              },
              tabBarActiveTintColor: colors.primary,
              tabBarInactiveTintColor: colors.text.secondary,
              tabBarStyle: {
                backgroundColor: colors.surface,
                borderTopColor: colors.border,
                borderTopWidth: 1,
                paddingBottom: 6,
                paddingTop: 4,
                height: 62,
              },
              tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
              headerShown: false,
            })}
          >
            <Tab.Screen
              name="Home"
              component={HomeStackNavigator}
              options={{ title: 'Markets' }}
            />
            <Tab.Screen
              name="Portfolio"
              component={PortfolioScreen}
            />
            <Tab.Screen
              name="AI"
              component={AIAssistantScreen}
              options={{ title: 'AI Chat' }}
            />
            <Tab.Screen
              name="Settings"
              component={SettingsScreen}
            />
          </Tab.Navigator>
        </NavigationContainer>
      </AppProvider>
    </SafeAreaProvider>
  );
}
