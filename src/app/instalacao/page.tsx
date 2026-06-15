import React from 'react';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck, BadgeCheck } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import TrustSection from '@/components/TrustSection';
import Testimonials from '@/components/Testimonials';
import GaleriaSection from '@/components/GaleriaSection';
import LeadForm from '@/components/LeadForm';
import Footer from '@/components/Footer';
import SolarCalculatorPortal from '@/components/SolarCalculatorPortal';
import { getAllSiteSettingsAction } from '@/app/actions/settings';
const DEFAULT_INSTALACAO_PAGE = {
  ongrid_badge: 'Conectado à Rede',
  ongrid_title1: 'Sistemas',
  ongrid_title2: 'On-Grid',
  ongrid_desc1: 'O sistema on-grid é a solução ideal para quem busca economia imediata conectada à rede elétrica tradicional. Toda a energia solar captada pelos painéis é consumida diretamente pelo seu imóvel, e o excedente produzido é injetado na rede da concessionária local, transformando-se em créditos valiosos para a sua fatura.',
  ongrid_desc2: 'Quando o sol se põe ou em dias de baixa irradiação, você continua utilizando a energia da rede pública normalmente, garantindo um abastecimento contínuo e sem interrupções.',
  ongrid_image: '/images/sistema_ongrid.png',

  hibrido_badge: 'Armazenamento Próprio',
  hibrido_title1: 'Sistemas',
  hibrido_title2: 'Híbridos',
  hibrido_title3: 'e Backup',
  hibrido_desc1: 'Tenha o melhor dos dois mundos. O sistema híbrido une a praticidade e os créditos da conexão com a rede pública à segurança do armazenamento próprio através de baterias modernas.',
  hibrido_desc2: 'Além de reduzir sua conta de luz exportando a energia excedente, parte da produção é armazenada para garantir o funcionamento da sua casa ou empresa durante a noite ou em casos de apagões e falhas no fornecimento da concessionária. Máxima autonomia, segurança e flexibilidade para o seu dia a dia.',
  hibrido_image: '/images/sistema_hibrido.png'
};

export default async function InstalacaoPage() {
  const settingsRes = await getAllSiteSettingsAction();
  const settings = settingsRes.success ? settingsRes.data : null;
  
  // Encontrar a configuração específica para este serviço
  const service = (settings?.services || []).find((s: any) => s.id === 'instalacao_manutencao') || {
    title: 'Instalação e Manutenção',
    description: 'Projetos de energia solar de alta performance, desde a homologação até o monitoramento ativo.',
    subpage_image: '/images/instalacao.png',
    differentials_title: 'O que garantimos:',
    differentials: [
      "Projetos assinados por Engenheiros Homologados",
      "Uso de materiais de primeira linha (Tier 1)",
      "Pós-venda e monitoramento ativo pela Integra Soluções SC",
      "Instalação rápida e com limpeza total"
    ]
  };


  const testimonialsData = settings?.testimonials || [];
  const instalacaoPage = settings?.instalacao_page || DEFAULT_INSTALACAO_PAGE;

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center relative overflow-hidden">
      {/* Background Decor */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-brand-emerald/10 dark:bg-brand-emerald/5 blur-[120px]" />
        <div className="absolute top-[30%] right-[-10%] w-[60%] h-[60%] rounded-full bg-blue-500/10 dark:bg-blue-600/5 blur-[120px]" />
      </div>

      <header className="absolute top-0 w-full px-4 py-4 md:px-8 md:py-6 flex justify-between items-center z-50">
        <div className="flex items-center gap-2">
          <img src="/images/logo.png" alt="Integra Soluções SC" className="h-10 md:h-12 w-auto object-contain" />
          <span className="font-montserrat font-black text-brand-navy dark:text-white text-xl tracking-tight">Integra Soluções SC</span>
        </div>
        <ThemeToggle />
      </header>

      {/* Hero Section with Calculator */}
      <section className="w-full pt-32 pb-0 overflow-hidden relative">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 -z-20">
          <img 
            src={service.subpage_image || service.image || "/images/instalacao.png"} 
            alt="Fundo Instalação" 
            className="w-full h-full object-cover opacity-20 dark:opacity-10 grayscale"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-50 via-transparent to-slate-50 dark:from-slate-950 dark:via-transparent dark:to-slate-950" />
        </div>

        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full -z-10 opacity-30 dark:opacity-20 blur-[120px] pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-brand-emerald rounded-full" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-brand-orange rounded-full" />
        </div>
        
        <div className="w-full max-w-7xl mx-auto px-4 mb-8 relative z-10">
          <Link href="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-brand-emerald transition-colors font-semibold text-sm">
            <ArrowLeft className="w-4 h-4" />
            Voltar para a Home
          </Link>
        </div>

        <SolarCalculatorPortal />
      </section>

      <TrustSection data={settings?.trust} />
      
      <div className="py-12 w-full bg-white/50 dark:bg-slate-900/50 border-y border-slate-200 dark:border-slate-800">
        <div className="max-w-4xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="relative aspect-video rounded-3xl overflow-hidden shadow-2xl border border-white dark:border-slate-700">
             <img src={service.subpage_image || service.image || "/images/instalacao.png"} alt={service.title} className="w-full h-full object-cover" />
             <div className="absolute inset-0 bg-gradient-to-t from-brand-navy/60 to-transparent" />
             <div className="absolute bottom-6 left-6 text-white">
                <BadgeCheck className="w-8 h-8 text-brand-emerald mb-2" />
                <p className="font-bold text-xl uppercase tracking-tighter">Engenharia Certificada</p>
             </div>
          </div>
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-brand-navy dark:text-white uppercase tracking-tight font-montserrat">
              {service.differentials_title || 'O que garantimos:'}
            </h3>
            <ul className="space-y-3">
              {(service.differentials || []).map((item: string, i: number) => (
                <li key={i} className="flex items-center gap-3 text-slate-600 dark:text-slate-400 text-sm md:text-base">
                  <div className="w-5 h-5 rounded-full bg-brand-emerald/20 flex items-center justify-center flex-shrink-0">
                    <div className="w-2 h-2 rounded-full bg-brand-emerald" />
                  </div>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Tipos de Sistemas Solares */}
      <section className="py-20 w-full bg-white dark:bg-slate-950">
        <div className="max-w-6xl mx-auto px-4 space-y-24">
          {/* Sistema On-Grid */}
          <div className="flex flex-col md:flex-row gap-10 items-center">
            <div className="w-full md:w-1/2 order-2 md:order-1 space-y-5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-emerald/10 border border-brand-emerald/20 text-brand-emerald text-sm font-bold uppercase tracking-wider mb-2">
                {instalacaoPage.ongrid_badge}
              </div>
              <h3 className="text-3xl md:text-4xl font-bold text-brand-navy dark:text-white font-montserrat tracking-tight">
                {instalacaoPage.ongrid_title1} <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-emerald to-emerald-400">{instalacaoPage.ongrid_title2}</span>
              </h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-lg">
                {instalacaoPage.ongrid_desc1}
              </p>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-lg">
                {instalacaoPage.ongrid_desc2}
              </p>
            </div>
            <div className="w-full md:w-1/2 order-1 md:order-2">
              <div className="aspect-video rounded-3xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 relative group">
                <div className="absolute inset-0 bg-brand-navy/10 group-hover:bg-transparent transition-colors duration-500 z-10" />
                <img src={instalacaoPage.ongrid_image} alt={instalacaoPage.ongrid_title2} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              </div>
            </div>
          </div>

          {/* Sistema Híbrido */}
          <div className="flex flex-col md:flex-row-reverse gap-10 items-center">
            <div className="w-full md:w-1/2 order-2 md:order-1 space-y-5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-orange/10 border border-brand-orange/20 text-brand-orange text-sm font-bold uppercase tracking-wider mb-2">
                {instalacaoPage.hibrido_badge}
              </div>
              <h3 className="text-3xl md:text-4xl font-bold text-brand-navy dark:text-white font-montserrat tracking-tight">
                {instalacaoPage.hibrido_title1} <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-orange to-yellow-500">{instalacaoPage.hibrido_title2}</span> {instalacaoPage.hibrido_title3}
              </h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-lg">
                {instalacaoPage.hibrido_desc1}
              </p>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-lg">
                {instalacaoPage.hibrido_desc2}
              </p>
            </div>
            <div className="w-full md:w-1/2 order-1 md:order-2">
              <div className="aspect-video rounded-3xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 relative group">
                <div className="absolute inset-0 bg-brand-navy/10 group-hover:bg-transparent transition-colors duration-500 z-10" />
                <img src={instalacaoPage.hibrido_image} alt={instalacaoPage.hibrido_title2} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <GaleriaSection servico="instalacao_manutencao" />
      <Testimonials serviceId="instalacao_manutencao" data={testimonialsData} />
      <LeadForm defaultService="Instalação e Manutenção" />
      <Footer />
    </main>
  );
}
