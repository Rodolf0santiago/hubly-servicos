"use server";

import { supabaseAdmin } from '@/lib/supabase-admin';
import { Company } from '@/types';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth-token';
import { revalidatePath } from 'next/cache';
import { getLeadsAction } from './leads';

async function verifyAdminSession(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('hubly_admin_auth')?.value;
    if (!token) return false;
    
    const adminPassword = process.env.ADMIN_PASSWORD || 'hublypro123';
    const payload = await verifyToken(token, adminPassword);
    return !!payload && payload.role === 'admin';
  } catch (err) {
    console.error('Error verifying admin session:', err);
    return false;
  }
}

/**
 * Fetch all homologated companies. Available publicly or for admin.
 */
export async function getCompaniesAction(): Promise<{ success: boolean; data?: Company[]; error?: string }> {
  try {
    const { data, error } = await supabaseAdmin
      .from('site_settings')
      .select('value')
      .eq('key', 'companies')
      .maybeSingle();

    if (error) {
      console.error('Error fetching companies:', error);
      throw new Error(error.message);
    }

    const list: Company[] = data ? (data.value as Company[]) : [];
    return { success: true, data: list };
  } catch (error: any) {
    return { success: false, error: error.message || 'Erro ao buscar empresas.' };
  }
}

/**
 * Creates or updates a company. Admin only.
 */
export async function saveCompanyAction(company: Company): Promise<{ success: boolean; error?: string }> {
  try {
    const isAuthenticated = await verifyAdminSession();
    if (!isAuthenticated) {
      return { success: false, error: 'Acesso não autorizado. Sessão inválida ou expirada.' };
    }

    // Load existing list
    const res = await getCompaniesAction();
    if (!res.success) {
      throw new Error(res.error || 'Erro ao carregar a lista de empresas.');
    }

    const currentList = res.data || [];
    const index = currentList.findIndex(c => c.id === company.id);

    if (index >= 0) {
      // Update
      currentList[index] = company;
    } else {
      // Insert
      currentList.push(company);
    }

    const { error } = await supabaseAdmin
      .from('site_settings')
      .upsert({ key: 'companies', value: currentList });

    if (error) {
      console.error('Error saving company:', error);
      throw new Error(error.message);
    }

    revalidatePath('/admin');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Erro ao salvar a empresa.' };
  }
}

/**
 * Deletes a company. Admin only.
 */
export async function deleteCompanyAction(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const isAuthenticated = await verifyAdminSession();
    if (!isAuthenticated) {
      return { success: false, error: 'Acesso não autorizado. Sessão inválida ou expirada.' };
    }

    // Load existing list
    const res = await getCompaniesAction();
    if (!res.success) {
      throw new Error(res.error || 'Erro ao carregar a lista de empresas.');
    }

    const currentList = (res.data || []).filter(c => c.id !== id);

    const { error } = await supabaseAdmin
      .from('site_settings')
      .update({ value: currentList })
      .eq('key', 'companies');

    if (error) {
      console.error('Error deleting company:', error);
      throw new Error(error.message);
    }

    // Cascade delete all blog posts associated with this company
    const { error: blogDeleteError } = await supabaseAdmin
      .from('blog_posts')
      .delete()
      .eq('company_id', id);

    if (blogDeleteError) {
      console.error('Error deleting company blog posts on cascade:', blogDeleteError);
    }

    revalidatePath('/admin');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Erro ao deletar a empresa.' };
  }
}

/**
 * Recalcula o Score da empresa baseando-se nas avaliações dos Leads vinculados a ela.
 */
export async function recalcularScoreEmpresa(empresa_id: string): Promise<void> {
  try {
    const res = await getCompaniesAction();
    if (!res.success || !res.data) return;
    const companies = res.data;
    const cIndex = companies.findIndex(c => c.id === empresa_id);
    if (cIndex < 0) return;
    const company = companies[cIndex];

    const trackingsRes = await supabaseAdmin
      .from('site_settings')
      .select('value')
      .eq('key', 'service_trackings')
      .maybeSingle();

    let trackings: import('@/types').ServiceTracking[] = [];
    if (trackingsRes.data && trackingsRes.data.value) {
      trackings = trackingsRes.data.value as import('@/types').ServiceTracking[];
    }

    const companyTrackings = trackings.filter(t => t.empresa_id === empresa_id);

    // Agregação de dados do CRM (ServiceTrackings)
    let totalSlaScore = 0;
    let slaCount = 0;
    let totalManualScore = 0;
    let manualCount = 0;
    let totalDelayDays = 0;
    let projectsWithDelayData = 0;
    
    let activeProjects = 0;
    let concludedProjects = 0;
    let delayedProjects = 0;

    const stagesList = ['analise_tecnica', 'orcamento', 'agendamento', 'execucao', 'vistoria'] as const;
    const stageScores = {
      analise_tecnica: { sum: 0, count: 0 },
      orcamento: { sum: 0, count: 0 },
      agendamento: { sum: 0, count: 0 },
      execucao: { sum: 0, count: 0 },
      vistoria: { sum: 0, count: 0 }
    };

    companyTrackings.forEach(t => {
      if (t.etapa === 'finalizado') {
        concludedProjects++;
      } else {
        activeProjects++;
      }

      if (t.status_projeto === 'atrasado') {
        delayedProjects++;
      }

      if (typeof t.dias_totais_atraso === 'number') {
        totalDelayDays += t.dias_totais_atraso;
        projectsWithDelayData++;
      }

      stagesList.forEach(stage => {
        const stageData = t.etapas_dados?.[stage];
        if (stageData) {
          // Automatic delay score (0 to 5)
          if (typeof stageData.pontuacao_atraso === 'number') {
            totalSlaScore += stageData.pontuacao_atraso;
            slaCount++;
          }
          // Manual score
          if (typeof stageData.pontuacao_manual === 'number' && stageData.pontuacao_manual > 0) {
            totalManualScore += stageData.pontuacao_manual;
            manualCount++;
            
            stageScores[stage].sum += stageData.pontuacao_manual;
            stageScores[stage].count++;
          }
        }
      });
    });

    const crm_sla_medio = slaCount > 0 ? Math.round((totalSlaScore / (slaCount * 5)) * 100) : 100;
    const crm_qualidade_media = manualCount > 0 ? Number((totalManualScore / manualCount).toFixed(1)) : 5.0;
    const crm_atraso_medio_dias = projectsWithDelayData > 0 ? Number((totalDelayDays / projectsWithDelayData).toFixed(1)) : 0;

    const crm_media_etapa_analise = stageScores.analise_tecnica.count > 0 ? Number((stageScores.analise_tecnica.sum / stageScores.analise_tecnica.count).toFixed(1)) : undefined;
    const crm_media_etapa_orcamento = stageScores.orcamento.count > 0 ? Number((stageScores.orcamento.sum / stageScores.orcamento.count).toFixed(1)) : undefined;
    const crm_media_etapa_agendamento = stageScores.agendamento.count > 0 ? Number((stageScores.agendamento.sum / stageScores.agendamento.count).toFixed(1)) : undefined;
    const crm_media_etapa_execucao = stageScores.execucao.count > 0 ? Number((stageScores.execucao.sum / stageScores.execucao.count).toFixed(1)) : undefined;
    const crm_media_etapa_vistoria = stageScores.vistoria.count > 0 ? Number((stageScores.vistoria.sum / stageScores.vistoria.count).toFixed(1)) : undefined;

    if (!company.metricas) {
      company.metricas = {};
    }

    company.metricas.crm_sla_medio = crm_sla_medio;
    company.metricas.crm_qualidade_media = crm_qualidade_media;
    company.metricas.crm_projetos_ativos = activeProjects;
    company.metricas.crm_projetos_atrasados = delayedProjects;
    company.metricas.crm_projetos_concluidos = concludedProjects;
    company.metricas.crm_atraso_medio_dias = crm_atraso_medio_dias;
    company.metricas.crm_media_etapa_analise = crm_media_etapa_analise;
    company.metricas.crm_media_etapa_orcamento = crm_media_etapa_orcamento;
    company.metricas.crm_media_etapa_agendamento = crm_media_etapa_agendamento;
    company.metricas.crm_media_etapa_execucao = crm_media_etapa_execucao;
    company.metricas.crm_media_etapa_vistoria = crm_media_etapa_vistoria;

    // Legado: avaliar baseando-se no 'finalizado' com avaliacao
    const legacyTrackings = companyTrackings.filter(t => t.etapa === 'finalizado' && t.avaliacao);
    let legacyCount = legacyTrackings.length;
    const legacyTotals = { qs: 0, cp: 0, org: 0, att: 0, pv: 0, fc: 0 };
    
    legacyTrackings.forEach(t => {
      const av = t.avaliacao;
      if (av) {
        legacyTotals.qs += Number(av.qualidade_servicos) || 0;
        legacyTotals.cp += Number(av.cumprimento_prazos) || 0;
        legacyTotals.org += Number(av.organizacao) || 0;
        legacyTotals.att += Number(av.atendimento) || 0;
        legacyTotals.pv += Number(av.pos_venda) || 0;
        legacyTotals.fc += Number(av.feedback_clientes) || 0;
      }
    });

    const m = company.metricas;
    
    // Atualizar os ratings legados combinando com novas médias se houver
    if (manualCount > 0) {
      const avgManual = totalManualScore / manualCount;
      const avgSla = (totalSlaScore / (slaCount || 1));
      
      m.qualidade_servicos = legacyCount > 0 
        ? Number(((legacyTotals.qs / legacyCount + avgManual) / 2).toFixed(1)) 
        : Number(avgManual.toFixed(1));
      m.cumprimento_prazos = legacyCount > 0 
        ? Number(((legacyTotals.cp / legacyCount + avgSla) / 2).toFixed(1)) 
        : Number(avgSla.toFixed(1));
      m.organizacao = legacyCount > 0 ? Number((legacyTotals.org / legacyCount).toFixed(1)) : 5.0;
      m.atendimento = legacyCount > 0 ? Number((legacyTotals.att / legacyCount).toFixed(1)) : 5.0;
      m.pos_venda = legacyCount > 0 ? Number((legacyTotals.pv / legacyCount).toFixed(1)) : 5.0;
      m.feedback_clientes = legacyCount > 0 ? Number((legacyTotals.fc / legacyCount).toFixed(1)) : 5.0;
    } else if (legacyCount > 0) {
      m.qualidade_servicos = Number((legacyTotals.qs / legacyCount).toFixed(1));
      m.cumprimento_prazos = Number((legacyTotals.cp / legacyCount).toFixed(1));
      m.organizacao = Number((legacyTotals.org / legacyCount).toFixed(1));
      m.atendimento = Number((legacyTotals.att / legacyCount).toFixed(1));
      m.pos_venda = Number((legacyTotals.pv / legacyCount).toFixed(1));
      m.feedback_clientes = Number((legacyTotals.fc / legacyCount).toFixed(1));
    } else {
      m.qualidade_servicos = 5.0;
      m.cumprimento_prazos = 5.0;
      m.organizacao = 5.0;
      m.atendimento = 5.0;
      m.pos_venda = 5.0;
      m.feedback_clientes = 5.0;
    }

    const somaMetricas = (m.qualidade_servicos || 0) + (m.cumprimento_prazos || 0) + (m.organizacao || 0) + (m.atendimento || 0) + (m.pos_venda || 0) + (m.feedback_clientes || 0);
    const mediaRadar = somaMetricas / 6;
    const radarScore = (mediaRadar / 5) * 100 * 0.7;
    
    let reqPontos = 0;
    if (m.experiencia_comprovada) reqPontos += 1;
    if (m.regularidade_empresarial) reqPontos += 1;
    if (m.qualificacao_tecnica) reqPontos += 1;
    if (m.capacidade_operacional) reqPontos += 1;
    if (m.comprometimento_qualidade) reqPontos += 1;
    
    const reqScore = (reqPontos / 5) * 100 * 0.3;
    
    company.score = Math.round(radarScore + reqScore);
    company.rating = Number(mediaRadar.toFixed(1));
    company.projetos_concluidos = concludedProjects + legacyCount;

    await saveCompanyAction(company);
  } catch (error) {
    console.error('Erro ao recalcular score da empresa:', error);
  }
}
