"use client";

import React, { useMemo } from 'react';
import { Company } from '@/types';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
import { Award, ShieldCheck, CheckCircle, TrendingUp, Users } from 'lucide-react';

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

    return { total, active, avgScore, avgRating, totalProjects, radarData, checklistData, companiesWithMetrics };
  }, [companies]);

  return (
    <div className="space-y-6">
      
      {/* Resumo Global (Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Empresas Homologadas</p>
            <p className="text-2xl font-black text-slate-800">{stats.active} <span className="text-sm font-normal text-slate-400">/ {stats.total} total</span></p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Quality Score Médio</p>
            <p className="text-2xl font-black text-slate-800">{stats.avgScore} <span className="text-sm font-normal text-slate-400">pts</span></p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Avaliação Média</p>
            <p className="text-2xl font-black text-slate-800">{stats.avgRating} <span className="text-sm font-normal text-slate-400">/ 5.0</span></p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
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
                      <cell key={`cell-${index}`} fill={index % 2 === 0 ? '#3b82f6' : '#0ea5e9'} />
                    ))
                  }
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

    </div>
  );
}
