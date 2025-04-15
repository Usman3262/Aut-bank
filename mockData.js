// mockData.js

export const mockUser = {
  name:'Mani',
  email: 'testuser@example.com',
  password: 'password123',
  balance: 285856.20,
  username: 'John Doe',
  incomingTransactions: [
    { id: 1, sender: 'Johnny Bairstow', amount: 54.23, date: '23 December 2020' },
    { id: 2, sender: 'Charles', amount: 62.54, date: '22 December 2020' },
  ],
  outgoingTransactions: [
    { id: 1, recipient: 'John', amount: 396.84, date: '12 December 2021' },
    { id: 2, recipient: 'Mellony', amount: 45.21, date: '12 December 2021' },
  ],
};
