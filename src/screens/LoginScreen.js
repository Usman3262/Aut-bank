import React, { useState } from 'react';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, ScrollView, Platform, StyleSheet } from 'react-native';
import { loginUser } from '../services/api';
import globalStyles from '../styles/globalStyles';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const validateInputs = () => {
    if (!email || !password) {
      setErrorMessage('All fields are required');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrorMessage('Please enter a valid email address');
      return false;
    }
    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long');
      return false;
    }
    return true;
  };

  const handleLogin = async () => {
    setErrorMessage('');
    if (!validateInputs()) return;

    setIsLoading(true);
    try {
      const result = await loginUser(email, password);
      if (result.success) {
        navigation.replace('Home');
      } else {
        setErrorMessage(result.message);
      }
    } catch (error) {
      setErrorMessage('An error occurred. Please try again.');
      console.error('LoginScreen error:', error);
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
          {/* Main Content */}
          <View>
            {/* Logo */}
            <View style={[globalStyles.logoContainer, { marginLeft: globalStyles.SPACING.medium, marginTop: globalStyles.SPACING.large }]}>
              <View style={[globalStyles.circle, globalStyles.circlePrimary]} />
              <View style={[globalStyles.circle, globalStyles.circleSecondary]} />
            </View>

            {/* Title */}
            <Text style={[globalStyles.textXLargeBlack, { marginBottom: globalStyles.SPACING.large, alignSelf: 'center' }]}>
              Login
            </Text>

            {/* Email Input */}
            <TextInput
              style={[globalStyles.input, { color: globalStyles.COLORS.text, alignSelf: 'center' }]}
              placeholder="Email Address"
              placeholderTextColor={globalStyles.COLORS.placeholder}
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              editable={!isLoading}
            />

            {/* Password Input with Show/Hide Toggle */}
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

            {/* Error Message */}
            {errorMessage ? <Text style={[globalStyles.textError, { alignSelf: 'center' }]}>{errorMessage}</Text> : null}

            {/* Login Button */}
            <TouchableOpacity
              style={[globalStyles.button, isLoading && { opacity: 0.7 }, { alignSelf: 'center' }]}
              onPress={handleLogin}
              disabled={isLoading}
            >
              <Text style={globalStyles.buttonText}>{isLoading ? 'Logging in...' : 'Login'}</Text>
            </TouchableOpacity>

            {/* Forgot Password Link */}
            <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
              <Text style={[globalStyles.text, styles.forgotPasswordLink]}>Forgot Password?</Text>
            </TouchableOpacity>

            {/* Sign Up Link */}
            <TouchableOpacity onPress={() => navigation.navigate('SignupStep1')}>
              <Text style={[globalStyles.text, styles.signUpLink]}>Don't have an account? Create one</Text>
            </TouchableOpacity>
          </View>

          {/* Footer */}
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
    transform: [{ translateY: -12 }], // Adjusted to center vertically
    justifyContent: 'center',
    alignItems: 'center',
    padding: 5, // Added for better touch area
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