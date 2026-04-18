export interface TaskCategory {
  id: string;
  name: string;
  defaultHours: number;
  currentHours: number;
  enabled: boolean;
}

export interface AppData {
  version: number;
  hourlyRate: number;
  taskCategories: TaskCategory[];
}

export const CURRENT_VERSION = 1;

export const DEFAULT_TASK_CATEGORIES: TaskCategory[] = [
  { id: '1', name: 'Analyse & Découverte', defaultHours: 8, currentHours: 8, enabled: true },
  { id: '2', name: 'Modélisation des données', defaultHours: 12, currentHours: 12, enabled: true },
  { id: '3', name: 'Développement des rapports', defaultHours: 16, currentHours: 16, enabled: true },
  { id: '4', name: 'Création de dashboards', defaultHours: 10, currentHours: 10, enabled: true },
  { id: '5', name: 'Tests & validation', defaultHours: 6, currentHours: 6, enabled: true },
  { id: '6', name: 'Formation utilisateur', defaultHours: 4, currentHours: 4, enabled: true },
  { id: '7', name: 'Documentation', defaultHours: 3, currentHours: 3, enabled: true },
];
