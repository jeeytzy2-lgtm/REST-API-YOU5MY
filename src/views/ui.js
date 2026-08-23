const fs = require('fs');
const path = require('path');

let cachedHtml = '';

function getHtml() {
    if (!cachedHtml) {
        const targetPath = path.join(__dirname, 'index.html');
        if (fs.existsSync(targetPath)) {
            cachedHtml = fs.readFileSync(targetPath, 'utf8');
        } else {
            const fallbackPath = path.join(process.cwd(), 'src', 'views', 'index.html');
            if (fs.existsSync(fallbackPath)) {
                cachedHtml = fs.readFileSync(fallbackPath, 'utf8');
            }
        }
    }
    return cachedHtml;
}

module.exports = { getHtml };
