import api from './api';

const getCards = async ({ page = 1, per_page = 10, sort_by = 'CardID', order = 'asc' } = {}) => {
  try {
    console.log('cardService: Fetching cards', { page, per_page, sort_by, order });

    // Validate parameters
    if (page < 1) throw new Error('Page must be at least 1');
    if (per_page < 1 || per_page > 100) throw new Error('Per_page must be between 1 and 100');
    if (!['CardID', 'ExpirationDate', 'Status', 'CardNumber'].includes(sort_by)) {
      throw new Error('Sort_by must be one of: CardID, ExpirationDate, Status, CardNumber');
    }
    if (!['asc', 'desc'].includes(order)) throw new Error('Order must be "asc" or "desc"');

    const params = { page, per_page, sort_by, order };
    const response = await api.get('/api/v1/users/cards', { params });
    console.log('cardService: Cards fetched successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('cardService: Error fetching cards:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Failed to fetch cards');
  }
};

const createCard = async ({ CardNumber, Pin, ExpirationDate }) => {
  try {
    console.log('cardService: Creating card', { CardNumber, Pin, ExpirationDate });

    // Validate inputs
    if (!CardNumber || CardNumber.length !== 16 || !/^\d+$/.test(CardNumber)) {
      throw new Error('CardNumber must be a 16-digit number');
    }
    if (!Pin || Pin.length !== 4 || !/^\d+$/.test(Pin)) {
      throw new Error('Pin must be a 4-digit number');
    }
    if (!ExpirationDate || !/^\d{4}-\d{2}-\d{2}$/.test(ExpirationDate)) {
      throw new Error('ExpirationDate must be in YYYY-MM-DD format');
    }

    const requestBody = { CardNumber, Pin, ExpirationDate };
    const response = await api.post('/api/v1/users/cards', requestBody);
    console.log('cardService: Card created successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('cardService: Error creating card:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Failed to create card');
  }
};

const updateCard = async (card_id, { Pin, Status }) => {
  try {
    console.log('cardService: Updating card', { card_id, Pin, Status });

    // Validate inputs
    if (!card_id || !Number.isInteger(card_id) || card_id < 1) {
      throw new Error('Card ID must be a positive integer');
    }
    if (Pin && (Pin.length !== 4 || !/^\d+$/.test(Pin))) {
      throw new Error('Pin must be a 4-digit number');
    }
    if (Status && typeof Status !== 'string') {
      throw new Error('Status must be a string');
    }

    const requestBody = { Pin, Status };
    const response = await api.put(`/api/v1/users/cards/${card_id}`, requestBody);
    console.log('cardService: Card updated successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('cardService: Error updating card:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Failed to update card');
  }
};

const deleteCard = async (card_id) => {
  try {
    console.log('cardService: Deleting card', { card_id });

    // Validate input
    if (!card_id || !Number.isInteger(card_id) || card_id < 1) {
      throw new Error('Card ID must be a positive integer');
    }

    const response = await api.delete(`/api/v1/users/cards/${card_id}`);
    console.log('cardService: Card deleted successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('cardService: Error deleting card:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Failed to delete card');
  }
};

export { getCards, createCard, updateCard, deleteCard };