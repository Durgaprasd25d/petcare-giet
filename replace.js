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
            let updated = content.replace(/http:\/\/localhost:5000\/api/g, '${import.meta.env.VITE_API_URL}');
            
            // Fix string interpolation syntax where it was a normal string
            updated = updated.replace(/'\$\{import.meta.env.VITE_API_URL\}(.*?)'/g, "`$$import.meta.env.VITE_API_URL}$1`");
            updated = updated.replace(/"\$\{import.meta.env.VITE_API_URL\}(.*?)"/g, "`$$import.meta.env.VITE_API_URL}$1`");

            // Booking.jsx razorpay key
            updated = updated.replace(/"rzp_test_placeholder"/g, "import.meta.env.VITE_RAZORPAY_KEY_ID");

            if (content !== updated) {
                fs.writeFileSync(fullPath, updated, 'utf8');
                console.log(`Updated ${fullPath}`);
            }
        }
    });
}

findAndReplace(directoryPath);
