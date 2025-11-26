import React, { useState } from 'react';
import { Topic } from '../types';
import { Layers, CheckCircle2 } from 'lucide-react';

interface TopicSelectorProps {
  onSelect: (topics: Topic[]) => void;
}

const ALL_TOPICS: Topic[] = [
  'Natuur',
  'Dieren',
  'Sport',
  "Hobby's",
  'Politiek',
  'Film en TV',
  'Geschiedenis',
  'Muziek',
  'Mode en Beauty',
  'Gezondheid',
  'Lifestyle',
  'Reizen',
  'Maatschappij en levensbeschouwing'
];

const TopicSelector: React.FC<TopicSelectorProps> = ({ onSelect }) => {
  const [selectedTopics, setSelectedTopics] = useState<Topic[]>([]);

  const toggleTopic = (topic: Topic) => {
    setSelectedTopics(prev => 
      prev.includes(topic) 
        ? prev.filter(t => t !== topic)
        : [...prev, topic]
    );
  };

  const handleSubmit = () => {
    if (selectedTopics.length >= 3) {
      onSelect(selectedTopics);
    }
  };

  const isValid = selectedTopics.length >= 3;

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 py-8">
      <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-100 max-w-4xl w-full">
        <div className="text-center mb-8">
          <div className="bg-slate-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
            <Layers size={32} className="text-slate-600" />
          </div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Select Topics</h1>
          <p className="text-slate-500 text-lg">
            Select at least <span className="font-bold text-slate-800">3 topics</span> to personalize the content.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-8">
          {ALL_TOPICS.map((topic) => {
            const isSelected = selectedTopics.includes(topic);
            return (
              <button
                key={topic}
                onClick={() => toggleTopic(topic)}
                className={`
                  relative p-4 rounded-lg border-2 text-sm font-semibold transition-all duration-200
                  flex items-center justify-center text-center h-16
                  ${isSelected 
                    ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm' 
                    : 'border-slate-100 bg-slate-50 text-slate-600 hover:border-slate-300 hover:bg-white'}
                `}
              >
                {isSelected && (
                  <CheckCircle2 size={16} className="absolute top-2 right-2 text-blue-500" />
                )}
                {topic}
              </button>
            );
          })}
        </div>

        <div className="flex justify-center">
          <button
            onClick={handleSubmit}
            disabled={!isValid}
            className={`
              px-10 py-4 rounded-xl font-bold text-lg transition-all duration-200
              ${isValid 
                ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-blue-200 transform hover:-translate-y-0.5' 
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'}
            `}
          >
            {isValid ? `Find Content (${selectedTopics.length} selected)` : 'Select at least 3 topics'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TopicSelector;