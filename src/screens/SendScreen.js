import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, ScrollView } from 'react-native';
import { useMutation } from 'react-query';
import { AuthContext } from '../context/AuthContext';
import { createTransfer } from '../services/transferService';
import { TransferCreateSchema } from '../utils/validators';
import globalStyles from '../styles/globalStyles';

const SendScreen = ({ navigation }) => {
  const { user } = useContext(AuthContext);
  const [recipient, setRecipient] = useState('');
  const [recipientType, setRecipientType] = useState('email');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const mutation = useMutation(createTransfer, {
    onSuccess: (data) => {
      if (data.success) {
        alert('Transfer initiated successfully!');
        navigation.goBack();
      } else {
        setErrorMessage(data.message);
      }
    },
    onError: (error) => {
      setErrorMessage(error.message || 'Failed to initiate transfer');
    },
  });

  const handleSend = async () => {
    setErrorMessage('');
    try {
      const transferData = {
        [recipientType]: recipient,
        Amount: parseFloat(amount),
        Description: description || undefined,
      };
      await TransferCreateSchema.validate(transferData);
      mutation.mutate(transferData);
    } catch (error) {
      setErrorMessage(error.message || 'Invalid input');
    }
  };

  if (!user) {
    return (
      <View style={globalStyles.container}>
        <Text>Please log in to send money</Text>
        <TouchableOpacity
          style={globalStyles.button}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={globalStyles.buttonText}>Go to Login</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
      <ScrollView contentContainerStyle={globalStyles.container}>
        <Text style={[globalStyles.textXLargeBlack, { marginBottom: globalStyles.SPACING.large }]}>
          Send Money
        </Text>
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
          style={globalStyles.input}
          placeholder={`Recipient ${recipientType.toUpperCase()}`}
          value={recipient}
          onChangeText={setRecipient}
          autoCapitalize={recipientType === 'email' ? 'none' : 'words'}
        />
        <TextInput
          style={globalStyles.input}
          placeholder="Amount"
          keyboardType="numeric"
          value={amount}
          onChangeText={setAmount}
        />
        <TextInput
          style={globalStyles.input}
          placeholder="Description (optional)"
          value={description}
          onChangeText={setDescription}
        />
        {errorMessage ? <Text style={globalStyles.textError}>{errorMessage}</Text> : null}
        <TouchableOpacity
          style={[globalStyles.button, mutation.isLoading && { opacity: 0.7 }]}
          onPress={handleSend}
          disabled={mutation.isLoading}
        >
          <Text style={globalStyles.buttonText}>
            {mutation.isLoading ? 'Sending...' : 'Send'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  recipientTypeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: globalStyles.SPACING.medium,
  },
  recipientTypeButton: {
    flex: 1,
    padding: 10,
    borderWidth: 1,
    borderColor: globalStyles.COLORS.gray,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  recipientTypeButtonActive: {
    backgroundColor: globalStyles.COLORS.primary,
    borderColor: globalStyles.COLORS.primary,
  },
  recipientTypeText: {
    color: globalStyles.COLORS.text,
    fontSize: globalStyles.FONT_SIZES.medium,
  },
  TextInput:{
    color:'black'
  }

});

export default SendScreen;