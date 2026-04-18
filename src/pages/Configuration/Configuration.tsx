import { useState, useEffect } from 'react';
import { useAppData } from '../../hooks/useLocalStorage';
import { TaskCard } from '../../components/TaskCard/TaskCard';
import { formatCurrency } from '../../utils/calculations';
import styles from './Configuration.module.css';

export function Configuration() {
  const {
    data,
    isLoading,
    updateHourlyRate,
    updateTaskHours,
    toggleTask,
    resetTaskToDefault,
    resetAllToDefaults,
  } = useAppData();

  const [rateInput, setRateInput] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      setRateInput(data.hourlyRate > 0 ? String(data.hourlyRate) : '');
    }
  }, [isLoading, data.hourlyRate]);

  function handleRateChange(e: React.ChangeEvent<HTMLInputElement>) {
    setRateInput(e.target.value);
  }

  function handleRateBlur() {
    const parsed = parseFloat(rateInput);
    if (!isNaN(parsed) && parsed >= 0) {
      updateHourlyRate(parsed);
      flash();
    } else if (rateInput === '') {
      updateHourlyRate(0);
      flash();
    } else {
      setRateInput(data.hourlyRate > 0 ? String(data.hourlyRate) : '');
    }
  }

  function handleRateKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
  }

  function flash() {
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  }

  function handleResetAll() {
    if (confirm('Remettre toutes les tâches à leurs valeurs par défaut ?')) {
      resetAllToDefaults();
    }
  }

  if (isLoading) {
    return <div className={styles.loading}>Chargement…</div>;
  }

  const hasModifications = data.taskCategories.some(
    t => t.currentHours !== t.defaultHours || !t.enabled
  );

  return (
    <div className={styles.page}>
      <div className={styles.container}>

        {/* Hourly rate section */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Taux horaire</h2>
          <div className={styles.rateCard}>
            <label className={styles.rateLabel} htmlFor="hourlyRate">
              Votre taux de facturation (CAD/heure)
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
                  onChange={handleRateChange}
                  onBlur={handleRateBlur}
                  onKeyDown={handleRateKeyDown}
                  aria-label="Taux horaire en dollars canadiens"
                />
                <span className={styles.rateUnit}>/h</span>
              </div>
              {data.hourlyRate > 0 && (
                <span className={styles.rateSummary}>
                  {formatCurrency(data.hourlyRate)} / heure
                </span>
              )}
            </div>
            {saved && <span className={styles.savedBadge}>Sauvegardé ✓</span>}
          </div>
        </section>

        {/* Tasks section */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <div>
              <h2 className={styles.sectionTitle}>Catégories de tâches</h2>
              <p className={styles.sectionHint}>
                Activez/désactivez les tâches et ajustez les heures estimées.
              </p>
            </div>
            {hasModifications && (
              <button className={styles.resetAllBtn} onClick={handleResetAll}>
                Réinitialiser tout
              </button>
            )}
          </div>

          <ul className={styles.taskList}>
            {data.taskCategories.map(task => (
              <li key={task.id}>
                <TaskCard
                  task={task}
                  hourlyRate={data.hourlyRate}
                  mode="editable"
                  onHoursChange={updateTaskHours}
                  onReset={resetTaskToDefault}
                  onToggle={toggleTask}
                />
              </li>
            ))}
          </ul>
        </section>

        <p className={styles.persistNote}>
          Toutes les modifications sont sauvegardées automatiquement dans votre navigateur.
        </p>
      </div>
    </div>
  );
}
