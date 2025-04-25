import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { getUserDetails } from '../services/userService';

const formatUserDataForQR = (userData) => {
  return (
    `Name: ${userData.FirstName} ${userData.LastName}\n` +
    `Username: ${userData.Username}\n` +
    `Email: ${userData.Email}\n` +
    `CNIC: ${userData.CNIC}\n` +
    `Bio: Passionate mobile banking user.\n` +
    `Link: https://bmscpp.netlify.app/`
  );
};

const QRCodeScreen = () => {
  const [userData, setUserData] = useState(null);
  const [qrValue, setQrValue] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const data = await getUserDetails();
        if (!data || typeof data !== 'object') {
          throw new Error('Invalid data');
        }
        setUserData(data);
        const formattedData = formatUserDataForQR(data);
        setQrValue(formattedData);
      } catch (error) {
        console.error('Error fetching user data:', error);
        Alert.alert('Error', 'Failed to fetch user data');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Unique QR Code</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : userData ? (
        <>
          <View style={styles.userInfo}>
            <Text style={styles.text}>Name: {userData.FirstName} {userData.LastName}</Text>
            <Text style={styles.text}>Username: {userData.Username}</Text>
            <Text style={styles.text}>Email: {userData.Email}</Text>
            <Text style={styles.text}>CNIC: {userData.CNIC}</Text>
            <Text style={styles.text}>Bio: Passionate mobile banking user.</Text>
            <Text style={styles.text}>Link: https://bmscpp.netlify.app/</Text>
          </View>
          <View style={styles.qrContainer}>
            <QRCode
              value={qrValue}
              size={200}
              color="black"
              backgroundColor="white"
            />
          </View>
        </>
      ) : (
        <Text>Something went wrong.</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  userInfo: {
    marginBottom: 20,
    alignItems: 'center',
  },
  text: {
    fontSize: 16,
    marginBottom: 4,
  },
  qrContainer: {
    marginTop: 20,
    padding: 10,
    backgroundColor: 'white',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
});

export default QRCodeScreen;
