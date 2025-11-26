import React from 'react';
import { NewsItem } from '../types';
import { Newspaper, Video, Calendar, ExternalLink } from 'lucide-react';

interface ContentCardProps {
  item: NewsItem;
  onSelect: (item: NewsItem) => void;
}

const ContentCard: React.FC<ContentCardProps> = ({ item, onSelect }) => {
  const isVideo = item.type === 'video';

  return (
    <div 
      className="bg-white rounded-xl shadow-sm border border-slate-200 hover:shadow-md hover:border-blue-300 transition-all duration-200 cursor-pointer flex flex-col h-full overflow-hidden group"
      onClick={() => onSelect(item)}
    >
      <div className="p-5 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-3">
          <div className={`
            px-2 py-1 rounded-md text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5
            ${isVideo ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}
          `}>
            {isVideo ? <Video size={14} /> : <Newspaper size={14} />}
            {item.type}
          </div>
          <span className="text-slate-400 text-xs flex items-center gap-1">
            <Calendar size={12} />
            {item.date}
          </span>
        </div>
        
        <h3 className="text-lg font-bold text-slate-800 mb-2 leading-tight group-hover:text-blue-600 transition-colors">
          {item.title}
        </h3>
        
        <p className="text-sm text-slate-500 mb-1 font-medium">
          Source: {item.source}
        </p>
        
        <p className="text-sm text-slate-600 mt-2 line-clamp-3 leading-relaxed">
          {item.summary}
        </p>
      </div>

      <div className="bg-slate-50 px-5 py-3 border-t border-slate-100 flex justify-between items-center">
        <span className="text-sm font-medium text-blue-600 group-hover:underline">
          Create Lesson
        </span>
        <a 
          href={item.url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-slate-400 hover:text-slate-600 p-1"
          onClick={(e) => e.stopPropagation()}
          title="Open original source"
        >
          <ExternalLink size={16} />
        </a>
      </div>
    </div>
  );
};

export default ContentCard;
