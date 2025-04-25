import React, { useState, useContext } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useQuery } from 'react-query';
import { AuthContext } from '../context/AuthContext';
import { getLastTenTransactions, exportTransactions } from '../services/transactionService';
import { formatCurrency } from '../utils/helpers';
import globalStyles from '../styles/globalStyles';

const TransactionsScreen = () => {
  const { user } = useContext(AuthContext);
  const [page, setPage] = useState(1);
  const [perPage] = useState(10);


  const { data: transactions, isLoading, refetch } = useQuery(
    ['transactions', { page, per_page: perPage }],
    () => getLastTenTransactions(),
    { enabled: !!user }
  );
  

  const handleExport = async () => {
    try {
      const response = await exportTransactions();
      // Handle CSV download (e.g., save to device or open)
      alert('Transactions exported successfully');
    } catch (error) {
      alert(error.message || 'Failed to export transactions');
    }
  };

  const renderTransaction = ({ item }) => {
    const isDeposit = item.TransactionType === 'Deposit';
    const transactionType = isDeposit ? 'Deposit' : 'Transfer';
    const transactionId = item.TransactionID;  // Using TransactionID
  
    return (
      <View style={styles.transaction}>
        <Text style={[styles.transactionIcon, { color: isDeposit ? '#2ecc71' : '#e74c3c' }]}>
          {isDeposit ? '↓' : '↑'}
        </Text>
        <View style={styles.transactionDetails}>
          <Text style={styles.transactionDescription}>
            {item.Description || transactionType}
          </Text>
          <Text style={styles.transactionDate}>
            {new Date(item.CreatedAt).toLocaleString()}
          </Text>
        </View>
        <Text style={[styles.transactionAmount, { color: isDeposit ? '#2ecc71' : '#e74c3c' }]}>
          {isDeposit ? '+' : '-'}{formatCurrency(item.Amount)}
        </Text>
      </View>
    );
  };
  

  if (!user) {
    return (
      <View style={globalStyles.container}>
        <Text>Please log in to view transactions</Text>
      </View>
    );
  }

  return (
    <View style={globalStyles.container}>
      <Text style={[globalStyles.textXLargeBlack, { marginBottom: globalStyles.SPACING.large }]}>
        Transaction History
      </Text>
      {isLoading ? (
        <Text>Loading transactions...</Text>
      ) : !transactions?.data?.items?.length ? (
        <Text>No transactions available</Text>
      ) : (
        <>
          <FlatList
            data={transactions?.data?.items || []}
            renderItem={renderTransaction}
            keyExtractor={(item, index) => {
  const id = item?.DepositID ?? item?.TransferID;
  return id != null ? id.toString() : index.toString();
}}

            onEndReached={() => transactions?.total_pages > page && setPage(page + 1)}
            onEndReachedThreshold={0.5}
          />
          <TouchableOpacity style={globalStyles.button} onPress={handleExport}>
            <Text style={globalStyles.buttonText}>Export Transactions</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  transaction: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: globalStyles.COLORS.gray,
  },
  transactionIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionDescription: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  transactionDate: {
    fontSize: 14,
    color: '#777',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default TransactionsScreen;