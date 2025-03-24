import React, { useEffect, useState, useRef, useContext } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { Audio } from "expo-av";
import { useRoute, useNavigation } from "@react-navigation/native";
import { getSurahDetail } from "../services/api";
import { ThemeContext } from "../context/ThemeContext";
import RNPickerSelect from "react-native-picker-select";

export default function AudioScreen() {
  const [audioUrl, setAudioUrl] = useState(null);
  const [surahName, setSurahName] = useState("");
  const [ayat, setAyat] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedQari, setSelectedQari] = useState("01");

  const route = useRoute();
  const navigation = useNavigation();
  const { nomor } = route.params;
  const { isDarkMode } = useContext(ThemeContext);
  const soundRef = useRef(null);

  const qariList = [
    { id: "01", name: "Abdullah Al-Juhany" },
    { id: "02", name: "Abdul-Muhsin Al-Qasim" },
    { id: "03", name: "Abdurrahman As-Sudais" },
    { id: "04", name: "Ibrahim Al-Dossari" },
    { id: "05", name: "Misyari Rasyid Al-Afasi" },
  ];

  useEffect(() => {
    async function fetchAudio() {
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
        setIsPlaying(false);
      }

      const data = await getSurahDetail(nomor);
      if (data.audioFull && data.audioFull[selectedQari]) {
        setAudioUrl(data.audioFull[selectedQari]);
        setSurahName(`${data.namaLatin} (${data.nama})`);
        setAyat(
          data.ayat.map((item) => ({
            teksArab: item.teksArab,
            teksLatin: item.teksLatin,
            teksIndonesia: item.teksIndonesia,
          }))
        );
      }
    }
    fetchAudio();

    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, [nomor, selectedQari]);

  async function playAudio() {
    try {
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
      }

      if (audioUrl) {
        const { sound } = await Audio.Sound.createAsync(
          { uri: audioUrl },
          { shouldPlay: true }
        );

        soundRef.current = sound;
        setIsPlaying(true);

        sound.setOnPlaybackStatusUpdate((status) => {
          if (status.didJustFinish) {
            setIsPlaying(false);
          }
        });

        await sound.playAsync();
      }
    } catch (error) {
      console.error("Error playing audio:", error);
    }
  }

  async function pauseAudio() {
    if (soundRef.current) {
      await soundRef.current.pauseAsync();
      setIsPlaying(false);
    }
  }

  async function stopAudio() {
    if (soundRef.current) {
      await soundRef.current.stopAsync();
      setIsPlaying(false);
    }
  }

  useEffect(() => {
    const unsubscribe = navigation.addListener("beforeRemove", () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    });

    return unsubscribe;
  }, [navigation]);

  return (
    <View style={[styles.container, isDarkMode && styles.darkBg]}>
   
      <View style={styles.dropdownContainer}>
        <Text style={[styles.dropdownLabel, isDarkMode && styles.darkText]}>
          Pilih Qari:
        </Text>
        <RNPickerSelect
          onValueChange={(value) => setSelectedQari(value)}
          items={qariList.map((qari) => ({
            label: qari.name,
            value: qari.id,
          }))}
          style={{
            inputIOS: styles.dropdown,
            inputAndroid: styles.dropdown,
            viewContainer: styles.dropdownView,
            placeholder: { color: "#aaa" },
          }}
          placeholder={{ label: "Pilih Qari...", value: null }}
          value={selectedQari}
        />
      </View>

      {/* Kontrol Audio */}
      <View style={styles.controlsContainer}>
        <TouchableOpacity
          onPress={isPlaying ? pauseAudio : playAudio}
          style={[
            styles.button,
            { backgroundColor: isPlaying ? "#FFA500" : "#28a745" },
            isDarkMode && styles.darkButton,
          ]}
        >
          <Text style={styles.buttonText}>
            {isPlaying ? "⏸ Pause" : "▶ Play"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={stopAudio}
          style={[
            styles.button,
            { backgroundColor: "#dc3545" },
            isDarkMode && styles.darkButton,
          ]}
        >
          <Text style={styles.buttonText}>⏹ Stop</Text>
        </TouchableOpacity>
      </View>

      <Text style={[styles.surahTitle, isDarkMode && styles.darkText]}>
        🎧 Sedang Memutar: {surahName}
      </Text>

      {/* Daftar Ayat */}
      <ScrollView style={styles.scrollContainer}>
        {ayat.length > 0 ? (
          ayat.map((item, index) => (
            <View
              key={index}
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
            </View>
          ))
        ) : (
          <ActivityIndicator
            size="large"
            color={isDarkMode ? "#FFD700" : "#0000ff"}
          />
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f9fa", padding: 16 },
  darkBg: { backgroundColor: "#1c1c1c" },
  controlsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 10,
  },
  button: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginHorizontal: 8,
    alignItems: "center",
  },
  darkButton: { backgroundColor: "#444" },
  buttonText: { color: "#fff", fontWeight: "bold", fontSize: 14 },
  surahTitle: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
    color: "#333",
  },
  darkText: { color: "#ddd" },
  scrollContainer: { flex: 1 },
  ayatContainer: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    elevation: 3,
  },
  darkAyatContainer: { backgroundColor: "#333" },
  ayatArabic: {
    fontSize: 26,
    textAlign: "right",
    fontWeight: "bold",
    color: "#2c3e50",
  },
  ayatLatin: {
    fontSize: 16,
    fontStyle: "italic",
    textAlign: "left",
    color: "#7f8c8d",
    marginTop: 5,
  },
  ayatTranslation: {
    fontSize: 14,
    textAlign: "left",
    color: "#34495e",
    marginTop: 5,
  },
  dropdownContainer: { marginBottom: 10, borderRadius: 6 },
  dropdownLabel: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 5,
    borderRadius: 6,
  },
  dropdownView: {
    backgroundColor: "#444",
    borderRadius: 6,
    paddingHorizontal: 2,
  },
  dropdown: {
    color: "#fff",
    backgroundColor: "#444",
    paddingVertical: 2,
    fontSize: 16,
  },
});
