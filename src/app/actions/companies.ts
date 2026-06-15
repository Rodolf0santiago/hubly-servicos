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

    const leadsRes = await getLeadsAction();
    if (!leadsRes.success || !leadsRes.data) return;
    const leads = leadsRes.data.filter(l => l.empresa_executora_id === empresa_id && l.avaliacao_parceiro);

    if (leads.length === 0) return;

    let validCount = 0;
    const totals = { qs: 0, cp: 0, org: 0, att: 0, pv: 0, fc: 0 };

    leads.forEach(l => {
      const av = l.avaliacao_parceiro;
      if (av) {
        totals.qs += Number(av.qualidade_servicos) || 0;
        totals.cp += Number(av.cumprimento_prazos) || 0;
        totals.org += Number(av.organizacao) || 0;
        totals.att += Number(av.atendimento) || 0;
        totals.pv += Number(av.pos_venda) || 0;
        totals.fc += Number(av.feedback_clientes) || 0;
        validCount++;
      }
    });

    if (validCount > 0) {
      if (!company.metricas) company.metricas = {};
      const m = company.metricas;
      
      m.qualidade_servicos = Number((totals.qs / validCount).toFixed(1));
      m.cumprimento_prazos = Number((totals.cp / validCount).toFixed(1));
      m.organizacao = Number((totals.org / validCount).toFixed(1));
      m.atendimento = Number((totals.att / validCount).toFixed(1));
      m.pos_venda = Number((totals.pv / validCount).toFixed(1));
      m.feedback_clientes = Number((totals.fc / validCount).toFixed(1));

      const somaMetricas = m.qualidade_servicos + m.cumprimento_prazos + m.organizacao + m.atendimento + m.pos_venda + m.feedback_clientes;
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
      company.projetos_concluidos = validCount;

      await saveCompanyAction(company);
    }
  } catch (error) {
    console.error('Erro ao recalcular score da empresa:', error);
  }
}
