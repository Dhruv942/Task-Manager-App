import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

const { width } = Dimensions.get('window');

interface CustomPopupProps {
  visible: boolean;
  type: 'success' | 'error';
  title: string;
  message: string;
  onClose: () => void;
  autoClose?: boolean;
  duration?: number;
}

const CustomPopup: React.FC<CustomPopupProps> = ({
  visible,
  type,
  title,
  message,
  onClose,
  autoClose = true,
  duration = 3000,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();

      if (autoClose) {
        const timer = setTimeout(() => {
          hidePopup();
        }, duration);
        return () => clearTimeout(timer);
      }
    }
  }, [visible]);

  const hidePopup = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      onClose();
    });
  };

  if (!visible) return null;

  const getIconName = () => {
    return type === 'success' ? 'check-circle' : 'exclamation-circle';
  };

  const getIconColor = () => {
    return type === 'success' ? '#4CAF50' : '#F44336';
  };

  const getBackgroundColor = () => {
    return type === 'success' ? '#E8F5E8' : '#FFEBEE';
  };

  const getBorderColor = () => {
    return type === 'success' ? '#4CAF50' : '#F44336';
  };

  const getIconBgColor = () => {
    return type === 'success' ? 'rgba(76,175,80,0.12)' : 'rgba(244,67,54,0.12)';
  };

  return (
    <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
      <View
        style={[
          styles.popup,
          {
            backgroundColor: getBackgroundColor(),
            borderColor: getBorderColor(),
          },
        ]}
      >
        <View style={[styles.iconCircle, { backgroundColor: getIconBgColor() }]}>
          <Icon name={getIconName()} size={38} color={getIconColor()} />
        </View>
        
        <Text style={[styles.title, { color: getBorderColor() }]}>
          {title}
        </Text>
        
        <Text style={styles.message}>{message}</Text>
        
        <TouchableOpacity style={[styles.closeButton, { backgroundColor: getBorderColor() }]} onPress={hidePopup}>
          <Text style={styles.closeButtonText}>OK</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  popup: {
    width: width * 0.85,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 25,
    alignItems: 'center',
    borderWidth: 2,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 6,
    elevation: 3,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  message: {
    fontSize: 17,
    color: '#555',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 28,
  },
  closeButton: {
    paddingHorizontal: 36,
    paddingVertical: 14,
    borderRadius: 25,
    minWidth: 120,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 2,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 0.2,
  },
});

export default CustomPopup; 