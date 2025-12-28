
import React, { useState, useEffect } from 'react';
import { X, ChevronRight, ChevronLeft, Zap, Terminal, Music2, Settings2 } from 'lucide-react';
import ThemedButton from '../../components/shared/ThemedButton';
import { sfx } from '../../lib/audio';
import { useLocalStorage } from '../../hooks';

interface OnboardingTourProps {
  isPyriteMode: boolean;
  lang: 'en' | 'pl';
}

const OnboardingTour: React.FC<OnboardingTourProps> = ({ isPyriteMode, lang }) => {
  const [hasSeenTour, setHasSeenTour] = useLocalStorage('pyrite_has_seen_tour_v5', false);
  const [isVisible, setIsVisible] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    // Small delay to allow UI to settle before showing tour
    if (!hasSeenTour) {
      const timer = setTimeout(() => setIsVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, [hasSeenTour]);

  if (!isVisible) return null;

  const handleClose = () => {
    setIsVisible(false);
    setHasSeenTour(true);
    sfx.play('click');
  };

  const handleNext = () => {
    if (step < STEPS.length - 1) {
      setStep(prev => prev + 1);
      sfx.play('click');
    } else {
      handleClose();
    }
  };

  const handlePrev = () => {
    if (step > 0) {
      setStep(prev => prev - 1);
      sfx.play('click');
    }
  };

  const t = TOUR_CONTENT[lang];
  const currentStep = STEPS[step];

  // Colors
  const accentColor = isPyriteMode ? 'text-purple-400' : 'text-yellow-500';
  const borderColor = isPyriteMode ? 'border-purple-500/30' : 'border-yellow-500/30';
  const bgColor = isPyriteMode ? 'bg-zinc-950/90' : 'bg-zinc-900/90';

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-500">
      <div className={`relative w-full max-w-lg ${bgColor} border ${borderColor} rounded-2xl shadow-2xl overflow-hidden flex flex-col`}>
        {/* Header */}
        <div className={`p-6 pb-0 flex justify-between items-start`}>
           <div className="flex items-center gap-3">
              <div className={`p-3 rounded-xl ${isPyriteMode ? 'bg-purple-500/20' : 'bg-yellow-500/20'}`}>
                 <currentStep.icon className={`w-6 h-6 ${accentColor}`} />
              </div>
              <div>
                 <h2 className="text-xl font-bold text-white">{t[step].title}</h2>
                 <p className={`text-xs font-mono uppercase tracking-widest ${accentColor}`}>
                   Step {step + 1} / {STEPS.length}
                 </p>
              </div>
           </div>
           <button onClick={handleClose} className="text-zinc-500 hover:text-white transition-colors">
             <X className="w-5 h-5" />
           </button>
        </div>

        {/* Content */}
        <div className="p-6 text-zinc-300 text-sm leading-relaxed whitespace-pre-line min-h-[120px]">
           {t[step].desc}
        </div>

        {/* Footer / Controls */}
        <div className="p-6 pt-0 flex justify-between items-center">
           <button 
             onClick={handlePrev} 
             disabled={step === 0}
             className={`text-xs font-bold uppercase tracking-wider text-zinc-500 hover:text-white disabled:opacity-0 transition-all flex items-center`}
           >
             <ChevronLeft className="w-4 h-4 mr-1" />
             Back
           </button>

           <div className="flex gap-1.5">
              {STEPS.map((_, i) => (
                <div 
                  key={i} 
                  className={`w-2 h-2 rounded-full transition-all ${i === step ? (isPyriteMode ? 'bg-purple-500 w-4' : 'bg-yellow-500 w-4') : 'bg-zinc-700'}`} 
                />
              ))}
           </div>

           <ThemedButton 
             variant={isPyriteMode ? 'pyrite' : 'default'}
             onClick={handleNext}
             className="px-6 py-2 text-xs"
           >
             {step === STEPS.length - 1 ? (lang === 'pl' ? 'Start' : 'Begin') : (lang === 'pl' ? 'Dalej' : 'Next')}
             {step < STEPS.length - 1 && <ChevronRight className="w-4 h-4 ml-1" />}
           </ThemedButton>
        </div>

        {/* Pyrite Glitch Decor */}
        {isPyriteMode && <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 opacity-50" />}
      </div>
    </div>
  );
};

const STEPS = [
  { id: 'welcome', icon: Zap },
  { id: 'modes', icon: Settings2 },
  { id: 'expert', icon: Terminal },
  { id: 'generate', icon: Music2 },
];

const TOUR_CONTENT = {
  en: [
    {
      title: "Welcome to Sonic Forge V5",
      desc: "You have accessed the advanced prompt engineering terminal for Suno V4.5.\n\nThis tool uses Gemini AI to research, reason, and architect professional-grade music prompts that adhere to strict structural rules."
    },
    {
      title: "Select Your Mode",
      desc: "**Custom Mode**: Full control. You provide the lyrics (or let AI write them) and the concept.\n\n**ReMi Logic**: Toggle this in Custom Mode for more creative, 'unhinged' lyrics that prioritize melodic coherence over rigid rhymes.\n\n**Instrumental Mode**: Optimizes tags for non-vocal tracks, ensuring the AI focuses on texture and atmosphere."
    },
    {
      title: "Expert Protocol",
      desc: "Toggle **Expert Mode** to access the Structure Builder.\n\nHere you can drag-and-drop song sections (Verse, Chorus, Drop), apply specific modifiers, and lock in global variables like BPM and Era."
    },
    {
      title: "Initiate Sequence",
      desc: "When ready, click **INITIATE SEQUENCE**.\n\nThe AI will perform a 'Deep Reasoning' pass to plan the song's narrative arc before generating the final JSON output.\n\nCopy the result directly into Suno."
    }
  ],
  pl: [
    {
      title: "Witaj w Sonicznej Kuźni V5",
      desc: "Uzyskałeś dostęp do zaawansowanego terminala inżynierii promptów dla Suno V4.5.\n\nTo narzędzie wykorzystuje Gemini AI do badania, rozumowania i projektowania profesjonalnych promptów muzycznych, które przestrzegają ścisłych reguł strukturalnych."
    },
    {
      title: "Wybierz Tryb",
      desc: "**Tryb Własny**: Pełna kontrola. Dostarczasz tekst (lub pozwalasz AI go napisać) i koncept.\n\n**Logika ReMi**: Włącz to w Trybie Własnym, aby uzyskać bardziej kreatywne, 'odważne' teksty, stawiające na spójność melodyczną.\n\n**Tryb Instrumentalny**: Optymalizuje tagi dla utworów bez wokalu, zapewniając, że AI skupi się na teksturze i atmosferze."
    },
    {
      title: "Protokół Ekspert",
      desc: "Włącz **Tryb Eksperta**, aby uzyskać dostęp do Kreatora Struktury.\n\nTutaj możesz przeciągać i upuszczać sekcje utworu (Zwrotka, Refren, Drop), stosować konkretne modyfikatory i blokować zmienne globalne, takie jak BPM i Era."
    },
    {
      title: "Rozpocznij Sekwencję",
      desc: "Gdy będziesz gotowy, kliknij **ROZPOCZNIJ SEKWENCJĘ**.\n\nAI przeprowadzi 'Głębokie Rozumowanie', aby zaplanować narrację utworu przed wygenerowaniem ostatecznego wyniku JSON.\n\nSkopiuj wynik bezpośrednio do Suno."
    }
  ]
};

export default OnboardingTour;
