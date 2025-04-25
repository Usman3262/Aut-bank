import React, { useContext, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Modal } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from '../context/AuthContext';
import globalStyles from '../styles/globalStyles';
import { homeScreenTheme } from '../styles/homeScreenTheme';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ProfileScreen = () => {
  const navigation = useNavigation();
  const { user, logout } = useContext(AuthContext);
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('accessToken');
      logout();
      navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
    } catch (error) {
      console.error('ProfileScreen: Error during logout:', error);
    }
  };

  const showLogoutModal = () => {
    setLogoutModalVisible(true);
  };

  const confirmLogout = () => {
    setLogoutModalVisible(false);
    handleLogout();
  };

  const cancelLogout = () => {
    setLogoutModalVisible(false);
  };

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={globalStyles.textXLargeBlack}>Please log in to view your profile</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.userContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user?.FirstName?.[0]?.toUpperCase() || 'U'}</Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.name}>{user?.FirstName || 'User'}</Text>
            <Text style={styles.username}>@{user?.Username || 'user'}</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('SettingsTab')}>
            <Icon name="edit" size={20} color={homeScreenTheme.white} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.menuContainer}>
        <MenuItem
          icon="settings"
          title="Settings"
          subtitle="Make changes to your account"
          onPress={() => navigation.navigate('SettingsTab')}
          showWarning
        />
        <MenuItem
          icon="send"
          title="Send Money"
          subtitle="Manage your account"
          onPress={() => navigation.navigate('Send')}
        />
        <MenuItem
          icon="history"
          title="Transactions"
          subtitle="Manage your device security"
          onPress={() => navigation.navigate('Transactions')}
        />
        <MenuItem
          icon="people"
          title="Recipient Screen"
          subtitle="Further secure your account for safety"
          onPress={() => navigation.navigate('RecipientScreen')}
        />
        <MenuItem
          icon="logout"
          title="Log out"
          subtitle="Further secure your account for safety"
          onPress={showLogoutModal}
        />
      </View>

      <View style={styles.moreContainer}>
        <Text style={styles.sectionTitle}>MORE</Text>
        <MenuItem
          icon="help"
          title="Help & Support"
          onPress={() => navigation.navigate('HelpSupport')}
        />
        <MenuItem
          icon="info"
          title="About App"
          onPress={() => navigation.navigate('AboutApp')}
        />
      </View>

      <Modal
        transparent
        visible={logoutModalVisible}
        animationType="fade"
        onRequestClose={cancelLogout}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Confirm Logout</Text>
            <Text style={styles.modalMessage}>Are you sure you want to log out?</Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.modalButtonCancel} onPress={cancelLogout}>
                <Text style={styles.modalButtonTextCancel}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalButtonConfirm} onPress={confirmLogout}>
                <Text style={styles.modalButtonTextConfirm}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const MenuItem = ({ icon, title, subtitle, onPress, showWarning }) => (
  <TouchableOpacity style={styles.menuItem} onPress={onPress}>
    <View style={styles.menuItemLeft}>
      <Icon name={icon} size={24} color={homeScreenTheme.primary} style={styles.menuIcon} />
      <View style={styles.menuTextContainer}>
        <Text style={styles.menuTitle}>{title}</Text>
        {subtitle && <Text style={styles.menuSubtitle}>{subtitle}</Text>}
      </View>
    </View>
    <View style={styles.menuItemRight}>
      {showWarning && <Icon name="warning" size={20} color={homeScreenTheme.debit} />}
      <Icon name="chevron-right" size={24} color={homeScreenTheme.secondary} />
    </View>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: homeScreenTheme.background,
  },
  header: {
    backgroundColor: homeScreenTheme.primary,
    padding: 16,
    paddingTop: 40,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  userContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#f06292', // Pink like in the image
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: homeScreenTheme.white,
  },
  userInfo: {
    flex: 1,
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    color: homeScreenTheme.white,
  },
  username: {
    fontSize: 14,
    color: homeScreenTheme.white,
    marginTop: 4,
  },
  menuContainer: {
    marginTop: 16,
    backgroundColor: homeScreenTheme.white,
    borderRadius: 12,
    marginHorizontal: 16,
    paddingVertical: 8,
  },
  moreContainer: {
    marginTop: 16,
    marginHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: homeScreenTheme.secondary,
    marginBottom: 12,
    marginLeft: 8,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: globalStyles.COLORS.gray,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuIcon: {
    marginRight: 12,
  },
  menuTextContainer: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: homeScreenTheme.black,
  },
  menuSubtitle: {
    fontSize: 12,
    color: homeScreenTheme.secondary,
    marginTop: 4,
  },
  menuItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: homeScreenTheme.white,
    borderRadius: 12,
    padding: 20,
    width: '80%',
    maxWidth: 400,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: homeScreenTheme.black,
    marginBottom: 12,
  },
  modalMessage: {
    fontSize: 16,
    color: homeScreenTheme.black,
    marginBottom: 20,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalButtonCancel: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: globalStyles.COLORS.gray,
    alignItems: 'center',
    marginRight: 8,
  },
  modalButtonConfirm: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: homeScreenTheme.primary,
    alignItems: 'center',
    marginLeft: 8,
  },
  modalButtonTextCancel: {
    fontSize: 16,
    color: homeScreenTheme.white,
    fontWeight: '600',
  },
  modalButtonTextConfirm: {
    fontSize: 16,
    color: homeScreenTheme.white,
    fontWeight: '600',
  },
});

export default ProfileScreen;