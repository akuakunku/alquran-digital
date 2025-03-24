import React, { useEffect, useState, useCallback, useContext } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { ThemeContext } from "../context/ThemeContext";
import { getSurahList } from "../services/api";

export default function HomeScreen() {
  const { isDarkMode } = useContext(ThemeContext);
  const [surahList, setSurahList] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation();

  const fetchSurahList = async () => {
    setRefreshing(true);
    const data = await getSurahList();
    setSurahList(data);
    setRefreshing(false);
  };

  useEffect(() => {
    fetchSurahList();
  }, []);

  const onRefresh = useCallback(() => {
    fetchSurahList();
  }, []);

  return (
    <View style={[styles.container, isDarkMode && styles.darkContainer]}>
      <FlatList
        data={surahList}
        keyExtractor={(item) => item.nomor.toString()}
        numColumns={2}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.card, isDarkMode && styles.darkCard]}
            onPress={() =>
              navigation.navigate("SurahDetail", { nomor: item.nomor })
            }
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
    </View>
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
});
