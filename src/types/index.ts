export interface CatalogTask {
  id: string;
  name: string;
  defaultHours: number;
}

export interface EstimationTask {
  id: string;
  catalogId?: string; // undefined = ad-hoc
  name: string;
  hours: number;
}

export interface SavedEstimation {
  id: string;
  title: string;
  client: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  hourlyRate: number;
  tasks: EstimationTask[];
}

export interface CurrentEstimationMeta {
  id?: string;
  title: string;
  client: string;
  description: string;
}

export interface AppData {
  version: number;
  hourlyRate: number;
  estimationRate?: number;
  catalog: CatalogTask[];
  estimation: EstimationTask[];
  currentEstimation: CurrentEstimationMeta;
  estimationHistory: SavedEstimation[];
}

export const CURRENT_VERSION = 3;

export const DEFAULT_CATALOG: CatalogTask[] = [
  { id: '1', name: 'Analyse & Découverte', defaultHours: 8 },
  { id: '2', name: 'Modélisation des données', defaultHours: 12 },
  { id: '3', name: 'Développement des rapports', defaultHours: 16 },
  { id: '4', name: 'Création de dashboards', defaultHours: 10 },
  { id: '5', name: 'Tests & validation', defaultHours: 6 },
  { id: '6', name: 'Formation utilisateur', defaultHours: 4 },
  { id: '7', name: 'Documentation', defaultHours: 3 },
];
