import { Text, View, StyleSheet, Image } from 'react-native';

const PlaceholderImage = require('@/assets/images/react-logo.png');

export default function AboutScreen() {
  return (
    <View style={styles.container}>
      <Image source={PlaceholderImage}/>
      <Text style={styles.text}>About screen</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#25292e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: '#fff',
  },
});
