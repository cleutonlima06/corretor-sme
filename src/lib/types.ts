export type PerformanceCategory = 'ABAIXO DO BÁSICO' | 'BÁSICO' | 'PROFICIENTE' | 'AVANÇADO';

export interface StudentRecord {
  id: string;
  name: string;
  answers: string[];
  score: number;
  percentage: number;
  category: PerformanceCategory;
  createdAt: number;
  professorId?: string;
}

export interface ClassSettings {
  questionCount: number;
  answerKey: string[];
}
