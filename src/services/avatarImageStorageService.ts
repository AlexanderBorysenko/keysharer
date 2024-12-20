import path from "path";
import fs from 'fs';
import { types } from "cassandra-driver";
import sharp from "sharp";

/**
 * Service for managing avatar image storage.
 */
class AvatarImageStorageService {
    private readonly storagePath: string;

    constructor() {
        this.storagePath = 'public/avatars';
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
    * Gets the URL for accessing an avatar image.
    * @param fileName - The name of the file.
    * @returns The URL for the avatar image.
    */
    public getAvatarPath(fileName: string): string {
        const baseName = path.basename(fileName);
        return `/${this.storagePath}/${baseName}`;
    }

    /**
    * Deletes an avatar image file.
    * @param fileName - The name of the file to delete.
    */
    public deleteAvatarFile(fileName: string): void {
        const filePath = this.getFilePath(fileName);
        fs.unlink(filePath, (err) => {
            if (err) {
                console.error(`Error deleting file: ${err}`);
            }
        });
    }

    /**
    * Creates a new avatar image file.
    * @param file - The file to create.
    * @returns A promise that resolves with the file details.
    * @throws An error if the file type is invalid.
    */
    public async createAvatarFile(file: File): Promise<{
        fileName: string;
        filePath: string;
    }> {
        const validMimeTypes = ["image/jpeg", "image/png", "image/jpg"];
        if (!validMimeTypes.includes(file.type)) {
            throw new Error("Invalid file type");
        }

        const fileName = `${types.Uuid.random().toString()}.png`;
        const filePath = this.getFilePath(fileName);
        fs.mkdirSync(path.dirname(filePath), { recursive: true });

        // Read the file as a buffer
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        await sharp(buffer)
            .rotate() // Keep original rotation
            .resize(100, 100)
            .png()
            .toFile(filePath);

        return {
            fileName,
            filePath,
        };
    }
    public avatarUrlByFilename = (avatar: string | null): string => {
        if (!avatar || typeof avatar !== 'string') return '';

        const serverUrl = process.env.SERVER_URL;
        avatar = `${serverUrl}/${this.storagePath}/${avatar}`;

        return avatar;
    }
}

export const avatarImageStorageService = new AvatarImageStorageService();