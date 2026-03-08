export type PerformanceCategory = 'CRÍTICO' | 'INTERMEDIÁRIO' | 'ADEQUADO';

export interface StudentRecord {
  id: string;
  name: string;
  answers: string[];
  score: number;
  percentage: number;
  category: PerformanceCategory;
  createdAt: number;
}

export interface ClassSettings {
  questionCount: number;
  answerKey: string[];
}
