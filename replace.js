const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else {
            if (file.match(/\.(ts|tsx|js|jsx)$/)) {
                results.push(file);
            }
        }
    });
    return results;
}

const files = walk('d:\\\\ARQUIVOS CS\\\\Hubly PRO Serviços\\\\src');

let changedCount = 0;
files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;

    // 1. Rename company
    content = content.replace(/Hubly Pro/gi, 'Integra Soluções SC');
    content = content.replace(/\bHubly\b/g, 'Integra');
    content = content.replace(/exemplo@hubly\.com/g, 'exemplo@integra.com');

    // 2. Replace the old "H" logo block with the new logo image
    const oldLogoRegex = /<div className="w-8 h-8 md:w-10 md:h-10 bg-brand-emerald rounded-lg flex items-center justify-center shadow-lg shadow-emerald-500\/20">\s*<span className="text-white font-black text-xl">H<\/span>\s*<\/div>/g;
    
    const newLogoHtml = `<img src="/images/logo.png" alt="Integra Soluções SC" className="h-10 md:h-12 w-auto object-contain" />`;
    
    content = content.replace(oldLogoRegex, newLogoHtml);

    if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
        console.log(`Updated: ${file}`);
        changedCount++;
    }
});

console.log(`Done. Updated ${changedCount} files.`);
