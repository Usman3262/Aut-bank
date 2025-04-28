import React, { useContext, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
  Modal,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useQuery, useQueryClient } from 'react-query';
import { AuthContext } from '../context/AuthContext';
import { getUserLoans } from '../services/loanService';
import globalStyles from '../styles/globalStyles';
import { homeScreenTheme } from '../styles/homeScreenTheme';

const LoansScreen = ({ navigation }) => {
  const { user } = useContext(AuthContext);
  const queryClient = useQueryClient();

  // State for pagination and sorting
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [status, setStatus] = useState('');
  const [sortBy, setSortBy] = useState('CreatedAt');
  const [order, setOrder] = useState('desc');
  const [sortModalVisible, setSortModalVisible] = useState(false);
  const [orderModalVisible, setOrderModalVisible] = useState(false);
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [modalType, setModalType] = useState('');

  // Fetch loans
  const { data, isLoading, error: fetchError, refetch } = useQuery(
    ['userLoans', page, perPage, status, sortBy, order],
    () => getUserLoans({ page, per_page: perPage, status, sort_by: sortBy, order }),
    { enabled: !!user?.access_token }
  );

  const openSortModal = (type) => {
    setModalType(type);
    if (type === 'sortBy') setSortModalVisible(true);
    else if (type === 'order') setOrderModalVisible(true);
    else if (type === 'status') setStatusModalVisible(true);
  };

  const handleSortSelect = (value) => {
    setSortBy(value);
    setSortModalVisible(false);
  };

  const handleOrderSelect = (value) => {
    setOrder(value);
    setOrderModalVisible(false);
  };

  const handleStatusSelect = (value) => {
    setStatus(value);
    setStatusModalVisible(false);
  };

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={globalStyles.textXLargeBlack}>Please log in to view your loans</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Loans</Text>
        <TouchableOpacity onPress={() => navigation.navigate('ApplyLoan')}>
          <Icon name="add" size={24} color={homeScreenTheme.white} />
        </TouchableOpacity>
      </View>

      <View style={styles.filters}>
        <View style={styles.filterItem}>
          <Text style={styles.filterLabel}>Sort By:</Text>
          <TouchableOpacity style={styles.dropdown} onPress={() => openSortModal('sortBy')}>
            <Text style={styles.dropdownText}>{sortBy}</Text>
            <Icon name="arrow-drop-down" size={20} color={homeScreenTheme.black} />
          </TouchableOpacity>
        </View>
        <View style={styles.filterItem}>
          <Text style={styles.filterLabel}>Order:</Text>
          <TouchableOpacity style={styles.dropdown} onPress={() => openSortModal('order')}>
            <Text style={styles.dropdownText}>{order === 'asc' ? 'Ascending' : 'Descending'}</Text>
            <Icon name="arrow-drop-down" size={20} color={homeScreenTheme.black} />
          </TouchableOpacity>
        </View>
        <View style={styles.filterItem}>
          <Text style={styles.filterLabel}>Status:</Text>
          <TouchableOpacity style={styles.dropdown} onPress={() => openSortModal('status')}>
            <Text style={styles.dropdownText}>{status || 'All'}</Text>
            <Icon name="arrow-drop-down" size={20} color={homeScreenTheme.black} />
          </TouchableOpacity>
        </View>
      </View>

      {isLoading ? (
        <ActivityIndicator size="large" color={homeScreenTheme.primary} style={styles.loader} />
      ) : fetchError ? (
        <Text style={styles.errorText}>{fetchError.message}</Text>
      ) : !data?.data?.items || data.data.items.length === 0 ? (
        <Text style={styles.noDataText}>No loans available</Text>
      ) : (
        <>
          <FlatList
            data={data.data.items}
            keyExtractor={(item) => item.LoanID.toString()}
            renderItem={({ item }) => (
              <View style={styles.loanItem}>
                <View style={styles.loanDetails}>
                  <Text style={styles.loanText}>Loan ID: {item.LoanID}</Text>
                  <Text style={styles.loanSubText}>Amount: {item.LoanAmount}</Text>
                  <Text style={styles.loanSubText}>Due: {item.DueDate}</Text>
                  <Text style={styles.loanSubText}>Status: {item.Status}</Text>
                </View>
                <TouchableOpacity
                  onPress={() => navigation.navigate('LoanPayments', { loanId: item.LoanID })}
                >
                  <Icon name="payment" size={20} color={homeScreenTheme.primary} />
                </TouchableOpacity>
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
            {['CreatedAt', 'LoanAmount', 'DueDate', 'Status'].map((option) => (
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

      {/* Status Modal */}
      <Modal transparent visible={statusModalVisible} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Status</Text>
            {['', 'Active', 'Closed', 'Pending'].map((option) => (
              <TouchableOpacity
                key={option || 'All'}
                style={styles.dropdownOption}
                onPress={() => handleStatusSelect(option)}
              >
                <Text style={styles.dropdownOptionText}>{option || 'All'}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.modalButtonCancel}
              onPress={() => setStatusModalVisible(false)}
            >
              <Text style={styles.modalButtonText}>Cancel</Text>
            </TouchableOpacity>
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
    marginHorizontal: 4,
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
  loanItem: {
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
  loanDetails: {
    flex: 1,
  },
  loanText: {
    fontSize: 16,
    fontWeight: '600',
    color: homeScreenTheme.black,
  },
  loanSubText: {
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
  modalButtonCancel: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: globalStyles.COLORS.gray,
    alignItems: 'center',
    marginTop: 8,
  },
  modalButtonText: {
    fontSize: 16,
    color: homeScreenTheme.white,
    fontWeight: '600',
  },
});

export default LoansScreen;