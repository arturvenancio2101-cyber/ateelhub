import React, { useRef, useState } from 'react';
import { Upload, Link as LinkIcon } from 'lucide-react';

interface ImageUploadProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
}

export function ImageUpload({ 
  value, 
  onChange, 
  label = 'Link ou Upload da Imagem',
  placeholder = 'Cole o link ou faça upload...'
}: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [processing, setProcessing] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProcessing(true);
      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 800;
          const MAX_HEIGHT = 800;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          
          // Compress to webp for smaller base64 payload
          const dataUrl = canvas.toDataURL('image/webp', 0.8);
          onChange(dataUrl);
          setProcessing(false);
          
          // Reset file input so same file can be chosen again if removed
          if (fileInputRef.current) fileInputRef.current.value = '';
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const isBase64 = value.startsWith('data:image');

  return (
    <div>
      <label className="block font-semibold mb-1 text-foreground">{label}</label>
      <div className="flex gap-2 items-center">
        <div className="relative flex-1">
          <LinkIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder={processing ? 'Processando imagem...' : placeholder}
            value={isBase64 ? 'Imagem carregada via Upload (Base64)' : value}
            onChange={(e) => {
              if (e.target.value !== 'Imagem carregada via Upload (Base64)') {
                onChange(e.target.value);
              }
            }}
            disabled={isBase64 || processing}
            className={`w-full pl-9 pr-4 py-2 rounded-lg bg-secondary border border-border text-foreground focus:ring-2 focus:ring-primary/50 focus:outline-none ${isBase64 ? 'text-primary font-semibold' : ''}`}
          />
        </div>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={processing}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-secondary border border-border text-foreground hover:bg-secondary/80 focus:ring-2 focus:ring-primary/50 focus:outline-none transition-all whitespace-nowrap disabled:opacity-50"
        >
          <Upload className="w-4 h-4" />
          <span className="hidden sm:inline text-xs font-semibold">Upload</span>
        </button>
        {value && (
          <button
            type="button"
            onClick={() => onChange('')}
            className="px-3 py-2 rounded-lg bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-all text-xs font-semibold border border-rose-500/20"
          >
            Limpar
          </button>
        )}
      </div>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />
    </div>
  );
}
