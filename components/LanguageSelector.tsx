import React from 'react';
import { Language } from '../types';
import { Globe } from 'lucide-react';

interface LanguageSelectorProps {
  onSelect: (language: Language) => void;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({ onSelect }) => {
  const languages: { id: Language; label: string; color: string; hover: string }[] = [
    { id: 'English', label: 'English', color: 'bg-blue-50 border-blue-200 text-blue-800', hover: 'hover:border-blue-400 hover:shadow-blue-100' },
    { id: 'French', label: 'Français', color: 'bg-indigo-50 border-indigo-200 text-indigo-800', hover: 'hover:border-indigo-400 hover:shadow-indigo-100' },
    { id: 'German', label: 'Deutsch', color: 'bg-amber-50 border-amber-200 text-amber-800', hover: 'hover:border-amber-400 hover:shadow-amber-100' },
    { id: 'Spanish', label: 'Español', color: 'bg-orange-50 border-orange-200 text-orange-800', hover: 'hover:border-orange-400 hover:shadow-orange-100' },
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-100 max-w-2xl w-full text-center">
        <div className="bg-slate-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
          <Globe size={32} className="text-slate-600" />
        </div>
        
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Welcome, Teacher</h1>
        <p className="text-slate-500 mb-8 text-lg">Choose your subject language to start finding current affairs.</p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {languages.map((lang) => (
            <button
              key={lang.id}
              onClick={() => onSelect(lang.id)}
              className={`
                ${lang.color} ${lang.hover}
                p-6 rounded-xl border-2 transition-all duration-200 
                flex flex-col items-center justify-center gap-2
                shadow-sm hover:shadow-md transform hover:-translate-y-0.5
              `}
            >
              <span className="text-xl font-bold">{lang.label}</span>
              <span className="text-xs uppercase tracking-wider opacity-70 font-semibold">{lang.id} Tutor</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LanguageSelector;
