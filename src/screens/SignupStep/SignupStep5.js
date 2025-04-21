import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
} from 'react-native';
import { sendVerification } from '../../services/userService';
import generateOtpEmail from '../../Assets/mailbody';
import globalStyles from '../../styles/globalStyles';
import { secret_code } from '@env';

const SignupStep5 = ({ navigation, route }) => {
  const { signupData } = route.params;
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [timer, setTimer] = useState(0); // Timer state in seconds

  const refs = useRef(Array(6).fill().map(() => React.createRef()));

  useEffect(() => {
    if (!otpSent) {
      sendOtp();
    }
  }, [otpSent]);

  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const generateOtp = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  const sendOtp = async () => {
    const otpToSend = generateOtp();
    setGeneratedOtp(otpToSend);
    setErrorMessage('');
    setResendLoading(true);
    setTimer(30); // Start 30-second timer

    const date = new Date();
    const reason = "Account verification";
    const emailContent = generateOtpEmail(date, reason, otpToSend);

    const payload = {
      email: signupData.email,
      content: emailContent,
      type: 'otp',
      secret_code,
    };

    try {
      const result = await sendVerification(payload);
      console.log('OTP sent:', otpToSend);
      if (!result.success) {
        setErrorMessage(result.message);
      } else {
        setOtpSent(true);
      }
    } catch (error) {
      console.error('Error sending OTP:', error);
      setErrorMessage('Failed to send OTP. Please try again.');
    } finally {
      setResendLoading(false);
    }
  };

  const handleOtpChange = (value, index) => {
    const trimmedValue = value.trim();
    if (trimmedValue.length > 1) return;

    const newOtp = [...otp];
    newOtp[index] = trimmedValue;
    setOtp(newOtp);
    setErrorMessage('');

    if (trimmedValue && index < 5) {
      refs.current[index + 1].current.focus();
    } else if( index > 0) {
      refs.current[index - 1].current.focus();
    }
  };

  const validateOtp = () => {
    const otpString = otp.join('');
    if (otpString.length !== 6 || isNaN(otpString)) {
      setErrorMessage('Please enter a valid 6-digit OTP');
      return false;
    }

    if (otpString !== generatedOtp) {
      setErrorMessage('OTP does not match');
      return false;
    }

    return true;
  };

  const handleVerify = async () => {
    setIsLoading(true);
    try {
      if (!validateOtp()) return;
      navigation.navigate('SignupStep6', { signupData });
    } catch (error) {
      console.error('Verification error:', error);
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
                ref={refs.current[index]}
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

          <TouchableOpacity
            onPress={sendOtp}
            disabled={timer > 0 || resendLoading}
            style={{ marginTop: globalStyles.SPACING.medium, alignSelf: 'center' }}
          >
            <Text style={[globalStyles.textLink, timer > 0 && { opacity: 0.5 }]}>
              {resendLoading ? 'Resending...' : timer > 0 ? `Resend OTP in ${timer}s` : 'Resend OTP'}
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