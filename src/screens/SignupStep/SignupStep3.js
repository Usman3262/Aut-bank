import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, ScrollView, Platform } from 'react-native';
import globalStyles from '../../styles/globalStyles';

const SignupStep3 = ({ navigation, route }) => {
  const { signupData } = route.params;
  const [streetAddress, setStreetAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [country, setCountry] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const validateInputs = () => {
    if (!streetAddress || !city || !state || !country || !postalCode) {
      setErrorMessage('All fields are required');
      return false;
    }
    return true;
  };

  const handleNext = () => {
    setErrorMessage('');
    if (!validateInputs()) return;
    navigation.navigate('SignupStep4', {
      signupData: {
        ...signupData,
        streetAddress,
        city,
        state,
        country,
        postalCode,
      },
    });
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} // Adjust behavior based on platform
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20} // Fine-tune offset if needed
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
                  index === 2 ? globalStyles.dotActive : globalStyles.dotInactive,
                ]}
              />
            ))}
          </View>
          <TextInput
            style={globalStyles.input}
            placeholder="Street Address"
            placeholderTextColor={globalStyles.COLORS.placeholder}
            value={streetAddress}
            onChangeText={setStreetAddress}
            autoCapitalize="words"
          />
          <TextInput
            style={globalStyles.input}
            placeholder="City"
            placeholderTextColor={globalStyles.COLORS.placeholder}
            value={city}
            onChangeText={setCity}
            autoCapitalize="words"
          />
          <TextInput
            style={globalStyles.input}
            placeholder="State"
            placeholderTextColor={globalStyles.COLORS.placeholder}
            value={state}
            onChangeText={setState}
            autoCapitalize="words"
          />
          <TextInput
            style={globalStyles.input}
            placeholder="Country"
            placeholderTextColor={globalStyles.COLORS.placeholder}
            value={country}
            onChangeText={setCountry}
            autoCapitalize="words"
          />
          <TextInput
            style={globalStyles.input}
            placeholder="Postal Code"
            placeholderTextColor={globalStyles.COLORS.placeholder}
            keyboardType="numeric"
            value={postalCode}
            onChangeText={setPostalCode}
          />
          {errorMessage ? <Text style={globalStyles.textError}>{errorMessage}</Text> : null}
          <TouchableOpacity
            style={[globalStyles.button, { alignSelf: 'center' }]}
            onPress={handleNext}
          >
            <Text style={globalStyles.buttonText}>Next</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default SignupStep3;