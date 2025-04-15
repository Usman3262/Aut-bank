import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, StyleSheet, KeyboardAvoidingView, ScrollView, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import { checkCnicUnique } from '../../services/api';
import globalStyles from '../../styles/globalStyles';

const SignupStep2 = ({ navigation, route }) => {
  const { signupData } = route.params;
  const [cnic, setCnic] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState(new Date(2000, 0, 1));
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [mobileNumber, setMobileNumber] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const validateInputs = async () => {
    if (!cnic || !mobileNumber) {
      setErrorMessage('All fields are required');
      return false;
    }
    if (cnic.length !== 13 || isNaN(cnic)) {
      setErrorMessage('Please enter a valid 13-digit CNIC number');
      return false;
    }

    const result = await checkCnicUnique(cnic);
    if (!result.success) {
      setErrorMessage(result.message);
      return false;
    }

    const today = new Date();
    const age = today.getFullYear() - dateOfBirth.getFullYear();
    const monthDiff = today.getMonth() - dateOfBirth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dateOfBirth.getDate())) {
      age--;
    }
    if (age < 18) {
      setErrorMessage('You must be at least 18 years old to sign up');
      return false;
    }
    const mobileRegex = /^\d{10,15}$/;
    if (!mobileRegex.test(mobileNumber)) {
      setErrorMessage('Please enter a valid mobile number (10-15 digits)');
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
      navigation.navigate('SignupStep3', {
        signupData: {
          ...signupData,
          cnic,
          dateOfBirth: format(dateOfBirth, 'yyyy-MM-dd'),
          mobileNumber,
        },
      });
    } catch (error) {
      setErrorMessage('An error occurred. Please try again.');
      console.error('SignupStep2 error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || dateOfBirth;
    setShowDatePicker(false);
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
            placeholder="CNIC (e.g., 1234567890123)"
            placeholderTextColor={globalStyles.COLORS.placeholder}
            keyboardType="numeric"
            value={cnic}
            onChangeText={setCnic}
            maxLength={13}
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
                  <TouchableOpacity
                    style={styles.datePickerButton}
                    onPress={() => setShowDatePicker(false)}
                  >
                    <Text style={styles.datePickerButtonText}>Done</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>
          )}
          <TextInput
            style={globalStyles.input}
            placeholder="Mobile Number"
            placeholderTextColor={globalStyles.COLORS.placeholder}
            keyboardType="phone-pad"
            value={mobileNumber}
            onChangeText={setMobileNumber}
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