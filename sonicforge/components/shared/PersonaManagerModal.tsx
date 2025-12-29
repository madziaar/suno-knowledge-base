
import React, { useState, useRef, useMemo } from 'react';
import { BookOpen, X, Trash2, Edit2, Check, Save, Download, Upload, UserPlus, Search, ShieldCheck, Ghost, Flame, Terminal } from 'lucide-react';
import { Persona } from '../../types';
import GlassPanel from './GlassPanel';
import ThemedButton from './ThemedButton';
import { cn } from '../../lib/utils';
import { usePersonas } from '../../hooks/usePersonas';
import { sfx } from '../../lib/audio';
import { useSettingsState } from '../../contexts/SettingsContext';
import { translations } from '../../translations';

interface PersonaManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  // Fix: Added missing onLoad prop definition
  onLoad: (prompt: string) => void;
}

// Fix: Destructured onLoad from props
const PersonaManagerModal: React.FC<PersonaManagerModalProps> = ({ isOpen, onClose, onLoad }) => {
  const { personas, deletePersona, updatePersona, savePersona, exportPersonas, importPersonas } = usePersonas();
  const { isOverclockedMode: isPyriteMode, lang } = useSettingsState();
  const t = translations[lang].builder;
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editPrompt, setEditPrompt] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredPersonas = useMemo(() => {
    const lower = searchTerm.toLowerCase();
    return personas.filter(p => 
      p.name.toLowerCase().includes(lower) || 
      p.prompt.toLowerCase().includes(lower)
    );
  }, [personas, searchTerm]);

  if (!isOpen) return null;

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
      if (success) sfx.play('success');
      else sfx.play('error');
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const activeColor = isPyriteMode ? 'text-purple-400' : 'text-yellow-500';

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in">
      <GlassPanel variant={isPyriteMode ? 'pyrite' : 'default'} className="w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden shadow-2xl p-0 border-white/5 bg-zinc-950/50">
        
        <header className="p-5 border-b border-white/10 flex justify-between items-center bg-zinc-900/50 shrink-0">
          <div className="flex items-center gap-3">
              <div className={cn("p-2 rounded-xl bg-white/5", activeColor)}>
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm md:text-base font-extrabold uppercase tracking-widest text-white/90">
                    {t.expert.personaLibrary || "Persona Library"}
                </h3>
                <p className="text-[10px] text-zinc-500 font-mono tracking-tighter uppercase">NEURAL_ID_ARCHIVE_V7</p>
              </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={exportPersonas} className="p-2 hover:bg-white/5 rounded-lg text-zinc-400 transition-all hover:text-white" title="Export Identity Set">
                <Download className="w-5 h-5" />
            </button>
            <button onClick={() => fileInputRef.current?.click()} className="p-2 hover:bg-white/5 rounded-lg text-zinc-400 transition-all hover:text-white" title="Import Identity Set">
                <Upload className="w-5 h-5" />
            </button>
            <input type="file" ref={fileInputRef} onChange={handleImport} accept=".json" className="hidden" />
            <div className="w-px h-6 bg-white/10 mx-2" />
            <button onClick={onClose} className="p-2 hover:text-white text-zinc-500 transition-colors">
                <X className="w-6 h-6" />
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
            {/* Sidebar List */}
            <div className="w-full md:w-80 border-r border-white/5 overflow-hidden flex flex-col bg-black/20">
                <div className="p-4 border-b border-white/5">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
                        <input 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Filter codenames..."
                            className="w-full bg-black/60 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-white outline-none focus:border-white/30 transition-all font-mono"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    <button 
                        onClick={handleStartCreate}
                        className={cn(
                            "w-full text-left p-4 border-b border-white/5 transition-all group flex items-center gap-3",
                            isCreating ? "bg-white/5" : "hover:bg-white/[0.02]"
                        )}
                    >
                        <div className={cn("p-1.5 rounded-md bg-white/5", isCreating ? activeColor : "text-zinc-600 group-hover:text-zinc-400")}>
                            <UserPlus className="w-4 h-4" />
                        </div>
                        <span className={cn("text-xs font-bold uppercase tracking-wider", isCreating ? "text-white" : "text-zinc-500 group-hover:text-zinc-400")}>
                            Forge New identity
                        </span>
                    </button>

                    {personas.length === 0 ? (
                        <div className="p-12 text-center text-zinc-600 text-[10px] flex flex-col items-center gap-4 uppercase tracking-widest">
                            <Ghost className="w-8 h-8 opacity-20" />
                            No Identities Stored
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
                                <span className={cn("text-xs font-bold truncate pr-4 uppercase tracking-wider", editingId === p.id ? activeColor : "text-zinc-300")}>
                                    {p.name}
                                </span>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                                    <span onClick={(e) => { e.stopPropagation(); onLoad(p.prompt); }} className="p-1 hover:text-green-400 text-zinc-600" title="Sync Agent">
                                        <Check className="w-3.5 h-3.5" />
                                    </span>
                                    <span onClick={(e) => { e.stopPropagation(); deletePersona(p.id); sfx.play('error'); }} className="p-1 hover:text-red-400 text-zinc-600" title="Purge Identity">
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </span>
                                </div>
                            </div>
                            <p className="text-[10px] text-zinc-500 font-mono line-clamp-1 opacity-60">
                                {p.prompt.substring(0, 50)}...
                            </p>
                            {editingId === p.id && <div className={cn("absolute left-0 top-0 bottom-0 w-1", isPyriteMode ? "bg-purple-500" : "bg-yellow-500")} />}
                        </button>
                    ))}
                </div>
            </div>

            {/* Editor Area */}
            <div className="flex-1 p-8 bg-zinc-950/30 overflow-y-auto custom-scrollbar flex flex-col">
                {(editingId || isCreating) ? (
                    <div className="max-w-2xl mx-auto w-full space-y-8 animate-in fade-in slide-in-from-right-4">
                        <div className="flex items-center gap-4">
                            <div className={cn("p-4 rounded-2xl bg-white/5 border border-white/10", activeColor)}>
                                {isCreating ? <Flame className="w-8 h-8" /> : <Terminal className="w-8 h-8" />}
                            </div>
                            <div>
                                <h4 className="text-xl font-black uppercase tracking-tight text-white">
                                    {isCreating ? 'Identity Synthesis' : 'Behavioral Modification'}
                                </h4>
                                <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
                                    Protocol: {isCreating ? 'New_Node' : editingId?.substring(0, 8)}
                                </p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] mb-3 block">Agent Codename</label>
                                <input 
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                    placeholder="e.g. JAZZ_PHILOSOPHER"
                                    className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-white/30 transition-all font-bold tracking-wide"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] mb-3 block">Instruction Matrix (System Prompt)</label>
                                <textarea 
                                    value={editPrompt}
                                    onChange={(e) => setEditPrompt(e.target.value)}
                                    placeholder="Define the behavior, tone, and technical biases of this specialized intelligence..."
                                    className="w-full h-80 bg-black/60 border border-white/10 rounded-xl px-4 py-4 text-xs md:text-sm text-zinc-300 font-mono outline-none focus:border-white/30 transition-all resize-none leading-relaxed"
                                />
                            </div>
                        </div>

                        <div className="flex justify-between items-center pt-6 border-t border-white/5">
                            <button 
                                onClick={() => { setEditingId(null); setIsCreating(false); }}
                                className="text-[10px] font-bold text-zinc-600 hover:text-white uppercase tracking-widest transition-colors"
                            >
                                Discard Changes
                            </button>
                            <div className="flex gap-4">
                                <ThemedButton 
                                    onClick={() => onLoad(editPrompt)}
                                    variant="zinc"
                                    className="px-6 py-2.5 text-xs"
                                >
                                    Test Logic
                                </ThemedButton>
                                <ThemedButton 
                                    onClick={handleSave}
                                    disabled={!editName.trim() || !editPrompt.trim()}
                                    variant={isPyriteMode ? 'pyrite' : 'default'}
                                    className="px-10 py-2.5 text-xs"
                                    icon={<Save className="w-4 h-4" />}
                                >
                                    Commit to Archive
                                </ThemedButton>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto space-y-6 opacity-60">
                        <div className="relative">
                            <div className="p-10 rounded-full bg-white/5 relative z-10">
                                <ShieldCheck className="w-16 h-16 text-zinc-700" />
                            </div>
                            <div className="absolute inset-0 rounded-full border-2 border-dashed border-white/5 animate-[spin_20s_linear_infinite]" />
                        </div>
                        <div className="space-y-2">
                            <h4 className="text-xl font-bold text-zinc-400 uppercase tracking-tighter">Archive Standby</h4>
                            <p className="text-xs text-zinc-500 leading-relaxed font-mono">
                                Select an identity from the left terminal to modify its parameters, or initiate a new synthesis node.
                            </p>
                        </div>
                        <ThemedButton 
                            onClick={handleStartCreate}
                            variant="zinc"
                            className="px-8 py-2 text-[10px]"
                        >
                            Synthesize New Identity
                        </ThemedButton>
                    </div>
                )}
            </div>
        </div>
      </GlassPanel>
    </div>
  );
};

export default PersonaManagerModal;
