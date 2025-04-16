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
        const defaultImage = require('../Assets/images/users/user1.jpg');
        const userData = {
          ...signupData,
          userId: Date.now().toString(),
          balance: 0,
          incomingTransactions: [],
          outgoingTransactions: [],
          profileImage: defaultImage,
        };
        console.log('SignupStep6: Registering user with data:', {
          ...userData,
          profileImage: '[Image require]', // Avoid logging require object
        });
        const result = await registerUser(userData);
        if (result.success) {
          console.log('SignupStep6: User registered successfully');
          setIsLoading(false);
        } else {
          setErrorMessage(result.message);
          setIsLoading(false);
        }
      } catch (error) {
        console.error('SignupStep6 submitData error:', error);
        setErrorMessage('An error occurred while registering. Please try again.');
        setIsLoading(false);
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
            Waiting for admin approval, we will notify you via email once approved.
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
    backgroundColor: globalStyles.COLORS.primary,
    borderRadius: 10,
    padding: 15,
    marginVertical: globalStyles.SPACING.large,
    marginHorizontal: 20,
    alignItems: 'center',
  },
  successMessage: {
    fontSize: 18,
    fontWeight: 'bold',
    color: globalStyles.COLORS.white,
    textAlign: 'center',
    lineHeight: 24,
  },
  loginButton: {
    backgroundColor: globalStyles.COLORS.secondary,
    width: '60%',
  },
});

export default SignupStep6;