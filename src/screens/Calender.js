import React, { useState, useContext } from "react";
import {
  View,
  Text,
  Button,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  ScrollView,
  SafeAreaView,
  Platform,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { Table, Row } from "react-native-table-component";
import { ThemeContext } from "../context/ThemeContext";

const { width } = Dimensions.get("window");

const lightTheme = {
  background: "#f5f5f5",
  text: "#333",
  primary: "#007AFF",
  inputBackground: "#007AFF",
  border: "#ccc",
  error: "red",
  tableHeader: "#f1f8ff",
  tableRowEven: "white",
  tableRowOdd: "#f9f9f9",
  holidayText: "#d32f2f",
  specialDayText: "#007AFF",
};

const darkTheme = {
  background: "#121212",
  text: "#eba534",
  primary: "#BB86FC",
  inputBackground: "#1E1E1E",
  border: "#333",
  error: "#CF6679",
  tableHeader: "#1E1E1E",
  tableRowEven: "#242424",
  tableRowOdd: "#1E1E1E",
  holidayText: "#f44336",
  specialDayText: "#007AFF",
};

// Constants
const months = [
  { label: "Januari", value: 1 },
  { label: "Februari", value: 2 },
  { label: "Maret", value: 3 },
  { label: "April", value: 4 },
  { label: "Mei", value: 5 },
  { label: "Juni", value: 6 },
  { label: "Juli", value: 7 },
  { label: "Agustus", value: 8 },
  { label: "September", value: 9 },
  { label: "Oktober", value: 10 },
  { label: "November", value: 11 },
  { label: "Desember", value: 12 },
];

const hijriMonths = [
  "Muharram",
  "Safar",
  "Rabi al-Awwal",
  "Rabi al-Thani",
  "Jumada al-Awwal",
  "Jumada al-Thani",
  "Rajab",
  "Sha'ban",
  "Ramadan",
  "Shawwal",
  "Dhu al-Qa'dah",
  "Dhu al-Hijjah",
];

const weekdays = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

const Calendar = () => {
  const { isDarkMode } = useContext(ThemeContext);
  const theme = isDarkMode ? darkTheme : lightTheme;
  const styles = getStyles(theme);

  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [calendarData, setCalendarData] = useState([]);
  const [specialDays, setSpecialDays] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchHijriCalendar = async () => {
    setLoading(true);
    setError(null);
  
    try {
      // Fetch special days first if not already loaded
      if (specialDays.length === 0) {
        const specialDaysResponse = await fetch("https://api.aladhan.com/v1/specialDays");
        if (!specialDaysResponse.ok) {
          throw new Error("Gagal mengambil data hari khusus");
        }
        const specialDaysData = await specialDaysResponse.json();
        setSpecialDays(specialDaysData.data || []);
      }
  
      // Gunakan parameter khusus untuk Indonesia
      const response = await fetch(
        `https://api.aladhan.com/v1/gToHCalendar/${month}/${year}?calendarMethod=HJCoSA&timezone=Asia/Jakarta&latitude=-6.2088&longitude=106.8456`
      );
      
      if (!response.ok) {
        throw new Error("Gagal mengambil data kalender");
      }
      
      const data = await response.json();
      setCalendarData(data.data || []);
      
    } catch (err) {
      setError(err.message);
      setCalendarData([]);
    } finally {
      setLoading(false);
    }
  };

  // Fungsi untuk mendapatkan nama hari khusus berdasarkan tanggal Hijriah
  const getSpecialDayName = (hijriMonth, hijriDay) => {
    const foundDay = specialDays.find(
      (day) => day.month === hijriMonth && day.day === hijriDay
    );
    return foundDay ? foundDay.name : null;
  };

  const tableHead = [
    "Tanggal",
    "Hari",
    "Gregorian",
    "Hijriah",
    "Hari Penting",
    "Hari Khusus",
  ];
  const widthArr = [60, 60, 120, 120, 150, 150];

  const tableData = calendarData.map((item) => {
    const gregDate = new Date(item.gregorian.date);
    const dayOfWeek = weekdays[gregDate.getDay()];
    const hijriMonthName = hijriMonths[parseInt(item.hijri.month.number) - 1];
    const hijriMonthNum = parseInt(item.hijri.month.number);
    const hijriDay = parseInt(item.hijri.day);

    // Ambil data hari penting jika ada
    const holidays = item.hijri.holidays || [];
    const adjustedHolidays = item.hijri.adjustedHolidays || [];
    const allHolidays = [...holidays, ...adjustedHolidays];
    const holidayText = allHolidays.join(", ") || "-";

    // Ambil data hari khusus
    const specialDayName = getSpecialDayName(hijriMonthNum, hijriDay);
    const specialDayText = specialDayName || "-";

    return [
      String(item.gregorian.day),
      dayOfWeek,
      `${item.gregorian.day} ${months[month - 1].label}`,
      `${item.hijri.day} ${hijriMonthName}`,
      holidayText,
      specialDayText,
    ];
  });

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <Text style={styles.title}>Kalender Gregorian ke Hijri</Text>

        <View style={styles.pickerWrapper}>
          <Text style={styles.label}>Pilih Bulan</Text>
          <View
            style={[
              styles.pickerContainer,
              { backgroundColor: theme.inputBackground },
            ]}
          >
            <Picker
              selectedValue={month}
              style={[
                styles.picker,
                {
                  color: theme.text,
                  width: Platform.OS === "ios" ? "100%" : undefined,
                },
              ]}
              dropdownIconColor={theme.text}
              mode="dropdown"
              onValueChange={setMonth}
              theme={isDarkMode ? "dark" : "light"}
            >
              {months.map((monthOption) => (
                <Picker.Item
                  key={monthOption.value}
                  label={monthOption.label}
                  value={monthOption.value}
                  color={theme.text}
                />
              ))}
            </Picker>
          </View>
        </View>

        <View style={styles.pickerWrapper}>
          <Text style={styles.label}>Pilih Tahun</Text>
          <View
            style={[
              styles.pickerContainer,
              { backgroundColor: theme.inputBackground },
            ]}
          >
            <Picker
              selectedValue={year}
              style={[
                styles.picker,
                {
                  color: theme.text,
                  width: Platform.OS === "ios" ? "100%" : undefined,
                },
              ]}
              dropdownIconColor={theme.text}
              mode="dropdown"
              onValueChange={setYear}
              theme={isDarkMode ? "dark" : "light"}
            >
              {Array.from({ length: 11 }, (_, i) => 2020 + i).map(
                (yearOption) => (
                  <Picker.Item
                    key={yearOption}
                    label={String(yearOption)}
                    value={yearOption}
                    color={theme.text}
                  />
                )
              )}
            </Picker>
          </View>
        </View>

        <Button
          title="Tampilkan Kalender"
          onPress={fetchHijriCalendar}
          disabled={loading}
          color={theme.primary}
        />

        {loading ? (
          <ActivityIndicator size="large" color={theme.primary} />
        ) : error ? (
          <Text style={styles.error}>{error}</Text>
        ) : calendarData.length > 0 ? (
          <>
            <View style={styles.calendarHeader}>
              <Text style={styles.monthYearText}>
                {months[month - 1].label} {year}
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={{ marginTop: 8 }}
              >
                <View style={styles.holidaysContainer}>
                  {calendarData
                    .filter(
                      (item) =>
                        item.hijri.holidays?.length > 0 ||
                        item.hijri.adjustedHolidays?.length > 0
                    )
                    .map((item, index) => (
                      <View key={index} style={{ marginRight: 8 }}>
                        <Text style={styles.noteText}>
                          {item.gregorian.day} {months[month - 1].label}:{" "}
                          {[
                            ...(item.hijri.holidays || []),
                            ...(item.hijri.adjustedHolidays || []),
                          ].join(", ")}
                        </Text>
                      </View>
                    ))}
                </View>
              </ScrollView>
            </View>

            <ScrollView horizontal={true}>
              <View>
                <Table borderStyle={styles.tableBorder}>
                  <Row
                    data={tableHead}
                    widthArr={widthArr}
                    style={[
                      styles.header,
                      { backgroundColor: theme.tableHeader },
                    ]}
                    textStyle={styles.headerText}
                  />
                  {tableData.map((rowData, index) => (
                    <Row
                      key={`row-${index}`}
                      data={rowData}
                      widthArr={widthArr}
                      style={{
                        backgroundColor:
                          index % 2 === 0
                            ? theme.tableRowEven
                            : theme.tableRowOdd,
                      }}
                      textStyle={[
                        styles.rowText,
                        // Warna khusus untuk kolom hari penting
                        rowData[4] !== "-"
                          ? { color: theme.holidayText }
                          : null,
                        // Warna khusus untuk kolom hari khusus
                        rowData[5] !== "-"
                          ? { color: theme.specialDayText }
                          : null,
                      ]}
                    />
                  ))}
                </Table>
              </View>
            </ScrollView>
          </>
        ) : (
          <Text style={styles.noDataText}>Data kalender tidak tersedia</Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const getStyles = (theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
      padding: 10,
    },
    title: {
      fontSize: 20,
      fontWeight: "bold",
      marginBottom: 20,
      textAlign: "center",
      color: theme.text,
    },
    pickerWrapper: {
      marginBottom: 15,
    },
    label: {
      fontWeight: "bold",
      marginBottom: 5,
      fontSize: 16,
      color: theme.text,
    },
    pickerContainer: {
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 5,
      overflow: "hidden",
    },
    picker: {
      height: 50,
    },
    error: {
      color: theme.error,
      marginVertical: 10,
      textAlign: "center",
    },
    noDataText: {
      color: theme.text,
      textAlign: "center",
      marginTop: 20,
    },
    holidaysContainer: {
      flexDirection: "row",
      marginTop: 8,
      paddingVertical: 8,
      paddingHorizontal: Platform.OS === "ios" ? 8 : 0,
    },
    noteText: {
      marginRight: 8,
      color: theme.holidayText,
      backgroundColor: theme.tableRowOdd,
      paddingHorizontal: 6,
      paddingVertical: 4,
      borderRadius: 4,
      fontSize: 12,
    },
    calendarHeader: {
      marginVertical: 15,
      alignItems: "center",
    },
    monthYearText: {
      fontSize: 18,
      fontWeight: "bold",
      color: theme.text,
    },
    tableBorder: {
      borderWidth: 1,
      borderColor: theme.border,
    },
    header: {
      height: 40,
    },
    headerText: {
      margin: 6,
      fontWeight: "bold",
      textAlign: "center",
      color: theme.text,
    },
    rowText: {
      margin: 6,
      textAlign: "center",
      color: theme.text,
    },
  });

export default Calendar;