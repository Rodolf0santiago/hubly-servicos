"use server";

import { supabaseAdmin } from '@/lib/supabase-admin';
import { BlogPost } from '@/types';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth-token';
import { revalidatePath } from 'next/cache';

/**
 * Helper to verify if the request is from an authenticated administrator session.
 */
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
 * Fetches all blog posts for a specific company in the CRM.
 * Admin only.
 */
export async function getBlogPostsAdminAction(companyId: string): Promise<{ success: boolean; data?: BlogPost[]; error?: string }> {
  try {
    const isAuthenticated = await verifyAdminSession();
    if (!isAuthenticated) {
      return { success: false, error: 'Acesso não autorizado. Sessão inválida ou expirada.' };
    }

    if (!companyId) {
      return { success: false, error: 'O ID da empresa é obrigatório.' };
    }

    const { data, error } = await supabaseAdmin
      .from('blog_posts')
      .select('*')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching admin blog posts:', error);
      throw new Error(error.message);
    }

    return { success: true, data: data as BlogPost[] };
  } catch (error: any) {
    return { success: false, error: error.message || 'Erro ao buscar posts de blog.' };
  }
}

/**
 * Fetches published blog posts for public website.
 * Public access. Optionally filtered by companyId.
 */
export async function getPublishedBlogPostsAction(companyId?: string): Promise<{ success: boolean; data?: BlogPost[]; error?: string }> {
  try {
    let query = supabaseAdmin
      .from('blog_posts')
      .select('*')
      .eq('is_published', true)
      .order('created_at', { ascending: false });

    if (companyId) {
      query = query.eq('company_id', companyId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching published blog posts:', error);
      throw new Error(error.message);
    }

    return { success: true, data: data as BlogPost[] };
  } catch (error: any) {
    return { success: false, error: error.message || 'Erro ao buscar posts publicados.' };
  }
}

/**
 * Fetches a single published blog post by its slug.
 * Public access.
 */
export async function getBlogPostBySlugAction(slug: string): Promise<{ success: boolean; data?: BlogPost | null; error?: string }> {
  try {
    if (!slug) {
      return { success: false, error: 'O slug do post é obrigatório.' };
    }

    const { data, error } = await supabaseAdmin
      .from('blog_posts')
      .select('*')
      .eq('slug', slug)
      .eq('is_published', true)
      .maybeSingle();

    if (error) {
      console.error('Error fetching blog post by slug:', error);
      throw new Error(error.message);
    }

    return { success: true, data: data as BlogPost | null };
  } catch (error: any) {
    return { success: false, error: error.message || 'Erro ao buscar post por slug.' };
  }
}

/**
 * Saves (inserts or updates) a blog post.
 * Admin only.
 */
export async function saveBlogPostAction(postData: Omit<BlogPost, 'created_at'>): Promise<{ success: boolean; data?: BlogPost; error?: string }> {
  try {
    const isAuthenticated = await verifyAdminSession();
    if (!isAuthenticated) {
      return { success: false, error: 'Acesso não autorizado. Sessão inválida ou expirada.' };
    }

    if (!postData.company_id) {
      return { success: false, error: 'O ID da empresa é obrigatório.' };
    }
    if (!postData.title || !postData.title.trim()) {
      return { success: false, error: 'O título é obrigatório.' };
    }
    if (!postData.slug || !postData.slug.trim()) {
      return { success: false, error: 'O slug é obrigatório.' };
    }
    if (!postData.content || !postData.content.trim()) {
      return { success: false, error: 'O conteúdo é obrigatório.' };
    }

    // Verify slug uniqueness (excluding current post if editing)
    let slugCheck = supabaseAdmin
      .from('blog_posts')
      .select('id')
      .eq('slug', postData.slug);

    if (postData.id) {
      slugCheck = slugCheck.neq('id', postData.id);
    }

    const { data: existingSlug, error: slugError } = await slugCheck.maybeSingle();

    if (slugError) {
      console.error('Error checking slug uniqueness:', slugError);
    }

    if (existingSlug) {
      return { success: false, error: 'Já existe um post publicado com este slug. Por favor, altere o título ou o slug.' };
    }

    const payload = {
      company_id: postData.company_id,
      title: postData.title,
      slug: postData.slug,
      excerpt: postData.excerpt || '',
      content: postData.content,
      cover_image_url: postData.cover_image_url || '',
      is_published: postData.is_published,
      author_id: postData.author_id || null,
    };

    let result;
    if (postData.id) {
      // Update
      const { data, error } = await supabaseAdmin
        .from('blog_posts')
        .update(payload)
        .eq('id', postData.id)
        .select()
        .single();

      if (error) throw new Error(error.message);
      result = data;
    } else {
      // Insert
      const { data, error } = await supabaseAdmin
        .from('blog_posts')
        .insert([payload])
        .select()
        .single();

      if (error) throw new Error(error.message);
      result = data;
    }

    // Revalidate public and admin blog views
    revalidatePath('/blog');
    revalidatePath(`/blog/${postData.slug}`);
    revalidatePath('/admin');

    return { success: true, data: result as BlogPost };
  } catch (error: any) {
    return { success: false, error: error.message || 'Erro ao salvar o post de blog.' };
  }
}

/**
 * Deletes a blog post by ID.
 * Admin only.
 */
export async function deleteBlogPostAction(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const isAuthenticated = await verifyAdminSession();
    if (!isAuthenticated) {
      return { success: false, error: 'Acesso não autorizado. Sessão inválida ou expirada.' };
    }

    // Fetch slug for path revalidation before deleting
    const { data: post } = await supabaseAdmin
      .from('blog_posts')
      .select('slug')
      .eq('id', id)
      .maybeSingle();

    const { error } = await supabaseAdmin
      .from('blog_posts')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting blog post:', error);
      throw new Error(error.message);
    }

    // Revalidate cache
    revalidatePath('/blog');
    if (post?.slug) {
      revalidatePath(`/blog/${post.slug}`);
    }
    revalidatePath('/admin');

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Erro ao excluir o post de blog.' };
  }
}
