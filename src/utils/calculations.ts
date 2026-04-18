import { EstimationTask } from '../types';

export function calculateTotalHours(tasks: EstimationTask[]): number {
  return tasks.reduce((sum, t) => sum + t.hours, 0);
}

export function calculateTotalCost(totalHours: number, hourlyRate: number): number {
  return totalHours * hourlyRate;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('fr-CA', {
    style: 'currency',
    currency: 'CAD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}
