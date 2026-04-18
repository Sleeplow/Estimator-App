import { TaskCategory } from '../types';

export function calculateTotalHours(categories: TaskCategory[]): number {
  return categories
    .filter(c => c.enabled)
    .reduce((sum, c) => sum + c.currentHours, 0);
}

export function calculateTotalCost(totalHours: number, hourlyRate: number): number {
  return totalHours * hourlyRate;
}

export function calculateTaskCost(task: TaskCategory, hourlyRate: number): number {
  return task.enabled ? task.currentHours * hourlyRate : 0;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('fr-CA', {
    style: 'currency',
    currency: 'CAD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatHours(hours: number): string {
  return `${hours}h`;
}
