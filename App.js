import React, { useEffect, useState } from "react";
import { ThemeProvider } from "./src/context/ThemeContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getSurahList } from "./src/services/api";
import AppNavigator from "./AppNavigator";
import {
  ActivityIndicator,
  View,
  StyleSheet,
  Text,
  SafeAreaView,
  Dimensions
} from "react-native";
import * as Location from 'expo-location';

export default function App() {
  const [isReady, setIsReady] = useState(false);
  const [locationError, setLocationError] = useState(null);

  // Get device dimensions
  const { width, height } = Dimensions.get("window");

  useEffect(() => {
    const initializeApp = async () => {
      try {
        const cachedSurahList = await AsyncStorage.getItem("surahList");
        if (!cachedSurahList) {
          const surahList = await getSurahList();
          await AsyncStorage.setItem("surahList", JSON.stringify(surahList));
        }

        setIsReady(true);
      } catch (error) {
        console.error("Initialization error:", error);
        setLocationError('Failed to initialize the application');
        setIsReady(true); 
      }
    };

    initializeApp();
  }, []);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocationError('Permission to access location was denied');
      }
    })();
  }, []);

  if (!isReady) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        {locationError && (
          <Text style={styles.errorText}>{locationError}</Text>
        )}
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ThemeProvider>
        <AppNavigator />
      </ThemeProvider>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  errorText: {
    marginTop: 10,
    color: 'red',
    textAlign: 'center'
  }
});