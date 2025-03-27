import React, { useEffect, useState, useContext, useRef } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Dimensions,
  SafeAreaView, 
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Audio } from "expo-av";
import { getSurahDetail } from "../services/api";
import { ThemeContext } from "../context/ThemeContext";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function SurahDetail() {
  const [surah, setSurah] = useState(null);
  const [sound, setSound] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentAyat, setCurrentAyat] = useState(null);
  const [loadingStates, setLoadingStates] = useState({});
  const [backgroundAyat, setBackgroundAyat] = useState(null);
  const scrollViewRef = useRef();
  const ayatRefs = useRef({});

  const route = useRoute();
  const navigation = useNavigation();
  const { nomor } = route.params;
  const { isDarkMode } = useContext(ThemeContext);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const cachedSurah = await AsyncStorage.getItem(`surah_${nomor}`);
        if (cachedSurah) {
          setSurah(JSON.parse(cachedSurah));
        } else {
          const data = await getSurahDetail(nomor);
          setSurah(data);
          await AsyncStorage.setItem(`surah_${nomor}`, JSON.stringify(data));
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        Alert.alert("Error", "Could not load Surah details.");
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

  async function toggleAudio(audioUrl, ayat) {
    if (loadingStates[ayat] || !audioUrl) return;
    setLoadingStates((prev) => ({ ...prev, [ayat]: true }));

    try {
      if (sound) {
        await sound.stopAsync();
        await sound.unloadAsync();
        setSound(null);
      }

      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: audioUrl },
        { shouldPlay: true }
      );

      await new Promise((resolve) => {
        setCurrentAyat(ayat);
        setBackgroundAyat(ayat);
        resolve();
      });

      setSound(newSound);
      await newSound.playAsync();
      scrollToAyat(ayat);

      newSound.setOnPlaybackStatusUpdate(async (status) => {
        if (status.didJustFinish) {
          if (ayat < surah.jumlahAyat) {
            const nextAyat = surah.ayat.find(
              (item) => item.nomorAyat === ayat + 1
            );
            if (nextAyat) {
              await new Promise((resolve) => setTimeout(resolve, 100));
              await toggleAudio(nextAyat.audio["05"], nextAyat.nomorAyat);
              scrollToAyat(nextAyat.nomorAyat);
            }
          } else {
            await newSound.stopAsync();
            await newSound.unloadAsync();
            setSound(null);
            setCurrentAyat(null);
            setBackgroundAyat(null);
            scrollViewRef.current.scrollTo({ y: 0, animated: true });
          }
        }
      });
    } catch (error) {
      console.error("Error handling audio:", error);
    } finally {
      setLoadingStates((prev) => ({ ...prev, [ayat]: false }));
    }
  }

  const scrollToAyat = (ayat) => {
    if (ayatRefs.current[ayat]) {
      ayatRefs.current[ayat].measureLayout(
        scrollViewRef.current,
        (x, y, width, height) => {
          const screenHeight = Dimensions.get("window").height;
          const centerOffset = screenHeight / 2 - height / 2;

          scrollViewRef.current.scrollTo({
            y: y - centerOffset,
            animated: true,
          });
        }
      );
    }
  };

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
    <SafeAreaView style={[styles.container, isDarkMode && styles.darkBg]}>
      <View style={[styles.header, isDarkMode && styles.darkHeader]}>
        <TouchableOpacity
          style={styles.mainButton}
          onPress={() => navigation.navigate("AudioScreen", { nomor })}
        >
          <Text style={styles.mainButtonText}>🎧 Dengarkan Audio Murottal Full</Text>
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

      <ScrollView ref={scrollViewRef} style={styles.content}>
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
            ref={(ref) => (ayatRefs.current[item.nomorAyat] = ref)}
            style={[
              styles.ayatContainer,
              isDarkMode && styles.darkAyatContainer,
              backgroundAyat === item.nomorAyat ? styles.activeAyat : null,
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
              {item.audio?.["05"] && (
                <TouchableOpacity
                  onPress={
                    currentAyat === item.nomorAyat
                      ? async () => {
                          if (sound) {
                            await sound.stopAsync();
                            await sound.unloadAsync();
                            setSound(null);
                            setCurrentAyat(null);
                            setBackgroundAyat(null);
                          }
                        }
                      : () => toggleAudio(item.audio["05"], item.nomorAyat)
                  }
                  style={[styles.playButton, isDarkMode && styles.darkButton]}
                >
                  {loadingStates[item.nomorAyat] ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.buttonText}>
                      {currentAyat === item.nomorAyat ? "⏹ Stop" : "▶ Putar"}
                    </Text>
                  )}
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
    </SafeAreaView>
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
    padding: 10,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  darkHeader: { backgroundColor: "#333" },
  mainButton: {
    backgroundColor: "#28a745",
    padding: 10,
    borderRadius: 50,
    alignItems: "center",
  },
  navButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  navButton: {
    flex: 1,
    backgroundColor: "#0056b3",
    paddingVertical: 10,
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
    fontSize: 14,
    fontWeight: "bold",
  },
  mainButtonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  content: { padding: 10 },
  surahTitle: { fontSize: 24, fontWeight: "bold", textAlign: "center" },
  surahInfo: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 10,
    color: "#555",
  },
  surahDesc: {
    fontSize: 12,
    lineHeight: 22,
    color: "#333",
    textAlign: "center",
    marginBottom: 10,
  },
  ayatContainer: {
    marginBottom: 10,
    padding: 12,
    backgroundColor: "#fff",
    borderRadius: 12,
  },
  darkAyatContainer: { backgroundColor: "#333" },
  activeAyat: { backgroundColor: "#007bff", marginBottom: 10 },
  ayatArabic: { fontSize: 24, textAlign: "right", fontWeight: "bold" },
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