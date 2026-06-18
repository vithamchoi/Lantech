import fs from 'fs';
import path from 'path';

const stitchDir = 'd:/SWD/SWD392-LantechEnglish-BE(new)/fe/stitch_pixel_lingua_cozy_path';
const pagesDir = 'd:/SWD/SWD392-LantechEnglish-BE(new)/fe/lantech-web/src/pages';

if (!fs.existsSync(pagesDir)) {
    fs.mkdirSync(pagesDir, { recursive: true });
}

function htmlToReact(html) {
    let jsx = html;
    jsx = jsx.replace(/class=/g, 'className=');
    jsx = jsx.replace(/for=/g, 'htmlFor=');
    jsx = jsx.replace(/<img([^>]*[^\/])>/g, '<img$1 />');
    jsx = jsx.replace(/<input([^>]*[^\/])>/g, '<input$1 />');
    jsx = jsx.replace(/<br([^>]*[^\/])>/g, '<br$1 />');
    jsx = jsx.replace(/<hr([^>]*[^\/])>/g, '<hr$1 />');
    jsx = jsx.replace(/style="([^"]+)"/g, (match, styles) => {
        const styleObj = {};
        styles.split(';').forEach(style => {
            if (style.trim()) {
                let [key, value] = style.split(':').map(s => s.trim());
                if (key && value) {
                    key = key.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
                    styleObj[key] = value;
                }
            }
        });
        return `style={${JSON.stringify(styleObj)}}`;
    });
    jsx = jsx.replace(/<!--[\s\S]*?-->/g, '');
    return jsx;
}

// Read all subdirectories in the stitchDir
const folders = fs.readdirSync(stitchDir).filter(f => fs.statSync(path.join(stitchDir, f)).isDirectory());

const routes = [];
const imports = [];

// Convert folder name to PascalCase (e.g., active_lesson_exercise -> ActiveLessonExercise)
function toPascalCase(str) {
    return str.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join('');
}

// Convert folder name to route path (e.g., active_lesson_exercise -> active-lesson-exercise)
function toKebabCase(str) {
    return str.replace(/_/g, '-');
}

for (const folder of folders) {
    // Special override to not overwrite the Leaderboard we already carefully crafted
    if (folder === 'leaderboard_rank') {
        imports.push(`import Leaderboard from './pages/Leaderboard';`);
        routes.push(`          <Route path="leaderboard" element={<Leaderboard />} />`);
        continue;
    }

    const componentName = toPascalCase(folder);
    const routePath = toKebabCase(folder);
    
    const htmlPath = path.join(stitchDir, folder, 'code.html');
    if (fs.existsSync(htmlPath)) {
        const htmlContent = fs.readFileSync(htmlPath, 'utf-8');
        
        const mainMatch = htmlContent.match(/<main[^>]*>([\s\S]*?)<\/main>/i);
        let innerContent = mainMatch ? mainMatch[1] : '';
        
        if (!mainMatch) {
            const bodyMatch = htmlContent.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
            if (bodyMatch) {
                innerContent = bodyMatch[1]
                    .replace(/<header[\s\S]*?<\/header>/i, '')
                    .replace(/<footer[\s\S]*?<\/footer>/i, '');
            }
        }

        if (innerContent) {
            const jsxContent = htmlToReact(innerContent);
            
            const componentCode = `import React from 'react';\n\nconst ${componentName} = () => {\n  return (\n    <>\n      ${jsxContent}\n    </>\n  );\n};\n\nexport default ${componentName};\n`;
            
            fs.writeFileSync(path.join(pagesDir, `${componentName}.tsx`), componentCode);
            console.log(`Created ${componentName}.tsx`);
            
            imports.push(`import ${componentName} from './pages/${componentName}';`);
            // Set the landing page as the index route
            if (folder === 'lantech_landing_page_evergreen') {
                routes.push(`          <Route index element={<${componentName} />} />`);
            } else {
                routes.push(`          <Route path="${routePath}" element={<${componentName} />} />`);
            }
        }
    }
}

// Generate App.tsx
const appCode = `import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
${imports.join('\n')}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
${routes.join('\n')}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
`;

fs.writeFileSync('d:/SWD/SWD392-LantechEnglish-BE(new)/fe/lantech-web/src/App.tsx', appCode);
console.log('Updated App.tsx with all 23 pages!');
