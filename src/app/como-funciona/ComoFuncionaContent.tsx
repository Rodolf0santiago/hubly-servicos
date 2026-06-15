"use client";

import React from "react";
import { motion, Variants } from "framer-motion";
import { ThemeToggle } from "@/components/ThemeToggle";
import Footer from "@/components/Footer";
import Link from "next/link";
import { 
  ClipboardList, Search, Award, Activity, TrendingUp,
  CheckCircle, Megaphone, ArrowRight, Handshake, LayoutDashboard, 
  Target, ShieldCheck, Clock, Zap, BarChart, Users, Star
} from "lucide-react";

export default function ComoFuncionaContent() {
  const fadeUp: Variants = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  const staggerContainer: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  return (
    <main className="flex-1 flex flex-col items-center w-full overflow-x-hidden relative bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      {/* Background Effects */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-brand-emerald/10 dark:bg-brand-emerald/5 blur-[120px] animate-pulse-subtle" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-500/10 dark:bg-blue-600/5 blur-[120px] animate-pulse-subtle" style={{ animationDelay: '1.5s' }} />
      </div>

      {/* Header */}
      <header className="absolute top-0 w-full px-6 py-6 md:px-12 md:py-8 flex justify-between items-center z-50">
        <Link href="/" className="flex items-center group cursor-pointer">
          <img src="/images/logo.png" alt="Integra Soluções SC" className="h-16 md:h-20 lg:h-24 w-auto object-contain drop-shadow-md transition-transform duration-500 group-hover:scale-105" />
        </Link>
        <ThemeToggle />
      </header>

      {/* Hero Section */}
      <section className="w-full pt-40 pb-20 md:pt-56 md:pb-32 px-6 md:px-12 max-w-[1200px] mx-auto text-center">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-emerald/10 text-brand-emerald dark:text-emerald-400 font-semibold text-sm mb-6 border border-brand-emerald/20">
            <Target className="w-4 h-4" />
            Transparência e Qualidade
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-8 leading-tight font-montserrat">
            Como Funciona a <span className="text-brand-emerald">INTEGRA</span> Soluções SC
          </h1>
          <p className="text-lg md:text-xl text-slate-600 dark:text-slate-300 max-w-4xl mx-auto leading-relaxed mb-10">
            Conectamos clientes às melhores empresas parceiras, com acompanhamento, controle de qualidade e gestão completa através do nosso CRM.
          </p>
          <p className="text-base md:text-lg text-slate-500 dark:text-slate-400 max-w-3xl mx-auto leading-relaxed">
            A INTEGRA Soluções SC atua como uma integradora de soluções e gestora de projetos, conectando clientes a empresas parceiras previamente homologadas e avaliadas. Nosso diferencial está na seleção criteriosa dos parceiros, no acompanhamento contínuo dos serviços e em um sistema de gestão baseado em desempenho, qualidade e satisfação do cliente.
          </p>
        </motion.div>
      </section>

      {/* Seção 1 - Nosso Modelo de Trabalho (Timeline) */}
      <section className="w-full py-20 bg-white/50 dark:bg-slate-900/30 backdrop-blur-md border-y border-slate-200 dark:border-slate-800 px-6 md:px-12 relative">
        <div className="max-w-[1440px] mx-auto">
          <motion.div 
            initial="hidden" 
            whileInView="visible" 
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeUp}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold font-montserrat mb-4 text-brand-navy dark:text-white">Nosso Modelo de Trabalho</h2>
            <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">Um processo inteligente e estruturado para garantir a melhor experiência de ponta a ponta.</p>
          </motion.div>

          {/* Timeline Container */}
          <div className="relative">
            {/* Connecting Line */}
            <div className="hidden lg:block absolute top-[50px] left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-brand-emerald/30 to-transparent -z-10" />

            <motion.div 
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8 relative"
            >
              {[
                { 
                  icon: ClipboardList, 
                  title: "1. Solicitação do Cliente", 
                  desc: "O cliente entra em contato através do nosso site e informa a necessidade. Nossa plataforma recebe e organiza tudo para análise."
                },
                { 
                  icon: Search, 
                  title: "2. Análise da Demanda", 
                  desc: "Avaliamos a solicitação (região, especialização, disponibilidade) e identificamos empresas homologadas com capacidade técnica."
                },
                { 
                  icon: Award, 
                  title: "3. Seleção da Empresa", 
                  desc: "A escolha é feita via CRM considerando qualidade, prazos, competitividade, satisfação e histórico de pontuação."
                },
                { 
                  icon: Handshake, 
                  title: "4. Encaminhamento", 
                  desc: "A empresa parceira recebe a oportunidade e contata o cliente para levantamento técnico, orçamento e planejamento."
                },
                { 
                  icon: Activity, 
                  title: "5. Acompanhamento", 
                  desc: "Monitoramos pelo CRM os prazos, etapas, pendências, atendimento e qualidade da execução durante todo o processo."
                },
                { 
                  icon: TrendingUp, 
                  title: "6. Avaliação e Melhoria", 
                  desc: "Resultados são registrados. Parceiros com melhor desempenho recebem prioridade; os que não mantêm o padrão são suspensos."
                }
              ].map((step, i) => (
                <motion.div key={i} variants={fadeUp} className="flex flex-col items-center text-center group">
                  <div className="w-24 h-24 rounded-2xl bg-white dark:bg-slate-800 shadow-xl shadow-brand-navy/5 flex items-center justify-center border border-slate-100 dark:border-slate-700 mb-6 relative group-hover:scale-110 group-hover:border-brand-emerald/50 transition-all duration-300">
                    <step.icon className="w-10 h-10 text-brand-emerald" />
                    <div className="absolute -inset-2 bg-brand-emerald/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity rounded-full -z-10" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-3">{step.title}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{step.desc}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Seção 2 - Nosso Sistema de Qualificação */}
      <section className="w-full py-24 px-6 md:px-12 max-w-[1200px] mx-auto">
        <motion.div 
          initial="hidden" 
          whileInView="visible" 
          viewport={{ once: true }}
          variants={fadeUp}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold font-montserrat mb-4 text-brand-navy dark:text-white">Nosso Sistema de Qualificação</h2>
          <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">Parceiros avaliados continuamente para manter um alto padrão de excelência.</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="p-8 rounded-3xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 shadow-lg hover:shadow-xl transition-shadow"
          >
            <ShieldCheck className="w-12 h-12 text-blue-500 mb-6" />
            <h3 className="text-2xl font-bold mb-4">Empresas Homologadas</h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6 text-sm">Todas as empresas passam por análise antes de ingressarem na rede.</p>
            <ul className="space-y-3">
              {['Experiência comprovada', 'Regularidade empresarial', 'Qualificação técnica', 'Capacidade operacional', 'Comprometimento com qualidade'].map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-slate-700 dark:text-slate-300">
                  <CheckCircle className="w-5 h-5 text-blue-500 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="p-8 rounded-3xl bg-brand-navy text-white shadow-xl relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <LayoutDashboard className="w-32 h-32" />
            </div>
            <LayoutDashboard className="w-12 h-12 text-brand-emerald mb-6 relative z-10" />
            <h3 className="text-2xl font-bold mb-4 relative z-10">Sistema de Pontuação</h3>
            <p className="text-slate-300 mb-6 text-sm relative z-10">Nosso CRM registra indicadores de desempenho em tempo real.</p>
            <ul className="space-y-3 relative z-10">
              {['Qualidade dos serviços', 'Cumprimento de prazos', 'Organização', 'Atendimento', 'Pós-venda', 'Feedback dos clientes'].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-sm text-slate-200">
                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="p-8 rounded-3xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 shadow-lg hover:shadow-xl transition-shadow"
          >
            <Award className="w-12 h-12 text-brand-orange mb-6" />
            <h3 className="text-2xl font-bold mb-4">Meritocracia</h3>
            <p className="text-slate-600 dark:text-slate-400 mb-4 text-sm leading-relaxed">
              Os parceiros mais bem avaliados recebem maior prioridade na distribuição de oportunidades de negócios.
            </p>
            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
              Isso garante uma rede em constante evolução e melhoria contínua, recompensando quem entrega os melhores resultados.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Seção 3 - Geração de Clientes */}
      <section className="w-full py-24 px-6 md:px-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-brand-emerald/5 dark:bg-brand-emerald/10 -z-10" />
        <div className="max-w-[1200px] mx-auto flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex-1"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-emerald/20 text-brand-emerald font-semibold text-sm mb-6">
              <Megaphone className="w-4 h-4" />
              Marketing Estratégico
            </div>
            <h2 className="text-3xl md:text-5xl font-bold font-montserrat mb-6 leading-tight">
              Nós Investimos para <br/>
              <span className="text-brand-emerald">Gerar Oportunidades</span>
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
              A INTEGRA Soluções SC investe continuamente na geração de novos clientes através de estratégias de marketing digital e publicidade online.
            </p>
            <p className="text-lg text-slate-600 dark:text-slate-300 mb-8 leading-relaxed">
              Enquanto nossos parceiros focam na execução dos serviços, nós focamos na prospecção, qualificação e gestão dos leads. Nosso objetivo é facilitar o acesso dos clientes a empresas qualificadas.
            </p>
            <div className="flex flex-wrap gap-3">
              {['Google Ads', 'Redes Sociais', 'SEO', 'Marketing de Conteúdo', 'Geração de Leads', 'Divulgação Regional'].map((tag, i) => (
                <span key={i} className="px-4 py-2 rounded-lg bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700 text-sm font-medium text-slate-700 dark:text-slate-200">
                  {tag}
                </span>
              ))}
            </div>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="flex-1 relative"
          >
            <div className="aspect-square max-w-[500px] mx-auto rounded-full bg-gradient-to-tr from-brand-emerald/20 to-blue-500/20 flex items-center justify-center relative p-8">
               <div className="absolute inset-0 border-[40px] border-white/40 dark:border-slate-800/40 rounded-full animate-pulse-subtle" />
               <div className="w-full h-full rounded-full bg-white dark:bg-slate-800 shadow-2xl flex items-center justify-center overflow-hidden border border-slate-100 dark:border-slate-700 relative z-10">
                 <BarChart className="w-32 h-32 text-brand-emerald opacity-20 absolute top-10 right-10" />
                 <Users className="w-32 h-32 text-blue-500 opacity-20 absolute bottom-10 left-10" />
                 <Megaphone className="w-24 h-24 text-brand-orange relative z-20" />
               </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Seção 4 & 5 - Benefícios */}
      <section className="w-full py-24 px-6 md:px-12 max-w-[1200px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
          
          {/* Benefícios Cliente */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white/60 dark:bg-slate-900/60 p-10 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-xl"
          >
            <div className="w-16 h-16 rounded-2xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-8">
              <ShieldCheck className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-3xl font-bold font-montserrat mb-8">Vantagens para Você <span className="text-slate-400 text-lg font-normal block mt-1">(Cliente)</span></h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-4">
              {[
                "Empresas homologadas", "Mais segurança na contratação", "Controle e acompanhamento", 
                "Atendimento mais rápido", "Qualidade monitorada", "Menor risco na escolha", 
                "Transparência nas etapas", "Profissionais especializados"
              ].map((ben, i) => (
                <div key={i} className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                  <span className="text-slate-700 dark:text-slate-300 font-medium">{ben}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Benefícios Parceiros */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-brand-navy to-slate-900 p-10 rounded-[2.5rem] shadow-xl text-white border border-slate-800 relative overflow-hidden"
          >
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-brand-emerald/20 rounded-full blur-3xl" />
            <div className="w-16 h-16 rounded-2xl bg-brand-emerald/20 flex items-center justify-center mb-8 relative z-10 border border-brand-emerald/30">
              <TrendingUp className="w-8 h-8 text-brand-emerald" />
            </div>
            <h3 className="text-3xl font-bold font-montserrat mb-8 relative z-10">Cresça Conosco <span className="text-slate-400 text-lg font-normal block mt-1">(Empresas Parceiras)</span></h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-4 relative z-10">
              {[
                "Receba novos clientes", "Leads qualificados", "Menor investimento em marketing", 
                "Gestão através do CRM", "Aumento da visibilidade", "Mais oportunidades de negócios", 
                "Avaliação por desempenho", "Crescimento sustentável"
              ].map((ben, i) => (
                <div key={i} className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-brand-emerald shrink-0 mt-0.5" />
                  <span className="text-slate-200 font-medium">{ben}</span>
                </div>
              ))}
            </div>
          </motion.div>

        </div>
      </section>

      {/* Seção Final - Missão e CTAs */}
      <section className="w-full py-24 px-6 md:px-12 bg-gradient-to-b from-transparent to-slate-100 dark:to-slate-900">
        <div className="max-w-[1000px] mx-auto text-center">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="bg-white dark:bg-slate-800 p-10 md:p-16 rounded-[3rem] shadow-2xl border border-slate-100 dark:border-slate-700 relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-brand-emerald via-blue-500 to-brand-orange" />
            
            <h2 className="text-sm font-bold tracking-widest uppercase text-slate-400 mb-6">Nossa Missão</h2>
            <p className="text-xl md:text-3xl font-medium text-slate-800 dark:text-slate-100 leading-relaxed mb-12 font-montserrat">
              Integrar clientes e empresas qualificadas através de um processo transparente, organizado e monitorado, garantindo excelência na prestação de serviços e melhoria contínua de toda a rede parceira.
            </p>
            
            <div className="flex flex-wrap justify-center gap-4 md:gap-8 mb-12">
              {[
                "Conectamos aos melhores.", 
                "Acompanhamos cada etapa.", 
                "Valorizamos a qualidade.", 
                "Geramos oportunidades.", 
                "Entregamos confiança."
              ].map((phrase, i) => (
                <div key={i} className="flex items-center gap-2 text-sm md:text-base font-semibold text-brand-emerald">
                  <Star className="w-4 h-4 fill-brand-emerald" /> {phrase}
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <Link href="/#orcamento" className="w-full sm:w-auto px-8 py-4 bg-brand-emerald hover:bg-emerald-600 text-white font-bold rounded-2xl transition-all shadow-lg shadow-brand-emerald/30 flex items-center justify-center gap-2 group">
                Solicitar Atendimento
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link href="/contato-parceiro" className="w-full sm:w-auto px-8 py-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-white font-bold rounded-2xl transition-all flex items-center justify-center gap-2">
                Quero Ser Parceiro
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
