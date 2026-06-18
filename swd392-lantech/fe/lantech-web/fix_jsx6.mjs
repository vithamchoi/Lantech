import fs from 'fs';
import path from 'path';

const dirs = [
    'd:/SWD/SWD392-LantechEnglish-BE(new)/fe/lantech-web/src/pages',
    'd:/SWD/SWD392-LantechEnglish-BE(new)/fe/lantech-web/src/components',
    'd:/SWD/SWD392-LantechEnglish-BE(new)/fe/lantech-web/src'
];

for (const dir of dirs) {
    if (!fs.existsSync(dir)) continue;
    const files = fs.readdirSync(dir).filter(f => f.endsWith('.tsx'));
    for (const file of files) {
        const filePath = path.join(dir, file);
        let content = fs.readFileSync(filePath, 'utf-8');
        
        // Remove unused React import
        content = content.replace(/import React(?:, \{.*?\})? from 'react';\r?\n/g, '');
        
        // Remove onclick="..."
        content = content.replace(/ onclick="[^"]*"/gi, '');
        content = content.replace(/ onClick="[^"]*"/gi, '');

        fs.writeFileSync(filePath, content);
    }
}
console.log('Fixed JSX final issues');
