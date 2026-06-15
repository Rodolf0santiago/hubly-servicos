const fs = require('fs');
const glob = require('fs').readdirSync;
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else if (file.endsWith('.tsx')) {
            results.push(file);
        }
    });
    return results;
}

const files = walk('src/app');

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;

    // Update main page padding specifically
    if (file.includes('src\\app\\page.tsx') || file.includes('src/app/page.tsx')) {
        content = content.replace(/pt-32/g, 'pt-48 md:pt-64 lg:pt-[280px]');
    } else {
        // Update subpages
        content = content.replace(/pt-32/g, 'pt-48 md:pt-56 lg:pt-[240px]');
    }

    if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
        console.log('Updated padding in:', file);
    }
});

console.log('Padding adjustment completed!');
