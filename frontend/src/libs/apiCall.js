import axios from "axios"
const API_URL = "http://localhost:4000/api-v1";

const api = axios.create({
    baseURL : API_URL,
});

export const setAuthToken = (token ) => {
    if(token) {
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
        delete api.defaults.headers.common["Authorization"];
    }
}

export default api;

