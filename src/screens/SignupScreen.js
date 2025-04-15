import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  FlatList,
  StyleSheet,
} from "react-native";
import globalStyles from "../styles/globalStyles";

const SignupScreen = ({ navigation }) => {
  const [username, setUsername] = useState("");
  const [cnic, setCnic] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [accountType, setAccountType] = useState("Savings");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [dropdownVisible, setDropdownVisible] = useState(false);

  const accountTypes = [
    { label: "Savings", value: "Savings" },
    { label: "Current", value: "Current" },
  ];

  const validateInputs = () => {
    if (!username || !cnic || !email || !password) {
      setErrorMessage("All fields are required");
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrorMessage("Please enter a valid email address");
      return false;
    }
    if (cnic.length !== 13 || isNaN(cnic)) {
      setErrorMessage("Please enter a valid 13-digit CNIC number");
      return false;
    }
    if (password.length < 6) {
      setErrorMessage("Password must be at least 6 characters long");
      return false;
    }
    return true;
  };

  const handleSignup = async () => {
    setErrorMessage("");
    setIsLoading(true);
    try {
      if (!validateInputs()) {
        setIsLoading(false);
        return;
      }
      console.log("Registering user", { username, cnic, email, password, accountType });
      navigation.replace("Login");
    } catch (error) {
      setErrorMessage("Signup failed. Please try again.");
      console.error("Signup error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderDropdownItem = ({ item }) => (
    <TouchableOpacity
      style={styles.dropdownItem}
      onPress={() => {
        setAccountType(item.value);
        setDropdownVisible(false);
      }}
    >
      <Text style={styles.dropdownItemText}>{item.label}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={globalStyles.container}>
      <Text style={globalStyles.title}>Register</Text>

      <TextInput
        style={globalStyles.input}
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
        editable={!isLoading}
      />
      <TextInput
        style={globalStyles.input}
        placeholder="CNIC"
        keyboardType="numeric"
        value={cnic}
        onChangeText={setCnic}
        maxLength={13}
        editable={!isLoading}
      />
      <TextInput
        style={globalStyles.input}
        placeholder="Email"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        editable={!isLoading}
      />
      <TextInput
        style={globalStyles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        editable={!isLoading}
      />

      {/* Custom Dropdown */}
      <TouchableOpacity
        style={[globalStyles.input, styles.dropdownButton]}
        onPress={() => !isLoading && setDropdownVisible(true)}
        disabled={isLoading}
      >
        <Text>{accountType}</Text>
      </TouchableOpacity>

      <Modal
        visible={dropdownVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setDropdownVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          onPress={() => setDropdownVisible(false)}
        >
          <View style={styles.dropdownContainer}>
            <FlatList
              data={accountTypes}
              renderItem={renderDropdownItem}
              keyExtractor={(item) => item.value}
            />
          </View>
        </TouchableOpacity>
      </Modal>

      {errorMessage ? <Text style={globalStyles.error}>{errorMessage}</Text> : null}

      <TouchableOpacity
        style={[globalStyles.button, isLoading && { opacity: 0.7 }]}
        onPress={handleSignup}
        disabled={isLoading}
      >
        <Text style={globalStyles.buttonText}>
          {isLoading ? "Signing Up..." : "Sign Up"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => navigation.navigate("Login")}
        disabled={isLoading}
      >
        <Text style={globalStyles.linkText}>Already have an account? Login</Text>
      </TouchableOpacity>
    </View>
  );
};

// Additional styles for the custom dropdown
const styles = StyleSheet.create({
  dropdownButton: {
    justifyContent: "center",
    paddingHorizontal: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  dropdownContainer: {
    backgroundColor: "white",
    width: "80%",
    maxHeight: 200,
    borderRadius: 5,
    overflow: "hidden",
  },
  dropdownItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  dropdownItemText: {
    fontSize: 16,
  },
});

export default SignupScreen;