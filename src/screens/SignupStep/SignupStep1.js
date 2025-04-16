import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, ScrollView, Platform } from 'react-native';
import { checkUsernameUnique } from '../../services/api';
import globalStyles from '../../styles/globalStyles';

const SignupStep1 = ({ navigation }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const validateInputs = async () => {
    const trimmedFirstName = firstName.trim();
    const trimmedLastName = lastName.trim();
    const trimmedUsername = username.trim();

    if (!trimmedFirstName || !trimmedLastName || !trimmedUsername) {
      setErrorMessage('All fields are required');
      return false;
    }

    if (trimmedUsername.length < 3) {
      setErrorMessage('Username must be at least 3 characters');
      return false;
    }

    try {
      const result = await checkUsernameUnique(trimmedUsername);
      if (!result.success) {
        setErrorMessage(result.message);
        return false;
      }
      return true;
    } catch (error) {
      console.error('SignupStep1 checkUsernameUnique error:', error);
      setErrorMessage('Failed to validate username. Please try again.');
      return false;
    }
  };

  const handleNext = async () => {
    setErrorMessage('');
    setIsLoading(true);
    try {
      if (!(await validateInputs())) {
        return;
      }
      console.log('SignupStep1: Navigating to SignupStep2 with data:', {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        username: username.trim(),
      });
      navigation.navigate('SignupStep2', {
        signupData: {
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          username: username.trim(),
        },
      });
    } catch (error) {
      console.error('SignupStep1 handleNext error:', error);
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
            Sign Up
          </Text>
          <View style={globalStyles.dotContainer}>
            {[...Array(6)].map((_, index) => (
              <View
                key={index}
                style={[
                  globalStyles.dot,
                  index === 0 ? globalStyles.dotActive : globalStyles.dotInactive,
                ]}
              />
            ))}
          </View>
          <TextInput
            style={globalStyles.input}
            placeholder="First Name"
            placeholderTextColor={globalStyles.COLORS.placeholder}
            value={firstName}
            onChangeText={setFirstName}
            autoCapitalize="words"
            editable={!isLoading}
          />
          <TextInput
            style={globalStyles.input}
            placeholder="Last Name"
            placeholderTextColor={globalStyles.COLORS.placeholder}
            value={lastName}
            onChangeText={setLastName}
            autoCapitalize="words"
            editable={!isLoading}
          />
          <TextInput
            style={globalStyles.input}
            placeholder="Username"
            placeholderTextColor={globalStyles.COLORS.placeholder}
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            editable={!isLoading}
          />
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

export default SignupStep1;