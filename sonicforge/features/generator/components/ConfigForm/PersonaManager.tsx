
import React, { useState } from 'react';
import { BookOpen, X, Trash2, Edit2, Check, Save } from 'lucide-react';
import { Persona } from '../../../../types';
import GlassPanel from '../../../../components/shared/GlassPanel';
import ThemedButton from '../../../../components/shared/ThemedButton';
import { cn } from '../../../../lib/utils';
import { usePersonas } from '../../../../hooks';
import { sfx } from '../../../../lib/audio';

interface PersonaManagerProps {
  isOpen: boolean;
  onClose: () => void;
  onLoad: (prompt: string) => void;
  isPyriteMode: boolean;
  t: any; // Using BuilderTranslation
}

const PersonaManager: React.FC<PersonaManagerProps> = ({ isOpen, onClose, onLoad, isPyriteMode, t }) => {
  const { personas, deletePersona, updatePersona } = usePersonas();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editPrompt, setEditPrompt] = useState('');

  if (!isOpen) return null;

  const handleStartEdit = (p: Persona) => {
    setEditingId(p.id);
    setEditName(p.name);
    setEditPrompt(p.prompt);
    sfx.play('click');
  };

  const handleSaveEdit = () => {
    if (editingId && editName.trim() && editPrompt.trim()) {
      updatePersona(editingId, { name: editName, prompt: editPrompt });
      setEditingId(null);
      sfx.play('success');
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    sfx.play('click');
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Delete this agent identity?")) {
        deletePersona(id);
        sfx.play('error');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
          handleSaveEdit();
      } else if (e.key === 'Escape') {
          handleCancelEdit();
      }
  };

  return (
    <div className="fixed inset-0 z-[101] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
      <GlassPanel variant={isPyriteMode ? 'pyrite' : 'default'} className="w-full max-w-lg max-h-[70vh] flex flex-col overflow-hidden shadow-2xl p-0">
        
        <header className="p-4 border-b border-white/10 flex justify-between items-center bg-white/5">
          <h3 className="text-sm font-bold uppercase tracking-widest flex items-center gap-2 text-white">
            <BookOpen className="w-4 h-4" />
            {t.expert.personaLibrary || "Persona Library"}
          </h3>
          <button onClick={onClose} className="p-1 hover:text-white text-zinc-500">
            <X className="w-5 h-5" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-3">
          {personas.length === 0 ? (
            <div className="text-center py-12 text-zinc-500 text-sm flex flex-col items-center gap-2">
              <BookOpen className="w-8 h-8 opacity-20" />
              {t.expert.noPersonas || "No personas saved yet."}
            </div>
          ) : (
            personas.map(p => (
              <div 
                key={p.id} 
                className={cn(
                  "relative group p-3 rounded-xl border transition-all duration-300",
                  editingId === p.id 
                    ? (isPyriteMode ? "bg-purple-900/20 border-purple-500/50" : "bg-zinc-800 border-yellow-500/50")
                    : "bg-white/5 border-transparent hover:border-white/10"
                )}
              >
                {editingId === p.id ? (
                  <div className="space-y-3" onKeyDown={handleKeyDown}>
                    <input 
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded px-2 py-1 text-sm font-bold text-white outline-none focus:border-white/30"
                      placeholder="Persona Name"
                      autoFocus
                    />
                    <textarea 
                      value={editPrompt}
                      onChange={(e) => setEditPrompt(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded px-2 py-1 text-xs font-mono text-zinc-300 outline-none focus:border-white/30 resize-y min-h-[80px]"
                      placeholder="Persona System Prompt..."
                    />
                    <div className="flex justify-end gap-2">
                      <button onClick={handleCancelEdit} className="p-1.5 rounded hover:bg-white/10 text-zinc-500 hover:text-zinc-300" title="Cancel (Esc)">
                        <X className="w-4 h-4" />
                      </button>
                      <button onClick={handleSaveEdit} className={cn("p-1.5 rounded text-white", isPyriteMode ? "bg-purple-600 hover:bg-purple-500" : "bg-yellow-600 hover:bg-yellow-500")} title="Save (Ctrl+Enter)">
                        <Save className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1 min-w-0 cursor-pointer" onClick={() => onLoad(p.prompt)}>
                      <p className="font-bold text-sm text-zinc-200 truncate group-hover:text-white transition-colors">{p.name}</p>
                      <p className="text-xs text-zinc-500 font-mono line-clamp-2 mt-1">{p.prompt}</p>
                    </div>
                    
                    <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => onLoad(p.prompt)}
                        className="p-1.5 rounded hover:bg-white/10 text-zinc-400 hover:text-green-400"
                        title={t.history.load || "Load"}
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleStartEdit(p)}
                        className="p-1.5 rounded hover:bg-white/10 text-zinc-400 hover:text-blue-400"
                        title="Edit"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="p-1.5 rounded hover:bg-red-900/30 text-zinc-400 hover:text-red-400"
                        title={t.history.delete || "Delete"}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </GlassPanel>
    </div>
  );
};

export default PersonaManager;
