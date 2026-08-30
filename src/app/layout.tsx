import type { Metadata } from 'next';
import './globals.css';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';

export const metadata: Metadata = {
  title: 'NEXUS PLM - Plataforma de Gestão de Ciclo de Vida de Produtos',
  description: 'Plataforma executiva full-stack para gestão de Hardware, Firmware, Software e IoT.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className="dark">
      <body className="flex h-screen bg-background text-foreground overflow-hidden font-sans">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto p-6 bg-slate-900/50">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
