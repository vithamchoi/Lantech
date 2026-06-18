import fs from 'fs';
import path from 'path';

const stitchDir = 'd:/SWD/SWD392-LantechEnglish-BE(new)/fe/stitch_pixel_lingua_cozy_path';
const indexCssPath = 'd:/SWD/SWD392-LantechEnglish-BE(new)/fe/lantech-web/src/index.css';

const folders = fs.readdirSync(stitchDir).filter(f => fs.statSync(path.join(stitchDir, f)).isDirectory());

let allStyles = new Set();

for (const folder of folders) {
    const htmlPath = path.join(stitchDir, folder, 'code.html');
    if (fs.existsSync(htmlPath)) {
        const htmlContent = fs.readFileSync(htmlPath, 'utf-8');
        const styleMatches = htmlContent.match(/<style>([\s\S]*?)<\/style>/i);
        if (styleMatches && styleMatches[1]) {
            // Remove 'body { background-color... }' since we already have global background
            let cleanStyle = styleMatches[1].replace(/body\s*{[^}]*}/g, '');
            allStyles.add(cleanStyle.trim());
        }
    }
}

// Append to index.css
let indexCssContent = fs.readFileSync(indexCssPath, 'utf-8');
indexCssContent += '\n\n/* --- AUTO-EXTRACTED STYLES FROM ALL PAGES --- */\n\n';
allStyles.forEach(style => {
    indexCssContent += style + '\n\n';
});

fs.writeFileSync(indexCssPath, indexCssContent);
console.log('Appended all missing styles to index.css!');
