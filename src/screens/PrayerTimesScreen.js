import React, { useContext, useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
} from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import { getCities, getPrayerTimes } from "../services/api";
import { ThemeContext } from "../context/ThemeContext";
import {
  Ionicons,
  MaterialCommunityIcons,
  FontAwesome5,
  MaterialIcons,
} from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";

export default function PrayerTimesScreen() {
  const { isDarkMode } = useContext(ThemeContext);
  const [cities, setCities] = useState([]);
  const [selectedCity, setSelectedCity] = useState(null);
  const [prayerTimes, setPrayerTimes] = useState(null);
  const [loadingCities, setLoadingCities] = useState(false);
  const [loadingPrayerTimes, setLoadingPrayerTimes] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [locationError, setLocationError] = useState(null);
  const [hasRequestedLocationPermission, setHasRequestedLocationPermission] = useState(false);
  const dropdownRef = useRef(null);

  // Function to get the current date for display
  const getCurrentDate = () => {
    const days = [
      "Minggu",
      "Senin",
      "Selasa",
      "Rabu",
      "Kamis",
      "Jumat",
      "Sabtu",
    ];
    const months = [
      "Januari",
      "Februari",
      "Maret",
      "April",
      "Mei",
      "Juni",
      "Juli",
      "Agustus",
      "September",
      "Oktober",
      "November",
      "Desember",
    ];
    const date = new Date();
    return `${days[date.getDay()]}, ${date.getDate()} ${
      months[date.getMonth()]
    } ${date.getFullYear()}`;
  };

  // Request permission to access location
  const requestLocationPermission = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Location permission is required to detect your location.");
    } else {
      setHasRequestedLocationPermission(true);  // Set state to indicate permission has been requested
    }
  };

  // Detect user's current location
  const detectUserLocation = async () => {
    setLoadingLocation(true);
    setLocationError(null);

    try {
      const { coords } = await Location.getCurrentPositionAsync({});
      const geocode = await Location.reverseGeocodeAsync({
        latitude: coords.latitude,
        longitude: coords.longitude,
      });
      const city = geocode[0]?.city || geocode[0]?.region || "Your Location";
      setUserLocation(city);

      const foundCity = cities.find(
        (c) => c.label.toLowerCase() === city.toLowerCase()
      );
      if (foundCity) {
        setSelectedCity(foundCity.value);
        fetchPrayerSchedule();
      } else {
        Alert.alert(
          "City not found",
          "Your detected city is not in the list of cities."
        );
      }
    } catch (error) {
      console.error("Error fetching location:", error);
      setLocationError("Failed to detect location.");
    } finally {
      setLoadingLocation(false);
    }
  };

  // Fetch and initialize cities and prayer times
  useEffect(() => {
    const initializeData = async () => {
      try {
        const cachedLocation = await AsyncStorage.getItem("userLocation");
        if (cachedLocation) {
          const { city } = JSON.parse(cachedLocation);
          setUserLocation(city);
          const foundCity = cities.find(
            (c) => c.label.toLowerCase() === city.toLowerCase()
          );
          if (foundCity) {
            setSelectedCity(foundCity.value);
            fetchPrayerSchedule();
          }
        }

        if (!hasRequestedLocationPermission) {
          await requestLocationPermission();
        }

        setLoadingCities(true);
        const data = await getCities();
        if (Array.isArray(data)) {
          const formattedCities = data
            .map((city) => ({
              label: city.nama || "Tidak diketahui",
              value: city.id ? city.id.toString() : null,
            }))
            .filter((city) => city.value)
            .sort((a, b) => a.label.localeCompare(b.label));

          setCities(formattedCities);
          await detectUserLocation();
        } else {
          Alert.alert("Warning", "City data is not available");
        }
      } catch (error) {
        console.error("Initialization error:", error);
        Alert.alert("Error", "Failed to load initial data");
      } finally {
        setLoadingCities(false);
      }
    };

    initializeData();
  }, [hasRequestedLocationPermission]); // Dependency list includes hasRequestedLocationPermission

  // Fetch prayer schedule based on selected city
  async function fetchPrayerSchedule() {
    if (!selectedCity) {
      Alert.alert("Warning", "Please select a city first!");
      return;
    }

    setLoadingPrayerTimes(true);
    try {
      const date = new Date();
      const data = await getPrayerTimes(
        selectedCity,
        date.getFullYear(),
        date.getMonth() + 1
      );
      const prayerToday = data[date.getDate() - 1];

      if (prayerToday) {
        setPrayerTimes(prayerToday);
      } else {
        Alert.alert("Warning", "No schedule found for today.");
      }
    } catch (error) {
      console.error("Error fetching prayer schedule:", error);
      Alert.alert(
        "Error",
        "Failed to fetch prayer schedule. Please try again later."
      );
    } finally {
      setLoadingPrayerTimes(false);
    }
  }

  // Function to render prayer times
  const renderPrayerTimes = () => {
    if (!prayerTimes) return null;

    const prayerTimeKeys = [
      {
        key: "imsyak",
        label: "Imsak",
        icon: (
          <MaterialCommunityIcons
            name="weather-night"
            size={24}
            color={isDarkMode ? "#FFD700" : "#FF8C00"}
          />
        ),
      },
      {
        key: "shubuh",
        label: "Subuh",
        icon: (
          <Ionicons
            name="partly-sunny-outline"
            size={24}
            color={isDarkMode ? "#87CEFA" : "#1E90FF"}
          />
        ),
      },
      {
        key: "terbit",
        label: "Terbit",
        icon: (
          <Ionicons
            name="sunny-outline"
            size={24}
            color={isDarkMode ? "#FFD700" : "#FF8C00"}
          />
        ),
      },
      {
        key: "dhuha",
        label: "Dhuha",
        icon: (
          <FontAwesome5
            name="sun"
            size={24}
            color={isDarkMode ? "#FFD700" : "#FFA500"}
          />
        ),
      },
      {
        key: "dzuhur",
        label: "Dzuhur",
        icon: (
          <Ionicons
            name="sunny"
            size={24}
            color={isDarkMode ? "#FFD700" : "#FF6347"}
          />
        ),
      },
      {
        key: "ashr",
        label: "Ashar",
        icon: (
          <MaterialIcons
            name="wb-twilight"
            size={24}
            color={isDarkMode ? "#FFA07A" : "#CD853F"}
          />
        ),
      },
      {
        key: "magrib",
        label: "Maghrib",
        icon: (
          <MaterialCommunityIcons
            name="weather-sunset"
            size={24}
            color={isDarkMode ? "#FF6347" : "#8B0000"}
          />
        ),
      },
      {
        key: "isya",
        label: "Isya",
        icon: (
          <MaterialCommunityIcons
            name="weather-night"
            size={24}
            color={isDarkMode ? "#483D8B" : "#4B0082"}
          />
        ),
      },
    ];

    return (
      <View
        style={[
          styles.prayerTimesContainer,
          { backgroundColor: isDarkMode ? "#1e1e1e" : "#fff" },
        ]}
      >
        <View style={styles.dateContainer}>
          <Text
            style={[
              styles.locationText,
              { color: isDarkMode ? "#fff" : "#333" },
            ]}
          >
            {selectedCity
              ? cities.find((c) => c.value === selectedCity)?.label ||
                userLocation ||
                "Unknown location"
              : userLocation || "Unknown location"}
          </Text>
          <Text
            style={[styles.dateText, { color: isDarkMode ? "#fff" : "#333" }]}
          >
            {getCurrentDate()}
          </Text>
          {locationError && (
            <Text
              style={[
                styles.errorText,
                { color: isDarkMode ? "#ff9999" : "#ff3333" },
              ]}
            >
              {locationError}
            </Text>
          )}
        </View>

        <View style={styles.tableHeader}>
          <Text
            style={[
              styles.tableHeaderText,
              { color: isDarkMode ? "#fff" : "#000" },
            ]}
          >
            Time
          </Text>
          <Text
            style={[
              styles.tableHeaderText,
              { color: isDarkMode ? "#fff" : "#000" },
            ]}
          >
            Hour
          </Text>
        </View>
        {prayerTimeKeys.map(({ key, label, icon }) => (
          <View style={styles.tableRow} key={key}>
            <View style={styles.prayerNameContainer}>
              <View style={styles.iconContainer}>{icon}</View>
              <Text
                style={[
                  styles.prayerText,
                  { color: isDarkMode ? "#fff" : "#333" },
                ]}
              >
                {label}
              </Text>
            </View>
            <Text
              style={[
                styles.prayerText,
                { color: isDarkMode ? "#fff" : "#333" },
              ]}
            >
              {prayerTimes[key] || "-"}
            </Text>
          </View>
        ))}
      </View>
    );
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: isDarkMode ? "#121212" : "#f9f9f9" },
      ]}
    >
      <Text style={[styles.title, { color: isDarkMode ? "#fff" : "#333" }]}>
        🕌 Prayer Schedule
      </Text>

      {loadingCities ? (
        <ActivityIndicator size="large" color="#00AEEF" />
      ) : (
        <View style={styles.dropdownContainer}>
          <Dropdown
            ref={dropdownRef}
            style={[styles.dropdown, isDarkMode && styles.dropdownDark]}
            placeholderStyle={[
              styles.placeholderStyle,
              { color: isDarkMode ? "#fff" : "#000" },
            ]}
            selectedTextStyle={[
              styles.selectedTextStyle,
              { color: isDarkMode ? "#fff" : "#000" },
            ]}
            inputSearchStyle={[
              styles.inputSearchStyle,
              {
                color: isDarkMode ? "#fff" : "#000",
                backgroundColor: isDarkMode ? "#333" : "#f5f5f5",
              },
            ]}
            iconStyle={styles.iconStyle}
            data={cities}
            search
            maxHeight={300}
            labelField="label"
            valueField="value"
            placeholder="Select city"
            searchPlaceholder="Search city name..."
            value={selectedCity}
            onChange={(item) => {
              setSelectedCity(item.value);
              if (dropdownRef.current) {
                dropdownRef.current.close();
              }
            }}
            containerStyle={[
              styles.dropdownListContainer,
              isDarkMode && { backgroundColor: "#333" },
            ]}
            itemTextStyle={{
              color: isDarkMode ? "#fff" : "#000",
              fontSize: 16,
            }}
            itemContainerStyle={{
              paddingVertical: 10,
              borderBottomWidth: 1,
              borderBottomColor: isDarkMode ? "#444" : "#eee",
            }}
            activeColor={isDarkMode ? "#444" : "#f0f0f0"}
            searchInputProps={{ autoCorrect: false, autoCapitalize: "none" }}
            flatListProps={{ keyboardShouldPersistTaps: "always" }}
          />
          <TouchableOpacity
            style={styles.locationButton}
            onPress={detectUserLocation}
            disabled={loadingLocation}
          >
            <Ionicons
              name="location"
              size={20}
              color={isDarkMode ? "#fff" : "#00AEEF"}
            />
            <Text
              style={[
                styles.locationButtonText,
                { color: isDarkMode ? "#fff" : "#00AEEF" },
              ]}
            >
              {loadingLocation ? "Detecting..." : "Detect My Location"}
            </Text>
          </TouchableOpacity>

          <Text
            style={[
              styles.locationInfoText,
              { color: isDarkMode ? "#fff" : "#333" },
            ]}
          >
            {loadingLocation
              ? "Determining your location..."
              : userLocation
              ? `Lokasi : ${userLocation}`
              : locationError
              ? locationError
              : "No location detected yet."}
          </Text>
        </View>
      )}

      <TouchableOpacity
        style={styles.button}
        onPress={fetchPrayerSchedule}
        disabled={!selectedCity || loadingPrayerTimes}
      >
        <Text style={styles.buttonText}>
          {loadingPrayerTimes ? "Loading..." : "🔄 View Schedule"}
        </Text>
      </TouchableOpacity>

      {loadingPrayerTimes && <ActivityIndicator size="large" color="#00AEEF" />}

      <ScrollView
        contentContainerStyle={styles.scrollViewContent}
        keyboardShouldPersistTaps="handled"
      >
        {prayerTimes ? (
          renderPrayerTimes()
        ) : (
          <Text
            style={[styles.infoText, { color: isDarkMode ? "#aaa" : "#666" }]}
          >
            Select a city to view the schedule
          </Text>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  locationInfoText: {
    fontSize: 18,
    marginTop: 8,
    textAlign: "center",
  },
  scrollViewContent: {
    paddingBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  infoText: {
    fontSize: 18,
    marginVertical: 10,
    textAlign: "center",
  },
  prayerTimesContainer: {
    marginTop: 20,
    padding: 15,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  dateContainer: {
    paddingBottom: 10,
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    alignItems: "center",
  },
  locationText: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 5,
  },
  dateText: {
    fontSize: 16,
    marginBottom: 5,
  },
  errorText: {
    fontSize: 14,
    textAlign: "center",
    marginTop: 5,
  },
  locationButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
    padding: 8,
  },
  locationButtonText: {
    marginLeft: 5,
    fontSize: 14,
  },
  tableHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    paddingBottom: 10,
    marginBottom: 10,
  },
  tableHeaderText: {
    fontSize: 20,
    fontWeight: "bold",
    flex: 1,
    textAlign: "center",
  },
  tableRow: {
    flexDirection: "row",
    justifyContent: "center",
    paddingVertical: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: "#ddd",
  },
  prayerNameContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconContainer: {
    marginRight: 8,
  },
  prayerText: {
    fontSize: 18,
    textAlign: "center",
    flex: 1,
  },
  button: {
    backgroundColor: "#00AEEF",
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  dropdownContainer: {
    marginBottom: 5,
    justifyContent: "center",
    alignContent: "center",
  },
  dropdown: {
    height: 55,
    borderColor: "#aaa",
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 5,
    backgroundColor: "#fff",
  },
  dropdownDark: {
    backgroundColor: "#333",
    borderColor: "#555",
  },
  placeholderStyle: {
    fontSize: 16,
    color: "#888",
  },
  selectedTextStyle: {
    fontSize: 16,
  },
  iconStyle: {
    width: 24,
    height: 24,
    tintColor: "#666",
  },
  inputSearchStyle: {
    fontSize: 16,
    borderRadius: 8,
  },
  dropdownListContainer: {
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
  },
});