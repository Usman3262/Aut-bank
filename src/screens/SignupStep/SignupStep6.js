import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { registerUser } from '../../services/api';
import globalStyles from '../../styles/globalStyles';

const SignupStep6 = ({ navigation, route }) => {
  const { signupData } = route.params;
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const submitData = async () => {
      try {
        const result = await registerUser(signupData);
        if (result.success) {
          setIsLoading(false); // Stop loading when successful
        } else {
          setErrorMessage(result.message);
          setIsLoading(false);
        }
      } catch (error) {
        setErrorMessage('An error occurred while registering. Please try again.');
        setIsLoading(false);
        console.error('SignupStep6 error:', error);
      }
    };

    submitData();
  }, [signupData]);

  return (
    <View style={[globalStyles.container, { alignItems: 'flex-start' }]}>
      <View style={[globalStyles.logoContainer, { marginLeft: globalStyles.SPACING.medium, marginTop: globalStyles.SPACING.large }]}>
        <View style={[globalStyles.circle, globalStyles.circlePrimary]} />
        <View style={[globalStyles.circle, globalStyles.circleSecondary]} />
      </View>
      <Text style={[globalStyles.textXLargeBlack, { marginBottom: globalStyles.SPACING.large, alignSelf: 'center' }]}>
        Account Created
      </Text>
      <View style={globalStyles.dotContainer}>
        {[...Array(6)].map((_, index) => (
          <View
            key={index}
            style={[
              globalStyles.dot,
              index === 5 ? globalStyles.dotActive : globalStyles.dotInactive,
            ]}
          />
        ))}
      </View>
      {isLoading ? (
        <Text style={[globalStyles.text, { textAlign: 'center', marginVertical: globalStyles.SPACING.large }]}>
          Your account is being created. Please wait...
        </Text>
      ) : errorMessage ? (
        <Text style={[globalStyles.textError, { textAlign: 'center', marginVertical: globalStyles.SPACING.large }]}>
          {errorMessage}
        </Text>
      ) : (
        <View style={styles.messageContainer}>
          <Text style={styles.successMessage}>
            Waiting for admin approval, when it is approved we will notify you via email address.
          </Text>
        </View>
      )}
      {!isLoading && (
        <TouchableOpacity
          style={[globalStyles.button, styles.loginButton, { alignSelf: 'center' }]}
          onPress={() => navigation.replace('Login')}
        >
          <Text style={globalStyles.buttonText}>Go to Login</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  messageContainer: {
    backgroundColor: globalStyles.COLORS.primary, // Use primary color as background
    borderRadius: 10,
    padding: 15,
    marginVertical: globalStyles.SPACING.large,
    marginHorizontal: 20,
    alignItems: 'center',
  },
  successMessage: {
    fontSize: 18,
    fontWeight: 'bold',
    color: globalStyles.COLORS.white, // White text for contrast
    textAlign: 'center',
    lineHeight: 24, // Improve readability
  },
  loginButton: {
    backgroundColor: globalStyles.COLORS.secondary, // Use secondary color for the button
    width: '60%', // Make the button slightly narrower for better aesthetics
  },
});

export default SignupStep6;