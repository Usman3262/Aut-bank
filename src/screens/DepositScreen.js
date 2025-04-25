import React, { useState, useContext, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Animated,
  ActivityIndicator,
} from 'react-native';
import { AuthContext } from '../context/AuthContext';
import globalStyles from '../styles/globalStyles';

const DepositScreen = () => {
  const { user } = useContext(AuthContext);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState('Waiting for Approval...');
  const [modalSuccess, setModalSuccess] = useState(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const validateInputs = () => {
    if (!description.trim()) {
      setError('Please enter a description');
      return false;
    }
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setError('Please enter a valid amount greater than 0');
      return false;
    }
    return true;
  };

  const showModal = (message, success = null) => {
    setModalMessage(message);
    setModalSuccess(success);
    setModalVisible(true);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
    // Auto-close after 3 seconds (realistic delay)
    setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => setModalVisible(false));
    }, 3000);
  };

  const handleSubmit = async () => {
    setError(null);
    if (!user?.access_token) {
      setError('Please log in to make a deposit');
      return;
    }
    if (!validateInputs()) return;

    try {
      showModal('Waiting for Approval...');
      showModal('Deposit submitted successfully! Awaiting approval.', true);
      setAmount('');
      setDescription('');
    } catch (error) {
      showModal(error.message || 'Failed to submit deposit', false);
    }
  };

  if (!user) {
    return (
      <View style={globalStyles.container}>
        <Text style={globalStyles.textXLargeBlack}>Please log in to make a deposit</Text>
      </View>
    );
  }

  return (
    <View style={globalStyles.container}>
      <Text style={[globalStyles.textXLargeBlack, styles.title]}>Make a Deposit</Text>

      <View style={styles.formContainer}>
        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.input, error && description === '' ? styles.inputError : null]}
          value={description}
          onChangeText={setDescription}
          placeholder="e.g., For savings"
          placeholderTextColor={globalStyles.COLORS.gray}
        />

        <Text style={styles.label}>Amount ($)</Text>
        <TextInput
          style={[styles.input, error && !parseFloat(amount) ? styles.inputError : null]}
          value={amount}
          onChangeText={(text) => setAmount(text.replace(/[^0-9.]/g, ''))}
          placeholder="e.g., 100.00"
          placeholderTextColor={globalStyles.COLORS.gray}
          keyboardType="numeric"
        />

        {error && <Text style={styles.errorText}>{error}</Text>}

        <TouchableOpacity style={globalStyles.button} onPress={handleSubmit}>
          <Text style={globalStyles.buttonText}>Submit Deposit</Text>
        </TouchableOpacity>
      </View>

      <Modal
        transparent
        visible={modalVisible}
        animationType="none"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <Animated.View style={[styles.modalContent, { opacity: fadeAnim }]}>
            <Text style={styles.modalText}>{modalMessage}</Text>
            {modalSuccess === null ? (
              <ActivityIndicator size="small" color={globalStyles.COLORS.gray} />
            ) : (
              <Text style={[styles.modalStatus, modalSuccess ? styles.modalSuccess : styles.modalError]}>
                {modalSuccess ? 'Success' : 'Error'}
              </Text>
            )}
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  title: {
    marginBottom: globalStyles.SPACING.large,
    textAlign: 'center',
  },
  formContainer: {
    width: '90%',
    alignSelf: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: globalStyles.COLORS.gray,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  inputError: {
    borderColor: '#e74c3c',
  },
  errorText: {
    color: '#e74c3c',
    fontSize: 14,
    marginBottom: 16,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    width: '80%',
    maxWidth: 400,
  },
  modalText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
    textAlign: 'center',
  },
  modalStatus: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  modalSuccess: {
    color: '#2ecc71',
  },
  modalError: {
    color: '#e74c3c',
  },
});

export default DepositScreen;