export type LeadStatus = 'Pendente' | 'Em Atendimento' | 'Concluído' | 'Pago' | 'Perdido';

export interface Lead {
  id: string;
  created_at: string;
  nome: string;
  whatsapp: string;
  localizacao: string;
  servico: string;
  perda_estimada: number;
  status: LeadStatus;
  observacoes?: string;
  valor_fechado?: number;
  email?: string;
  cep?: string;
  concessionaria?: string;
  valor_conta?: number;
  valor_proposta?: number;
  temperatura?: 'Frio' | 'Morno' | 'Quente';
  motivo_perda?: string;
  data_proximo_contato?: string;
  origem?: string;
  projeto_solar_etapa?: string;
  solar_kwp?: number;
  solar_inversor?: string;
  solar_paineis?: number;
  solar_protocolo?: string;
  solar_prazo_etapa?: string;    // data limite da etapa atual (YYYY-MM-DD)
  solar_pendencia?: string;      // descrição de pendência ou próxima ação
  empresa_executora_id?: string; // ID da empresa homologada que executou o serviço
  avaliacao_parceiro?: {
    qualidade_servicos?: number;
    cumprimento_prazos?: number;
    organizacao?: number;
    atendimento?: number;
    pos_venda?: number;
    feedback_clientes?: number;
  };
}

export interface GaleriaItem {
  id: string;
  created_at: string;
  tipo: 'foto' | 'depoimento' | 'ambos';
  servico: string;           // 'geral' ou nome do serviço
  cliente_nome: string;
  cliente_cidade?: string;
  avaliacao: number;         // 1-5
  texto?: string;            // texto do depoimento
  foto_url?: string;         // URL externa da foto
  ativo: boolean;
}

export interface Company {
  id: string;
  created_at: string;
  nome_fantasia: string;
  razao_social?: string;
  cnpj?: string;
  email?: string;
  telefone?: string;
  whatsapp?: string;
  cidade: string;
  estado: string;
  endereco?: string;
  responsavel_nome?: string;
  status: 'Ativo' | 'Inativo' | 'Pendente' | 'Bloqueado';
  servicos: string[];
  score: number; // pontuação geral de 0 a 100
  rating: number; // avaliação por estrelas (ex: 0 a 5)
  projetos_concluidos: number;
  observacoes?: string;
  logo_url?: string;
  metricas?: {
    // Requisitos / Checklist (booleans)
    experiencia_comprovada?: boolean;
    regularidade_empresarial?: boolean;
    qualificacao_tecnica?: boolean;
    capacidade_operacional?: boolean;
    comprometimento_qualidade?: boolean;
    // Sistema de Pontuação (1 a 5 estrelas)
    qualidade_servicos?: number;
    cumprimento_prazos?: number;
    organizacao?: number;
    atendimento?: number;
    pos_venda?: number;
    feedback_clientes?: number;

    // Novas métricas agregadas do CRM
    crm_sla_medio?: number;               // 0 a 100
    crm_qualidade_media?: number;         // 0 a 5
    crm_projetos_ativos?: number;
    crm_projetos_atrasados?: number;
    crm_projetos_concluidos?: number;
    crm_atraso_medio_dias?: number;
    crm_media_etapa_analise?: number;     // 0 a 5
    crm_media_etapa_orcamento?: number;   // 0 a 5
    crm_media_etapa_agendamento?: number; // 0 a 5
    crm_media_etapa_execucao?: number;    // 0 a 5
    crm_media_etapa_vistoria?: number;    // 0 a 5
  };
}

export interface StageDetail {
  status?: 'pendente' | 'executando' | 'concluido' | 'atrasado';
  data_inicio?: string;
  data_fim?: string;
  data_previsao?: string;
  observacao?: string;
  pontuacao_manual?: number; // 0 a 5
  pontuacao_atraso?: number; // 0 a 5
  atraso_dias?: number;
}

export interface ServiceTracking {
  id: string;
  created_at: string;
  lead_id?: string;
  cliente_nome: string;
  cliente_whatsapp: string;
  cliente_email: string;
  servico: string;
  empresa_id: string;
  empresa_nome: string;
  empresa_whatsapp?: string;
  empresa_email?: string;
  etapa: 'analise_tecnica' | 'orcamento' | 'agendamento' | 'execucao' | 'vistoria' | 'finalizado';
  data_inicio?: string;
  data_previsao?: string;
  observacoes?: string;
  avaliacao?: {
    qualidade_servicos?: number;
    cumprimento_prazos?: number;
    organizacao?: number;
    atendimento?: number;
    pos_venda?: number;
    feedback_clientes?: number;
  };
  // Novos campos estruturados para acompanhamento por etapa
  etapas_dados?: {
    analise_tecnica?: StageDetail;
    orcamento?: StageDetail;
    agendamento?: StageDetail;
    execucao?: StageDetail;
    vistoria?: StageDetail;
  };
  score_global_projeto?: number;
  dias_totais_atraso?: number;
  status_projeto?: 'em_dia' | 'atrasado' | 'concluido';
  valor_projeto?: number;
}

export interface BlogPost {
  id: string;
  company_id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  cover_image_url?: string;
  is_published: boolean;
  author_id?: string;
  created_at: string;
}


