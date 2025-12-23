/**
 * Personal Finance App - Testing Navigation MINIMAL
 */

import React from 'react';
import {
  StyleSheet,
  Text,
  View
} from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

const Tab = createBottomTabNavigator();

// Dummy screens
function Screen1() {
  return (
    <View style={styles.screen}>
      <Text style={styles.text}>Screen 1</Text>
    </View>
  );
}

function Screen2() {
  return (
    <View style={styles.screen}>
      <Text style={styles.text}>Screen 2</Text>
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Tab.Navigator>
          <Tab.Screen name="Screen1" component={Screen1} />
          <Tab.Screen name="Screen2" component={Screen2} />
        </Tab.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F7FA'
  },
  text: {
    fontSize: 24,
    color: '#2C3E50'
  }
});
