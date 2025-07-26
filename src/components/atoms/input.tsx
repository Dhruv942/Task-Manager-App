import React from 'react';
import { TextInput, StyleSheet, TextInputProps, ViewStyle, TextStyle, View } from 'react-native';

interface CustomInputProps extends TextInputProps {
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
}

const CustomInput: React.FC<CustomInputProps> = ({ containerStyle, inputStyle, ...props }) => {
  return (
    <View style={[styles.container, containerStyle]}>
      <TextInput
        style={[styles.input, inputStyle]}
        placeholderTextColor="#888"
        {...props}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
});

export default CustomInput;
