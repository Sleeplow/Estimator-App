import { useState, useEffect } from 'react';
import { AppData, CatalogTask, EstimationTask, DEFAULT_CATALOG, CURRENT_VERSION } from '../types';

const STORAGE_KEY = 'powerbi-estimator';

const defaultData: AppData = {
  version: CURRENT_VERSION,
  hourlyRate: 0,
  catalog: DEFAULT_CATALOG,
  estimation: [],
};

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function migrateData(raw: unknown): AppData {
  if (!raw || typeof raw !== 'object') return defaultData;
  const stored = raw as Record<string, unknown>;

  // v1 → v2: taskCategories split into catalog + estimation
  if (!stored.version || Number(stored.version) < 2) {
    const oldCats = Array.isArray(stored.taskCategories) ? stored.taskCategories : [];
    const catalog: CatalogTask[] = oldCats.length > 0
      ? oldCats.map((c: Record<string, unknown>) => ({
          id: String(c.id ?? generateId()),
          name: String(c.name ?? ''),
          defaultHours: Number(c.defaultHours ?? 0),
        }))
      : DEFAULT_CATALOG;
    return {
      version: CURRENT_VERSION,
      hourlyRate: Math.max(0, Number(stored.hourlyRate ?? 0)),
      catalog,
      estimation: [],
    };
  }

  const catalog = Array.isArray(stored.catalog)
    ? (stored.catalog as Record<string, unknown>[]).map(c => ({
        id: String(c.id),
        name: String(c.name),
        defaultHours: Number(c.defaultHours),
      }))
    : DEFAULT_CATALOG;

  const estimation = Array.isArray(stored.estimation)
    ? (stored.estimation as Record<string, unknown>[]).map(e => ({
        id: String(e.id),
        catalogId: e.catalogId ? String(e.catalogId) : undefined,
        name: String(e.name),
        hours: Number(e.hours),
      }))
    : [];

  return {
    version: CURRENT_VERSION,
    hourlyRate: Math.max(0, Number(stored.hourlyRate ?? 0)),
    catalog,
    estimation,
  };
}

export function useAppData() {
  const [data, setData] = useState<AppData>(defaultData);
  const [isLoading, setIsLoading] = useState(true);

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

  function persist(next: AppData) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setData(next);
  }

  // ── Hourly rate (base — Config page) ────────────────────
  function updateHourlyRate(rate: number) {
    persist({ ...data, hourlyRate: Math.max(0, rate) });
  }

  // ── Estimation rate override (Dashboard only) ────────────
  function updateEstimationRate(rate: number) {
    persist({ ...data, estimationRate: Math.max(0, rate) });
  }

  function resetEstimationRate() {
    const next = { ...data };
    delete next.estimationRate;
    persist(next);
  }

  const effectiveRate = data.estimationRate ?? data.hourlyRate;

  // ── Catalog ──────────────────────────────────────────────
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
    // Remove from estimation too if added from this catalog entry
    const estimation = data.estimation.filter(e => e.catalogId !== id);
    persist({ ...data, catalog, estimation });
  }

  // ── Estimation ───────────────────────────────────────────
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

  return {
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
  };
}
