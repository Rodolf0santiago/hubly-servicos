"use client";

import React, { useMemo } from 'react';
import { Company } from '@/types';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell,
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
import { Award, ShieldCheck, CheckCircle, TrendingUp, Users, Clock, ClipboardList, AlertTriangle, Building } from 'lucide-react';

interface Props {
  companies: Company[];
}

export default function AdminCompaniesDashboard({ companies }: Props) {
  // Cálculo de estatísticas globais
  const stats = useMemo(() => {
    const total = companies.length;
    const active = companies.filter(c => c.status === 'Ativo').length;
    
    let sumScore = 0;
    let sumRating = 0;
    let totalProjects = 0;
    
    // Contagem de checklists (somente empresas ativas)
    const checklist = {
      experiencia: 0,
      regularidade: 0,
      tecnica: 0,
      operacional: 0,
      comprometimento: 0
    };

    // Médias de Radar (0-5)
    const radarSums = {
      qualidade_servicos: 0,
      cumprimento_prazos: 0,
      organizacao: 0,
      atendimento: 0,
      pos_venda: 0,
      feedback_clientes: 0
    };

    let companiesWithMetrics = 0;

    // Métricas do CRM
    let totalCrmProjectsActive = 0;
    let totalCrmProjectsDelayed = 0;
    let totalCrmProjectsCompleted = 0;
    let sumCrmSla = 0;
    let crmSlaCount = 0;
    let sumCrmQuality = 0;
    let crmQualityCount = 0;

    const stageCrmSums = {
      analise: 0, countAnalise: 0,
      orcamento: 0, countOrcamento: 0,
      agendamento: 0, countAgendamento: 0,
      execucao: 0, countExecucao: 0,
      vistoria: 0, countVistoria: 0,
    };

    companies.forEach(c => {
      sumScore += c.score || 0;
      sumRating += c.rating || 0;
      totalProjects += c.projetos_concluidos || 0;

      if (c.status === 'Ativo' && c.metricas) {
        if (c.metricas.experiencia_comprovada) checklist.experiencia++;
        if (c.metricas.regularidade_empresarial) checklist.regularidade++;
        if (c.metricas.qualificacao_tecnica) checklist.tecnica++;
        if (c.metricas.capacidade_operacional) checklist.operacional++;
        if (c.metricas.comprometimento_qualidade) checklist.comprometimento++;
        
        radarSums.qualidade_servicos += c.metricas.qualidade_servicos || 0;
        radarSums.cumprimento_prazos += c.metricas.cumprimento_prazos || 0;
        radarSums.organizacao += c.metricas.organizacao || 0;
        radarSums.atendimento += c.metricas.atendimento || 0;
        radarSums.pos_venda += c.metricas.pos_venda || 0;
        radarSums.feedback_clientes += c.metricas.feedback_clientes || 0;
        companiesWithMetrics++;

        // CRM stats
        if (typeof c.metricas.crm_sla_medio === 'number') {
          sumCrmSla += c.metricas.crm_sla_medio;
          crmSlaCount++;
        }
        if (typeof c.metricas.crm_qualidade_media === 'number') {
          sumCrmQuality += c.metricas.crm_qualidade_media;
          crmQualityCount++;
        }
        totalCrmProjectsActive += c.metricas.crm_projetos_ativos || 0;
        totalCrmProjectsDelayed += c.metricas.crm_projetos_atrasados || 0;
        totalCrmProjectsCompleted += c.metricas.crm_projetos_concluidos || 0;

        if (typeof c.metricas.crm_media_etapa_analise === 'number') {
          stageCrmSums.analise += c.metricas.crm_media_etapa_analise;
          stageCrmSums.countAnalise++;
        }
        if (typeof c.metricas.crm_media_etapa_orcamento === 'number') {
          stageCrmSums.orcamento += c.metricas.crm_media_etapa_orcamento;
          stageCrmSums.countOrcamento++;
        }
        if (typeof c.metricas.crm_media_etapa_agendamento === 'number') {
          stageCrmSums.agendamento += c.metricas.crm_media_etapa_agendamento;
          stageCrmSums.countAgendamento++;
        }
        if (typeof c.metricas.crm_media_etapa_execucao === 'number') {
          stageCrmSums.execucao += c.metricas.crm_media_etapa_execucao;
          stageCrmSums.countExecucao++;
        }
        if (typeof c.metricas.crm_media_etapa_vistoria === 'number') {
          stageCrmSums.vistoria += c.metricas.crm_media_etapa_vistoria;
          stageCrmSums.countVistoria++;
        }
      }
    });

    const avgScore = total > 0 ? (sumScore / total).toFixed(1) : '0';
    const avgRating = total > 0 ? (sumRating / total).toFixed(1) : '0';
    
    const div = companiesWithMetrics || 1; // evitar divisão por zero

    const radarData = [
      { subject: 'Qualidade', A: Number((radarSums.qualidade_servicos / div).toFixed(1)), fullMark: 5 },
      { subject: 'Prazos', A: Number((radarSums.cumprimento_prazos / div).toFixed(1)), fullMark: 5 },
      { subject: 'Organização', A: Number((radarSums.organizacao / div).toFixed(1)), fullMark: 5 },
      { subject: 'Atendimento', A: Number((radarSums.atendimento / div).toFixed(1)), fullMark: 5 },
      { subject: 'Pós-Venda', A: Number((radarSums.pos_venda / div).toFixed(1)), fullMark: 5 },
      { subject: 'Feedback', A: Number((radarSums.feedback_clientes / div).toFixed(1)), fullMark: 5 },
    ];

    const checklistData = [
      { name: 'Exp. Comprovada', count: checklist.experiencia },
      { name: 'Reg. Empresarial', count: checklist.regularidade },
      { name: 'Qualificação Téc.', count: checklist.tecnica },
      { name: 'Cap. Operacional', count: checklist.operacional },
      { name: 'Comprometimento', count: checklist.comprometimento },
    ];

    const avgCrmSla = crmSlaCount > 0 ? Math.round(sumCrmSla / crmSlaCount) : 100;
    const avgCrmQuality = crmQualityCount > 0 ? Number((sumCrmQuality / crmQualityCount).toFixed(1)) : 5.0;

    const crmStagesChartData = [
      { name: 'Análise', nota: stageCrmSums.countAnalise > 0 ? Number((stageCrmSums.analise / stageCrmSums.countAnalise).toFixed(1)) : 5.0 },
      { name: 'Orçamento', nota: stageCrmSums.countOrcamento > 0 ? Number((stageCrmSums.orcamento / stageCrmSums.countOrcamento).toFixed(1)) : 5.0 },
      { name: 'Agendamento', nota: stageCrmSums.countAgendamento > 0 ? Number((stageCrmSums.agendamento / stageCrmSums.countAgendamento).toFixed(1)) : 5.0 },
      { name: 'Execução', nota: stageCrmSums.countExecucao > 0 ? Number((stageCrmSums.execucao / stageCrmSums.countExecucao).toFixed(1)) : 5.0 },
      { name: 'Vistoria', nota: stageCrmSums.countVistoria > 0 ? Number((stageCrmSums.vistoria / stageCrmSums.countVistoria).toFixed(1)) : 5.0 },
    ];

    // Ranking de empresas por SLA
    const sortedCrmRanking = [...companies]
      .filter(c => c.status === 'Ativo' && typeof c.metricas?.crm_sla_medio === 'number')
      .sort((a, b) => (b.metricas?.crm_sla_medio || 0) - (a.metricas?.crm_sla_medio || 0))
      .slice(0, 5);

    return { 
      total, 
      active, 
      avgScore, 
      avgRating, 
      totalProjects, 
      radarData, 
      checklistData, 
      companiesWithMetrics,
      totalCrmProjectsActive,
      totalCrmProjectsDelayed,
      totalCrmProjectsCompleted,
      avgCrmSla,
      avgCrmQuality,
      crmStagesChartData,
      sortedCrmRanking
    };
  }, [companies]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Resumo Global (Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Empresas Homologadas</p>
            <p className="text-2xl font-black text-slate-800">{stats.active} <span className="text-sm font-normal text-slate-400">/ {stats.total} total</span></p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Quality Score Médio</p>
            <p className="text-2xl font-black text-slate-800">{stats.avgScore} <span className="text-sm font-normal text-slate-400">pts</span></p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Avaliação Média</p>
            <p className="text-2xl font-black text-slate-800">{stats.avgRating} <span className="text-sm font-normal text-slate-400">/ 5.0</span></p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-500 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Projetos Entregues</p>
            <p className="text-2xl font-black text-slate-800">{stats.totalProjects}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Gráfico Radar - Desempenho */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="mb-6">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Mapeamento de Qualidade da Rede</h3>
            <p className="text-xs text-slate-500 mt-1">Média das avaliações (0 a 5) em todos os indicadores para as empresas ativas ({stats.companiesWithMetrics} auditadas).</p>
          </div>
          
          <div className="w-full h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={stats.radarData}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 11, fontWeight: 'bold' }} />
                <PolarRadiusAxis angle={30} domain={[0, 5]} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <Radar name="Média da Rede" dataKey="A" stroke="#10B981" fill="#10B981" fillOpacity={0.4} />
                <Tooltip 
                  formatter={(value) => [`${value} / 5.0`, 'Média']}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfico de Barras - Checklist */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="mb-6">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Adesão aos Requisitos de Homologação</h3>
            <p className="text-xs text-slate-500 mt-1">Total de empresas ativas que cumprem cada um dos critérios estabelecidos.</p>
          </div>

          <div className="w-full h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.checklistData} layout="vertical" margin={{ top: 0, right: 30, left: 20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11, fontWeight: 'bold' }} width={110} />
                <Tooltip 
                  formatter={(value) => [`${value} empresas`, 'Aprovadas']}
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]}>
                  {
                    stats.checklistData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#3b82f6' : '#0ea5e9'} />
                    ))
                  }
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Seção CRM - Métricas de Acompanhamento */}
      <div className="border-t border-slate-200/80 pt-6 space-y-4">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
          <div>
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Acompanhamento e Performance de Serviços (CRM)</h3>
            <p className="text-xs text-slate-500">Indicadores gerenciais integrados das etapas ativas e do SLA de entrega.</p>
          </div>
        </div>

        {/* Cards de CRM */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
              stats.avgCrmSla >= 90 ? 'bg-emerald-50 text-emerald-600' : stats.avgCrmSla >= 70 ? 'bg-amber-50 text-amber-500' : 'bg-red-50 text-red-600'
            }`}>
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">SLA Médio da Rede</p>
              <p className="text-2xl font-black text-slate-800">{stats.avgCrmSla}%</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Qualidade Média CRM</p>
              <p className="text-2xl font-black text-slate-800">{stats.avgCrmQuality} <span className="text-sm font-normal text-slate-400">/ 5.0</span></p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-500 flex items-center justify-center">
              <ClipboardList className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Projetos Ativos CRM</p>
              <p className="text-2xl font-black text-slate-800">{stats.totalCrmProjectsActive}</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
              stats.totalCrmProjectsDelayed > 0 ? 'bg-red-50 text-red-500 animate-pulse' : 'bg-slate-50 text-slate-400'
            }`}>
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Projetos Atrasados</p>
              <p className={`text-2xl font-black ${stats.totalCrmProjectsDelayed > 0 ? 'text-red-500' : 'text-slate-800'}`}>
                {stats.totalCrmProjectsDelayed}
              </p>
            </div>
          </div>
        </div>

        {/* Gráfico CRM e Ranking */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Gráfico Barras CRM */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div className="mb-6">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Qualidade por Etapa (CRM)</h3>
              <p className="text-xs text-slate-500 mt-1">Média das avaliações manuais (0 a 5) em cada etapa do projeto nas empresas homologadas.</p>
            </div>

            <div className="w-full h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.crmStagesChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11, fontWeight: 'bold' }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 5]} tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip 
                    formatter={(value) => [`⭐ ${value} / 5.0`, 'Nota Média']}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="nota" fill="#10B981" radius={[4, 4, 0, 0]} barSize={40}>
                    {stats.crmStagesChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.nota >= 4.0 ? '#10B981' : entry.nota >= 3.0 ? '#3b82f6' : '#ef4444'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Ranking de Empresas por Cumprimento de SLA */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div className="mb-4">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Top 5 Parceiros em SLA</h3>
              <p className="text-xs text-slate-500 mt-1">Empresas homologadas ativas com maior taxa de cumprimento de prazos no CRM.</p>
            </div>

            {stats.sortedCrmRanking.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs italic">
                Nenhum dado de SLA disponível.
              </div>
            ) : (
              <div className="divide-y divide-slate-100 flex-1 flex flex-col justify-center">
                {stats.sortedCrmRanking.map((comp, idx) => (
                  <div key={comp.id} className="py-2.5 flex items-center justify-between text-xs hover:bg-slate-50/40 px-1 rounded transition-colors">
                    <div className="flex items-center gap-2.5">
                      <span className="font-bold text-slate-400 w-4">{idx + 1}.</span>
                      <div className="w-7 h-7 bg-slate-50 border border-slate-200 rounded flex items-center justify-center overflow-hidden p-0.5">
                        {comp.logo_url ? (
                          <img src={comp.logo_url} alt={comp.nome_fantasia} className="w-full h-full object-contain" />
                        ) : (
                          <Building className="w-4 h-4 text-slate-400" />
                        )}
                      </div>
                      <div>
                        <span className="font-bold text-slate-800 block leading-tight">{comp.nome_fantasia}</span>
                        <span className="text-[9px] text-slate-400">{comp.metricas?.crm_projetos_concluidos || 0} concluídos • {comp.metricas?.crm_projetos_ativos || 0} ativos</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider border ${
                        (comp.metricas?.crm_sla_medio || 0) >= 90 
                          ? 'bg-emerald-50 text-emerald-600 border-emerald-200' 
                          : (comp.metricas?.crm_sla_medio || 0) >= 70 
                            ? 'bg-amber-50 text-amber-600 border-amber-200' 
                            : 'bg-red-50 text-red-600 border-red-200'
                      }`}>
                        SLA: {comp.metricas?.crm_sla_medio || 0}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}
