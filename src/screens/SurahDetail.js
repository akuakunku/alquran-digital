import React, { useEffect, useState, useContext } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Audio } from "expo-av";
import { getSurahDetail } from "../services/api";
import { ThemeContext } from "../context/ThemeContext";

export default function SurahDetail() {
  const [surah, setSurah] = useState(null);
  const [sound, setSound] = useState(null);
  const [loading, setLoading] = useState(true);
  const route = useRoute();
  const navigation = useNavigation();
  const { nomor } = route.params;
  const { isDarkMode } = useContext(ThemeContext);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const data = await getSurahDetail(nomor);
        setSurah(data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
      setLoading(false);
    }
    fetchData();

    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [nomor]);

  async function toggleAudio(audioUrl) {
    try {
      if (sound) {
        const status = await sound.getStatusAsync();
        
        if (status.isPlaying) {
          await sound.pauseAsync();
          setIsPlaying(false);
          return;
        }
      }
  
      // Jika audio sebelumnya selesai, unload dan reset sound
      if (sound) {
        await sound.unloadAsync();
        setSound(null);
      }
  
      // Muat ulang audio baru
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: audioUrl },
        { shouldPlay: true }
      );
  
      setSound(newSound);
      setIsPlaying(true);
  
      newSound.setOnPlaybackStatusUpdate(async (status) => {
        if (status.didJustFinish) {
          setIsPlaying(false);
          await newSound.unloadAsync(); // Unload setelah selesai
          setSound(null); // Reset state agar bisa diputar ulang
        }
      });
    } catch (error) {
      console.error("Error handling audio:", error);
    }
  }
  
  
  async function playAudio(audioUrl) {
    try {
      if (sound) {
        await sound.unloadAsync();
      }
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: audioUrl },
        { shouldPlay: true }
      );
      setSound(newSound);
      await newSound.playAsync();
    } catch (error) {
      console.error("Error playing audio:", error);
    }
  }

  useEffect(() => {
    const unsubscribe = navigation.addListener("beforeRemove", async () => {
      if (sound) {
        await sound.unloadAsync();
      }
    });
  
    return () => {
      unsubscribe(); 
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [navigation, sound]);
  

  if (loading) {
    return (
      <View style={[styles.loadingContainer, isDarkMode && styles.darkBg]}>
        <ActivityIndicator
          size="large"
          color={isDarkMode ? "#FFD700" : "#007bff"}
        />
        <Text style={[styles.loadingText, isDarkMode && styles.darkText]}>
          📖 Memuat Surah...
        </Text>
      </View>
    );
  }

  if (!surah) {
    return (
      <View style={[styles.errorContainer, isDarkMode && styles.darkBg]}>
        <Text style={[styles.errorText, isDarkMode && styles.darkText]}>
          ❌ Data tidak tersedia.
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, isDarkMode && styles.darkBg]}>
      <View style={[styles.header, isDarkMode && styles.darkHeader]}>
        <TouchableOpacity
          style={styles.mainButton}
          onPress={() => navigation.navigate("AudioScreen", { nomor })}
        >
          <Text style={styles.mainButtonText}>🎧 Dengarkan Murottal</Text>
        </TouchableOpacity>

        <View style={styles.navButtons}>
          {surah.suratSebelumnya ? (
            <TouchableOpacity
              style={[styles.navButton, isDarkMode && styles.darkButton]}
              onPress={() =>
                navigation.replace("SurahDetail", {
                  nomor: surah.suratSebelumnya.nomor,
                })
              }
            >
              <Text style={styles.navButtonText}>
                ← {surah.suratSebelumnya.namaLatin}
              </Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.navButtonDisabled} />
          )}

          {surah.suratSelanjutnya ? (
            <TouchableOpacity
              style={[styles.navButton, isDarkMode && styles.darkButton]}
              onPress={() =>
                navigation.replace("SurahDetail", {
                  nomor: surah.suratSelanjutnya.nomor,
                })
              }
            >
              <Text style={styles.navButtonText}>
                {surah.suratSelanjutnya.namaLatin} →
              </Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.navButtonDisabled} />
          )}
        </View>
      </View>

      <ScrollView style={styles.content}>
        <Text style={[styles.surahTitle, isDarkMode && styles.darkText]}>
          {surah.namaLatin} ({surah.nama})
        </Text>
        <Text style={[styles.surahInfo, isDarkMode && styles.darkText]}>
          {surah.arti} - {surah.jumlahAyat} Ayat - {surah.tempatTurun}
        </Text>
        <Text style={[styles.surahDesc, isDarkMode && styles.darkText]}>
          {surah.deskripsi.replace(/<[^>]+>/g, "")}
        </Text>

        {surah.ayat?.map((item) => (
          <View
            key={item.nomorAyat}
            style={[
              styles.ayatContainer,
              isDarkMode && styles.darkAyatContainer,
            ]}
          >
            <Text style={[styles.ayatArabic, isDarkMode && styles.darkText]}>
              {item.teksArab}
            </Text>
            <Text style={[styles.ayatLatin, isDarkMode && styles.darkText]}>
              {item.teksLatin}
            </Text>
            <Text
              style={[styles.ayatTranslation, isDarkMode && styles.darkText]}
            >
              {item.teksIndonesia}
            </Text>

            <View style={styles.buttonRow}>
              {item.audio?.["01"] && (
               <TouchableOpacity
               onPress={() => toggleAudio(item.audio["01"])}
               style={[styles.playButton, isDarkMode && styles.darkButton]}
             >
               <Text style={styles.buttonText}>
                 {isPlaying ? "⏸ Pause" : "▶ Putar"}
               </Text>
             </TouchableOpacity>
             
              )}
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate("TafsirScreen", {
                    nomor,
                    ayat: item.nomorAyat,
                  })
                }
                style={[styles.tafsirButton, isDarkMode && styles.darkButton]}
              >
                <Text style={styles.buttonText}>📖 Tafsir</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#eef2f3" },
  darkBg: { backgroundColor: "#1c1c1c" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 10, fontSize: 16, color: "#555" },
  darkText: { color: "#ddd" },
  errorContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  errorText: { fontSize: 18, color: "red" },
  header: {
    backgroundColor: "#007bff",
    padding: 20,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  darkHeader: { backgroundColor: "#333" },
  mainButton: {
    backgroundColor: "#28a745",
    padding: 12,
    borderRadius: 50,
    alignItems: "center",
  },
  navButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
    gap: 10,
  },
  navButton: {
    flex: 1,
    backgroundColor: "#0056b3",
    paddingVertical: 12,
    borderRadius: 20,
    alignItems: "center",
  },
  darkButton: {
    backgroundColor: "#444",
  },
  navButtonDisabled: {
    flex: 1,
  },
  navButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  mainButtonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  content: { padding: 20 },
  surahTitle: { fontSize: 24, fontWeight: "bold", textAlign: "center" },
  surahInfo: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 10,
    color: "#555",
  },
  surahDesc: {
    fontSize: 14,
    lineHeight: 22,
    color: "#333",
    textAlign: "center",
  },
  ayatContainer: {
    marginBottom: 15,
    padding: 12,
    backgroundColor: "#fff",
    borderRadius: 12,
  },
  darkAyatContainer: { backgroundColor: "#333" },
  ayatArabic: { fontSize: 20, textAlign: "right", fontWeight: "bold" },
  ayatLatin: { fontSize: 14, fontStyle: "italic", marginTop: 4, color: "#555" },
  ayatTranslation: { fontSize: 13, marginTop: 4, color: "#444" },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  playButton: { backgroundColor: "#28a745", padding: 8, borderRadius: 30 },
  tafsirButton: { backgroundColor: "#007bff", padding: 8, borderRadius: 30 },
  buttonText: { color: "#fff", fontWeight: "bold" },
});
