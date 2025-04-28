import React, { useContext, useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useQuery, useMutation } from 'react-query';
import { AuthContext } from '../context/AuthContext';
import { getUserDetails, updateUserProfile, updateUserPassword } from '../services/userService';
import globalStyles from '../styles/globalStyles';
import { homeScreenTheme } from '../styles/homeScreenTheme';

const SettingsScreen = ({ navigation }) => {
  const { user, setUser } = useContext(AuthContext);
  const scrollViewRef = useRef(null); // Ref for ScrollView

  // State for form data and UI
  const [formData, setFormData] = useState({
    Username: '',
    FirstName: '',
    LastName: '',
    StreetAddress: '',
    City: '',
    State: '',
    Country: '',
    PostalCode: '',
    PhoneNumber: '',
    Email: '',
    CurrentPassword: '',
    NewPassword: '',
  });
  const [originalData, setOriginalData] = useState(null);
  const [selectedField, setSelectedField] = useState(null);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [lastTap, setLastTap] = useState(0); // For debouncing

  // Fetch user profile
  const { data: userProfile, isLoading: profileLoading, error: profileError } = useQuery(
    'userProfile',
    getUserDetails,
    { enabled: !!user?.access_token }
  );

  // Log changes to selectedField
  useEffect(() => {
    console.log('SettingsScreen: selectedField changed to:', selectedField);
    // Scroll to the input field when selectedField changes
    if (selectedField && scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  }, [selectedField]);

  // Populate form with fetched data
  useEffect(() => {
    console.log('SettingsScreen: userProfile from useQuery:', userProfile);
    let userData = null;
    if (userProfile) {
      if (userProfile.success && userProfile.data) {
        userData = userProfile.data;
        console.log('SettingsScreen: Using userProfile.data as userData');
      } else {
        userData = userProfile;
        console.log('SettingsScreen: Using userProfile directly as userData');
      }
    }

    if (userData) {
      console.log('SettingsScreen: Fetched user profile:', userData);
      const fetchedData = {
        Username: userData.Username || '',
        FirstName: userData.FirstName || '',
        LastName: userData.LastName || '',
        StreetAddress: userData.StreetAddress || '',
        City: userData.City || '',
        State: userData.State != null ? userData.State : '',
        Country: userData.Country || '',
        PostalCode: userData.PostalCode || '',
        PhoneNumber: userData.PhoneNumber || '',
        Email: userData.Email || '',
        CurrentPassword: '',
        NewPassword: '',
      };
      setFormData(fetchedData);
      setOriginalData(fetchedData);
      console.log('SettingsScreen: Form data populated:', fetchedData);
    } else {
      console.log('SettingsScreen: No user profile data available');
    }
  }, [userProfile]);

  // Field options for the user to select
  const fieldOptions = [
    { label: 'Change Username', key: 'Username' },
    { label: 'Change First Name', key: 'FirstName' },
    { label: 'Change Last Name', key: 'LastName' },
    { label: 'Change Street Address', key: 'StreetAddress' },
    { label: 'Change City', key: 'City' },
    { label: 'Change State', key: 'State' },
    { label: 'Change Country', key: 'Country' },
    { label: 'Change Postal Code', key: 'PostalCode' },
    { label: 'Change Phone Number', key: 'PhoneNumber' },
    { label: 'Change Email', key: 'Email' },
    { label: 'Change Password', key: 'Password' },
  ];

  // Validation function for the selected field
  const validateForm = () => {
    if (!selectedField) return true;

    if (selectedField === 'Password') {
      const { CurrentPassword, NewPassword } = formData;
      if (!CurrentPassword) {
        setError('Current Password is required');
        console.error('SettingsScreen: Current Password is required');
        return false;
      }
      if (!NewPassword) {
        setError('New Password is required');
        console.error('SettingsScreen: New Password is required');
        return false;
      }
      if (NewPassword.length < 8) {
        setError('New Password must be at least 8 characters long');
        console.error('SettingsScreen: New Password too short:', NewPassword.length);
        return false;
      }
    } else {
      const fieldValue = formData[selectedField] || '';
      if (selectedField === 'Username') {
        if (!fieldValue) {
          setError('Username is required');
          console.error('SettingsScreen: Username is required');
          return false;
        }
        if (fieldValue.length < 3) {
          setError('Username must be at least 3 characters');
          console.error('SettingsScreen: Username too short:', fieldValue.length);
          return false;
        }
      }
      if (selectedField === 'Email') {
        if (!fieldValue) {
          setError('Email is required');
          console.error('SettingsScreen: Email is required');
          return false;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fieldValue)) {
          setError('Please enter a valid email address');
          console.error('SettingsScreen: Invalid email format:', fieldValue);
          return false;
        }
      }
    }
    return true;
  };

  // Prepare data to send (only the changed field)
  const getUpdateData = () => {
    if (!selectedField) return {};
    if (selectedField === 'Password') {
      const { CurrentPassword, NewPassword } = formData;
      return { CurrentPassword, NewPassword };
    }
    const fieldValue = formData[selectedField] || '';
    return { [selectedField]: fieldValue };
  };

  // Mutation for updating user profile (non-password fields)
  const updateMutation = useMutation(updateUserProfile, {
    onSuccess: (data) => {
      setSuccessMessage(data.message || 'Profile updated successfully!');
      setError(null);
      const updatedFields = getUpdateData();
      setUser({ ...user, ...updatedFields });
      setOriginalData((prev) => ({ ...prev, ...updatedFields }));
      setSelectedField(null);
    },
    onError: (error) => {
      if (error.detail && Array.isArray(error.detail)) {
        const errorMessages = error.detail.map((err) => err.msg).join(', ');
        setError(errorMessages);
      } else {
        setError(error.message || 'An error occurred while updating your profile.');
      }
      console.error('SettingsScreen: Update error:', error);
      setSuccessMessage(null);
    },
  });

  // Mutation for updating user password
  const passwordUpdateMutation = useMutation(updateUserPassword, {
    onSuccess: (data) => {
      setSuccessMessage(data.message || 'Password updated successfully!');
      setError(null);
      setFormData((prev) => ({ ...prev, CurrentPassword: '', NewPassword: '' }));
      setSelectedField(null);
    },
    onError: (error) => {
      if (error.detail && Array.isArray(error.detail)) {
        const errorMessages = error.detail.map((err) => err.msg).join(', ');
        setError(errorMessages);
      } else {
        setError(error.message || 'An error occurred while updating your password.');
      }
      console.error('SettingsScreen: Password update error:', error);
      setSuccessMessage(null);
    },
  });

  const handleUpdateProfile = () => {
    if (!selectedField) {
      setError('Please select a field to update.');
      return;
    }
    if (!validateForm()) return;
    setError(null);
    setSuccessMessage(null);
    const updateData = getUpdateData();
    if (Object.keys(updateData).length === 0) {
      setError('No changes to update.');
      return;
    }
    console.log('SettingsScreen: Submitting update:', updateData);
    if (selectedField === 'Password') {
      passwordUpdateMutation.mutate(updateData);
    } else {
      updateMutation.mutate(updateData);
    }
  };

  const handleOptionPress = (key) => {
    const now = Date.now();
    const DEBOUNCE_TIME = 300; // 300ms debounce
    if (now - lastTap < DEBOUNCE_TIME) {
      console.log('SettingsScreen: Tap debounced for:', key);
      return;
    }
    setLastTap(now);
    console.log('SettingsScreen: Option pressed:', key);
    setSelectedField(key);
  };

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={globalStyles.textXLargeBlack}>Please log in to view settings</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      <ScrollView style={styles.content} ref={scrollViewRef}>
        {profileLoading ? (
          <ActivityIndicator size="large" color={homeScreenTheme.primary} style={styles.loader} />
        ) : profileError ? (
          <Text style={styles.errorText}>{profileError.message || 'Error fetching profile'}</Text>
        ) : !originalData ? (
          <Text style={styles.errorText}>Loading profile data...</Text>
        ) : (
          <>
            {/* List of Options */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Update Profile</Text>
              {fieldOptions.map((option) => (
                <TouchableOpacity
                  key={option.key}
                  style={styles.optionButton}
                  onPress={() => handleOptionPress(option.key)}
                >
                  <Text style={styles.optionText}>{option.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Input Field(s) for Selected Option */}
            {selectedField && (
              <View key={selectedField} style={styles.section}>
                <Text style={styles.sectionTitle}>{fieldOptions.find((opt) => opt.key === selectedField).label}</Text>
                {console.log('SettingsScreen: Rendering input for:', selectedField)}
                {selectedField !== 'Password' ? (
                  <>
                    <Text style={styles.currentValue}>
                      Current Value: {originalData[selectedField] || 'Not set'}
                    </Text>
                    <TextInput
                      style={[styles.input, { backgroundColor: 'lightyellow' }]} // Temporary for debugging
                      placeholder={selectedField}
                      value={formData[selectedField] || ''}
                      onChangeText={(text) => setFormData((prev) => ({ ...prev, [selectedField]: text }))}
                      keyboardType={
                        selectedField === 'Email' ? 'email-address' :
                        selectedField === 'PhoneNumber' ? 'phone-pad' :
                        'default'
                      }
                      placeholderTextColor={globalStyles.COLORS.black}
                    />
                  </>
                ) : (
                  <>
                    <TextInput
                      style={[styles.input, { backgroundColor: 'lightyellow' }]}
                      placeholder="Current Password"
                      value={formData.CurrentPassword || ''}
                      onChangeText={(text) => setFormData((prev) => ({ ...prev, CurrentPassword: text }))}
                      secureTextEntry
                      placeholderTextColor={globalStyles.COLORS.black}
                    />
                    <TextInput
                      style={[styles.input, { backgroundColor: 'lightyellow' }]}
                      placeholder="New Password"
                      value={formData.NewPassword || ''}
                      onChangeText={(text) => setFormData((prev) => ({ ...prev, NewPassword: text }))}
                      secureTextEntry
                      placeholderTextColor={globalStyles.COLORS.black}
                    />
                  </>
                )}
              </View>
            )}

            {/* Error/Success Messages */}
            {error && <Text style={styles.errorText}>{error}</Text>}
            {successMessage && <Text style={styles.successText}>{successMessage}</Text>}

            {/* Save Changes Button */}
            {selectedField && (
              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleUpdateProfile}
                disabled={updateMutation.isLoading || passwordUpdateMutation.isLoading}
              >
                {updateMutation.isLoading || passwordUpdateMutation.isLoading ? (
                  <ActivityIndicator size="small" color={homeScreenTheme.white} />
                ) : (
                  <Text style={styles.submitButtonText}>Save Changes</Text>
                )}
              </TouchableOpacity>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: homeScreenTheme.background,
  },
  header: {
    backgroundColor: homeScreenTheme.primary,
    padding: 16,
    paddingTop: 40,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: homeScreenTheme.white,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: homeScreenTheme.black,
    marginBottom: 12,
  },
  optionButton: {
    padding: 12,
    backgroundColor: globalStyles.COLORS.lightGray,
    borderRadius: 8,
    marginBottom: 8,
  },
  optionText: {
    fontSize: 16,
    color: homeScreenTheme.black,
  },
  currentValue: {
    fontSize: 14,
    color: homeScreenTheme.black,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: globalStyles.COLORS.gray,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
    backgroundColor: globalStyles.COLORS.white,
  },
  submitButton: {
    backgroundColor: homeScreenTheme.primary,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 16,
  },
  submitButtonText: {
    fontSize: 16,
    color: homeScreenTheme.white,
    fontWeight: '600',
  },
  loader: {
    marginVertical: 16,
  },
  errorText: {
    fontSize: 14,
    color: homeScreenTheme.debit,
    textAlign: 'center',
    marginVertical: 16,
  },
  successText: {
    fontSize: 14,
    color: homeScreenTheme.primary,
    textAlign: 'center',
    marginVertical: 16,
  },
});

export default SettingsScreen;