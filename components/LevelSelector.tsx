import React from 'react';
import { ExerciseLevel } from '../types';
import { Signal, SignalHigh, SignalMedium, SignalLow } from 'lucide-react';

interface LevelSelectorProps {
  selectedLevel: ExerciseLevel | null;
  onSelect: (level: ExerciseLevel) => void;
  disabled: boolean;
}

const LevelSelector: React.FC<LevelSelectorProps> = ({ selectedLevel, onSelect, disabled }) => {
  const levels: { level: ExerciseLevel; label: string; desc: string; icon: React.ReactNode }[] = [
    { 
      level: 1, 
      label: 'Level 1', 
      desc: 'ERK: A2 / low B1',
      icon: <SignalLow size={20} />
    },
    { 
      level: 2, 
      label: 'Level 2', 
      desc: 'ERK: B1',
      icon: <SignalMedium size={20} />
    },
    { 
      level: 3, 
      label: 'Level 3', 
      desc: 'ERK: B1+ / low B2',
      icon: <SignalHigh size={20} />
    },
  ];

  return (
    <div className="w-full">
      <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Select Exercise Difficulty</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {levels.map((lvl) => (
          <button
            key={lvl.level}
            onClick={() => onSelect(lvl.level)}
            disabled={disabled}
            className={`
              relative p-4 rounded-lg border-2 text-left transition-all
              ${selectedLevel === lvl.level 
                ? 'border-blue-600 bg-blue-50 ring-1 ring-blue-600' 
                : 'border-slate-200 bg-white hover:border-blue-300 hover:bg-slate-50'}
              ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            <div className={`mb-2 ${selectedLevel === lvl.level ? 'text-blue-600' : 'text-slate-400'}`}>
              {lvl.icon}
            </div>
            <div className="font-bold text-slate-800">{lvl.label}</div>
            <div className="text-sm text-slate-500">{lvl.desc}</div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default LevelSelector;