import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { launchImageLibrary } from 'react-native-image-picker';
import { checkUniqueness } from '../../services/userService';
import globalStyles from '../../styles/globalStyles';

const SignupStep4 = ({ navigation, route }) => {
  const { signupData } = route.params;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const [accountType, setAccountType] = useState(null); // Savings or Current
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const selectImage = () => {
    launchImageLibrary(
      { mediaType: 'photo', quality: 1.0 },
      (response) => {
        if (response.didCancel) {
          console.log('SignupStep4: Image picker cancelled');
        } else if (response.errorCode) {
          console.error('SignupStep4 image picker error:', response.errorMessage);
          setErrorMessage('Failed to select image. Please try again.');
        } else if (response.assets && response.assets[0].uri) {
          setProfileImage(response.assets[0].uri);
          setErrorMessage('');
        }
      }
    );
  };

  const validateInputs = async () => {
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();
    const trimmedConfirmPassword = confirmPassword.trim();

    if (!trimmedEmail || !trimmedPassword || !trimmedConfirmPassword) {
      setErrorMessage('Email, password, and confirm password are required');
      return false;
    }

    if (!profileImage) {
      setErrorMessage('Please select a profile picture');
      return false;
    }

    if (!accountType) {
      setErrorMessage('Please select an account type');
      return false;
    }

    if (!['Savings', 'Current'].includes(accountType)) {
      setErrorMessage('Account type must be Savings or Current');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setErrorMessage('Please enter a valid email address');
      return false;
    }

    try {
      const result = await checkUniqueness('Email', trimmedEmail);
      if (!result.success || !result.data?.is_unique) {
        setErrorMessage('Email is already taken');
        return false;
      }
    } catch (error) {
      console.error('SignupStep4 checkEmailUniqueAndSendOtp error:', error);
      setErrorMessage('Failed to validate email. Please try again.');
      return false;
    }

    const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(trimmedPassword)) {
      setErrorMessage('Password must be at least 8 characters, including an uppercase letter and a number');
      return false;
    }

    if (trimmedPassword !== trimmedConfirmPassword) {
      setErrorMessage('Passwords do not match');
      return false;
    }

    return true;
  };

  const handleNext = async () => {
    setErrorMessage('');
    setIsLoading(true);
    try {
      if (!(await validateInputs())) {
        return;
      }
      // const trimmedData = { email: email.trim(), password: password.trim(), profileImage, AccountType: accountType }; used when image implement
      const trimmedData = { email: email.trim(), password: password.trim(),  AccountType: accountType };
      console.log('SignupStep4: Navigating to SignupStep5 with data:', {
        ...signupData,
        ...trimmedData,
      });
      navigation.navigate('SignupStep5', {
        signupData: {
          ...signupData,
          ...trimmedData,
        },
      });
    } catch (error) {
      console.error('SignupStep4 handleNext error:', error);
      setErrorMessage('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const Checkbox = ({ label, value, selected, onSelect }) => (
    <TouchableOpacity
      style={styles.checkboxContainer}
      onPress={() => onSelect(value)}
      disabled={isLoading}
    >
      <Icon
        name={selected ? 'check-box' : 'check-box-outline-blank'}
        size={24}
        color={selected ? globalStyles.COLORS.primary : globalStyles.COLORS.placeholder}
      />
      <Text style={[styles.checkboxLabel, { color: globalStyles.COLORS.text }]}>{label}</Text>
    </TouchableOpacity>
  );

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
            Sign Up
          </Text>
          <View style={globalStyles.dotContainer}>
            {[...Array(6)].map((_, index) => (
              <View
                key={index}
                style={[
                  globalStyles.dot,
                  index === 3 ? globalStyles.dotActive : globalStyles.dotInactive,
                ]}
              />
            ))}
          </View>
          <TouchableOpacity
            style={[globalStyles.button, styles.imageButton, isLoading && { opacity: 0.7 }]}
            onPress={selectImage}
            disabled={isLoading}
          >
            {profileImage ? (
              <Image
                source={{ uri: profileImage }}
                style={styles.profileImage}
              />
            ) : (
              <Text style={globalStyles.buttonText}>Upload Profile Picture</Text>
            )}
          </TouchableOpacity>
          <TextInput
            style={[globalStyles.input, { color: globalStyles.COLORS.text }]}
            placeholder="Email Address"
            placeholderTextColor={globalStyles.COLORS.placeholder}
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            editable={!isLoading}
          />
          <View style={{ position: 'relative', width: '100%' }}>
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
              disabled={isLoading}
            >
              <Icon
                name={showPassword ? 'visibility' : 'visibility-off'}
                size={20}
                color={globalStyles.COLORS.placeholder}
              />
            </TouchableOpacity>
          </View>
          <View style={{ position: 'relative', width: '100%' }}>
            <TextInput
              style={[globalStyles.input, { color: globalStyles.COLORS.text }]}
              placeholder="Confirm Password"
              placeholderTextColor={globalStyles.COLORS.placeholder}
              secureTextEntry={!showConfirmPassword}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              editable={!isLoading}
            />
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              disabled={isLoading}
            >
              <Icon
                name={showConfirmPassword ? 'visibility' : 'visibility-off'}
                size={20}
                color={globalStyles.COLORS.placeholder}
              />
            </TouchableOpacity>
          </View>
          <View style={styles.accountTypeContainer}>
            <Text style={[globalStyles.text, { marginBottom: globalStyles.SPACING.small }]}>
              Account Type
            </Text>
            <View style={styles.checkboxRow}>
              <Checkbox
                label="Savings"
                value="Savings"
                selected={accountType === 'Savings'}
                onSelect={setAccountType}
              />
              <Checkbox
                label="Current"
                value="Current"
                selected={accountType === 'Current'}
                onSelect={setAccountType}
              />
            </View>
          </View>
          {errorMessage ? <Text style={globalStyles.textError}>{errorMessage}</Text> : null}
          <TouchableOpacity
            style={[globalStyles.button, isLoading && { opacity: 0.7 }, { alignSelf: 'center' }]}
            onPress={handleNext}
            disabled={isLoading}
          >
            <Text style={globalStyles.buttonText}>{isLoading ? 'Checking...' : 'Next'}</Text>
          </TouchableOpacity>
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
  imageButton: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: globalStyles.SPACING.medium,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  accountTypeContainer: {
    width: '100%',
    marginTop: globalStyles.SPACING.medium,
    marginBottom: globalStyles.SPACING.medium,
  },
  checkboxRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: globalStyles.SPACING.medium,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkboxLabel: {
    fontSize: globalStyles.FONT_SIZES.medium,
    marginLeft: globalStyles.SPACING.small,
  },
});

export default SignupStep4;