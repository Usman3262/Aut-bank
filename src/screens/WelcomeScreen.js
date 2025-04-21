import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

const WelcomeScreen = () => {
  const navigation = useNavigation();

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Clear AsyncStorage to remove any existing account
        await AsyncStorage.clear();
        console.log('AsyncStorage cleared');
      } catch (error) {
        console.error('Error clearing AsyncStorage:', error);
      } finally {
        // Navigate to Login Screen after 2 seconds
        setTimeout(() => {
          navigation.replace('Login');
        }, 2000);
      }
    };

    initializeApp();
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>AutFinanceBank</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#007bff',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
});

export default WelcomeScreen;