import React, { useEffect, useContext } from 'react';
import { View, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from '../context/AuthContext';
import globalStyles from '../styles/globalStyles';

const SplashScreen = () => {
  const navigation = useNavigation();
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (user) {
        console.log('SplashScreen: User exists, navigating to Home');
        navigation.replace('Home');
      } else {
        console.log('SplashScreen: No user, navigating to Onboarding');
        navigation.replace('Onboarding');
      }
    }, 3000); // 3 seconds

    return () => clearTimeout(timer);
  }, [navigation, user]);

  return (
    <View style={globalStyles.centeredContainer}>
      {/* Logo: Two overlapping circles */}
      <View style={globalStyles.logoContainer}>
        <View style={[globalStyles.circle, globalStyles.circlePrimary]} />
        <View style={[globalStyles.circle, globalStyles.circleSecondary]} />
      </View>

      {/* Main text: "Aut Bank" */}
      <Text style={globalStyles.textXLarge}>Aut Bank</Text>

      {/* Subtext: "Your Best Money Transfer Partner." */}
      <Text style={globalStyles.textSmall}>Your Best Money Transfer Partner.</Text>

      {/* Footer text: "Secured by TransferMe." */}
      <Text
        style={[
          globalStyles.textSmall,
          {
            position: 'absolute',
            bottom: globalStyles.SPACING.large,
            fontSize: globalStyles.FONT_SIZES.small,
            color: globalStyles.COLORS.secondary,
          },
        ]}
      >
        Secured by TransferMe.
      </Text>
    </View>
  );
};

export default SplashScreen;