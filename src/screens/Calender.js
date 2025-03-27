import React, { useState } from "react";
import {
  View,
  Text,
  Button,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  ScrollView,
  SafeAreaView,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { Table, Row, Rows } from "react-native-table-component";

const { width } = Dimensions.get("window");

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
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [calendarData, setCalendarData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchHijriCalendar = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `https://api.aladhan.com/v1/gToHCalendar/${month}/${year}?calendarMethod=HJCoSA`
      );
      if (!response.ok) {
        throw new Error("Gagal mengambil data kalender");
      }
      const data = await response.json();
      setCalendarData(data.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const tableHead = ["Tanggal", "Hari", "Gregorian", "Hijriah"];
  const widthArr = [60, 60, 120, 120];

  const tableData = calendarData.map((item) => {
    const gregDate = new Date(item.gregorian.date);
    const dayOfWeek = weekdays[gregDate.getDay()];
    const hijriMonthName = hijriMonths[parseInt(item.hijri.month.number) - 1];

    return [
      String(item.gregorian.day), 
      dayOfWeek,
      `${item.gregorian.day} ${months[month - 1].label}`,
      `${item.hijri.day} ${hijriMonthName}`,
    ];
  });

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <Text style={styles.title}>Kalender Gregorian ke Hijri</Text>

        <View style={styles.pickerContainer}>
          <Text style={styles.label}>Pilih Bulan</Text>
          <Picker
            selectedValue={month}
            style={styles.picker}
            onValueChange={setMonth}
          >
            {months.map((monthOption) => (
              <Picker.Item
                key={monthOption.value}
                label={monthOption.label}
                value={monthOption.value}
              />
            ))}
          </Picker>

          <Text style={styles.label}>Pilih Tahun</Text>
          <Picker
            selectedValue={year}
            style={styles.picker}
            onValueChange={setYear}
          >
            {Array.from({ length: 11 }, (_, i) => 2020 + i).map((yearOption) => (
              <Picker.Item
                key={yearOption}
                label={String(yearOption)}
                value={yearOption}
              />
            ))}
          </Picker>
        </View>

        <Button
          title="Tampilkan Kalender"
          onPress={fetchHijriCalendar}
          disabled={loading}
        />

        {loading ? (
          <ActivityIndicator size="large" color="#0000ff" />
        ) : error ? (
          <Text style={styles.error}>{error}</Text>
        ) : calendarData.length > 0 ? (
          <>
            <View style={styles.calendarHeader}>
              <Text style={styles.monthYearText}>
                {months[month - 1].label} {year}
              </Text>
            </View>

            {/* ScrollView untuk Tabel Horizontal */}
            <ScrollView horizontal={true}>
              <ScrollView style={styles.innerScroll}>
                <View>
                  <Table borderStyle={styles.tableBorder}>
                    <Row
                      data={tableHead}
                      widthArr={widthArr}
                      style={styles.header}
                      textStyle={styles.headerText}
                    />
                    <Rows
                      data={tableData}
                      widthArr={widthArr}
                      textStyle={styles.rowText}
                    />
                  </Table>
                </View>
              </ScrollView>
            </ScrollView>
          </>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#333",
  },
  pickerContainer: {
    marginBottom: 20,
  },
  label: {
    fontWeight: "bold",
    marginBottom: 5,
    fontSize: 16,
    color: "#333",
  },
  picker: {
    backgroundColor: "white",
    marginBottom: 15,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  error: {
    color: "red",
    marginVertical: 10,
    textAlign: "center",
  },
  calendarHeader: {
    marginVertical: 15,
    alignItems: "center",
  },
  monthYearText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  tableBorder: {
    borderWidth: 1,
    borderColor: "#c8e1ff",
  },
  header: {
    height: 40,
    backgroundColor: "#f1f8ff",
  },
  headerText: {
    margin: 6,
    fontWeight: "bold",
    textAlign: "center",
    color: "#333",
  },
  rowText: {
    margin: 6,
    textAlign: "center",
    color: "#333",
  },
  innerScroll: {
    marginBottom: 20,
  },
});

export default Calendar;