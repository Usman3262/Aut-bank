import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LoginScreen from '../screens/LoginScreen';
import SplashScreen from '../screens/SplashScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import SignupStep1 from '../screens/SignupStep/SignupStep1';
import SignupStep2 from '../screens/SignupStep/SignupStep2';
import SignupStep3 from '../screens/SignupStep/SignupStep3';
import SignupStep4 from '../screens/SignupStep/SignupStep4';
import SignupStep5 from '../screens/SignupStep/SignupStep5';
import SignupStep6 from '../screens/SignupStep/SignupStep6';
import HomeScreen from '../screens/HomeScreen';
import SendScreen from '../screens/SendScreen';
import DepositScreen from '../screens/DepositScreen';
import LoanScreen from '../screens/LoanScreen';
import TransactionsScreen from '../screens/TransactionsScreen';
import BillsScreen from '../screens/BillsScreen';
import SavingsScreen from '../screens/SavingsScreen';
import QRCodeScreen from '../screens/QRCodeScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import HistoryScreen from '../screens/HistoryScreen';
import SettingsScreen from '../screens/SettingsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import ScanQRScreen from '../screens/ScanQRScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const AppTabs = () => (
  <Tab.Navigator
    screenOptions={{
      tabBarStyle: { height: 60, paddingBottom: 5 },
      tabBarLabelStyle: { fontSize: 12 },
      tabBarActiveTintColor: '#3498db',
      tabBarInactiveTintColor: '#7f8c8d', // Added to fix QR code color
      headerShown: false,
    }}
  >
    <Tab.Screen
      name="HomeTab"
      component={HomeScreen}
      options={{
        tabBarLabel: 'Home',
        tabBarIcon: ({ color }) => <Icon name="home" size={24} color={color} />,
      }}
    />
    <Tab.Screen
      name="HistoryTab"
      component={HistoryScreen}
      options={{
        tabBarLabel: 'History',
        tabBarIcon: ({ color }) => <Icon name="history" size={24} color={color} />,
      }}
    />
    <Tab.Screen
      name="ScanQR"
      component={ScanQRScreen}
      options={{
        tabBarIcon: ({ color }) => <Icon name="qr-code" size={32} color={color} />,
        tabBarLabel: '',
      }}
    />
    <Tab.Screen
      name="SettingsTab"
      component={SettingsScreen}
      options={{
        tabBarLabel: 'Settings',
        tabBarIcon: ({ color }) => <Icon name="settings" size={24} color={color} />,
      }}
    />
    <Tab.Screen
      name="ProfileTab"
      component={ProfileScreen}
      options={{
        tabBarLabel: 'Profile',
        tabBarIcon: ({ color }) => <Icon name="person" size={24} color={color} />,
      }}
    />
  </Tab.Navigator>
);

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Welcome" component={SplashScreen} />
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="SignupStep1" component={SignupStep1} />
        <Stack.Screen name="SignupStep2" component={SignupStep2} />
        <Stack.Screen name="SignupStep3" component={SignupStep3} />
        <Stack.Screen name="SignupStep4" component={SignupStep4} />
        <Stack.Screen name="SignupStep5" component={SignupStep5} />
        <Stack.Screen name="SignupStep6" component={SignupStep6} />
        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        <Stack.Screen name="Home" component={AppTabs} />
        <Stack.Screen name="Send" component={SendScreen} />
        <Stack.Screen name="Deposit" component={DepositScreen} />
        <Stack.Screen name="Loan" component={LoanScreen} />
        <Stack.Screen name="Transactions" component={TransactionsScreen} />
        <Stack.Screen name="Bills" component={BillsScreen} />
        <Stack.Screen name="Savings" component={SavingsScreen} />
        <Stack.Screen name="QRCode" component={QRCodeScreen} />
        <Stack.Screen name="Notifications" component={NotificationsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;