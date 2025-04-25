import React, { useState, useContext, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Animated,
  Dimensions,
} from 'react-native';
import { useMutation } from 'react-query';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthContext } from '../context/AuthContext';
import * as recipientStorage from '../services/recipientStorage';
import { createTransfer } from '../services/transferService';
import globalStyles from '../styles/globalStyles';

const { COLORS } = globalStyles;
const { width } = Dimensions.get('window');

const SendScreen = ({ navigation }) => {
  const { user } = useContext(AuthContext);
  const [screenState, setScreenState] = useState('recipient'); // 'recipient', 'amount', 'recipientInput', 'verify'
  const [selectedRecipient, setSelectedRecipient] = useState(null);
  const [amount, setAmount] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [recipients, setRecipients] = useState([]);
  const [recipientsLoading, setRecipientsLoading] = useState(false);
  const [recipientsError, setRecipientsError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortByNameAsc, setSortByNameAsc] = useState(true);
  const [manualRecipient, setManualRecipient] = useState('');
  const [recipientType, setRecipientType] = useState('email'); // 'email', 'username', 'cnic'
  const [description, setDescription] = useState(''); // New state for description

  // Animation setup using React Native Animated
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const animatedStyle = {
    opacity: fadeAnim,
    transform: [{ translateX: slideAnim }],
  };

  const transitionToScreen = (newScreen) => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setScreenState(newScreen);
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    });
    Animated.timing(slideAnim, {
      toValue: -width,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  // API mutation using createTransfer
  const mutation = useMutation(
    async (transferData) => {
      const { identifier, amount, description } = transferData;
      const response = await createTransfer(identifier, amount, description);
      return response;
    },
    {
      onSuccess: (data) => {
        alert('Transfer initiated successfully!');
        navigation.goBack();
      },
      onError: (error) => {
        setErrorMessage(error.message || 'Failed to initiate transfer');
      },
    }
  );

  // RecipientScreen Logic
  useEffect(() => {
    const loadRecipients = async () => {
      if (!user?.UserID) {
        setRecipientsError('User not authenticated');
        return;
      }
      if (!recipientStorage.setUserId || !recipientStorage.getRecipients) {
        setRecipientsError('Failed to load recipient storage module');
        return;
      }
      try {
        setRecipientsLoading(true);
        setRecipientsError(null);
        await recipientStorage.setUserId(user.UserID);
        const loadedRecipients = await recipientStorage.getRecipients(user.UserID);
        const validRecipients = loadedRecipients?.filter((item) => item && typeof item === 'object' && item.name) || [];
        setRecipients(validRecipients);
      } catch (error) {
        setRecipientsError(error.message || 'Failed to load recipients');
      } finally {
        setRecipientsLoading(false);
      }
    };
    if (screenState === 'recipient') {
      loadRecipients();
    }
  }, [screenState, user?.UserID]);

  const filteredRecipients = useMemo(() => {
    let result = [...recipients];
    if (searchQuery) {
      result = result.filter((item) => {
        if (!item || !item.name) return false;
        return item.name.toLowerCase().includes(searchQuery.toLowerCase());
      });
    }
    result.sort((a, b) => {
      const nameA = a?.name?.toLowerCase() || '';
      const nameB = b?.name?.toLowerCase() || '';
      return sortByNameAsc ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
    });
    return result;
  }, [recipients, searchQuery, sortByNameAsc]);

  const renderRecipient = useCallback(
    ({ item }) => {
      if (!item || !item.name) return null;
      return (
        <TouchableOpacity
          style={styles.recipientItem}
          onPress={() => {
            setSelectedRecipient(item);
            transitionToScreen('amount');
          }}
        >
          {item.image ? (
            <Image
              source={{ uri: item.image }}
              style={styles.recipientImage}
              onError={(e) => console.error(`Error loading image for ${item.name}:`, e.nativeEvent.error)}
            />
          ) : (
            <View style={styles.recipientAvatar}>
              <Text style={styles.recipientAvatarText}>{item.name?.[0]?.toUpperCase() || 'R'}</Text>
            </View>
          )}
          <View style={styles.recipientTextContainer}>
            <Text style={styles.recipientText}>{item.name}</Text>
            <Text style={styles.recipientSubText}>{item.email || item.cnic || item.username || 'No contact info'}</Text>
          </View>
          <Icon name="send" size={24} color={COLORS.secondary} style={styles.navIcon} />
        </TouchableOpacity>
      );
    },
    []
  );

  const handleFilterPress = () => setSortByNameAsc((prev) => !prev);

  // Amount Input Screen Logic
  const handleKeyPress = (key) => {
    if (key === 'delete') {
      setAmount((prev) => prev.slice(0, -1));
    } else if (key === '+') {
      // Ignore for now
    } else {
      setAmount((prev) => prev + key);
    }
  };

  const handleAmountSubmit = () => {
    const parsedAmount = parseFloat(amount);
    if (!parsedAmount || parsedAmount <= 0) {
      setErrorMessage('Please enter a valid amount');
      return;
    }
    transitionToScreen('recipientInput');
  };

  // Recipient Input Screen Logic
  const handleRecipientSubmit = () => {
    if (!manualRecipient) {
      setErrorMessage('Please enter a recipient');
      return;
    }
    setSelectedRecipient({
      recipientId: `manual-${Date.now()}`,
      name: manualRecipient,
      [recipientType]: manualRecipient,
    });
    transitionToScreen('verify');
  };

  // Verification Screen Logic
  const handleConfirmSend = async () => {
    if (!selectedRecipient) {
      setErrorMessage('No recipient selected');
      return;
    }
    setErrorMessage('');
    try {
      const identifier = {
        email: selectedRecipient.email || undefined,
        cnic: selectedRecipient.cnic || undefined,
        username: selectedRecipient.username || undefined,
      };
      const transferData = {
        identifier,
        amount: parseFloat(amount),
        description: description || undefined,
      };
      mutation.mutate(transferData);
    } catch (error) {
      setErrorMessage(error.message || 'Invalid input');
    }
  };

  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Please log in to send money</Text>
        <TouchableOpacity
          style={styles.sendButton}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.sendButtonText}>Go to Login</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior="padding">
      <Animated.View style={[styles.animatedContainer, animatedStyle]}>
        {screenState === 'recipient' && (
          <View style={styles.recipientContainer}>
            <View style={styles.header}>
              <TouchableOpacity onPress={() => navigation.goBack()}>
                <Icon name="arrow-back" size={28} color={COLORS.text} />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Send Money</Text>
            </View>
            <View style={styles.sendMoneyContainer}>
              <Text style={styles.sendMoneyHeading}>Send Money Now</Text>
              <Text style={styles.sendMoneySubtext}>Transfer to Your Favorites</Text>
              <TouchableOpacity
                style={styles.sendButton}
                onPress={() => {
                  setSelectedRecipient(null);
                  transitionToScreen('amount');
                }}
              >
                <Text style={styles.sendButtonText}>SEND NOW</Text>
              </TouchableOpacity>
            </View>
            {errorMessage && screenState === 'recipient' && (
              <Text style={styles.errorText}>{errorMessage}</Text>
            )}
            <Text style={styles.findFavouritesHeading}>Find Your Favorites</Text>
            <View style={styles.searchBarContainer}>
              <Icon name="search" size={24} color={COLORS.gray} style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Find Favorites"
                placeholderTextColor={COLORS.grey}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              <TouchableOpacity style={styles.filterIconContainer} onPress={handleFilterPress}>
                <Icon
                  name="sort-by-alpha"
                  size={24}
                  color={COLORS.text}
                  style={{ transform: [{ rotate: sortByNameAsc ? '0deg' : '180deg' }] }}
                />
              </TouchableOpacity>
            </View>
            {recipientsLoading && <Text style={styles.loadingText}>Loading recipients...</Text>}
            {recipientsError && <Text style={styles.errorText}>{recipientsError}</Text>}
            {filteredRecipients.length > 0 ? (
              <FlatList
                data={filteredRecipients}
                renderItem={renderRecipient}
                keyExtractor={(item) => `recipient-${item?.recipientId || Math.random().toString()}`}
                style={styles.list}
                ItemSeparatorComponent={() => <View style={styles.separator} />}
              />
            ) : (
              !recipientsLoading &&
              !recipientsError && <Text style={styles.noRecipientsText}>No recipients found.</Text>
            )}
          </View>
        )}

        {screenState === 'amount' && (
          <View style={styles.amountContainer}>
            <View style={styles.header}>
              <TouchableOpacity onPress={() => transitionToScreen('recipient')}>
                <Icon name="arrow-back" size={28} color={COLORS.text} />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Set Amount</Text>
            </View>
            <View style={styles.amountDisplayContainer}>
              <Text style={styles.amountLabel}>How much would you like to send?</Text>
              <Text style={styles.amountText}>{amount ? `$${amount}` : '$0'}</Text>
            </View>
            <View style={styles.keypadContainer}>
              {['1', '2', '3', '4', '5', '6', '7', '8', '9', '+', '0', 'delete'].map((key) => (
                <TouchableOpacity
                  key={key}
                  style={styles.keypadButton}
                  onPress={() => handleKeyPress(key)}
                >
                  <Text style={styles.keypadText}>
                    {key === 'delete' ? <Icon name="backspace" size={24} color={COLORS.text} /> : key}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            {errorMessage && screenState === 'amount' && (
              <Text style={styles.errorText}>{errorMessage}</Text>
            )}
            <TouchableOpacity
              style={[styles.sendButton, styles.sendNowButton]}
              onPress={handleAmountSubmit}
            >
              <Text style={styles.sendButtonText}>NEXT</Text>
            </TouchableOpacity>
          </View>
        )}

        {screenState === 'recipientInput' && (
          <View style={styles.recipientInputContainer}>
            <View style={styles.header}>
              <TouchableOpacity onPress={() => transitionToScreen('amount')}>
                <Icon name="arrow-back" size={28} color={COLORS.text} />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Enter Recipient</Text>
            </View>
            <Text style={styles.sectionTitle}>Enter Recipient Details</Text>
            <View style={styles.recipientTypeContainer}>
              {['email', 'username', 'cnic'].map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.recipientTypeButton,
                    recipientType === type && styles.recipientTypeButtonActive,
                  ]}
                  onPress={() => setRecipientType(type)}
                >
                  <Text style={styles.recipientTypeText}>{type.toUpperCase()}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TextInput
              style={styles.manualInput}
              placeholder={`Enter recipient ${recipientType}`}
              value={manualRecipient}
              onChangeText={setManualRecipient}
              placeholderTextColor={COLORS.black}
              autoCapitalize={recipientType === 'email' ? 'none' : 'words'}
            />
            <TextInput
              style={styles.manualInput}
              placeholder="Description (optional)"
              value={description}
              onChangeText={setDescription}
              placeholderTextColor={COLORS.black}
            />
            {errorMessage && screenState === 'recipientInput' && (
              <Text style={styles.errorText}>{errorMessage}</Text>
            )}
            <TouchableOpacity
              style={styles.sendButton}
              onPress={handleRecipientSubmit}
            >
              <Text style={styles.sendButtonText}>NEXT</Text>
            </TouchableOpacity>
          </View>
        )}

        {screenState === 'verify' && (
          <View style={styles.verifyContainer}>
            <View style={styles.header}>
              <TouchableOpacity onPress={() => transitionToScreen('recipientInput')}>
                <Icon name="arrow-back" size={28} color={COLORS.text} />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Verify Transfer</Text>
            </View>
            {selectedRecipient ? (
              <>
                <Text style={styles.verifyTitle}>Please Confirm Details</Text>
                <View style={styles.verifyDetail}>
                  <Text style={styles.verifyLabel}>Recipient:</Text>
                  <Text style={styles.verifyValue}>{selectedRecipient.name || 'Unknown'}</Text>
                </View>
                <View style={styles.verifyDetail}>
                  <Text style={styles.verifyLabel}>Contact:</Text>
                  <Text style={styles.verifyValue}>
                    {selectedRecipient.email || selectedRecipient.cnic || selectedRecipient.username || 'N/A'}
                  </Text>
                </View>
                <View style={styles.verifyDetail}>
                  <Text style={styles.verifyLabel}>Amount:</Text>
                  <Text style={styles.verifyValue}>${amount}</Text>
                </View>
                {description && (
                  <View style={styles.verifyDetail}>
                    <Text style={styles.verifyLabel}>Description:</Text>
                    <Text style={styles.verifyValue}>{description}</Text>
                  </View>
                )}
                {errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}
                <TouchableOpacity
                  style={[styles.sendButton, mutation.isLoading && { opacity: 0.7 }]}
                  onPress={handleConfirmSend}
                  disabled={mutation.isLoading}
                >
                  <Text style={styles.sendButtonText}>
                    {mutation.isLoading ? 'Sending...' : 'Confirm & Send'}
                  </Text>
                </TouchableOpacity>
              </>
            ) : (
              <View style={styles.verifyErrorContainer}>
                <Text style={styles.errorText}>No recipient selected. Please go back and enter a recipient.</Text>
                <TouchableOpacity
                  style={styles.sendButton}
                  onPress={() => transitionToScreen('recipientInput')}
                >
                  <Text style={styles.sendButtonText}>Go Back</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      </Animated.View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  animatedContainer: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: COLORS.white,
    elevation: 4,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginLeft: 16,
  },
  // Recipient Screen Styles
  recipientContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  sendMoneyContainer: {
    marginBottom: 20,
    alignItems: 'center',
  },
  sendMoneyHeading: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 8,
  },
  sendMoneySubtext: {
    fontSize: 16,
    color: COLORS.grey,
    marginBottom: 20,
  },
  sendButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 25,
    alignItems: 'center',
    elevation: 5,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  sendButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  findFavouritesHeading: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 12,
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.gray,
    borderRadius: 20,
    paddingHorizontal: 10,
    marginBottom: 20,
    elevation: 3,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: COLORS.text,
    paddingVertical: 8,
  },
  filterIconContainer: {
    padding: 8,
  },
  list: {
    flex: 1,
  },
  recipientItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  recipientImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  recipientAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.gray,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  recipientAvatarText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  recipientTextContainer: {
    flex: 1,
  },
  recipientText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  recipientSubText: {
    fontSize: 14,
    color: COLORS.grey,
  },
  navIcon: {
    marginLeft: 12,
  },
  separator: {
    height: 1,
    backgroundColor: COLORS.white,
    marginVertical: 4,
  },
  loadingText: {
    fontSize: 16,
    color: COLORS.text,
    textAlign: 'center',
    marginVertical: 20,
  },
  errorText: {
    fontSize: 16,
    color: COLORS.danger,
    textAlign: 'center',
    marginVertical: 10,
  },
  noRecipientsText: {
    fontSize: 16,
    color: COLORS.text,
    textAlign: 'center',
    marginVertical: 20,
  },
  // Amount Input Screen Styles
  amountContainer: {
    flex: 1,
    paddingHorizontal: 16,
    backgroundColor: COLORS.white,
  },
  amountDisplayContainer: {
    backgroundColor: COLORS.primary,
    borderRadius: 15,
    padding: 20,
    marginVertical: 30,
    alignItems: 'center',
    elevation: 5,
  },
  amountLabel: {
    fontSize: 18,
    color: COLORS.white,
    marginBottom: 10,
  },
  amountText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  keypadContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  keypadButton: {
    width: width / 3 - 20,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.gray,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 5,
    elevation: 2,
  },
  keypadText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  sendNowButton: {
    width: '100%',
    paddingVertical: 15,
  },
  // Recipient Input Screen Styles
  recipientInputContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 20,
    backgroundColor: COLORS.white,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 16,
  },
  recipientTypeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  recipientTypeButton: {
    flex: 1,
    padding: 10,
    borderWidth: 1,
    borderColor: COLORS.gray,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  recipientTypeButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  recipientTypeText: {
    color: COLORS.text,
    fontSize: 14,
  },
  manualInput: {
    borderWidth: 1,
    borderColor: COLORS.gray,
    borderRadius: 8,
    padding: 10,
    marginBottom: 16,
    fontSize: 16,
    color: COLORS.text,
  },
  // Verification Screen Styles
  verifyContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 20,
    backgroundColor: COLORS.white,
  },
  verifyErrorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  verifyTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.text,
    marginVertical: 20,
    textAlign: 'center',
  },
  verifyDetail: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray,
  },
  verifyLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  verifyValue: {
    fontSize: 16,
    color: COLORS.text,
  },
});

export default SendScreen;