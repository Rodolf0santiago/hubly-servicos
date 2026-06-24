"use client";

import React, { useEffect, useState, useRef } from 'react';
import { BlogPost, Company } from '@/types';
import { getCompaniesAction } from '@/app/actions/companies';
import { getBlogPostsAdminAction, saveBlogPostAction, deleteBlogPostAction } from '@/app/actions/blog';
import { uploadSiteImageAction } from '@/app/actions/settings';
import { 
  BookOpen, 
  Search, 
  Plus, 
  Trash2, 
  Edit3, 
  Check, 
  Loader2, 
  X, 
  Upload, 
  Eye, 
  FileText,
  Calendar,
  AlertCircle,
  Building,
  Bold,
  Italic,
  Heading2,
  Heading3,
  Link2,
  List,
  Pilcrow
} from 'lucide-react';

export default function AdminBlog() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('');
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loadingCompanies, setLoadingCompanies] = useState(true);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'Todos' | 'Publicados' | 'Rascunhos'>('Todos');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<Omit<BlogPost, 'created_at'> | null>(null);
  
  // Ref for textarea rich text actions
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    fetchCompanies();
  }, []);

  useEffect(() => {
    if (selectedCompanyId) {
      fetchPosts(selectedCompanyId);
    } else {
      setPosts([]);
    }
  }, [selectedCompanyId]);

  const fetchCompanies = async () => {
    try {
      setLoadingCompanies(true);
      setErrorMsg('');
      const res = await getCompaniesAction();
      if (res.success && res.data) {
        setCompanies(res.data);
        if (res.data.length > 0) {
          // Select the first company by default
          setSelectedCompanyId(res.data[0].id);
        }
      } else {
        throw new Error(res.error || 'Erro ao carregar empresas.');
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg('Erro ao buscar empresas homologadas.');
    } finally {
      setLoadingCompanies(false);
    }
  };

  const fetchPosts = async (companyId: string) => {
    try {
      setLoadingPosts(true);
      setErrorMsg('');
      const res = await getBlogPostsAdminAction(companyId);
      if (res.success && res.data) {
        setPosts(res.data);
      } else {
        throw new Error(res.error || 'Erro ao carregar posts.');
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg('Erro ao buscar posts da empresa.');
    } finally {
      setLoadingPosts(false);
    }
  };

  const handleOpenCreate = () => {
    if (!selectedCompanyId) {
      alert('Por favor, selecione uma empresa primeiro.');
      return;
    }
    setEditingPost({
      id: '',
      company_id: selectedCompanyId,
      title: '',
      slug: '',
      excerpt: '',
      content: '',
      cover_image_url: '',
      is_published: false
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (post: BlogPost) => {
    setEditingPost({
      id: post.id,
      company_id: post.company_id,
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt || '',
      content: post.content,
      cover_image_url: post.cover_image_url || '',
      is_published: post.is_published,
      author_id: post.author_id
    });
    setIsModalOpen(true);
  };

  const handleDeletePost = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir permanentemente este post?')) {
      return;
    }

    try {
      setErrorMsg('');
      const res = await deleteBlogPostAction(id);
      if (res.success) {
        setSuccessMsg('Post excluído com sucesso!');
        setTimeout(() => setSuccessMsg(''), 3000);
        fetchPosts(selectedCompanyId);
      } else {
        throw new Error(res.error || 'Erro ao deletar post.');
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Erro ao excluir post.');
    }
  };

  // Helper to generate URL slug from title
  const generateSlug = (text: string) => {
    return text
      .toString()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove acentos
      .replace(/\s+/g, '-')           // Substitui espaços por -
      .replace(/[^\w\-]+/g, '')       // Remove caracteres especiais
      .replace(/\-\-+/g, '-')         // Evita múltiplos -
      .replace(/^-+/, '')             // Remove - no início
      .replace(/-+$/, '');            // Remove - no fim
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!editingPost) return;
    const title = e.target.value;
    // Auto-generate slug if it's a new post or if the slug matches the old title
    const slug = generateSlug(title);
    setEditingPost({
      ...editingPost,
      title,
      slug
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingPost) return;

    try {
      setUploadingImage(true);
      setErrorMsg('');
      
      const formData = new FormData();
      formData.append('file', file);
      
      const res = await uploadSiteImageAction(formData);
      if (res.success && res.url) {
        setEditingPost({
          ...editingPost,
          cover_image_url: res.url
        });
        setSuccessMsg('Imagem carregada com sucesso!');
        setTimeout(() => setSuccessMsg(''), 3000);
      } else {
        throw new Error(res.error || 'Erro ao fazer o upload da imagem.');
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Falha ao carregar a imagem.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPost) return;

    try {
      setSaving(true);
      setErrorMsg('');

      const res = await saveBlogPostAction(editingPost);
      if (res.success) {
        setSuccessMsg('Post salvo com sucesso!');
        setTimeout(() => setSuccessMsg(''), 3000);
        setIsModalOpen(false);
        setEditingPost(null);
        fetchPosts(selectedCompanyId);
      } else {
        throw new Error(res.error || 'Erro ao salvar o post.');
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Falha ao salvar o post.');
    } finally {
      setSaving(false);
    }
  };

  // Helper insertion for Rich Text Editor simples
  const insertTag = (tagOpen: string, tagClose: string) => {
    const textarea = textareaRef.current;
    if (!textarea || !editingPost) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selected = text.substring(start, end);
    const replacement = tagOpen + selected + tagClose;

    const newContent = text.substring(0, start) + replacement + text.substring(end);
    
    setEditingPost({
      ...editingPost,
      content: newContent
    });

    // Reset cursor position
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + tagOpen.length, start + tagOpen.length + selected.length);
    }, 50);
  };

  // Filters
  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (post.excerpt && post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()));
    
    if (statusFilter === 'Publicados') {
      return matchesSearch && post.is_published;
    } else if (statusFilter === 'Rascunhos') {
      return matchesSearch && !post.is_published;
    }
    return matchesSearch;
  });

  const selectedCompany = companies.find(c => c.id === selectedCompanyId);

  return (
    <div className="space-y-6">
      {/* Mensagens de Feedback */}
      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-300">
          <Check className="w-4 h-4 text-emerald-600" /> {successMsg}
        </div>
      )}
      {errorMsg && (
        <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-xl text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-300">
          <AlertCircle className="w-4 h-4 text-red-600" /> {errorMsg}
        </div>
      )}

      {/* Select Company Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="w-10 h-10 bg-brand-emerald/10 text-brand-emerald rounded-lg flex items-center justify-center">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-black text-slate-800 uppercase tracking-tight">Gerenciador de Blog Multi-tenant</h2>
            <p className="text-[11px] text-slate-500">Selecione a empresa parceira para editar ou criar notícias exclusivas.</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg w-full md:w-64">
            <Building className="w-4 h-4 text-slate-400" />
            {loadingCompanies ? (
              <span className="text-xs text-slate-400">Carregando...</span>
            ) : (
              <select 
                value={selectedCompanyId} 
                onChange={(e) => setSelectedCompanyId(e.target.value)}
                className="bg-transparent text-xs font-bold text-slate-700 outline-none w-full cursor-pointer"
              >
                <option value="">Selecione uma empresa...</option>
                {companies.map(c => (
                  <option key={c.id} value={c.id}>{c.nome_fantasia} ({c.cidade}/{c.estado})</option>
                ))}
              </select>
            )}
          </div>
          <button 
            onClick={handleOpenCreate} 
            disabled={!selectedCompanyId}
            className="w-full md:w-auto bg-brand-emerald text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-emerald-600 transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Novo Post
          </button>
        </div>
      </div>

      {/* Main List */}
      {selectedCompanyId ? (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Top filter bar */}
          <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row justify-between items-center gap-3">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input 
                type="text" 
                placeholder="Buscar notícias..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-brand-emerald bg-white text-slate-700"
              />
            </div>
            <div className="flex bg-slate-100 rounded-md p-1 border border-slate-200 text-xs font-medium w-full sm:w-auto justify-center">
              {(['Todos', 'Publicados', 'Rascunhos'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setStatusFilter(f)}
                  className={`px-3 py-1 rounded transition-all cursor-pointer ${statusFilter === f ? 'bg-white shadow-sm font-bold text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {loadingPosts ? (
            <div className="p-16 text-center text-slate-400 text-xs">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-brand-emerald" />
              Carregando posts do blog...
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="p-16 text-center text-slate-400 text-xs italic">
              Nenhuma notícia cadastrada para a empresa {selectedCompany?.nome_fantasia || ''} com esses filtros.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 text-slate-500 text-[10px] uppercase tracking-[0.1em] border-b border-slate-200">
                    <th className="px-6 py-4 font-bold">Título</th>
                    <th className="px-6 py-4 font-bold">Slug</th>
                    <th className="px-6 py-4 font-bold">Data de Criação</th>
                    <th className="px-6 py-4 font-bold">Status</th>
                    <th className="px-6 py-4 font-bold text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="text-xs divide-y divide-slate-100">
                  {filteredPosts.map((post) => (
                    <tr key={post.id} className="hover:bg-slate-50 transition-all">
                      <td className="px-6 py-4 font-bold text-slate-900 max-w-xs truncate">
                        {post.title}
                      </td>
                      <td className="px-6 py-4 font-mono text-[10px] text-slate-500">
                        {post.slug}
                      </td>
                      <td className="px-6 py-4 text-slate-500">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{new Date(post.created_at).toLocaleDateString('pt-BR')}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                          post.is_published 
                            ? 'bg-emerald-50 text-emerald-600 border-emerald-200' 
                            : 'bg-slate-100 text-slate-500 border-slate-200'
                        }`}>
                          {post.is_published ? 'Publicado' : 'Rascunho'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleOpenEdit(post)}
                            className="p-1.5 rounded-md bg-slate-50 text-slate-600 hover:bg-slate-200 hover:text-slate-800 transition-all border border-slate-200 shadow-sm"
                            title="Editar Post"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <a 
                            href={`/blog/${post.slug}`} 
                            target="_blank" 
                            rel="noreferrer" 
                            className="p-1.5 rounded-md bg-sky-50 text-sky-600 hover:bg-sky-600 hover:text-white transition-all border border-sky-200 shadow-sm"
                            title="Visualizar Post"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </a>
                          <button
                            onClick={() => handleDeletePost(post.id)}
                            className="p-1.5 rounded-md bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-all border border-red-200 shadow-sm"
                            title="Excluir Post"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-16 text-center text-slate-500">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="font-bold text-sm text-slate-700">Selecione uma Empresa</h3>
          <p className="text-xs text-slate-400 mt-1">É necessário selecionar uma empresa para visualizar ou gerenciar posts.</p>
        </div>
      )}

      {/* Editor Modal */}
      {isModalOpen && editingPost && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleSave} className="bg-white w-full max-w-4xl rounded-xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh]">
            <div className="flex justify-between items-center p-5 border-b border-slate-100 bg-slate-50/50 flex-shrink-0">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  {editingPost.id ? 'Editar Post' : 'Criar Novo Post de Blog'}
                  <span className="text-xs font-semibold px-2 py-0.5 rounded border bg-slate-100 text-slate-500 border-slate-200">
                    {selectedCompany?.nome_fantasia || ''}
                  </span>
                </h2>
                <p className="text-xs text-slate-500 mt-1">Crie conteúdo completo para SEO e atração de leads.</p>
              </div>
              <button type="button" onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:bg-slate-100 rounded-md">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Form (2 cols) */}
              <div className="lg:col-span-2 space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Título do Post *</label>
                  <input 
                    type="text"
                    required
                    placeholder="Digite o título atrativo da notícia..."
                    value={editingPost.title}
                    onChange={handleTitleChange}
                    className="w-full py-2 px-3 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-brand-emerald text-slate-800 font-semibold bg-slate-50/50"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">URL Slug (automático e amigável) *</label>
                  <input 
                    type="text"
                    required
                    placeholder="ex: titulo-da-noticia-slug"
                    value={editingPost.slug}
                    onChange={(e) => setEditingPost({ ...editingPost, slug: generateSlug(e.target.value) })}
                    className="w-full py-2 px-3 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-brand-emerald text-slate-500 font-mono bg-slate-50/50"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Resumo / Excerpt (Aparece nos cards e busca) *</label>
                  <textarea 
                    placeholder="Um resumo de 1 ou 2 frases sobre o post..."
                    value={editingPost.excerpt}
                    onChange={(e) => setEditingPost({ ...editingPost, excerpt: e.target.value })}
                    className="w-full min-h-[60px] max-h-[100px] p-3 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-brand-emerald bg-slate-50/50 resize-none text-slate-700 font-medium"
                  />
                </div>

                {/* Editor Content */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Conteúdo Principal (Rich Text HTML) *</label>
                    
                    {/* Rich text helper bar */}
                    <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded border border-slate-200">
                      <button 
                        type="button" 
                        onClick={() => insertTag('<b>', '</b>')}
                        className="p-1 hover:bg-white rounded text-slate-600 transition-all"
                        title="Negrito"
                      >
                        <Bold className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        type="button" 
                        onClick={() => insertTag('<i>', '</i>')}
                        className="p-1 hover:bg-white rounded text-slate-600 transition-all"
                        title="Itálico"
                      >
                        <Italic className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        type="button" 
                        onClick={() => insertTag('<h2>', '</h2>')}
                        className="p-1 hover:bg-white rounded text-slate-600 transition-all"
                        title="Título H2"
                      >
                        <Heading2 className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        type="button" 
                        onClick={() => insertTag('<h3>', '</h3>')}
                        className="p-1 hover:bg-white rounded text-slate-600 transition-all"
                        title="Título H3"
                      >
                        <Heading3 className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        type="button" 
                        onClick={() => insertTag('<p>', '</p>')}
                        className="p-1 hover:bg-white rounded text-slate-600 transition-all"
                        title="Parágrafo"
                      >
                        <Pilcrow className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        type="button" 
                        onClick={() => insertTag('<ul>\n  <li>', '</li>\n</ul>')}
                        className="p-1 hover:bg-white rounded text-slate-600 transition-all"
                        title="Lista"
                      >
                        <List className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        type="button" 
                        onClick={() => {
                          const url = prompt('Digite a URL do link:');
                          if (url) {
                            insertTag(`<a href="${url}" target="_blank" class="text-brand-emerald hover:underline">`, '</a>');
                          }
                        }}
                        className="p-1 hover:bg-white rounded text-slate-600 transition-all"
                        title="Inserir Link"
                      >
                        <Link2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <textarea 
                    ref={textareaRef}
                    required
                    placeholder="Escreva a notícia aqui. Use a barra de ferramentas acima para formatar em HTML..."
                    value={editingPost.content}
                    onChange={(e) => setEditingPost({ ...editingPost, content: e.target.value })}
                    className="w-full min-h-[300px] p-4 text-xs font-mono border border-slate-200 rounded-lg focus:outline-none focus:border-brand-emerald bg-slate-50/20 text-slate-800 leading-relaxed"
                  />
                </div>
              </div>

              {/* Right Settings Panel (1 col) */}
              <div className="space-y-5 bg-slate-50 p-4 rounded-xl border border-slate-100">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest border-b border-slate-200 pb-2">Configurações do Post</h3>
                
                {/* Status selector */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Status de Publicação</label>
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 cursor-pointer bg-white px-3 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50">
                      <input 
                        type="radio" 
                        name="is_published" 
                        checked={!editingPost.is_published}
                        onChange={() => setEditingPost({ ...editingPost, is_published: false })}
                        className="text-brand-emerald focus:ring-brand-emerald"
                      />
                      Rascunho
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer bg-white px-3 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50">
                      <input 
                        type="radio" 
                        name="is_published" 
                        checked={editingPost.is_published}
                        onChange={() => setEditingPost({ ...editingPost, is_published: true })}
                        className="text-brand-emerald focus:ring-brand-emerald"
                      />
                      Publicado
                    </label>
                  </div>
                </div>

                {/* Cover Image */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Imagem de Capa</label>
                  
                  {editingPost.cover_image_url ? (
                    <div className="relative rounded-lg overflow-hidden border border-slate-200 bg-slate-100 aspect-video group">
                      <img 
                        src={editingPost.cover_image_url} 
                        alt="Imagem de Capa" 
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <button 
                          type="button" 
                          onClick={() => setEditingPost({ ...editingPost, cover_image_url: '' })}
                          className="bg-red-600 text-white p-2 rounded-full hover:bg-red-700 transition-all"
                          title="Remover Imagem"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-brand-emerald transition-colors bg-white flex flex-col items-center justify-center aspect-video cursor-pointer relative">
                      {uploadingImage ? (
                        <>
                          <Loader2 className="w-8 h-8 animate-spin text-brand-emerald mb-2" />
                          <span className="text-[10px] text-slate-400">Carregando imagem...</span>
                        </>
                      ) : (
                        <>
                          <Upload className="w-6 h-6 text-slate-400 mb-2" />
                          <span className="text-[10px] font-bold text-slate-600 block">Fazer Upload de Foto</span>
                          <span className="text-[9px] text-slate-400">Formato JPG, PNG (Max 5MB)</span>
                          <input 
                            type="file" 
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="absolute inset-0 opacity-0 cursor-pointer"
                          />
                        </>
                      )}
                    </div>
                  )}

                  <div className="mt-2">
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Ou URL Externa da Imagem</label>
                    <input 
                      type="text" 
                      placeholder="https://exemplo.com/imagem.jpg"
                      value={editingPost.cover_image_url}
                      onChange={(e) => setEditingPost({ ...editingPost, cover_image_url: e.target.value })}
                      className="w-full py-1.5 px-3 text-[10px] border border-slate-200 rounded focus:outline-none focus:border-brand-emerald font-mono bg-white"
                    />
                  </div>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-[10px] text-amber-800 leading-relaxed flex items-start gap-2">
                  <Eye className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <span>
                    <strong>Dica de SEO:</strong> Escreva um título descritivo que inclua termos chave, adicione um resumo cativante (excerpt) e estruture o conteúdo com subtítulos <code>H2</code> e <code>H3</code>.
                  </span>
                </div>
              </div>
            </div>

            <div className="p-5 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 flex-shrink-0">
              <button 
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-md transition-all cursor-pointer"
              >
                Cancelar
              </button>
              <button 
                type="submit"
                disabled={saving}
                className="px-4 py-2 text-xs font-bold text-white bg-brand-emerald hover:bg-emerald-600 rounded-md shadow-sm transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Salvando...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" /> Salvar Post
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
