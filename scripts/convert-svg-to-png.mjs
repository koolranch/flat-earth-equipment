import sharp from 'sharp';
import { readFileSync } from 'fs';

async function convertSvgToPng() {
  try {
    // Convert forklift.svg to forklift.png
    const forkliftSvg = readFileSync('public/game/forklift.svg');
    await sharp(forkliftSvg)
      .png()
      .toFile('public/game/forklift.png');
    
    // Convert cone.svg to cone.png
    const coneSvg = readFileSync('public/game/cone.svg');
    await sharp(coneSvg)
      .png()
      .toFile('public/game/cone.png');
    
    console.log('Successfully converted SVG files to PNG');
  } catch (error) {
    console.error('Error converting SVG to PNG:', error);
  }
}

convertSvgToPng(); 