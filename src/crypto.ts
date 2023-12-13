import CryptoJS from "crypto-js";

const SECRET_KEY: string = "mysecretkey";

export function encryptQuestions(name: string, data: SingleQuestion[] | string[]) {
    const encrypted = CryptoJS.AES.encrypt(JSON.stringify(data), SECRET_KEY).toString();
    localStorage.setItem(name, encrypted);
}

export function encryptScore(name: string, data: string) {
    const encrypted = CryptoJS.AES.encrypt(JSON.stringify(data), SECRET_KEY).toString();
    localStorage.setItem(name, encrypted);
}

export function decryptQuestions(name: string): LocalStorageQuestionsData {
    const encrypted = localStorage.getItem(name);
    if (typeof encrypted !== "string") {
        throw Error("Data type is null.");
    }
    const data = CryptoJS.AES.decrypt(encrypted, SECRET_KEY).toString(CryptoJS.enc.Utf8);

    try {
        // Check if the decrypted data is a valid JSON string
        const decrypted: LocalStorageQuestionsData = JSON.parse(data);
        return decrypted;
    } catch (error) {
        throw Error("Error parsing decrypted data. Invalid JSON format.");
    }
}

export function decryptScore(name: string): string[] {
    const encrypted = localStorage.getItem(name);
    if (typeof encrypted != "string") {
        throw Error("Data type is null.");
    }
    const data = CryptoJS.AES.decrypt(encrypted, SECRET_KEY).toString(CryptoJS.enc.Utf8);
    const decrypted: string[] = JSON.parse(data);
    return decrypted;
}
