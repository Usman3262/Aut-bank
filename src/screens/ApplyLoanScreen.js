import React, { useContext, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Modal,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useQuery, useMutation } from 'react-query';
import { AuthContext } from '../context/AuthContext';
import { applyForLoan, getLoanTypes } from '../services/loanService';
import globalStyles from '../styles/globalStyles';
import { homeScreenTheme } from '../styles/homeScreenTheme';

const ApplyLoanScreen = ({ navigation }) => {
  const { user } = useContext(AuthContext);

  // State for form
  const [loanData, setLoanData] = useState({
    LoanTypeID: '',
    LoanAmount: '',
    LoanDurationMonths: '',
    DueDate: '',
  });
  const [displayDueDate, setDisplayDueDate] = useState('');
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [loanTypeModalVisible, setLoanTypeModalVisible] = useState(false);

  // Fetch loan types
  const { data: loanTypesData, isLoading: loanTypesLoading, error: loanTypesError } = useQuery(
    'loanTypes',
    getLoanTypes,
    { enabled: !!user?.access_token }
  );

  // Log loan types data for debugging
  console.log('ApplyLoanScreen: loanTypesData:', loanTypesData);

  // Function to format due date
  const formatDueDate = (text) => {
    const cleaned = text.replace(/\D/g, '');
    if (cleaned.length >= 6) {
      return `${cleaned.slice(0, 4)}-${cleaned.slice(4, 6)}-${cleaned.slice(6, 8)}`;
    } else if (cleaned.length >= 4) {
      return `${cleaned.slice(0, 4)}-${cleaned.slice(4, 6)}`;
    }
    return cleaned;
  };

  const handleDueDateChange = (text) => {
    const rawDate = text.replace(/\D/g, '').slice(0, 8);
    let formattedForSubmission = rawDate;
    if (rawDate.length >= 6) {
      formattedForSubmission = `${rawDate.slice(0, 4)}-${rawDate.slice(4, 6)}-${rawDate.slice(6, 8)}`;
    } else if (rawDate.length >= 4) {
      formattedForSubmission = `${rawDate.slice(0, 4)}-${rawDate.slice(4, 6)}`;
    }
    setLoanData({ ...loanData, DueDate: formattedForSubmission });
    const formatted = formatDueDate(rawDate);
    setDisplayDueDate(formatted);
  };

  // Mutation for applying for a loan
  const applyMutation = useMutation(applyForLoan, {
    onSuccess: (data) => {
      setSuccessMessage(data.message || 'Loan application successful!');
      setError(null);
      setLoanData({ LoanTypeID: '', LoanAmount: '', LoanDurationMonths: '', DueDate: '' });
      setDisplayDueDate('');
    },
    onError: (error) => {
      setError(error.message || 'An error occurred during loan application.');
      setSuccessMessage(null);
    },
  });

  const handleApplyLoan = () => {
    setError(null);
    setSuccessMessage(null);
    applyMutation.mutate({
      LoanTypeID: parseInt(loanData.LoanTypeID),
      LoanAmount: parseFloat(loanData.LoanAmount),
      LoanDurationMonths: parseInt(loanData.LoanDurationMonths),
      DueDate: loanData.DueDate,
    });
  };

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={globalStyles.textXLargeBlack}>Please log in to apply for a loan</Text>
      </SafeAreaView>
    );
  }

  const selectedLoanType = loanTypesData?.data?.items?.find(
    (type) => type.LoanTypeID === parseInt(loanData.LoanTypeID)
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color={homeScreenTheme.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Apply for Loan</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.formContainer}>
        {loanTypesLoading ? (
          <ActivityIndicator size="large" color={homeScreenTheme.primary} style={styles.loader} />
        ) : loanTypesError ? (
          <Text style={styles.errorText}>{loanTypesError.message}</Text>
        ) : !loanTypesData?.data?.items || loanTypesData.data.items.length === 0 ? (
          <Text style={styles.errorText}>No loan types available</Text>
        ) : (
          <>
            {/* Log Box for Loan Types */}
            <ScrollView style={styles.logBox}>
              <Text style={styles.logTitle}>Loan Types Data:</Text>
              {loanTypesData.data.items.map((type, index) => (
                <View key={type.LoanTypeID} style={styles.logEntry}>
                  <Text style={styles.logText}>
                    {index + 1}. {type.LoanTypeName}
                  </Text>
                  <Text style={styles.logSubText}>
                    ID: {type.LoanTypeID}
                  </Text>
                  <Text style={styles.logSubText}>
                    Interest Rate: {type.DefaultInterestRate}%
                  </Text>
                  <Text style={styles.logSubText}>
                    Late Fee/Day: ${type.LatePaymentFeePerDay}
                  </Text>
                </View>
              ))}
            </ScrollView>

            <TouchableOpacity
              style={styles.dropdown}
              onPress={() => setLoanTypeModalVisible(true)}
            >
              <Text style={styles.dropdownText}>
                {selectedLoanType ? selectedLoanType.LoanTypeName : 'Select Loan Type'}
              </Text>
              <Icon name="arrow-drop-down" size={20} color={homeScreenTheme.black} />
            </TouchableOpacity>

            <TextInput
              style={styles.input}
              placeholder="Loan Amount"
              value={loanData.LoanAmount}
              onChangeText={(text) => setLoanData({ ...loanData, LoanAmount: text })}
              keyboardType="numeric"
              placeholderTextColor={globalStyles.COLORS.black}
            />
            <TextInput
              style={styles.input}
              placeholder="Loan Duration (Months)"
              value={loanData.LoanDurationMonths}
              onChangeText={(text) => setLoanData({ ...loanData, LoanDurationMonths: text })}
              keyboardType="numeric"
              placeholderTextColor={globalStyles.COLORS.black}
            />
            <TextInput
              style={styles.input}
              placeholder="Due Date (YYYY-MM-DD)"
              value={displayDueDate}
              onChangeText={handleDueDateChange}
              keyboardType="numeric"
              maxLength={10}
              placeholderTextColor={globalStyles.COLORS.black}
            />

            {applyMutation.isLoading ? (
              <ActivityIndicator size="large" color={homeScreenTheme.primary} style={styles.loader} />
            ) : (
              <>
                {error && <Text style={styles.errorText}>{error}</Text>}
                {successMessage && <Text style={styles.successText}>{successMessage}</Text>}
                <TouchableOpacity
                  style={styles.submitButton}
                  onPress={handleApplyLoan}
                  disabled={applyMutation.isLoading}
                >
                  <Text style={styles.submitButtonText}>Apply</Text>
                </TouchableOpacity>
              </>
            )}
          </>
        )}
      </View>

      {/* Loan Type Modal */}
      <Modal transparent visible={loanTypeModalVisible} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Loan Type</Text>
            {loanTypesData?.data?.items?.map((type) => (
              <TouchableOpacity
                key={type.LoanTypeID}
                style={styles.dropdownOption}
                onPress={() => {
                  setLoanData({ ...loanData, LoanTypeID: type.LoanTypeID.toString() });
                  setLoanTypeModalVisible(false);
                }}
              >
                <Text style={styles.dropdownOptionText}>{type.LoanTypeName}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.modalButtonCancel}
              onPress={() => setLoanTypeModalVisible(false)}
            >
              <Text style={styles.modalButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  logBox: {
    maxHeight: 150,
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: globalStyles.COLORS.gray,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  logTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: homeScreenTheme.black,
    marginBottom: 8,
  },
  logEntry: {
    marginBottom: 12,
  },
  logText: {
    fontSize: 14,
    fontWeight: '600',
    color: homeScreenTheme.black,
  },
  logSubText: {
    fontSize: 12,
    color: homeScreenTheme.secondary,
    marginLeft: 16,
  },
  dropdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: globalStyles.COLORS.gray,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    backgroundColor: globalStyles.COLORS.white,
  },
  dropdownText: {
    fontSize: 16,
    color: homeScreenTheme.black,
  },
  dropdownOption: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: globalStyles.COLORS.gray,
    width: '100%',
    alignItems: 'center',
  },
  dropdownOptionText: {
    fontSize: 16,
    color: homeScreenTheme.black,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: homeScreenTheme.white,
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxWidth: 400,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: homeScreenTheme.black,
    marginBottom: 12,
  },
  modalButtonCancel: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: globalStyles.COLORS.gray,
    alignItems: 'center',
    marginTop: 8,
  },
  modalButtonText: {
    fontSize: 16,
    color: homeScreenTheme.white,
    fontWeight: '600',
  },
});

export default ApplyLoanScreen;