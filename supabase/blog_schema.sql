-- Script SQL para o Módulo de Blog/Notícias Multi-tenant

-- Tabela de posts do blog
CREATE TABLE IF NOT EXISTS public.blog_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL, -- ID da empresa homologada proprietária do post
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    excerpt TEXT,
    content TEXT NOT NULL, -- Rich Text / HTML format
    cover_image_url TEXT,
    is_published BOOLEAN NOT NULL DEFAULT false,
    author_id UUID, -- Referência opcional ao auth.users do Supabase
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()

    -- NOTA DE INTEGRIDADE: Se desejar vincular fisicamente com uma tabela de empresas
    -- caso decida migrar as empresas do site_settings JSON para uma tabela própria:
    -- CONSTRAINT fk_blog_posts_company FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE
);

-- Comentários para documentação e painel do Supabase
COMMENT ON TABLE public.blog_posts IS 'Tabela que armazena os posts do blog de forma isolada por empresa (tenant).';
COMMENT ON COLUMN public.blog_posts.company_id IS 'ID da empresa vinculada a este post para garantir isolamento multi-tenant.';
COMMENT ON COLUMN public.blog_posts.content IS 'Conteúdo principal do post formatado em HTML/Texto.';

-- Índices de performance para buscas eficientes
CREATE INDEX IF NOT EXISTS blog_posts_company_id_idx ON public.blog_posts (company_id);
CREATE INDEX IF NOT EXISTS blog_posts_slug_idx ON public.blog_posts (slug);
CREATE INDEX IF NOT EXISTS blog_posts_is_published_idx ON public.blog_posts (is_published) WHERE is_published = true;

-- Habilitar Row Level Security (RLS)
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

-- Políticas de Acesso Seguro (RLS Policies)

-- 1. Qualquer visitante pode ler posts do blog desde que estejam marcados como publicados
CREATE POLICY "Permitir leitura pública de posts publicados" ON public.blog_posts
    FOR SELECT TO public
    USING (is_published = true);

-- 2. Somente administradores ou usuários autenticados do CRM podem ler/escrever todos os posts
-- Caso adicione logins individuais para cada empresa vinculados ao Supabase Auth,
-- você pode refinar esta política para verificar o meta-dado do token (JWT claim):
-- ex: USING ( (auth.jwt() -> 'user_metadata' ->> 'company_id')::uuid = company_id )
CREATE POLICY "Permitir leitura/escrita total para autenticados" ON public.blog_posts
    FOR ALL TO authenticated
    USING (true)
    WITH CHECK (true);
