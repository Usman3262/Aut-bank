import React, { useContext, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useQuery, useMutation } from 'react-query';
import { AuthContext } from '../context/AuthContext';
import { getLoanPayments, recordLoanPayment } from '../services/loanService';
import globalStyles from '../styles/globalStyles';
import { homeScreenTheme } from '../styles/homeScreenTheme';

const LoanPaymentsScreen = ({ route, navigation }) => {
  const { user } = useContext(AuthContext);
  const { loanId } = route.params;

  // State for pagination
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  // State for payment form
  const [paymentAmount, setPaymentAmount] = useState('');
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Fetch loan payments
  const { data, isLoading, error: fetchError, refetch } = useQuery(
    ['loanPayments', loanId, page, perPage],
    () => getLoanPayments({ loan_id: loanId, page, per_page: perPage }),
    { enabled: !!user?.access_token }
  );

  // Mutation for recording a payment
  const paymentMutation = useMutation(recordLoanPayment, {
    onSuccess: (data) => {
      setSuccessMessage(data.message || 'Payment recorded successfully!');
      setError(null);
      setPaymentAmount('');
      refetch();
    },
    onError: (error) => {
      setError(error.message || 'An error occurred while recording the payment.');
      setSuccessMessage(null);
    },
  });

  const handleRecordPayment = () => {
    setError(null);
    setSuccessMessage(null);
    paymentMutation.mutate({
      LoanID: loanId,
      PaymentAmount: parseFloat(paymentAmount),
    });
  };

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={globalStyles.textXLargeBlack}>Please log in to view loan payments</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color={homeScreenTheme.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Loan Payments (ID: {loanId})</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.formContainer}>
        <TextInput
          style={styles.input}
          placeholder="Payment Amount"
          value={paymentAmount}
          onChangeText={setPaymentAmount}
          keyboardType="numeric"
          placeholderTextColor={globalStyles.COLORS.black}
        />
        {paymentMutation.isLoading ? (
          <ActivityIndicator size="large" color={homeScreenTheme.primary} style={styles.loader} />
        ) : (
          <>
            {error && <Text style={styles.errorText}>{error}</Text>}
            {successMessage && <Text style={styles.successText}>{successMessage}</Text>}
            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleRecordPayment}
              disabled={paymentMutation.isLoading}
            >
              <Text style={styles.submitButtonText}>Record Payment</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      {isLoading ? (
        <ActivityIndicator size="large" color={homeScreenTheme.primary} style={styles.loader} />
      ) : fetchError ? (
        <Text style={styles.errorText}>{fetchError.message}</Text>
      ) : !data?.data?.items || data.data.items.length === 0 ? (
        <Text style={styles.noDataText}>No payments available</Text>
      ) : (
        <>
          <FlatList
            data={data.data.items}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <View style={styles.paymentItem}>
                <Text style={styles.paymentText}>Amount: {item.PaymentAmount}</Text>
                <Text style={styles.paymentSubText}>Date: {item.PaymentDate}</Text>
              </View>
            )}
          />
          <View style={styles.pagination}>
            <TouchableOpacity
              disabled={page === 1}
              onPress={() => setPage(page - 1)}
              style={[styles.pageButton, page === 1 && styles.disabledButton]}
            >
              <Text style={styles.pageButtonText}>Previous</Text>
            </TouchableOpacity>
            <Text style={styles.pageInfo}>
              Page {data.page} of {data.total_pages}
            </Text>
            <TouchableOpacity
              disabled={page === data.total_pages}
              onPress={() => setPage(page + 1)}
              style={[styles.pageButton, page === data.total_pages && styles.disabledButton]}
            >
              <Text style={styles.pageButtonText}>Next</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
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
  paymentItem: {
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    backgroundColor: homeScreenTheme.white,
    borderRadius: 12,
    elevation: 2,
  },
  paymentText: {
    fontSize: 16,
    fontWeight: '600',
    color: homeScreenTheme.black,
  },
  paymentSubText: {
    fontSize: 12,
    color: homeScreenTheme.secondary,
    marginTop: 4,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  pageButton: {
    padding: 8,
    backgroundColor: homeScreenTheme.primary,
    borderRadius: 8,
  },
  disabledButton: {
    backgroundColor: globalStyles.COLORS.gray,
  },
  pageButtonText: {
    fontSize: 14,
    color: homeScreenTheme.white,
  },
  pageInfo: {
    fontSize: 14,
    color: homeScreenTheme.black,
  },
  noDataText: {
    fontSize: 16,
    color: homeScreenTheme.black,
    textAlign: 'center',
    marginVertical: 16,
  },
});

export default LoanPaymentsScreen;