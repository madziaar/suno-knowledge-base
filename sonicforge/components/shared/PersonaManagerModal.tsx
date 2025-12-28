
import React, { useState, useRef } from 'react';
import { BookOpen, X, Trash2, Edit2, Check, Save, Download, Upload, UserPlus, Search, ShieldCheck, Ghost } from 'lucide-react';
import { Persona } from '../../types';
import GlassPanel from './GlassPanel';
import ThemedButton from './ThemedButton';
import { cn } from '../../lib/utils';
import { usePersonas } from '../../hooks';
import { sfx } from '../../lib/audio';
import { useSettingsState } from '../../contexts/SettingsContext';
import { translations } from '../../translations';

interface PersonaManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PersonaManagerModal: React.FC<PersonaManagerModalProps> = ({ isOpen, onClose }) => {
  const { personas, deletePersona, updatePersona, savePersona, exportPersonas, importPersonas } = usePersonas();
  const { isPyriteMode, lang } = useSettingsState();
  const t = translations[lang].builder;
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editPrompt, setEditPrompt] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const filteredPersonas = personas.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.prompt.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleStartCreate = () => {
      setIsCreating(true);
      setEditingId(null);
      setEditName('');
      setEditPrompt('');
      sfx.play('click');
  };

  const handleStartEdit = (p: Persona) => {
    setIsCreating(false);
    setEditingId(p.id);
    setEditName(p.name);
    setEditPrompt(p.prompt);
    sfx.play('click');
  };

  const handleSave = () => {
    if (!editName.trim() || !editPrompt.trim()) return;

    if (isCreating) {
        savePersona(editName.trim(), editPrompt.trim());
        setIsCreating(false);
    } else if (editingId) {
        updatePersona(editingId, { name: editName.trim(), prompt: editPrompt.trim() });
        setEditingId(null);
    }
    
    sfx.play('success');
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const success = await importPersonas(file);
      if (success) {
          sfx.play('success');
      } else {
          sfx.play('error');
      }
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const activeColor = isPyriteMode ? 'text-purple-400' : 'text-yellow-500';

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in">
      <GlassPanel variant={isPyriteMode ? 'pyrite' : 'default'} className="w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden shadow-2xl p-0">
        
        {/* Header */}
        <header className="p-5 border-b border-white/10 flex justify-between items-center bg-zinc-900/50 shrink-0">
          <div className="flex items-center gap-3">
              <div className={cn("p-2 rounded-xl bg-white/5", activeColor)}>
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm md:text-base font-extrabold uppercase tracking-widest text-white/90">
                    {t.expert.personaLibrary}
                </h3>
                <p className="text-[10px] text-zinc-500 font-mono tracking-tighter uppercase">AGENTIC_IDENTITY_MANAGEMENT_V5</p>
              </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={exportPersonas} className="p-2 hover:bg-white/5 rounded-lg text-zinc-400 transition-all" title="Export Personas">
                <Download className="w-5 h-5" />
            </button>
            <button onClick={() => fileInputRef.current?.click()} className="p-2 hover:bg-white/5 rounded-lg text-zinc-400 transition-all" title="Import Personas">
                <Upload className="w-5 h-5" />
            </button>
            <input type="file" ref={fileInputRef} onChange={handleImport} accept=".json" className="hidden" />
            <div className="w-px h-6 bg-white/10 mx-2" />
            <button onClick={onClose} className="p-2 hover:text-white text-zinc-500 transition-colors">
                <X className="w-6 h-6" />
            </button>
          </div>
        </header>

        {/* Toolbar */}
        <div className="px-6 py-4 border-b border-white/5 flex flex-col md:flex-row gap-4 items-center bg-black/40">
            <div className="relative flex-1 w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Filter agents..."
                    className="w-full bg-black/60 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm text-white outline-none focus:border-white/30 transition-all"
                />
            </div>
            <ThemedButton 
                onClick={handleStartCreate}
                variant={isPyriteMode ? 'pyrite' : 'default'}
                className="px-6 py-2.5 text-xs w-full md:w-auto font-extrabold"
                icon={<UserPlus className="w-4 h-4" />}
            >
                Forge New Identity
            </ThemedButton>
        </div>

        {/* List & Edit Area */}
        <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
            {/* Sidebar List */}
            <div className="w-full md:w-72 border-r border-white/5 overflow-y-auto custom-scrollbar bg-black/10">
                {personas.length === 0 ? (
                    <div className="p-12 text-center text-zinc-600 text-xs flex flex-col items-center gap-4">
                        <Ghost className="w-8 h-8 opacity-20" />
                        Awaiting creation...
                    </div>
                ) : filteredPersonas.map(p => (
                    <button
                        key={p.id}
                        onClick={() => handleStartEdit(p)}
                        className={cn(
                            "w-full text-left p-4 border-b border-white/5 transition-all group relative",
                            editingId === p.id ? "bg-white/5" : "hover:bg-white/[0.02]"
                        )}
                    >
                        <div className="flex justify-between items-start mb-1">
                            <span className={cn("text-sm font-bold truncate pr-4", editingId === p.id ? activeColor : "text-zinc-300")}>
                                {p.name}
                            </span>
                            <button 
                                onClick={(e) => { e.stopPropagation(); deletePersona(p.id); sfx.play('error'); }}
                                className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-400 text-zinc-600 transition-all"
                            >
                                <Trash2 className="w-3.5 h-3.5" />
                            </button>
                        </div>
                        <p className="text-[10px] text-zinc-500 font-mono line-clamp-2 leading-relaxed">{p.prompt}</p>
                        {editingId === p.id && <div className={cn("absolute left-0 top-0 bottom-0 w-1", isPyriteMode ? "bg-purple-500" : "bg-yellow-500")} />}
                    </button>
                ))}
            </div>

            {/* Editor Area */}
            <div className="flex-1 p-8 bg-zinc-950/30 overflow-y-auto custom-scrollbar">
                {(editingId || isCreating) ? (
                    <div className="max-w-xl mx-auto space-y-6 animate-in fade-in slide-in-from-right-4">
                        <div className="space-y-4">
                            <div>
                                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2 block">Agent Codename</label>
                                <input 
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                    placeholder="e.g. Jazz Philosopher"
                                    className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-white/30 transition-all"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2 block">Behavioral Protocol (System Prompt)</label>
                                <textarea 
                                    value={editPrompt}
                                    onChange={(e) => setEditPrompt(e.target.value)}
                                    placeholder="Describe the producer's specialized logic, creative biases, and tone..."
                                    className="w-full h-64 bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-sm text-zinc-300 font-mono outline-none focus:border-white/30 transition-all resize-none"
                                />
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                            <button 
                                onClick={() => { setEditingId(null); setIsCreating(false); }}
                                className="px-6 py-2.5 text-xs font-bold text-zinc-500 hover:text-white transition-colors"
                            >
                                Discard
                            </button>
                            <ThemedButton 
                                onClick={handleSave}
                                disabled={!editName.trim() || !editPrompt.trim()}
                                variant={isPyriteMode ? 'pyrite' : 'default'}
                                className="px-10 py-2.5 text-xs"
                                icon={<Save className="w-4 h-4" />}
                            >
                                Commit to Memory
                            </ThemedButton>
                        </div>
                    </div>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center max-w-sm mx-auto space-y-4">
                        <div className="p-8 rounded-full bg-white/5 mb-2 relative group">
                            <ShieldCheck className="w-16 h-16 text-zinc-600 group-hover:text-zinc-400 transition-colors" />
                            <div className="absolute inset-0 rounded-full border border-white/5 animate-ping opacity-20" />
                        </div>
                        <h4 className="text-xl font-bold text-zinc-300">Agent Terminal Idle</h4>
                        <p className="text-sm text-zinc-500 leading-relaxed">
                            Select an identity from the database or forge a new specialized intelligence to guide your song architecture.
                        </p>
                    </div>
                )}
            </div>
        </div>
      </GlassPanel>
    </div>
  );
};

export default PersonaManagerModal;
