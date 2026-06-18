import fs from 'fs';
import path from 'path';

const pagesDir = 'd:/SWD/SWD392-LantechEnglish-BE(new)/fe/lantech-web/src/pages';
const files = fs.readdirSync(pagesDir).filter(f => f.endsWith('.tsx'));

for (const file of files) {
    const filePath = path.join(pagesDir, file);
    let content = fs.readFileSync(filePath, 'utf-8');
    
    // Remove unused React import
    content = content.replace(/import React from 'react';\n/g, '');

    fs.writeFileSync(filePath, content);
}
console.log('Removed unused React imports');
