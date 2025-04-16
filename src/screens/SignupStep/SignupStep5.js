import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, ScrollView, Platform } from 'react-native';
import { verifyOtp } from '../../services/api';
import globalStyles from '../../styles/globalStyles';

const SignupStep5 = ({ navigation, route }) => {
  const { signupData } = route.params;
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const refs = Array(6).fill().map(() => React.createRef());

  const handleOtpChange = (value, index) => {
    const trimmedValue = value.trim();
    if (trimmedValue.length > 1) return; // Limit to single digit
    const newOtp = [...otp];
    newOtp[index] = trimmedValue;
    setOtp(newOtp);
    setErrorMessage(''); // Clear error on input

    if (trimmedValue && index < 5) {
      refs[index + 1].current.focus();
    } else if (!trimmedValue && index > 0) {
      refs[index - 1].current.focus();
    }
  };

  const validateOtp = async () => {
    const otpString = otp.join('');
    if (otpString.length !== 6 || isNaN(otpString)) {
      setErrorMessage('Please enter a valid 6-digit OTP');
      return false;
    }

    try {
      const result = await verifyOtp(signupData.email, otpString);
      if (!result.success) {
        setErrorMessage(result.message);
        return false;
      }
      return true;
    } catch (error) {
      console.error('SignupStep5 verifyOtp error:', error);
      setErrorMessage('Failed to verify OTP. Please try again.');
      return false;
    }
  };

  const handleVerify = async () => {
    setErrorMessage('');
    setIsLoading(true);
    try {
      if (!(await validateOtp())) {
        return;
      }
      console.log('SignupStep5: Navigating to SignupStep6 with data:', signupData);
      navigation.navigate('SignupStep6', { signupData });
    } catch (error) {
      console.error('SignupStep5 handleVerify error:', error);
      setErrorMessage('An error occurred. Please try again.');
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
        <View style={[globalStyles.container, { alignItems: 'flex-start' }]}>
          <View style={[globalStyles.logoContainer, { marginLeft: globalStyles.SPACING.medium, marginTop: globalStyles.SPACING.large }]}>
            <View style={[globalStyles.circle, globalStyles.circlePrimary]} />
            <View style={[globalStyles.circle, globalStyles.circleSecondary]} />
          </View>
          <Text style={[globalStyles.textXLargeBlack, { marginBottom: globalStyles.SPACING.large, alignSelf: 'center' }]}>
            Email Verification
          </Text>
          <View style={globalStyles.dotContainer}>
            {[...Array(6)].map((_, index) => (
              <View
                key={index}
                style={[
                  globalStyles.dot,
                  index === 4 ? globalStyles.dotActive : globalStyles.dotInactive,
                ]}
              />
            ))}
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: globalStyles.input.width }}>
            {otp.map((digit, index) => (
              <TextInput
                key={index}
                ref={refs[index]}
                style={[styles.otpInput, { borderColor: errorMessage ? globalStyles.COLORS.error : globalStyles.COLORS.gray }]}
                keyboardType="numeric"
                maxLength={1}
                value={digit}
                onChangeText={(value) => handleOtpChange(value, index)}
                editable={!isLoading}
              />
            ))}
          </View>
          {errorMessage ? <Text style={globalStyles.textError}>{errorMessage}</Text> : null}
          <TouchableOpacity
            style={[globalStyles.button, isLoading && { opacity: 0.7 }, { alignSelf: 'center' }]}
            onPress={handleVerify}
            disabled={isLoading}
          >
            <Text style={globalStyles.buttonText}>
              {isLoading ? 'Verifying...' : 'Verify OTP'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  otpInput: {
    width: 40,
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    textAlign: 'center',
    fontSize: globalStyles.FONT_SIZES.medium,
    marginHorizontal: 5,
    color: globalStyles.COLORS.text,
  },
});

export default SignupStep5;