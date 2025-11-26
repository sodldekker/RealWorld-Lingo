export type Language = 'English' | 'French' | 'German' | 'Spanish';

export type CEFRLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1';

export type Topic = 
  | 'Natuur' 
  | 'Dieren' 
  | 'Sport' 
  | "Hobby's" 
  | 'Politiek' 
  | 'Film en TV' 
  | 'Geschiedenis' 
  | 'Muziek' 
  | 'Mode en Beauty' 
  | 'Gezondheid' 
  | 'Lifestyle' 
  | 'Reizen' 
  | 'Maatschappij en levensbeschouwing';

export interface NewsItem {
  type: 'article' | 'video';
  title: string;
  source: string;
  date: string;
  url: string;
  summary: string;
}

export interface NewsContentResponse {
  items: NewsItem[];
}

export type ExerciseLevel = 1 | 2 | 3;

export interface LessonRequest {
  item: NewsItem;
  level: ExerciseLevel;
  language: Language;
}

export interface Question {
  id: string;
  type: 'multiple_choice' | 'open';
  questionTypeLabel: string; // e.g., "Gatenvraag" or "Multiple Choice"
  instruction: string; // Instruction for the student
  question: string; // The actual question text
  options?: string[]; // Array of options for MC questions (e.g., ["A) ...", "B) ..."])
  correctAnswer: string; // The model answer
}

export interface LessonPlan {
  canDo: {
    skill: string;
    level: string;
    statement: string;
  };
  questions: Question[];
}

export interface GeneratorState {
  items: NewsItem[];
  selectedItem: NewsItem | null;
  generatedLesson: LessonPlan | null;
  isLoading: boolean;
  error: string | null;
  mode: 'discovery' | 'detail';
}