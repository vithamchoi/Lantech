import fs from 'fs';
import path from 'path';

const pagesDir = 'd:/SWD/SWD392-LantechEnglish-BE(new)/fe/lantech-web/src/pages';
const files = fs.readdirSync(pagesDir).filter(f => f.endsWith('.tsx'));

for (const file of files) {
    const filePath = path.join(pagesDir, file);
    let content = fs.readFileSync(filePath, 'utf-8');
    
    // Fix string to number for numeric attributes
    content = content.replace(/ rows="(\d+)"/g, ' rows={$1}');
    content = content.replace(/ cols="(\d+)"/g, ' cols={$1}');
    content = content.replace(/ tabIndex="(\d+)"/g, ' tabIndex={$1}');
    
    // Fix boolean attributes
    content = content.replace(/ disabled=""/g, ' disabled={true}');
    content = content.replace(/ checked=""/g, ' checked={true}');
    content = content.replace(/ selected=""/g, ' selected={true}');

    // also replace cases without="" but maybe trailing space or >
    content = content.replace(/ disabled( |>|\/)/g, ' disabled={true}$1');
    content = content.replace(/ checked( |>|\/)/g, ' checked={true}$1');
    content = content.replace(/ selected( |>|\/)/g, ' selected={true}$1');

    fs.writeFileSync(filePath, content);
}
console.log('Fixed JSX numbers and booleans');
