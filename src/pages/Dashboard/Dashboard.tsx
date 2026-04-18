import { useState, useEffect } from 'react';
import { useAppData } from '../../hooks/useLocalStorage';
import { AddTaskMenu } from '../../components/AddTaskMenu/AddTaskMenu';
import { calculateTotalHours, calculateTotalCost, formatCurrency } from '../../utils/calculations';
import styles from './Dashboard.module.css';

export function Dashboard() {
  const {
    data,
    isLoading,
    effectiveRate,
    updateEstimationRate,
    resetEstimationRate,
    addFromCatalog,
    addAdHocTask,
    updateEstimationHours,
    removeEstimationTask,
    clearEstimation,
  } = useAppData();

  const [inputValues, setInputValues] = useState<Record<string, string>>({});
  const [rateInput, setRateInput] = useState('');

  useEffect(() => {
    if (!isLoading) setRateInput(effectiveRate > 0 ? String(effectiveRate) : '');
  }, [isLoading, effectiveRate]);

  useEffect(() => {
    const map: Record<string, string> = {};
    data.estimation.forEach(t => { map[t.id] = String(t.hours); });
    setInputValues(map);
  }, [data.estimation]);

  if (isLoading) return <div className={styles.loading}>Chargement…</div>;

  const totalHours = calculateTotalHours(data.estimation);
  const totalCost = calculateTotalCost(totalHours, effectiveRate);
  const hasRate = effectiveRate > 0;
  const isOverriding = data.estimationRate !== undefined;

  function handleRateBlur() {
    const parsed = parseFloat(rateInput);
    if (!isNaN(parsed) && parsed >= 0) updateEstimationRate(parsed);
    else if (rateInput === '') { resetEstimationRate(); setRateInput(''); }
    else setRateInput(effectiveRate > 0 ? String(effectiveRate) : '');
  }

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
            <div className={styles.rateLabel}>
              <label className={styles.label} htmlFor="dashRate">Taux horaire</label>
              {isOverriding && (
                <button
                  className={styles.resetRateBtn}
                  onClick={() => { resetEstimationRate(); }}
                  title={`Revenir au taux de base ($${data.hourlyRate}/h)`}
                >
                  ↺ {data.hourlyRate}$/h
                </button>
              )}
            </div>
            <div className={styles.rateWrapper}>
              <span className={styles.rateCurrency}>$</span>
              <input
                id="dashRate"
                className={`${styles.rateInput} ${isOverriding ? styles.rateOverriding : ''}`}
                type="number"
                min="0"
                step="5"
                placeholder={String(data.hourlyRate || 0)}
                value={rateInput}
                onChange={e => setRateInput(e.target.value)}
                onBlur={handleRateBlur}
                onKeyDown={e => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
                aria-label="Taux horaire pour cette estimation"
              />
              <span className={styles.rateUnit}>/h</span>
            </div>
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
      </div>
    </div>
  );
}
