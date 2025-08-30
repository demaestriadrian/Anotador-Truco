
import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';

const inputDir = 'public/img';
const outputDir = 'public/img';

const files = await fs.readdir(inputDir);

for (const file of files) {
  const ext = path.extname(file).toLowerCase();
  if (ext === '.jpg' || ext === '.png') {
    const inputPath = path.join(inputDir, file);
    const baseName = path.basename(file, ext);
    const outputPath = path.join(outputDir, `${baseName}.webp`);

    try {
      await sharp(inputPath)
        .webp({ quality: 80 })
        .toFile(outputPath);
      console.log(`Converted ${file} to ${baseName}.webp`);
    } catch (err) {
      console.error(`Error converting ${file}:`, err);
    }
  }
}
