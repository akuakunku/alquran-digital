import React, { useEffect, useState, useContext } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  ScrollView,
  StyleSheet,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRoute } from "@react-navigation/native";
import { ThemeContext } from "../context/ThemeContext";
import { getTafsir } from "../services/api";

export default function TafsirScreen() {
  const { isDarkMode } = useContext(ThemeContext);
  const [tafsir, setTafsir] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const route = useRoute();
  const { nomor, ayat } = route.params;

  useEffect(() => {
    async function fetchData() {
      try {
        setError(null);

        if (!ayat) {
          throw new Error("Nomor ayat tidak ditemukan.");
        }
        const cachedData = await AsyncStorage.getItem(
          `tafsir_${nomor}_${ayat}`
        );
        const now = new Date().getTime();

        let tafsirAyat;

        if (cachedData) {
          const { data, timestamp } = JSON.parse(cachedData);

          const CACHE_EXPIRY = 12 * 60 * 60 * 1000;
          if (now - timestamp < CACHE_EXPIRY) {
            console.log(
              `📦 Mengambil data dari cache: tafsir_${nomor}_${ayat}`
            );
            tafsirAyat = data;
            setTafsir(tafsirAyat);
          }
        }
        if (!tafsirAyat) {
          console.log(`🌍 Fetching data dari API: tafsir/${nomor}`);
          const tafsirData = await getTafsir(nomor);

          if (!tafsirData || tafsirData.length === 0) {
            throw new Error("Tafsir tidak tersedia atau format tidak sesuai");
          }
          tafsirAyat = tafsirData.find((item) => item.ayat === ayat);
          if (!tafsirAyat) {
            throw new Error(`Tafsir untuk ayat ${ayat} tidak ditemukan.`);
          }
          const cacheData = { data: tafsirAyat, timestamp: now };
          await AsyncStorage.setItem(
            `tafsir_${nomor}_${ayat}`,
            JSON.stringify(cacheData)
          );
          setTafsir(tafsirAyat);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [nomor, ayat]);

  if (loading) {
    return (
      <View style={[styles.container, isDarkMode && styles.darkContainer]}>
        <ActivityIndicator
          size="large"
          color={isDarkMode ? "#FFD700" : "#0000ff"}
        />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, isDarkMode && styles.darkContainer]}>
        <Text style={[styles.errorText, isDarkMode && styles.darkText]}>
          Error: {error}
        </Text>
      </View>
    );
  }

  if (!tafsir) {
    return (
      <View style={[styles.container, isDarkMode && styles.darkContainer]}>
        <Text style={[styles.noDataText, isDarkMode && styles.darkText]}>
          Tafsir tidak tersedia.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, isDarkMode && styles.darkContainer]}>
      <Text style={[styles.title, isDarkMode && styles.darkText]}>
        Tafsir Surah {nomor} Ayat {ayat}
      </Text>

      <View style={styles.ayatContainer}>
        <Text style={[styles.ayatTitle, isDarkMode && styles.darkText]}>
          Ayat {tafsir.ayat}
        </Text>
        <Text style={[styles.ayatText, isDarkMode && styles.darkSubText]}>
          {tafsir.teks?.replace(/<\/?[^>]+(>|$)/g, "") || "Teks tidak tersedia"}
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: "#f5f5f5",
  },
  darkContainer: {
    backgroundColor: "#121212",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
  },
  darkText: {
    color: "#fff",
  },
  ayatContainer: {
    marginBottom: 15,
  },
  ayatTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  ayatText: {
    fontSize: 16,
    lineHeight: 24,
    color: "#555",
  },
  darkSubText: {
    color: "#bbb",
  },
  errorText: {
    fontSize: 16,
    color: "red",
  },
  noDataText: {
    fontSize: 16,
    color: "gray",
  },
});
