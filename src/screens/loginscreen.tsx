import React, { useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, SafeAreaView, Platform, StatusBar, KeyboardAvoidingView, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../config/firebaseconfig';
import CustomInput from '../components/atoms/input';
import CustomButton from '../components/atoms/Button';
import CustomPopup from '../components/atoms/CustomPopup';
import GoogleIcon from '../components/atoms/svg/googleicon';
import FacebookIcon from '../components/atoms/svg/facebook';
import AppleIcon from '../components/atoms/svg/apple';

const LoginScreen = ({ navigation }: any) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [popup, setPopup] = useState<{
    visible: boolean;
    type: 'success' | 'error';
    title: string;
    message: string;
  }>({
    visible: false,
    type: 'success',
    title: '',
    message: '',
  });

  const showPopup = (type: 'success' | 'error', title: string, message: string) => {
    setPopup({
      visible: true,
      type,
      title,
      message,
    });
  };

  const hidePopup = () => {
    setPopup(prev => ({ ...prev, visible: false }));
  };

  const handleLogin = async () => {
    if (!email || !password) {
      return showPopup('error', 'Error', 'Please fill in all fields');
    }
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      showPopup('success', 'Success', 'Logged in successfully!');
      console.log(userCredential.user);
      setTimeout(() => {
        navigation.navigate('MainTabs');
      }, 1500);
    } catch (error: any) {
      showPopup('error', 'Login Failed', error.message);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      <KeyboardAvoidingView 
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Logo and Title Section */}
          <View style={styles.headerSection}>
            <View style={styles.iconContainer}>
              <View style={styles.iconBox}>
                <Text style={styles.checkText}>✓</Text>
              </View>
              {/* Scattered dots */}
              <View style={[styles.dot, styles.dot1]} />
              <View style={[styles.dot, styles.dot2]} />
              <View style={[styles.dot, styles.dot3]} />
              <View style={[styles.dot, styles.dot4]} />
              <View style={[styles.dot, styles.dot5]} />
            </View>
            <Text style={styles.title}>Welcome back!</Text>
          </View>

          {/* Form Section */}
          <View style={styles.formSection}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>EMAIL ADDRESS</Text>
              <View style={styles.inputContainer}>
                <CustomInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder="Enter your email"
                  containerStyle={styles.input}
                  inputStyle={styles.inputContent}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                {email && email.includes('@') && (
                  <View style={styles.validationIcon}>
                    <Icon name="check" size={12} color="#fff" />
                  </View>
                )}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.passwordHeader}>
                <Text style={styles.inputLabel}>PASSWORD</Text>
                <TouchableOpacity>
                  <Text style={styles.forgotPassword}>Forgot password?</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.inputContainer}>
                <CustomInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Enter your password"
                  secureTextEntry={!showPassword}
                  containerStyle={styles.input}
                  inputStyle={styles.inputContent}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity 
                  style={styles.passwordToggle}
                  onPress={togglePasswordVisibility}
                >
                  <Icon name={showPassword ? "eye-slash" : "eye"} size={16} color="#7A73E8" />
                </TouchableOpacity>
              </View>
            </View>

            <CustomButton
              title="Log in"
              onPress={handleLogin}
              containerStyle={styles.button}
            />
          </View>

          {/* Social Login Section */}
          <View style={styles.socialSection}>
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or log in with</Text>
              <View style={styles.dividerLine} />
            </View>
            
            <View style={styles.socialContainer}>
              <TouchableOpacity style={[styles.socialButton, { backgroundColor: '#fff' }]}>
                <FacebookIcon width={22} height={22} />
              </TouchableOpacity>
              <TouchableOpacity style={[styles.socialButton, { backgroundColor: '#fff' }]}>
                <GoogleIcon width={22} height={22} />
              </TouchableOpacity>
              <TouchableOpacity style={[styles.socialButton, { backgroundColor: '#fff' }]}>
                <AppleIcon width={20} height={20} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Footer Section */}
          <View style={styles.footerSection}>
            <Text style={styles.footerText}>
              Don't have an account? <Text style={styles.loginLink} onPress={() => navigation.navigate('SignUp')}>Get started!</Text>
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      
      <CustomPopup
        visible={popup.visible}
        type={popup.type}
        title={popup.title}
        message={popup.message}
        onClose={hidePopup}
      />
    </SafeAreaView>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 60 : StatusBar.currentHeight || 60,
    paddingBottom: 20,
  },
  headerSection: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingTop: 60,
  },
  iconContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  iconBox: {
    width: 70,
    height: 70,
    backgroundColor: '#7A73E8',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#7A73E8',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  checkText: {
    fontSize: 32,
    color: '#fff',
    fontWeight: 'bold',
  },
  dot: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dot1: {
    backgroundColor: '#FF6B35',
    top: -10,
    right: -5,
  },
  dot2: {
    backgroundColor: '#4FC3F7',
    top: 10,
    right: -15,
  },
  dot3: {
    backgroundColor: '#FF6B35',
    bottom: -5,
    left: -10,
  },
  dot4: {
    backgroundColor: '#4FC3F7',
    bottom: 15,
    right: 5,
  },
  dot5: {
    backgroundColor: '#FF6B35',
    top: 50,
    left: -20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 6,
    textAlign: 'center',
  },
  formSection: {
    paddingVertical: 10,
  },
  inputGroup: {
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  passwordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  forgotPassword: {
    fontSize: 12,
    color: '#7A73E8',
    fontWeight: '500',
  },
  inputContainer: {
    position: 'relative',
  },
  input: {
    marginBottom: 0,
    width: '100%',
  },
  inputContent: {
    borderRadius: 12,
    backgroundColor: "#fff",
    borderColor: '#e9ecef',
    borderWidth: 1,
    color: "#333",
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    paddingRight: 40,
  },
  validationIcon: {
    position: 'absolute',
    right: 12,
    top: '50%',
    transform: [{ translateY: -8 }],
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#7A73E8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  passwordToggle: {
    position: 'absolute',
    right: 12,
    top: '50%',
    transform: [{ translateY: -8 }],
    padding: 4,
  },
  button: {
    marginTop: 15,
    marginBottom: 15,
    borderRadius: 12,
    paddingVertical: 14,
    width: '100%',
    backgroundColor: '#7A73E8',
    shadowColor: '#7A73E8',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  socialSection: {
    paddingVertical: 15,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e9ecef',
  },
  dividerText: {
    fontSize: 12,
    color: '#666',
    marginHorizontal: 12,
    fontWeight: '500',
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
  },
  socialButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    padding: 4,
  },
  socialText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  footerSection: {
    paddingVertical: 15,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  loginLink: {
    color: '#7A73E8',
    fontWeight: '600',
  },
});
