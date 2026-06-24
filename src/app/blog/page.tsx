import React from 'react';
import Link from 'next/link';
import { Home, Calendar, ArrowRight, Building, BookOpen, AlertCircle } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { getCompaniesAction } from '@/app/actions/companies';
import { getPublishedBlogPostsAction } from '@/app/actions/blog';
import Footer from '@/components/Footer';

export const revalidate = 60; // Revalidate page every 60 seconds (ISR)

interface BlogPageProps {
  searchParams: Promise<{ company?: string }>;
}

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const { company: selectedCompanyId } = await searchParams;

  // Fetch companies and published posts in parallel
  const [companiesRes, postsRes] = await Promise.all([
    getCompaniesAction(),
    getPublishedBlogPostsAction(selectedCompanyId)
  ]);

  const companies = companiesRes.success && companiesRes.data ? companiesRes.data : [];
  const posts = postsRes.success && postsRes.data ? postsRes.data : [];

  // Helper to map company name
  const getCompanyName = (companyId: string) => {
    const comp = companies.find(c => c.id === companyId);
    return comp ? comp.nome_fantasia : 'Integra Parceiro';
  };

  const getCompanyCity = (companyId: string) => {
    const comp = companies.find(c => c.id === companyId);
    return comp ? `${comp.cidade}/${comp.estado}` : '';
  };

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center relative overflow-x-hidden">
      {/* Background Decor */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-brand-emerald/10 dark:bg-brand-emerald/5 blur-[120px] animate-pulse-subtle" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-500/10 dark:bg-blue-600/5 blur-[120px] animate-pulse-subtle" style={{ animationDelay: '1.5s' }} />
      </div>

      {/* Header */}
      <header className="absolute top-0 w-full px-6 py-6 md:px-12 md:py-8 flex justify-between items-center z-50">
        <Link href="/" className="flex items-center group cursor-pointer">
          <img src="/images/logo.png" alt="Integra Soluções SC" className="h-[4.5rem] sm:h-20 md:h-24 lg:h-28 w-auto object-contain drop-shadow-md transition-transform duration-500 group-hover:scale-105 dark:invert dark:hue-rotate-180" />
        </Link>
        <div className="flex items-center gap-2 md:gap-4 bg-white/40 dark:bg-slate-900/40 backdrop-blur-md px-3 py-2 md:px-5 md:py-2.5 rounded-full border border-slate-200/50 dark:border-slate-800/50">
          <Link href="/" className="flex items-center gap-1.5 md:gap-2 px-3 py-1.5 md:px-4 md:py-2 bg-brand-emerald/10 hover:bg-brand-emerald/20 text-brand-emerald dark:text-emerald-400 border border-brand-emerald/20 rounded-full text-xs sm:text-sm md:text-base font-semibold whitespace-nowrap transition-all">
            <Home className="w-3.5 h-3.5 md:w-4 md:h-4" />
            Início
          </Link>
          <ThemeToggle />
        </div>
      </header>

      {/* Hero Section */}
      <section className="w-full pt-40 pb-12 md:pt-52 md:pb-16 px-6 md:px-12 max-w-[1200px] mx-auto text-center relative z-10">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-emerald/10 text-brand-emerald dark:text-emerald-400 font-semibold text-sm mb-6 border border-brand-emerald/20">
          <BookOpen className="w-4 h-4" />
          Conhecimento e Dicas
        </div>
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6 leading-tight font-montserrat text-brand-navy dark:text-white">
          Blog de Soluções &amp; Dicas
        </h1>
        <p className="text-base md:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Artigos técnicos, inovações e dicas exclusivas produzidos diretamente pelas empresas homologadas da rede Integra Soluções SC.
        </p>
      </section>

      {/* Company filter tabs */}
      {companies.length > 0 && (
        <section className="w-full max-w-[1200px] px-6 mx-auto mb-10 relative z-10">
          <div className="bg-white/50 dark:bg-slate-900/50 border border-slate-200/50 dark:border-slate-800/50 backdrop-blur-md p-4 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-4">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <Building className="w-4 h-4 text-slate-400" /> Filtrar por Empresa Parceira:
            </span>
            <div className="flex flex-wrap gap-2 justify-end w-full md:w-auto">
              <Link
                href="/blog"
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                  !selectedCompanyId
                    ? 'bg-brand-emerald text-white border-brand-emerald shadow-sm'
                    : 'bg-white dark:bg-slate-800 hover:bg-slate-100 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                }`}
              >
                Todas as Empresas
              </Link>
              {companies.map(c => (
                <Link
                  key={c.id}
                  href={`/blog?company=${c.id}`}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                    selectedCompanyId === c.id
                      ? 'bg-brand-emerald text-white border-brand-emerald shadow-sm'
                      : 'bg-white dark:bg-slate-800 hover:bg-slate-100 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {c.nome_fantasia}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Grid listing */}
      <section className="w-full max-w-[1200px] px-6 mx-auto mb-24 relative z-10 flex-1">
        {posts.length === 0 ? (
          <div className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-md border border-slate-200/50 dark:border-slate-800/50 rounded-3xl p-16 text-center text-slate-500 max-w-xl mx-auto">
            <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="font-bold text-sm text-slate-700 dark:text-slate-300">Nenhum Artigo Encontrado</h3>
            <p className="text-xs text-slate-400 mt-1">Nenhum post publicado foi encontrado para esta seleção no momento. Volte em breve!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map(post => (
              <article 
                key={post.id}
                className="group flex flex-col bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/60 dark:border-slate-800/60 shadow-lg shadow-slate-200/10 dark:shadow-black/20 hover:shadow-xl hover:border-brand-emerald/40 dark:hover:border-brand-emerald/20 transition-all duration-300 overflow-hidden"
              >
                {/* Image Cover */}
                <div className="aspect-video w-full relative overflow-hidden bg-slate-100 dark:bg-slate-800">
                  {post.cover_image_url ? (
                    <img 
                      src={post.cover_image_url} 
                      alt={post.title} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-brand-emerald/20 via-blue-500/10 to-slate-200 dark:to-slate-800 flex items-center justify-center">
                      <BookOpen className="w-12 h-12 text-brand-emerald/40" />
                    </div>
                  )}
                  <div className="absolute top-4 left-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm px-3 py-1 rounded-full border border-slate-200/50 dark:border-slate-800/50 text-[10px] font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5 text-brand-emerald" />
                    <span>{getCompanyName(post.company_id)}</span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{new Date(post.created_at).toLocaleDateString('pt-BR')}</span>
                      {getCompanyCity(post.company_id) && (
                        <>
                          <span>•</span>
                          <span>{getCompanyCity(post.company_id)}</span>
                        </>
                      )}
                    </div>
                    <h2 className="text-xl font-bold font-montserrat text-slate-900 dark:text-white leading-tight line-clamp-2 group-hover:text-brand-emerald transition-colors">
                      {post.title}
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed line-clamp-3">
                      {post.excerpt || 'Leia a notícia completa e entenda tudo sobre este tema com nossos parceiros homologados.'}
                    </p>
                  </div>

                  <div className="pt-6">
                    <Link 
                      href={`/blog/${post.slug}`}
                      className="inline-flex items-center gap-2 text-xs font-bold text-brand-emerald dark:text-emerald-400 group-hover:gap-3 transition-all"
                    >
                      Ler artigo completo
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <Footer />
    </main>
  );
}
