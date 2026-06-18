import fs from 'fs';
import path from 'path';

const pagesDir = 'd:/SWD/SWD392-LantechEnglish-BE(new)/fe/lantech-web/src/pages';

const files = fs.readdirSync(pagesDir).filter(f => f.endsWith('.tsx'));

for (const file of files) {
    const filePath = path.join(pagesDir, file);
    let content = fs.readFileSync(filePath, 'utf-8');
    
    // Fix React properties
    content = content.replace(/tabindex="(\d+)"/gi, 'tabIndex={$1}');
    content = content.replace(/autocomplete=/gi, 'autoComplete=');
    content = content.replace(/spellcheck=/gi, 'spellCheck=');
    content = content.replace(/maxlength=/gi, 'maxLength=');
    content = content.replace(/minlength=/gi, 'minLength=');
    
    // autoFocus might be written as autofocus="" or just autofocus
    content = content.replace(/autofocus(?:="")?/gi, 'autoFocus');
    
    // SVGs
    content = content.replace(/viewbox=/gi, 'viewBox=');
    content = content.replace(/fill-opacity=/gi, 'fillOpacity=');
    content = content.replace(/fill-rule=/gi, 'fillRule=');
    content = content.replace(/stroke-width=/gi, 'strokeWidth=');
    content = content.replace(/stroke-linecap=/gi, 'strokeLinecap=');
    content = content.replace(/stroke-linejoin=/gi, 'strokeLinejoin=');

    fs.writeFileSync(filePath, content);
    console.log(`Fixed React Props in ${file}`);
}
