import React, { useEffect, useState, useContext } from "react";
import {
  View,
  Text,
  Button,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Modal,
  SafeAreaView,
} from "react-native";
import { getHadithRange } from "../services/hadithapi";
import { ThemeContext } from "../context/ThemeContext";

const HadithDetailScreen = ({ route, navigation }) => {
  const { bookId } = route.params;
  const { isDarkMode } = useContext(ThemeContext);
  const [hadiths, setHadiths] = useState([]);
  const [loading, setLoading] = useState(true); 
  const [error, setError] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedHadith, setSelectedHadith] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;

  const scrollViewRef = React.useRef();

  // Function to fetch hadiths
  const fetchHadiths = async (page) => {
    try {
      setLoading(true);
      console.log(`Fetching hadiths for book: ${bookId} (Page: ${page})`);
      const offset = (page - 1) * itemsPerPage;
      const fetchedHadiths = await getHadithRange(bookId, `${offset + 1}-${offset + itemsPerPage}`);
      if (fetchedHadiths.hadiths) {
        setHadiths(fetchedHadiths.hadiths);
      } else {
        throw new Error("Hadith tidak ditemukan.");
      }
      setError("");
    } catch (err) {
      console.error(`Error fetching hadith for ${bookId}:`, err.message);
      setError(`Gagal mengambil hadith: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHadiths(currentPage);
  }, [bookId, currentPage]);

  const handleGetSpecificHadith = (hadith) => {
    setSelectedHadith(hadith);
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setSelectedHadith(null);
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage); 
  };

  useEffect(() => {
    scrollViewRef.current.scrollTo({ y: 0, animated: true });
  }, [currentPage]);

  return (
    <SafeAreaView style={[styles.container, isDarkMode && styles.darkContainer]}>
      <ScrollView ref={scrollViewRef}>
        <Text style={[styles.title, isDarkMode && styles.darkText]}>
          📖 Hadith dari Buku: HR.{bookId}
        </Text>
        {loading ? (
          <ActivityIndicator size="large" color="#0000ff" />
        ) : (
          <>
            {error ? <Text style={styles.error}>{error}</Text> : null}
            {hadiths.length > 0 ? (
              hadiths.map((hadith) => (
                <View
                  key={hadith.number}
                  style={[
                    styles.hadithContainer,
                    isDarkMode && styles.darkHadithContainer,
                  ]}
                >
                  <Text style={[styles.arabText, isDarkMode && styles.darkText]}>
                    {hadith.arab}
                  </Text>
                  <Button
                    title={`📖 Lihat Terjemahan ${hadith.number}`}
                    onPress={() => handleGetSpecificHadith(hadith)}
                  />
                </View>
              ))
            ) : (
              <Text style={styles.error}>Tidak ada hadith yang ditemukan.</Text>
            )}
          </>
        )}

        <View style={styles.pagination}>
          <Button
            title="⬅ Previous"
            onPress={() => currentPage > 1 && handlePageChange(currentPage - 1)}
            disabled={currentPage === 1 || loading} 
          />
          <Button
            title="Next ➡"
            onPress={() => hadiths.length === itemsPerPage && handlePageChange(currentPage + 1)}
            disabled={hadiths.length < itemsPerPage || loading} 
          />
        </View>
        <Button title="⬅ Kembali" onPress={() => navigation.goBack()} />
        {selectedHadith && (
          <Modal
            transparent={true}
            animationType="slide"
            visible={modalVisible}
            onRequestClose={handleCloseModal}
          >
            <View style={[styles.modalContainer, isDarkMode && styles.darkModal]}>
              <View
                style={[
                  styles.modalContent,
                  isDarkMode && styles.darkModalContent,
                ]}
              >
                <Text style={[styles.modalTitle, isDarkMode && styles.darkText]}>
                  Detail Hadith
                </Text>
                <ScrollView>
                  <Text style={[styles.modalText, isDarkMode && styles.darkText]}>
                    📜 {selectedHadith.id}
                  </Text>
                </ScrollView>
                <Button title="Tutup" onPress={handleCloseModal} />
              </View>
            </View>
          </Modal>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f9f9f9" },
  darkContainer: { backgroundColor: "#121212" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
  darkText: { color: "#ffffff" },
  error: { color: "red" },
  hadithContainer: {
    marginBottom: 15,
    padding: 10,
    backgroundColor: "#fff",
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  darkHadithContainer: { backgroundColor: "#333", borderColor: "#555" },
  arabText: {
    fontSize: 20,
    textAlign: "right",
    fontWeight: "bold",
    marginBottom: 10,
  },
  modalContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  darkModal: { backgroundColor: "#00000080" }, 
  modalContent: {
    width: "80%",
    height: "80%",
    padding: 20,
    backgroundColor: "white",
    borderRadius: 10,
    borderWidth: 2,
  },
  darkModalContent: { backgroundColor: "#222", borderColor: "#ffff" },
  modalTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  modalText: { fontSize: 16, marginBottom: 10 },
  pagination: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 20,
  },
});

export default HadithDetailScreen;