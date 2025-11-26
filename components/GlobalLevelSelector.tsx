import React from 'react';
import { Language, CEFRLevel } from '../types';
import { BarChart3 } from 'lucide-react';

interface GlobalLevelSelectorProps {
  language: Language;
  onSelect: (level: CEFRLevel) => void;
}

const GlobalLevelSelector: React.FC<GlobalLevelSelectorProps> = ({ language, onSelect }) => {
  // Define levels based on language as requested
  const levels: CEFRLevel[] = language === 'English' 
    ? ['A2', 'B1', 'B2', 'C1'] 
    : ['A1', 'A2', 'B1', 'B2'];

  const getLevelDescription = (level: CEFRLevel) => {
    switch(level) {
      case 'A1': return 'Beginner (Breakthrough)';
      case 'A2': return 'Elementary (Waystage)';
      case 'B1': return 'Intermediate (Threshold)';
      case 'B2': return 'Upper Intermediate (Vantage)';
      case 'C1': return 'Advanced (Effective Proficiency)';
      default: return '';
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-100 max-w-2xl w-full text-center">
        <div className="bg-slate-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
          <BarChart3 size={32} className="text-slate-600" />
        </div>
        
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Select Proficiency Level</h1>
        <p className="text-slate-500 mb-8 text-lg">
          Choose the target CEFR level for the {language} content.
        </p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {levels.map((level) => (
            <button
              key={level}
              onClick={() => onSelect(level)}
              className="group p-6 rounded-xl border-2 border-slate-200 hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 flex flex-col items-center justify-center gap-2 shadow-sm hover:shadow-md"
            >
              <span className="text-3xl font-bold text-slate-800 group-hover:text-blue-700">{level}</span>
              <span className="text-sm font-medium text-slate-500 group-hover:text-blue-600">
                {getLevelDescription(level)}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GlobalLevelSelector;