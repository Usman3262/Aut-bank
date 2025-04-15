import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, ScrollView, Platform } from 'react-native';
import { verifyOtp } from '../../services/api';
import globalStyles from '../../styles/globalStyles';

const SignupStep5 = ({ navigation, route }) => {
  const { signupData } = route.params;
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleOtpChange = (value, index) => {
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) {
      refs[index + 1].focus();
    }
  };

  const refs = Array(6).fill().map(() => React.createRef());

  const validateOtp = async () => {
    const otpString = otp.join('');
    if (otpString.length !== 6 || isNaN(otpString)) {
      setErrorMessage('Please enter a valid 6-digit OTP');
      return false;
    }

    const result = await verifyOtp(signupData.email, otpString);
    if (!result.success) {
      setErrorMessage(result.message);
      return false;
    }

    return true;
  };

  const handleVerify = async () => {
    setErrorMessage('');
    setIsLoading(true);
    try {
      if (!(await validateOtp())) {
        setIsLoading(false);
        return;
      }
      navigation.navigate('SignupStep6', { signupData });
    } catch (error) {
      setErrorMessage('An error occurred. Please try again.');
      console.error('SignupStep5 error:', error);
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
                ref={(ref) => (refs[index] = ref)}
                style={styles.otpInput}
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
    borderColor: globalStyles.COLORS.gray,
    borderRadius: 8,
    textAlign: 'center',
    fontSize: globalStyles.FONT_SIZES.medium,
    marginHorizontal: 5,
  },
});

export default SignupStep5;