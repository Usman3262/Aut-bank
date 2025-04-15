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
    if (!firstName || !lastName || !username) {
      setErrorMessage('All fields are required');
      return false;
    }

    const result = await checkUsernameUnique(username);
    if (!result.success) {
      setErrorMessage(result.message);
      return false;
    }

    return true;
  };

  const handleNext = async () => {
    setErrorMessage('');
    setIsLoading(true);
    try {
      if (!(await validateInputs())) {
        setIsLoading(false);
        return;
      }
      navigation.navigate('SignupStep2', {
        signupData: { firstName, lastName, username },
      });
    } catch (error) {
      setErrorMessage('An error occurred. Please try again.');
      console.error('SignupStep1 error:', error);
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