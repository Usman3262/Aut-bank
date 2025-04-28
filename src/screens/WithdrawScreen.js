import React, { useContext, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useMutation } from 'react-query';
import { AuthContext } from '../context/AuthContext';
import { withdraw } from '../services/withdrawalService';
import globalStyles from '../styles/globalStyles';
import { homeScreenTheme } from '../styles/homeScreenTheme';

const WithdrawScreen = ({ navigation }) => {
  const { user } = useContext(AuthContext);

  // State for form
  const [withdrawData, setWithdrawData] = useState({ CardNumber: '', Pin: '', Amount: '' });
  const [displayCardNumber, setDisplayCardNumber] = useState(''); // For formatted card number display
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Function to format card number
  const formatCardNumber = (text) => {
    const cleaned = text.replace(/\D/g, '');
    const formatted = cleaned
      .match(/.{1,4}/g)
      ?.join('-') || cleaned;
    return formatted;
  };

  const handleCardNumberChange = (text) => {
    const rawNumber = text.replace(/\D/g, '').slice(0, 16);
    setWithdrawData({ ...withdrawData, CardNumber: rawNumber });
    const formatted = formatCardNumber(rawNumber);
    setDisplayCardNumber(formatted);
  };

  // Mutation for withdrawal
  const withdrawMutation = useMutation(withdraw, {
    onSuccess: (data) => {
      setSuccessMessage(data.message || 'Withdrawal successful!');
      setError(null);
      setWithdrawData({ CardNumber: '', Pin: '', Amount: '' });
      setDisplayCardNumber('');
    },
    onError: (error) => {
      setError(error.message || 'An error occurred during withdrawal.');
      setSuccessMessage(null);
    },
  });

  const handleWithdraw = () => {
    setError(null);
    setSuccessMessage(null);
    withdrawMutation.mutate(withdrawData);
  };

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={globalStyles.textXLargeBlack}>Please log in to withdraw funds</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color={homeScreenTheme.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Withdraw</Text>
        <View style={{ width: 24 }} /> {/* Spacer */}
      </View>

      <View style={styles.formContainer}>
        <TextInput
          style={styles.input}
          placeholder="Card Number (16 digits)"
          value={displayCardNumber}
          onChangeText={handleCardNumberChange}
          keyboardType="numeric"
          maxLength={19} // 16 digits + 3 hyphens
          placeholderTextColor={globalStyles.COLORS.black}
        />
        <TextInput
          style={styles.input}
          placeholder="Pin (4 digits)"
          value={withdrawData.Pin}
          onChangeText={(text) => setWithdrawData({ ...withdrawData, Pin: text })}
          keyboardType="numeric"
          maxLength={4}
          placeholderTextColor={globalStyles.COLORS.black}
        />
        <TextInput
          style={styles.input}
          placeholder="Amount"
          value={withdrawData.Amount}
          onChangeText={(text) => setWithdrawData({ ...withdrawData, Amount: text })}
          keyboardType="numeric"
          placeholderTextColor={globalStyles.COLORS.black}
        />

        {withdrawMutation.isLoading ? (
          <ActivityIndicator size="large" color={homeScreenTheme.primary} style={styles.loader} />
        ) : (
          <>
            {error && <Text style={styles.errorText}>{error}</Text>}
            {successMessage && <Text style={styles.successText}>{successMessage}</Text>}
            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleWithdraw}
              disabled={withdrawMutation.isLoading}
            >
              <Text style={styles.submitButtonText}>Withdraw</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: homeScreenTheme.white,
  },
  formContainer: {
    padding: 16,
    flex: 1,
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
  submitButton: {
    backgroundColor: homeScreenTheme.primary,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  submitButtonText: {
    fontSize: 16,
    color: homeScreenTheme.white,
    fontWeight: '600',
  },
});

export default WithdrawScreen;