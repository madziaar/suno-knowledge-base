import React from 'react';
import { BookOpen, X, Trash2 } from 'lucide-react';
import { Persona } from '../../../../types';
import GlassPanel from '../../../../components/shared/GlassPanel';
import ThemedButton from '../../../../components/shared/ThemedButton';
import { cn } from '../../../../lib/utils';

interface PersonaManagerProps {
  isOpen: boolean;
  onClose: () => void;
  personas: Persona[];
  onLoad: (prompt: string) => void;
  onDelete: (id: string) => void;
  isPyriteMode: boolean;
  t: any; // Using BuilderTranslation
}

const PersonaManager: React.FC<PersonaManagerProps> = ({ isOpen, onClose, personas, onLoad, onDelete, isPyriteMode, t }) => {
  if (!isOpen) return null;

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

        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          {personas.length === 0 ? (
            <div className="text-center py-12 text-zinc-500 text-sm">
              {t.expert.noPersonas || "No personas saved yet."}
            </div>
          ) : (
            <div className="space-y-2">
              {personas.map(p => (
                <div key={p.id} className="group p-3 rounded-lg bg-white/5 border border-transparent hover:border-white/10 transition-colors flex justify-between items-center">
                  <div>
                    <p className="font-bold text-sm text-zinc-200">{p.name}</p>
                    <p className="text-xs text-zinc-400 font-mono truncate max-w-xs">{p.prompt}</p>
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ThemedButton
                      variant="zinc"
                      onClick={() => onLoad(p.prompt)}
                      className="px-3 py-1 text-xs"
                    >
                      {t.history.load || "Load"}
                    </ThemedButton>
                    <button
                      onClick={() => onDelete(p.id)}
                      className="p-2 rounded-lg text-zinc-500 hover:bg-red-900/50 hover:text-red-400"
                      title={t.history.delete || "Delete"}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </GlassPanel>
    </div>
  );
};

export default PersonaManager;