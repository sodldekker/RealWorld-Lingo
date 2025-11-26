import React, { useState } from 'react';
import { LessonPlan, Question, NewsItem, Language } from '../types';
import { CheckCircle2, Send, RefreshCcw, Loader2, BookOpen, Download, FileText, KeyRound } from 'lucide-react';
import { evaluateStudentAnswers } from '../services/geminiService';
import { downloadStudentPDF, downloadTeacherPDF } from '../services/pdfService';

interface GeneratedLessonProps {
  content: LessonPlan;
  context: NewsItem;
  language: Language;
}

const GeneratedLesson: React.FC<GeneratedLessonProps> = ({ content, context, language }) => {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [feedback, setFeedback] = useState<Record<string, string>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isGrading, setIsGrading] = useState(false);

  const handleInputChange = (id: string, value: string) => {
    if (isSubmitted) return; // Prevent editing after submission
    setAnswers(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async () => {
    setIsSubmitted(true);
    setIsGrading(true);
    
    // Scroll to bottom immediately
    setTimeout(() => {
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    }, 100);

    try {
      const results = await evaluateStudentAnswers(context, content.questions, answers, language);
      setFeedback(results);
    } catch (error) {
      console.error("Grading failed", error);
    } finally {
      setIsGrading(false);
    }
  };

  const handleReset = () => {
    setAnswers({});
    setFeedback({});
    setIsSubmitted(false);
    setIsGrading(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const allAnswered = content.questions.every(q => answers[q.id] && answers[q.id].trim() !== '');

  return (
    <div className="space-y-8 mt-6">
      {/* Header / Download Actions */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h2 className="text-sm font-bold text-blue-600 uppercase tracking-wide mb-1">
                {content.canDo.skill} • {content.canDo.level}
              </h2>
              <p className="text-xl font-bold text-slate-800">
                "{content.canDo.statement}"
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
            <button 
              onClick={() => downloadStudentPDF(content, context, language)}
              className="flex items-center justify-center gap-3 px-6 py-4 text-base font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
              title="Download worksheet for students"
            >
              <FileText size={20} />
              <span>Download Student Worksheet (PDF)</span>
            </button>
            <button 
              onClick={() => downloadTeacherPDF(content, context, language)}
              className="flex items-center justify-center gap-3 px-6 py-4 text-base font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
              title="Download answer key for teachers"
            >
              <KeyRound size={20} />
              <span>Download Answer Key (PDF)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Questions List */}
      <div className="space-y-6">
        {content.questions.map((q, index) => (
          <QuestionCard 
            key={q.id} 
            index={index + 1} 
            question={q} 
            userAnswer={answers[q.id] || ''} 
            onChange={handleInputChange}
            isSubmitted={isSubmitted}
            feedback={feedback[q.id]}
            isGrading={isGrading}
          />
        ))}
      </div>

      {/* Action Buttons */}
      <div className="sticky bottom-4 z-20 flex justify-center pb-4">
        {!isSubmitted ? (
          <button
            onClick={handleSubmit}
            disabled={!allAnswered}
            className={`
              flex items-center gap-2 px-8 py-4 rounded-full font-bold shadow-xl transition-all transform hover:-translate-y-1
              ${allAnswered 
                ? 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-blue-200' 
                : 'bg-slate-300 text-slate-500 cursor-not-allowed'}
            `}
          >
            <Send size={20} />
            Submit Answers
          </button>
        ) : (
           <div className="bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-lg border border-slate-200">
             <button
              onClick={handleReset}
              className="flex items-center gap-2 px-6 py-3 bg-slate-800 text-white rounded-full font-bold hover:bg-slate-700 transition-colors"
            >
              <RefreshCcw size={18} />
              Reset & Try Again
            </button>
           </div>
        )}
      </div>

      {/* Status Message */}
      {isSubmitted && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-6 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
          {isGrading ? (
             <div className="flex flex-col items-center">
                <Loader2 size={32} className="text-indigo-600 animate-spin mb-3" />
                <h3 className="text-xl font-bold text-indigo-800">Checking your work...</h3>
                <p className="text-indigo-600">The teacher is analyzing your answers against the text.</p>
             </div>
          ) : (
            <div className="flex flex-col items-center">
              <div className="inline-flex bg-indigo-100 p-3 rounded-full mb-3">
                 <CheckCircle2 size={32} className="text-indigo-600" />
              </div>
              <h3 className="text-xl font-bold text-indigo-800">Feedback Ready!</h3>
              <p className="text-indigo-700">Review the analysis above to see detailed feedback and strategies.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

interface QuestionCardProps {
  index: number;
  question: Question;
  userAnswer: string;
  onChange: (id: string, value: string) => void;
  isSubmitted: boolean;
  feedback?: string;
  isGrading: boolean;
}

const QuestionCard: React.FC<QuestionCardProps> = ({ index, question, userAnswer, onChange, isSubmitted, feedback, isGrading }) => {
  return (
    <div className={`
      bg-white rounded-xl border transition-all duration-300 overflow-hidden
      ${isSubmitted ? 'border-slate-300' : 'border-slate-200 shadow-sm hover:shadow-md'}
    `}>
      {/* Question Header */}
      <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-start">
        <div>
          <span className="inline-block px-2 py-0.5 rounded text-xs font-semibold bg-slate-200 text-slate-600 mb-2">
            {question.questionTypeLabel}
          </span>
          <h3 className="text-lg font-bold text-slate-800 flex gap-3">
            <span className="text-blue-600">#{index}</span>
            {question.instruction}
          </h3>
        </div>
      </div>

      {/* Question Body */}
      <div className="p-6">
        <p className="text-slate-700 font-medium text-lg mb-6 leading-relaxed">
          {question.question}
        </p>

        {/* INPUT: Multiple Choice */}
        {question.type === 'multiple_choice' && question.options && (
          <div className="space-y-3">
            {question.options.map((option) => {
              const isSelected = userAnswer === option;
              
              return (
                <label 
                  key={option} 
                  className={`
                    flex items-center p-4 rounded-lg border-2 cursor-pointer transition-all
                    ${!isSubmitted ? 'hover:bg-blue-50 hover:border-blue-200' : ''}
                    ${isSelected 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-slate-100 bg-white'}
                    ${isSubmitted ? 'cursor-default' : ''}
                  `}
                >
                  <input
                    type="radio"
                    name={question.id}
                    value={option}
                    checked={isSelected}
                    onChange={(e) => onChange(question.id, e.target.value)}
                    disabled={isSubmitted}
                    className="hidden"
                  />
                  <div className={`
                    w-6 h-6 rounded-full border-2 flex items-center justify-center mr-4 flex-shrink-0
                    ${isSelected ? 'border-blue-500 text-blue-500' : 'border-slate-300 text-transparent'}
                  `}>
                    <div className="w-3 h-3 rounded-full bg-current" />
                  </div>
                  <span className="text-slate-700">{option}</span>
                </label>
              );
            })}
          </div>
        )}

        {/* INPUT: Open Question */}
        {question.type === 'open' && (
          <div className="relative">
            <textarea
              value={userAnswer}
              onChange={(e) => onChange(question.id, e.target.value)}
              disabled={isSubmitted}
              placeholder="Type your answer here..."
              className={`
                w-full p-4 rounded-lg border-2 bg-slate-50 focus:bg-white transition-all resize-y min-h-[120px] outline-none
                ${isSubmitted ? 'border-slate-200 text-slate-500' : 'border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 text-slate-800'}
              `}
            />
          </div>
        )}

        {/* FEEDBACK: Reveal after grading */}
        {isSubmitted && (
          <div className="mt-6 pt-6 border-t border-slate-100 animate-in fade-in duration-500">
            <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-5">
              <div className="flex items-center gap-2 mb-3">
                <BookOpen size={18} className="text-indigo-600" />
                <span className="text-sm font-bold text-indigo-700 uppercase tracking-wider">Teacher Feedback</span>
              </div>
              
              {isGrading ? (
                 <div className="flex items-center gap-2 text-indigo-400">
                    <Loader2 size={16} className="animate-spin" />
                    <span className="text-sm">Analyzing answer...</span>
                 </div>
              ) : (
                <div className="text-indigo-900 font-medium whitespace-pre-wrap leading-relaxed">
                  {feedback || "Analysis unavailable."}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GeneratedLesson;