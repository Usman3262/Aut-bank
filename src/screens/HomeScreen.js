import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import { fetchUserData } from '../services/api';

const { height } = Dimensions.get('window');

// Mock data for recipients and notifications
const mockRecipients = [
  { id: '1', name: 'Alice Smith', account: '****1234' },
  { id: '2', name: 'Bob Johnson', account: '****5678' },
];
const mockNotifications = [];

const HomeScreen = () => {
  const navigation = useNavigation();
  const [user, setUser] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [recipients] = useState(mockRecipients);
  const [notifications] = useState(mockNotifications);

  useEffect(() => {
    fetchUserData().then((response) => {
      if (response.success && response.user) {
        setUser(response.user);
        setTransactions(response.user.transactions || [
          { id: '1', type: 'credit', description: 'Salary', amount: 5000, date: 'Apr 10, 2025' },
          { id: '2', type: 'debit', description: 'Groceries', amount: 120.5, date: 'Apr 9, 2025' },
        ]);
      } else {
        setUser({ username: 'Guest User', balance: 0 });
      }
    }).catch(() => {
      setUser({ username: 'Guest User', balance: 0 });
    });
  }, []);

  const BalanceCard = () => (
    <View style={styles.balanceCard}>
      <Text style={styles.balanceTitle}>Balance</Text>
      <View style={styles.balanceRow}>
        <Text style={styles.balanceAmount}>
          ${typeof user?.balance === 'number' ? user.balance.toFixed(2) : '0.00'}
        </Text>
        <TouchableOpacity onPress={() => navigation.navigate('QRCode')}>
          <Icon name="qr-code" size={24} color="#3498db" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const ServiceItem = ({ title, icon, screen }) => (
    <TouchableOpacity style={styles.serviceItem} onPress={() => navigation.navigate(screen)}>
      <Icon name={icon} size={24} color="#3498db" />
      <Text style={styles.serviceText}>{title}</Text>
    </TouchableOpacity>
  );

  const RecipientItem = ({ item }) => (
    <View style={styles.recipientItem}>
      <View style={styles.recipientAvatar}>
        <Text style={styles.recipientInitial}>
          {item?.name?.[0] || '?'}
        </Text>
      </View>
      <Text style={styles.recipientName}>{item?.name || 'Unknown'}</Text>
      <Text style={styles.recipientAccount}>{item?.account || '****0000'}</Text>
    </View>
  );

  const TransactionItem = ({ item }) => (
    <View style={styles.transaction}>
      <Text style={[styles.transactionIcon, { color: item.type === 'credit' ? '#2ecc71' : '#e74c3c' }]}>
        {item.type === 'credit' ? '↓' : '↑'}
      </Text>
      <View style={styles.transactionDetails}>
        <Text style={styles.transactionDescription}>{item.description}</Text>
        <Text style={styles.transactionDate}>{item.date}</Text>
      </View>
      <Text style={[styles.transactionAmount, { color: item.type === 'credit' ? '#2ecc71' : '#e74c3c' }]}>
        {item.type === 'credit' ? '+' : '-'}${item.amount.toFixed(2)}
      </Text>
    </View>
  );

  if (!user) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3498db" />
        <Icon name="account-balance-wallet" size={50} color="#3498db" style={styles.loadingIcon} />
        <Text style={styles.loadingText}>Loading your finances...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.blueSection}>
        <View style={styles.header}>
          <View style={styles.userContainer}>
            <View style={styles.userAvatar}>
              <Text style={styles.userInitial}>
                {user.username && user.username.length > 0 ? user.username[0] : 'U'}
              </Text>
            </View>
            <View style={styles.userTextContainer}>
              <Text style={styles.username}>{user.username || 'Guest User'}</Text>
              <Text style={styles.greeting}>Let's save your money</Text>
            </View>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('Notifications')}>
            <Icon
              name={notifications.length > 0 ? 'notifications-active' : 'notifications'}
              size={24}
              color="#fff"
            />
          </TouchableOpacity>
        </View>
        <BalanceCard />
      </View>
      <ScrollView contentContainerStyle={styles.whiteSection}>
        <View style={styles.servicesContainer}>
          <Text style={styles.sectionTitle}>Services</Text>
          <View style={styles.servicesRow}>
            <ServiceItem title="Send" icon="send" screen="Send" />
            <ServiceItem title="Deposit" icon="add" screen="Deposit" />
            <ServiceItem title="Loan" icon="account-balance" screen="Loan" />
          </View>
          <View style={styles.servicesRow}>
            <ServiceItem title="Transactions" icon="history" screen="Transactions" />
            <ServiceItem title="Bills" icon="receipt" screen="Bills" />
            <ServiceItem title="Savings" icon="savings" screen="Savings" />
          </View>
        </View>
        <View style={styles.recipientsContainer}>
          <Text style={styles.sectionTitle}>Latest Recipients</Text>
          <FlatList
            data={recipients}
            renderItem={RecipientItem}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
          />
        </View>
        <View style={styles.transactionsContainer}>
          <Text style={styles.sectionTitle}>Transaction History</Text>
          <FlatList
            data={transactions}
            renderItem={TransactionItem}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingIcon: { marginVertical: 16 },
  loadingText: { fontSize: 16, color: '#3498db', fontWeight: '500' },
  blueSection: {
    height: height * 0.2, // Reduced to 20%
    backgroundColor: '#3498db',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    padding: 16,
    zIndex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  userInitial: { fontSize: 20, fontWeight: 'bold', color: '#3498db' },
  userTextContainer: { flexDirection: 'column' },
  username: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
  greeting: { fontSize: 14, color: '#fff', marginTop: 4 },
  balanceCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16, // Reverted to original
    elevation: 4,
    position: 'absolute',
    top: height * 0.12, // Adjusted for smaller blue section
    left: 16,
    right: 16,
    zIndex: 2,
  },
  balanceTitle: { fontSize: 14, color: '#7f8c8d' }, // Reverted to original
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  balanceAmount: { fontSize: 26, fontWeight: 'bold', color: '#2c3e50', marginVertical: 4 }, // Reverted to original
  whiteSection: {
    backgroundColor: '#fff',
    paddingTop: height * 0.08,
  },
  servicesContainer: { paddingHorizontal: 16 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#2c3e50', marginBottom: 12 },
  servicesRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  serviceItem: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#ecf0f1',
    borderRadius: 8,
    marginHorizontal: 4,
  },
  serviceText: { fontSize: 12, color: '#2c3e50', marginTop: 4 },
  recipientsContainer: { padding: 16 },
  recipientItem: { alignItems: 'center', marginRight: 12 },
  recipientAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ecf0f1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  recipientInitial: { fontSize: 16, fontWeight: 'bold', color: '#2c3e50' },
  recipientName: { fontSize: 12, color: '#2c3e50', marginTop: 4 },
  recipientAccount: { fontSize: 10, color: '#7f8c8d' },
  transactionsContainer: { padding: 16 },
  transaction: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8 },
  transactionIcon: { fontSize: 20, marginRight: 8 },
  transactionDetails: { flex: 1 },
  transactionDescription: { fontSize: 14, color: '#2c3e50' },
  transactionDate: { fontSize: 10, color: '#7f8c8d' },
  transactionAmount: { fontSize: 14, fontWeight: 'bold' },
});

export default HomeScreen;