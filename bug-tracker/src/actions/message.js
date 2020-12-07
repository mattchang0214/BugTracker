import { SET_MESSAGE, CLEAR_MESSAGE } from "./types";

export function setMessage(message) {
    return {
        type: SET_MESSAGE,
        payload: message,
    };
}

export function clearMessage() {
    return {
        type: CLEAR_MESSAGE,
    };
}
