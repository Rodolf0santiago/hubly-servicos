const fs = require('fs');

// 1. Update main page.tsx
const mainPageFile = 'src/app/page.tsx';
let mainPage = fs.readFileSync(mainPageFile, 'utf8');

const oldMainImg = /<img src="\/images\/logo\.png" alt="Integra Soluções SC" className="h-12 md:h-16 w-auto object-contain drop-shadow-md transition-transform duration-500 group-hover:scale-105" \/>/g;
const newMainImg = `<img src="/images/logo.png" alt="Integra Soluções SC" className="h-20 md:h-24 lg:h-28 w-auto object-contain drop-shadow-md transition-transform duration-500 group-hover:scale-105" />`;

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
    
    const oldSubImg = /<img src="\/images\/logo\.png" alt="Integra Soluções SC" className="h-10 md:h-12 w-auto object-contain(.*)" \/>/g;
    const newSubImg = `<img src="/images/logo.png" alt="Integra Soluções SC" className="h-16 md:h-20 w-auto object-contain transition-transform duration-300 group-hover:scale-105" />`;

    content = content.replace(oldSubImg, newSubImg);
    fs.writeFileSync(file, content, 'utf8');
});

// 3. Update admin layout
const adminLayout = 'src/app/admin/(dashboard)/layout.tsx';
let adminContent = fs.readFileSync(adminLayout, 'utf8');
const oldAdminImg = /<img src="\/images\/logo\.png" alt="Integra Soluções SC" className="h-10 w-auto object-contain drop-shadow-md" \/>/g;
const newAdminImg = `<img src="/images/logo.png" alt="Integra Soluções SC" className="h-16 w-auto object-contain drop-shadow-md" />`;

adminContent = adminContent.replace(oldAdminImg, newAdminImg);
fs.writeFileSync(adminLayout, adminContent, 'utf8');

console.log('Logo size increased successfully!');
