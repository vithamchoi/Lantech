import fs from 'fs';
import path from 'path';

const pagesDir = 'd:/SWD/SWD392-LantechEnglish-BE(new)/fe/lantech-web/src/pages';

const files = fs.readdirSync(pagesDir).filter(f => f.endsWith('.tsx'));

for (const file of files) {
    const filePath = path.join(pagesDir, file);
    let content = fs.readFileSync(filePath, 'utf-8');
    
    // Fix exactly <br>
    content = content.replace(/<br>/g, '<br />');
    content = content.replace(/<hr>/g, '<hr />');
    content = content.replace(/<input>/g, '<input />');
    
    // Fix unclosed tags with attributes
    content = content.replace(/<img([^>]*?)(?<!\/)>/g, '<img$1 />');
    content = content.replace(/<input([^>]*?)(?<!\/)>/g, '<input$1 />');
    content = content.replace(/<br([^>]*?)(?<!\/)>/g, '<br$1 />');
    content = content.replace(/<hr([^>]*?)(?<!\/)>/g, '<hr$1 />');

    fs.writeFileSync(filePath, content);
    console.log(`Fixed ${file}`);
}
