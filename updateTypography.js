const fs = require('fs');

// 1. Update main page.tsx
const mainPageFile = 'src/app/page.tsx';
let mainPage = fs.readFileSync(mainPageFile, 'utf8');

const oldMainHeader = /<div className="flex items-center gap-3 group cursor-pointer">\s*<img src="\/images\/logo\.png" alt="Integra Soluções SC" className="h-10 md:h-12 w-auto object-contain drop-shadow-md" \/>\s*<div className="flex flex-col -gap-1">\s*<span className="font-montserrat font-black text-brand-navy dark:text-white text-xl md:text-2xl tracking-tighter uppercase">Integra Soluções SC<\/span>\s*<span className="text-\[10px\] text-brand-emerald font-bold tracking-\[0\.2em\] uppercase opacity-80">Premium Services<\/span>\s*<\/div>\s*<\/div>/;

const newMainHeader = `<div className="flex items-center gap-3 md:gap-4 group cursor-pointer">
          <img src="/images/logo.png" alt="Integra Soluções SC" className="h-10 md:h-12 w-auto object-contain drop-shadow-md transition-transform duration-500 group-hover:scale-110" />
          <div className="flex flex-col justify-center pt-1">
            <div className="flex items-baseline gap-1.5 md:gap-2">
              <span className="font-montserrat font-black text-slate-900 dark:text-white text-2xl md:text-[28px] tracking-tighter uppercase leading-none">INTEGRA</span>
              <span className="font-montserrat font-bold text-slate-500 dark:text-slate-400 text-lg md:text-xl tracking-tight uppercase leading-none">SOLUÇÕES SC</span>
            </div>
            <span className="text-[8.5px] md:text-[10px] text-brand-emerald font-black tracking-[0.35em] md:tracking-[0.4em] uppercase mt-1.5">Premium Services</span>
          </div>
        </div>`;

mainPage = mainPage.replace(oldMainHeader, newMainHeader);
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
    
    // Replace old simple logo header
    const oldSubHeader = /<div className="flex items-center gap-2 cursor-pointer" onClick=\{\(\) => window\.location\.href='\/'\}>\s*<img src="\/images\/logo\.png" alt="Integra Soluções SC" className="h-8 md:h-10 w-auto object-contain drop-shadow-md" \/>\s*<span className="font-montserrat font-black text-brand-navy dark:text-white text-xl tracking-tight">Integra Soluções SC<\/span>\s*<\/div>/g;

    const newSubHeader = `<div className="flex items-center gap-3 cursor-pointer group" onClick={() => window.location.href='/'}>
          <img src="/images/logo.png" alt="Integra Soluções SC" className="h-8 md:h-10 w-auto object-contain drop-shadow-md transition-transform duration-300 group-hover:scale-105" />
          <div className="flex flex-col justify-center hidden sm:flex pt-1">
            <div className="flex items-baseline gap-1.5">
              <span className="font-montserrat font-black text-slate-900 dark:text-white text-xl tracking-tighter uppercase leading-none">INTEGRA</span>
              <span className="font-montserrat font-bold text-slate-500 dark:text-slate-400 text-sm tracking-tight uppercase leading-none">SOLUÇÕES SC</span>
            </div>
          </div>
        </div>`;

    content = content.replace(oldSubHeader, newSubHeader);
    fs.writeFileSync(file, content, 'utf8');
});

// 3. Update admin layout
const adminLayout = 'src/app/admin/(dashboard)/layout.tsx';
let adminContent = fs.readFileSync(adminLayout, 'utf8');
const oldAdminHeader = /<div className="flex items-center gap-3">\s*<img src="\/images\/logo\.png" alt="Integra Soluções SC" className="h-8 w-auto object-contain drop-shadow-md" \/>\s*<span className="font-montserrat font-black text-white text-lg tracking-tight hidden md:block">\s*Integra\s*<\/span>\s*<\/div>/g;

const newAdminHeader = `<div className="flex items-center gap-3">
              <img src="/images/logo.png" alt="Integra Soluções SC" className="h-8 w-auto object-contain drop-shadow-md" />
              <div className="flex flex-col hidden md:flex pt-1">
                <div className="flex items-baseline gap-1">
                  <span className="font-montserrat font-black text-white text-xl tracking-tighter uppercase leading-none">INTEGRA</span>
                </div>
              </div>
            </div>`;

adminContent = adminContent.replace(oldAdminHeader, newAdminHeader);
fs.writeFileSync(adminLayout, adminContent, 'utf8');

console.log('All typography updated successfully!');
