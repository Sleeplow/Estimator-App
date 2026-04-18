import { useState, useEffect, useRef } from 'react';
import { useAppData } from '../../hooks/useLocalStorage';
import { formatCurrency } from '../../utils/calculations';
import styles from './Configuration.module.css';

interface InlineNewTask {
  name: string;
  hours: string;
}

export function Configuration() {
  const {
    data,
    isLoading,
    updateHourlyRate,
    addCatalogTask,
    updateCatalogTask,
    deleteCatalogTask,
  } = useAppData();

  const [rateInput, setRateInput] = useState('');
  const [rateSaved, setRateSaved] = useState(false);
  const [newTask, setNewTask] = useState<InlineNewTask | null>(null);
  const newNameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isLoading) setRateInput(data.hourlyRate > 0 ? String(data.hourlyRate) : '');
  }, [isLoading, data.hourlyRate]);

  useEffect(() => {
    if (newTask !== null) newNameRef.current?.focus();
  }, [newTask]);

  // ── Hourly rate ──────────────────────────────────────────
  function handleRateBlur() {
    const parsed = parseFloat(rateInput);
    if (!isNaN(parsed) && parsed >= 0) { updateHourlyRate(parsed); flashSaved(); }
    else if (rateInput === '') { updateHourlyRate(0); flashSaved(); }
    else setRateInput(data.hourlyRate > 0 ? String(data.hourlyRate) : '');
  }

  function flashSaved() {
    setRateSaved(true);
    setTimeout(() => setRateSaved(false), 1500);
  }

  // ── Catalog inline edit ──────────────────────────────────
  function handleNameBlur(id: string, value: string) {
    const name = value.trim();
    if (name) updateCatalogTask(id, { name });
    else {
      // revert to previous name via re-render
    }
  }

  function handleHoursBlur(id: string, value: string) {
    const hours = parseFloat(value);
    if (!isNaN(hours) && hours >= 0) updateCatalogTask(id, { defaultHours: hours });
  }

  function handleDelete(id: string, name: string) {
    if (confirm(`Supprimer "${name}" du catalogue ?`)) deleteCatalogTask(id);
  }

  // ── Inline new task ──────────────────────────────────────
  function startNewTask() {
    setNewTask({ name: '', hours: '1' });
  }

  function commitNewTask() {
    if (!newTask) return;
    const name = newTask.name.trim();
    const hours = parseFloat(newTask.hours);
    if (name && !isNaN(hours) && hours >= 0) {
      addCatalogTask(name, hours);
    }
    setNewTask(null);
  }

  function cancelNewTask() {
    setNewTask(null);
  }

  function handleNewTaskKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') commitNewTask();
    if (e.key === 'Escape') cancelNewTask();
  }

  if (isLoading) return <div className={styles.loading}>Chargement…</div>;

  return (
    <div className={styles.page}>
      <div className={styles.container}>

        {/* Hourly rate */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Taux horaire</h2>
          <div className={styles.rateCard}>
            <label className={styles.rateLabel} htmlFor="hourlyRate">
              Taux de facturation (CAD/heure)
            </label>
            <div className={styles.rateRow}>
              <div className={styles.rateInputWrapper}>
                <span className={styles.rateCurrency}>$</span>
                <input
                  id="hourlyRate"
                  className={styles.rateInput}
                  type="number"
                  min="0"
                  step="5"
                  placeholder="0"
                  value={rateInput}
                  onChange={e => setRateInput(e.target.value)}
                  onBlur={handleRateBlur}
                  onKeyDown={e => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
                />
                <span className={styles.rateUnit}>/h</span>
              </div>
              {data.hourlyRate > 0 && (
                <span className={styles.rateSummary}>{formatCurrency(data.hourlyRate)} / heure</span>
              )}
            </div>
            {rateSaved && <span className={styles.savedBadge}>Sauvegardé ✓</span>}
          </div>
        </section>

        {/* Catalog */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <div>
              <h2 className={styles.sectionTitle}>Catalogue de tâches</h2>
              <p className={styles.sectionHint}>
                Ces tâches seront disponibles à ajouter dans vos estimations.
              </p>
            </div>
          </div>

          <ul className={styles.catalogList}>
            {data.catalog.map(task => (
              <li key={task.id} className={styles.catalogRow}>
                <input
                  className={styles.taskNameInput}
                  type="text"
                  defaultValue={task.name}
                  onBlur={e => handleNameBlur(task.id, e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
                  aria-label="Nom de la tâche"
                />
                <div className={styles.hoursWrapper}>
                  <input
                    className={styles.taskHoursInput}
                    type="number"
                    min="0"
                    step="0.5"
                    defaultValue={task.defaultHours}
                    onBlur={e => handleHoursBlur(task.id, e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
                    aria-label={`Heures par défaut pour ${task.name}`}
                  />
                  <span className={styles.hoursUnit}>h</span>
                </div>
                <button
                  className={styles.deleteBtn}
                  onClick={() => handleDelete(task.id, task.name)}
                  aria-label={`Supprimer ${task.name}`}
                  title="Supprimer"
                >
                  ×
                </button>
              </li>
            ))}

            {/* Inline new task row */}
            {newTask !== null && (
              <li className={`${styles.catalogRow} ${styles.newRow}`}>
                <input
                  ref={newNameRef}
                  className={styles.taskNameInput}
                  type="text"
                  placeholder="Nom de la tâche…"
                  value={newTask.name}
                  onChange={e => setNewTask(t => t ? { ...t, name: e.target.value } : t)}
                  onKeyDown={handleNewTaskKeyDown}
                  aria-label="Nom de la nouvelle tâche"
                />
                <div className={styles.hoursWrapper}>
                  <input
                    className={styles.taskHoursInput}
                    type="number"
                    min="0"
                    step="0.5"
                    value={newTask.hours}
                    onChange={e => setNewTask(t => t ? { ...t, hours: e.target.value } : t)}
                    onKeyDown={handleNewTaskKeyDown}
                    aria-label="Heures par défaut"
                  />
                  <span className={styles.hoursUnit}>h</span>
                </div>
                <div className={styles.newRowActions}>
                  <button className={styles.cancelNewBtn} onClick={cancelNewTask} title="Annuler">×</button>
                  <button
                    className={styles.confirmNewBtn}
                    onClick={commitNewTask}
                    disabled={!newTask.name.trim()}
                    title="Confirmer"
                  >
                    ✓
                  </button>
                </div>
              </li>
            )}
          </ul>

          {newTask === null && (
            <button className={styles.addTaskBtn} onClick={startNewTask}>
              <span>+</span> Nouvelle tâche
            </button>
          )}
        </section>

        <p className={styles.persistNote}>
          Toutes les modifications sont sauvegardées automatiquement.
        </p>
      </div>
    </div>
  );
}
