import { Metadata } from 'next';
import ComoFuncionaContent from './ComoFuncionaContent';

import { getAllSiteSettingsAction } from '@/app/actions/settings';

export const metadata: Metadata = {
  title: 'Como Trabalhamos | Integra Soluções SC',
  description: 'Entenda como a INTEGRA Soluções SC atua conectando clientes às melhores empresas parceiras com controle de qualidade, gestão e acompanhamento.',
};

export default async function ComoFuncionaPage() {
  const settingsRes = await getAllSiteSettingsAction();
  const settings = settingsRes.success ? settingsRes.data : null;

  return <ComoFuncionaContent data={settings?.como_funciona} />;
}
