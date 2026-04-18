import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAppData } from '../../hooks/useLocalStorage';
import { AddTaskMenu } from '../../components/AddTaskMenu/AddTaskMenu';
import { calculateTotalHours, calculateTotalCost, formatCurrency } from '../../utils/calculations';
import styles from './Dashboard.module.css';

export function Dashboard() {
  const {
    data,
    isLoading,
    addFromCatalog,
    addAdHocTask,
    updateEstimationHours,
    removeEstimationTask,
    clearEstimation,
  } = useAppData();

  const [inputValues, setInputValues] = useState<Record<string, string>>({});

  // Sync input values when estimation changes externally
  useEffect(() => {
    const map: Record<string, string> = {};
    data.estimation.forEach(t => { map[t.id] = String(t.hours); });
    setInputValues(map);
  }, [data.estimation]);

  if (isLoading) return <div className={styles.loading}>Chargement…</div>;

  const totalHours = calculateTotalHours(data.estimation);
  const totalCost = calculateTotalCost(totalHours, data.hourlyRate);
  const hasRate = data.hourlyRate > 0;

  function handleHoursChange(id: string, value: string) {
    setInputValues(prev => ({ ...prev, [id]: value }));
    const parsed = parseFloat(value);
    if (!isNaN(parsed) && parsed >= 0) updateEstimationHours(id, parsed);
  }

  function handleHoursBlur(id: string, value: string) {
    const parsed = parseFloat(value);
    if (isNaN(parsed) || parsed < 0) {
      const task = data.estimation.find(t => t.id === id);
      if (task) setInputValues(prev => ({ ...prev, [id]: String(task.hours) }));
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>

        {/* Summary */}
        <div className={styles.summary}>
          <div className={styles.summaryItem}>
            <span className={styles.label}>Taux horaire</span>
            <span className={styles.value}>
              {hasRate
                ? `${formatCurrency(data.hourlyRate)}/h`
                : <Link to="/config" className={styles.configLink}>Configurer →</Link>}
            </span>
          </div>
          <div className={styles.divider} />
          <div className={styles.summaryItem}>
            <span className={styles.label}>Total heures</span>
            <span className={styles.value}>{totalHours}h</span>
          </div>
          {hasRate && (
            <>
              <div className={styles.divider} />
              <div className={styles.summaryItem}>
                <span className={styles.label}>Estimation totale</span>
                <span className={`${styles.value} ${styles.total}`}>{formatCurrency(totalCost)}</span>
              </div>
            </>
          )}
        </div>

        {/* Task list */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>
              Tâches
              {data.estimation.length > 0 && (
                <span className={styles.badge}>{data.estimation.length}</span>
              )}
            </h2>
            {data.estimation.length > 0 && (
              <button
                className={styles.clearBtn}
                onClick={() => { if (confirm('Vider l\'estimation ?')) clearEstimation(); }}
              >
                Tout effacer
              </button>
            )}
          </div>

          {data.estimation.length === 0 ? (
            <div className={styles.empty}>
              <p>Aucune tâche ajoutée.</p>
              <p>Utilisez le bouton ci-dessous pour commencer votre estimation.</p>
            </div>
          ) : (
            <ul className={styles.taskList}>
              {data.estimation.map(task => {
                const taskCost = hasRate ? task.hours * data.hourlyRate : null;
                return (
                  <li key={task.id} className={styles.taskRow}>
                    <div className={styles.taskInfo}>
                      <span className={styles.taskName}>{task.name}</span>
                      {!task.catalogId && (
                        <span className={styles.adHocBadge}>personnalisée</span>
                      )}
                    </div>
                    <div className={styles.taskControls}>
                      {taskCost !== null && (
                        <span className={styles.taskCost}>{formatCurrency(taskCost)}</span>
                      )}
                      <div className={styles.hoursWrapper}>
                        <input
                          className={styles.hoursInput}
                          type="number"
                          min="0"
                          step="0.5"
                          value={inputValues[task.id] ?? String(task.hours)}
                          onChange={e => handleHoursChange(task.id, e.target.value)}
                          onBlur={e => handleHoursBlur(task.id, e.target.value)}
                          aria-label={`Heures pour ${task.name}`}
                        />
                        <span className={styles.hoursUnit}>h</span>
                      </div>
                      <button
                        className={styles.removeBtn}
                        onClick={() => removeEstimationTask(task.id)}
                        aria-label={`Retirer ${task.name}`}
                        title="Retirer cette tâche"
                      >
                        ×
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}

          <AddTaskMenu
            catalog={data.catalog}
            onAddFromCatalog={addFromCatalog}
            onAddAdHoc={addAdHocTask}
          />
        </section>

        {!hasRate && data.estimation.length > 0 && (
          <p className={styles.hint}>
            <Link to="/config" className={styles.configLink}>Configurez votre taux horaire</Link>{' '}
            pour voir le coût estimé.
          </p>
        )}
      </div>
    </div>
  );
}
