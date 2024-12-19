import path from "path";
import fs from 'fs';
import { types } from "cassandra-driver";
import type { UploadedEncryptedFile } from "../resolvers/message.sendMessage.mutation";

export interface StoredEncryptedFile {
    id: types.Uuid;
    fileName: string;
    fileSize: number;
    fileType: string;
}
/**
 * Service for managing message file storage.
 */
class MessageFileStorageService {
    private readonly storagePath: string;

    constructor() {
        this.storagePath = 'public/uploads';
    }

    /**
     * Gets the full file path for a given file name.
     * @param fileName - The name of the file.
     * @returns The full file path.
     */
    private getFilePath(fileName: string): string {
        const baseName = path.basename(fileName);
        return path.join(process.cwd(), this.storagePath, baseName);
    }

    /**
     * Gets the URL for accessing a stored message file.
     * 
     * @param fileName - The name of the file.
     * @returns The URL for the file.
     */
    public getFileUrl(fileName: string): string {
        const serverUrl = process.env.SERVER_URL || 'http://localhost:4000';
        return `${serverUrl}/${this.storagePath}/${fileName}`;
    }

    /**
     * Deletes a stored message file.
     * @param fileName - The name of the file to delete.
     */
    public deleteFile(fileName: string): void {
        const filePath = this.getFilePath(fileName);
        fs.unlink(filePath, (err) => {
            if (err) {
                console.error(`Error deleting file: ${err}`);
            } else {
                console.log(`File deleted successfully: ${filePath}`);
            }
        });
    }

    /**
     * Creates a new file from encrypted data and returns file metadata.
     * @param fileData - An object containing filename, mimeType, and encryptedData.
     * @returns A promise that resolves with the file metadata: { fileName, fileSize, fileType }.
     * @throws An error if the data cannot be processed.
     */
    public async createMessageFile(fileData: UploadedEncryptedFile): Promise<StoredEncryptedFile> {
        const { filename, mimeType, encryptedData } = fileData;

        // Decode the base64 encrypted data into a Buffer
        const buffer = Buffer.from(encryptedData, 'base64');

        if (!buffer || buffer.length === 0) {
            throw new Error("Invalid file data");
        }

        const id = types.TimeUuid.now();

        // Get the file extension from the original filename
        const ext = path.extname(filename) || '';
        const fileName = `${id.toString()}${ext}`;
        const filePath = this.getFilePath(fileName);

        fs.mkdirSync(path.dirname(filePath), { recursive: true });
        fs.writeFileSync(filePath, buffer);

        const fileSize = buffer.length; // size in bytes
        const fileType = mimeType;

        return {
            id,
            fileName,
            fileSize,
            fileType,
        };
    }
}

export const messageFileStorageService = new MessageFileStorageService();
