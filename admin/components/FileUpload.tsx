'use client';

import { useState, useRef, ChangeEvent } from 'react';
import { useAuth } from '@/lib/auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface FileUploadProps {
  value: string;
  onChange: (url: string) => void;
  accept?: string;
  label?: string;
}

export default function FileUpload({ value, onChange, accept = 'image/*', label = 'Image' }: FileUploadProps) {
  const { token } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const upload = async (file: File) => {
    if (!token) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch(`${API_URL}/api/v1/upload/`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (!res.ok) throw new Error('Echec upload');
      const data = await res.json();
      onChange(data.url);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erreur upload');
    } finally {
      setUploading(false);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) upload(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) upload(file);
  };

  return (
    <div>
      <label className="block text-sm text-secondary mb-1">{label}</label>
      <div
        className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${dragOver ? 'border-primary bg-primary/5' : 'border-dark-border hover:border-primary/40'}`}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
      >
        <input ref={inputRef} type="file" accept={accept} onChange={handleChange} className="hidden" />
        {uploading ? (
          <p className="text-dark-muted text-sm">Upload en cours...</p>
        ) : value ? (
          <div className="space-y-2">
            {accept.startsWith('image') && (
              <img src={value.startsWith('http') ? value : `${API_URL}${value}`} alt="" className="max-h-32 mx-auto rounded" />
            )}
            <p className="text-xs text-dark-muted truncate">{value}</p>
            <button type="button" onClick={(e) => { e.stopPropagation(); onChange(''); }} className="text-red-400 text-xs hover:underline">Supprimer</button>
          </div>
        ) : (
          <p className="text-dark-muted text-sm">Cliquer ou glisser un fichier ici</p>
        )}
      </div>
      <input
        className="input-field mt-2"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="ou coller une URL"
      />
    </div>
  );
}
