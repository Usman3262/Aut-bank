import React, { useRef, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Dimensions, SafeAreaView } from 'react-native';
import globalStyles from '../styles/globalStyles'; // Adjust the path as needed
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('screen');

const onboardingData = [
  {
    id: '1',
    logo: true, // Use the two-circle logo
    title1: 'Welcome to',
    title2: 'Aut Bank.',
    subtitle: 'Your Best Money Transfer Partner.',
    showGetStarted: true,
  },
  {
    id: '2',
    logo: true, // Use the two-circle logo (same as first screen)
    title1: 'Easy, Fast & Trusted',
    subtitle: 'Fast money transfer and guaranteed safe with others.',
    showGetStarted: false,
    logoText: 'Fast', // Bold text below the logo
  },
  {
    id: '3',
    logo: true, // Use the two-circle logo (same as first screen)
    title1: 'Free Transactions',
    subtitle: 'Provides the quality of the financial system with free money transactions without any fees.',
    showGetStarted: false,
    logoText: 'Free', // Bold text below the logo
  },
];

const OnboardingScreen = () => {
  const navigation = useNavigation();
  const flatListRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleContinue = () => {
    if (currentIndex < onboardingData.length - 1) {
      const nextIndex = currentIndex + 1;
      flatListRef.current.scrollToIndex({ index: nextIndex, animated: true });
      setCurrentIndex(nextIndex);
    }
  };

  const handleLogin = () => {
    navigation.navigate('Login');
    
    // navigation.navigate('Home');

  };

  const handleSignup = () => {
    navigation.navigate('SignupStep1');
  };

  const renderItem = ({ item, index }) => (
    <View style={{ width, flex: 1 }}>
      {/* Centered content (logo, title, subtitle) */}
      <View style={[globalStyles.centeredContainer, { flex: 1 }]}>
        {/* Logo with bold text below */}
        {item.logo && (
          <View style={{ alignItems: 'center' }}>
            <View style={globalStyles.logoContainer}>
              <View style={[globalStyles.circle, globalStyles.circlePrimary]} />
              <View style={[globalStyles.circle, globalStyles.circleSecondary]} />
            </View>
            {/* Bold text below the logo for screens 2 and 3 */}
            {item.logoText && (
              <Text
                style={{
                  fontSize: globalStyles.FONT_SIZES.xlarge,
                  fontWeight: 'bold',
                  color: globalStyles.COLORS.primary,
                  marginBottom: globalStyles.SPACING.medium,
                }}
              >
                {item.logoText}
              </Text>
            )}
          </View>
        )}

        {/* Title */}
        <Text style={globalStyles.textXLargeBlack}>{item.title1}</Text>
        {item.title2 && <Text style={globalStyles.textXLarge}>{item.title2}</Text>}

        {/* Subtitle */}
        <Text
          style={[
            item.id === '1' ? globalStyles.textSmall : globalStyles.textSmallGray,
            { marginTop: globalStyles.SPACING.medium },
          ]}
        >
          {item.subtitle}
        </Text>
      </View>

      {/* Bottom container for buttons and dots */}
      <View
        style={{
          position: 'absolute',
          bottom: globalStyles.SPACING.xlarge,
          width: '100%',
          alignItems: 'center',
        }}
      >
        {/* Buttons */}
        {index === onboardingData.length - 1 ? (
          // Show Login and Signup buttons on the last screen
          <View>
            <TouchableOpacity style={globalStyles.button} onPress={handleLogin}>
              <Text style={globalStyles.buttonText}>Login</Text>
            </TouchableOpacity>
            <TouchableOpacity style={globalStyles.buttonOutline} onPress={handleSignup}>
              <Text style={globalStyles.buttonOutlineText}>Signup</Text>
            </TouchableOpacity>
          </View>
        ) : (
          // Show Get Started or Continue button
          <TouchableOpacity
            style={globalStyles.button}
            onPress={item.showGetStarted ? handleContinue : handleContinue}
          >
            <Text style={globalStyles.buttonText}>
              {item.showGetStarted ? 'Get Started' : 'Continue'}
            </Text>
          </TouchableOpacity>
        )}

        {/* Dots */}
        <View style={globalStyles.dotContainer}>
          {onboardingData.map((_, dotIndex) => (
            <View
              key={dotIndex}
              style={[
                globalStyles.dot,
                dotIndex === 0 && currentIndex === 0
                  ? globalStyles.dotFirst
                  : dotIndex === currentIndex
                  ? globalStyles.dotActive
                  : globalStyles.dotInactive,
              ]}
            />
          ))}
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={globalStyles.container}>
      <FlatList
        ref={flatListRef}
        data={onboardingData}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        snapToInterval={width}
        snapToAlignment="center"
        decelerationRate="fast"
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ height: '100%' }}
        onMomentumScrollEnd={(event) => {
          const newIndex = Math.round(event.nativeEvent.contentOffset.x / width);
          setCurrentIndex(newIndex);
        }}
      />
    </SafeAreaView>
  );
};

export default OnboardingScreen;