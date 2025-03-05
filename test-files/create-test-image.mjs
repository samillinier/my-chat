import { createCanvas } from 'canvas';
import fs from 'fs/promises';

const canvas = createCanvas(100, 100);
const ctx = canvas.getContext('2d');

// Fill the background
ctx.fillStyle = 'white';
ctx.fillRect(0, 0, 100, 100);

// Add some text
ctx.fillStyle = 'black';
ctx.font = '12px Arial';
ctx.fillText('Test Image', 10, 50);

// Save the image
const buffer = canvas.toBuffer('image/jpeg');
await fs.writeFile('test.jpg', buffer); 