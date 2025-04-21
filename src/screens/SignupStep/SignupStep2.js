import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, Modal,
  StyleSheet, KeyboardAvoidingView, ScrollView, Platform
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import { checkUniqueness } from '../../services/userService';
import globalStyles from '../../styles/globalStyles';

const SignupStep2 = ({ navigation, route }) => {
  const { signupData } = route.params;
  const [cnic, setCnic] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState(new Date(2000, 0, 1));
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const formatCnic = (input) => {
    const digits = input.replace(/\D/g, '');
    if (digits.length <= 5) return digits;
    if (digits.length <= 12) return `${digits.slice(0, 5)}-${digits.slice(5)}`;
    return `${digits.slice(0, 5)}-${digits.slice(5, 12)}-${digits.slice(12, 13)}`;
  };

  const validateInputs = async () => {
    const trimmedPhoneNumber = phoneNumber.trim();
    const formattedCnic = formatCnic(cnic);

    if (!formattedCnic || !trimmedPhoneNumber) {
      setErrorMessage('All fields are required');
      return false;
    }

    if (!/^\d{5}-\d{7}-\d{1}$/.test(formattedCnic)) {
      setErrorMessage('Please enter CNIC in format 12345-1234567-1');
      return false;
    }

    const today = new Date();
    const age = today.getFullYear() - dateOfBirth.getFullYear() -
      (today.getMonth() < dateOfBirth.getMonth() ||
      (today.getMonth() === dateOfBirth.getMonth() && today.getDate() < dateOfBirth.getDate()) ? 1 : 0);
    if (age < 18) {
      setErrorMessage('You must be at least 18 years old to sign up');
      return false;
    }

    const phoneRegex = /^\+?\d{10,15}$/;
    if (!phoneRegex.test(trimmedPhoneNumber)) {
      setErrorMessage('Please enter a valid phone number (10-15 digits, optional + prefix)');
      return false;
    }

    try {
      const result = await checkUniqueness('CNIC', formattedCnic);
      if (!result.success || !result.data?.is_unique) {
        setErrorMessage('CNIC is already taken.');
        return false;
      }
      return true;
    } catch (error) {
      console.error('SignupStep2 checkCnicUnique error:', error);
      setErrorMessage('Failed to validate CNIC. Please try again.');
      return false;
    }
  };

  const handleNext = async () => {
    setErrorMessage('');
    setIsLoading(true);
    try {
      const isValid = await validateInputs();
      if (!isValid) return;

      const formattedCnic = formatCnic(cnic);
      const trimmedPhoneNumber = phoneNumber.trim();

      console.log('SignupStep2: Navigating to SignupStep3 with data:', {
        ...signupData,
        cnic: formattedCnic,
        dateOfBirth: format(dateOfBirth, 'yyyy-MM-dd'),
        phoneNumber: trimmedPhoneNumber,
      });

      navigation.navigate('SignupStep3', {
        signupData: {
          ...signupData,
          cnic: formattedCnic,
          dateOfBirth: format(dateOfBirth, 'yyyy-MM-dd'),
          phoneNumber: trimmedPhoneNumber,
        },
      });
    } catch (error) {
      console.error('SignupStep2 handleNext error:', error);
      setErrorMessage('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const onDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || dateOfBirth;
    setShowDatePicker(Platform.OS === 'ios'); // Auto-close on Android
    setDateOfBirth(currentDate);
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
                  index === 1 ? globalStyles.dotActive : globalStyles.dotInactive,
                ]}
              />
            ))}
          </View>

          <TextInput
            style={globalStyles.input}
            placeholder="CNIC (e.g., 12345-6789012-3)"
            placeholderTextColor={globalStyles.COLORS.placeholder}
            keyboardType="numeric"
            value={cnic}
            onChangeText={(text) => setCnic(formatCnic(text))}
            maxLength={15}
            editable={!isLoading}
          />

          <TouchableOpacity
            style={globalStyles.input}
            onPress={() => !isLoading && setShowDatePicker(true)}
            disabled={isLoading}
          >
            <Text style={{ color: globalStyles.COLORS.text }}>
              {format(dateOfBirth, 'yyyy-MM-dd')}
            </Text>
          </TouchableOpacity>

          {showDatePicker && (
            <Modal transparent animationType="fade">
              <View style={styles.datePickerModal}>
                <View style={styles.datePickerContainer}>
                  <DateTimePicker
                    value={dateOfBirth}
                    mode="date"
                    display="default"
                    onChange={onDateChange}
                    maximumDate={new Date()}
                  />
                  {Platform.OS === 'ios' && (
                    <TouchableOpacity
                      style={styles.datePickerButton}
                      onPress={() => setShowDatePicker(false)}
                    >
                      <Text style={styles.datePickerButtonText}>Done</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </Modal>
          )}

          <TextInput
            style={globalStyles.input}
            placeholder="Phone Number (e.g., +1234567890)"
            placeholderTextColor={globalStyles.COLORS.placeholder}
            keyboardType="phone-pad"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
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

const styles = StyleSheet.create({
  datePickerModal: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  datePickerContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  datePickerButton: {
    marginTop: 10,
    backgroundColor: globalStyles.COLORS.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  datePickerButtonText: {
    color: globalStyles.COLORS.white,
    fontSize: 16,
  },
});

export default SignupStep2;
