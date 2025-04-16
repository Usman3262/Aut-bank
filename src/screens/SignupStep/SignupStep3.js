import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, ScrollView, Platform } from 'react-native';
import globalStyles from '../../styles/globalStyles';

const SignupStep3 = ({ navigation, route }) => {
  const { signupData } = route.params;
  const [streetAddress, setStreetAddress] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const validateInputs = () => {
    const trimmedStreetAddress = streetAddress.trim();
    const trimmedCity = city.trim();
    const trimmedCountry = country.trim();
    const trimmedPostalCode = postalCode.trim();

    if (!trimmedStreetAddress || !trimmedCity || !trimmedCountry || !trimmedPostalCode) {
      setErrorMessage('All fields are required');
      return false;
    }

    const postalCodeRegex = /^[a-zA-Z0-9]{4,10}$/;
    if (!postalCodeRegex.test(trimmedPostalCode)) {
      setErrorMessage('Postal code must be 4-10 alphanumeric characters');
      return false;
    }

    return true;
  };

  const handleNext = () => {
    setErrorMessage('');
    setIsLoading(true);
    try {
      if (!validateInputs()) {
        setIsLoading(false);
        return;
      }
      const trimmedData = {
        streetAddress: streetAddress.trim(),
        city: city.trim(),
        country: country.trim(),
        postalCode: postalCode.trim(),
      };
      console.log('SignupStep3: Navigating to SignupStep4 with data:', {
        ...signupData,
        ...trimmedData,
      });
      navigation.navigate('SignupStep4', {
        signupData: {
          ...signupData,
          ...trimmedData,
        },
      });
    } catch (error) {
      console.error('SignupStep3 handleNext error:', error);
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
            editable={!isLoading}
          />
          <TextInput
            style={globalStyles.input}
            placeholder="City"
            placeholderTextColor={globalStyles.COLORS.placeholder}
            value={city}
            onChangeText={setCity}
            autoCapitalize="words"
            editable={!isLoading}
          />
          <TextInput
            style={globalStyles.input}
            placeholder="Country"
            placeholderTextColor={globalStyles.COLORS.placeholder}
            value={country}
            onChangeText={setCountry}
            autoCapitalize="words"
            editable={!isLoading}
          />
          <TextInput
            style={globalStyles.input}
            placeholder="Postal Code"
            placeholderTextColor={globalStyles.COLORS.placeholder}
            keyboardType="default"
            value={postalCode}
            onChangeText={setPostalCode}
            editable={!isLoading}
          />
          {errorMessage ? <Text style={globalStyles.textError}>{errorMessage}</Text> : null}
          <TouchableOpacity
            style={[globalStyles.button, isLoading && { opacity: 0.7 }, { alignSelf: 'center' }]}
            onPress={handleNext}
            disabled={isLoading}
          >
            <Text style={globalStyles.buttonText}>{isLoading ? 'Processing...' : 'Next'}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default SignupStep3;