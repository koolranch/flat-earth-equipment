import fs from 'fs';
import path from 'path';

// Create a simple SVG placeholder
const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="800" height="600" version="1.1" viewBox="0 0 800 600" xmlns="http://www.w3.org/2000/svg">
  <rect width="800" height="600" fill="#f3f4f6"/>
  <text x="400" y="300" text-anchor="middle" font-family="Arial" font-size="48" fill="#9ca3af">
    <tspan x="400" y="280">🔧</tspan>
    <tspan x="400" y="340">No Image Available</tspan>
  </text>
</svg>`;

// Ensure the directory exists
const dir = 'public/images/parts';
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

// Write the SVG file
fs.writeFileSync(path.join(dir, 'placeholder.jpg'), svgContent);
console.log('✅ Created placeholder image at public/images/parts/placeholder.jpg'); 