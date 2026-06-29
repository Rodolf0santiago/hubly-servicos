-- Migração SQL: Criação de Tabelas Relacionais e Integridade Referencial

-- 1. Criar Tabela de Empresas Homologadas
CREATE TABLE IF NOT EXISTS public.companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    nome_fantasia VARCHAR(255) NOT NULL,
    razao_social VARCHAR(255),
    cnpj VARCHAR(20),
    email VARCHAR(255),
    telefone VARCHAR(50),
    whatsapp VARCHAR(50),
    cidade VARCHAR(100) NOT NULL,
    estado VARCHAR(2) NOT NULL,
    endereco TEXT,
    responsavel_nome VARCHAR(255),
    status VARCHAR(50) NOT NULL DEFAULT 'Pendente' CHECK (status IN ('Ativo', 'Inativo', 'Pendente', 'Bloqueado')),
    servicos TEXT[] DEFAULT '{}',
    score INTEGER NOT NULL DEFAULT 0,
    rating NUMERIC(3, 2) NOT NULL DEFAULT 0.00,
    projetos_concluidos INTEGER NOT NULL DEFAULT 0,
    observacoes TEXT,
    logo_url TEXT,
    metricas JSONB DEFAULT '{}'::jsonb
);

COMMENT ON TABLE public.companies IS 'Tabela que armazena os dados das empresas homologadas (tenants).';

-- Criar índices de performance para a tabela de empresas
CREATE INDEX IF NOT EXISTS companies_status_idx ON public.companies(status);
CREATE INDEX IF NOT EXISTS companies_cidade_idx ON public.companies(cidade, estado);

-- Habilitar RLS para a tabela de empresas
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS para a tabela de empresas
CREATE POLICY "Permitir leitura pública de empresas" ON public.companies
    FOR SELECT TO public
    USING (true);

CREATE POLICY "Permitir escrita total apenas para autenticados/admin" ON public.companies
    FOR ALL TO authenticated
    USING (true)
    WITH CHECK (true);


-- 2. Garantir que a tabela de Leads possui as colunas adicionais e chaves estrangeiras
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS projeto_solar_etapa VARCHAR(100);
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS solar_kwp NUMERIC(12, 2);
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS solar_inversor VARCHAR(100);
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS solar_paineis INTEGER;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS solar_protocolo VARCHAR(100);
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS solar_prazo_etapa DATE;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS solar_pendencia TEXT;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS empresa_executora_id UUID;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS avaliacao_parceiro JSONB DEFAULT '{}'::jsonb;

-- Adicionar chave estrangeira física na tabela de leads apontando para empresas
ALTER TABLE public.leads 
    DROP CONSTRAINT IF EXISTS fk_leads_empresa_executora,
    ADD CONSTRAINT fk_leads_empresa_executora 
    FOREIGN KEY (empresa_executora_id) 
    REFERENCES public.companies(id) 
    ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS leads_empresa_executora_idx ON public.leads(empresa_executora_id);


-- 3. Criar Tabela de Acompanhamentos de Serviços (Service Trackings)
CREATE TABLE IF NOT EXISTS public.service_trackings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    lead_id UUID,
    cliente_nome VARCHAR(255) NOT NULL,
    cliente_whatsapp VARCHAR(50) NOT NULL,
    cliente_email VARCHAR(255),
    servico VARCHAR(100) NOT NULL,
    empresa_id UUID NOT NULL,
    empresa_nome VARCHAR(255) NOT NULL,
    empresa_whatsapp VARCHAR(50),
    empresa_email VARCHAR(255),
    etapa VARCHAR(50) NOT NULL CHECK (etapa IN ('analise_tecnica', 'orcamento', 'agendamento', 'execucao', 'vistoria', 'finalizado')),
    data_inicio DATE,
    data_previsao DATE,
    observacoes TEXT,
    avaliacao JSONB DEFAULT '{}'::jsonb,
    etapas_dados JSONB DEFAULT '{}'::jsonb,
    score_global_projeto INTEGER DEFAULT 0,
    dias_totais_atraso INTEGER DEFAULT 0,
    status_projeto VARCHAR(20) DEFAULT 'em_dia' CHECK (status_projeto IN ('em_dia', 'atrasado', 'concluido')),
    valor_projeto NUMERIC(12, 2) DEFAULT 0.00,

    CONSTRAINT fk_trackings_lead FOREIGN KEY (lead_id) REFERENCES public.leads(id) ON DELETE SET NULL,
    CONSTRAINT fk_trackings_empresa FOREIGN KEY (empresa_id) REFERENCES public.companies(id) ON DELETE CASCADE
);

COMMENT ON TABLE public.service_trackings IS 'Tabela que armazena os detalhes das etapas de execução de cada projeto atribuído a uma empresa.';

-- Criar índices de performance para acompanhamentos
CREATE INDEX IF NOT EXISTS service_trackings_empresa_idx ON public.service_trackings(empresa_id);
CREATE INDEX IF NOT EXISTS service_trackings_lead_idx ON public.service_trackings(lead_id);
CREATE INDEX IF NOT EXISTS service_trackings_status_idx ON public.service_trackings(status_projeto);

-- Habilitar RLS para acompanhamentos
ALTER TABLE public.service_trackings ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS para acompanhamentos
CREATE POLICY "Permitir leitura/escrita total de acompanhamentos apenas para autenticados" ON public.service_trackings
    FOR ALL TO authenticated
    USING (true)
    WITH CHECK (true);


-- 4. Adicionar chave estrangeira na tabela de Blog Posts
ALTER TABLE public.blog_posts 
    DROP CONSTRAINT IF EXISTS fk_blog_posts_company,
    ADD CONSTRAINT fk_blog_posts_company 
    FOREIGN KEY (company_id) 
    REFERENCES public.companies(id) 
    ON DELETE CASCADE;
