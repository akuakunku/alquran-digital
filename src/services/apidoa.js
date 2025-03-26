import axios from 'axios';

const API_BASE_URL = 'https://doa-doa-api-ahmadramadhan.fly.dev/api';

const getAllDoa = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}`);
        return response.data.map(doa => ({
            id: doa.id,
            doa: doa.doa,     
            doakan: doa.ayat, 
            latin: doa.latin,
            artinya: doa.artinya,
        }));
    } catch (error) {
        throw new Error('Error fetching all doa data: ' + error.message);
    }
};

const getDoaById = async (id) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/${id}`);
        const doa = response.data; 
        return {
            id: doa.id,
            doa: doa.doa,     
            doakan: doa.ayat, 
            latin: doa.latin,
            artinya: doa.artinya,
        };
    } catch (error) {
        throw new Error('Error fetching doa by id: ' + error.message);
    }
};

const getDoaByKeyword = async (doa) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/doa/${doa}`);
        return response.data.map(doa => ({
            id: doa.id,
            doa: doa.doa,
            doakan: doa.ayat,
            latin: doa.latin,
            artinya: doa.artinya,
        }));
    } catch (error) {
        throw new Error('Error fetching doa by keyword: ' + error.message);
    }
};

const getRandomDoa = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/doa/v1/random`);
        const doa = response.data; 
        return {
            id: doa.id,
            doa: doa.doa,    
            doakan: doa.ayat, 
            latin: doa.latin,
            artinya: doa.artinya,
        };
    } catch (error) {
        throw new Error('Error fetching random doa: ' + error.message);
    }
};

export { getAllDoa, getDoaById, getDoaByKeyword, getRandomDoa };