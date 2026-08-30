'use client';

import { useState, useEffect } from 'react';
import { Product } from '@/types/plm';
import { useSession } from 'next-auth/react';
import { Package, Layers, Edit } from 'lucide-react';
import Link from 'next/link';

export default function InventoryPage() {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === 'ADMIN';

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/products')
      .then(r => r.json())
      .then(res => {
        if (res.success) setProducts(res.data);
        setLoading(false);
      });
  }, []);

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-zinc-100 p-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-border pb-4 gap-4">
        <div>
          <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Package className="w-6 h-6 text-primary" />
            Controle de Estoque
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Visualize o saldo de produtos e variações em pronta-entrega.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map(product => {
          const totalStock = product.sizes?.reduce((acc, s) => acc + (s.quantityStock || 0), 0) || 0;
          const isLowStock = totalStock > 0 && totalStock <= 5;
          const isOutOfStock = totalStock === 0;

          return (
            <div key={product.id} className="bg-card border border-border rounded-xl p-4 shadow-sm flex flex-col gap-3">
              <div className="flex justify-between items-start">
                <div className="flex gap-3 items-center">
                  <div className="w-12 h-12 rounded-lg bg-secondary/50 overflow-hidden flex items-center justify-center shrink-0 border border-border">
                    {product.coverImageUrl ? (
                      <img src={product.coverImageUrl} className="w-full h-full object-cover" alt="" />
                    ) : (
                      <Layers className="w-5 h-5 text-zinc-500" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-foreground line-clamp-1">{product.name}</h3>
                    <p className="text-[10px] text-muted-foreground uppercase">{product.category}</p>
                  </div>
                </div>
                {isAdmin && (
                  <Link href={`/products/${product.id}`} className="text-muted-foreground hover:text-primary transition" title="Editar no Módulo de Produtos">
                    <Edit className="w-4 h-4" />
                  </Link>
                )}
              </div>

              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                  isOutOfStock ? 'bg-red-500/10 text-red-400 border-red-500/20' : 
                  isLowStock ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 
                  'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                }`}>
                  {isOutOfStock ? 'SEM ESTOQUE' : isLowStock ? 'ESTOQUE BAIXO' : 'EM ESTOQUE'}
                </span>
                <span className="text-xs font-mono font-bold">{totalStock} peças</span>
              </div>

              <div className="mt-2 pt-3 border-t border-border/50 grid grid-cols-4 gap-2">
                {product.sizes?.map(size => (
                  <div key={size.id} className="text-center bg-secondary/20 rounded p-1.5 border border-border/30">
                    <div className="text-[9px] text-zinc-400 font-bold mb-0.5">{size.sizeName}</div>
                    <div className={`text-xs font-mono font-bold ${size.quantityStock === 0 ? 'text-zinc-500' : 'text-white'}`}>
                      {size.quantityStock}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
