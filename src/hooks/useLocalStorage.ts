import { useState, useEffect } from 'react';
import { AppData, DEFAULT_TASK_CATEGORIES, CURRENT_VERSION } from '../types';

const STORAGE_KEY = 'powerbi-estimator';

const defaultData: AppData = {
  version: CURRENT_VERSION,
  hourlyRate: 0,
  taskCategories: DEFAULT_TASK_CATEGORIES,
};

function migrateData(stored: unknown): AppData {
  if (!stored || typeof stored !== 'object') return defaultData;
  const raw = stored as Record<string, unknown>;

  const categories = Array.isArray(raw.taskCategories)
    ? raw.taskCategories.map((cat: unknown) => {
        const c = cat as Record<string, unknown>;
        return {
          id: String(c.id ?? ''),
          name: String(c.name ?? ''),
          defaultHours: Number(c.defaultHours ?? 0),
          currentHours: Number(c.currentHours ?? c.defaultHours ?? 0),
          enabled: c.enabled !== false,
        };
      })
    : DEFAULT_TASK_CATEGORIES;

  return {
    version: CURRENT_VERSION,
    hourlyRate: Math.max(0, Number(raw.hourlyRate ?? 0)),
    taskCategories: categories,
  };
}

export function useAppData() {
  const [data, setData] = useState<AppData>(defaultData);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as unknown;
        setData(migrateData(parsed));
      }
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

  function updateHourlyRate(rate: number) {
    persist({ ...data, hourlyRate: Math.max(0, rate) });
  }

  function updateTaskHours(taskId: string, hours: number) {
    const taskCategories = data.taskCategories.map(t =>
      t.id === taskId ? { ...t, currentHours: Math.max(0, hours) } : t
    );
    persist({ ...data, taskCategories });
  }

  function toggleTask(taskId: string) {
    const taskCategories = data.taskCategories.map(t =>
      t.id === taskId ? { ...t, enabled: !t.enabled } : t
    );
    persist({ ...data, taskCategories });
  }

  function resetTaskToDefault(taskId: string) {
    const taskCategories = data.taskCategories.map(t =>
      t.id === taskId ? { ...t, currentHours: t.defaultHours } : t
    );
    persist({ ...data, taskCategories });
  }

  function resetAllToDefaults() {
    const taskCategories = data.taskCategories.map(t => ({
      ...t,
      currentHours: t.defaultHours,
      enabled: true,
    }));
    persist({ ...data, taskCategories });
  }

  return {
    data,
    isLoading,
    updateHourlyRate,
    updateTaskHours,
    toggleTask,
    resetTaskToDefault,
    resetAllToDefaults,
  };
}
