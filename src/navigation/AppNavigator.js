import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { AuthContext } from '../context/AuthContext';
import WelcomeScreen from '../screens/WelcomeScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import LoginScreen from '../screens/LoginScreen';
import SignupStep1 from '../screens/SignupStep/SignupStep1';
import SignupStep2 from '../screens/SignupStep/SignupStep2';
import SignupStep3 from '../screens/SignupStep/SignupStep3';
import SignupStep4 from '../screens/SignupStep/SignupStep4';
import SignupStep5 from '../screens/SignupStep/SignupStep5';
import SignupStep6 from '../screens/SignupStep/SignupStep6';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import HomeScreen from '../screens/HomeScreen';
import SendScreen from '../screens/SendScreen';
import DepositScreen from '../screens/DepositScreen';
import LoanScreen from '../screens/LoanScreen';
import TransactionsScreen from '../screens/TransactionsScreen';
import WithdrawScreen from '../screens/WithdrawScreen';
import CardsScreen from '../screens/CardsScreen';
import QRCodeScreen from '../screens/QRCodeScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import HistoryScreen from '../screens/HistoryScreen';
import SettingsScreen from '../screens/SettingsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import ScanQRScreen from '../screens/ScanQRScreen';
import RecipientScreen from '../screens/RecipientScreen';
import SplashScreen from '../screens/SplashScreen';
import { View, Text } from 'react-native';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const AppTabs = () => {
  const context = useContext(AuthContext);
  const user = context?.user;

  console.log('AppTabs: Rendering, user:', user ? Object.keys(user) : 'undefined', 'context:', !!context);

  if (!user) {
    console.log('AppTabs: No user, skipping render');
    return null; // Prevent rendering tabs if not authenticated
  }

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: { height: 60, paddingBottom: 5 },
        tabBarLabelStyle: { fontSize: 12 },
        tabBarActiveTintColor: '#3498db',
        tabBarInactiveTintColor: '#7f8c8d',
        headerShown: false,
      }}
      initialRouteName="HomeTab"
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color }) => <Icon name="home" size={24} color={color} />,
        }}
        listeners={{
          focus: () => console.log('AppTabs: HomeTab focused, user:', user ? Object.keys(user) : 'undefined'),
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
};

const AppNavigator = () => {
  const context = useContext(AuthContext);
  const user = context?.user;
  const isLoading = context?.isLoading;

  console.log('AppNavigator: Rendering, isLoading:', isLoading, 'user:', user ? Object.keys(user) : 'undefined', 'context:', !!context);

  if (!context) {
    console.error('AppNavigator: AuthContext is undefined');
    return (
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen
            name="Error"
            component={() => (
              <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Text>Authentication error. Please restart the app.</Text>
              </View>
            )}
            options={{ headerShown: false }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    );
  }

  if (isLoading) {
    console.log('AppNavigator: Showing splash screen due to isLoading');
    return (
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen
            name="Splash"
            component={SplashScreen}
            options={{ headerShown: false }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={user ? 'Home' : 'Welcome'}
        screenOptions={{ headerShown: false }}
      >
        {!user ? (
          <>
            <Stack.Screen
              name="Welcome"
              component={SplashScreen}
              listeners={{
                focus: () => console.log('Navigation: Focused on Welcome'),
              }}
            />
            <Stack.Screen
              name="Onboarding"
              component={OnboardingScreen}
              listeners={{
                focus: () => console.log('Navigation: Focused on Onboarding'),
              }}
            />
            <Stack.Screen
              name="Login"
              component={LoginScreen}
              listeners={{
                focus: () => console.log('Navigation: Focused on Login'),
              }}
            />
            <Stack.Screen name="SignupStep1" component={SignupStep1} />
            <Stack.Screen name="SignupStep2" component={SignupStep2} />
            <Stack.Screen name="SignupStep3" component={SignupStep3} />
            <Stack.Screen name="SignupStep4" component={SignupStep4} />
            <Stack.Screen name="SignupStep5" component={SignupStep5} />
            <Stack.Screen name="SignupStep6" component={SignupStep6} />
            <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
          </>
        ) : (
          <>
            <Stack.Screen
              name="Home"
              component={AppTabs}
              listeners={{
                focus: () =>
                  console.log('Navigation: Focused on Home (AppTabs), user:', user ? Object.keys(user) : 'undefined'),
              }}
            />
            <Stack.Screen name="Send" component={SendScreen} />
            <Stack.Screen name="Deposit" component={DepositScreen} />
            <Stack.Screen name="Loan" component={LoanScreen} />
            <Stack.Screen name="Transactions" component={TransactionsScreen} />
            <Stack.Screen name="Withdraw" component={WithdrawScreen} />
            <Stack.Screen name="Cards" component={CardsScreen} />
            <Stack.Screen name="QRCode" component={QRCodeScreen} />
            <Stack.Screen name="Notifications" component={NotificationsScreen} />
            <Stack.Screen name="RecipientScreen" component={RecipientScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;