import React, { useContext, useEffect } from "react";
import { StatusBar, TouchableOpacity, Text, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import HomeScreen from "./src/screens/HomeScreen";
import SurahDetail from "./src/screens/SurahDetail";
import TafsirScreen from "./src/screens/TafsirScreen";
import AudioScreen from "./src/screens/AudioScreen";
import { ThemeProvider, ThemeContext } from "./src/context/ThemeContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getSurahList } from "./src/services/api";

const Stack = createStackNavigator();

function AppNavigator() {
  const { isDarkMode, toggleTheme } = useContext(ThemeContext);

  return (
    <>
      <StatusBar
        barStyle={isDarkMode ? "light-content" : "dark-content"}
        backgroundColor={isDarkMode ? "#1c1c1c" : "#ffffff"}
      />

      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerStyle: { backgroundColor: isDarkMode ? "#333" : "#fff" },
            headerTintColor: isDarkMode ? "#fff" : "#000",
            headerRight: () => (
              <TouchableOpacity
                onPress={toggleTheme}
                style={{
                  marginRight: 15,
                  alignItems: "center",
                  paddingVertical: 5,
                  paddingHorizontal: 10,
                  backgroundColor: isDarkMode ? "#444" : "#ddd",
                  borderRadius: 8,
                }}
              >
                <Text style={{ fontSize: 20 }}>{isDarkMode ? "🌙" : "☀️"}</Text>
                <Text
                  style={{ fontSize: 10, color: isDarkMode ? "#fff" : "#000" }}
                >
                  {isDarkMode ? "Dark" : "Light"}
                </Text>
              </TouchableOpacity>
            ),
          }}
        >
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={{ title: "Al-Quran Digital" }}
          />
          <Stack.Screen
            name="SurahDetail"
            component={SurahDetail}
            options={{ title: "Detail Surah" }}
          />
          <Stack.Screen
            name="TafsirScreen"
            component={TafsirScreen}
            options={{ title: "Tafsir Surah" }}
          />
          <Stack.Screen
            name="AudioScreen"
            component={AudioScreen}
            options={{ title: "Audio Murottal" }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </>
  );
}

export default function App() {
  useEffect(() => {
    const initializeData = async () => {
      const cachedSurahList = await AsyncStorage.getItem("surahList");

      if (!cachedSurahList) {
        const surahList = await getSurahList();
        await AsyncStorage.setItem("surahList", JSON.stringify(surahList));
      }
    };

    initializeData();
  }, []);

  return (
    <ThemeProvider>
      <AppNavigator />
    </ThemeProvider>
  );
}
