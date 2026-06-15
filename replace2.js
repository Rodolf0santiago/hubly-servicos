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

    // More aggressive regex to replace the old H logo block
    // It looks for <div ...> ... >H< ... </div> inside a gap-2 or gap-3 flex container
    const oldLogoRegex = /<div className="[^"]*bg-[^"]*(?:emerald|brand-emerald)[^"]*flex items-center justify-center[^"]*">[\s\S]*?<span className="[^"]*text-white font-black[^"]*">H<\/span>[\s\S]*?<\/div>/g;
    
    const newLogoHtml = `<img src="/images/logo.png" alt="Integra Soluções SC" className="h-10 md:h-12 w-auto object-contain drop-shadow-md" />`;
    
    content = content.replace(oldLogoRegex, newLogoHtml);

    if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
        console.log(`Updated Logo in: ${file}`);
        changedCount++;
    }
});

console.log(`Done. Updated ${changedCount} files.`);
