import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Modal } from 'react-native';
import { useQuery, useMutation } from 'react-query';
import { AuthContext } from '../context/AuthContext';
import { applyForLoan, getLoanTypes, getLoans, makeLoanPayment } from '../services/loanService';
import { LoanApplySchema, LoanPaymentCreateSchema } from '../utils/validators';
import { formatCurrency, formatDate } from '../utils/helpers';
import globalStyles from '../styles/globalStyles';

const LoanScreen = () => {
  const { user } = useContext(AuthContext);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [loanTypeId, setLoanTypeId] = useState('');
  const [loanAmount, setLoanAmount] = useState('');
  const [loanDuration, setLoanDuration] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [paymentLoanId, setPaymentLoanId] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const { data: loanTypes, isLoading: typesLoading } = useQuery('loanTypes', getLoanTypes, {
    enabled: !!user,
  });

  const { data: loans, isLoading: loansLoading, refetch } = useQuery('loans', () => getLoans({ page: 1, per_page: 10 }), {
    enabled: !!user,
  });

  const applyMutation = useMutation(applyForLoan, {
    onSuccess: () => {
      setShowApplyModal(false);
      setLoanTypeId('');
      setLoanAmount('');
      setLoanDuration('');
      setDueDate('');
      refetch();
    },
    onError: (error) => setErrorMessage(error.message),
  });

  const paymentMutation = useMutation(makeLoanPayment, {
    onSuccess: () => {
      setShowPaymentModal(false);
      setPaymentLoanId(null);
      setPaymentAmount('');
      refetch();
    },
    onError: (error) => setErrorMessage(error.message),
  });

  const handleApplyLoan = async () => {
    setErrorMessage('');
    try {
      const loanData = {
        LoanTypeID: parseInt(loanTypeId),
        LoanAmount: parseFloat(loanAmount),
        LoanDurationMonths: parseInt(loanDuration),
        DueDate: formatDate(dueDate),
      };
      await LoanApplySchema.validate(loanData);
      applyMutation.mutate(loanData);
    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  const handleMakePayment = async () => {
    setErrorMessage('');
    try {
      const paymentData = {
        LoanID: paymentLoanId,
        PaymentAmount: parseFloat(paymentAmount),
      };
      await LoanPaymentCreateSchema.validate(paymentData);
      paymentMutation.mutate(paymentData);
    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  const renderLoan = ({ item }) => (
    <View style={styles.loan}>
      <Text style={styles.loanText}>Type: {item.LoanTypeName}</Text>
      <Text style={styles.loanText}>Amount: {formatCurrency(item.LoanAmount)}</Text>
      <Text style={styles.loanText}>Status: {item.LoanStatus}</Text>
      <Text style={styles.loanText}>Due: {item.DueDate}</Text>
      <TouchableOpacity
        style={styles.actionButton}
        onPress={() => {
          setPaymentLoanId(item.LoanID);
          setShowPaymentModal(true);
        }}
      >
        <Text style={styles.actionText}>Make Payment</Text>
      </TouchableOpacity>
    </View>
  );

  if (!user) {
    return (
      <View style={globalStyles.container}>
        <Text>Please log in to manage loans</Text>
      </View>
    );
  }

  return (
    <View style={globalStyles.container}>
      <Text style={[globalStyles.textXLargeBlack, { marginBottom: globalStyles.SPACING.large }]}>
        Loans
      </Text>
      {loansLoading ? (
        <Text>Loading loans...</Text>
      ) : (
        <FlatList
          data={loans?.data || []}
          renderItem={renderLoan}
          keyExtractor={(item) => item.LoanID.toString()}
        />
      )}
      <TouchableOpacity
        style={globalStyles.button}
        onPress={() => setShowApplyModal(true)}
      >
        <Text style={globalStyles.buttonText}>Apply for Loan</Text>
      </TouchableOpacity>
      {errorMessage ? <Text style={globalStyles.textError}>{errorMessage}</Text> : null}

      <Modal visible={showApplyModal} animationType="slide">
        <View style={globalStyles.container}>
          <Text style={[globalStyles.textXLargeBlack, { marginBottom: globalStyles.SPACING.large }]}>
            Apply for Loan
          </Text>
          <TextInput
            style={globalStyles.input}
            placeholder="Loan Type ID"
            keyboardType="numeric"
            value={loanTypeId}
            onChangeText={setLoanTypeId}
          />
          <TextInput
            style={globalStyles.input}
            placeholder="Loan Amount"
            keyboardType="numeric"
            value={loanAmount}
            onChangeText={setLoanAmount}
          />
          <TextInput
            style={globalStyles.input}
            placeholder="Duration (Months)"
            keyboardType="numeric"
            value={loanDuration}
            onChangeText={setLoanDuration}
          />
          <TextInput
            style={globalStyles.input}
            placeholder="Due Date (YYYY-MM-DD)"
            value={dueDate}
            onChangeText={setDueDate}
          />
          {errorMessage ? <Text style={globalStyles.textError}>{errorMessage}</Text> : null}
          <TouchableOpacity
            style={[globalStyles.button, applyMutation.isLoading && { opacity: 0.7 }]}
            onPress={handleApplyLoan}
            disabled={applyMutation.isLoading}
          >
            <Text style={globalStyles.buttonText}>
              {applyMutation.isLoading ? 'Applying...' : 'Apply'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={globalStyles.buttonOutline}
            onPress={() => setShowApplyModal(false)}
          >
            <Text style={globalStyles.buttonOutlineText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      <Modal visible={showPaymentModal} animationType="slide">
        <View style={globalStyles.container}>
          <Text style={[globalStyles.textXLargeBlack, { marginBottom: globalStyles.SPACING.large }]}>
            Make Loan Payment
          </Text>
          <TextInput
            style={globalStyles.input}
            placeholder="Payment Amount"
            keyboardType="numeric"
            value={paymentAmount}
            onChangeText={setPaymentAmount}
          />
          {errorMessage ? <Text style={globalStyles.textError}>{errorMessage}</Text> : null}
          <TouchableOpacity
            style={[globalStyles.button, paymentMutation.isLoading && { opacity: 0.7 }]}
            onPress={handleMakePayment}
            disabled={paymentMutation.isLoading}
          >
            <Text style={globalStyles.buttonText}>
              {paymentMutation.isLoading ? 'Processing...' : 'Pay'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={globalStyles.buttonOutline}
            onPress={() => setShowPaymentModal(false)}
          >
            <Text style={globalStyles.buttonOutlineText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  loan: {
    backgroundColor: globalStyles.COLORS.gray,
    borderRadius: 8,
    padding: 16,
    marginVertical: 8,
  },
  loanText: {
    fontSize: globalStyles.FONT_SIZES.medium,
    color: globalStyles.COLORS.text,
  },
  actionButton: {
    backgroundColor: globalStyles.COLORS.primary,
    padding: 8,
    borderRadius: 5,
    marginTop: 8,
    alignItems: 'center',
  },
  actionText: {
    color: globalStyles.COLORS.white,
    fontSize: globalStyles.FONT_SIZES.small,
  },
});

export default LoanScreen;