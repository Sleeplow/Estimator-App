import { createContext, useContext, useEffect, useRef, useState, ReactNode, createElement } from 'react';
import {
  AppData, CatalogTask, EstimationTask, SavedEstimation, CurrentEstimationMeta,
  DEFAULT_CATALOG, CURRENT_VERSION,
} from '../types';
import { useAuth } from '../contexts/AuthContext';
import { loadFromFirestore, saveToFirestore, mergeAppData } from '../services/firestoreSync';

const STORAGE_KEY = 'powerbi-estimator';
const FIRESTORE_DEBOUNCE_MS = 1500;

const defaultMeta: CurrentEstimationMeta = { title: '', client: '', description: '' };

const defaultData: AppData = {
  version: CURRENT_VERSION,
  hourlyRate: 0,
  catalog: DEFAULT_CATALOG,
  estimation: [],
  currentEstimation: defaultMeta,
  estimationHistory: [],
};

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function parseCatalog(arr: unknown): CatalogTask[] {
  if (!Array.isArray(arr)) return DEFAULT_CATALOG;
  return (arr as Record<string, unknown>[]).map(c => ({
    id: String(c.id ?? generateId()),
    name: String(c.name ?? ''),
    defaultHours: Number(c.defaultHours ?? 0),
  }));
}

function parseEstimation(arr: unknown): EstimationTask[] {
  if (!Array.isArray(arr)) return [];
  return (arr as Record<string, unknown>[]).map(e => ({
    id: String(e.id ?? generateId()),
    catalogId: e.catalogId ? String(e.catalogId) : undefined,
    name: String(e.name ?? ''),
    hours: Number(e.hours ?? 0),
  }));
}

function parseMeta(obj: unknown): CurrentEstimationMeta {
  if (!obj || typeof obj !== 'object') return defaultMeta;
  const m = obj as Record<string, unknown>;
  return {
    id: m.id ? String(m.id) : undefined,
    title: String(m.title ?? ''),
    client: String(m.client ?? ''),
    description: String(m.description ?? ''),
  };
}

function parseHistory(arr: unknown): SavedEstimation[] {
  if (!Array.isArray(arr)) return [];
  return (arr as Record<string, unknown>[]).map(e => ({
    id: String(e.id ?? generateId()),
    title: String(e.title ?? ''),
    client: String(e.client ?? ''),
    description: String(e.description ?? ''),
    createdAt: String(e.createdAt ?? new Date().toISOString()),
    updatedAt: String(e.updatedAt ?? new Date().toISOString()),
    hourlyRate: Number(e.hourlyRate ?? 0),
    tasks: parseEstimation(e.tasks),
  }));
}

function migrateData(raw: unknown): AppData {
  if (!raw || typeof raw !== 'object') return defaultData;
  const stored = raw as Record<string, unknown>;
  const version = Number(stored.version ?? 0);

  if (version < 2) {
    const oldCats = Array.isArray(stored.taskCategories) ? stored.taskCategories : [];
    const catalog: CatalogTask[] = oldCats.length > 0
      ? (oldCats as Record<string, unknown>[]).map(c => ({
          id: String(c.id ?? generateId()),
          name: String(c.name ?? ''),
          defaultHours: Number(c.defaultHours ?? 0),
        }))
      : DEFAULT_CATALOG;
    return {
      ...defaultData,
      hourlyRate: Math.max(0, Number(stored.hourlyRate ?? 0)),
      catalog,
    };
  }

  return {
    version: CURRENT_VERSION,
    hourlyRate: Math.max(0, Number(stored.hourlyRate ?? 0)),
    estimationRate: stored.estimationRate !== undefined ? Number(stored.estimationRate) : undefined,
    catalog: parseCatalog(stored.catalog),
    estimation: parseEstimation(stored.estimation),
    currentEstimation: parseMeta(stored.currentEstimation),
    estimationHistory: parseHistory(stored.estimationHistory),
  };
}

// ── Context ──────────────────────────────────────────────────────────────────

interface AppDataContextValue {
  data: AppData;
  isLoading: boolean;
  effectiveRate: number;
  updateHourlyRate: (rate: number) => void;
  updateEstimationRate: (rate: number) => void;
  resetEstimationRate: () => void;
  addCatalogTask: (name: string, defaultHours: number) => void;
  updateCatalogTask: (id: string, updates: Partial<Pick<CatalogTask, 'name' | 'defaultHours'>>) => void;
  deleteCatalogTask: (id: string) => void;
  addFromCatalog: (catalogTask: CatalogTask) => void;
  addAdHocTask: (name: string, hours: number) => void;
  updateEstimationHours: (id: string, hours: number) => void;
  removeEstimationTask: (id: string) => void;
  clearEstimation: () => void;
  updateCurrentMeta: (updates: Partial<CurrentEstimationMeta>) => void;
  saveEstimation: () => void;
  loadEstimation: (id: string) => void;
  deleteEstimation: (id: string) => void;
  deleteAndClearEstimation: (id: string) => void;
  newEstimation: () => void;
}

const AppDataContext = createContext<AppDataContextValue | null>(null);

// ── Provider ─────────────────────────────────────────────────────────────────

export function AppDataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData>(defaultData);
  const [isLoading, setIsLoading] = useState(true);
  const { user, setSyncStatus } = useAuth();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setData(migrateData(JSON.parse(raw) as unknown));
    } catch {
      setData(defaultData);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // On login: sync with Firestore
  useEffect(() => {
    if (!user) return;

    setSyncStatus('syncing');
    loadFromFirestore(user.uid)
      .then((cloudData) => {
        setData((local) => {
          const merged = cloudData ? mergeAppData(local, migrateData(cloudData)) : local;
          localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
          if (!cloudData) {
            // First login: bootstrap cloud with local data
            saveToFirestore(user.uid, local).catch(() => {});
          }
          return merged;
        });
        setSyncStatus('synced');
      })
      .catch(() => setSyncStatus('error'));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.uid]);

  function scheduleFirestoreWrite(uid: string, next: AppData) {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setSyncStatus('syncing');
    debounceRef.current = setTimeout(() => {
      saveToFirestore(uid, next)
        .then(() => setSyncStatus('synced'))
        .catch(() => setSyncStatus('error'));
    }, FIRESTORE_DEBOUNCE_MS);
  }

  function persist(next: AppData) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setData(next);
    if (user) scheduleFirestoreWrite(user.uid, next);
  }

  const effectiveRate = data.estimationRate ?? data.hourlyRate;

  function updateHourlyRate(rate: number) {
    persist({ ...data, hourlyRate: Math.max(0, rate) });
  }

  function updateEstimationRate(rate: number) {
    persist({ ...data, estimationRate: Math.max(0, rate) });
  }

  function resetEstimationRate() {
    const next = { ...data };
    delete next.estimationRate;
    persist(next);
  }

  function addCatalogTask(name: string, defaultHours: number) {
    const task: CatalogTask = { id: generateId(), name: name.trim(), defaultHours: Math.max(0, defaultHours) };
    persist({ ...data, catalog: [...data.catalog, task] });
  }

  function updateCatalogTask(id: string, updates: Partial<Pick<CatalogTask, 'name' | 'defaultHours'>>) {
    const catalog = data.catalog.map(t => t.id === id ? { ...t, ...updates } : t);
    persist({ ...data, catalog });
  }

  function deleteCatalogTask(id: string) {
    const catalog = data.catalog.filter(t => t.id !== id);
    const estimation = data.estimation.filter(e => e.catalogId !== id);
    persist({ ...data, catalog, estimation });
  }

  function addFromCatalog(catalogTask: CatalogTask) {
    const task: EstimationTask = {
      id: generateId(),
      catalogId: catalogTask.id,
      name: catalogTask.name,
      hours: catalogTask.defaultHours,
    };
    persist({ ...data, estimation: [...data.estimation, task] });
  }

  function addAdHocTask(name: string, hours: number) {
    const task: EstimationTask = {
      id: generateId(),
      name: name.trim(),
      hours: Math.max(0, hours),
    };
    persist({ ...data, estimation: [...data.estimation, task] });
  }

  function updateEstimationHours(id: string, hours: number) {
    const estimation = data.estimation.map(t =>
      t.id === id ? { ...t, hours: Math.max(0, hours) } : t
    );
    persist({ ...data, estimation });
  }

  function removeEstimationTask(id: string) {
    persist({ ...data, estimation: data.estimation.filter(t => t.id !== id) });
  }

  function clearEstimation() {
    persist({ ...data, estimation: [] });
  }

  function updateCurrentMeta(updates: Partial<CurrentEstimationMeta>) {
    persist({ ...data, currentEstimation: { ...data.currentEstimation, ...updates } });
  }

  function saveEstimation() {
    const now = new Date().toISOString();
    const title = data.currentEstimation.title.trim() || 'Sans titre';
    const existingId = data.currentEstimation.id;

    if (existingId && data.estimationHistory.find(e => e.id === existingId)) {
      const history = data.estimationHistory.map(e =>
        e.id === existingId
          ? {
              ...e,
              title,
              client: data.currentEstimation.client,
              description: data.currentEstimation.description,
              updatedAt: now,
              hourlyRate: effectiveRate,
              tasks: [...data.estimation],
            }
          : e
      );
      persist({ ...data, estimationHistory: history });
    } else {
      const id = generateId();
      const saved: SavedEstimation = {
        id,
        title,
        client: data.currentEstimation.client,
        description: data.currentEstimation.description,
        createdAt: now,
        updatedAt: now,
        hourlyRate: effectiveRate,
        tasks: [...data.estimation],
      };
      persist({
        ...data,
        currentEstimation: { ...data.currentEstimation, id },
        estimationHistory: [saved, ...data.estimationHistory],
      });
    }
  }

  function loadEstimation(id: string) {
    const saved = data.estimationHistory.find(e => e.id === id);
    if (!saved) return;
    persist({
      ...data,
      estimation: saved.tasks,
      estimationRate: saved.hourlyRate !== data.hourlyRate ? saved.hourlyRate : undefined,
      currentEstimation: {
        id: saved.id,
        title: saved.title,
        client: saved.client,
        description: saved.description,
      },
    });
  }

  function deleteEstimation(id: string) {
    const history = data.estimationHistory.filter(e => e.id !== id);
    const currentEstimation =
      data.currentEstimation.id === id
        ? { ...data.currentEstimation, id: undefined }
        : data.currentEstimation;
    persist({ ...data, estimationHistory: history, currentEstimation });
  }

  function deleteAndClearEstimation(id: string) {
    const history = data.estimationHistory.filter(e => e.id !== id);
    const next = { ...data };
    delete next.estimationRate;
    persist({
      ...next,
      estimationHistory: history,
      estimation: [],
      currentEstimation: { title: '', client: '', description: '' },
    });
  }

  function newEstimation() {
    const next = { ...data };
    delete next.estimationRate;
    persist({
      ...next,
      estimation: [],
      currentEstimation: { title: '', client: '', description: '' },
    });
  }

  const value: AppDataContextValue = {
    data,
    isLoading,
    effectiveRate,
    updateHourlyRate,
    updateEstimationRate,
    resetEstimationRate,
    addCatalogTask,
    updateCatalogTask,
    deleteCatalogTask,
    addFromCatalog,
    addAdHocTask,
    updateEstimationHours,
    removeEstimationTask,
    clearEstimation,
    updateCurrentMeta,
    saveEstimation,
    loadEstimation,
    deleteEstimation,
    deleteAndClearEstimation,
    newEstimation,
  };

  return createElement(AppDataContext.Provider, { value }, children);
}

// ── Hook ─────────────────────────────────────────────────────────────────────

export function useAppData(): AppDataContextValue {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error('useAppData must be used inside AppDataProvider');
  return ctx;
}
