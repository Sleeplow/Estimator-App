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

export interface AppData {
  version: number;
  hourlyRate: number;
  catalog: CatalogTask[];
  estimation: EstimationTask[];
}

export const CURRENT_VERSION = 2;

export const DEFAULT_CATALOG: CatalogTask[] = [
  { id: '1', name: 'Analyse & Découverte', defaultHours: 8 },
  { id: '2', name: 'Modélisation des données', defaultHours: 12 },
  { id: '3', name: 'Développement des rapports', defaultHours: 16 },
  { id: '4', name: 'Création de dashboards', defaultHours: 10 },
  { id: '5', name: 'Tests & validation', defaultHours: 6 },
  { id: '6', name: 'Formation utilisateur', defaultHours: 4 },
  { id: '7', name: 'Documentation', defaultHours: 3 },
];
