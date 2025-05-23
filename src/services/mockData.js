// services/mockData.js
export const mockUsers = [
  {
    userId: 1,
    username: 'manidoe',
    firstName: 'Mani',
    lastName: 'Doe',
    email: 'mani.doe@example.com',
    password: 'password123',
    cnic: '12345-6789012-3',
    accountType: 'Savings',
    balance: 285856.20,
    phoneNumber: '+1234567890',
    streetAddress: '123 Main St',
    city: 'Karachi',
    country: 'Pakistan',
    postalCode: '75000',
    dateOfBirth: '1990-01-15',
    isActive: true,
    createdAt: '2025-01-01T10:00:00Z',
    profileImage: require('../Assets/images/users/user1.jpg'),
    incomingTransactions: [
      {
        id: 1,
        senderId: 2,
        senderName: 'Johnny Bairstow',
        amount: 54.23,
        date: '2020-12-23',
        referenceNumber: 'TRX001',
      },
      {
        id: 2,
        senderId: 3,
        senderName: 'Charles Smith',
        amount: 62.54,
        date: '2020-12-22',
        referenceNumber: 'TRX002',
      },
    ],
    outgoingTransactions: [
      {
        id: 1,
        recipientId: 4,
        recipientName: 'John Brown',
        amount: 396.84,
        date: '2021-12-12',
        referenceNumber: 'TRX003',
      },
      {
        id: 2,
        recipientId: 5,
        recipientName: 'Mellony Jane',
        amount: 45.21,
        date: '2021-12-12',
        referenceNumber: 'TRX004',
      },
    ],
  },
  {
    userId: 2,
    username: 'johnnyb',
    firstName: 'Johnny',
    lastName: 'Bairstow',
    email: 'johnny.b@example.com',
    password: 'pass456',
    cnic: '54321-0987654-3',
    accountType: 'Current',
    balance: 15000.75,
    phoneNumber: '+1987654321',
    streetAddress: '456 Oak Ave',
    city: 'Lahore',
    country: 'Pakistan',
    postalCode: '54000',
    dateOfBirth: '1985-03-22',
    isActive: true,
    createdAt: '2025-02-01T12:00:00Z',
    profileImage: require('../Assets/images/users/user2.jpg'),
    incomingTransactions: [],
    outgoingTransactions: [
      {
        id: 3,
        recipientId: 1,
        recipientName: 'Mani Doe',
        amount: 54.23,
        date: '2020-12-23',
        referenceNumber: 'TRX001',
      },
    ],
  },
  {
    userId: 3,
    username: 'charless',
    firstName: 'Charles',
    lastName: 'Smith',
    email: 'charles.s@example.com',
    password: 'pass789',
    cnic: '67890-1234567-8',
    accountType: 'Savings',
    balance: 7500.30,
    phoneNumber: '+1122334455',
    streetAddress: '789 Pine Rd',
    city: 'Islamabad',
    country: 'Pakistan',
    postalCode: '44000',
    dateOfBirth: '1992-07-10',
    isActive: false,
    createdAt: '2025-03-01T15:00:00Z',
    profileImage: require('../Assets/images/users/user3.jpg'),
    incomingTransactions: [],
    outgoingTransactions: [
      {
        id: 4,
        recipientId: 1,
        recipientName: 'Mani Doe',
        amount: 62.54,
        date: '2020-12-22',
        referenceNumber: 'TRX002',
      },
    ],
  },
];

export const mockRecipients = [
  {
    recipientId: 1,
    name: 'Johnny Baistow',
    email: 'johnny.b@example.com',
    image: require('../Assets/images/recipients/recipients1.jpg'),
  },
  {
    recipientId: 2,
    name: 'Johnny Baistow',
    email: 'johnny.b@example.com',
    image: require('../Assets/images/recipients/recipients1.jpg'),
  },
  {
    recipientId: 3,
    name: 'Johnny Baistow',
    email: 'johnny.b@example.com',
    image: require('../Assets/images/recipients/recipients1.jpg'),
  },
  {
    recipientId: 4,
    name: 'Johnny Baistow',
    email: 'johnny.b@example.com',
    image: require('../Assets/images/recipients/recipients1.jpg'),
  },
  {
    recipientId: 5,
    name: 'Charles Smith',
    email: 'charles.s@example.com',
    image: require('../Assets/images/recipients/recipients2.jpg'),
  },
  {
    recipientId: 6,
    name: 'John Brown',
    email: 'john.brown@example.com',
    image: require('../Assets/images/recipients/recipients3.jpg'),
  },
  {
    recipientId: 7,
    name: 'Mellony Jane',
    email: 'mellony.j@example.com',
    image: require('../Assets/images/recipients/recipients4.jpg'),
  },
];