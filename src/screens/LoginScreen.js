import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, ScrollView, Platform, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { AuthContext } from '../context/AuthContext';
import { UserLoginSchema } from '../utils/validators';
import globalStyles from '../styles/globalStyles';
import initializeWebSocket from '../services/socket';

const LoginScreen = ({ navigation }) => {
  const { login } = useContext(AuthContext);
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    setErrorMessage('');
    setIsLoading(true);
    try {
      // Validate input
      await UserLoginSchema.validate({ login_id: loginId, Password: password });
      console.log('LoginScreen: Sending login request:', { login_id: loginId, Password: password });

      // Call login from AuthContext
      const result = await login(loginId, password);
      if (result.success) {
        console.log('LoginScreen: Login successful');
        // Initialize WebSocket
        const ws = await initializeWebSocket();
        if (ws) {
          console.log('LoginScreen: WebSocket initialized');
        } else {
          console.warn('LoginScreen: Failed to initialize WebSocket');
        }
        // Navigate to Home
        navigation.replace('Home');
      } else {
        console.log('LoginScreen: Login failed:', result.message);
        setErrorMessage(result.message);
      }
    } catch (error) {
      console.error('LoginScreen: Error:', error.response?.data || error.message);
      const errorMsg = error.response?.data?.detail || error.message || 'Login failed. Please try again.';
      setErrorMessage(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View style={[globalStyles.container, { justifyContent: 'space-between' }]}>
          <View>
            <View style={[globalStyles.logoContainer, { marginLeft: globalStyles.SPACING.medium, marginTop: globalStyles.SPACING.large }]}>
              <View style={[globalStyles.circle, globalStyles.circlePrimary]} />
              <View style={[globalStyles.circle, globalStyles.circleSecondary]} />
            </View>
            <Text style={[globalStyles.textXLargeBlack, { marginBottom: globalStyles.SPACING.large, alignSelf: 'center' }]}>
              Login
            </Text>
            <TextInput
              style={[globalStyles.input, { color: globalStyles.COLORS.text }]}
              placeholder="Email or Username"
              placeholderTextColor={globalStyles.COLORS.placeholder}
              value={loginId}
              onChangeText={setLoginId}
              autoCapitalize="none"
              editable={!isLoading}
            />
            <View style={{ position: 'relative', width: '100%', alignSelf: 'center' }}>
              <TextInput
                style={[globalStyles.input, { color: globalStyles.COLORS.text }]}
                placeholder="Password"
                placeholderTextColor={globalStyles.COLORS.placeholder}
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
                editable={!isLoading}
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Icon name={showPassword ? 'visibility' : 'visibility-off'} size={20} color={globalStyles.COLORS.text} />
              </TouchableOpacity>
            </View>
            {errorMessage ? <Text style={[globalStyles.textError, { alignSelf: 'center' }]}>{errorMessage}</Text> : null}
            <TouchableOpacity
              style={[globalStyles.button, isLoading && { opacity: 0.7 }, { alignSelf: 'center' }]}
              onPress={handleLogin}
              disabled={isLoading}
            >
              <Text style={globalStyles.buttonText}>{isLoading ? 'Logging in...' : 'Login'}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
              <Text style={[globalStyles.text, styles.forgotPasswordLink]}>Forgot Password?</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('SignupStep1')}>
              <Text style={[globalStyles.text, styles.signUpLink]}>Don't have an account? Create one</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.footer}>
            <View style={styles.footerLine} />
            <Text style={styles.footerText}>Your Trusted Banking Partner</Text>
            <View style={styles.footerLine} />
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  eyeIcon: {
    position: 'absolute',
    right: 10,
    top: '50%',
    transform: [{ translateY: -12 }],
    justifyContent: 'center',
    alignItems: 'center',
    padding: 5,
  },
  forgotPasswordLink: {
    color: globalStyles.COLORS.primary,
    textAlign: 'center',
    marginVertical: globalStyles.SPACING.small,
    textDecorationLine: 'underline',
    alignSelf: 'center',
  },
  signUpLink: {
    color: globalStyles.COLORS.secondary,
    textAlign: 'center',
    marginVertical: globalStyles.SPACING.small,
    textDecorationLine: 'underline',
    alignSelf: 'center',
  },
  footer: {
    alignItems: 'center',
    marginBottom: globalStyles.SPACING.large,
  },
  footerLine: {
    width: '80%',
    height: 2,
    backgroundColor: globalStyles.COLORS.primary,
    marginVertical: globalStyles.SPACING.small,
  },
  footerText: {
    fontSize: 16,
    color: globalStyles.COLORS.text,
    fontStyle: 'italic',
  },
});

export default LoginScreen;