"use server";

import { supabaseAdmin } from '@/lib/supabase-admin';
import { ServiceTracking } from '@/types';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth-token';
import { revalidatePath } from 'next/cache';
import { recalcularScoreEmpresa } from './companies';

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
 * Fetch all service trackings. Available for admin.
 */
export async function getTrackingsAction(): Promise<{ success: boolean; data?: ServiceTracking[]; error?: string }> {
  try {
    const { data, error } = await supabaseAdmin
      .from('service_trackings')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching trackings:', error);
      throw new Error(error.message);
    }

    return { success: true, data: data as ServiceTracking[] };
  } catch (error: any) {
    return { success: false, error: error.message || 'Erro ao buscar acompanhamentos.' };
  }
}

/**
 * Creates or updates a service tracking. Admin only.
 */
export async function saveTrackingAction(tracking: ServiceTracking): Promise<{ success: boolean; error?: string }> {
  try {
    const isAuthenticated = await verifyAdminSession();
    if (!isAuthenticated) {
      return { success: false, error: 'Acesso não autorizado. Sessão inválida ou expirada.' };
    }

    const { error } = await supabaseAdmin
      .from('service_trackings')
      .upsert({
        id: tracking.id,
        created_at: tracking.created_at || new Date().toISOString(),
        lead_id: tracking.lead_id || null,
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

    if (error) {
      console.error('Error saving tracking:', error);
      throw new Error(error.message);
    }

    // Recalcular score da empresa associada
    if (tracking.empresa_id) {
      await recalcularScoreEmpresa(tracking.empresa_id);
    }

    revalidatePath('/admin');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Erro ao salvar o acompanhamento.' };
  }
}

/**
 * Deletes a service tracking. Admin only.
 */
export async function deleteTrackingAction(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const isAuthenticated = await verifyAdminSession();
    if (!isAuthenticated) {
      return { success: false, error: 'Acesso não autorizado. Sessão inválida ou expirada.' };
    }

    // Obter a empresa vinculada a este projeto para recalcular o score
    const { data: tracking, error: fetchError } = await supabaseAdmin
      .from('service_trackings')
      .select('empresa_id')
      .eq('id', id)
      .maybeSingle();

    if (fetchError) {
      console.error('Error fetching tracking before delete:', fetchError);
    }

    const empresa_id = tracking?.empresa_id;

    // Deletar o acompanhamento
    const { error: deleteError } = await supabaseAdmin
      .from('service_trackings')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Error deleting tracking:', deleteError);
      throw new Error(deleteError.message);
    }

    // Recalcular o score da empresa parceira se ela existir
    if (empresa_id) {
      await recalcularScoreEmpresa(empresa_id);
    }

    revalidatePath('/admin');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Erro ao excluir o acompanhamento.' };
  }
}
