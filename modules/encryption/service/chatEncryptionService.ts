import { useEncryptionKeysStore } from "../store/useEncryptionKeysStore";
import CryptoJS from "crypto-js";

class ChatEncryptionService {
    constructor() { }

    getKey(key: string = ""): CryptoJS.lib.WordArray {
        if (!key) {
            const keyStore = useEncryptionKeysStore();
            key = keyStore.currentKey;
        }
        return CryptoJS.SHA256(key);
    }

    encryptTextMessage(message: string): string {
        const key = this.getKey();
        const iv = CryptoJS.lib.WordArray.random(16);
        const encrypted = CryptoJS.AES.encrypt(message, key, { iv: iv });
        const combined = iv.concat(encrypted.ciphertext);
        return combined.toString(CryptoJS.enc.Base64);
    }

    decryptTextMessage(encryptedMessage: string): string {
        try {
            const key = this.getKey();
            const combined = CryptoJS.enc.Base64.parse(encryptedMessage);
            const iv = CryptoJS.lib.WordArray.create(combined.words.slice(0, 4));
            const ciphertext = CryptoJS.lib.WordArray.create(
                combined.words.slice(4),
                combined.sigBytes - 16
            );
            const decrypted = CryptoJS.AES.decrypt(
                //@ts-ignore
                { ciphertext: ciphertext },
                key,
                { iv: iv }
            );
            const result = decrypted.toString(CryptoJS.enc.Utf8);

            if (!result) return encryptedMessage;
            return result;
        } catch (e) {
            return encryptedMessage;
        }
    }

    // Helper: Convert ArrayBuffer to CryptoJS WordArray
    arrayBufferToWordArray(ab: ArrayBuffer): CryptoJS.lib.WordArray {
        const u8 = new Uint8Array(ab);
        const words: number[] = [];
        for (let i = 0; i < u8.length; i += 4) {
            words.push(
                (u8[i] << 24) |
                (u8[i + 1] << 16) |
                (u8[i + 2] << 8) |
                (u8[i + 3])
            );
        }
        return CryptoJS.lib.WordArray.create(words, u8.length);
    }

    // Helper: Convert WordArray to ArrayBuffer
    wordArrayToArrayBuffer(wordArray: CryptoJS.lib.WordArray): ArrayBuffer {
        const words = wordArray.words;
        const sigBytes = wordArray.sigBytes;
        const u8 = new Uint8Array(sigBytes);
        let pos = 0;
        for (let i = 0; i < words.length; i++) {
            let word = words[i];
            u8[pos++] = (word >> 24) & 0xff;
            u8[pos++] = (word >> 16) & 0xff;
            u8[pos++] = (word >> 8) & 0xff;
            u8[pos++] = word & 0xff;
        }
        return u8.buffer;
    }

    // Encrypt a file and return a Base64 string (IV + Ciphertext)
    async encryptFile(file: File): Promise<string> {
        const key = this.getKey();
        const arrayBuffer = await file.arrayBuffer();
        const fileWordArray = this.arrayBufferToWordArray(arrayBuffer);

        const knownHeader = "MYMAGICHEADER";
        const headerWordArray = CryptoJS.enc.Utf8.parse(knownHeader);
        const dataToEncrypt = headerWordArray.concat(fileWordArray);

        const iv = CryptoJS.lib.WordArray.random(16);
        const encrypted = CryptoJS.AES.encrypt(dataToEncrypt, key, { iv });
        const combined = iv.concat(encrypted.ciphertext);
        return combined.toString(CryptoJS.enc.Base64);
    }

    // Decrypt a Base64 string (of IV + Ciphertext) back to a Blob
    async decryptFile(encryptedBase64: string, mimeType: string = "application/octet-stream"): Promise<Blob> {
        const key = this.getKey();
        const combined = CryptoJS.enc.Base64.parse(encryptedBase64);

        // Extract IV (first 16 bytes)
        const iv = CryptoJS.lib.WordArray.create(combined.words.slice(0, 4), 16);

        // Extract ciphertext
        const ciphertext = CryptoJS.lib.WordArray.create(
            combined.words.slice(4),
            combined.sigBytes - 16
        );

        // Perform AES decryption
        //@ts-ignore
        const decrypted = CryptoJS.AES.decrypt({ ciphertext }, key, { iv });

        if (!decrypted || decrypted.sigBytes <= 0) {
            throw new Error('Decryption failed or returned empty data.');
        }

        // Convert WordArray to ArrayBuffer
        const decryptedArrayBuffer = this.wordArrayToArrayBuffer(decrypted);
        const decodedData = new Uint8Array(decryptedArrayBuffer);

        // Check the known header
        const knownHeader = "MYMAGICHEADER";
        const headerBytes = new TextEncoder().encode(knownHeader);
        for (let i = 0; i < headerBytes.length; i++) {
            if (decodedData[i] !== headerBytes[i]) {
                throw new Error('Invalid decryption key or corrupted data.');
            }
        }

        // Strip the header off to get the actual file data
        const fileBytes = decodedData.subarray(headerBytes.length);

        return new Blob([fileBytes], { type: mimeType });
    }

    /**
    * Fetches an encrypted file from a given URL, decrypts it, and returns an objectURL for preview/download.
    * @param {string} fileUrl - The URL pointing to the encrypted raw file.
    * @param {string} mimeType - The MIME type of the original file.
    * @returns {Promise<string>} - A promise that resolves to an objectURL.
    */
    async getDecryptedObjectURL(fileUrl: string, mimeType: string): Promise<string> {
        // Fetch the encrypted binary data
        const response = await fetch(fileUrl, {
            mode: 'cors',
            credentials: 'include',
        });
        if (!response.ok) {
            throw new Error(`Failed to fetch file from ${fileUrl}. Status: ${response.status}`);
        }
        const arrayBuffer = await response.arrayBuffer();

        // Convert binary data to Base64 so we can decrypt
        const encryptedBase64 = this.arrayBufferToBase64(arrayBuffer);

        // Decrypt the file back into a Blob
        const decryptedBlob = await this.decryptFile(encryptedBase64, mimeType);

        if (!decryptedBlob) {
            throw new Error(`Failed to decrypt file from ${fileUrl}`);
        }

        // Create an object URL from the decrypted Blob
        const objectURL = URL.createObjectURL(decryptedBlob);
        return objectURL;
    }

    /**
    * Helper to convert an ArrayBuffer to a Base64 string.
    */
    arrayBufferToBase64(arrayBuffer: ArrayBuffer): string {
        const uint8Array = new Uint8Array(arrayBuffer);
        let binary = '';
        for (let i = 0; i < uint8Array.length; i++) {
            binary += String.fromCharCode(uint8Array[i]);
        }
        return btoa(binary);
    }

    // =====================
    // RSA KEY PAIR GENERATION/USAGE
    // =====================

    // Generate an RSA key pair for encryption
    async generateKeyPair(): Promise<CryptoKeyPair> {
        return await window.crypto.subtle.generateKey(
            {
                name: "RSA-OAEP",
                modulusLength: 2048,
                publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
                hash: "SHA-256"
            },
            true,
            ["encrypt", "decrypt"]
        );
    }

    async exportPublicKey(key: CryptoKey): Promise<string> {
        const spki = await window.crypto.subtle.exportKey("spki", key);
        return btoa(String.fromCharCode(...new Uint8Array(spki)));
    }

    async importPublicKey(spkiStr: string): Promise<CryptoKey> {
        const spki = Uint8Array.from(atob(spkiStr), c => c.charCodeAt(0));
        return window.crypto.subtle.importKey(
            "spki",
            spki,
            { name: "RSA-OAEP", hash: "SHA-256" },
            true,
            ["encrypt"]
        );
    }

    async encryptWithPublicKey(publicKey: CryptoKey, message: string): Promise<string> {
        const encoder = new TextEncoder();
        const data = encoder.encode(message);
        const encrypted = await window.crypto.subtle.encrypt({ name: "RSA-OAEP" }, publicKey, data);
        return btoa(String.fromCharCode(...new Uint8Array(encrypted)));
    }

    async decryptWithPrivateKey(privateKey: CryptoKey, encryptedBase64: string): Promise<string> {
        const encrypted = Uint8Array.from(atob(encryptedBase64), c => c.charCodeAt(0));
        const decrypted = await window.crypto.subtle.decrypt({ name: "RSA-OAEP" }, privateKey, encrypted);
        const decoder = new TextDecoder();
        return decoder.decode(decrypted);
    }
}

const chatEncryptionService = new ChatEncryptionService();

export default chatEncryptionService;
