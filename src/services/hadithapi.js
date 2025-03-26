const API_BASE_URL= 'https://api.hadith.gading.dev';


export const getBooks = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/books`);
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "Gagal mengambil data.");
        return data.data;
    } catch (error) {
        throw error;
    }
};

export const getHadithRange = async (bookId, range) => {
    try {
        const response = await fetch(`${API_BASE_URL}/books/${bookId}?range=${range}`);
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "Gagal mengambil hadith.");
        return data.data;
    } catch (error) {
        throw error;
    }
};