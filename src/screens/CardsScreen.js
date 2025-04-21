import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Modal } from 'react-native';
import { useQuery, useMutation } from 'react-query';
import { AuthContext } from '../context/AuthContext';
import { getCards, createCard, updateCard, deleteCard } from '../services/cardService';
import { CardCreateSchema, CardUpdateSchema } from '../utils/validators';
import { formatDate } from '../utils/helpers';
import globalStyles from '../styles/globalStyles';

const CardsScreen = () => {
  const { user } = useContext(AuthContext);
  const [showModal, setShowModal] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [pin, setPin] = useState('');
  const [expirationDate, setExpirationDate] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const { data: cards, isLoading, refetch } = useQuery('cards', () => getCards({ page: 1, per_page: 10 }), {
    enabled: !!user,
  });

  const createMutation = useMutation(createCard, {
    onSuccess: () => {
      setShowModal(false);
      setCardNumber('');
      setPin('');
      setExpirationDate('');
      refetch();
    },
    onError: (error) => setErrorMessage(error.message),
  });

  const updateMutation = useMutation(({ cardId, cardData }) => updateCard(cardId, cardData), {
    onSuccess: refetch,
    onError: (error) => setErrorMessage(error.message),
  });

  const deleteMutation = useMutation(deleteCard, {
    onSuccess: refetch,
    onError: (error) => setErrorMessage(error.message),
  });

  const handleCreateCard = async () => {
    setErrorMessage('');
    try {
      const cardData = { CardNumber: cardNumber, Pin: pin, ExpirationDate: formatDate(expirationDate) };
      await CardCreateSchema.validate(cardData);
      createMutation.mutate(cardData);
    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  const handleUpdateStatus = async (cardId, status) => {
    try {
      await CardUpdateSchema.validate({ Status: status });
      updateMutation.mutate({ cardId, cardData: { Status: status } });
    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  const renderCard = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.cardText}>Card Number: {item.CardNumber}</Text>
      <Text style={styles.cardText}>Expiration: {item.ExpirationDate}</Text>
      <Text style={styles.cardText}>Status: {item.Status}</Text>
      <View style={styles.cardActions}>
        <TouchableOpacity
          style={[styles.actionButton, item.Status === 'Active' && { opacity: 0.5 }]}
          onPress={() => handleUpdateStatus(item.CardID, 'Active')}
          disabled={item.Status === 'Active'}
        >
          <Text style={styles.actionText}>Activate</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, item.Status === 'Blocked' && { opacity: 0.5 }]}
          onPress={() => handleUpdateStatus(item.CardID, 'Blocked')}
          disabled={item.Status === 'Blocked'}
        >
          <Text style={styles.actionText}>Block</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => deleteMutation.mutate(item.CardID)}
        >
          <Text style={styles.actionText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (!user) {
    return (
      <View style={globalStyles.container}>
        <Text>Please log in to view cards</Text>
      </View>
    );
  }

  return (
    <View style={globalStyles.container}>
      <Text style={[globalStyles.textXLargeBlack, { marginBottom: globalStyles.SPACING.large }]}>
        Your Cards
      </Text>
      {isLoading ? (
        <Text>Loading cards...</Text>
      ) : (
        <FlatList
          data={cards?.data || []}
          renderItem={renderCard}
          keyExtractor={(item) => item.CardID.toString()}
        />
      )}
      <TouchableOpacity
        style={globalStyles.button}
        onPress={() => setShowModal(true)}
      >
        <Text style={globalStyles.buttonText}>Add New Card</Text>
      </TouchableOpacity>
      {errorMessage ? <Text style={globalStyles.textError}>{errorMessage}</Text> : null}

      <Modal visible={showModal} animationType="slide">
        <View style={globalStyles.container}>
          <Text style={[globalStyles.textXLargeBlack, { marginBottom: globalStyles.SPACING.large }]}>
            Add New Card
          </Text>
          <TextInput
            style={globalStyles.input}
            placeholder="Card Number (16 digits)"
            keyboardType="numeric"
            value={cardNumber}
            onChangeText={setCardNumber}
            maxLength={16}
          />
          <TextInput
            style={globalStyles.input}
            placeholder="PIN (4 digits)"
            keyboardType="numeric"
            secureTextEntry
            value={pin}
            onChangeText={setPin}
            maxLength={4}
          />
          <TextInput
            style={globalStyles.input}
            placeholder="Expiration Date (YYYY-MM-DD)"
            value={expirationDate}
            onChangeText={setExpirationDate}
          />
          {errorMessage ? <Text style={globalStyles.textError}>{errorMessage}</Text> : null}
          <TouchableOpacity
            style={[globalStyles.button, createMutation.isLoading && { opacity: 0.7 }]}
            onPress={handleCreateCard}
            disabled={createMutation.isLoading}
          >
            <Text style={globalStyles.buttonText}>
              {createMutation.isLoading ? 'Adding...' : 'Add Card'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={globalStyles.buttonOutline}
            onPress={() => setShowModal(false)}
          >
            <Text style={globalStyles.buttonOutlineText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: globalStyles.COLORS.gray,
    borderRadius: 8,
    padding: 16,
    marginVertical: 8,
  },
  cardText: {
    fontSize: globalStyles.FONT_SIZES.medium,
    color: globalStyles.COLORS.text,
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  actionButton: {
    backgroundColor: globalStyles.COLORS.primary,
    padding: 8,
    borderRadius: 5,
  },
  actionText: {
    color: globalStyles.COLORS.white,
    fontSize: globalStyles.FONT_SIZES.small,
  },
});

export default CardsScreen;