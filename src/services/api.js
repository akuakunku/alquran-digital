import AsyncStorage from "@react-native-async-storage/async-storage";

const BASE_URL = "https://equran.id/api/v2";
const PRAYER_API_BASE = "https://raw.githubusercontent.com/lakuapik/jadwalsholatorg/master";
const CACHE_EXPIRY = 12 * 60 * 60 * 1000; // 12 hours cache

async function fetchData(endpoint, cacheKey, baseUrl) {
  try {
    const cachedItem = await AsyncStorage.getItem(cacheKey);
    
    if (cachedItem) {
      const { data, timestamp } = JSON.parse(cachedItem);
      const now = new Date().getTime();
      if (now - timestamp < CACHE_EXPIRY) {
      //  console.log(`📦 Mengambil data dari cache: ${cacheKey}`);
        return data;
      }
    }

// console.log(`🌍 Fetching data dari API: ${endpoint}`);
    const response = await fetch(`${baseUrl}/${endpoint}`);

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const json = await response.json();
    const responseData = json.data || json;
    
    if (!responseData) {
      throw new Error("Format data tidak sesuai");
    }

    const cacheData = { data: responseData, timestamp: new Date().getTime() };
    await AsyncStorage.setItem(cacheKey, JSON.stringify(cacheData));

    return responseData;
  } catch (error) {
 //   console.error(`❌ Error fetching ${endpoint}:`, error.message);
    return null; 
  }
}

// Quran API Functions
export async function getSurahList() {
  return (await fetchData("surat", "surahList", BASE_URL)) || [];
}

export async function getSurahDetail(nomor) {
  return await fetchData(`surat/${nomor}`, `surahDetail_${nomor}`, BASE_URL);
}

export async function getTafsir(nomor) {
  const data = await fetchData(`tafsir/${nomor}`, `tafsir_${nomor}`, BASE_URL);
  return data?.tafsir || [];
}

export async function getSurahAudio(nomor) {
  const data = await fetchData(`surat/${nomor}`, `surahAudio_${nomor}`, BASE_URL);
  return data?.audio || null;
}

export async function saveSurahAudio(nomor) {
  const audioData = await getSurahAudio(nomor);
  if (audioData) {
    await AsyncStorage.setItem(`surahAudio_${nomor}`, BASE_URL, JSON.stringify(audioData));
  }
}

// Prayer Times API Functions
export async function getCities() {
  const data = await fetchData("kota.json", "prayerCities", PRAYER_API_BASE);
  
  if (!Array.isArray(data)) {
  //  console.error("❌ Data kota tidak valid:", data);
    return [];
  }

  return data.map((city) => ({
    id: city.id || city,
    nama: city.nama
      ? city.nama.charAt(0).toUpperCase() + city.nama.slice(1)
      : city,
  }));
}

export async function getPrayerTimes(cityId, year, month) {
  if (!cityId || !year || !month) {
 //   console.error("❌ cityId, year, dan month diperlukan!");
    return [];
  }

  const endpoint = `adzan/${cityId}/${year}/${String(month).padStart(2, "0")}.json`;
  const cacheKey = `prayerTimes_${cityId}_${year}_${month}`;

  const data = await fetchData(endpoint, cacheKey, PRAYER_API_BASE);
  return Array.isArray(data) ? data : [];
}

// Storage Functions
export async function saveData(key, data) {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
  //  console.error("❌ Gagal menyimpan data:", error);
  }
}

export async function getData(key) {
  try {
    const data = await AsyncStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
  //  console.error("❌ Gagal mengambil data:", error);
    return null;
  }
}