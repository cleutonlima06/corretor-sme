import { PerformanceCategory } from './types';

export function calculateScore(studentAnswers: string[], correctAnswers: string[]) {
  let score = 0;
  studentAnswers.forEach((ans, idx) => {
    if (ans.toUpperCase() === correctAnswers[idx]?.toUpperCase()) {
      score++;
    }
  });
  return score;
}

export function getPerformanceCategory(percentage: number): PerformanceCategory {
  if (percentage < 50) return 'CRÍTICO';
  if (percentage < 80) return 'INTERMEDIÁRIO';
  return 'ADEQUADO';
}

export function getCategoryColor(category: PerformanceCategory) {
  switch (category) {
    case 'CRÍTICO': return 'bg-red-500';
    case 'INTERMEDIÁRIO': return 'bg-yellow-500';
    case 'ADEQUADO': return 'bg-green-500';
    default: return 'bg-gray-500';
  }
}
