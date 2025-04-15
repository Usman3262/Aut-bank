import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, ScrollView, Platform, StyleSheet } from 'react-native';
import { sendOtpForPasswordReset, verifyOtpAndResetPassword } from '../services/api';
import globalStyles from '../styles/globalStyles';

const ForgotPasswordScreen = ({ navigation }) => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSendOtp = async () => {
    setErrorMessage('');
    if (!email) {
      setErrorMessage('Email is required');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrorMessage('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    try {
      const result = await sendOtpForPasswordReset(email);
      if (result.success) {
        setStep(2);
      } else {
        setErrorMessage(result.message);
      }
    } catch (error) {
      setErrorMessage('An unexpected error occurred: ' + error.message);
      console.error('ForgotPasswordScreen sendOtp error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async () => {
    setErrorMessage('');
    if (!otp || otp.length !== 6) {
      setErrorMessage('Please enter a valid 6-digit OTP');
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      setErrorMessage('New password must be at least 6 characters long');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setErrorMessage('Passwords do not match');
      return;
    }

    setIsLoading(true);
    try {
      const result = await verifyOtpAndResetPassword(email, otp, newPassword);
      if (result.success) {
        setErrorMessage('');
        alert('Password reset successfully! Please log in with your new password.');
        navigation.replace('Login');
      } else {
        setErrorMessage(result.message);
      }
    } catch (error) {
      setErrorMessage('An unexpected error occurred: ' + error.message);
      console.error('ForgotPasswordScreen resetPassword error:', error);
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
              Forgot Password
            </Text>

            {step === 1 ? (
              <>
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

                {errorMessage ? <Text style={[globalStyles.textError, { alignSelf: 'center' }]}>{errorMessage}</Text> : null}

                <TouchableOpacity
                  style={[globalStyles.button, isLoading && { opacity: 0.7 }, { alignSelf: 'center' }]}
                  onPress={handleSendOtp}
                  disabled={isLoading}
                >
                  <Text style={globalStyles.buttonText}>{isLoading ? 'Sending OTP...' : 'Send OTP'}</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <TextInput
                  style={[globalStyles.input, { color: globalStyles.COLORS.text, alignSelf: 'center' }]}
                  placeholder="Enter OTP"
                  placeholderTextColor={globalStyles.COLORS.placeholder}
                  keyboardType="numeric"
                  value={otp}
                  onChangeText={setOtp}
                  maxLength={6}
                  editable={!isLoading}
                />

                <View style={{ position: 'relative', width: '100%', alignSelf: 'center' }}>
                  <TextInput
                    style={[globalStyles.input, { color: globalStyles.COLORS.text }]}
                    placeholder="New Password"
                    placeholderTextColor={globalStyles.COLORS.placeholder}
                    secureTextEntry={!showNewPassword}
                    value={newPassword}
                    onChangeText={setNewPassword}
                    editable={!isLoading}
                  />
                  <TouchableOpacity
                    style={styles.eyeIcon}
                    onPress={() => setShowNewPassword(!showNewPassword)}
                  >
                    <Text>{showNewPassword ? '👁️' : '👁️‍🗨️'}</Text>
                  </TouchableOpacity>
                </View>

                <View style={{ position: 'relative', width: '100%', alignSelf: 'center' }}>
                  <TextInput
                    style={[globalStyles.input, { color: globalStyles.COLORS.text }]}
                    placeholder="Confirm New Password"
                    placeholderTextColor={globalStyles.COLORS.placeholder}
                    secureTextEntry={!showConfirmNewPassword}
                    value={confirmNewPassword}
                    onChangeText={setConfirmNewPassword}
                    editable={!isLoading}
                  />
                  <TouchableOpacity
                    style={styles.eyeIcon}
                    onPress={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
                  >
                    <Text>{showConfirmNewPassword ? '👁️' : '👁️‍🗨️'}</Text>
                  </TouchableOpacity>
                </View>

                {errorMessage ? <Text style={[globalStyles.textError, { alignSelf: 'center' }]}>{errorMessage}</Text> : null}

                <TouchableOpacity
                  style={[globalStyles.button, isLoading && { opacity: 0.7 }, { alignSelf: 'center' }]}
                  onPress={handleResetPassword}
                  disabled={isLoading}
                >
                  <Text style={globalStyles.buttonText}>{isLoading ? 'Resetting...' : 'Reset Password'}</Text>
                </TouchableOpacity>
              </>
            )}

            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={[globalStyles.text, styles.backToLoginLink]}>Back to Login</Text>
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
    transform: [{ translateY: -10 }],
  },
  backToLoginLink: {
    color: globalStyles.COLORS.primary,
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

export default ForgotPasswordScreen;