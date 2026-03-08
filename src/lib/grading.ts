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

export function getCategoryTextColor(category: PerformanceCategory) {
  switch (category) {
    case 'CRÍTICO': return 'text-red-600';
    case 'INTERMEDIÁRIO': return 'text-yellow-600';
    case 'ADEQUADO': return 'text-green-600';
    default: return 'text-gray-600';
  }
}

export function getCategoryBadgeClasses(category: PerformanceCategory) {
  switch (category) {
    case 'CRÍTICO': return 'bg-red-100 text-red-700 border-red-200';
    case 'INTERMEDIÁRIO': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    case 'ADEQUADO': return 'bg-green-100 text-green-700 border-green-200';
    default: return 'bg-gray-100 text-gray-700 border-gray-200';
  }
}
