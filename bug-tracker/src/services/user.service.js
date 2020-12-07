import axios from "axios";
import authHeader from "./auth-header";

const API_URL = "/api/users";

async function getAllUsers() {
    const response = await axios.get(`${API_URL}`, { headers: authHeader() });
    return response.data;
}

async function createUser(user) {
    const response = await axios.post(`${API_URL}`, { user }, {
        headers: { 'Content-Type': 'application/json', ...authHeader() },
    });
    return response.data;
}

export default {
    getAllUsers,
    createUser,
};