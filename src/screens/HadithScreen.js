import React, { useEffect, useState, useContext } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView, // Importing SafeAreaView
} from "react-native";
import { getBooks } from "../services/hadithapi";
import { ThemeContext } from "../context/ThemeContext";

const HadithScreen = ({ navigation }) => {
  const { isDarkMode } = useContext(ThemeContext);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const fetchedBooks = await getBooks();
        setBooks(fetchedBooks);
        setError("");
      } catch (err) {
        console.error("Error fetching books:", err.message);
        setError("Gagal mengambil daftar buku hadith.");
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, []);

  const handleBookSelect = (bookId, available) => {
    navigation.navigate("HadithDetailScreen", { bookId, available });
  };

  return (
    <SafeAreaView style={[styles.container, isDarkMode && styles.darkContainer]}>
      <Text style={[styles.title, isDarkMode && styles.darkText]}>
        📜 Daftar Buku Hadith
      </Text>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <>
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <FlatList
            data={books}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.bookItem, isDarkMode && styles.darkBookItem]}
                onPress={() => handleBookSelect(item.id, item.available)} // Pass available
              >
                <Text style={[styles.bookText, isDarkMode && styles.darkText]}>
                  {item.name} (Total: {item.available})
                </Text>
              </TouchableOpacity>
            )}
          />
        </>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f9f9f9" },
  darkContainer: { backgroundColor: "#121212" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
  darkText: { color: "#ffffff" },
  error: { color: "red" },
  bookItem: {
    padding: 15,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    marginBottom: 10,
    backgroundColor: "#fff",
  },
  darkBookItem: { backgroundColor: "#333", borderColor: "#555" },
  bookText: { fontSize: 18 },
});

export default HadithScreen;