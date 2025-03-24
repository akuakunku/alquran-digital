import AsyncStorage from "@react-native-async-storage/async-storage";

const BASE_URL = "https://equran.id/api/v2";
const CACHE_EXPIRY = 12 * 60 * 60 * 1000; 

async function fetchData(endpoint, cacheKey) {
  try {
    const cachedItem = await AsyncStorage.getItem(cacheKey);
    if (cachedItem) {
      const { data, timestamp } = JSON.parse(cachedItem);
      const now = new Date().getTime();

      if (now - timestamp < CACHE_EXPIRY) {
        console.log(`📦 Mengambil data dari cache: ${cacheKey}`);
        return data;
      }
    }

    console.log(`🌍 Fetching data dari API: ${endpoint}`);
    const response = await fetch(`${BASE_URL}/${endpoint}`);

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const json = await response.json();
    if (!json || !json.data) {
      throw new Error("Format data tidak sesuai");
    }

    const cacheData = { data: json.data, timestamp: new Date().getTime() };
    await AsyncStorage.setItem(cacheKey, JSON.stringify(cacheData));

    return json.data;
  } catch (error) {
    console.error(`❌ Error fetching ${endpoint}:`, error.message);

    return null; 
  }
}

export async function getSurahList() {
  return (await fetchData("surat", "surahList")) || [];
}

export async function getSurahDetail(nomor) {
  return await fetchData(`surat/${nomor}`, `surahDetail_${nomor}`);
}

export async function getTafsir(nomor) {
  const data = await fetchData(`tafsir/${nomor}`, `tafsir_${nomor}`);
  return data?.tafsir || [];
}

export async function getSurahAudio(nomor) {
  const data = await fetchData(`surat/${nomor}`, `surahAudio_${nomor}`);
  return data?.audio || null;
}

export async function saveSurahAudio(nomor) {
  const audioData = await getSurahAudio(nomor);
  if (audioData) {
    await AsyncStorage.setItem(`surahAudio_${nomor}`, JSON.stringify(audioData));
  }
}


export const saveData = async (key, data) => {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error("Gagal menyimpan data:", error);
  }
};

export const getData = async (key) => {
  try {
    const data = await AsyncStorage.getItem(key);
    return data ? JSON.parse(data) : null; 
  } catch (error) {
    console.error("Gagal mengambil data:", error);
    return null;
  }
};
