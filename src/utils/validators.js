import * as Yup from 'yup';

export const UserCreateSchema = Yup.object().shape({
  Username: Yup.string().min(3).max(50).required('Username is required'),
  FirstName: Yup.string().max(50).required('First name is required'),
  LastName: Yup.string().max(50).required('Last name is required'),
  StreetAddress: Yup.string().max(255).nullable(),
  City: Yup.string().max(50).nullable(),
  State: Yup.string().max(50).nullable(),
  Country: Yup.string().max(50).nullable(),
  PostalCode: Yup.string().max(20).nullable(),
  PhoneNumber: Yup.string().max(20).nullable(),
  CNIC: Yup.string()
    .matches(/^\d{5}-\d{7}-\d$/, 'Invalid CNIC format (e.g., 12345-6789012-3)')
    .required('CNIC is required'),
  Email: Yup.string().email('Invalid email').required('Email is required'),
  Password: Yup.string().min(8).max(255).required('Password is required'),
  AccountType: Yup.string().oneOf(['Savings', 'Current']).required('Account type is required'),
  DateOfBirth: Yup.string()
    .matches(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)')
    .required('Date of birth is required'),
});

export const UserLoginSchema = Yup.object().shape({
  login_id: Yup.string().required('Email or username is required'),
  Password: Yup.string().min(8).required('Password is required'),
});

export const UserUpdateSchema = Yup.object().shape({
  Username: Yup.string().min(3).max(50).nullable(),
  FirstName: Yup.string().max(50).nullable(),
  LastName: Yup.string().max(50).nullable(),
  StreetAddress: Yup.string().max(255).nullable(),
  City: Yup.string().max(50).nullable(),
  State: Yup.string().max(50).nullable(),
  Country: Yup.string().max(50).nullable(),
  PostalCode: Yup.string().max(20).nullable(),
  PhoneNumber: Yup.string().max(20).nullable(),
  Email: Yup.string().email('Invalid email').nullable(),
});

export const UserPasswordUpdateSchema = Yup.object().shape({
  CurrentPassword: Yup.string().min(8).required('Current password is required'),
  NewPassword: Yup.string().min(8).required('New password is required'),
});

export const TransferCreateSchema = Yup.object().shape({
  cnic: Yup.string()
    .matches(/^\d{5}-\d{7}-\d$/, 'Invalid CNIC format')
    .nullable(),
  username: Yup.string().min(3).max(50).nullable(),
  email: Yup.string().email('Invalid email').nullable(),
  Amount: Yup.number().positive('Amount must be positive').required('Amount is required'),
  Description: Yup.string().nullable(),
})
  .test('one-of-identifier', 'One of CNIC, username, or email is required', (value) => {
    return !!(value.cnic || value.username || value.email);
  });

export const CardCreateSchema = Yup.object().shape({
  CardNumber: Yup.string()
    .matches(/^\d{16}$/, 'Card number must be 16 digits')
    .required('Card number is required'),
  Pin: Yup.string()
    .matches(/^\d{4}$/, 'PIN must be 4 digits')
    .required('PIN is required'),
  ExpirationDate: Yup.string()
    .matches(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)')
    .required('Expiration date is required'),
});

export const CardUpdateSchema = Yup.object().shape({
  Pin: Yup.string().matches(/^\d{4}$/, 'PIN must be 4 digits').nullable(),
  Status: Yup.string().oneOf(['Active', 'Inactive', 'Blocked']).nullable(),
});

export const LoanApplySchema = Yup.object().shape({
  LoanTypeID: Yup.number().positive().required('Loan type is required'),
  LoanAmount: Yup.number().positive('Loan amount must be positive').required('Loan amount is required'),
  LoanDurationMonths: Yup.number().positive().required('Loan duration is required'),
  DueDate: Yup.string()
    .matches(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)')
    .required('Due date is required'),
});

export const LoanPaymentCreateSchema = Yup.object().shape({
  LoanID: Yup.number().positive().required('Loan ID is required'),
  PaymentAmount: Yup.number().positive('Payment amount must be positive').required('Payment amount is required'),
});

export const WithdrawalCreateSchema = Yup.object().shape({
  CardNumber: Yup.string()
    .matches(/^\d{16}$/, 'Card number must be 16 digits')
    .required('Card number is required'),
  Pin: Yup.string()
    .matches(/^\d{4}$/, 'PIN must be 4 digits')
    .required('PIN is required'),
  Amount: Yup.number().positive('Amount must be positive').required('Amount is required'),
});