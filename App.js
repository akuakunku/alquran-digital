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
import { Audio } from 'expo-av';
import * as Location from 'expo-location';

export default function App() {
  const [isReady, setIsReady] = useState(false);
  const [locationError, setLocationError] = useState(null);
  const [prayerTimes, setPrayerTimes] = useState(null);
  const audio = new Audio.Sound();
  const [isPlaying, setIsPlaying] = useState(false);

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

        // Fetch prayer times based on defined location
        await fetchPrayerTimes(); 

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

  const fetchPrayerTimes = async () => {
    setPrayerTimes([
      { hours: 5, minutes: 0 }, 
      { hours: 12, minutes: 30 },
      { hours: 15, minutes: 45 },
      { hours: 18, minutes: 0 },
      { hours: 19, minutes: 0 }
    ]);
  };

  const playAdhan = async () => {
    if (isPlaying) return;

    try {
      setIsPlaying(true);
      await audio.loadAsync(require('./assets/adzan/adzan-mp3_sheikh_abdul_karim_omar_fatani_al_makki_adzan_fajr.mp3'));
      await audio.playAsync();
    } catch (error) {
      console.error('Error playing adhan sound:', error);
    } finally {
      setIsPlaying(false);
    }
  };

  useEffect(() => {
    const timeouts = [];
    
    const setPrayerAlarms = async () => {
      if (prayerTimes) {
        const now = new Date();
        prayerTimes.forEach((prayerTime) => {
          const prayerDate = new Date();
          prayerDate.setHours(prayerTime.hours, prayerTime.minutes, 0, 0);

          if (prayerDate > now) {
            const timeout = setTimeout(() => {
              playAdhan();
            }, prayerDate - now);
            timeouts.push(timeout);
          }
        });
      }
    };

    setPrayerAlarms();

    return () => {
      timeouts.forEach(timeout => clearTimeout(timeout));
    };
  }, [prayerTimes]);

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