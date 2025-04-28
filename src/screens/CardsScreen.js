import React, { useContext, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
  Modal,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { AuthContext } from '../context/AuthContext';
import { getCards, createCard, updateCard, deleteCard } from '../services/cardService';
import globalStyles from '../styles/globalStyles';
import { homeScreenTheme } from '../styles/homeScreenTheme';

const CardsScreen = () => {
  const { user } = useContext(AuthContext);
  const queryClient = useQueryClient();

  // State for pagination and sorting
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [sortBy, setSortBy] = useState('CardID');
  const [order, setOrder] = useState('asc');
  const [sortModalVisible, setSortModalVisible] = useState(false);
  const [orderModalVisible, setOrderModalVisible] = useState(false);
  const [modalType, setModalType] = useState(''); // 'sortBy' or 'order'

  // State for modals and forms
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [updateModalVisible, setUpdateModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [selectedCardId, setSelectedCardId] = useState(null);
  const [newCard, setNewCard] = useState({ CardNumber: '', Pin: '', ExpirationDate: '' });
  const [displayExpirationDate, setDisplayExpirationDate] = useState(''); // For formatted date display
  const [updateCardData, setUpdateCardData] = useState({ Pin: '', Status: '' });
  const [error, setError] = useState(null);

  // Function to format expiration date
  const formatExpirationDate = (text) => {
    // Remove non-digits
    const cleaned = text.replace(/\D/g, '');
    // Format as YYYY-MM-DD
    if (cleaned.length >= 6) {
      return `${cleaned.slice(0, 4)}-${cleaned.slice(4, 6)}-${cleaned.slice(6, 8)}`;
    } else if (cleaned.length >= 4) {
      return `${cleaned.slice(0, 4)}-${cleaned.slice(4, 6)}`;
    }
    return cleaned;
  };

  const handleExpirationDateChange = (text) => {
    // Remove non-digits for raw value
    const rawDate = text.replace(/\D/g, '').slice(0, 8); // Limit to 8 digits (YYYYMMDD)
    // Format as YYYY-MM-DD for submission
    let formattedForSubmission = rawDate;
    if (rawDate.length >= 6) {
      formattedForSubmission = `${rawDate.slice(0, 4)}-${rawDate.slice(4, 6)}-${rawDate.slice(6, 8)}`;
    } else if (rawDate.length >= 4) {
      formattedForSubmission = `${rawDate.slice(0, 4)}-${rawDate.slice(4, 6)}`;
    }
    setNewCard({ ...newCard, ExpirationDate: formattedForSubmission });
    // Format for display
    const formatted = formatExpirationDate(rawDate);
    setDisplayExpirationDate(formatted);
  };

  // Fetch cards
  const { data, isLoading, error: fetchError, refetch } = useQuery(
    ['cards', page, perPage, sortBy, order],
    () => getCards({ page, per_page: perPage, sort_by: sortBy, order }),
    { enabled: !!user?.access_token }
  );

  // Mutations
  const createMutation = useMutation(createCard, {
    onSuccess: () => {
      queryClient.invalidateQueries('cards');
      setAddModalVisible(false);
      setNewCard({ CardNumber: '', Pin: '', ExpirationDate: '' });
      setDisplayExpirationDate(''); // Reset display
    },
    onError: (error) => setError(error.message),
  });

  const updateMutation = useMutation(({ card_id, updates }) => updateCard(card_id, updates), {
    onSuccess: () => {
      queryClient.invalidateQueries('cards');
      setUpdateModalVisible(false);
      setUpdateCardData({ Pin: '', Status: '' });
    },
    onError: (error) => setError(error.message),
  });

  const deleteMutation = useMutation(deleteCard, {
    onSuccess: () => {
      queryClient.invalidateQueries('cards');
      setDeleteModalVisible(false);
    },
    onError: (error) => setError(error.message),
  });

  const handleAddCard = () => {
    setError(null);
    createMutation.mutate(newCard);
  };

  const handleUpdateCard = () => {
    setError(null);
    updateMutation.mutate({ card_id: selectedCardId, updates: updateCardData });
  };

  const handleDeleteCard = () => {
    setError(null);
    deleteMutation.mutate(selectedCardId);
  };

  const openUpdateModal = (card) => {
    setSelectedCardId(card.CardID);
    setUpdateCardData({ Pin: '', Status: card.Status || '' });
    setUpdateModalVisible(true);
  };

  const openDeleteModal = (cardId) => {
    setSelectedCardId(cardId);
    setDeleteModalVisible(true);
  };

  const openSortModal = (type) => {
    setModalType(type);
    if (type === 'sortBy') setSortModalVisible(true);
    else setOrderModalVisible(true);
  };

  const handleSortSelect = (value) => {
    setSortBy(value);
    setSortModalVisible(false);
  };

  const handleOrderSelect = (value) => {
    setOrder(value);
    setOrderModalVisible(false);
  };

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={globalStyles.textXLargeBlack}>Please log in to view your cards</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Cards</Text>
        <TouchableOpacity onPress={() => setAddModalVisible(true)}>
          <Icon name="add" size={24} color={homeScreenTheme.white} />
        </TouchableOpacity>
      </View>

      <View style={styles.filters}>
        <View style={styles.filterItem}>
          <Text style={styles.filterLabel}>Sort By:</Text>
          <TouchableOpacity
            style={styles.dropdown}
            onPress={() => openSortModal('sortBy')}
          >
            <Text style={styles.dropdownText}>{sortBy}</Text>
            <Icon name="arrow-drop-down" size={20} color={homeScreenTheme.black} />
          </TouchableOpacity>
        </View>
        <View style={styles.filterItem}>
          <Text style={styles.filterLabel}>Order:</Text>
          <TouchableOpacity
            style={styles.dropdown}
            onPress={() => openSortModal('order')}
          >
            <Text style={styles.dropdownText}>{order === 'asc' ? 'Ascending' : 'Descending'}</Text>
            <Icon name="arrow-drop-down" size={20} color={homeScreenTheme.black} />
          </TouchableOpacity>
        </View>
      </View>

      {isLoading ? (
        <ActivityIndicator size="large" color={homeScreenTheme.primary} style={styles.loader} />
      ) : fetchError ? (
        <Text style={styles.errorText}>{fetchError.message}</Text>
      ) : !data?.data?.items || data.data.items.length === 0 ? (
        <Text style={styles.noDataText}>No cards available</Text>
      ) : (
        <>
          <FlatList
            data={data.data.items}
            keyExtractor={(item) => item.CardID.toString()}
            renderItem={({ item }) => (
              <View style={styles.cardItem}>
                <View style={styles.cardDetails}>
                  <Text style={styles.cardText}>Card: {item.CardNumber}</Text>
                  <Text style={styles.cardSubText}>Expires: {item.ExpirationDate}</Text>
                  <Text style={styles.cardSubText}>Status: {item.Status}</Text>
                </View>
                <View style={styles.cardActions}>
                  <TouchableOpacity onPress={() => openUpdateModal(item)}>
                    <Icon name="edit" size={20} color={homeScreenTheme.primary} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => openDeleteModal(item.CardID)} style={styles.actionButton}>
                    <Icon name="delete" size={20} color={homeScreenTheme.debit} />
                  </TouchableOpacity>
                </View>
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

      {/* Sort By Modal */}
      <Modal transparent visible={sortModalVisible} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Sort By</Text>
            {['CardID', 'ExpirationDate', 'Status', 'CardNumber'].map((option) => (
              <TouchableOpacity
                key={option}
                style={styles.dropdownOption}
                onPress={() => handleSortSelect(option)}
              >
                <Text style={styles.dropdownOptionText}>{option}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.modalButtonCancel}
              onPress={() => setSortModalVisible(false)}
            >
              <Text style={styles.modalButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Order Modal */}
      <Modal transparent visible={orderModalVisible} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Order</Text>
            {['asc', 'desc'].map((option) => (
              <TouchableOpacity
                key={option}
                style={styles.dropdownOption}
                onPress={() => handleOrderSelect(option)}
              >
                <Text style={styles.dropdownOptionText}>{option === 'asc' ? 'Ascending' : 'Descending'}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.modalButtonCancel}
              onPress={() => setOrderModalVisible(false)}
            >
              <Text style={styles.modalButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Add Card Modal */}
      <Modal transparent visible={addModalVisible} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add New Card</Text>
            <TextInput
              style={styles.input}
              placeholder="Card Number (16 digits)"
              value={newCard.CardNumber}
              onChangeText={(text) => setNewCard({ ...newCard, CardNumber: text })}
              keyboardType="numeric"
              maxLength={16}
              placeholderTextColor={globalStyles.COLORS.black}
            />
            <TextInput
              style={styles.input}
              placeholder="Pin (4 digits)"
              value={newCard.Pin}
              onChangeText={(text) => setNewCard({ ...newCard, Pin: text })}
              keyboardType="numeric"
              maxLength={4}
              placeholderTextColor={globalStyles.COLORS.black}
            />
            <TextInput
              style={styles.input}
              placeholder="Expiration Date (YYYY-MM-DD)"
              value={displayExpirationDate}
              onChangeText={handleExpirationDateChange}
              keyboardType="numeric"
              maxLength={10} // YYYY-MM-DD format
              placeholderTextColor={globalStyles.COLORS.black}
            />
            {error && <Text style={styles.errorText}>{error}</Text>}
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalButtonCancel}
                onPress={() => {
                  setAddModalVisible(false);
                  setNewCard({ CardNumber: '', Pin: '', ExpirationDate: '' });
                  setDisplayExpirationDate('');
                }}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalButtonConfirm} onPress={handleAddCard}>
                <Text style={styles.modalButtonText}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Update Card Modal */}
      <Modal transparent visible={updateModalVisible} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Update Card</Text>
            <TextInput
              style={styles.input}
              placeholder="New Pin (4 digits)"
              value={updateCardData.Pin}
              onChangeText={(text) => setUpdateCardData({ ...updateCardData, Pin: text })}
              keyboardType="numeric"
              maxLength={4}
              placeholderTextColor={globalStyles.COLORS.black}
            />
            <TextInput
              style={styles.input}
              placeholder="Status (e.g., Active, Inactive)"
              value={updateCardData.Status}
              onChangeText={(text) => setUpdateCardData({ ...updateCardData, Status: text })}
            />
            {error && <Text style={styles.errorText}>{error}</Text>}
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalButtonCancel}
                onPress={() => setUpdateModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalButtonConfirm} onPress={handleUpdateCard}>
                <Text style={styles.modalButtonText}>Update</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal transparent visible={deleteModalVisible} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Confirm Deletion</Text>
            <Text style={styles.modalMessage}>Are you sure you want to delete this card?</Text>
            {error && <Text style={styles.errorText}>{error}</Text>}
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalButtonCancel}
                onPress={() => setDeleteModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalButtonConfirm} onPress={handleDeleteCard}>
                <Text style={styles.modalButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>
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
  filters: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
  },
  filterItem: {
    flex: 1,
    marginHorizontal: 8,
  },
  filterLabel: {
    fontSize: 14,
    color: homeScreenTheme.black,
    marginBottom: 4,
  },
  dropdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: globalStyles.COLORS.gray,
    borderRadius: 8,
    padding: 8,
    backgroundColor: homeScreenTheme.white,
  },
  dropdownText: {
    fontSize: 14,
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
  loader: {
    flex: 1,
    justifyContent: 'center',
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
  cardItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    backgroundColor: homeScreenTheme.white,
    borderRadius: 12,
    elevation: 2,
  },
  cardDetails: {
    flex: 1,
  },
  cardText: {
    fontSize: 16,
    fontWeight: '600',
    color: homeScreenTheme.black,
  },
  cardSubText: {
    fontSize: 12,
    color: homeScreenTheme.secondary,
    marginTop: 4,
  },
  cardActions: {
    flexDirection: 'row',
  },
  actionButton: {
    marginLeft: 12,
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
  modalMessage: {
    fontSize: 16,
    color: homeScreenTheme.black,
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: globalStyles.COLORS.gray,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
    width: '100%',
    backgroundColor: globalStyles.COLORS.white,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalButtonCancel: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: globalStyles.COLORS.gray,
    alignItems: 'center',
    marginRight: 8,
  },
  modalButtonConfirm: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: homeScreenTheme.primary,
    alignItems: 'center',
    marginLeft: 8,
  },
  modalButtonText: {
    fontSize: 16,
    color: homeScreenTheme.white,
    fontWeight: '600',
  },
});

export default CardsScreen;