import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { Home, Calendar, ArrowLeft, Building, BookOpen, Clock } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { getCompaniesAction } from '@/app/actions/companies';
import { getBlogPostBySlugAction } from '@/app/actions/blog';
import Footer from '@/components/Footer';

export const revalidate = 60; // Revalidate page every 60 seconds (ISR)

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const res = await getBlogPostBySlugAction(slug);
  const post = res.success ? res.data : null;

  if (!post) {
    return {
      title: 'Artigo Não Encontrado | Integra Soluções SC',
    };
  }

  return {
    title: `${post.title} | Integra Soluções SC`,
    description: post.excerpt || 'Leia este artigo completo produzido pelas empresas homologadas da rede Integra Soluções SC.',
    openGraph: {
      title: post.title,
      description: post.excerpt || '',
      images: post.cover_image_url ? [post.cover_image_url] : [],
      type: 'article',
      publishedTime: post.created_at,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt || '',
      images: post.cover_image_url ? [post.cover_image_url] : [],
    }
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;

  // Fetch both post and companies list in parallel
  const [postRes, companiesRes] = await Promise.all([
    getBlogPostBySlugAction(slug),
    getCompaniesAction()
  ]);

  const post = postRes.success ? postRes.data : null;
  const companies = companiesRes.success && companiesRes.data ? companiesRes.data : [];

  if (!post) {
    notFound();
  }

  const company = companies.find(c => c.id === post.company_id);

  // Simple reading time estimator
  const getReadingTime = (text: string) => {
    const wordsPerMinute = 200;
    const noOfWords = text.split(/\s+/).length;
    const minutes = Math.ceil(noOfWords / wordsPerMinute);
    return `${minutes} min de leitura`;
  };

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center relative overflow-x-hidden">
      {/* Background Decor */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-brand-emerald/10 dark:bg-brand-emerald/5 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-500/10 dark:bg-blue-600/5 blur-[120px]" />
      </div>

      {/* Header */}
      <header className="absolute top-0 w-full px-6 py-6 md:px-12 md:py-8 flex justify-between items-center z-50">
        <Link href="/" className="flex items-center group cursor-pointer">
          <img src="/images/logo.png" alt="Integra Soluções SC" className="h-[4.5rem] sm:h-20 md:h-24 lg:h-28 w-auto object-contain drop-shadow-md transition-transform duration-500 group-hover:scale-105 dark:invert dark:hue-rotate-180" />
        </Link>
        <div className="flex items-center gap-2 md:gap-4 bg-white/40 dark:bg-slate-900/40 backdrop-blur-md px-3 py-2 md:px-5 md:py-2.5 rounded-full border border-slate-200/50 dark:border-slate-800/50">
          <Link href="/blog" className="flex items-center gap-1.5 md:gap-2 px-3 py-1.5 md:px-4 md:py-2 bg-brand-emerald/10 hover:bg-brand-emerald/20 text-brand-emerald dark:text-emerald-400 border border-brand-emerald/20 rounded-full text-xs sm:text-sm md:text-base font-semibold whitespace-nowrap transition-all">
            <ArrowLeft className="w-3.5 h-3.5 md:w-4 md:h-4" />
            Blog
          </Link>
          <Link href="/" className="flex items-center gap-1.5 md:gap-2 px-3 py-1.5 md:px-4 md:py-2 bg-brand-emerald/10 hover:bg-brand-emerald/20 text-brand-emerald dark:text-emerald-400 border border-brand-emerald/20 rounded-full text-xs sm:text-sm md:text-base font-semibold whitespace-nowrap transition-all">
            <Home className="w-3.5 h-3.5 md:w-4 md:h-4" />
            Início
          </Link>
          <ThemeToggle />
        </div>
      </header>

      {/* Post container */}
      <article className="w-full max-w-4xl px-6 pt-36 md:pt-48 pb-24 relative z-10 flex-1">
        {/* Navigation & metadata */}
        <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <Link 
            href="/blog" 
            className="inline-flex items-center gap-2 text-slate-500 hover:text-brand-emerald transition-colors font-semibold text-sm"
          >
            <ArrowLeft className="w-4 h-4" /> Voltar ao Blog
          </Link>
          
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 font-bold uppercase tracking-wider">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {new Date(post.created_at).toLocaleDateString('pt-BR')}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {getReadingTime(post.content)}
            </span>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-3xl md:text-5xl font-black font-montserrat tracking-tight leading-tight text-brand-navy dark:text-white mb-6 uppercase">
          {post.title}
        </h1>

        {/* Excerpt */}
        {post.excerpt && (
          <p className="text-slate-600 dark:text-slate-300 text-base md:text-lg italic leading-relaxed border-l-4 border-brand-emerald pl-4 mb-8">
            {post.excerpt}
          </p>
        )}

        {/* Cover Image */}
        {post.cover_image_url && (
          <div className="w-full aspect-[21/9] rounded-3xl overflow-hidden shadow-2xl border border-white dark:border-slate-800 mb-10">
            <img 
              src={post.cover_image_url} 
              alt={post.title} 
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Dynamic HTML Content with custom styles */}
        <div 
          className="content-body text-slate-700 dark:text-slate-300 text-sm sm:text-base leading-relaxed space-y-6
                     [&>h2]:text-2xl [&>h2]:font-bold [&>h2]:font-montserrat [&>h2]:text-brand-navy [&>h2]:dark:text-white [&>h2]:mt-8 [&>h2]:mb-4
                     [&>h3]:text-xl [&>h3]:font-semibold [&>h3]:font-montserrat [&>h3]:text-brand-navy [&>h3]:dark:text-white [&>h3]:mt-6 [&>h3]:mb-3
                     [&>ul]:list-disc [&>ul]:pl-6 [&>ul]:space-y-2
                     [&>ol]:list-decimal [&>ol]:pl-6 [&>ol]:space-y-2
                     [&>a]:text-brand-emerald [&>a]:font-bold [&>a]:underline [&>a]:hover:text-emerald-600
                     [&>p]:leading-relaxed"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* Author Bio Box */}
        {company && (
          <div className="mt-16 p-6 md:p-8 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-3xl shadow-xl flex flex-col md:flex-row items-center md:items-start gap-6">
            {company.logo_url ? (
              <img 
                src={company.logo_url} 
                alt={company.nome_fantasia} 
                className="w-20 h-20 rounded-2xl object-contain bg-slate-50 p-2 border border-slate-100"
              />
            ) : (
              <div className="w-20 h-20 bg-brand-emerald/10 text-brand-emerald rounded-2xl flex items-center justify-center border border-brand-emerald/20 flex-shrink-0">
                <Building className="w-10 h-10" />
              </div>
            )}
            
            <div className="space-y-2 flex-1 text-center md:text-left">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                <h3 className="text-lg font-black uppercase text-brand-navy dark:text-white">{company.nome_fantasia}</h3>
                <span className="text-[10px] font-bold bg-brand-emerald/10 text-brand-emerald px-2 py-0.5 rounded border border-brand-emerald/20 uppercase">
                  Empresa Homologada
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Localizada em <strong>{company.cidade}/{company.estado}</strong> • Especialista em: {company.servicos?.join(', ') || 'Serviços Diversos'}
              </p>
              {company.observacoes && (
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed pt-2">
                  {company.observacoes}
                </p>
              )}
              {company.whatsapp && (
                <div className="pt-3">
                  <a 
                    href={`https://wa.me/${company.whatsapp.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:hover:bg-emerald-500/20 dark:text-emerald-400 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all"
                  >
                    Falar com a empresa no WhatsApp
                  </a>
                </div>
              )}
            </div>
          </div>
        )}
      </article>

      <Footer />
    </main>
  );
}
