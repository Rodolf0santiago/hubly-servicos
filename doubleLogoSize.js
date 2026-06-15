const fs = require('fs');

// 1. Update main page.tsx
const mainPageFile = 'src/app/page.tsx';
let mainPage = fs.readFileSync(mainPageFile, 'utf8');

const oldMainImg = /<img src="\/images\/logo\.png" alt="Integra Soluções SC" className="h-20 md:h-24 lg:h-28 w-auto object-contain drop-shadow-md transition-transform duration-500 group-hover:scale-105" \/>/g;
const newMainImg = `<img src="/images/logo.png" alt="Integra Soluções SC" className="h-32 md:h-40 lg:h-48 w-auto object-contain drop-shadow-md transition-transform duration-500 group-hover:scale-105" />`;

mainPage = mainPage.replace(oldMainImg, newMainImg);
fs.writeFileSync(mainPageFile, mainPage, 'utf8');

// 2. Update subpages
const subpages = [
    'src/app/aquecimento/page.tsx',
    'src/app/ar-condicionado/page.tsx',
    'src/app/automacao-residencial/page.tsx',
    'src/app/calculadora/page.tsx',
    'src/app/carregamento-veicular/page.tsx',
    'src/app/controle-acesso/page.tsx',
    'src/app/instalacao/page.tsx'
];

subpages.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    
    const oldSubImg = /<img src="\/images\/logo\.png" alt="Integra Soluções SC" className="h-16 md:h-20 w-auto object-contain transition-transform duration-300 group-hover:scale-105" \/>/g;
    const newSubImg = `<img src="/images/logo.png" alt="Integra Soluções SC" className="h-24 md:h-32 lg:h-36 w-auto object-contain drop-shadow-md transition-transform duration-300 group-hover:scale-105" />`;

    content = content.replace(oldSubImg, newSubImg);
    fs.writeFileSync(file, content, 'utf8');
});

// 3. Update admin layout
const adminLayout = 'src/app/admin/(dashboard)/layout.tsx';
let adminContent = fs.readFileSync(adminLayout, 'utf8');
const oldAdminImg = /<div className="flex items-center">\s*<img src="\/images\/logo\.png" alt="Integra Soluções SC" className="h-16 w-auto object-contain drop-shadow-md" \/>\s*<\/div>/g;
const newAdminImg = `<div className="flex items-center">
              <div className="bg-white/95 px-4 py-2 rounded-xl shadow-lg border border-white/20">
                <img src="/images/logo.png" alt="Integra Soluções SC" className="h-20 md:h-24 w-auto object-contain" />
              </div>
            </div>`;

adminContent = adminContent.replace(oldAdminImg, newAdminImg);
fs.writeFileSync(adminLayout, adminContent, 'utf8');

console.log('Logo size doubled again successfully!');
