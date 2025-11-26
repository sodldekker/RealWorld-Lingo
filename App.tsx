import React, { useState, useEffect, useRef } from 'react';
import { NewsItem, ExerciseLevel, Language, CEFRLevel, Topic, LessonPlan } from './types';
import { fetchContentSuggestions, generateLessonPlan } from './services/geminiService';
import ContentCard from './components/ContentCard';
import LevelSelector from './components/LevelSelector';
import GeneratedLesson from './components/GeneratedLesson';
import LanguageSelector from './components/LanguageSelector';
import GlobalLevelSelector from './components/GlobalLevelSelector';
import TopicSelector from './components/TopicSelector';
import { BookOpen, RefreshCw, Loader2, GraduationCap, AlertCircle, ChevronLeft } from 'lucide-react';

const App: React.FC = () => {
  // Navigation Steps
  type Step = 'language' | 'level' | 'topics' | 'dashboard';

  // State
  const [step, setStep] = useState<Step>('language');
  const [language, setLanguage] = useState<Language | null>(null);
  const [cefrLevel, setCefrLevel] = useState<CEFRLevel | null>(null);
  const [topics, setTopics] = useState<Topic[]>([]);
  
  const [items, setItems] = useState<NewsItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<NewsItem | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<ExerciseLevel | null>(null);
  const [generatedLesson, setGeneratedLesson] = useState<LessonPlan | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const lessonRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to lesson when generated
  useEffect(() => {
    if (generatedLesson && lessonRef.current) {
      setTimeout(() => {
        lessonRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  }, [generatedLesson]);

  // Handlers
  const handleSelectLanguage = (lang: Language) => {
    setLanguage(lang);
    setStep('level');
  };

  const handleSelectCEFR = (level: CEFRLevel) => {
    setCefrLevel(level);
    setStep('topics');
  };

  const handleSelectTopics = (selectedTopics: Topic[]) => {
    setTopics(selectedTopics);
    setStep('dashboard');
    // Trigger fetch immediately after topic selection
    handleFetchContent(language!, cefrLevel, selectedTopics);
  };

  // Modified to accept params optionally, defaults to state
  const handleFetchContent = async (
    lang: Language = language!, 
    // We pass a dummy function for type safety if needed, or just access state
    // But since state might not be updated yet in the closure if we call it immediately, 
    // we allow passing args directly.
    currentCefr: CEFRLevel | null = cefrLevel,
    currentTopics: Topic[] = topics
  ) => {
    // Determine strict values to use
    const lvl = typeof currentCefr === 'string' ? currentCefr : cefrLevel;
    const tps = Array.isArray(currentTopics) && currentTopics.length > 0 ? currentTopics : topics;

    if (!lang || !lvl || tps.length === 0) return;

    setIsLoading(true);
    setError(null);
    try {
      const newItems = await fetchContentSuggestions(lang, lvl, tps);
      setItems(newItems);
      // Reset selection when refreshing content
      setSelectedItem(null);
      setGeneratedLesson(null);
      setSelectedLevel(null);
    } catch (err) {
      setError("Failed to fetch new content. Please check your internet connection or API key.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectItem = (item: NewsItem) => {
    setSelectedItem(item);
    setGeneratedLesson(null);
    setSelectedLevel(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToGrid = () => {
    setSelectedItem(null);
    setGeneratedLesson(null);
    setSelectedLevel(null);
  };

  // Global Back Handler
  const handleBack = () => {
    if (selectedItem) {
      handleBackToGrid();
    } else if (step === 'dashboard') {
      setStep('topics');
      setItems([]); // Clear items so we don't show stale content if we change topics
    } else if (step === 'topics') {
      setStep('level');
      setTopics([]);
    } else if (step === 'level') {
      setStep('language');
      setCefrLevel(null);
    }
  };

  const handleGenerate = async (level: ExerciseLevel) => {
    if (!selectedItem || !language) return;
    
    setSelectedLevel(level);
    setIsLoading(true);
    setError(null);
    setGeneratedLesson(null);

    try {
      const lesson = await generateLessonPlan(selectedItem, level, language);
      setGeneratedLesson(lesson);
    } catch (err) {
      console.error(err);
      setError("Failed to generate exercises. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // 1. Language Selection View
  if (step === 'language') {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900">
        <LanguageSelector onSelect={handleSelectLanguage} />
      </div>
    );
  }

  // 2. CEFR Level Selection View
  if (step === 'level' && language) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 relative">
        <button 
          onClick={handleBack}
          className="absolute top-6 left-6 p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded-full transition-colors z-10"
        >
          <ChevronLeft size={24} />
        </button>
        <GlobalLevelSelector language={language} onSelect={handleSelectCEFR} />
      </div>
    );
  }

  // 3. Topic Selection View
  if (step === 'topics') {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 relative">
        <button 
          onClick={handleBack}
          className="absolute top-6 left-6 p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded-full transition-colors z-10"
        >
          <ChevronLeft size={24} />
        </button>
        <TopicSelector onSelect={handleSelectTopics} />
      </div>
    );
  }

  // 4. Main Dashboard View
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={handleBack}
              className="p-2 -ml-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-full transition-colors"
              aria-label="Go back"
              title="Go back"
            >
              <ChevronLeft size={24} />
            </button>
            
            <div className="flex items-center gap-2 select-none">
              <div className={`p-1.5 rounded-lg ${
                language === 'English' ? 'bg-blue-600' :
                language === 'French' ? 'bg-indigo-600' :
                language === 'German' ? 'bg-amber-500' : 'bg-orange-600'
              }`}>
                <GraduationCap className="text-white" size={24} />
              </div>
              <div className="flex flex-col">
                <h1 className="text-xl font-bold text-slate-800 leading-none">{language} Tutor</h1>
                <span className="text-xs text-slate-500 font-medium">
                  Level {cefrLevel} • {topics.length > 3 ? `${topics.length} Topics` : topics.join(', ')}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {!selectedItem && (
              <button 
                onClick={() => handleFetchContent()}
                disabled={isLoading}
                className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
              >
                <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
                {isLoading ? "Finding..." : "Refresh Content"}
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center gap-3">
            <AlertCircle size={20} />
            <p>{error}</p>
          </div>
        )}

        {/* LOADING STATE - INITIAL */}
        {isLoading && !selectedItem && items.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 size={48} className="text-blue-600 animate-spin mb-4" />
            <p className="text-slate-500 font-medium text-lg">Scouring the web for recent {language} news...</p>
            <p className="text-slate-400 text-sm mt-2">Looking for {cefrLevel} content about {topics.slice(0, 3).join(', ')}...</p>
          </div>
        )}

        {/* DASHBOARD VIEW */}
        {!selectedItem && items.length > 0 && (
          <>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-slate-800">Fresh {language} Content ({cefrLevel})</h2>
              <p className="text-slate-500">Select an article or video to create a lesson plan.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {items.map((item, index) => (
                <ContentCard key={index} item={item} onSelect={handleSelectItem} />
              ))}
            </div>
          </>
        )}

        {/* DETAIL & GENERATE VIEW */}
        {selectedItem && (
          <div className="max-w-4xl mx-auto">
            {/* Selected Item Summary */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-8">
              <div className="flex items-center gap-2 mb-4">
                 <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${selectedItem.type === 'video' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                    {selectedItem.type}
                 </span>
                 <span className="text-slate-400 text-sm">{selectedItem.date}</span>
                 <span className="text-slate-300">|</span>
                 <span className="text-slate-500 text-sm font-medium">{selectedItem.source}</span>
              </div>
              <h1 className="text-3xl font-bold text-slate-900 mb-4">{selectedItem.title}</h1>
              <p className="text-slate-600 text-lg leading-relaxed mb-6">{selectedItem.summary}</p>
              <div className="flex items-center gap-4">
                <a 
                  href={selectedItem.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-blue-600 font-semibold hover:underline"
                >
                  <BookOpen size={18} />
                  Read Full Article
                </a>
              </div>
            </div>

            {/* Generator Controls */}
            <div className="mb-8">
               <LevelSelector 
                 selectedLevel={selectedLevel} 
                 onSelect={handleGenerate}
                 disabled={isLoading} 
               />
            </div>

            {/* Loading Generation */}
            {isLoading && selectedLevel && (
               <div className="bg-blue-50 border border-blue-100 rounded-xl p-8 flex flex-col items-center justify-center text-center">
                 <Loader2 size={40} className="text-blue-600 animate-spin mb-4" />
                 <h3 className="text-lg font-bold text-blue-900">Designing Lesson...</h3>
                 <p className="text-blue-700 max-w-md mt-2">
                   Creating interactive {selectedLevel === 1 ? 'A2/B1' : selectedLevel === 2 ? 'B1' : 'B1+/B2'} exercises based on CEFR standards for {language}.
                 </p>
               </div>
            )}

            {/* Results */}
            {generatedLesson && !isLoading && language && selectedItem && (
              <div ref={lessonRef} id="generated-lesson-anchor" className="scroll-mt-24">
                <GeneratedLesson 
                  content={generatedLesson} 
                  context={selectedItem} 
                  language={language} 
                />
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default App;