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
  if (percentage < 40) return 'ABAIXO DO BÁSICO';
  if (percentage < 70) return 'BÁSICO';
  if (percentage <= 80) return 'PROFICIENTE';
  return 'AVANÇADO';
}

export function getCategoryColor(category: PerformanceCategory) {
  switch (category) {
    case 'ABAIXO DO BÁSICO': return 'bg-red-500';
    case 'BÁSICO': return 'bg-yellow-500';
    case 'PROFICIENTE': return 'bg-orange-500';
    case 'AVANÇADO': return 'bg-green-600';
    default: return 'bg-gray-500';
  }
}

export function getCategoryTextColor(category: PerformanceCategory) {
  switch (category) {
    case 'ABAIXO DO BÁSICO': return 'text-red-600';
    case 'BÁSICO': return 'text-yellow-600';
    case 'PROFICIENTE': return 'text-orange-600';
    case 'AVANÇADO': return 'text-green-600';
    default: return 'text-gray-600';
  }
}

export function getCategoryBadgeClasses(category: PerformanceCategory) {
  switch (category) {
    case 'ABAIXO DO BÁSICO': return 'bg-red-100 text-red-700 border-red-200';
    case 'BÁSICO': return 'bg-yellow-100 text-yellow-700 border-yellow-400';
    case 'PROFICIENTE': return 'bg-orange-100 text-orange-700 border-orange-200';
    case 'AVANÇADO': return 'bg-green-100 text-green-700 border-green-200';
    default: return 'bg-gray-100 text-gray-700 border-gray-200';
  }
}
