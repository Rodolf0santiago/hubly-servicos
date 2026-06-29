"use server";

import { supabaseAdmin } from '@/lib/supabase-admin';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth-token';
import { Company, ServiceTracking } from '@/types';

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

export interface MigrationReport {
  success: boolean;
  companiesMigrated: number;
  companiesErrors: string[];
  trackingsMigrated: number;
  trackingsErrors: string[];
  generalError?: string;
}

/**
 * Migra os dados estruturados em JSON do site_settings para as novas tabelas relacionais.
 */
export async function runDataMigrationAction(): Promise<MigrationReport> {
  const report: MigrationReport = {
    success: false,
    companiesMigrated: 0,
    companiesErrors: [],
    trackingsMigrated: 0,
    trackingsErrors: [],
  };

  try {
    const isAuthenticated = await verifyAdminSession();
    if (!isAuthenticated) {
      report.generalError = 'Acesso não autorizado.';
      return report;
    }

    console.log('Starting data migration from JSON to relational tables...');

    // 1. CARREGAR E MIGRAR EMPRESAS
    const { data: companiesData, error: companiesFetchError } = await supabaseAdmin
      .from('site_settings')
      .select('value')
      .eq('key', 'companies')
      .maybeSingle();

    if (companiesFetchError) {
      throw new Error(`Erro ao buscar empresas do site_settings: ${companiesFetchError.message}`);
    }

    const companiesList: Company[] = companiesData?.value ? (companiesData.value as Company[]) : [];
    console.log(`Found ${companiesList.length} companies to migrate.`);

    for (const company of companiesList) {
      try {
        // Garantir que campos obrigatórios existam
        if (!company.id || !company.nome_fantasia || !company.cidade || !company.estado) {
          report.companiesErrors.push(`Empresa inválida (dados ausentes): ${JSON.stringify(company)}`);
          continue;
        }

        const { error: insertError } = await supabaseAdmin
          .from('companies')
          .upsert({
            id: company.id,
            created_at: company.created_at || new Date().toISOString(),
            nome_fantasia: company.nome_fantasia,
            razao_social: company.razao_social || null,
            cnpj: company.cnpj || null,
            email: company.email || null,
            telefone: company.telefone || null,
            whatsapp: company.whatsapp || null,
            cidade: company.cidade,
            estado: company.estado,
            endereco: company.endereco || null,
            responsavel_nome: company.responsavel_nome || null,
            status: company.status || 'Pendente',
            servicos: company.servicos || [],
            score: company.score || 0,
            rating: company.rating || 0.0,
            projetos_concluidos: company.projetos_concluidos || 0,
            observacoes: company.observacoes || null,
            logo_url: company.logo_url || null,
            metricas: company.metricas || {},
          });

        if (insertError) {
          report.companiesErrors.push(`Erro ao inserir empresa ${company.nome_fantasia}: ${insertError.message}`);
        } else {
          report.companiesMigrated++;
        }
      } catch (err: any) {
        report.companiesErrors.push(`Exceção na empresa ${company.nome_fantasia || 'Desconhecida'}: ${err.message}`);
      }
    }

    // 2. CARREGAR E MIGRAR ACOMPANHAMENTOS (SERVICE TRACKINGS)
    const { data: trackingsData, error: trackingsFetchError } = await supabaseAdmin
      .from('site_settings')
      .select('value')
      .eq('key', 'service_trackings')
      .maybeSingle();

    if (trackingsFetchError) {
      throw new Error(`Erro ao buscar acompanhamentos do site_settings: ${trackingsFetchError.message}`);
    }

    const trackingsList: ServiceTracking[] = trackingsData?.value ? (trackingsData.value as ServiceTracking[]) : [];
    console.log(`Found ${trackingsList.length} service trackings to migrate.`);

    // Buscar IDs de leads válidos para evitar erro de integridade referencial (FK)
    const { data: validLeads, error: leadsFetchError } = await supabaseAdmin
      .from('leads')
      .select('id');
    
    const validLeadIds = new Set((validLeads || []).map(l => l.id));

    for (const tracking of trackingsList) {
      try {
        if (!tracking.id || !tracking.cliente_nome || !tracking.empresa_id) {
          report.trackingsErrors.push(`Acompanhamento inválido (dados ausentes): ${JSON.stringify(tracking)}`);
          continue;
        }

        // Validar lead_id
        let targetLeadId = tracking.lead_id;
        if (targetLeadId && !validLeadIds.has(targetLeadId)) {
          console.warn(`Lead ID ${targetLeadId} não encontrado no banco. Definindo como NULL no acompanhamento ${tracking.id}`);
          targetLeadId = undefined; // Será inserido como NULL
        }

        const { error: insertError } = await supabaseAdmin
          .from('service_trackings')
          .upsert({
            id: tracking.id,
            created_at: tracking.created_at || new Date().toISOString(),
            lead_id: targetLeadId || null,
            cliente_nome: tracking.cliente_nome,
            cliente_whatsapp: tracking.cliente_whatsapp,
            cliente_email: tracking.cliente_email || null,
            servico: tracking.servico,
            empresa_id: tracking.empresa_id,
            empresa_nome: tracking.empresa_nome,
            empresa_whatsapp: tracking.empresa_whatsapp || null,
            empresa_email: tracking.empresa_email || null,
            etapa: tracking.etapa || 'analise_tecnica',
            data_inicio: tracking.data_inicio || null,
            data_previsao: tracking.data_previsao || null,
            observacoes: tracking.observacoes || null,
            avaliacao: tracking.avaliacao || {},
            etapas_dados: tracking.etapas_dados || {},
            score_global_projeto: tracking.score_global_projeto || 0,
            dias_totais_atraso: tracking.dias_totais_atraso || 0,
            status_projeto: tracking.status_projeto || 'em_dia',
            valor_projeto: tracking.valor_projeto || 0.0,
          });

        if (insertError) {
          report.trackingsErrors.push(`Erro ao inserir acompanhamento ${tracking.id} (Cliente: ${tracking.cliente_nome}): ${insertError.message}`);
        } else {
          report.trackingsMigrated++;
        }
      } catch (err: any) {
        report.trackingsErrors.push(`Exceção no acompanhamento ${tracking.id || 'Desconhecido'}: ${err.message}`);
      }
    }

    report.success = report.companiesErrors.length === 0 && report.trackingsErrors.length === 0;
    console.log('Migration completed. Report:', report);
    return report;

  } catch (error: any) {
    console.error('Migration failed:', error);
    report.generalError = error.message || 'Erro interno na migração.';
    return report;
  }
}
