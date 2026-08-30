import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 text-center">
      <h1 className="text-4xl font-bold mb-4 text-amber-400">ATEEL Products Hub</h1>
      <p className="text-slate-400 mb-8 max-w-md">
        Plataforma de Gestão de Ciclo de Vida de Produtos e Integração de Pedidos.
      </p>
      <div className="flex gap-4">
        <Link 
          href="/dashboard" 
          className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-semibold px-6 py-3 rounded-lg transition-colors"
        >
          Acessar Dashboard
        </Link>
        <Link 
          href="/orders" 
          className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold px-6 py-3 rounded-lg transition-colors"
        >
          Ver Pedidos
        </Link>
      </div>
    </div>
  );
}
