export default function authHeader() {
    const user = JSON.parse(localStorage.getItem("user"));

    if (user != null && user.accessToken != null) {
        return { 'x-access-token': user.accessToken };
    } else {
        return {};
    }
}