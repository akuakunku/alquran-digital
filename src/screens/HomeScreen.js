import React, { useEffect, useState, useCallback, useContext } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  SafeAreaView
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { ThemeContext } from "../context/ThemeContext";
import { getSurahList, saveSurahAudio } from "../services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function HomeScreen() {
  const { isDarkMode } = useContext(ThemeContext);
  const [surahList, setSurahList] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigation = useNavigation();

  const fetchSurahList = async () => {
    setRefreshing(true);
    setError(null);
    try {
      const cachedSurahList = await AsyncStorage.getItem("surahList");
      if (cachedSurahList) {
        setSurahList(JSON.parse(cachedSurahList));
      }

      const data = await getSurahList();
      setSurahList(data);
      await AsyncStorage.setItem("surahList", JSON.stringify(data));
    } catch (error) {
      setError(
        "Could not fetch Surah list. Please check your network connection."
      );
      console.error("Error fetching Surah list:", error);
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSurahList();
  }, []);

  const onRefresh = useCallback(() => {
    fetchSurahList();
  }, []);

  return (
    <SafeAreaView style={[styles.container, isDarkMode && styles.darkContainer]}>
      {loading ? (
        <ActivityIndicator size="large" color="#007bff" style={styles.loader} />
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <Text style={styles.errorText}>Please try again.</Text>
          <TouchableOpacity style={styles.reloadButton} onPress={onRefresh}>
            <Text style={styles.reloadButtonText}>Reload</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={surahList}
          keyExtractor={(item) => item.nomor.toString()}
          numColumns={2}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.card, isDarkMode && styles.darkCard]}
              onPress={async () => {
                await saveSurahAudio(item.nomor);
                navigation.navigate("SurahDetail", { nomor: item.nomor });
              }}
            >
              <Text style={[styles.surahNumber, isDarkMode && styles.darkText]}>
                {item.nomor}
              </Text>
              <Text style={[styles.surahLatin, isDarkMode && styles.darkText]}>
                {item.namaLatin}
              </Text>
              <Text
                style={[styles.surahArabic, isDarkMode && styles.darkSubText]}
              >
                {item.nama}
              </Text>
            </TouchableOpacity>
          )}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  darkContainer: {
    backgroundColor: "#121212",
  },
  card: {
    flex: 1,
    margin: 10,
    padding: 15,
    backgroundColor: "#fff",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  darkCard: {
    backgroundColor: "#1e1e1e",
  },
  surahNumber: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#007bff",
  },
  surahLatin: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 5,
    color: "#333",
  },
  surahArabic: {
    fontSize: 14,
    color: "#555",
    marginTop: 3,
  },
  darkText: {
    color: "#fff",
  },
  darkSubText: {
    color: "#bbb",
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    fontSize: 16,
    color: "red",
    marginBottom: 10,
  },
  reloadButton: {
    backgroundColor: "#007bff",
    padding: 10,
    borderRadius: 5,
  },
  reloadButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
