"use client";

import React, { useEffect, useState } from 'react';
import { ServiceTracking, Lead, Company, StageDetail } from '@/types';
import { getTrackingsAction, saveTrackingAction, deleteTrackingAction } from '@/app/actions/trackings';
import { getLeadsAction } from '@/app/actions/leads';
import { getCompaniesAction } from '@/app/actions/companies';
import { servicesConfig } from '@/config/services';
import { getSiteSettingsAction, saveSiteSettingsAction } from '@/app/actions/settings';
import { 
  ClipboardList, 
  Search, 
  Plus, 
  Filter, 
  Trash2, 
  Edit3, 
  Check, 
  Loader2, 
  X, 
  MessageSquare, 
  Mail, 
  Phone, 
  Calendar, 
  AlertCircle, 
  Send,
  MessageCircle,
  Building,
  User,
  Clock,
  Settings
} from 'lucide-react';

const ETAPAS = [
  { id: 'analise_tecnica', label: 'Análise Técnica / Viabilidade', color: 'bg-slate-100 text-slate-700 border-slate-300' },
  { id: 'orcamento', label: 'Aguardando Aprovação / Orçamento', color: 'bg-blue-50 text-blue-600 border-blue-200' },
  { id: 'agendamento', label: 'Agendamento / Logística', color: 'bg-orange-50 text-orange-600 border-orange-200' },
  { id: 'execucao', label: 'Em Execução / Instalação', color: 'bg-indigo-50 text-indigo-600 border-indigo-200' },
  { id: 'vistoria', label: 'Vistoria / Homologação', color: 'bg-amber-50 text-amber-600 border-amber-200' },
  { id: 'finalizado', label: 'Finalizado & Avaliado', color: 'bg-emerald-50 text-emerald-600 border-emerald-200' }
];

const DEFAULT_TEMPLATES = {
  avisar_etapa: "Olá {cliente}! Passando para informar que o andamento do seu serviço de '{servico}' (realizado pela nossa empresa parceira homologada {empresa}) avançou para a etapa: '{etapa}'. Qualquer dúvida, conte conosco!",
  cobrar_empresa: "Olá {responsavel} da {empresa}! Aqui é da equipe Integra Soluções SC. Estamos acompanhando o serviço de '{servico}' para o cliente {cliente} e gostaríamos de solicitar uma atualização sobre a etapa atual: '{etapa}'. Como está o andamento? Há alguma pendência?",
  cobrar_cliente: "Olá {cliente}! Aqui é do Integra Soluções SC. Gostaríamos de avisar que precisamos de um retorno/ação sua para avançarmos com o serviço de '{servico}' (prestado pela {empresa}) na etapa '{etapa}'. Por favor, entre em contato quando puder. Obrigado!",
  avisar_conclusao: "Olá {cliente}! Temos o prazer de informar que o seu serviço de '{servico}' realizado pela empresa homologada {empresa} foi concluído com sucesso! 🎉 Agradecemos pela confiança no Integra Soluções SC.",
  feedback: "Olá {cliente}! Como o seu serviço de '{servico}' com a {empresa} foi finalizado, gostaríamos muito de saber como foi a sua experiência. O seu feedback nos ajuda a manter o alto padrão de qualidade das nossas empresas homologadas! Como você avalia o serviço prestado?"
};

// Helpers para melhorias do Acompanhamento
const formatDate = (dateStr?: string) => {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}`;
  }
  return dateStr;
};

const getStageBadgeClass = (status?: string) => {
  switch (status) {
    case 'concluido': return 'bg-emerald-50/70 text-emerald-700 border-emerald-200';
    case 'atrasado': return 'bg-red-50 text-red-700 border-red-200';
    case 'executando': return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'pendente':
    default: return 'bg-slate-50 text-slate-400 border-slate-200';
  }
};

const calculateTrackingMetrics = (t: ServiceTracking): ServiceTracking => {
  const updated = { ...t };
  if (!updated.etapas_dados) {
    updated.etapas_dados = {
      analise_tecnica: { status: 'pendente' },
      orcamento: { status: 'pendente' },
      agendamento: { status: 'pendente' },
      execucao: { status: 'pendente' },
      vistoria: { status: 'pendente' }
    };
  }
  
  const stages = ['analise_tecnica', 'orcamento', 'agendamento', 'execucao', 'vistoria'] as const;
  
  let totalDelayDays = 0;
  let totalSlaScore = 0;
  let slaCount = 0;
  let totalManualScore = 0;
  let manualCount = 0;
  let hasActiveDelay = false;
  
  const hojeStr = new Date().toISOString().split('T')[0];
  
  stages.forEach(stage => {
    if (!updated.etapas_dados![stage]) {
      updated.etapas_dados![stage] = { status: 'pendente' };
    }
    
    const s = updated.etapas_dados![stage]!;
    
    // Calculate delay days
    let delay = 0;
    if (s.data_fim) {
      if (s.data_previsao && s.data_fim > s.data_previsao) {
        const start = new Date(s.data_previsao + 'T00:00:00');
        const end = new Date(s.data_fim + 'T00:00:00');
        delay = Math.max(0, Math.ceil((end.getTime() - start.getTime()) / 86400000));
      }
    } else if (s.data_previsao && hojeStr > s.data_previsao) {
      const start = new Date(s.data_previsao + 'T00:00:00');
      const now = new Date(hojeStr + 'T00:00:00');
      delay = Math.max(0, Math.ceil((now.getTime() - start.getTime()) / 86400000));
    }
    
    s.atraso_dias = delay;
    totalDelayDays += delay;
    
    // Calculate automatic delay score
    const scoreAtraso = delay > 0 ? Math.max(0, Number((5.0 - delay * 0.5).toFixed(1))) : 5.0;
    s.pontuacao_atraso = scoreAtraso;
    
    totalSlaScore += scoreAtraso;
    slaCount++;
    
    if (s.pontuacao_manual && s.pontuacao_manual > 0) {
      totalManualScore += s.pontuacao_manual;
      manualCount++;
    }
    
    // Determine status
    if (s.data_fim) {
      s.status = 'concluido';
    } else if (delay > 0) {
      s.status = 'atrasado';
      hasActiveDelay = true;
    } else if (s.data_inicio) {
      s.status = 'executando';
    } else {
      s.status = 'pendente';
    }
  });
  
  updated.dias_totais_atraso = totalDelayDays;
  
  // Score global (média do SLA e da nota de qualidade manual)
  const avgSla = totalSlaScore / (slaCount || 1);
  const avgManual = manualCount > 0 ? totalManualScore / manualCount : 5.0;
  updated.score_global_projeto = Number(((avgSla + avgManual) / 2).toFixed(1));
  
  if (updated.etapa === 'finalizado') {
    updated.status_projeto = 'concluido';
  } else if (hasActiveDelay) {
    updated.status_projeto = 'atrasado';
  } else {
    updated.status_projeto = 'em_dia';
  }
  
  return updated;
};

export default function AdminServiceTrackings() {
  const [trackings, setTrackings] = useState<ServiceTracking[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Aba selecionada na edição por etapas
  const [activeModalStageTab, setActiveModalStageTab] = useState<'analise_tecnica' | 'orcamento' | 'agendamento' | 'execucao' | 'vistoria'>('analise_tecnica');

  // Modelos de Mensagem (Templates)
  const [templates, setTemplates] = useState(DEFAULT_TEMPLATES);
  const [isTemplatesModalOpen, setIsTemplatesModalOpen] = useState(false);
  const [editingTemplates, setEditingTemplates] = useState(DEFAULT_TEMPLATES);

  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [etapaFilter, setEtapaFilter] = useState('Todos');
  const [companyFilter, setCompanyFilter] = useState('Todos');

  // Modais
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isNotifyModalOpen, setIsNotifyModalOpen] = useState(false);
  const [editingTracking, setEditingTracking] = useState<ServiceTracking | null>(null);
  
  // Estado de notificação
  const [selectedTracking, setSelectedTracking] = useState<ServiceTracking | null>(null);
  const [msgType, setMsgType] = useState<'cobrar' | 'avisar_etapa' | 'avisar_conclusao' | 'feedback'>('avisar_etapa');
  const [recipient, setRecipient] = useState<'cliente' | 'empresa'>('cliente');
  const [customMsgText, setCustomMsgText] = useState('');

  // Estatísticas para o Dashboard do CRM
  const dashboardStats = React.useMemo(() => {
    const total = trackings.length;
    const concluded = trackings.filter(t => t.etapa === 'finalizado').length;
    const active = total - concluded;
    const delayed = trackings.filter(t => t.status_projeto === 'atrasado').length;
    const onTime = active - delayed;
    
    let sumSla = 0;
    let countSla = 0;
    trackings.forEach(t => {
      let projectSla = 0;
      let projectSlaCount = 0;
      const stageKeys = ['analise_tecnica', 'orcamento', 'agendamento', 'execucao', 'vistoria'] as const;
      stageKeys.forEach(s => {
        const score = t.etapas_dados?.[s]?.pontuacao_atraso;
        if (typeof score === 'number') {
          projectSla += score;
          projectSlaCount++;
        }
      });
      if (projectSlaCount > 0) {
        sumSla += (projectSla / projectSlaCount);
        countSla++;
      }
    });
    
    const slaMedio = countSla > 0 ? Math.round((sumSla / (countSla * 5)) * 100) : 100;
    
    return { total, active, concluded, delayed, onTime, slaMedio };
  }, [trackings]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setErrorMsg('');

      const [trackingsRes, leadsRes, companiesRes, templatesRes] = await Promise.all([
        getTrackingsAction(),
        getLeadsAction(),
        getCompaniesAction(),
        getSiteSettingsAction('tracking_templates')
      ]);

      if (trackingsRes.success) setTrackings(trackingsRes.data || []);
      if (leadsRes.success) setLeads(leadsRes.data || []);
      if (companiesRes.success) setCompanies(companiesRes.data || []);
      if (templatesRes.success && templatesRes.data) {
        setTemplates({ ...DEFAULT_TEMPLATES, ...templatesRes.data });
      } else {
        setTemplates(DEFAULT_TEMPLATES);
      }

      if (!trackingsRes.success || !leadsRes.success || !companiesRes.success) {
        setErrorMsg('Alguns dados não puderam ser carregados corretamente do banco de dados.');
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg('Erro de conexão ao buscar os dados.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingTracking({
      id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 9),
      created_at: new Date().toISOString(),
      cliente_nome: '',
      cliente_whatsapp: '',
      cliente_email: '',
      servico: servicesConfig[0].title,
      empresa_id: '',
      empresa_nome: '',
      etapa: 'analise_tecnica',
      data_inicio: new Date().toISOString().split('T')[0],
      data_previsao: '',
      observacoes: '',
      avaliacao: {
        qualidade_servicos: 0,
        cumprimento_prazos: 0,
        organizacao: 0,
        atendimento: 0,
        pos_venda: 0,
        feedback_clientes: 0
      },
      etapas_dados: {
        analise_tecnica: { status: 'pendente' },
        orcamento: { status: 'pendente' },
        agendamento: { status: 'pendente' },
        execucao: { status: 'pendente' },
        vistoria: { status: 'pendente' }
      }
    });
    setActiveModalStageTab('analise_tecnica');
    setIsEditModalOpen(true);
  };

  const handleOpenEdit = (tracking: ServiceTracking) => {
    setEditingTracking({ 
      ...tracking,
      avaliacao: tracking.avaliacao || {
        qualidade_servicos: 0,
        cumprimento_prazos: 0,
        organizacao: 0,
        atendimento: 0,
        pos_venda: 0,
        feedback_clientes: 0
      },
      etapas_dados: tracking.etapas_dados || {
        analise_tecnica: { status: 'pendente' },
        orcamento: { status: 'pendente' },
        agendamento: { status: 'pendente' },
        execucao: { status: 'pendente' },
        vistoria: { status: 'pendente' }
      }
    });
    setIsEditModalOpen(true);
  };

  const handleOpenEditAtStage = (tracking: ServiceTracking, stageKey: typeof activeModalStageTab) => {
    setActiveModalStageTab(stageKey);
    handleOpenEdit(tracking);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja realmente excluir este acompanhamento de serviço?')) return;

    try {
      setSaving(true);
      const res = await deleteTrackingAction(id);
      if (res.success) {
        showSuccess('Acompanhamento excluído com sucesso!');
        fetchData();
      } else {
        throw new Error(res.error);
      }
    } catch (err: any) {
      alert(err.message || 'Erro ao excluir acompanhamento.');
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTracking) return;
    if (!editingTracking.cliente_nome.trim()) {
      alert('O Nome do Cliente é obrigatório!');
      return;
    }
    if (!editingTracking.empresa_nome.trim()) {
      alert('Selecione uma Empresa Responsável!');
      return;
    }

    if (editingTracking.etapa === 'finalizado') {
      const av = editingTracking.avaliacao;
      if (!av || !av.qualidade_servicos || !av.cumprimento_prazos || !av.organizacao || !av.atendimento || !av.pos_venda || !av.feedback_clientes) {
        alert('Para finalizar o serviço, por favor preencha todas as notas de avaliação do parceiro!');
        return;
      }
    }

    try {
      setSaving(true);
      setErrorMsg('');
      const calculated = calculateTrackingMetrics(editingTracking);
      const res = await saveTrackingAction(calculated);
      if (res.success) {
        showSuccess('Acompanhamento salvo com sucesso!');
        setIsEditModalOpen(false);
        setEditingTracking(null);
        fetchData();
      } else {
        throw new Error(res.error);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao salvar o acompanhamento.');
    } finally {
      setSaving(false);
    }
  };

  // Preenche dados ao selecionar um lead cadastrado
  const handleSelectLead = (leadId: string) => {
    if (!editingTracking) return;
    if (!leadId) {
      setEditingTracking({
        ...editingTracking,
        lead_id: undefined,
        cliente_nome: '',
        cliente_whatsapp: '',
        cliente_email: ''
      });
      return;
    }
    
    const lead = leads.find(l => l.id === leadId);
    if (lead) {
      setEditingTracking({
        ...editingTracking,
        lead_id: lead.id,
        cliente_nome: lead.nome,
        cliente_whatsapp: lead.whatsapp,
        cliente_email: lead.email || '',
        servico: lead.servico
      });
    }
  };

  // Preenche dados ao selecionar uma empresa cadastrada
  const handleSelectCompany = (companyId: string) => {
    if (!editingTracking) return;
    if (!companyId) {
      setEditingTracking({
        ...editingTracking,
        empresa_id: '',
        empresa_nome: '',
        empresa_whatsapp: undefined,
        empresa_email: undefined
      });
      return;
    }

    const company = companies.find(c => c.id === companyId);
    if (company) {
      setEditingTracking({
        ...editingTracking,
        empresa_id: company.id,
        empresa_nome: company.nome_fantasia || '',
        empresa_whatsapp: company.whatsapp || undefined,
        empresa_email: company.email || undefined
      });
    }
  };

  // Alteração inline de etapa na tabela
  const handleInlineStageChange = async (id: string, newEtapa: typeof ETAPAS[number]['id']) => {
    const tracking = trackings.find(t => t.id === id);
    if (!tracking) return;

    let updatedTracking = { ...tracking, etapa: newEtapa as any };
    updatedTracking = calculateTrackingMetrics(updatedTracking);
    
    // Atualização otimista
    setTrackings(trackings.map(t => t.id === id ? updatedTracking : t));

    try {
      const res = await saveTrackingAction(updatedTracking);
      if (res.success) {
        showSuccess('Etapa atualizada com sucesso!');
      } else {
        throw new Error(res.error);
      }
    } catch (err: any) {
      alert(err.message || 'Erro ao atualizar a etapa.');
      fetchData(); // Rollback
    }
  };

  // Lógica de Geração de Frases Prontas
  const generateMessage = (tracking: ServiceTracking, type: typeof msgType, target: typeof recipient) => {
    const cliente = tracking.cliente_nome;
    const servico = tracking.servico;
    const empresa = tracking.empresa_nome;
    const etapaLabel = ETAPAS.find(e => e.id === tracking.etapa)?.label || tracking.etapa;
    const respNome = companies.find(c => c.id === tracking.empresa_id)?.responsavel_nome || 'Responsável';

    let templateText = '';
    if (type === 'cobrar') {
      if (target === 'empresa') {
        templateText = templates.cobrar_empresa;
      } else {
        templateText = templates.cobrar_cliente;
      }
    } else if (type === 'avisar_etapa') {
      templateText = templates.avisar_etapa;
    } else if (type === 'avisar_conclusao') {
      templateText = templates.avisar_conclusao;
    } else if (type === 'feedback') {
      templateText = templates.feedback;
    }

    return templateText
      .replace(/{cliente}/g, cliente)
      .replace(/{servico}/g, servico)
      .replace(/{empresa}/g, empresa)
      .replace(/{etapa}/g, etapaLabel)
      .replace(/{responsavel}/g, respNome);
  };

  const handleOpenNotify = (tracking: ServiceTracking) => {
    setSelectedTracking(tracking);
    // Definir defaults
    setMsgType('avisar_etapa');
    setRecipient('cliente');
    
    const initialMsg = generateMessage(tracking, 'avisar_etapa', 'cliente');
    setCustomMsgText(initialMsg);
    setIsNotifyModalOpen(true);
  };

  // Atualiza mensagem quando mudamos destinatário ou tipo
  const handleNotifyConfigChange = (newType: typeof msgType, newRecipient: typeof recipient) => {
    setMsgType(newType);
    setRecipient(newRecipient);
    if (selectedTracking) {
      const msg = generateMessage(selectedTracking, newType, newRecipient);
      setCustomMsgText(msg);
    }
  };

  const sendWhatsApp = () => {
    if (!selectedTracking) return;
    const phone = recipient === 'cliente' 
      ? selectedTracking.cliente_whatsapp 
      : selectedTracking.empresa_whatsapp || '';
      
    if (!phone) {
      alert('Número de WhatsApp não cadastrado!');
      return;
    }
    const cleanPhone = phone.replace(/\D/g, '');
    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(customMsgText)}`;
    window.open(url, '_blank');
  };

  const sendEmail = () => {
    if (!selectedTracking) return;
    const email = recipient === 'cliente' 
      ? selectedTracking.cliente_email 
      : selectedTracking.empresa_email || '';
      
    if (!email) {
      alert('E-mail não cadastrado!');
      return;
    }
    const subject = `Acompanhamento de Serviço Integra Soluções SC: ${selectedTracking.servico}`;
    const url = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(customMsgText)}`;
    window.open(url, '_blank');
  };

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  // Filtragem local
  const filteredTrackings = trackings.filter(t => {
    const matchesSearch = 
      t.cliente_nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.servico.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.empresa_nome.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesEtapa = etapaFilter === 'Todos' || t.etapa === etapaFilter;
    const matchesCompany = companyFilter === 'Todos' || t.empresa_id === companyFilter;

    return matchesSearch && matchesEtapa && matchesCompany;
  });

  const renderStageCell = (t: ServiceTracking, stageKey: 'analise_tecnica' | 'orcamento' | 'agendamento' | 'execucao' | 'vistoria') => {
    const stage = t.etapas_dados?.[stageKey] || { status: 'pendente' };
    const statusLabels = {
      pendente: 'Pendente',
      executando: 'Executando',
      concluido: 'Concluído',
      atrasado: 'Atrasado'
    };

    return (
      <td 
        className="px-3 py-3 cursor-pointer hover:bg-slate-50/80 transition-all border-r border-slate-100 last:border-0"
        onClick={() => handleOpenEditAtStage(t, stageKey)}
      >
        <div className={`p-2 rounded-lg border text-[10px] space-y-1 ${getStageBadgeClass(stage.status)}`}>
          <div className="flex justify-between items-center font-bold">
            <span>{statusLabels[stage.status || 'pendente']}</span>
            {stage.status === 'concluido' && <Check className="w-3 h-3 text-emerald-600" />}
          </div>
          
          {/* Datas */}
          {stage.data_inicio && (
            <div className="text-[9px] opacity-80">
              Início: {formatDate(stage.data_inicio)}
            </div>
          )}
          {stage.status !== 'concluido' && stage.data_previsao && (
            <div className="text-[9px] font-semibold">
              Prev: {formatDate(stage.data_previsao)}
            </div>
          )}
          {stage.status === 'concluido' && stage.data_fim && (
            <div className="text-[9px] opacity-80">
              Fim: {formatDate(stage.data_fim)}
            </div>
          )}
          
          {/* Pontuações */}
          <div className="flex items-center gap-2 pt-0.5 border-t border-dotted border-current/20 text-[9px]">
            {typeof stage.pontuacao_atraso === 'number' && (
              <span title="Pontuação automática de atraso (SLA)" className="font-semibold flex items-center gap-0.5">
                ⏱️ {stage.pontuacao_atraso.toFixed(1)}
              </span>
            )}
            {typeof stage.pontuacao_manual === 'number' && stage.pontuacao_manual > 0 && (
              <span title="Pontuação manual da etapa" className="font-bold flex items-center gap-0.5 text-amber-600">
                ⭐ {stage.pontuacao_manual.toFixed(1)}
              </span>
            )}
          </div>
          
          {/* Indicador de obs */}
          {stage.observacao && (
            <div className="text-[8px] italic opacity-85 truncate" title={stage.observacao}>
              💬 {stage.observacao}
            </div>
          )}
        </div>
      </td>
    );
  };

  return (
    <div className="space-y-6">
      {/* Alertas */}
      {errorMsg && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          <span>{errorMsg}</span>
        </div>
      )}
      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-lg text-xs flex items-center gap-2 animate-in fade-in duration-200">
          <Check className="w-4 h-4" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Cards de KPI */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4 animate-in fade-in duration-200">
          <div className="w-12 h-12 rounded-full bg-slate-50 text-slate-600 flex items-center justify-center">
            <ClipboardList className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total de Projetos</p>
            <p className="text-2xl font-black text-slate-800">{dashboardStats.total} <span className="text-sm font-normal text-slate-400">({dashboardStats.active} ativos)</span></p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4 animate-in fade-in duration-200">
          <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Check className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Projetos em Dia</p>
            <p className="text-2xl font-black text-emerald-600">{dashboardStats.onTime}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4 animate-in fade-in duration-200">
          <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center">
            <AlertCircle className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Projetos Atrasados</p>
            <p className="text-2xl font-black text-red-600">{dashboardStats.delayed}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4 animate-in fade-in duration-200">
          <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">SLA Geral de Prazos</p>
            <p className="text-2xl font-black text-blue-600">{dashboardStats.slaMedio}%</p>
          </div>
        </div>
      </div>

      {/* Barra de Ações & Filtros */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Busca */}
          <div className="relative w-full md:w-64">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Buscar por cliente, serviço, empresa..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-md focus:outline-none focus:border-brand-emerald"
            />
          </div>

          {/* Filtro de Etapa */}
          <select 
            value={etapaFilter}
            onChange={(e) => setEtapaFilter(e.target.value)}
            className="py-2 px-3 text-xs border border-slate-200 rounded-md focus:outline-none bg-white font-medium text-slate-600"
          >
            <option value="Todos">Todas as Etapas</option>
            {ETAPAS.map(e => (
              <option key={e.id} value={e.id}>{e.label}</option>
            ))}
          </select>

          {/* Filtro de Empresa */}
          <select 
            value={companyFilter}
            onChange={(e) => setCompanyFilter(e.target.value)}
            className="py-2 px-3 text-xs border border-slate-200 rounded-md focus:outline-none bg-white font-medium text-slate-600"
          >
            <option value="Todos">Todas as Empresas</option>
            {companies.map(c => (
              <option key={c.id} value={c.id}>{c.nome_fantasia}</option>
            ))}
          </select>
        </div>

        <div className="flex gap-2 w-full md:w-auto justify-end">
          <button 
            onClick={() => {
              setEditingTemplates({ ...templates });
              setIsTemplatesModalOpen(true);
            }}
            className="bg-white border border-slate-200 text-slate-600 px-3 py-2 rounded-md text-xs font-semibold hover:bg-slate-50 transition-all flex items-center gap-2 cursor-pointer shadow-sm"
          >
            <Settings className="w-3.5 h-3.5" /> Configurar Frases
          </button>
          <button 
            onClick={handleOpenCreate}
            className="bg-brand-emerald text-white px-3 py-2 rounded-md text-xs font-bold hover:bg-emerald-600 transition-all flex items-center gap-2 shadow-sm cursor-pointer whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" /> Novo Acompanhamento
          </button>
        </div>
      </div>

      {/* Lista / Tabela */}
      {loading ? (
        <div className="bg-white p-16 rounded-xl border border-slate-200 shadow-sm text-center">
          <Loader2 className="w-8 h-8 text-brand-emerald animate-spin mx-auto mb-4" />
          <p className="text-slate-400 text-xs">Sincronizando acompanhamentos...</p>
        </div>
      ) : filteredTrackings.length === 0 ? (
        <div className="bg-white p-16 rounded-xl border border-slate-200 shadow-sm text-center text-slate-400 text-xs italic">
          Nenhum acompanhamento de serviço cadastrado ou compatível com os filtros atuais.
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/85 text-slate-500 text-[10px] uppercase tracking-[0.1em] border-b border-slate-200">
                  <th className="px-4 py-4 font-bold min-w-[170px]">Cliente / Contato</th>
                  <th className="px-4 py-4 font-bold min-w-[150px]">Serviço / Responsável</th>
                  <th className="px-4 py-4 font-bold text-center min-w-[110px]">Análise Técnica</th>
                  <th className="px-4 py-4 font-bold text-center min-w-[110px]">Orçamento</th>
                  <th className="px-4 py-4 font-bold text-center min-w-[110px]">Agendamento</th>
                  <th className="px-4 py-4 font-bold text-center min-w-[110px]">Execução</th>
                  <th className="px-4 py-4 font-bold text-center min-w-[110px]">Vistoria</th>
                  <th className="px-4 py-4 font-bold text-center min-w-[110px]">Ações</th>
                </tr>
              </thead>
              <tbody className="text-xs divide-y divide-slate-100">
                {filteredTrackings.map((t) => {
                  return (
                    <tr key={t.id} className="hover:bg-slate-50/50 transition-colors">
                      {/* Cliente */}
                      <td className="px-4 py-4">
                        <div className="font-bold text-slate-900 flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          {t.cliente_nome}
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono mt-0.5 space-y-0.5">
                          <div>📱 {t.cliente_whatsapp}</div>
                        </div>
                      </td>

                      {/* Serviço / Empresa */}
                      <td className="px-4 py-4 space-y-1">
                        <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200/60 font-bold text-slate-700 text-[9px] uppercase tracking-wide block w-fit">
                          {t.servico}
                        </span>
                        <div className="font-semibold text-slate-800 flex items-center gap-1">
                          <Building className="w-3.5 h-3.5 text-slate-400" />
                          <span className="truncate max-w-[130px]" title={t.empresa_nome}>{t.empresa_nome}</span>
                        </div>
                      </td>

                      {/* 5 Stages */}
                      {renderStageCell(t, 'analise_tecnica')}
                      {renderStageCell(t, 'orcamento')}
                      {renderStageCell(t, 'agendamento')}
                      {renderStageCell(t, 'execucao')}
                      {renderStageCell(t, 'vistoria')}

                      {/* Ações / Notificar */}
                      <td className="px-4 py-4 text-center">
                        <div className="flex flex-col items-center gap-1.5">
                          <button
                            onClick={() => handleOpenNotify(t)}
                            className="bg-brand-emerald/10 hover:bg-brand-emerald text-brand-emerald hover:text-white border border-brand-emerald/20 px-2 py-1 rounded text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5"
                            title="Enviar aviso ou cobrar"
                          >
                            <Send className="w-2.5 h-2.5" /> Notificar
                          </button>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleOpenEdit(t)}
                              className="p-1 rounded border border-slate-200 bg-white text-slate-600 hover:text-brand-emerald hover:bg-slate-50 transition-all cursor-pointer"
                              title="Editar"
                            >
                              <Edit3 className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => handleDelete(t.id)}
                              className="p-1 rounded border border-slate-200 bg-white text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all cursor-pointer"
                              title="Remover"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL CADASTRAR / EDITAR */}
      {isEditModalOpen && editingTracking && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
            {/* Header Modal */}
            <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-brand-emerald/10 text-brand-emerald rounded-lg">
                  <ClipboardList className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    {trackings.some(t => t.id === editingTracking.id) ? 'Editar Acompanhamento' : 'Novo Acompanhamento de Serviço'}
                  </h3>
                  <p className="text-[11px] text-slate-500">Configure o vínculo do serviço, cliente, empresa homologada e datas.</p>
                </div>
              </div>
              <button 
                onClick={() => setIsEditModalOpen(false)}
                className="p-2 hover:bg-slate-200 rounded-lg text-slate-400 hover:text-slate-600 transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Formulario */}
            <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Seção 1: Vínculo do Cliente / Lead */}
              <div className="space-y-4">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-1">1. Vínculo do Cliente</h4>
                
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Selecionar de Leads Cadastrados (Opcional)</label>
                  <select 
                    value={editingTracking.lead_id || ''}
                    onChange={(e) => handleSelectLead(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-md bg-white focus:outline-none focus:border-brand-emerald cursor-pointer"
                  >
                    <option value="">-- Cadastrar Cliente Manualmente --</option>
                    {leads.map(l => (
                      <option key={l.id} value={l.id}>{l.nome} ({l.servico})</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Nome do Cliente *</label>
                    <input 
                      type="text" 
                      required
                      value={editingTracking.cliente_nome}
                      onChange={(e) => setEditingTracking({ ...editingTracking, cliente_nome: e.target.value })}
                      placeholder="Ex: João da Silva"
                      className="w-full text-xs px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:border-brand-emerald"
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">WhatsApp do Cliente *</label>
                    <input 
                      type="text" 
                      required
                      value={editingTracking.cliente_whatsapp}
                      onChange={(e) => setEditingTracking({ ...editingTracking, cliente_whatsapp: e.target.value })}
                      placeholder="Ex: (48) 99999-9999"
                      className="w-full text-xs px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:border-brand-emerald"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">E-mail do Cliente</label>
                    <input 
                      type="email" 
                      value={editingTracking.cliente_email}
                      onChange={(e) => setEditingTracking({ ...editingTracking, cliente_email: e.target.value })}
                      placeholder="cliente@email.com"
                      className="w-full text-xs px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:border-brand-emerald"
                    />
                  </div>
                </div>
              </div>

              {/* Seção 2: Serviço e Empresa */}
              <div className="space-y-4">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-1">2. Serviço e Empresa Parceira</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Serviço Contratado</label>
                    <select
                      value={editingTracking.servico}
                      onChange={(e) => setEditingTracking({ ...editingTracking, servico: e.target.value })}
                      className="w-full text-xs px-3 py-2 border border-slate-200 rounded-md bg-white focus:outline-none"
                    >
                      {servicesConfig.map(s => (
                        <option key={s.id} value={s.title}>{s.title}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Empresa Homologada Responsável *</label>
                    <select 
                      value={editingTracking.empresa_id}
                      onChange={(e) => handleSelectCompany(e.target.value)}
                      required
                      className="w-full text-xs px-3 py-2 border border-slate-200 rounded-md bg-white focus:outline-none focus:border-brand-emerald"
                    >
                      <option value="">-- Selecione uma Empresa --</option>
                      {companies.map(c => (
                        <option key={c.id} value={c.id}>{c.nome_fantasia}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Seção 3: Cronograma e Etapa */}
              <div className="space-y-4">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-1">3. Acompanhamento Operacional</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Etapa Atual</label>
                    <select
                      value={editingTracking.etapa}
                      onChange={(e) => setEditingTracking({ ...editingTracking, etapa: e.target.value as any })}
                      className="w-full text-xs px-3 py-2 border border-slate-200 rounded-md bg-white focus:outline-none focus:border-brand-emerald"
                    >
                      {ETAPAS.map(e => (
                        <option key={e.id} value={e.id}>{e.label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Data de Início</label>
                    <input 
                      type="date" 
                      value={editingTracking.data_inicio || ''}
                      onChange={(e) => setEditingTracking({ ...editingTracking, data_inicio: e.target.value })}
                      className="w-full text-xs px-3 py-2 border border-slate-200 rounded-md focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Previsão de Finalização</label>
                    <input 
                      type="date" 
                      value={editingTracking.data_previsao || ''}
                      onChange={(e) => setEditingTracking({ ...editingTracking, data_previsao: e.target.value })}
                      className="w-full text-xs px-3 py-2 border border-slate-200 rounded-md focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Observações Internas</label>
                  <textarea 
                    value={editingTracking.observacoes || ''}
                    onChange={(e) => setEditingTracking({ ...editingTracking, observacoes: e.target.value })}
                    placeholder="Condições especiais, relatórios, atrasos ou notas de vistoria."
                    className="w-full text-xs p-3 border border-slate-200 rounded-md focus:outline-none min-h-[80px]"
                  />
                </div>
              </div>

              {/* Seção 4: Cronograma Detalhado por Etapa */}
              <div className="space-y-4 border-t border-slate-100 pt-4">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-1">4. Cronograma Detalhado por Etapa</h4>
                
                {/* Abas das Etapas */}
                <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200 overflow-x-auto">
                  {[
                    { id: 'analise_tecnica', label: 'Análise' },
                    { id: 'orcamento', label: 'Orçamento' },
                    { id: 'agendamento', label: 'Agendamento' },
                    { id: 'execucao', label: 'Execução' },
                    { id: 'vistoria', label: 'Vistoria' }
                  ].map(tab => {
                    const stData = editingTracking.etapas_dados?.[tab.id as 'analise_tecnica' | 'orcamento' | 'agendamento' | 'execucao' | 'vistoria'] || {};
                    const stStatus = stData.status || 'pendente';
                    let statusColor = 'text-slate-500';
                    if (stStatus === 'concluido') statusColor = 'text-emerald-600 font-bold';
                    else if (stStatus === 'atrasado') statusColor = 'text-red-500 font-bold';
                    else if (stStatus === 'executando') statusColor = 'text-blue-500 font-bold';
                    
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setActiveModalStageTab(tab.id as 'analise_tecnica' | 'orcamento' | 'agendamento' | 'execucao' | 'vistoria')}
                        className={`flex-1 py-1.5 px-3 rounded text-[11px] font-bold transition-all whitespace-nowrap ${
                          activeModalStageTab === tab.id 
                            ? 'bg-white text-slate-800 shadow-sm' 
                            : `${statusColor} hover:text-slate-700`
                        }`}
                      >
                        {tab.label}
                        {stStatus === 'concluido' && ' ✓'}
                        {stStatus === 'atrasado' && ' ⚠'}
                      </button>
                    );
                  })}
                </div>

                {/* Conteúdo da Aba da Etapa Selecionada */}
                {(() => {
                  const stageKey = activeModalStageTab;
                  const stageData = editingTracking.etapas_dados?.[stageKey] || {};
                  const stageStatus = stageData.status || 'pendente';

                  const updateStageField = (field: keyof StageDetail, val: any) => {
                    const updatedEtapas = { ...editingTracking.etapas_dados };
                    updatedEtapas[stageKey] = {
                      ...updatedEtapas[stageKey],
                      [field]: val
                    };
                    setEditingTracking({
                      ...editingTracking,
                      etapas_dados: updatedEtapas
                    });
                  };

                  return (
                <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-200/60 space-y-4 animate-in fade-in duration-200">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-slate-700">Configurando: {
                          stageKey === 'analise_tecnica' ? 'Análise Técnica' :
                          stageKey === 'orcamento' ? 'Orçamento / Proposta' :
                          stageKey === 'agendamento' ? 'Agendamento / Logística' :
                          stageKey === 'execucao' ? 'Execução / Instalação' : 'Vistoria / Homologação'
                        }</span>
                        <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider border ${getStageBadgeClass(stageStatus)}`}>
                          {stageStatus === 'concluido' ? 'Concluído' :
                           stageStatus === 'atrasado' ? 'Atrasado' :
                           stageStatus === 'executando' ? 'Executando' : 'Pendente'}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-slate-500 uppercase">Data Início</label>
                          <input 
                            type="date"
                            value={stageData.data_inicio || ''}
                            onChange={(e) => updateStageField('data_inicio', e.target.value || undefined)}
                            className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded focus:outline-none bg-white font-semibold text-slate-700"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-slate-500 uppercase">Previsão Fim</label>
                          <input 
                            type="date"
                            value={stageData.data_previsao || ''}
                            onChange={(e) => updateStageField('data_previsao', e.target.value || undefined)}
                            className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded focus:outline-none bg-white font-semibold text-slate-700"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-slate-500 uppercase">Data Fim (Conclusão)</label>
                          <input 
                            type="date"
                            value={stageData.data_fim || ''}
                            onChange={(e) => updateStageField('data_fim', e.target.value || undefined)}
                            className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded focus:outline-none bg-white font-semibold text-slate-700"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-slate-500 uppercase">Nota Manual (Parceiro)</label>
                          <select
                            value={stageData.pontuacao_manual || 0}
                            onChange={(e) => updateStageField('pontuacao_manual', Number(e.target.value))}
                            className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded focus:outline-none bg-white font-bold text-slate-700"
                          >
                            <option value={0}>Sem Avaliação</option>
                            <option value={1}>⭐ 1 - Muito Ruim</option>
                            <option value={2}>⭐⭐ 2 - Ruim</option>
                            <option value={3}>⭐⭐⭐ 3 - Regular</option>
                            <option value={4}>⭐⭐⭐⭐ 4 - Bom</option>
                            <option value={5}>⭐⭐⭐⭐⭐ 5 - Excelente</option>
                          </select>
                        </div>

                        {/* Readonly Calculated Fields */}
                        <div className="p-3 bg-white border border-slate-200 rounded-lg text-[10px] space-y-1">
                          <span className="font-bold text-slate-400 block uppercase tracking-wide">Atraso Calculado</span>
                          <span className="font-semibold text-slate-700 text-[9px]">
                            {stageData.atraso_dias && stageData.atraso_dias > 0 
                              ? `${stageData.atraso_dias} dia(s) de atraso` 
                              : 'Em dia / Sem atraso'}
                          </span>
                        </div>

                        <div className="p-3 bg-white border border-slate-200 rounded-lg text-[10px] space-y-1">
                          <span className="font-bold text-slate-400 block uppercase tracking-wide">Nota Automática SLA</span>
                          <span className={`font-black ${stageData.pontuacao_atraso && stageData.pontuacao_atraso < 5 ? 'text-red-500' : 'text-emerald-600'}`}>
                            {typeof stageData.pontuacao_atraso === 'number' 
                              ? `${stageData.pontuacao_atraso.toFixed(1)} / 5.0` 
                              : '5.0 / 5.0'}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-500 uppercase">Observações da Etapa</label>
                        <textarea
                          value={stageData.observacao || ''}
                          onChange={(e) => updateStageField('observacao', e.target.value)}
                          placeholder="Digite aqui os comentários específicos para o andamento desta etapa."
                          className="w-full text-xs p-2.5 border border-slate-200 rounded focus:outline-none min-h-[60px] resize-none leading-relaxed bg-white"
                        />
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Seção 4: Avaliação do Serviço (Exibida apenas se finalizado) */}
              {editingTracking.etapa === 'finalizado' && (
                <div className="space-y-4 bg-emerald-50/50 p-4 rounded-xl border border-emerald-100">
                  <h4 className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest border-b border-emerald-100 pb-1">4. Avaliação do Serviço Prestado</h4>
                  <p className="text-[10px] text-slate-500 mb-2">Estas notas irão compor automaticamente o <strong>Quality Score</strong> da empresa homologada no sistema.</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { key: 'qualidade_servicos', label: 'Qualidade Técnica do Serviço' },
                      { key: 'cumprimento_prazos', label: 'Cumprimento de Prazos' },
                      { key: 'organizacao', label: 'Organização e Limpeza' },
                      { key: 'atendimento', label: 'Atendimento ao Cliente' },
                      { key: 'pos_venda', label: 'Pós-Venda / Suporte' },
                      { key: 'feedback_clientes', label: 'Feedback Final do Cliente' }
                    ].map(metric => (
                      <div key={metric.key} className="space-y-1 bg-white p-3 rounded-lg border border-slate-200 shadow-sm flex flex-col justify-between">
                        <label className="text-[10px] font-bold text-slate-600">{metric.label}</label>
                        <select
                          required={editingTracking.etapa === 'finalizado'}
                          value={editingTracking.avaliacao?.[metric.key as keyof typeof editingTracking.avaliacao] || 0}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setEditingTracking({
                              ...editingTracking,
                              avaliacao: {
                                ...(editingTracking.avaliacao || {}),
                                [metric.key]: val
                              }
                            });
                          }}
                          className="w-full text-xs px-2 py-1.5 border border-slate-200 rounded focus:outline-none focus:border-brand-emerald bg-slate-50"
                        >
                          <option value={0}>Selecione uma nota...</option>
                          <option value={1}>⭐ 1 - Muito Ruim</option>
                          <option value={2}>⭐⭐ 2 - Ruim</option>
                          <option value={3}>⭐⭐⭐ 3 - Regular</option>
                          <option value={4}>⭐⭐⭐⭐ 4 - Bom</option>
                          <option value={5}>⭐⭐⭐⭐⭐ 5 - Excelente</option>
                        </select>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </form>

            {/* Footer Modal */}
            <div className="p-6 border-t border-slate-200 bg-slate-50 flex justify-end gap-3 flex-shrink-0">
              <button 
                type="button" 
                onClick={() => setIsEditModalOpen(false)}
                className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer"
              >
                Cancelar
              </button>
              <button 
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="bg-brand-emerald hover:bg-emerald-600 disabled:bg-slate-300 text-white font-bold px-5 py-2.5 rounded-lg text-xs flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                {saving ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Check className="w-3.5 h-3.5" />
                )}
                Salvar Acompanhamento
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL ENVIAR NOTIFICAÇÃO (FRASES PRONTAS) */}
      {isNotifyModalOpen && selectedTracking && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-xl w-full overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
            {/* Header Modal */}
            <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-brand-emerald/10 text-brand-emerald rounded-lg">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Enviar Notificação (Frases Prontas)</h3>
                  <p className="text-[11px] text-slate-500">Selecione o tipo de notificação e o destinatário.</p>
                </div>
              </div>
              <button 
                onClick={() => setIsNotifyModalOpen(false)}
                className="p-2 hover:bg-slate-200 rounded-lg text-slate-400 hover:text-slate-600 transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Configuração do Envio */}
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {/* Destinatário */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Destinatário</label>
                  <div className="flex bg-slate-100 rounded-md p-1 border border-slate-200">
                    <button
                      type="button"
                      onClick={() => handleNotifyConfigChange(msgType, 'cliente')}
                      className={`flex-1 py-1.5 rounded text-[11px] font-bold transition-all ${
                        recipient === 'cliente' 
                          ? 'bg-white text-slate-800 shadow-sm' 
                          : 'text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      Cliente
                    </button>
                    <button
                      type="button"
                      onClick={() => handleNotifyConfigChange(msgType, 'empresa')}
                      className={`flex-1 py-1.5 rounded text-[11px] font-bold transition-all ${
                        recipient === 'empresa' 
                          ? 'bg-white text-slate-800 shadow-sm' 
                          : 'text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      Empresa
                    </button>
                  </div>
                </div>

                {/* Tipo de Mensagem */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Objetivo da Frase</label>
                  <select
                    value={msgType}
                    onChange={(e) => handleNotifyConfigChange(e.target.value as any, recipient)}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-md bg-white focus:outline-none focus:border-brand-emerald cursor-pointer"
                  >
                    <option value="avisar_etapa">Avisar Etapa Atual</option>
                    <option value="cobrar">Cobrar Etapa / Alerta</option>
                    <option value="avisar_conclusao">Avisar Finalização</option>
                    <option value="feedback">Feedback de Finalização</option>
                  </select>
                </div>
              </div>

              {/* Informações do Destinatário */}
              <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl space-y-1">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Informações de Contato</span>
                {recipient === 'cliente' ? (
                  <div className="text-xs space-y-0.5 text-slate-600">
                    <p className="font-bold text-slate-800">Cliente: {selectedTracking.cliente_nome}</p>
                    <p>WhatsApp: {selectedTracking.cliente_whatsapp}</p>
                    {selectedTracking.cliente_email && <p>E-mail: {selectedTracking.cliente_email}</p>}
                  </div>
                ) : (
                  <div className="text-xs space-y-0.5 text-slate-600">
                    <p className="font-bold text-slate-800">Empresa: {selectedTracking.empresa_nome}</p>
                    {selectedTracking.empresa_whatsapp ? (
                      <p>WhatsApp: {selectedTracking.empresa_whatsapp}</p>
                    ) : (
                      <p className="text-red-500 font-semibold">⚠️ WhatsApp não cadastrado para a empresa</p>
                    )}
                    {selectedTracking.empresa_email && <p>E-mail: {selectedTracking.empresa_email}</p>}
                  </div>
                )}
              </div>

              {/* Pré-visualização da Mensagem */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase block">Texto da Mensagem (Editável)</label>
                <textarea
                  value={customMsgText}
                  onChange={(e) => setCustomMsgText(e.target.value)}
                  className="w-full text-xs p-3 border border-slate-200 rounded-xl focus:outline-none focus:border-brand-emerald min-h-[140px] leading-relaxed"
                  placeholder="Escreva a mensagem..."
                />
              </div>
            </div>

            {/* Footer Modal */}
            <div className="p-6 border-t border-slate-200 bg-slate-50 flex flex-wrap justify-between items-center gap-3">
              <button 
                type="button" 
                onClick={() => setIsNotifyModalOpen(false)}
                className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer"
              >
                Fechar
              </button>

              <div className="flex gap-2">
                <button 
                  type="button"
                  onClick={sendEmail}
                  className="bg-blue-500 hover:bg-blue-600 text-white font-bold px-4 py-2 rounded-lg text-xs flex items-center gap-1.5 cursor-pointer shadow-sm shadow-blue-500/10"
                >
                  <Mail className="w-4 h-4" /> Enviar por E-mail
                </button>
                <button 
                  type="button"
                  onClick={sendWhatsApp}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-4 py-2 rounded-lg text-xs flex items-center gap-1.5 cursor-pointer shadow-sm shadow-emerald-500/10"
                >
                  <MessageCircle className="w-4 h-4" /> Enviar por WhatsApp
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL CONFIGURAR FRASES PRONTAS */}
      {isTemplatesModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
            {/* Header Modal */}
            <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-brand-emerald/10 text-brand-emerald rounded-lg">
                  <Settings className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 font-montserrat uppercase tracking-tight">Configurar Frases Prontas</h3>
                  <p className="text-[11px] text-slate-500">Personalize os modelos de mensagens disparados pelo sistema.</p>
                </div>
              </div>
              <button 
                onClick={() => setIsTemplatesModalOpen(false)}
                className="p-2 hover:bg-slate-200 rounded-lg text-slate-400 hover:text-slate-600 transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-2">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Placeholders Disponíveis</span>
                <p className="text-[10px] text-slate-600 leading-relaxed">
                  Utilize as tags abaixo para que o sistema substitua automaticamente pelos dados do serviço:
                </p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold font-mono bg-white border border-slate-200 text-slate-700 select-all">{`{cliente}`}</span>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold font-mono bg-white border border-slate-200 text-slate-700 select-all">{`{servico}`}</span>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold font-mono bg-white border border-slate-200 text-slate-700 select-all">{`{empresa}`}</span>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold font-mono bg-white border border-slate-200 text-slate-700 select-all">{`{etapa}`}</span>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold font-mono bg-white border border-slate-200 text-slate-700 select-all">{`{responsavel}`}</span>
                </div>
              </div>

              <div className="space-y-4">
                {/* Avisar Etapa */}
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Avisar Avanço de Etapa (Cliente)</label>
                  <textarea
                    value={editingTemplates.avisar_etapa}
                    onChange={(e) => setEditingTemplates({ ...editingTemplates, avisar_etapa: e.target.value })}
                    className="w-full text-xs p-3 border border-slate-200 rounded-xl focus:outline-none focus:border-brand-emerald min-h-[70px] leading-relaxed"
                  />
                </div>

                {/* Cobrar Empresa */}
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Cobrar Etapa / Alerta (Empresa Parceira)</label>
                  <textarea
                    value={editingTemplates.cobrar_empresa}
                    onChange={(e) => setEditingTemplates({ ...editingTemplates, cobrar_empresa: e.target.value })}
                    className="w-full text-xs p-3 border border-slate-200 rounded-xl focus:outline-none focus:border-brand-emerald min-h-[70px] leading-relaxed"
                  />
                </div>

                {/* Cobrar Cliente */}
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Cobrar Retorno / Alerta (Cliente)</label>
                  <textarea
                    value={editingTemplates.cobrar_cliente}
                    onChange={(e) => setEditingTemplates({ ...editingTemplates, cobrar_cliente: e.target.value })}
                    className="w-full text-xs p-3 border border-slate-200 rounded-xl focus:outline-none focus:border-brand-emerald min-h-[70px] leading-relaxed"
                  />
                </div>

                {/* Avisar Conclusão */}
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Avisar Finalização (Cliente)</label>
                  <textarea
                    value={editingTemplates.avisar_conclusao}
                    onChange={(e) => setEditingTemplates({ ...editingTemplates, avisar_conclusao: e.target.value })}
                    className="w-full text-xs p-3 border border-slate-200 rounded-xl focus:outline-none focus:border-brand-emerald min-h-[70px] leading-relaxed"
                  />
                </div>

                {/* Feedback */}
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Feedback de Finalização (Cliente)</label>
                  <textarea
                    value={editingTemplates.feedback}
                    onChange={(e) => setEditingTemplates({ ...editingTemplates, feedback: e.target.value })}
                    className="w-full text-xs p-3 border border-slate-200 rounded-xl focus:outline-none focus:border-brand-emerald min-h-[70px] leading-relaxed"
                  />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-slate-200 bg-slate-50 flex justify-end gap-3 flex-shrink-0">
              <button 
                type="button" 
                onClick={() => setIsTemplatesModalOpen(false)}
                className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer"
              >
                Cancelar
              </button>
              <button 
                type="button"
                onClick={async () => {
                  try {
                    setSaving(true);
                    const res = await saveSiteSettingsAction('tracking_templates', editingTemplates);
                    if (res.success) {
                      setTemplates(editingTemplates);
                      setIsTemplatesModalOpen(false);
                      showSuccess('Frases configuradas salvas com sucesso!');
                    } else {
                      throw new Error(res.error);
                    }
                  } catch (err: any) {
                    alert(err.message || 'Erro ao salvar os modelos de mensagem.');
                  } finally {
                    setSaving(false);
                  }
                }}
                disabled={saving}
                className="bg-brand-emerald hover:bg-emerald-600 disabled:bg-slate-300 text-white font-bold px-5 py-2.5 rounded-lg text-xs flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                {saving ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Check className="w-3.5 h-3.5" />
                )}
                Salvar Frases
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
