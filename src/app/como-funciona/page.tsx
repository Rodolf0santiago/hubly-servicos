import { Metadata } from 'next';
import ComoFuncionaContent from './ComoFuncionaContent';

export const metadata: Metadata = {
  title: 'Como Funciona | Integra Soluções SC',
  description: 'Entenda como a INTEGRA Soluções SC atua conectando clientes às melhores empresas parceiras com controle de qualidade, gestão e acompanhamento.',
};

export default function ComoFuncionaPage() {
  return <ComoFuncionaContent />;
}
