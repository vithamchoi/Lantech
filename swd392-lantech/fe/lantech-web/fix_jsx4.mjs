import fs from 'fs';
import path from 'path';

const pagesDir = 'd:/SWD/SWD392-LantechEnglish-BE(new)/fe/lantech-web/src/pages';
const files = fs.readdirSync(pagesDir).filter(f => f.endsWith('.tsx'));

for (const file of files) {
    const filePath = path.join(pagesDir, file);
    let content = fs.readFileSync(filePath, 'utf-8');
    
    // Fix boolean attributes
    content = content.replace(/ required=""/g, ' required={true}');
    content = content.replace(/ readonly=""/g, ' readOnly={true}');
    content = content.replace(/ readOnly=""/g, ' readOnly={true}');

    content = content.replace(/ required( |>|\/)/g, ' required={true}$1');
    content = content.replace(/ readonly( |>|\/)/g, ' readOnly={true}$1');

    fs.writeFileSync(filePath, content);
}
console.log('Fixed JSX required/readonly');
