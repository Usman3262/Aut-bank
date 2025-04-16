// src/screens/HomeScreen.js
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
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { fetchRecipients } from '../services/api';

const { height } = Dimensions.get('window');

const HomeScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const [user, setUser] = useState(route.params?.user);
  const [recipients, setRecipients] = useState([]);
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    console.log('HomeScreen route.params:', JSON.stringify(route.params, null, 2));
    console.log('HomeScreen user:', JSON.stringify(user, null, 2));
    console.log('HomeScreen user keys:', user ? Object.keys(user) : 'undefined');

    // Update user and transactions
    if (route.params?.user) {
      setUser(route.params.user);
      setTransactions([
        ...(route.params.user?.incomingTransactions || []).map((t) => ({
          id: `incoming-${t.id}`, // Unique key
          type: 'credit',
          description: `From ${t.senderName}`,
          amount: t.amount,
          date: t.date,
        })),
        ...(route.params.user?.outgoingTransactions || []).map((t) => ({
          id: `outgoing-${t.id}`, // Unique key
          type: 'debit',
          description: `To ${t.recipientName}`,
          amount: t.amount,
          date: t.date,
        })),
      ]);
    }

    // Fetch recipients
    fetchRecipients().then((response) => {
      console.log('HomeScreen recipients:', JSON.stringify(response.recipients, null, 2));
      if (response.success) {
        setRecipients(response.recipients);
      }
    });

    // Navigation listener
    const unsubscribe = navigation.addListener('focus', () => {
      console.log('HomeScreen navigation focus, route.params:', JSON.stringify(route.params, null, 2));
      if (route.params?.user) {
        setUser(route.params.user);
        setTransactions([
          ...(route.params.user?.incomingTransactions || []).map((t) => ({
            id: `incoming-${t.id}`,
            type: 'credit',
            description: `From ${t.senderName}`,
            amount: t.amount,
            date: t.date,
          })),
          ...(route.params.user?.outgoingTransactions || []).map((t) => ({
            id: `outgoing-${t.id}`,
            type: 'debit',
            description: `To ${t.recipientName}`,
            amount: t.amount,
            date: t.date,
          })),
        ]);
      } else {
        console.warn('HomeScreen no user in focus params');
      }
    });

    return unsubscribe;
  }, [navigation, route.params]);

  const BalanceCard = () => (
    <View style={styles.balanceCard}>
      <Text style={styles.balanceTitle}>Balance</Text>
      <View style={styles.balanceRow}>
        <Text style={styles.balanceAmount}>
          ${user?.balance?.toFixed(2) || '0.00'}
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
      <Image
        source={item?.image}
        style={styles.recipientAvatar}
        defaultSource={{ uri: 'https://via.placeholder.com/40' }}
      />
      <Text style={styles.recipientName}>{item?.name || 'Unknown'}</Text>
      <Text style={styles.recipientEmail}>{item?.email || ''}</Text>
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
      <SafeAreaView style={styles.container}>
        <View style={styles.blueSection}>
          <Text style={styles.username}>Loading user data...</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => navigation.reset({ index: 0, routes: [{ name: 'Login' }] })}
          >
            <Text style={styles.retryButtonText}>Retry Login</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.blueSection}>
        <View style={styles.header}>
          <View style={styles.userContainer}>
            <View style={styles.userAvatar}>
              {user?.profileImage ? (
                <Image
                  source={user.profileImage}
                  style={styles.userAvatarImage}
                  defaultSource={{ uri: 'https://via.placeholder.com/40' }}
                />
              ) : (
                <Text style={styles.userInitial}>
                  {user?.username?.[0]?.toUpperCase() || 'U'}
                </Text>
              )}
            </View>
            <View style={styles.userTextContainer}>
              <Text style={styles.username}>{user?.username || 'User'}</Text>
              <Text style={styles.greeting}>Let's save your money</Text>
            </View>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('Notifications')}>
            <Icon name="notifications" size={24} color="#fff" />
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
            <ServiceItem title="Withdraw" icon="atm" screen="Withdraw" />
            <ServiceItem title="Cards" icon="credit-card" screen="Cards" />
            <ServiceItem title="Transactions" icon="history" screen="Transactions" />
          </View>
        </View>

        <View style={styles.recipientsContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Latest Recipients</Text>
            <TouchableOpacity onPress={() => navigation.navigate('RecipientScreen')}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={recipients}
            renderItem={RecipientItem}
            keyExtractor={(item) => item.recipientId.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
          />
        </View>

        <View style={styles.transactionsContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Transaction History</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Transactions')}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
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
  blueSection: {
    height: height * 0.2,
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
    overflow: 'hidden',
  },
  userAvatarImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  userInitial: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#3498db',
  },
  userTextContainer: { flexDirection: 'column' },
  username: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
  greeting: { fontSize: 14, color: '#fff', marginTop: 4 },
  balanceCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    elevation: 4,
    position: 'absolute',
    top: height * 0.12,
    left: 16,
    right: 16,
    zIndex: 2,
  },
  balanceTitle: { fontSize: 14, color: '#7f8c8d' },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  balanceAmount: { fontSize: 26, fontWeight: 'bold', color: '#2c3e50', marginVertical: 4 },
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
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  seeAllText: {
    fontSize: 14,
    color: '#3498db',
    fontWeight: '500',
  },
  retryButton: {
    backgroundColor: '#3498db',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
    alignItems: 'center',
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  recipientName: { fontSize: 12, color: '#2c3e50', marginTop: 4 },
  recipientEmail: { fontSize: 10, color: '#7f8c8d', marginTop: 2 },
  transactionsContainer: { padding: 16 },
  transaction: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8 },
  transactionIcon: { fontSize: 20, marginRight: 8 },
  transactionDetails: { flex: 1 },
  transactionDescription: { fontSize: 14, color: '#2c3e50' },
  transactionDate: { fontSize: 10, color: '#7f8c8d' },
  transactionAmount: { fontSize: 14, fontWeight: 'bold' },
});

export default HomeScreen;