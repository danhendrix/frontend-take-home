import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:3002', // Replace with your backend URL
});

export default api;