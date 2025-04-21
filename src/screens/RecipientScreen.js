import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { View, Text, FlatList, StyleSheet, Image, TouchableOpacity, TextInput } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as recipientStorage from '../services/recipientStorage';
import globalStyles from '../styles/globalStyles';

const { COLORS } = globalStyles;

const RecipientScreen = ({ navigation }) => {
  const [recipients, setRecipients] = useState([]);
  const [recipientsLoading, setRecipientsLoading] = useState(false);
  const [recipientsError, setRecipientsError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortByNameAsc, setSortByNameAsc] = useState(true); // true for ascending, false for descending

  useEffect(() => {
    const loadRecipients = async () => {
      console.log('RecipientScreen: Loading recipients for UserID:', 6);
      if (!recipientStorage.setUserId || !recipientStorage.getRecipients) {
        console.error('RecipientScreen: recipientStorage module is invalid');
        setRecipientsLoading(false);
        setRecipientsError('Failed to load recipient storage module');
        return;
      }

      try {
        setRecipientsLoading(true);
        setRecipientsError(null);
        await recipientStorage.setUserId(6);
        const loadedRecipients = await recipientStorage.getRecipients(6);
        setRecipients(loadedRecipients);
        console.log('RecipientScreen: Loaded', loadedRecipients.length, 'recipients');

        const data = await AsyncStorage.getItem('@recipients:6');
        console.log('RecipientScreen: Verified stored data:', data ? JSON.parse(data).length : 0, 'recipients');
      } catch (error) {
        console.error('RecipientScreen: Error loading recipients:', error.message);
        setRecipientsError(error.message || 'Failed to load recipients');
      } finally {
        setRecipientsLoading(false);
      }
    };
    loadRecipients();
  }, []);

  // Filter and sort recipients based on search query and sort order
  const filteredRecipients = useMemo(() => {
    let result = [...recipients];

    // Filter by search query
    if (searchQuery) {
      result = result.filter((item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sort by name
    result.sort((a, b) => {
      const nameA = a.name.toLowerCase();
      const nameB = b.name.toLowerCase();
      if (sortByNameAsc) {
        return nameA < nameB ? -1 : nameA > nameB ? 1 : 0;
      } else {
        return nameA > nameB ? -1 : nameA < nameB ? 1 : 0;
      }
    });

    return result;
  }, [recipients, searchQuery, sortByNameAsc]);

  const renderRecipient = useCallback(
    ({ item }) => {
      return (
        <TouchableOpacity
          style={styles.recipientItem}
          onPress={() => navigation.navigate('SendScreen', { recipient: item })}
        >
          <Image
            source={{ uri: item.image }}
            style={styles.recipientImage}
            onError={(error) => console.error(`RecipientScreen: Error loading image for ${item.name}:`, error.nativeEvent.error)}
          />
          <View style={styles.recipientTextContainer}>
            <Text style={styles.recipientText}>{item.name}</Text>
            <Text style={styles.recipientSubText}>{item.email || item.cnic || 'No contact info'}</Text>
          </View>
          <Icon name="send" size={24} color={COLORS.secondary} style={styles.navIcon} />
        </TouchableOpacity>
      );
    },
    [navigation]
  );

  const renderSeparator = () => <View style={styles.separator} />;

  const handleFilterPress = () => {
    setSortByNameAsc((prev) => !prev);
    console.log('Filter icon pressed, sorting:', sortByNameAsc ? 'Descending' : 'Ascending');
  };

  return (
    <View style={styles.container}>
      {/* Send Money Section */}
      <View style={styles.sendMoneyContainer}>
        <Text style={styles.sendMoneyHeading}>Send Money Now</Text>
        <Text style={styles.sendMoneySubtext}>Money Transfer to your Favourites</Text>
        <TouchableOpacity
          style={styles.sendButton}
          onPress={() => navigation.navigate('SendScreen')}
        >
          <Text style={styles.sendButtonText}>SEND NOW</Text>
        </TouchableOpacity>
      </View>

      {/* Find Favourites Section */}
      <Text style={styles.findFavouritesHeading}>Find your Favourites</Text>
      <View style={styles.searchBarContainer}>
        <Icon name="search" size={24} color={COLORS.placeholder} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Find Favourites"
          placeholderTextColor={COLORS.placeholder}
          value={searchQuery}
          onChangeText={(text) => setSearchQuery(text)}
        />
        <TouchableOpacity
          style={styles.filterIconContainer}
          onPress={handleFilterPress}
        >
          <Icon
            name="sort-by-alpha"
            size={24}
            color={COLORS.text}
            style={{ transform: [{ rotate: sortByNameAsc ? '0deg' : '180deg' }] }} // Rotate icon to indicate sort direction
          />
        </TouchableOpacity>
      </View>

      {/* Recipients List */}
      {recipientsLoading && <Text style={styles.loadingText}>Loading recipients...</Text>}
      {recipientsError && <Text style={styles.errorText}>Error: {recipientsError}</Text>}
      {filteredRecipients.length > 0 ? (
        <FlatList
          data={filteredRecipients}
          renderItem={renderRecipient}
          keyExtractor={(item) => `recipient-${item.recipientId}`}
          style={styles.list}
          ItemSeparatorComponent={renderSeparator}
          initialNumToRender={15}
          maxToRenderPerBatch={15}
          getItemLayout={(data, index) => ({
            length: 70,
            offset: 70 * index,
            index,
          })}
        />
      ) : (
        !recipientsLoading && !recipientsError && <Text style={styles.noRecipientsText}>No recipients found.</Text>
      )}

      {/* Debug Button */}
      <TouchableOpacity
        style={styles.verifyButton}
        onPress={async () => {
          const data = await AsyncStorage.getItem('@recipients:6');
          console.log('RecipientScreen: Manual verification:', data ? JSON.parse(data).length : 0, 'recipients');
        }}
      >
        <Text style={styles.verifyButtonText}>Verify Storage</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  sendMoneyContainer: {
    marginBottom: 20,
  },
  sendMoneyHeading: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  sendMoneySubtext: {
    fontSize: 16,
    color: COLORS.placeholder,
    marginBottom: 20,
  },
  sendButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    marginHorizontal: '5%',
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
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
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
    width: '100%',
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
    color: COLORS.placeholder,
  },
  navIcon: {
    marginLeft: 12,
  },
  separator: {
    height: 1,
    backgroundColor: COLORS.gray,
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
    marginVertical: 20,
  },
  noRecipientsText: {
    fontSize: 16,
    color: COLORS.text,
    textAlign: 'center',
    marginVertical: 20,
  },
  verifyButton: {
    backgroundColor: COLORS.secondary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 10,
  },
  verifyButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.white,
  },
});

export default RecipientScreen;