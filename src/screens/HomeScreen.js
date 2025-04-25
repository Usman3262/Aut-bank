import React, { useContext, useEffect, useState, useRef } from 'react';
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
  RefreshControl,
  Animated,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useQuery } from 'react-query';
import { AuthContext } from '../context/AuthContext';
import { getUserDetails, getUserTransactions } from '../services/userService';
import initializeWebSocket from '../services/socket';
import { homeScreenTheme } from '../styles/homeScreenTheme';
import * as recipientStorage from '../services/recipientStorage';

const { height } = Dimensions.get('window');

const HomeScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { user } = useContext(AuthContext);
  const [balance, setBalance] = useState(null);
  const [ws, setWs] = useState(null);
  const [recipients, setRecipients] = useState([]);
  const [recipientsLoading, setRecipientsLoading] = useState(true);
  const [recipientsError, setRecipientsError] = useState(null);
  const opacityAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  console.log('HomeScreen route.params:', route.params);
  console.log('HomeScreen user:', user);
  console.log('HomeScreen user keys:', user ? Object.keys(user) : 'undefined');
  console.log('HomeScreen: recipientStorage module:', recipientStorage);


  const { data: userData, isLoading: userLoading, error: userError, refetch: refetchUser } = useQuery(
    ['user', user?.UserID],
    async () => {
      if (!user?.access_token) {
        throw new Error('No access token available');
      }
      const data = await getUserDetails();
      console.log('HomeScreen: getUserDetails response:', data);
      return data;
    },
    {
      enabled: !!user?.access_token,
      retry: false,
      onSuccess: (data) => {
        animateBalance();
        setBalance(data.Balance);
      },
    }
  );
  
  

  const { data: transactionsResponse, isLoading: transactionsLoading, error: transactionsError, refetch: refetchTransactions } = useQuery(
    ['transactions', user?.UserID],
    async () => {
      if (!user?.access_token) {
        throw new Error('No access token available');
      }
      const response = await getUserTransactions({ per_page: 10, sort_by: 'Timestamp', order: 'desc' });
      console.log('HomeScreen: getUserTransactions response:', response);
      return response.data.items; // Access items directly
    },
    {
      enabled: !!user?.access_token,
      retry: false,
    }
  );

  const animateBalance = () => {
    console.log('HomeScreen: Triggering balance animation');
    Animated.parallel([
      Animated.sequence([
        Animated.timing(opacityAnim, {
          toValue: 0.5,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
      ]),
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.05,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  };

  useEffect(() => {
    let webSocket;
    const setupWebSocket = async () => {
      webSocket = await initializeWebSocket(user?.access_token);
      if (webSocket) {
        setWs(webSocket);
        webSocket.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);
            console.log('HomeScreen: WebSocket message:', JSON.stringify(message, null, 2));
            if (message.type === 'balance_update' && message.data?.Balance != null) {
              console.log('HomeScreen: Updating balance from balance_update:', message.data.Balance);
              animateBalance();
              setBalance(message.data.Balance);
            }
            if (message.type === 'deposit_completed' && message.data?.balance != null) {
              console.log('HomeScreen: Updating balance from deposit_completed:', message.data.balance);
              animateBalance();
              setBalance(message.data.balance);
            }
          } catch (error) {
            console.error('HomeScreen: WebSocket message parse error:', error, 'Raw data:', event.data);
          }
        };
      }
    };

    if (user?.access_token) {
      setupWebSocket();
    }

    return () => {
      if (webSocket) {
        webSocket.close();
        console.log('HomeScreen: WebSocket closed');
      }
    };
  }, [user?.access_token]);

   
  
    const id = user?.UserID;
    if (id) {
      console.log("UserID:", id);
      recipientStorage.saveMockRecipients(id);
    } else {
      console.error("Failed to get UserID from getUserDetails response.");
    }
    

  useEffect(() => {
    const loadRecipients = async () => {
      console.log('HomeScreen: Loading recipients for UserID:', user.UserID);
      if (!recipientStorage.setUserId || !recipientStorage.getRecipients) {
        console.error('HomeScreen: recipientStorage module is invalid');
        setRecipientsLoading(false);
        setRecipientsError('Failed to load recipient storage module');
        return;
      }

      try {
        setRecipientsLoading(true);
        setRecipientsError(null);
        await recipientStorage.setUserId(user.UserID);
        const loadedRecipients = await recipientStorage.getRecipients(user.UserID);
        setRecipients(loadedRecipients);
        console.log('HomeScreen: Loaded', loadedRecipients.length, 'recipients');
      } catch (error) {
        console.error('HomeScreen: Error loading recipients:', error.message);
        setRecipientsError(error.message || 'Failed to load recipients');
      } finally {
        setRecipientsLoading(false);
      }
    };
    loadRecipients();
  }, [user.UserID]);

  const onRefresh = async () => {
    if (user?.access_token) {
      await Promise.all([refetchUser(), refetchTransactions()]);
      if (user?.UserID && recipientStorage.getRecipients) {
        console.log('HomeScreen: Refreshing recipients for UserID:', user.UserID);
        try {
          const loadedRecipients = await recipientStorage.getRecipients(user.UserID);
          setRecipients(loadedRecipients);
        } catch (error) {
          setRecipientsError(error.message || 'Failed to refresh recipients');
        }
      }
    }
  };

  const BalanceCard = () => {
    console.log('BalanceCard: Rendering with balance:', balance);
    return (
      <View style={styles.balanceCard}>
        <Text style={styles.balanceTitle}>Balance</Text>
        <View style={styles.balanceRow}>
          <Animated.Text
            style={[
              styles.balanceAmount,
              {
                opacity: opacityAnim,
                transform: [{ scale: scaleAnim }],
              },
            ]}
          >
            {balance != null ? `$${balance.toFixed(2)}` : '...'}
          </Animated.Text>
          <TouchableOpacity onPress={() => navigation.navigate('QRCode')}>
            <Icon name="qr-code" size={24} color={homeScreenTheme.primary} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const ServiceItem = ({ title, icon, screen }) => (
    <TouchableOpacity style={styles.serviceItem} onPress={() => navigation.navigate(screen)}>
      <Icon name={icon} size={24} color={homeScreenTheme.primary} />
      <Text style={styles.serviceText}>{title}</Text>
    </TouchableOpacity>
  );

  const TransactionItem = ({ item }) => {
    const isDeposit = item.TransactionType === 'Deposit';
    const type = isDeposit ? 'credit' : 'debit';
    const transactionId = item.TransactionID;
  
    console.log('HomeScreen: Rendering transaction:', {
      transactionId,
      type,
      Description: item.Description,
      Amount: item.Amount
    });
  
    return (
      <View style={styles.transaction}>
        <Text style={[styles.transactionIcon, { color: type === 'credit' ? homeScreenTheme.credit : homeScreenTheme.debit }]}>
          {type === 'credit' ? '↓' : '↑'}
        </Text>
        <View style={styles.transactionDetails}>
          <Text style={styles.transactionDescription}>
            {item.Description || (isDeposit ? 'Deposit' : 'Transfer')}
          </Text>
          <Text style={styles.transactionDate}>
            {new Date(item.CreatedAt).toLocaleString()}
          </Text>
        </View>
        <Text style={[styles.transactionAmount, { color: type === 'credit' ? homeScreenTheme.credit : homeScreenTheme.debit }]}>
          {type === 'credit' ? '+' : '-'}${item.Amount.toFixed(2)}
        </Text>
      </View>
    );
  };
  

  const RecipientItem = ({ item }) => (
    <TouchableOpacity
      style={styles.recipientItem}
      onPress={() => {
        console.log('HomeScreen: Selected recipient:', item);
      }}
    >
      <View style={styles.recipientAvatar}>
        {item.image ? (
          <Image
            source={{ uri: item.image }}
            style={styles.recipientImage}
            onError={(e) => {
              console.error('HomeScreen: Failed to load recipient image:', item.image, e.nativeEvent.error);
            }}
          />
        ) : (
          <Text style={styles.recipientAvatarText}>{item.name?.[0]?.toUpperCase() || 'R'}</Text>
        )}
      </View>
      <Text style={styles.recipientName} numberOfLines={1}>
        {item.name || 'Unknown'}
      </Text>
      <Text style={styles.recipientUsername} numberOfLines={1}>
        @{item.username || 'N/A'}
      </Text>
    </TouchableOpacity>
  );

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.blueSection}>
          <Text style={styles.username}>Please log in to continue</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => navigation.reset({ index: 0, routes: [{ name: 'Login' }] })}
          >
            <Text style={styles.retryButtonText}>Go to Login</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (userLoading && balance == null) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color={homeScreenTheme.primary} style={{ flex: 1 }} />
      </SafeAreaView>
    );
  }

  if (userError) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.blueSection}>
          <Text style={styles.username}>Error loading data</Text>
          <Text style={styles.errorText}>{userError.message || 'Failed to load data'}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => refetchUser()}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => navigation.reset({ index: 0, routes: [{ name: 'Login' }] })}
          >
            <Text style={styles.retryButtonText}>Back to Login</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={userLoading || transactionsLoading} onRefresh={onRefresh} />}
      >
        <View style={styles.blueSection}>
          <View style={styles.header}>
            <View style={styles.userContainer}>
              <View style={styles.userAvatar}>
                <Text style={styles.avatarText}>{userData?.FirstName?.[0]?.toUpperCase() || 'U'}</Text>
              </View>
              <View style={styles.userTextContainer}>
                <Text style={styles.username}>{userData?.FirstName || 'User'}</Text>
                <Text style={styles.greeting}>Let's save your money</Text>
              </View>
            </View>
            <TouchableOpacity onPress={() => navigation.navigate('Notifications')}>
              <Icon name="notifications" size={24} color={homeScreenTheme.notificationIcon} />
            </TouchableOpacity>
          </View>
          <BalanceCard />
        </View>

        <View style={styles.whiteSection}>
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
              <Text style={styles.sectionTitle}>Recipients</Text>
              <TouchableOpacity onPress={() => navigation.navigate('RecipientScreen')}>
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            </View>
            {recipientsLoading ? (
              <ActivityIndicator size="small" color={homeScreenTheme.primary} />
            ) : recipientsError ? (
              <View>
                <Text style={styles.errorText}>{recipientsError}</Text>
                <TouchableOpacity
                  onPress={async () => {
                    if (!recipientStorage.setUserId || !recipientStorage.getRecipients) {
                      setRecipientsError('Failed to load recipient storage module');
                      return;
                    }
                    if (user?.UserID) {
                      console.log('HomeScreen: Retrying recipients load for UserID:', user.UserID);
                      try {
                        setRecipientsLoading(true);
                        setRecipientsError(null);
                        await recipientStorage.setUserId(user.UserID);
                        const loadedRecipients = await recipientStorage.getRecipients(user.UserID);
                        setRecipients(loadedRecipients);
                      } catch (error) {
                        setRecipientsError(error.message || 'Failed to load recipients');
                      } finally {
                        setRecipientsLoading(false);
                      }
                    } else {
                      setRecipientsError('User not authenticated');
                    }
                  }}
                >
                  <Text style={styles.seeAllText}>Retry</Text>
                </TouchableOpacity>
              </View>
            ) : recipients.length === 0 ? (
              <Text style={styles.transactionDescription}>No recipients available</Text>
            ) : (
              <FlatList
                data={recipients}
                horizontal
                renderItem={RecipientItem}
                keyExtractor={(item, index) =>
  item?.recipientId != null ? item.recipientId.toString() : index.toString()
}

                showsHorizontalScrollIndicator={false}
              />
            )}
          </View>

          <View style={styles.transactionsContainer}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Transaction History</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Transactions')}>
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            </View>
            {transactionsLoading ? (
              <ActivityIndicator size="small" color={homeScreenTheme.primary} />
            ) : transactionsError ? (
              <View>
                <Text style={styles.transactionDescription}>Failed to load transactions: {transactionsError.message}</Text>
                <TouchableOpacity onPress={() => refetchTransactions()}>
                  <Text style={styles.seeAllText}>Retry</Text>
                </TouchableOpacity>
              </View>
            ) : !transactionsResponse || transactionsResponse.length === 0 ? (
              <Text style={styles.transactionDescription}>No transactions available</Text>
            ) : (
              <FlatList
                data={transactionsResponse}
                renderItem={TransactionItem}
                keyExtractor={(item, index) => {
  const id = item?.DepositID ?? item?.TransferID;
  return id != null ? id.toString() : index.toString();
}}

                scrollEnabled={false}
              />
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: homeScreenTheme.background },
  scrollContent: { flexGrow: 1, backgroundColor: homeScreenTheme.background },
  blueSection: {
    height: height * 0.2,
    backgroundColor: homeScreenTheme.primary,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    padding: 16,
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
    backgroundColor: homeScreenTheme.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: homeScreenTheme.black,
  },
  userTextContainer: { flexDirection: 'column' },
  username: { fontSize: 18, fontWeight: 'bold', color: homeScreenTheme.white },
  greeting: { fontSize: 14, color: homeScreenTheme.white, marginTop: 4 },
  balanceCard: {
    backgroundColor: homeScreenTheme.white,
    borderRadius: 12,
    padding: 16,
    elevation: 4,
    position: 'absolute',
    top: height * 0.12,
    left: 16,
    right: 16,
    zIndex: 2,
  },
  balanceTitle: { fontSize: 14, color: homeScreenTheme.secondary },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  balanceAmount: { fontSize: 26, fontWeight: 'bold', color: homeScreenTheme.black, marginVertical: 4 },
  whiteSection: {
    paddingTop: height * 0.08,
    backgroundColor: homeScreenTheme.background,
  },
  servicesContainer: { paddingHorizontal: 16 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: homeScreenTheme.black, marginBottom: 12 },
  servicesRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  serviceItem: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
    backgroundColor: homeScreenTheme.serviceBackground,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  serviceText: { fontSize: 12, color: homeScreenTheme.black, marginTop: 4 },
  recipientsContainer: { padding: 16 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  seeAllText: {
    fontSize: 14,
    color: homeScreenTheme.link,
    fontWeight: '500',
  },
  recipientItem: {
    alignItems: 'center',
    marginRight: 16,
    width: 80,
  },
  recipientAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: homeScreenTheme.serviceBackground,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  recipientImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  recipientAvatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: homeScreenTheme.black,
  },
  recipientName: {
    fontSize: 12,
    color: homeScreenTheme.black,
    marginTop: 4,
    textAlign: 'center',
  },
  recipientUsername: {
    fontSize: 10,
    color: homeScreenTheme.secondary,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: homeScreenTheme.retryButton,
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
    alignItems: 'center',
  },
  retryButtonText: {
    color: homeScreenTheme.retryButtonText,
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorText: {
    fontSize: 14,
    color: homeScreenTheme.debit,
    marginVertical: 8,
    textAlign: 'center',
  },
  transactionsContainer: { padding: 16 },
  transaction: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8 },
  transactionIcon: { fontSize: 20, marginRight: 8 },
  transactionDetails: { flex: 1 },
  transactionDescription: { fontSize: 14, color: homeScreenTheme.black },
  transactionDate: { fontSize: 10, color: homeScreenTheme.secondary },
  transactionAmount: { fontSize: 14, fontWeight: 'bold' },
});

export default HomeScreen;