const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, 'frontend/src');

function findAndReplace(dir) {
    fs.readdirSync(dir).forEach(file => {
        const fullPath = path.join(dir, file);
        if (fs.lstatSync(fullPath).isDirectory()) {
            findAndReplace(fullPath);
        } else if (fullPath.endsWith('.js') || fullPath.endsWith('.jsx')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let updated = content.replace(/\$import\.meta\.env\.VITE_API_URL\}/g, '${import.meta.env.VITE_API_URL}');
            
            if (content !== updated) {
                fs.writeFileSync(fullPath, updated, 'utf8');
                console.log(`Updated ${fullPath}`);
            }
        }
    });
}

findAndReplace(directoryPath);
