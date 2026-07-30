'use client';

import { useRef, useCallback } from 'react';

interface RichEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const TOOLBAR: { cmd: string; icon: string; title: string; arg?: string }[] = [
  { cmd: 'bold', icon: 'B', title: 'Gras' },
  { cmd: 'italic', icon: 'I', title: 'Italique' },
  { cmd: 'underline', icon: 'U', title: 'Souligne' },
  { cmd: 'insertUnorderedList', icon: '•', title: 'Liste a puces' },
  { cmd: 'insertOrderedList', icon: '1.', title: 'Liste numerotee' },
  { cmd: 'formatBlock', icon: 'H2', title: 'Titre', arg: 'h2' },
  { cmd: 'formatBlock', icon: 'H3', title: 'Sous-titre', arg: 'h3' },
  { cmd: 'formatBlock', icon: 'P', title: 'Paragraphe', arg: 'p' },
  { cmd: 'createLink', icon: '🔗', title: 'Lien' },
  { cmd: 'removeFormat', icon: '✕', title: 'Supprimer le format' },
];

export default function RichEditor({ value, onChange, placeholder = 'Ecrivez ici...' }: RichEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);

  const execCmd = useCallback((cmd: string, arg?: string) => {
    if (cmd === 'createLink') {
      const url = prompt('URL du lien :');
      if (!url) return;
      document.execCommand(cmd, false, url);
    } else if (arg) {
      document.execCommand(cmd, false, arg);
    } else {
      document.execCommand(cmd, false);
    }
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  }, [onChange]);

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  return (
    <div className="border border-dark-border rounded-lg overflow-hidden">
      <div className="flex flex-wrap gap-0.5 p-2 bg-dark-lighter border-b border-dark-border">
        {TOOLBAR.map((item, i) => (
          <button
            key={i}
            type="button"
            title={item.title}
            onClick={() => execCmd(item.cmd, item.arg)}
            className="px-2.5 py-1 text-sm text-secondary hover:text-white hover:bg-dark-border rounded transition-colors font-mono"
          >
            {item.icon}
          </button>
        ))}
      </div>
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onBlur={handleInput}
        dangerouslySetInnerHTML={{ __html: value }}
        data-placeholder={placeholder}
        className="min-h-[200px] p-4 text-sm text-primary bg-dark outline-none prose prose-invert max-w-none [&:empty:before]:content-[attr(data-placeholder)] [&:empty:before]:text-dark-muted"
      />
    </div>
  );
}
