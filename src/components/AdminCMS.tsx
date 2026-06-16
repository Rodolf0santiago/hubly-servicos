"use client";

import React, { useEffect, useState } from 'react';
import { 
  getAllSiteSettingsAction, 
  saveSiteSettingsAction, 
  uploadSiteImageAction 
} from '@/app/actions/settings';
import AdminGaleria from '@/components/AdminGaleria';
import { 
  Save, 
  Upload, 
  Image as ImageIcon, 
  Plus, 
  Trash2, 
  Loader2, 
  Check, 
  Sparkles, 
  ArrowRight, 
  Star, 
  ShieldCheck, 
  MessageSquare,
  BadgeCheck,
  Settings,
  ChevronUp,
  ChevronDown,
  Sun,
  BarChart
} from 'lucide-react';

const DEFAULT_HERO = {
  badge: "Hub de Empresas 100% Homologadas",
  title_part1: "CONTRATE COM",
  title_part2: "SEGURANÇA",
  title_part3: "E ECONOMIA",
  description: "Sua plataforma definitiva para contratar serviços homologados de automação, energia limpa, segurança e climatização com total tranquilidade.",
  cta_text: "Solicitar Orçamento Grátis",
  trust_subtitle: "Clientes satisfeitos em SC"
};

const DEFAULT_SERVICES = [
  {
    id: 'limpeza_solar',
    title: 'Limpeza Técnica de Placas',
    image: '/images/limpeza.png',
    icon: 'Sun',
    href: '/calculadora',
    description: 'Descubra quanto você está deixando de ganhar por causa da sujeira nos seus painéis solares.',
    subpage_image: '/images/limpeza.png',
    differentials_title: 'Diferenciais do Serviço:',
    differentials: [
      'Aumento imediato de até 25% na geração',
      'Prevenção de danos permanentes (hotspots)',
      'Uso de água desmineralizada e produtos corretos',
      'Equipe certificada para trabalho em altura (NR35)'
    ],
    hidden: false
  },
  {
    id: 'instalacao_manutencao',
    title: 'Instalação e Manutenção',
    image: '/images/instalacao.png',
    icon: 'Wrench',
    href: '/instalacao',
    description: 'Projetos de energia solar de alta performance, desde a homologação até o monitoramento ativo.',
    subpage_image: '/images/instalacao.png',
    differentials_title: 'O que garantimos:',
    differentials: [
      'Projetos assinados por Engenheiros Homologados',
      'Uso de materiais de primeira linha (Tier 1)',
      'Pós-venda e monitoramento ativo pela Integra Soluções SC',
      'Instalação rápida e com limpeza total'
    ],
    hidden: false
  },
  {
    id: 'automacao_residencial',
    title: 'Automação Residencial',
    image: '/images/automacao_residencial.png',
    icon: 'Cpu',
    href: '/automacao-residencial',
    description: 'Sistemas completos de automação residencial. Controle iluminação, som, persianas e climatização de forma inteligente e integrada.',
    subpage_image: '/images/automacao_residencial.png',
    differentials_title: 'O que garantimos:',
    differentials: [
      'Projetos personalizados e integração inteligente de sistemas',
      'Controle unificado via smartphone, tablet ou assistente de voz',
      'Automação de iluminação cênica, persianas e climatização',
      'Sonorização multiroom e home theater de alta fidelidade'
    ],
    hidden: false
  },
  {
    id: 'aquecimento_piso',
    title: 'Aquecimento de Piso Premium',
    image: '/images/aquecimento.png',
    icon: 'ThermometerSun',
    href: '/aquecimento',
    description: 'O máximo conforto térmico para sua casa com tecnologia de ponta e instalação auditada pela Integra Soluções SC.',
    subpage_image: '/images/aquecimento.png',
    differentials_title: 'Diferenciais do Hub:',
    differentials: [
      'Sistemas de alta eficiência e baixo consumo',
      'Instalação especializada sem sujeira',
      'Controle total via smartphone',
      'Garantia estendida via Integra Soluções SC'
    ],
    hidden: false
  },
  {
    id: 'controle_acesso',
    title: 'Controle de Acesso',
    image: '/images/controle_acesso.png',
    icon: 'Fingerprint',
    href: '/controle-acesso',
    description: 'Sistemas inteligentes de identificação, biometria e controle de fluxo para condomínios e empresas.',
    subpage_image: '/images/controle_acesso.png',
    differentials_title: 'Diferenciais do Serviço:',
    differentials: [
      'Reconhecimento facial e biometria de última geração',
      'Integração com sistemas de segurança e portaria',
      'Controle de fluxo de pedestres e veículos por aplicativo',
      'Suporte técnico 24h e manutenção preventiva'
    ],
    hidden: false
  },
  {
    id: 'ar_condicionado',
    title: 'Instalação e Manutenção de Ar Condicionado',
    image: '/images/ar_condicionado.png',
    icon: 'Snowflake',
    href: '/ar-condicionado',
    description: 'Projetos de climatização residencial e comercial, higienização profissional e carga de gás com garantia.',
    subpage_image: '/images/ar_condicionado.png',
    differentials_title: 'Diferenciais do Serviço:',
    differentials: [
      'Técnicos certificados e credenciados pelos fabricantes',
      'Higienização completa para eliminação de fungos e bactérias',
      'Dimensionamento térmico exato para economia de energia',
      'Instalação rápida que mantém a garantia de fábrica'
    ],
    hidden: false
  },
  {
    id: 'carregamento_veicular',
    title: 'Carregamento Veicular',
    image: '/images/carregamento.png',
    icon: 'Zap',
    href: '/carregamento-veicular',
    description: 'Soluções completas de carregamento para veículos elétricos (VE), com projetos homologados para residências, condomínios e comércios.',
    subpage_image: '/images/carregamento.png',
    differentials_title: 'Diferenciais do Serviço:',
    differentials: [
      'Projetos de infraestrutura elétrica sob medida (homologação na concessionária)',
      'Instalação de carregadores rápidos (Wallbox) com proteção total (DPS e DR)',
      'Estudos de viabilidade técnica e gestão de consumo de energia',
      'Técnicos especialistas certificados com conformidade à norma NBR 5410 e NR10'
    ],
    hidden: false
  }
];

const DEFAULT_TESTIMONIALS = [
  {
    id: 1,
    text: "Fiquei impressionado com a diferença na geração após a limpeza. A equipe foi muito técnica e cuidadosa. Recomendo fortemente para quem quer manter o sistema no máximo!",
    service: "Limpeza Técnica de Placas",
    serviceId: "limpeza_solar",
    name: "Carlos Eduardo",
    location: "Florianópolis, SC",
    rating: 5
  },
  {
    id: 2,
    text: "Instalação impecável. Tudo organizado, cabos bem passados e suporte nota 10. O Integra Soluções SC realmente seleciona as melhores empresas, me senti muito seguro durante todo o processo.",
    service: "Instalação de Energia Solar",
    serviceId: "instalacao_manutencao",
    name: "Mariana Souza",
    location: "Joinville, SC",
    rating: 5
  },
  {
    id: 3,
    text: "O aquecimento de piso foi a melhor decisão que tomamos para nossa casa na serra. Conforto térmico absoluto e um acabamento de primeira. Os técnicos são verdadeiros especialistas.",
    service: "Aquecimento de Piso Premium",
    serviceId: "aquecimento_piso",
    name: "Roberto Almeida",
    location: "Blumenau, SC",
    rating: 5
  },
  {
    id: 4,
    text: "O sistema tinha perdido quase 20% de eficiência. Após a limpeza técnica da Integra Soluções SC, os números voltaram ao normal no mesmo dia. Investimento que se paga muito rápido.",
    service: "Limpeza Técnica de Placas",
    serviceId: "limpeza_solar",
    name: "Ricardo Mendes",
    location: "São José, SC",
    rating: 5
  },
  {
    id: 5,
    text: "Excelente atendimento do início ao fim. A equipe de instalação foi muito pontual e o sistema está funcionando perfeitamente. O acompanhamento da Integra faz toda a diferença.",
    service: "Instalação de Energia Solar",
    serviceId: "instalacao_manutencao",
    name: "Felipe Oliveira",
    location: "Itajaí, SC",
    rating: 5
  },
  {
    id: 6,
    text: "Sistema de aquecimento de piso de altíssima qualidade. A automação funciona super bem e o calor é muito uniforme. Equipe técnica muito bem preparada e educada.",
    service: "Aquecimento de Piso Premium",
    serviceId: "aquecimento_piso",
    name: "Juliana Costa",
    location: "Lages, SC",
    rating: 5
  }
];

const DEFAULT_TRUST = {
  badge: "Qualidade Homologada",
  title_part1: "POR QUE CONTRATAR",
  title_part2: "VIA Integra Soluções SC?",
  description: "Diferente de contratar uma empresa direto no escuro, o Integra Soluções SC é a sua camada de proteção absoluta. Selecionamos apenas a elite do mercado.",
  certified_title: "Certificado de Homologação",
  certified_desc: "Apenas 15% das empresas que aplicam são aprovadas em nosso processo de auditoria.",
  steps: [
    {
      title: "Triagem Rigorosa",
      description: "Analisamos o histórico, certificações e a saúde financeira de cada empresa parceira antes de entrar no Hub."
    },
    {
      title: "Garantia de Qualidade",
      description: "A Integra Soluções SC audita os projetos para garantir que a instalação siga as normas técnicas e de segurança."
    },
    {
      title: "Melhor Negociação",
      description: "Por sermos um Hub, negociamos em grande volume para garantir o melhor preço para você cliente final."
    }
  ]
};

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

const DEFAULT_COMPANY_METRICS = {
  badge: "Controle de Qualidade",
  title_part1: "Acompanhamento rigoroso das",
  title_part2: "empresas parceiras",
  description: "Não basta apenas conectar você aos profissionais. Nós possuímos um Sistema de Gestão Exclusivo que monitora e pontua cada empresa baseada na performance de obras reais.",
  image1: "/images/crm-dashboard-1.jpg?v=4",
  image2: "/images/crm-dashboard-2.png?v=4",
  indicator1_icon: "TrendingUp",
  indicator1_title: "Auditoria Contínua",
  indicator1_desc: "Cada projeto entregue gera uma nota de 0 a 5 em diversos requisitos como pontualidade e qualidade.",
  indicator2_icon: "CheckCircle2",
  indicator2_title: "Transparência Total",
  indicator2_desc: "As empresas homologadas precisam manter um Score alto para continuarem recebendo projetos da rede."
};

const DEFAULT_INTERACTIVE_HOUSE = {
  badge: "Integra Smart Home",
  title_part1: "UMA ÚNICA ENERGIA.",
  title_part2: "MÚLTIPLAS SOLUÇÕES.",
  description: "Conectamos tecnologia, conforto e sustentabilidade para gerar economia imediata e valorizar o seu imóvel. Toque nos pontos da casa ou navegue pelos serviços para ver como funciona.",
  image: "/images/hubly_house_diagram.png",
  services: [
    {
      id: 0,
      title: "Energia Solar Residencial",
      subtitle: "Geração própria de energia limpa e renovável.",
      description: "Economize até 95% na sua fatura de energia elétrica e proteja-se contra a inflação energética. A Integra Soluções SC cuida de toda a viabilidade técnica, projeto de engenharia e homologação na concessionária.",
      benefits: [
        "Economia imediata de até 95% na conta",
        "Retorno de investimento (Payback) rápido",
        "Valorização instantânea de mercado do imóvel",
        "Equipamentos premium com até 25 anos de garantia"
      ],
      badge: "Energia Inteligente",
      buttonText: "Simular Projeto Solar",
      href: "/instalacao",
      icon: "Sun",
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10",
      borderColor: "border-emerald-500/20",
      coords: { x: 42, y: 24 }
    },
    {
      id: 1,
      title: "Carregamento Veicular (EV)",
      subtitle: "Infraestrutura moderna e segura para recarga em casa.",
      description: "Carregue o seu veículo elétrico no conforto do seu lar utilizando a energia gerada pelo sol. Projetos completos com carregadores de carga rápida (Wallbox), proteções obrigatórias (DPS e DR) e estudo de capacidade da rede.",
      benefits: [
        "Custo de recarga até 80% menor que gasolina",
        "Estação de carregamento inteligente e rápida (Wallbox)",
        "Dispositivos de proteção elétrica inclusos (DPS/DR)",
        "Integração perfeita com o sistema solar da casa"
      ],
      badge: "Mobilidade Elétrica",
      buttonText: "Orçamento de Carregador",
      href: "/carregamento-veicular",
      icon: "Zap",
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-500/20",
      coords: { x: 27, y: 68 }
    },
    {
      id: 2,
      title: "Aquecimento de Piso Premium",
      subtitle: "O máximo conforto térmico inteligente para o seu lar.",
      description: "Esqueça o frio nos pés com o aquecimento sob o piso. Um sistema totalmente silencioso, invisível e energeticamente eficiente, controlado por termostatos inteligentes wifi com controle independente de zonas.",
      benefits: [
        "Temperatura uniforme e agradável por toda a casa",
        "Controle inteligente por aplicativo no celular/Wi-Fi",
        "Livre de poeira e ácaros (ideal para pessoas alérgicas)",
        "Instalação compatível com porcelanato, vinílico e madeira"
      ],
      badge: "Conforto Térmico",
      buttonText: "Simular Aquecimento de Piso",
      href: "/aquecimento",
      icon: "ThermometerSun",
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
      borderColor: "border-orange-500/20",
      coords: { x: 58, y: 82 }
    },
    {
      id: 3,
      title: "Limpeza Técnica de Placas",
      subtitle: "Manutenção automatizada com robôs para máxima performance.",
      description: "A sujeira acumulada nas suas placas solares pode reduzir a sua geração em até 30%. Realizamos limpeza técnica especializada com água desmineralizada e robôs automáticos de última geração, sem riscos aos módulos.",
      benefits: [
        "Recuperação imediata da eficiência de geração solar",
        "Limpeza automatizada segura sem riscos de trincas nos vidros",
        "Prolongamento da vida útil e proteção das placas",
        "Equipe técnica certificada pelas normas NR35 e NR10"
      ],
      badge: "Alta Performance",
      buttonText: "Calcular Perda por Sujeira",
      href: "/calculadora",
      icon: "ShieldCheck",
      color: "text-[#DC2626]",
      bgColor: "bg-red-500/10",
      borderColor: "border-red-500/20",
      coords: { x: 64, y: 24 }
    }
  ]
};

const DEFAULT_COMO_FUNCIONA_PAGE = {
  hero_badge: "Transparência e Qualidade",
  hero_title_part1: "Como Trabalhamos na",
  hero_title_part2: "INTEGRA",
  hero_title_part3: "Soluções SC",
  hero_desc1: "Conectamos clientes às melhores empresas parceiras, com acompanhamento, controle de qualidade e gestão completa através do nosso CRM.",
  hero_desc2: "A INTEGRA Soluções SC atua como uma integradora de soluções e gestora de projetos, conectando clientes a empresas parceiras previamente homologadas e avaliadas. Nosso diferencial está na seleção criteriosa dos parceiros, no acompanhamento contínuo dos serviços e em um sistema de gestão baseado em desempenho, qualidade e satisfação do cliente.",
  
  timeline_title: "Nosso Modelo de Trabalho",
  timeline_subtitle: "Um processo inteligente e estruturado para garantir a melhor experiência de ponta a ponta.",
  timeline_steps: [
    { title: "1. Solicitação do Cliente", desc: "O cliente entra em contato através do nosso site e informa a necessidade. Nossa plataforma recebe e organiza tudo para análise.", icon: "ClipboardList" },
    { title: "2. Análise da Demanda", desc: "Avaliamos a solicitação (região, especialização, disponibilidade) e identificamos empresas homologadas com capacidade técnica.", icon: "Search" },
    { title: "3. Seleção da Empresa", desc: "A escolha é feita via CRM considerando qualidade, prazos, competitividade, satisfação e histórico de pontuação.", icon: "Award" },
    { title: "4. Encaminhamento", desc: "A empresa parceira recebe a oportunidade e contata o cliente para levantamento técnico, orçamento e planejamento.", icon: "Handshake" },
    { title: "5. Acompanhamento", desc: "Monitoramos pelo CRM os prazos, etapas, pendências, atendimento e qualidade da execução durante todo o processo.", icon: "Activity" },
    { title: "6. Avaliação e Melhoria", desc: "Resultados são registrados. Parceiros com melhor desempenho recebem prioridade; os que não mantêm o padrão são suspensos.", icon: "TrendingUp" }
  ],

  marketing_badge: "Marketing Estratégico",
  marketing_title: "Nós Investimos para Gerar Oportunidades",
  marketing_desc1: "A INTEGRA Soluções SC investe continuamente na geração de novos clientes através de estratégias de marketing digital e publicidade online.",
  marketing_desc2: "Enquanto nossos parceiros focam na execução dos serviços, nós focamos na prospecção, qualificação e gestão dos leads. Nosso objetivo é facilitar o acesso dos clientes a empresas qualificadas.",
  marketing_tags: "Google Ads, Redes Sociais, SEO, Marketing de Conteúdo, Geração de Leads, Divulgação Regional",

  qualif_title: "Nosso Sistema de Qualificação",
  qualif_subtitle: "Parceiros avaliados continuamente para manter um alto padrão de excelência.",
  qualif_card1_title: "Empresas Homologadas",
  qualif_card1_desc: "Todas as empresas passam por análise antes de ingressarem na rede.",
  qualif_card1_items: "Experiência comprovada, Regularidade empresarial, Qualificação técnica, Capacidade operacional, Comprometimento com qualidade",
  qualif_card2_title: "Sistema de Pontuação",
  qualif_card2_desc: "Nosso CRM registra indicadores de desempenho em tempo real.",
  qualif_card2_items: "Qualidade dos serviços, Cumprimento de prazos, Organização, Atendimento, Pós-venda, Feedback dos clientes",
  qualif_card3_title: "Meritocracia",
  qualif_card3_desc: "Os parceiros mais bem avaliados recebem maior prioridade na distribuição de oportunidades de negócios.",
  qualif_card3_desc2: "Isso garante uma rede em constante evolução e melhoria contínua, recompensando quem entrega os melhores resultados.",

  crm_badge: "Monitoramento em Tempo Real",
  crm_title: "Acompanhamento e Gestão Exclusiva",
  crm_desc: "Utilizamos um sistema de CRM próprio para acompanhar de perto a performance das empresas homologadas. Monitoramos pontuação, avaliação de qualidade e cumprimento de prazos para garantir a excelência do serviço.",
  crm_image1: "/images/crm-dashboard-2.png?v=4",
  crm_image2: "/images/crm-dashboard-1.jpg?v=4",

  benefits_title_client: "Vantagens para Você",
  benefits_subtitle_client: "(Cliente)",
  benefits_client_items: "Empresas homologadas, Mais segurança na contratação, Controle e acompanhamento, Atendimento mais rápido, Qualidade monitorada, Menor risco na escolha, Transparência nas etapas, Profissionais especializados",
  
  benefits_title_partner: "Cresça Conosco",
  benefits_subtitle_partner: "(Empresas Parceiras)",
  benefits_partner_items: "Receba novos clientes, Leads qualificados, Menor investimento em marketing, Gestão através do CRM, Aumento da visibilidade, Mais oportunidades de negócios, Avaliação por desempenho, Crescimento sustentável",

  mission_title: "Nossa Missão",
  mission_desc: "Integrar clientes e empresas qualificadas através de um processo transparente, organizado e monitorado, garantindo excelência na prestação de serviços e melhoria contínua de toda a rede parceira.",
  mission_bullets: "Conectamos aos melhores., Acompanhamos cada etapa., Valorizamos a qualidade., Geramos oportunidades., Entregamos confiança."
};

export default function AdminCMS() {
  const [subTab, setSubTab] = useState<'hero' | 'services' | 'instalacao_page' | 'testimonials' | 'galeria' | 'trust' | 'como_funciona' | 'company_metrics' | 'interactive_house' | 'general'>('hero');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // States para Formulários
  const [heroData, setHeroData] = useState(DEFAULT_HERO);
  const [servicesData, setServicesData] = useState(DEFAULT_SERVICES);
  const [testimonialsData, setTestimonialsData] = useState(DEFAULT_TESTIMONIALS);
  const [trustData, setTrustData] = useState(DEFAULT_TRUST);
  const [instalacaoPageData, setInstalacaoPageData] = useState(DEFAULT_INSTALACAO_PAGE);
  const [companyMetricsData, setCompanyMetricsData] = useState(DEFAULT_COMPANY_METRICS);
  const [interactiveHouseData, setInteractiveHouseData] = useState(DEFAULT_INTERACTIVE_HOUSE);
  const [comoFuncionaData, setComoFuncionaData] = useState(DEFAULT_COMO_FUNCIONA_PAGE);
  const [generalData, setGeneralData] = useState({ whatsappNumber: '5548999999999' });

  // Loading image state
  const [uploadingImageId, setUploadingImageId] = useState<string | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await getAllSiteSettingsAction();
      if (res.success && res.data) {
        const data = res.data;
        if (data.hero) setHeroData({ ...DEFAULT_HERO, ...data.hero });
        if (data.services) {
          const dbServices = Array.isArray(data.services) ? data.services : [];
          const merged = [...dbServices];
          DEFAULT_SERVICES.forEach(defS => {
            if (!merged.some(s => s.id === defS.id)) {
              merged.push(defS);
            }
          });
          setServicesData(merged);
        }
        if (data.testimonials) setTestimonialsData(data.testimonials);
        if (data.trust) setTrustData({ ...DEFAULT_TRUST, ...data.trust });
        if (data.instalacao_page) setInstalacaoPageData({ ...DEFAULT_INSTALACAO_PAGE, ...data.instalacao_page });
        if (data.company_metrics) setCompanyMetricsData({ ...DEFAULT_COMPANY_METRICS, ...data.company_metrics });
        if (data.interactive_house) setInteractiveHouseData({ ...DEFAULT_INTERACTIVE_HOUSE, ...data.interactive_house });
        if (data.como_funciona) setComoFuncionaData({ ...DEFAULT_COMO_FUNCIONA_PAGE, ...data.como_funciona });
        if (data.general) setGeneralData({ ...generalData, ...data.general });
      }
    } catch (err: any) {
      console.error("Erro ao carregar dados do CMS:", err);
      setErrorMsg("Erro ao buscar configurações no Supabase.");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (key: string, value: any) => {
    try {
      setSaving(true);
      setErrorMsg('');
      setSaveSuccess(false);

      const res = await saveSiteSettingsAction(key, value);
      if (!res.success) {
        throw new Error(res.error);
      }

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      console.error(`Erro ao salvar ${key}:`, err);
      setErrorMsg(err.message || 'Erro ao salvar configurações.');
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, callback: (url: string) => void, uniqueId: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingImageId(uniqueId);
      setErrorMsg('');
      
      const formData = new FormData();
      formData.append('file', file);

      const res = await uploadSiteImageAction(formData);
      if (!res.success || !res.url) {
        throw new Error(res.error || 'Erro no upload.');
      }

      callback(res.url);
    } catch (err: any) {
      console.error('Erro no upload da imagem:', err);
      setErrorMsg(err.message || 'Erro ao fazer upload da imagem.');
    } finally {
      setUploadingImageId(null);
    }
  };

  if (loading) {
    return (
      <div className="bg-white p-16 rounded-xl border border-slate-200 shadow-sm text-center">
        <Loader2 className="w-10 h-10 text-brand-emerald animate-spin mx-auto mb-4" />
        <p className="text-slate-500 text-sm">Carregando painel do site...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Alerta de Feedback */}
      {errorMsg && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
          <span>⚠️ {errorMsg}</span>
        </div>
      )}
      {saveSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-lg text-sm flex items-center gap-2 animate-in fade-in duration-200">
          <Check className="w-4 h-4" />
          <span>Alterações gravadas com sucesso no Supabase! O site já foi atualizado.</span>
        </div>
      )}
      {/* Sub-Navegação interna de abas CMS */}
      <div className="flex border-b border-slate-200 bg-white rounded-t-xl p-2 gap-2 shadow-sm flex-wrap">
        {[
          { id: 'hero', name: 'Seção Principal (Hero)', icon: Sparkles },
          { id: 'services', name: 'Serviços', icon: ShieldCheck },
          { id: 'interactive_house', name: 'Casa Inteligente', icon: Sparkles },
          { id: 'como_funciona', name: 'Pág: Como Funciona', icon: BadgeCheck },
          { id: 'instalacao_page', name: 'Pág: Solar', icon: Sun },
          { id: 'testimonials', name: 'Depoimentos', icon: MessageSquare },
          { id: 'galeria', name: 'Galeria & Depoimentos', icon: ImageIcon },
          { id: 'trust', name: 'Por que Nós? (Confiança)', icon: BadgeCheck },
          { id: 'general', name: 'Configurações Gerais', icon: Settings },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setSubTab(tab.id as any);
              setErrorMsg('');
              setSaveSuccess(false);
            }}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
              subTab === tab.id
                ? 'bg-slate-100 text-slate-800 font-bold'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.name}
          </button>
        ))}
      </div>

      {/* Conteúdo das Abas CMS */}
      <div className="bg-white p-6 rounded-b-xl border-x border-b border-slate-200 shadow-sm min-h-[350px]">
        {/* ABA HERO */}
        {subTab === 'hero' && (
          <div className="space-y-8 animate-in fade-in duration-300">
            {/* Card 1: Entrada da Página (Hero) */}
            <div className="p-5 border border-slate-200 rounded-xl bg-slate-50/30 space-y-5">
              <div>
                <h3 className="text-sm font-bold text-slate-900 mb-1">Textos da Seção de Entrada (Hero)</h3>
                <p className="text-xs text-slate-500">Altere o texto principal exibido no topo da página inicial.</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Minicard Superior</label>
                  <input
                    type="text"
                    value={heroData.badge}
                    onChange={(e) => setHeroData({ ...heroData, badge: e.target.value })}
                    className="w-full text-xs px-3 py-2 border border-slate-200 bg-white rounded-md focus:outline-none focus:border-brand-emerald"
                    placeholder="Ex: Hub de Empresas 100% Homologadas"
                  />
                </div>
                
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Texto do Botão (CTA)</label>
                  <input
                    type="text"
                    value={heroData.cta_text}
                    onChange={(e) => setHeroData({ ...heroData, cta_text: e.target.value })}
                    className="w-full text-xs px-3 py-2 border border-slate-200 bg-white rounded-md focus:outline-none focus:border-brand-emerald"
                    placeholder="Ex: Solicitar Orçamento Grátis"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Título - Parte 1</label>
                  <input
                    type="text"
                    value={heroData.title_part1}
                    onChange={(e) => setHeroData({ ...heroData, title_part1: e.target.value })}
                    className="w-full text-xs px-3 py-2 border border-slate-200 bg-white rounded-md focus:outline-none focus:border-brand-emerald font-bold"
                    placeholder="CONTRATE COM"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Título - Parte 2 (Destacada em Verde)</label>
                  <input
                    type="text"
                    value={heroData.title_part2}
                    onChange={(e) => setHeroData({ ...heroData, title_part2: e.target.value })}
                    className="w-full text-xs px-3 py-2 border border-brand-emerald/40 text-brand-emerald bg-white rounded-md focus:outline-none focus:border-brand-emerald font-bold"
                    placeholder="SEGURANÇA"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Título - Parte 3</label>
                  <input
                    type="text"
                    value={heroData.title_part3}
                    onChange={(e) => setHeroData({ ...heroData, title_part3: e.target.value })}
                    className="w-full text-xs px-3 py-2 border border-slate-200 bg-white rounded-md focus:outline-none focus:border-brand-emerald font-bold"
                    placeholder="E ECONOMIA"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Descrição Principal</label>
                <textarea
                  value={heroData.description}
                  onChange={(e) => setHeroData({ ...heroData, description: e.target.value })}
                  className="w-full text-xs p-3 border border-slate-200 bg-white rounded-md focus:outline-none focus:border-brand-emerald min-h-[80px]"
                  placeholder="Insira a descrição que aparece abaixo do título principal..."
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Subtítulo do Grid de Clientes</label>
                <input
                  type="text"
                  value={heroData.trust_subtitle}
                  onChange={(e) => setHeroData({ ...heroData, trust_subtitle: e.target.value })}
                  className="w-full text-xs px-3 py-2 border border-slate-200 bg-white rounded-md focus:outline-none focus:border-brand-emerald"
                  placeholder="Ex: Clientes satisfeitos em SC"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <button
                  onClick={() => handleSave('hero', heroData)}
                  disabled={saving}
                  className="bg-brand-emerald hover:bg-emerald-600 disabled:bg-slate-300 text-white font-bold px-5 py-2.5 rounded-lg text-xs flex items-center gap-2 cursor-pointer shadow-sm transition-all"
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  Salvar Seção Principal
                </button>
              </div>
            </div>

            {/* Card 2: Acompanhamento e Gestão Exclusiva (CRM) */}
            <div className="p-5 border border-slate-200 rounded-xl bg-slate-50/30 space-y-5">
              <div>
                <h3 className="text-sm font-bold text-slate-900 mb-1">Seção: Acompanhamento e Gestão Exclusiva (CRM)</h3>
                <p className="text-xs text-slate-500">Altere textos, indicadores e envie novas capturas de tela do painel do CRM.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Minicard Superior</label>
                  <input type="text" value={companyMetricsData.badge} onChange={(e) => setCompanyMetricsData({ ...companyMetricsData, badge: e.target.value })} className="w-full text-xs px-3 py-2 border border-slate-200 bg-white rounded-md focus:outline-none focus:border-brand-emerald" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Título - Parte 1</label>
                  <input type="text" value={companyMetricsData.title_part1} onChange={(e) => setCompanyMetricsData({ ...companyMetricsData, title_part1: e.target.value })} className="w-full text-xs px-3 py-2 border border-slate-200 bg-white rounded-md focus:outline-none focus:border-brand-emerald" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Título - Parte 2 (Destacada em Verde)</label>
                  <input type="text" value={companyMetricsData.title_part2} onChange={(e) => setCompanyMetricsData({ ...companyMetricsData, title_part2: e.target.value })} className="w-full text-xs px-3 py-2 border border-slate-200 bg-white rounded-md focus:outline-none focus:border-brand-emerald" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Descrição</label>
                <textarea value={companyMetricsData.description} onChange={(e) => setCompanyMetricsData({ ...companyMetricsData, description: e.target.value })} className="w-full text-xs p-3 border border-slate-200 bg-white rounded-md focus:outline-none focus:border-brand-emerald min-h-[70px]" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 border border-slate-200/60 rounded-xl bg-white">
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-700">Foto 1 (Fundo / Lista)</h4>
                  <div className="aspect-video bg-white border border-slate-200 rounded-lg p-1 flex flex-col items-center justify-center relative overflow-hidden">
                    {uploadingImageId === 'metrics_img1' ? (
                      <Loader2 className="w-6 h-6 text-brand-emerald animate-spin" />
                    ) : (
                      <>
                        <img src={companyMetricsData.image1} alt="Preview 1" className="w-full h-full object-cover rounded" />
                        <label className="absolute inset-0 bg-slate-900/60 text-white text-[10px] font-bold opacity-0 hover:opacity-100 flex flex-col justify-center items-center cursor-pointer transition-opacity">
                          <Upload className="w-4 h-4 mb-1" /> Enviar Foto
                          <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, (url) => setCompanyMetricsData({ ...companyMetricsData, image1: url }), 'metrics_img1')} />
                        </label>
                      </>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-700">Foto 2 (Frente / Dashboard / Radar)</h4>
                  <div className="aspect-video bg-white border border-slate-200 rounded-lg p-1 flex flex-col items-center justify-center relative overflow-hidden">
                    {uploadingImageId === 'metrics_img2' ? (
                      <Loader2 className="w-6 h-6 text-brand-emerald animate-spin" />
                    ) : (
                      <>
                        <img src={companyMetricsData.image2} alt="Preview 2" className="w-full h-full object-cover rounded" />
                        <label className="absolute inset-0 bg-slate-900/60 text-white text-[10px] font-bold opacity-0 hover:opacity-100 flex flex-col justify-center items-center cursor-pointer transition-opacity">
                          <Upload className="w-4 h-4 mb-1" /> Enviar Foto
                          <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, (url) => setCompanyMetricsData({ ...companyMetricsData, image2: url }), 'metrics_img2')} />
                        </label>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border border-slate-200 rounded-lg space-y-3 bg-white">
                  <h4 className="text-xs font-black text-slate-700 uppercase">Indicador 1</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-400 uppercase">Ícone</label>
                      <input type="text" value={companyMetricsData.indicator1_icon} onChange={(e) => setCompanyMetricsData({ ...companyMetricsData, indicator1_icon: e.target.value })} className="w-full text-xs px-2 py-1.5 border border-slate-200 rounded" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-400 uppercase">Título</label>
                      <input type="text" value={companyMetricsData.indicator1_title} onChange={(e) => setCompanyMetricsData({ ...companyMetricsData, indicator1_title: e.target.value })} className="w-full text-xs px-2 py-1.5 border border-slate-200 rounded" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-400 uppercase">Descrição</label>
                    <textarea value={companyMetricsData.indicator1_desc} onChange={(e) => setCompanyMetricsData({ ...companyMetricsData, indicator1_desc: e.target.value })} className="w-full text-xs p-2 border border-slate-200 rounded min-h-[50px] resize-none" />
                  </div>
                </div>

                <div className="p-4 border border-slate-200 rounded-lg space-y-3 bg-white">
                  <h4 className="text-xs font-black text-slate-700 uppercase">Indicador 2</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-400 uppercase">Ícone</label>
                      <input type="text" value={companyMetricsData.indicator2_icon} onChange={(e) => setCompanyMetricsData({ ...companyMetricsData, indicator2_icon: e.target.value })} className="w-full text-xs px-2 py-1.5 border border-slate-200 rounded" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-400 uppercase">Título</label>
                      <input type="text" value={companyMetricsData.indicator2_title} onChange={(e) => setCompanyMetricsData({ ...companyMetricsData, indicator2_title: e.target.value })} className="w-full text-xs px-2 py-1.5 border border-slate-200 rounded" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-400 uppercase">Descrição</label>
                    <textarea value={companyMetricsData.indicator2_desc} onChange={(e) => setCompanyMetricsData({ ...companyMetricsData, indicator2_desc: e.target.value })} className="w-full text-xs p-2 border border-slate-200 rounded min-h-[50px] resize-none" />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <button onClick={() => handleSave('company_metrics', companyMetricsData)} disabled={saving} className="bg-brand-emerald hover:bg-emerald-600 disabled:bg-slate-300 text-white font-bold px-5 py-2.5 rounded-lg text-xs flex items-center gap-2 cursor-pointer shadow-sm">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Salvar Acompanhamento CRM
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ABA SERVIÇOS */}
        {subTab === 'services' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-bold text-slate-900 mb-1">Lista de Serviços Homologados</h3>
              <p className="text-xs text-slate-500">Configure os títulos, links e troque as imagens de exibição dos serviços.</p>
            </div>

            <div className="grid grid-cols-1 gap-6">
              {servicesData.map((service, index) => {
                const serviceUniqueId = `service_${service.id}`;
                const isUploading = uploadingImageId === serviceUniqueId;

                return (
                  <div key={service.id} className="p-4 border border-slate-200 rounded-xl bg-slate-50/50 flex flex-col md:flex-row gap-5 items-start">
                    {/* Controles de Ordenação */}
                    <div className="flex flex-row md:flex-col gap-2 md:gap-1 items-center justify-center md:self-stretch pr-2 md:border-r border-slate-200/60 flex-shrink-0 w-full md:w-auto border-b md:border-b-0 pb-2 md:pb-0">
                      <button
                        type="button"
                        disabled={index === 0}
                        onClick={() => {
                          const updated = [...servicesData];
                          const temp = updated[index];
                          updated[index] = updated[index - 1];
                          updated[index - 1] = temp;
                          setServicesData(updated);
                        }}
                        className="p-1.5 hover:bg-slate-200 disabled:opacity-30 disabled:hover:bg-transparent rounded text-slate-500 hover:text-brand-emerald transition-all"
                        title="Mover para Cima"
                      >
                        <ChevronUp className="w-4 h-4" />
                      </button>
                      <span className="text-[10px] font-bold text-slate-400 select-none">#{index + 1}</span>
                      <button
                        type="button"
                        disabled={index === servicesData.length - 1}
                        onClick={() => {
                          const updated = [...servicesData];
                          const temp = updated[index];
                          updated[index] = updated[index + 1];
                          updated[index + 1] = temp;
                          setServicesData(updated);
                        }}
                        className="p-1.5 hover:bg-slate-200 disabled:opacity-30 disabled:hover:bg-transparent rounded text-slate-500 hover:text-brand-emerald transition-all"
                        title="Mover para Baixo"
                      >
                        <ChevronDown className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Imagem do Serviço */}
                    <div className="w-24 h-24 bg-white border border-slate-200 rounded-lg p-2 flex flex-col items-center justify-center relative overflow-hidden flex-shrink-0">
                      {isUploading ? (
                        <Loader2 className="w-6 h-6 text-brand-emerald animate-spin" />
                      ) : (
                        <>
                          <img src={service.image} alt={service.title} className="w-full h-full object-contain" />
                          <label className="absolute inset-0 bg-slate-900/60 text-white text-[9px] font-bold opacity-0 hover:opacity-100 flex flex-col justify-center items-center cursor-pointer transition-opacity">
                            <Upload className="w-4 h-4 mb-1" />
                            Trocar Foto
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                handleImageUpload(e, (url) => {
                                  const updated = [...servicesData];
                                  updated[index].image = url;
                                  setServicesData(updated);
                                }, serviceUniqueId);
                              }}
                            />
                          </label>
                        </>
                      )}
                    </div>

                    {/* Dados do Serviço */}
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                      <div className="space-y-1">
                        <div className="flex justify-between items-center">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Título do Serviço</label>
                          <label className="inline-flex items-center gap-1.5 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={service.hidden || false}
                              onChange={(e) => {
                                const updated = [...servicesData];
                                updated[index].hidden = e.target.checked;
                                setServicesData(updated);
                              }}
                              className="w-3.5 h-3.5 text-brand-emerald border-slate-300 rounded focus:ring-brand-emerald"
                            />
                            <span className="text-[10px] font-bold text-slate-500 uppercase">Ocultar no site</span>
                          </label>
                        </div>
                        <input
                          type="text"
                          value={service.title}
                          onChange={(e) => {
                            const updated = [...servicesData];
                            updated[index].title = e.target.value;
                            setServicesData(updated);
                          }}
                          className="w-full text-xs px-3 py-2 border border-slate-200 bg-white rounded-md focus:outline-none focus:border-brand-emerald font-semibold"
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Link (HREF)</label>
                          <input
                            type="text"
                            value={service.href}
                            onChange={(e) => {
                              const updated = [...servicesData];
                              updated[index].href = e.target.value;
                              setServicesData(updated);
                            }}
                            className="w-full text-xs px-3 py-2 border border-slate-200 bg-white rounded-md focus:outline-none"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Ícone (Nome Lucide)</label>
                          <input
                            type="text"
                            value={service.icon}
                            onChange={(e) => {
                              const updated = [...servicesData];
                              updated[index].icon = e.target.value;
                              setServicesData(updated);
                            }}
                            className="w-full text-xs px-3 py-2 border border-slate-200 bg-white rounded-md focus:outline-none"
                          />
                        </div>
                      </div>

                      {/* Descrição da Subpágina */}
                      <div className="space-y-1 md:col-span-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Descrição Textual (Subpágina do Serviço)</label>
                        <textarea
                          value={service.description || ''}
                          onChange={(e) => {
                            const updated = [...servicesData];
                            updated[index].description = e.target.value;
                            setServicesData(updated);
                          }}
                          className="w-full text-xs p-2.5 border border-slate-200 bg-white rounded-md focus:outline-none focus:border-brand-emerald min-h-[60px]"
                          placeholder="Escreva o texto explicativo sobre o serviço que aparecerá na subpágina..."
                        />
                      </div>

                      {/* Foto Subpágina & Título dos Diferenciais */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Foto Principal (Subpágina)</label>
                        <div className="flex items-center gap-3">
                          <div className="w-16 h-10 bg-white border border-slate-200 rounded overflow-hidden flex-shrink-0 flex items-center justify-center">
                            {uploadingImageId === `subpage_${service.id}` ? (
                              <Loader2 className="w-4 h-4 text-brand-emerald animate-spin" />
                            ) : (
                              <img src={service.subpage_image || service.image} className="w-full h-full object-cover" />
                            )}
                          </div>
                          <label className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-3 py-1.5 rounded text-[10px] font-bold cursor-pointer transition-all flex items-center gap-1.5 shadow-sm">
                            <Upload className="w-3.5 h-3.5" /> Enviar Foto
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                handleImageUpload(e, (url) => {
                                  const updated = [...servicesData];
                                  updated[index].subpage_image = url;
                                  setServicesData(updated);
                                }, `subpage_${service.id}`);
                              }}
                            />
                          </label>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Título da Lista de Diferenciais</label>
                        <input
                          type="text"
                          value={service.differentials_title || ''}
                          onChange={(e) => {
                            const updated = [...servicesData];
                            updated[index].differentials_title = e.target.value;
                            setServicesData(updated);
                          }}
                          className="w-full text-xs px-3 py-2 border border-slate-200 bg-white rounded-md focus:outline-none"
                          placeholder="Ex: Diferenciais do Hub:"
                        />
                      </div>

                      {/* Itens Diferenciais */}
                      <div className="space-y-2 md:col-span-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Itens da Lista de Diferenciais (4 itens)</label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {[0, 1, 2, 3].map((diffIndex) => (
                            <input
                              key={diffIndex}
                              type="text"
                              value={service.differentials?.[diffIndex] || ''}
                              onChange={(e) => {
                                const updated = [...servicesData];
                                if (!updated[index].differentials) {
                                  updated[index].differentials = ['', '', '', ''];
                                }
                                updated[index].differentials[diffIndex] = e.target.value;
                                setServicesData(updated);
                              }}
                              className="w-full text-xs px-2.5 py-1.5 border border-slate-200 bg-white rounded-md focus:outline-none"
                              placeholder={`Diferencial ${diffIndex + 1}`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => handleSave('services', servicesData)}
                disabled={saving}
                className="bg-brand-emerald hover:bg-emerald-600 disabled:bg-slate-300 text-white font-bold px-5 py-2.5 rounded-lg text-xs flex items-center gap-2 cursor-pointer shadow-sm transition-all"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Salvar Serviços
              </button>
            </div>
          </div>
        )}

        {/* ABA GALERIA & DEPOIMENTOS */}
        {subTab === 'galeria' && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <AdminGaleria />
          </div>
        )}

        {/* ABA DEPOIMENTOS */}
        {subTab === 'testimonials' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center bg-slate-50 p-4 rounded-xl border border-slate-200/60">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Depoimentos dos Clientes</h3>
                <p className="text-xs text-slate-500">Adicione, edite ou remova avaliações exibidas nas páginas.</p>
              </div>
              <button
                onClick={() => {
                  const newTestimonial = {
                    id: Date.now(),
                    text: '',
                    service: 'Limpeza Técnica de Placas',
                    serviceId: 'limpeza_solar' as any,
                    name: '',
                    location: '',
                    rating: 5
                  };
                  setTestimonialsData([...testimonialsData, newTestimonial]);
                }}
                className="bg-brand-emerald text-white px-3 py-2 rounded-lg text-xs font-bold hover:bg-emerald-600 transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Adicionar Depoimento
              </button>
            </div>

            {testimonialsData.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-xl text-slate-400 text-xs italic">
                Nenhum depoimento cadastrado. Clique no botão acima para adicionar.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {testimonialsData.map((testimonial, index) => {
                  return (
                    <div key={testimonial.id} className="p-4 border border-slate-200 rounded-xl bg-slate-50/50 space-y-3 relative">
                      <div className="flex justify-between items-center flex-wrap gap-2">
                        <select
                          value={testimonial.serviceId}
                          onChange={(e) => {
                            const val = e.target.value;
                            const relatedService = servicesData.find(s => s.id === val);
                            const updated = [...testimonialsData];
                            updated[index].serviceId = val as any;
                            updated[index].service = relatedService ? relatedService.title : 'Outro';
                            setTestimonialsData(updated);
                          }}
                          className="text-[10px] font-bold text-slate-700 bg-white border border-slate-200 rounded px-2 py-1 focus:outline-none"
                        >
                          <option value="limpeza_solar">Limpeza Técnica de Placas</option>
                          <option value="instalacao_manutencao">Instalação e Manutenção</option>
                          <option value="automacao_residencial">Automação Residencial</option>
                          <option value="aquecimento_piso">Aquecimento de Piso Premium</option>
                          <option value="controle_acesso">Controle de Acesso</option>
                          <option value="ar_condicionado">Ar Condicionado</option>
                          <option value="carregamento_veicular">Carregamento Veicular</option>
                        </select>
                        
                        <div className="flex items-center gap-1.5">
                          <div className="flex items-center gap-0.5 mr-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`w-3.5 h-3.5 cursor-pointer ${
                                  star <= testimonial.rating ? 'fill-yellow-400 text-yellow-400' : 'text-slate-300'
                                }`}
                                onClick={() => {
                                  const updated = [...testimonialsData];
                                  updated[index].rating = star;
                                  setTestimonialsData(updated);
                                }}
                              />
                            ))}
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm('Deseja realmente excluir este depoimento?')) {
                                setTestimonialsData(testimonialsData.filter(t => t.id !== testimonial.id));
                              }
                            }}
                            className="p-1 text-slate-400 hover:text-red-500 rounded hover:bg-red-50 transition-all cursor-pointer"
                            title="Excluir Depoimento"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Nome do Cliente</label>
                          <input
                            type="text"
                            value={testimonial.name}
                            onChange={(e) => {
                              const updated = [...testimonialsData];
                              updated[index].name = e.target.value;
                              setTestimonialsData(updated);
                            }}
                            className="w-full text-xs px-3 py-1.5 border border-slate-200 bg-white rounded-md focus:outline-none focus:border-brand-emerald"
                            placeholder="Ex: Carlos Eduardo"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Localização</label>
                          <input
                            type="text"
                            value={testimonial.location}
                            onChange={(e) => {
                              const updated = [...testimonialsData];
                              updated[index].location = e.target.value;
                              setTestimonialsData(updated);
                            }}
                            className="w-full text-xs px-3 py-1.5 border border-slate-200 bg-white rounded-md focus:outline-none"
                            placeholder="Ex: Florianópolis, SC"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Depoimento</label>
                        <textarea
                          value={testimonial.text}
                          onChange={(e) => {
                            const updated = [...testimonialsData];
                            updated[index].text = e.target.value;
                            setTestimonialsData(updated);
                          }}
                          className="w-full text-xs p-2.5 border border-slate-200 bg-white rounded-md focus:outline-none focus:border-brand-emerald min-h-[75px] resize-none"
                          placeholder="Escreva a avaliação do cliente aqui..."
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => handleSave('testimonials', testimonialsData)}
                disabled={saving}
                className="bg-brand-emerald hover:bg-emerald-600 disabled:bg-slate-300 text-white font-bold px-5 py-2.5 rounded-lg text-xs flex items-center gap-2 cursor-pointer shadow-sm transition-all"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Salvar Depoimentos
              </button>
            </div>
          </div>
        )}

        {/* ABA CONFIANÇA */}
        {subTab === 'trust' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-bold text-slate-900 mb-1">Por que Integra Soluções SC (Seção de Confiança)</h3>
              <p className="text-xs text-slate-500">Configure os títulos da seção com fundo escuro e os 3 passos de triagem.</p>
            </div>

            <div className="p-4 border border-slate-200 rounded-xl bg-slate-50/50 space-y-4">
              <h4 className="text-xs font-bold text-slate-700">Textos Principais</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Minicard Superior</label>
                  <input
                    type="text"
                    value={trustData.badge}
                    onChange={(e) => setTrustData({ ...trustData, badge: e.target.value })}
                    className="w-full text-xs px-3 py-2 border border-slate-200 bg-white rounded-md focus:outline-none focus:border-brand-emerald"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Título Principal - Parte 1</label>
                  <input
                    type="text"
                    value={trustData.title_part1}
                    onChange={(e) => setTrustData({ ...trustData, title_part1: e.target.value })}
                    className="w-full text-xs px-3 py-2 border border-slate-200 bg-white rounded-md focus:outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Título Principal - Parte 2 (Destacado em Verde)</label>
                  <input
                    type="text"
                    value={trustData.title_part2}
                    onChange={(e) => setTrustData({ ...trustData, title_part2: e.target.value })}
                    className="w-full text-xs px-3 py-2 border border-brand-emerald/40 text-brand-emerald bg-white rounded-md focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Descrição Principal</label>
                  <textarea
                    value={trustData.description}
                    onChange={(e) => setTrustData({ ...trustData, description: e.target.value })}
                    className="w-full text-xs p-2.5 border border-slate-200 bg-white rounded-md focus:outline-none min-h-[50px]"
                  />
                </div>
              </div>
            </div>

            <div className="p-4 border border-slate-200 rounded-xl bg-slate-50/50 space-y-4">
              <h4 className="text-xs font-bold text-slate-700">Card de Certificado (Processo de Auditoria)</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Título do Certificado</label>
                  <input
                    type="text"
                    value={trustData.certified_title}
                    onChange={(e) => setTrustData({ ...trustData, certified_title: e.target.value })}
                    className="w-full text-xs px-3 py-2 border border-slate-200 bg-white rounded-md focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Descrição Detalhada do Certificado</label>
                  <textarea
                    value={trustData.certified_desc}
                    onChange={(e) => setTrustData({ ...trustData, certified_desc: e.target.value })}
                    className="w-full text-xs p-2.5 border border-slate-200 bg-white rounded-md focus:outline-none min-h-[50px]"
                  />
                </div>
              </div>
            </div>

            <div className="p-4 border border-slate-200 rounded-xl bg-slate-50/50 space-y-4">
              <h4 className="text-xs font-bold text-slate-700">Os 3 Passos da Metodologia</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {trustData.steps.map((step, index) => (
                  <div key={index} className="p-3 bg-white border border-slate-200 rounded-lg space-y-2">
                    <span className="text-[10px] font-bold text-slate-400">PASSO {index + 1}</span>
                    <input
                      type="text"
                      value={step.title}
                      onChange={(e) => {
                        const updatedSteps = [...trustData.steps];
                        updatedSteps[index].title = e.target.value;
                        setTrustData({ ...trustData, steps: updatedSteps });
                      }}
                      className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded-md font-semibold focus:outline-none focus:border-brand-emerald"
                      placeholder="Título"
                    />
                    <textarea
                      value={step.description}
                      onChange={(e) => {
                        const updatedSteps = [...trustData.steps];
                        updatedSteps[index].description = e.target.value;
                        setTrustData({ ...trustData, steps: updatedSteps });
                      }}
                      className="w-full text-xs p-2 border border-slate-200 rounded-md focus:outline-none min-h-[60px] resize-none"
                      placeholder="Descrição"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => handleSave('trust', trustData)}
                disabled={saving}
                className="bg-brand-emerald hover:bg-emerald-600 disabled:bg-slate-300 text-white font-bold px-5 py-2.5 rounded-lg text-xs flex items-center gap-2 cursor-pointer shadow-sm transition-all"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Salvar Seção Confiança
              </button>
            </div>
          </div>
        )}

        {/* ABA PÁGINA INSTALAÇÃO */}
        {subTab === 'instalacao_page' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-bold text-slate-900 mb-1">Página de Instalação Solar</h3>
              <p className="text-xs text-slate-500">Configure os textos e fotos das seções On-Grid e Híbrido.</p>
            </div>

            {/* ON-GRID */}
            <div className="p-4 border border-slate-200 rounded-xl bg-slate-50/50 space-y-4">
              <h4 className="text-sm font-bold text-slate-700 border-b border-slate-200 pb-2">Sistema On-Grid</h4>
              
              <div className="flex flex-col md:flex-row gap-6">
                {/* Imagem On-Grid */}
                <div className="w-full md:w-1/3 flex flex-col gap-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Foto On-Grid</label>
                  <div className="aspect-video bg-white border border-slate-200 rounded-lg p-1 flex flex-col items-center justify-center relative overflow-hidden">
                    {uploadingImageId === 'ongrid_img' ? (
                      <Loader2 className="w-6 h-6 text-brand-emerald animate-spin" />
                    ) : (
                      <>
                        <img src={instalacaoPageData.ongrid_image} alt="On-Grid" className="w-full h-full object-cover rounded" />
                        <label className="absolute inset-0 bg-slate-900/60 text-white text-[10px] font-bold opacity-0 hover:opacity-100 flex flex-col justify-center items-center cursor-pointer transition-opacity">
                          <Upload className="w-4 h-4 mb-1" /> Trocar Foto
                          <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, (url) => setInstalacaoPageData({ ...instalacaoPageData, ongrid_image: url }), 'ongrid_img')} />
                        </label>
                      </>
                    )}
                  </div>
                </div>

                <div className="w-full md:w-2/3 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Badge</label>
                      <input type="text" value={instalacaoPageData.ongrid_badge} onChange={(e) => setInstalacaoPageData({ ...instalacaoPageData, ongrid_badge: e.target.value })} className="w-full text-xs px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:border-brand-emerald" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Título 1 (Preto)</label>
                      <input type="text" value={instalacaoPageData.ongrid_title1} onChange={(e) => setInstalacaoPageData({ ...instalacaoPageData, ongrid_title1: e.target.value })} className="w-full text-xs px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:border-brand-emerald" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Título 2 (Destaque Verde)</label>
                      <input type="text" value={instalacaoPageData.ongrid_title2} onChange={(e) => setInstalacaoPageData({ ...instalacaoPageData, ongrid_title2: e.target.value })} className="w-full text-xs px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:border-brand-emerald" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Parágrafo 1</label>
                    <textarea value={instalacaoPageData.ongrid_desc1} onChange={(e) => setInstalacaoPageData({ ...instalacaoPageData, ongrid_desc1: e.target.value })} className="w-full text-xs p-2 border border-slate-200 rounded-md focus:outline-none focus:border-brand-emerald min-h-[60px]" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Parágrafo 2</label>
                    <textarea value={instalacaoPageData.ongrid_desc2} onChange={(e) => setInstalacaoPageData({ ...instalacaoPageData, ongrid_desc2: e.target.value })} className="w-full text-xs p-2 border border-slate-200 rounded-md focus:outline-none focus:border-brand-emerald min-h-[60px]" />
                  </div>
                </div>
              </div>
            </div>

            {/* HIBRIDO */}
            <div className="p-4 border border-slate-200 rounded-xl bg-slate-50/50 space-y-4">
              <h4 className="text-sm font-bold text-slate-700 border-b border-slate-200 pb-2">Sistema Híbrido</h4>
              
              <div className="flex flex-col md:flex-row gap-6">
                {/* Imagem Hibrido */}
                <div className="w-full md:w-1/3 flex flex-col gap-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Foto Híbrido</label>
                  <div className="aspect-video bg-white border border-slate-200 rounded-lg p-1 flex flex-col items-center justify-center relative overflow-hidden">
                    {uploadingImageId === 'hibrido_img' ? (
                      <Loader2 className="w-6 h-6 text-brand-emerald animate-spin" />
                    ) : (
                      <>
                        <img src={instalacaoPageData.hibrido_image} alt="Híbrido" className="w-full h-full object-cover rounded" />
                        <label className="absolute inset-0 bg-slate-900/60 text-white text-[10px] font-bold opacity-0 hover:opacity-100 flex flex-col justify-center items-center cursor-pointer transition-opacity">
                          <Upload className="w-4 h-4 mb-1" /> Trocar Foto
                          <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, (url) => setInstalacaoPageData({ ...instalacaoPageData, hibrido_image: url }), 'hibrido_img')} />
                        </label>
                      </>
                    )}
                  </div>
                </div>

                <div className="w-full md:w-2/3 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Badge</label>
                      <input type="text" value={instalacaoPageData.hibrido_badge} onChange={(e) => setInstalacaoPageData({ ...instalacaoPageData, hibrido_badge: e.target.value })} className="w-full text-xs px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:border-brand-emerald" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Título 1 (Preto)</label>
                      <input type="text" value={instalacaoPageData.hibrido_title1} onChange={(e) => setInstalacaoPageData({ ...instalacaoPageData, hibrido_title1: e.target.value })} className="w-full text-xs px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:border-brand-emerald" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Título 2 (Destaque Laranja)</label>
                      <input type="text" value={instalacaoPageData.hibrido_title2} onChange={(e) => setInstalacaoPageData({ ...instalacaoPageData, hibrido_title2: e.target.value })} className="w-full text-xs px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:border-brand-emerald" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Título 3 (Preto Opcional)</label>
                      <input type="text" value={instalacaoPageData.hibrido_title3} onChange={(e) => setInstalacaoPageData({ ...instalacaoPageData, hibrido_title3: e.target.value })} className="w-full text-xs px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:border-brand-emerald" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Parágrafo 1</label>
                    <textarea value={instalacaoPageData.hibrido_desc1} onChange={(e) => setInstalacaoPageData({ ...instalacaoPageData, hibrido_desc1: e.target.value })} className="w-full text-xs p-2 border border-slate-200 rounded-md focus:outline-none focus:border-brand-emerald min-h-[60px]" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Parágrafo 2</label>
                    <textarea value={instalacaoPageData.hibrido_desc2} onChange={(e) => setInstalacaoPageData({ ...instalacaoPageData, hibrido_desc2: e.target.value })} className="w-full text-xs p-2 border border-slate-200 rounded-md focus:outline-none focus:border-brand-emerald min-h-[60px]" />
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button onClick={() => handleSave('instalacao_page', instalacaoPageData)} disabled={saving} className="bg-brand-emerald hover:bg-emerald-600 disabled:bg-slate-300 text-white font-bold px-5 py-2.5 rounded-lg text-xs flex items-center gap-2 cursor-pointer shadow-sm transition-all">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Salvar Página Solar
              </button>
            </div>
          </div>
        )}



        {/* ABA CASA INTELIGENTE */}
        {subTab === 'interactive_house' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-bold text-slate-900 mb-1">Seção: Casa Inteligente (Interactive House)</h3>
              <p className="text-xs text-slate-500">Configure os títulos da seção interativa e os 4 pontos de serviços em destaque.</p>
            </div>

            <div className="p-4 border border-slate-200 rounded-xl bg-slate-50/50 space-y-4">
              <h4 className="text-xs font-bold text-slate-700">Cabeçalho da Seção</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase block">Badge</label>
                  <input type="text" value={interactiveHouseData.badge} onChange={(e) => setInteractiveHouseData({ ...interactiveHouseData, badge: e.target.value })} className="w-full text-xs px-3 py-2 border border-slate-200 bg-white rounded-md" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase block">Título 1</label>
                  <input type="text" value={interactiveHouseData.title_part1} onChange={(e) => setInteractiveHouseData({ ...interactiveHouseData, title_part1: e.target.value })} className="w-full text-xs px-3 py-2 border border-slate-200 bg-white rounded-md" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase block">Título 2 (Verde)</label>
                  <input type="text" value={interactiveHouseData.title_part2} onChange={(e) => setInteractiveHouseData({ ...interactiveHouseData, title_part2: e.target.value })} className="w-full text-xs px-3 py-2 border border-slate-200 bg-white rounded-md" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase block">Foto Diagrama da Casa</label>
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-10 bg-white border border-slate-200 rounded overflow-hidden flex items-center justify-center flex-shrink-0">
                      {uploadingImageId === 'house_img' ? (
                        <Loader2 className="w-4 h-4 text-brand-emerald animate-spin" />
                      ) : (
                        <img src={interactiveHouseData.image} className="w-full h-full object-contain" />
                      )}
                    </div>
                    <label className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-3 py-1.5 rounded text-[10px] font-bold cursor-pointer transition-all flex items-center gap-1">
                      <Upload className="w-3 h-3" /> Enviar Diagrama
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, (url) => setInteractiveHouseData({ ...interactiveHouseData, image: url }), 'house_img')} />
                    </label>
                  </div>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase block">Descrição</label>
                <textarea value={interactiveHouseData.description} onChange={(e) => setInteractiveHouseData({ ...interactiveHouseData, description: e.target.value })} className="w-full text-xs p-3 border border-slate-200 bg-white rounded-md min-h-[60px]" />
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-xs font-black text-slate-700 uppercase">Pontos Interativos (4 Serviços)</h4>
              
              <div className="grid grid-cols-1 gap-6">
                {(interactiveHouseData.services || []).map((service: any, index: number) => {
                  return (
                    <div key={service.id} className="p-4 border border-slate-200 rounded-xl bg-white space-y-4 shadow-sm">
                      <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                        <span className="text-xs font-bold text-brand-emerald">Serviço #{index + 1} - {service.title}</span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-slate-400 uppercase">Título</label>
                          <input type="text" value={service.title} onChange={(e) => {
                            const updated = [...interactiveHouseData.services];
                            updated[index].title = e.target.value;
                            setInteractiveHouseData({ ...interactiveHouseData, services: updated });
                          }} className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-slate-400 uppercase">Subtítulo</label>
                          <input type="text" value={service.subtitle} onChange={(e) => {
                            const updated = [...interactiveHouseData.services];
                            updated[index].subtitle = e.target.value;
                            setInteractiveHouseData({ ...interactiveHouseData, services: updated });
                          }} className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-slate-400 uppercase">Badge</label>
                          <input type="text" value={service.badge} onChange={(e) => {
                            const updated = [...interactiveHouseData.services];
                            updated[index].badge = e.target.value;
                            setInteractiveHouseData({ ...interactiveHouseData, services: updated });
                          }} className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded" />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-slate-400 uppercase">Link Botão (HREF)</label>
                          <input type="text" value={service.href} onChange={(e) => {
                            const updated = [...interactiveHouseData.services];
                            updated[index].href = e.target.value;
                            setInteractiveHouseData({ ...interactiveHouseData, services: updated });
                          }} className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-slate-400 uppercase">Texto do Botão</label>
                          <input type="text" value={service.buttonText} onChange={(e) => {
                            const updated = [...interactiveHouseData.services];
                            updated[index].buttonText = e.target.value;
                            setInteractiveHouseData({ ...interactiveHouseData, services: updated });
                          }} className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-slate-400 uppercase">Ícone</label>
                          <input type="text" value={service.icon} onChange={(e) => {
                            const updated = [...interactiveHouseData.services];
                            updated[index].icon = e.target.value;
                            setInteractiveHouseData({ ...interactiveHouseData, services: updated });
                          }} className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded" />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-400 uppercase">Descrição Explicativa</label>
                        <textarea value={service.description} onChange={(e) => {
                          const updated = [...interactiveHouseData.services];
                          updated[index].description = e.target.value;
                          setInteractiveHouseData({ ...interactiveHouseData, services: updated });
                        }} className="w-full text-xs p-2.5 border border-slate-200 rounded min-h-[50px]" />
                      </div>

                      <div className="space-y-2">
                        <label className="text-[9px] font-bold text-slate-400 uppercase block">Lista de Benefícios (4 itens)</label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {[0, 1, 2, 3].map((benIdx) => (
                            <input key={benIdx} type="text" value={service.benefits?.[benIdx] || ''} onChange={(e) => {
                              const updated = [...interactiveHouseData.services];
                              if (!updated[index].benefits) updated[index].benefits = ['', '', '', ''];
                              updated[index].benefits[benIdx] = e.target.value;
                              setInteractiveHouseData({ ...interactiveHouseData, services: updated });
                            }} className="w-full text-xs px-2.5 py-1 border border-slate-200 rounded" placeholder={`Benefício ${benIdx + 1}`} />
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button onClick={() => handleSave('interactive_house', interactiveHouseData)} disabled={saving} className="bg-brand-emerald hover:bg-emerald-600 disabled:bg-slate-300 text-white font-bold px-5 py-2.5 rounded-lg text-xs flex items-center gap-2 cursor-pointer shadow-sm">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Salvar Casa Inteligente
              </button>
            </div>
          </div>
        )}

        {/* ABA PÁGINA COMO FUNCIONA */}
        {subTab === 'como_funciona' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-bold text-slate-900 mb-1">Página: Como Trabalhamos (Processo & CRM)</h3>
              <p className="text-xs text-slate-500">Configure todos os textos, timelines e capturas de tela da página "Como Trabalhamos".</p>
            </div>

            {/* SEÇÃO HERO */}
            <div className="p-4 border border-slate-200 rounded-xl bg-slate-50/50 space-y-4">
              <h4 className="text-xs font-bold text-slate-700">1. Entrada da Página (Hero)</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Badge</label>
                  <input type="text" value={comoFuncionaData.hero_badge} onChange={(e) => setComoFuncionaData({ ...comoFuncionaData, hero_badge: e.target.value })} className="w-full text-xs px-3 py-2 border border-slate-200 bg-white rounded-md" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Título - Parte 1</label>
                  <input type="text" value={comoFuncionaData.hero_title_part1} onChange={(e) => setComoFuncionaData({ ...comoFuncionaData, hero_title_part1: e.target.value })} className="w-full text-xs px-3 py-2 border border-slate-200 bg-white rounded-md" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Título - Parte 2 (Destaque Verde)</label>
                  <input type="text" value={comoFuncionaData.hero_title_part2} onChange={(e) => setComoFuncionaData({ ...comoFuncionaData, hero_title_part2: e.target.value })} className="w-full text-xs px-3 py-2 border border-slate-200 bg-white rounded-md" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Título - Parte 3</label>
                  <input type="text" value={comoFuncionaData.hero_title_part3} onChange={(e) => setComoFuncionaData({ ...comoFuncionaData, hero_title_part3: e.target.value })} className="w-full text-xs px-3 py-2 border border-slate-200 bg-white rounded-md" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Descrição 1</label>
                <textarea value={comoFuncionaData.hero_desc1} onChange={(e) => setComoFuncionaData({ ...comoFuncionaData, hero_desc1: e.target.value })} className="w-full text-xs p-2.5 border border-slate-200 bg-white rounded-md min-h-[50px]" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Descrição 2 (Secundária)</label>
                <textarea value={comoFuncionaData.hero_desc2} onChange={(e) => setComoFuncionaData({ ...comoFuncionaData, hero_desc2: e.target.value })} className="w-full text-xs p-2.5 border border-slate-200 bg-white rounded-md min-h-[50px]" />
              </div>
            </div>

            {/* NOSSO MODELO DE TRABALHO */}
            <div className="p-4 border border-slate-200 rounded-xl bg-slate-50/50 space-y-4">
              <h4 className="text-xs font-bold text-slate-700">2. Linha do Tempo (Nosso Modelo de Trabalho)</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Título</label>
                  <input type="text" value={comoFuncionaData.timeline_title} onChange={(e) => setComoFuncionaData({ ...comoFuncionaData, timeline_title: e.target.value })} className="w-full text-xs px-3 py-2 border border-slate-200 bg-white rounded-md" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Subtítulo</label>
                  <input type="text" value={comoFuncionaData.timeline_subtitle} onChange={(e) => setComoFuncionaData({ ...comoFuncionaData, timeline_subtitle: e.target.value })} className="w-full text-xs px-3 py-2 border border-slate-200 bg-white rounded-md" />
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-bold text-slate-400 uppercase block">Etapas da Timeline (6 etapas)</label>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {(comoFuncionaData.timeline_steps || []).map((step: any, index: number) => (
                    <div key={index} className="p-3 bg-white border border-slate-200 rounded-lg space-y-2">
                      <span className="text-[9px] font-bold text-slate-400">ETAPA {index + 1}</span>
                      <input type="text" value={step.title} onChange={(e) => {
                        const updated = [...comoFuncionaData.timeline_steps];
                        updated[index].title = e.target.value;
                        setComoFuncionaData({ ...comoFuncionaData, timeline_steps: updated });
                      }} className="w-full text-xs px-2.5 py-1 border border-slate-200 rounded font-semibold" placeholder="Título" />
                      <textarea value={step.desc} onChange={(e) => {
                        const updated = [...comoFuncionaData.timeline_steps];
                        updated[index].desc = e.target.value;
                        setComoFuncionaData({ ...comoFuncionaData, timeline_steps: updated });
                      }} className="w-full text-xs p-2 border border-slate-200 rounded min-h-[50px] resize-none" placeholder="Descrição" />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* SEÇÃO MARKETING */}
            <div className="p-4 border border-slate-200 rounded-xl bg-slate-50/50 space-y-4">
              <h4 className="text-xs font-bold text-slate-700">3. Geração de Clientes (Marketing)</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Badge</label>
                  <input type="text" value={comoFuncionaData.marketing_badge} onChange={(e) => setComoFuncionaData({ ...comoFuncionaData, marketing_badge: e.target.value })} className="w-full text-xs px-3 py-2 border border-slate-200 bg-white rounded-md" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Título</label>
                  <input type="text" value={comoFuncionaData.marketing_title} onChange={(e) => setComoFuncionaData({ ...comoFuncionaData, marketing_title: e.target.value })} className="w-full text-xs px-3 py-2 border border-slate-200 bg-white rounded-md" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Descrição 1</label>
                <textarea value={comoFuncionaData.marketing_desc1} onChange={(e) => setComoFuncionaData({ ...comoFuncionaData, marketing_desc1: e.target.value })} className="w-full text-xs p-2.5 border border-slate-200 bg-white rounded-md min-h-[50px]" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Descrição 2</label>
                <textarea value={comoFuncionaData.marketing_desc2} onChange={(e) => setComoFuncionaData({ ...comoFuncionaData, marketing_desc2: e.target.value })} className="w-full text-xs p-2.5 border border-slate-200 bg-white rounded-md min-h-[50px]" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Tags de Prospecção (Separadas por vírgula)</label>
                <input type="text" value={comoFuncionaData.marketing_tags} onChange={(e) => setComoFuncionaData({ ...comoFuncionaData, marketing_tags: e.target.value })} className="w-full text-xs px-3 py-2 border border-slate-200 bg-white rounded-md" />
              </div>
            </div>

            {/* SEÇÃO CRM MÍDIA */}
            <div className="p-4 border border-slate-200 rounded-xl bg-slate-50/50 space-y-4">
              <h4 className="text-xs font-bold text-slate-700">4. CRM e Acompanhamento</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Badge</label>
                  <input type="text" value={comoFuncionaData.crm_badge} onChange={(e) => setComoFuncionaData({ ...comoFuncionaData, crm_badge: e.target.value })} className="w-full text-xs px-3 py-2 border border-slate-200 bg-white rounded-md" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Título</label>
                  <input type="text" value={comoFuncionaData.crm_title} onChange={(e) => setComoFuncionaData({ ...comoFuncionaData, crm_title: e.target.value })} className="w-full text-xs px-3 py-2 border border-slate-200 bg-white rounded-md" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Descrição Explicativa</label>
                <textarea value={comoFuncionaData.crm_desc} onChange={(e) => setComoFuncionaData({ ...comoFuncionaData, crm_desc: e.target.value })} className="w-full text-xs p-2.5 border border-slate-200 bg-white rounded-md min-h-[60px]" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-400 uppercase">Foto Painel CRM 1</label>
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-10 bg-white border border-slate-200 rounded overflow-hidden flex items-center justify-center">
                      {uploadingImageId === 'como_crm_img1' ? <Loader2 className="w-4 h-4 text-brand-emerald animate-spin" /> : <img src={comoFuncionaData.crm_image1} className="w-full h-full object-cover" />}
                    </div>
                    <label className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-3 py-1 rounded text-[10px] font-bold cursor-pointer">
                      <Upload className="w-3.5 h-3.5" /> Enviar
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, (url) => setComoFuncionaData({ ...comoFuncionaData, crm_image1: url }), 'como_crm_img1')} />
                    </label>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-400 uppercase">Foto Painel CRM 2</label>
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-10 bg-white border border-slate-200 rounded overflow-hidden flex items-center justify-center">
                      {uploadingImageId === 'como_crm_img2' ? <Loader2 className="w-4 h-4 text-brand-emerald animate-spin" /> : <img src={comoFuncionaData.crm_image2} className="w-full h-full object-cover" />}
                    </div>
                    <label className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-3 py-1 rounded text-[10px] font-bold cursor-pointer">
                      <Upload className="w-3.5 h-3.5" /> Enviar
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, (url) => setComoFuncionaData({ ...comoFuncionaData, crm_image2: url }), 'como_crm_img2')} />
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* SISTEMA DE QUALIFICAÇÃO */}
            <div className="p-4 border border-slate-200 rounded-xl bg-slate-50/50 space-y-4">
              <h4 className="text-xs font-bold text-slate-700">5. Sistema de Qualificação (3 Cards)</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Título da Seção</label>
                  <input type="text" value={comoFuncionaData.qualif_title} onChange={(e) => setComoFuncionaData({ ...comoFuncionaData, qualif_title: e.target.value })} className="w-full text-xs px-3 py-2 border border-slate-200 bg-white rounded-md" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Subtítulo</label>
                  <input type="text" value={comoFuncionaData.qualif_subtitle} onChange={(e) => setComoFuncionaData({ ...comoFuncionaData, qualif_subtitle: e.target.value })} className="w-full text-xs px-3 py-2 border border-slate-200 bg-white rounded-md" />
                </div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Card 1 */}
                <div className="p-3 bg-white border border-slate-200 rounded-lg space-y-2">
                  <span className="text-[9px] font-bold text-slate-400 uppercase block">Card 1</span>
                  <input type="text" value={comoFuncionaData.qualif_card1_title} onChange={(e) => setComoFuncionaData({ ...comoFuncionaData, qualif_card1_title: e.target.value })} className="w-full text-xs px-2 py-1 border border-slate-200 rounded font-semibold" placeholder="Título" />
                  <input type="text" value={comoFuncionaData.qualif_card1_desc} onChange={(e) => setComoFuncionaData({ ...comoFuncionaData, qualif_card1_desc: e.target.value })} className="w-full text-xs px-2 py-1 border border-slate-200 rounded" placeholder="Descrição" />
                  <textarea value={comoFuncionaData.qualif_card1_items} onChange={(e) => setComoFuncionaData({ ...comoFuncionaData, qualif_card1_items: e.target.value })} className="w-full text-[10px] p-2 border border-slate-200 rounded min-h-[50px]" placeholder="Itens separados por vírgula" />
                </div>
                {/* Card 2 */}
                <div className="p-3 bg-white border border-slate-200 rounded-lg space-y-2">
                  <span className="text-[9px] font-bold text-slate-400 uppercase block">Card 2 (Destaque Navy)</span>
                  <input type="text" value={comoFuncionaData.qualif_card2_title} onChange={(e) => setComoFuncionaData({ ...comoFuncionaData, qualif_card2_title: e.target.value })} className="w-full text-xs px-2 py-1 border border-slate-200 rounded font-semibold" placeholder="Título" />
                  <input type="text" value={comoFuncionaData.qualif_card2_desc} onChange={(e) => setComoFuncionaData({ ...comoFuncionaData, qualif_card2_desc: e.target.value })} className="w-full text-xs px-2 py-1 border border-slate-200 rounded" placeholder="Descrição" />
                  <textarea value={comoFuncionaData.qualif_card2_items} onChange={(e) => setComoFuncionaData({ ...comoFuncionaData, qualif_card2_items: e.target.value })} className="w-full text-[10px] p-2 border border-slate-200 rounded min-h-[50px]" placeholder="Itens separados por vírgula" />
                </div>
                {/* Card 3 */}
                <div className="p-3 bg-white border border-slate-200 rounded-lg space-y-2">
                  <span className="text-[9px] font-bold text-slate-400 uppercase block">Card 3</span>
                  <input type="text" value={comoFuncionaData.qualif_card3_title} onChange={(e) => setComoFuncionaData({ ...comoFuncionaData, qualif_card3_title: e.target.value })} className="w-full text-xs px-2 py-1 border border-slate-200 rounded font-semibold" placeholder="Título" />
                  <textarea value={comoFuncionaData.qualif_card3_desc} onChange={(e) => setComoFuncionaData({ ...comoFuncionaData, qualif_card3_desc: e.target.value })} className="w-full text-xs p-2 border border-slate-200 rounded min-h-[40px] resize-none" placeholder="Descrição 1" />
                  <textarea value={comoFuncionaData.qualif_card3_desc2} onChange={(e) => setComoFuncionaData({ ...comoFuncionaData, qualif_card3_desc2: e.target.value })} className="w-full text-xs p-2 border border-slate-200 rounded min-h-[40px] resize-none" placeholder="Descrição 2" />
                </div>
              </div>
            </div>

            {/* SEÇÃO BENEFÍCIOS */}
            <div className="p-4 border border-slate-200 rounded-xl bg-slate-50/50 space-y-4">
              <h4 className="text-xs font-bold text-slate-700">6. Benefícios de Lado a Lado</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 bg-white border border-slate-200 rounded-lg space-y-2">
                  <span className="text-[9px] font-bold text-slate-400 uppercase block">Benefícios: Cliente</span>
                  <input type="text" value={comoFuncionaData.benefits_title_client} onChange={(e) => setComoFuncionaData({ ...comoFuncionaData, benefits_title_client: e.target.value })} className="w-full text-xs px-2 py-1 border border-slate-200 rounded font-bold" />
                  <input type="text" value={comoFuncionaData.benefits_subtitle_client} onChange={(e) => setComoFuncionaData({ ...comoFuncionaData, benefits_subtitle_client: e.target.value })} className="w-full text-xs px-2 py-1 border border-slate-200 rounded" />
                  <textarea value={comoFuncionaData.benefits_client_items} onChange={(e) => setComoFuncionaData({ ...comoFuncionaData, benefits_client_items: e.target.value })} className="w-full text-xs p-2 border border-slate-200 rounded min-h-[65px]" placeholder="Itens separados por vírgula" />
                </div>
                <div className="p-3 bg-white border border-slate-200 rounded-lg space-y-2">
                  <span className="text-[9px] font-bold text-slate-400 uppercase block">Benefícios: Empresas Parceiras</span>
                  <input type="text" value={comoFuncionaData.benefits_title_partner} onChange={(e) => setComoFuncionaData({ ...comoFuncionaData, benefits_title_partner: e.target.value })} className="w-full text-xs px-2 py-1 border border-slate-200 rounded font-bold" />
                  <input type="text" value={comoFuncionaData.benefits_subtitle_partner} onChange={(e) => setComoFuncionaData({ ...comoFuncionaData, benefits_subtitle_partner: e.target.value })} className="w-full text-xs px-2 py-1 border border-slate-200 rounded" />
                  <textarea value={comoFuncionaData.benefits_partner_items} onChange={(e) => setComoFuncionaData({ ...comoFuncionaData, benefits_partner_items: e.target.value })} className="w-full text-xs p-2 border border-slate-200 rounded min-h-[65px]" placeholder="Itens separados por vírgula" />
                </div>
              </div>
            </div>

            {/* SEÇÃO MISSÃO */}
            <div className="p-4 border border-slate-200 rounded-xl bg-slate-50/50 space-y-4">
              <h4 className="text-xs font-bold text-slate-700">7. Nossa Missão (Painel Final)</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Título da Missão</label>
                  <input type="text" value={comoFuncionaData.mission_title} onChange={(e) => setComoFuncionaData({ ...comoFuncionaData, mission_title: e.target.value })} className="w-full text-xs px-3 py-2 border border-slate-200 bg-white rounded-md" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Descrição da Missão</label>
                  <textarea value={comoFuncionaData.mission_desc} onChange={(e) => setComoFuncionaData({ ...comoFuncionaData, mission_desc: e.target.value })} className="w-full text-xs p-2 border border-slate-200 bg-white rounded-md min-h-[40px]" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Destaques Finais (Separados por vírgula)</label>
                <input type="text" value={comoFuncionaData.mission_bullets} onChange={(e) => setComoFuncionaData({ ...comoFuncionaData, mission_bullets: e.target.value })} className="w-full text-xs px-3 py-2 border border-slate-200 bg-white rounded-md" />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button onClick={() => handleSave('como_funciona', comoFuncionaData)} disabled={saving} className="bg-brand-emerald hover:bg-emerald-600 disabled:bg-slate-300 text-white font-bold px-5 py-2.5 rounded-lg text-xs flex items-center gap-2 cursor-pointer shadow-sm">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Salvar Página Como Funciona
              </button>
            </div>
          </div>
        )}

        {/* ABA GERAL */}
        {subTab === 'general' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-bold text-slate-900 mb-1">Configurações Gerais do Site</h3>
              <p className="text-xs text-slate-500">Configure detalhes de funcionamento e canais de contato direto do site.</p>
            </div>

            <div className="p-5 border border-slate-200 rounded-xl bg-slate-50/50 space-y-4">
              <div className="max-w-md space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Número do WhatsApp (Destinatário)</label>
                <input
                  type="text"
                  value={generalData.whatsappNumber}
                  onChange={(e) => setGeneralData({ ...generalData, whatsappNumber: e.target.value.replace(/\D/g, '') })}
                  className="w-full text-xs px-3 py-2 border border-slate-200 bg-white rounded-md focus:outline-none focus:border-brand-emerald font-bold"
                  placeholder="Ex: 5548999999999"
                />
                <p className="text-[10px] text-slate-400 leading-relaxed">
                  Insira o número completo com código do país (Brasil: 55) + DDD (ex: 48) + Número, <strong>sem espaços, traços ou parênteses</strong>. 
                  Este é o número que receberá os cliques do botão de orçamento e calculadora solar.
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => handleSave('general', generalData)}
                disabled={saving}
                className="bg-brand-emerald hover:bg-emerald-600 disabled:bg-slate-300 text-white font-bold px-5 py-2.5 rounded-lg text-xs flex items-center gap-2 cursor-pointer shadow-sm transition-all"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Salvar Configurações
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
