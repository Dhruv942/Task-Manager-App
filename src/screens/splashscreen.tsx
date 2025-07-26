import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Platform, StatusBar } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

const SplashScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [showButton, setShowButton] = React.useState(false);

  React.useEffect(() => {
    // Show button after 1 second
    const timer = setTimeout(() => {
      setShowButton(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const handleNext = () => {
    navigation.navigate('Login');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* Top Icon */}
      <View style={styles.iconContainer}>
        <View style={styles.iconBox}>
          <Text style={styles.checkText}>✓</Text>
        </View>
      </View>

      {/* Text Content - left aligned */}
      <View style={styles.textContainer}>
        <Text style={styles.title}>Get things done.</Text>
        <Text style={styles.subtitle}>Just a click away from planning your tasks.</Text>
      </View>

      {/* Pagination dots - left aligned */}
      <View style={styles.dotContainer}>
        <View style={[styles.dot, { backgroundColor: '#A7A6B2' }]} />
        <View style={[styles.dot, { backgroundColor: '#7A73E8' }]} />
        <View style={[styles.dot, { backgroundColor: '#7A73E8' }]} />
    
      </View>

      {/* Next button */}
      {showButton && (
        <TouchableOpacity style={styles.fab} onPress={handleNext}>
          <Text style={styles.arrow}>→</Text>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
};

export default SplashScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 50,
    paddingTop: Platform.OS === 'ios' ? 100 : StatusBar.currentHeight || 100,
  },
  iconContainer: {
   marginTop: 120,
    marginBottom: 50,
  },
  iconBox: {
    width: 90,
    height: 90,
    backgroundColor: '#7A73E8',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkText: {
    fontSize: 38,
    color: '#fff',
    fontWeight: 'bold',
  },
  textContainer: {
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2E2E4C',
    marginBottom:30,
  },
  subtitle: {
    fontSize: 16,
    color: '#A7A6B2',
    lineHeight: 22,
  
  },
  dotContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 50,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  fab: {
    position: 'absolute',
    bottom: 1,
    right: 1,
    backgroundColor: '#407ef1ff',
    width: 250,
    height: 250,
    borderTopLeftRadius: 250,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  arrow: {
    color: '#fff',
    fontSize: 80,
    fontWeight: 'bold',
    right: 50,
    bottom: 50,
    position: 'absolute',
  
  },
});
