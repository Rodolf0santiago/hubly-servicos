"use client";

import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ShieldCheck, TrendingUp, CheckCircle2 } from 'lucide-react';

export default function CompanyMetricsShowcase() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Track scroll progress inside the container. We use "end end" to ensure the 
  // second image reaches the top completely by the end of the scroll container.
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 60%", "end end"]
  });

  // Image 1 stays in place initially, then fades slightly
  const opacity1 = useTransform(scrollYProgress, [0, 0.7], [1, 0.4]);
  const scale1 = useTransform(scrollYProgress, [0, 0.7], [1, 0.95]);

  // Image 2 slides up from the bottom
  const y2 = useTransform(scrollYProgress, [0, 1], ["100%", "0%"]);
  
  return (
    <section className="w-full bg-slate-50 dark:bg-slate-900/50 py-24 border-y border-slate-200/50 dark:border-slate-800/50 relative">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 flex flex-col xl:flex-row gap-16 xl:gap-24">
        
        {/* Left: Text Content (Sticky) */}
        <div className="w-full xl:w-5/12">
          <div className="sticky top-32 space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-emerald/10 text-brand-emerald font-bold text-xs uppercase tracking-widest border border-brand-emerald/20">
              <ShieldCheck className="w-4 h-4" /> Controle de Qualidade
            </div>
            
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white leading-[1.1]">
              Acompanhamento rigoroso das <span className="text-brand-emerald">empresas parceiras</span>
            </h2>
            
            <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed">
              Não basta apenas conectar você aos profissionais. Nós possuímos um <strong>Sistema de Gestão Exclusivo</strong> que monitora e pontua cada empresa baseada na performance de obras reais.
            </p>
            
            <div className="space-y-5 pt-4">
              {[
                { icon: TrendingUp, title: "Auditoria Contínua", desc: "Cada projeto entregue gera uma nota de 0 a 5 em diversos requisitos como pontualidade e qualidade." },
                { icon: CheckCircle2, title: "Transparência Total", desc: "As empresas homologadas precisam manter um Score alto para continuarem recebendo projetos da rede." }
              ].map((item, i) => (
                <div key={i} className="flex gap-4 items-start">
                  <div className="w-12 h-12 rounded-xl bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0">
                    <item.icon className="w-6 h-6 text-brand-emerald" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-slate-900 dark:text-white">{item.title}</h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Scroll Animation */}
        {/* h-[150vh] gives extra space to scroll while keeping the element sticky */}
        <div ref={containerRef} className="w-full xl:w-7/12 h-[120vh] xl:h-[150vh] relative">
          <div className="sticky top-32 w-full aspect-video md:aspect-[16/10] rounded-2xl overflow-hidden shadow-2xl border border-slate-200/50 dark:border-slate-700/50 flex items-center justify-center bg-slate-200 dark:bg-slate-800">
            
            {/* Primeira Imagem (Fundo) */}
            <motion.div 
              className="absolute inset-0 w-full h-full bg-white origin-top"
              style={{ opacity: opacity1, scale: scale1 }}
            >
              <img 
                src="/images/crm-dashboard-1.jpg" 
                alt="Lista de Empresas Homologadas" 
                className="w-full h-full object-cover object-left-top"
              />
            </motion.div>

            {/* Segunda Imagem (Sobreposta rolando de baixo para cima) */}
            <motion.div 
              className="absolute inset-x-0 bottom-0 h-[85%] bg-white dark:bg-slate-900 rounded-t-xl shadow-[0_-20px_50px_rgba(0,0,0,0.4)] overflow-hidden border-t-4 border-brand-emerald"
              style={{ y: y2 }}
            >
              <img 
                src="/images/crm-dashboard-2.png" 
                alt="Dashboard de Métricas" 
                className="w-full h-full object-cover object-left-top"
              />
            </motion.div>

          </div>
        </div>
      </div>
    </section>
  );
}
