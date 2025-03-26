import React, { useEffect, useState, useContext } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet ,SafeAreaView} from 'react-native';
import { getAllDoa } from '../services/apidoa';
import { ThemeContext } from '../context/ThemeContext';

const DoaScreen = () => {
    const { isDarkMode } = useContext(ThemeContext);
    const [doas, setDoas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchAllDoas();
    }, []);

    const fetchAllDoas = async () => {
        setLoading(true);
        setError('');
        try {
            const data = await getAllDoa();
            setDoas(data);
        } catch (error) {
            setError('Error fetching data');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={[styles.container, isDarkMode ? styles.darkContainer : styles.lightContainer]}>
            {loading ? (
                <ActivityIndicator size="large" color={isDarkMode ? '#ffffff' : '#0000ff'} />
            ) : (
                <>
                    {error ? <Text style={[styles.error, isDarkMode ? styles.darkError : styles.lightError]}>{error}</Text> : null}
                    <FlatList
                        data={doas}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={({ item }) => (
                            <View style={[styles.itemContainer, isDarkMode ? styles.darkItemContainer : styles.lightItemContainer]}>
                                <Text style={[styles.titleText, isDarkMode ? styles.darkTitleText : styles.lightTitleText]}>{item.doa}</Text>
                                <Text style={[styles.arabicText, isDarkMode ? styles.darkArabicText : styles.lightArabicText]}>{item.doakan}</Text>
                                <Text style={[styles.latinText, isDarkMode ? styles.darkLatinText : styles.lightLatinText]}>{item.latin}</Text>
                                <Text style={[styles.meaningText, isDarkMode ? styles.darkMeaningText : styles.lightMeaningText]}>{item.artinya}</Text>
                            </View>
                        )}
                    />
                </>
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
    },
    darkContainer: {
        backgroundColor: '#121212',
    },
    lightContainer: {
        backgroundColor: '#ffffff',
    },
    itemContainer: {
        marginVertical: 10,
        padding: 15,
        borderRadius: 8,
        elevation: 2, 
    },
    darkItemContainer: {
        backgroundColor: '#1e1e1e',
        borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    lightItemContainer: {
        backgroundColor: '#f9f9f9', 
        borderColor: '#e0e0e0', 
    },
    titleText: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    darkTitleText: {
        color: '#ffffff', 
    },
    lightTitleText: {
        color: '#000000', 
    },
    arabicText: {
        fontSize: 20,
        marginBottom: 10,
    },
    darkArabicText: {
        color: '#ffffff', 
    },
    lightArabicText: {
        color: '#000000', 
    },
    latinText: {
        fontSize: 16,
        marginBottom: 10,
    },
    darkLatinText: {
        color: '#cccccc', 
    },
    lightLatinText: {
        color: '#333333', 
    },
    meaningText: {
        fontSize: 14,
        marginBottom: 10,
    },
    darkMeaningText: {
        color: '#b2b2b2',
    },
    lightMeaningText: {
        color: '#007b5f', 
    },
    error: {
        marginVertical: 10,
    },
    darkError: {
        color: '#ff0000', 
    },
    lightError: {
        color: '#ff0000', 
    },
});

export default DoaScreen;