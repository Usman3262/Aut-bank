import React, { useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useQuery } from 'react-query';
import { AuthContext } from '../context/AuthContext';
import { getUserAnalyticsSummary } from '../services/userService';
import globalStyles from '../styles/globalStyles';
import { homeScreenTheme } from '../styles/homeScreenTheme';

const HistoryScreen = () => {
  const { user } = useContext(AuthContext);

  // Fetch user analytics summary
  const { data, isLoading, error: fetchError } = useQuery(
    'userAnalyticsSummary',
    getUserAnalyticsSummary,
    { enabled: !!user?.access_token }
  );

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={globalStyles.textXLargeBlack}>Please log in to view your history</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>History</Text>
      </View>

      <ScrollView style={styles.content}>
        {isLoading ? (
          <ActivityIndicator size="large" color={homeScreenTheme.primary} style={styles.loader} />
        ) : fetchError ? (
          <Text style={styles.errorText}>{fetchError.message || 'Error fetching analytics summary'}</Text>
        ) : !data?.data ? (
          <Text style={styles.noDataText}>No analytics data available</Text>
        ) : (
          <>
            {/* Current Balance Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Current Balance</Text>
              <View style={styles.card}>
                <Text style={styles.cardValue}>${data.data.current_balance.toLocaleString()}</Text>
              </View>
            </View>

            {/* Transactions Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Transactions</Text>
              <View style={styles.card}>
                <Text style={styles.cardLabel}>Total Count: <Text style={styles.cardValue}>{data.data.transactions.total_count}</Text></Text>
                <Text style={styles.cardLabel}>Total Volume: <Text style={styles.cardValue}>${data.data.transactions.total_volume.toLocaleString()}</Text></Text>
                <Text style={styles.cardLabel}>Average Amount: <Text style={styles.cardValue}>${Math.round(data.data.transactions.average_amount).toLocaleString()}</Text></Text>
                <Text style={styles.cardSubTitle}>Deposits</Text>
                <Text style={styles.cardSubLabel}>Count: <Text style={styles.cardValue}>{data.data.transactions.deposits.count}</Text></Text>
                <Text style={styles.cardSubLabel}>Amount: <Text style={styles.cardValue}>${data.data.transactions.deposits.amount.toLocaleString()}</Text></Text>
                <Text style={styles.cardSubTitle}>Transfers Sent</Text>
                <Text style={styles.cardSubLabel}>Count: <Text style={styles.cardValue}>{data.data.transactions.transfers_sent.count}</Text></Text>
                <Text style={styles.cardSubLabel}>Amount: <Text style={styles.cardValue}>${data.data.transactions.transfers_sent.amount.toLocaleString()}</Text></Text>
                <Text style={styles.cardSubTitle}>Transfers Received</Text>
                <Text style={styles.cardSubLabel}>Count: <Text style={styles.cardValue}>{data.data.transactions.transfers_received.count}</Text></Text>
                <Text style={styles.cardSubLabel}>Amount: <Text style={styles.cardValue}>${data.data.transactions.transfers_received.amount.toLocaleString()}</Text></Text>
                <Text style={styles.cardSubTitle}>Withdrawals</Text>
                <Text style={styles.cardSubLabel}>Count: <Text style={styles.cardValue}>{data.data.transactions.withdrawals.count}</Text></Text>
                <Text style={styles.cardSubLabel}>Amount: <Text style={styles.cardValue}>${data.data.transactions.withdrawals.amount.toLocaleString()}</Text></Text>
              </View>
            </View>

            {/* Loans Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Loans</Text>
              <View style={styles.card}>
                <Text style={styles.cardLabel}>Total Approved Amount: <Text style={styles.cardValue}>${data.data.loans.total_approved_amount.toLocaleString()}</Text></Text>
                <Text style={styles.cardLabel}>Total Approved Count: <Text style={styles.cardValue}>{data.data.loans.total_approved_count}</Text></Text>
                <Text style={styles.cardLabel}>Pending Count: <Text style={styles.cardValue}>{data.data.loans.pending_count}</Text></Text>
              </View>
            </View>
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
  card: {
    backgroundColor: homeScreenTheme.white,
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    borderWidth: 1,
    borderColor: globalStyles.COLORS.gray,
  },
  cardLabel: {
    fontSize: 14,
    color: homeScreenTheme.black,
    marginBottom: 8,
  },
  cardSubTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: homeScreenTheme.primary,
    marginVertical: 8,
  },
  cardSubLabel: {
    fontSize: 12,
    color: homeScreenTheme.secondary,
    marginBottom: 4,
    marginLeft: 8,
  },
  cardValue: {
    fontSize: 14,
    fontWeight: '600',
    color: homeScreenTheme.black,
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
  noDataText: {
    fontSize: 16,
    color: homeScreenTheme.black,
    textAlign: 'center',
    marginVertical: 16,
  },
});

export default HistoryScreen;