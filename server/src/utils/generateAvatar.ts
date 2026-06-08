import { createCanvas } from '@napi-rs/canvas';

function generateRandomColor(): string {
    const r = Math.floor(Math.random() * 256).toString(16).padStart(2, '0');
    const g = Math.floor(Math.random() * 256).toString(16).padStart(2, '0');
    const b = Math.floor(Math.random() * 256).toString(16).padStart(2, '0');
    return `#${r}${g}${b}`;
}

export function generateAvatar(): Buffer {
    const size = 100;
    const canvas = createCanvas(size, size);
    const ctx = canvas.getContext('2d');

    // Fill background with a random color
    ctx.fillStyle = generateRandomColor();
    ctx.fillRect(0, 0, size, size);

    // Draw random shapes for uniqueness
    for (let i = 0; i < 10; i++) {
        ctx.beginPath();
        ctx.fillStyle = generateRandomColor();
        const x = Math.random() * size;
        const y = Math.random() * size;
        const radius = Math.random() * 20 + 5;
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
    }

    // Return the image as a PNG buffer
    return canvas.toBuffer('image/png');
}
