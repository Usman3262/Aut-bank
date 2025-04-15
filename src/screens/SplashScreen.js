import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import globalStyles from '../styles/globalStyles'; // Adjust the path as needed
import { useNavigation } from '@react-navigation/native';

const SplashScreen = () => {
  const navigation = useNavigation();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace('Onboarding'); // Navigate to Onboarding screen
    }, 3000); // 3 seconds

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={globalStyles.centeredContainer}>
      {/* Logo: Two overlapping circles */}
      <View style={globalStyles.logoContainer}>
        <View style={[globalStyles.circle, globalStyles.circlePrimary]} />
        <View style={[globalStyles.circle, globalStyles.circleSecondary]} />
      </View>

      {/* Main text: "TransferMe" */}
      <Text style={globalStyles.textXLarge}>Aut Bank</Text>

      {/* Subtext: "Your Best Money Transfer Partner." */}
      <Text style={globalStyles.textSmall}>Your Best Money Transfer Partner.</Text>

      {/* Footer text: "Secured by TransferMe." */}
      <Text
        style={[
          globalStyles.textSmall,
          {
            position: 'absolute',
            bottom: globalStyles.SPACING.large, // Use SPACING here
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