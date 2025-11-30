import React, { useState, useRef } from 'react';
import { X, Languages, Info } from 'lucide-react';
import { useUiSound } from '../hooks/useUiSound';
import { ResponsivePopover } from './ResponsivePopover';

export type HelpSectionKey = 'mood' | 'vocal' | 'structure';

type HelpContent = {
  title: string;
  description: string;
  details: { label: string; text: string }[];
};

const HELP_DATA: Record<HelpSectionKey, { en: HelpContent; ar: HelpContent }> = {
  mood: {
    en: {
      title: "Mood Dynamics",
      description: "Control the emotional atmosphere and sonic character of the generation.",
      details: [
        { label: "Tone", text: "Controls the emotional color (Dark/Minor vs Bright/Major)." },
        { label: "Energy", text: "Controls intensity and density (Chill/Ambient vs Hype/Aggressive)." },
        { label: "Texture", text: "Controls audio fidelity (Clean/Hi-Fi vs Gritty/Lo-Fi)." }
      ]
    },
    ar: {
      title: "ديناميكيات المزاج",
      description: "تحكم في الجو العاطفي والطابع الصوتي للأغنية.",
      details: [
        { label: "النغمة (Tone)", text: "يتحكم في اللون العاطفي (مظلم/حزين مقابل مشرق/سعيد)." },
        { label: "الطاقة (Energy)", text: "يتحكم في الكثافة والحماس (هادئ مقابل صاخب)." },
        { label: "الملمس (Texture)", text: "يتحكم في نقاء الصوت (نقي/عالي الجودة مقابل خشن/لو-فاي)." }
      ]
    }
  },
  vocal: {
    en: {
      title: "Vocal Chain",
      description: "Define the singer's identity and processing style.",
      details: [
        { label: "Gender", text: "Select Male, Female, Duet, or Robotic AI voices." },
        { label: "Texture", text: "Vocal character (Airy, Raspy, Auto-Tuned, etc.)." },
        { label: "Language", text: "Target language for lyrics generation." }
      ]
    },
    ar: {
      title: "سلسلة الصوت",
      description: "حدد هوية المغني وأسلوب المعالجة الصوتية.",
      details: [
        { label: "الجنس (Gender)", text: "اختر صوت ذكر، أنثى، ثنائي، أو روبوت." },
        { label: "الملمس (Texture)", text: "طابع الصوت (هوائي، أجش، أوتوتيون، إلخ)." },
        { label: "اللغة (Language)", text: "اللغة المستهدفة لكتابة الكلمات." }
      ]
    }
  },
  structure: {
    en: {
      title: "Structure Engine",
      description: "Architectural layout of the song's sections.",
      details: [
        { label: "Mode", text: "Determines section layout (Verse/Chorus vs Build/Drop)." },
        { label: "Intro", text: "Adds a dedicated instrumental opening tag." },
        { label: "Radio Edit", text: "Optimizes structure for a tight <3 min duration." }
      ]
    },
    ar: {
      title: "محرك البنية",
      description: "التخطيط الهيكلي لأقسام الأغنية.",
      details: [
        { label: "النمط (Mode)", text: "يحدد ترتيب الأقسام (كوبليه/كورس مقابل بناء/دروب)." },
        { label: "مقدمة (Intro)", text: "يضيف علامة افتتاحية موسيقية." },
        { label: "نسخة راديو", text: "يحسن البنية لتكون قصيرة ومكثفة (أقل من 3 دقائق)." }
      ]
    }
  }
};

interface HelpContextProps {
  section: HelpSectionKey;
  isOpen: boolean;
  onClose: () => void;
  triggerRef: React.RefObject<HTMLElement>;
}

export const HelpButton = React.forwardRef<HTMLButtonElement, { onClick: () => void; isActive: boolean; className?: string }>(
  ({ onClick, isActive, className = '' }, ref) => (
    <button
      ref={ref}
      onClick={onClick}
      className={`p-1.5 rounded-full transition-all duration-300 hover:bg-white/10 active:scale-95 ${isActive ? 'text-indigo-400 bg-indigo-500/20 shadow-[0_0_10px_rgba(99,102,241,0.3)]' : 'text-zinc-500 hover:text-zinc-200'} ${className}`}
      title="Info & Help"
      aria-label="Toggle help"
    >
      <Info size={12} />
    </button>
  )
);

export const HelpPopup: React.FC<HelpContextProps> = ({ section, isOpen, onClose, triggerRef }) => {
  const [lang, setLang] = useState<'en' | 'ar'>('en');
  const { playClick } = useUiSound();

  const content = HELP_DATA[section][lang];
  const isArabic = lang === 'ar';

  return (
    <ResponsivePopover isOpen={isOpen} onClose={onClose} triggerRef={triggerRef}>
        {/* Header */}
        <div className={`flex items-start mb-4 border-b border-white/10 pb-3 ${isArabic ? 'flex-row-reverse' : 'flex-row'} justify-between`}>
           <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-100 mt-1 drop-shadow-sm">{content.title}</h4>
           <div className={`flex gap-2 ${isArabic ? 'flex-row-reverse' : 'flex-row'}`}>
             <button 
                 onClick={() => { playClick(); setLang(l => l === 'en' ? 'ar' : 'en'); }} 
                 className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-[10px] font-medium text-zinc-400 hover:text-indigo-300 transition-colors border border-white/5 hover:border-white/10"
             >
                <Languages size={10} />
                {lang === 'en' ? 'عربي' : 'English'}
             </button>
             <button onClick={() => { playClick(); onClose(); }} className="p-1 text-zinc-500 hover:text-red-400 transition-colors">
                <X size={16} />
             </button>
           </div>
        </div>

        {/* Body */}
        <p className={`text-[13px] text-zinc-300 leading-relaxed mb-5 ${isArabic ? 'text-right' : 'text-left'}`}>{content.description}</p>
        <div className="space-y-3">
           {content.details.map((d, i) => (
              <div key={i} className={`bg-white/[0.03] p-3 rounded-xl border border-white/5 hover:border-white/10 transition-colors ${isArabic ? 'text-right' : 'text-left'}`}>
                 <span className="block text-[10px] font-bold text-indigo-400 mb-1">{d.label}</span>
                 <span className="block text-[11px] text-zinc-400 leading-tight">{d.text}</span>
              </div>
           ))}
        </div>
    </ResponsivePopover>
  );
};