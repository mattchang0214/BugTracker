import axios from "axios";

const API_URL = "/api/auth";

async function register(username, email, password) {
    const response = await axios.post(`${API_URL}/signup`, {
        username,
        email,
        password,
    }, {
        headers: { 'Content-Type': 'application/json' },
    });
    return response.data;
}

async function login(username, password) {
    const response = await axios.post(`${API_URL}/signin`, {
        username,
        password,
    }, {
        headers: { 'Content-Type': 'application/json' },
    });
    if (response.data.accessToken) {
        localStorage.setItem("user", JSON.stringify(response.data));
    }
    return response.data;
}

async function logout() {
    localStorage.removeItem("user");
};

export default {
    register,
    login,
    logout,
};