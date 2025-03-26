import React, { useContext } from "react";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { StatusBar, Text, TouchableOpacity, View, SafeAreaView } from "react-native";

import HomeScreen from "./src/screens/HomeScreen";
import SurahDetail from "./src/screens/SurahDetail";
import TafsirScreen from "./src/screens/TafsirScreen";
import AudioScreen from "./src/screens/AudioScreen";
import PrayerTimesScreen from "./src/screens/PrayerTimesScreen";
import DoaScreen from "./src/screens/DoaScreen";
import { ThemeContext } from "./src/context/ThemeContext";
import HadithScreen from "./src/screens/HadithScreen";
import HadithDetailScreen from "./src/screens/HadithDetailScreen";

const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();

function StackNavigator() {
  return (
    <Stack.Navigator screenOptions={{
      headerShown: false,
      cardStyle: { backgroundColor: 'transparent' },
      gestureEnabled: false,
    }}>
      <Stack.Screen name="MainHome" component={HomeScreen} />
      <Stack.Screen name="SurahDetail" component={SurahDetail} />
      <Stack.Screen name="TafsirScreen" component={TafsirScreen} />
      <Stack.Screen name="AudioScreen" component={AudioScreen} />
      <Stack.Screen name="DoaScreen" component={DoaScreen} />
      <Stack.Screen name="HadithScreen" component={HadithScreen} />
      <Stack.Screen
        name="HadithDetailScreen"
        component={HadithDetailScreen}
        options={{ title: "Detail Hadith" }}
      />
    </Stack.Navigator>
  );
}

function CustomDrawerContent({ navigation }) {
  const { isDarkMode, toggleTheme } = useContext(ThemeContext);

  return (
    <View style={{ flex: 1, backgroundColor: isDarkMode ? "#333" : "#fff" }}>
      <TouchableOpacity
        onPress={toggleTheme}
        style={{
          padding: 15,
          backgroundColor: isDarkMode ? "#444" : "#ddd",
          margin: 10,
          borderRadius: 8,
        }}
      >
        <Text style={{ fontSize: 18, color: isDarkMode ? "#fff" : "#000" }}>
          {isDarkMode ? "🌙 Dark Mode" : "☀️ Light Mode"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate("MainHome")}>
        <Text
          style={{
            fontSize: 18,
            padding: 15,
            color: isDarkMode ? "#fff" : "#000",
          }}
        >
          🏠 Home
        </Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate("PrayerTimes")}>
        <Text
          style={{
            fontSize: 18,
            padding: 15,
            color: isDarkMode ? "#fff" : "#000",
          }}
        >
          🕌 Jadwal Sholat
        </Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate("DoaScreen")}>
        <Text
          style={{
            fontSize: 18,
            padding: 15,
            color: isDarkMode ? "#fff" : "#000",
          }}
        >
          🙏 Doa Harian
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() =>
          navigation.navigate("HadithStack", { screen: "HadithScreen" })
        }
      >
        <Text
          style={{
            fontSize: 18,
            padding: 15,
            color: isDarkMode ? "#fff" : "#000",
          }}
        >
          📜 Hadith
        </Text>
      </TouchableOpacity>
    </View>
  );
}

function HadithStackNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="HadithScreen"
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="HadithScreen" component={HadithScreen} />
      <Stack.Screen name="HadithDetailScreen" component={HadithDetailScreen} />
    </Stack.Navigator>
  );
}

export default function AppNavigator() {
  const { isDarkMode } = useContext(ThemeContext);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <StatusBar
        barStyle={isDarkMode ? "light-content" : "dark-content"}
        backgroundColor={isDarkMode ? "#1c1c1c" : "#ffffff"}
      />
      <NavigationContainer>
        <Drawer.Navigator
          drawerContent={(props) => <CustomDrawerContent {...props} />}
          screenOptions={{
            headerStyle: { backgroundColor: isDarkMode ? "#333" : "#fff" },
            headerTintColor: isDarkMode ? "#fff" : "#000",
          }}
        >
          <Drawer.Screen
            name="MainHome"
            component={StackNavigator}
            options={{ title: "Al-Quran Digital" }}
          />
          <Drawer.Screen
            name="PrayerTimes"
            component={PrayerTimesScreen}
            options={{ title: "Jadwal Sholat" }}
          />
          <Drawer.Screen
            name="DoaScreen"
            component={DoaScreen}
            options={{ title: "Doa Harian" }}
          />
          <Drawer.Screen
            name="HadithStack"
            component={HadithStackNavigator}
            options={{ title: "Hadith" }}
          />
        </Drawer.Navigator>
      </NavigationContainer>
    </SafeAreaView>
  );
}