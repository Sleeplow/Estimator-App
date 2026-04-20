import { useState, useEffect, useRef } from 'react';
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
    updateCurrentMeta,
    saveEstimation,
    deleteAndClearEstimation,
    newEstimation,
  } = useAppData();

  const [inputValues, setInputValues] = useState<Record<string, string>>({});
  const [rateInput, setRateInput] = useState('');
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (!isLoading) setRateInput(effectiveRate > 0 ? String(effectiveRate) : '');
  }, [isLoading, effectiveRate]);

  useEffect(() => {
    const map: Record<string, string> = {};
    data.estimation.forEach(t => { map[t.id] = String(t.hours); });
    setInputValues(map);
  }, [data.estimation]);

  // Auto-save when estimation already has an ID and content changes
  useEffect(() => {
    if (isLoading || !data.currentEstimation.id) return;
    clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(saveEstimation, 800);
    return () => clearTimeout(autoSaveTimer.current);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    data.estimation,
    data.estimationRate,
    data.currentEstimation.title,
    data.currentEstimation.client,
    data.currentEstimation.description,
  ]);

  if (isLoading) return <div className={styles.loading}>Chargement…</div>;

  const totalHours = calculateTotalHours(data.estimation);
  const totalCost = calculateTotalCost(totalHours, effectiveRate);
  const hasRate = effectiveRate > 0;
  const isOverriding = data.estimationRate !== undefined;
  const isSaved = Boolean(data.currentEstimation.id);

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

  function handleNew() {
    if (data.estimation.length > 0 && !confirm('Commencer une nouvelle estimation ? Les tâches non sauvegardées seront perdues.')) return;
    newEstimation();
  }

  function handleDelete() {
    if (!data.currentEstimation.id) return;
    if (!confirm('Supprimer cette estimation de l\'historique ?')) return;
    deleteAndClearEstimation(data.currentEstimation.id);
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>

        {/* Action card — Nouvelle estimation + Enregistrer/Supprimer */}
        <div className={styles.actionCard}>
          <button className={styles.newEstimBtn} onClick={handleNew}>
            <svg className={styles.btnIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Nouvelle estimation
          </button>
          {isSaved ? (
            <button className={`${styles.actionBtn} ${styles.deleteBtn}`} onClick={handleDelete} aria-label="Supprimer cette estimation">
              <svg className={styles.btnIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                <path d="M10 11v6M14 11v6" />
                <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
              </svg>
              Supprimer
            </button>
          ) : (
            <button className={`${styles.actionBtn} ${styles.saveBtn}`} onClick={saveEstimation} aria-label="Enregistrer cette estimation">
              <svg className={styles.btnIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                <polyline points="17 21 17 13 7 13 7 21" />
                <polyline points="7 3 7 8 15 8" />
              </svg>
              Enregistrer
            </button>
          )}
        </div>

        {/* Estimation meta */}
        <div className={styles.metaCard}>
          <input
            className={styles.titleInput}
            type="text"
            placeholder="Titre de l'estimation"
            value={data.currentEstimation.title}
            onChange={e => updateCurrentMeta({ title: e.target.value })}
            aria-label="Titre de l'estimation"
          />
          <div className={styles.metaFields}>
            <input
              className={styles.metaInput}
              type="text"
              placeholder="Client"
              value={data.currentEstimation.client}
              onChange={e => updateCurrentMeta({ client: e.target.value })}
              aria-label="Nom du client"
            />
            <input
              className={`${styles.metaInput} ${styles.metaDescription}`}
              type="text"
              placeholder="Description (optionnel)"
              value={data.currentEstimation.description}
              onChange={e => updateCurrentMeta({ description: e.target.value })}
              aria-label="Description de l'estimation"
            />
          </div>
        </div>

        {/* Summary */}
        <div className={styles.summary}>
          <div className={styles.summaryItem}>
            <div className={styles.rateLabel}>
              <label className={styles.label} htmlFor="dashRate">Taux horaire</label>
              {isOverriding && (
                <button
                  className={styles.resetRateBtn}
                  onClick={resetEstimationRate}
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
                const catalogTask = task.catalogId
                  ? data.catalog.find(c => c.id === task.catalogId)
                  : undefined;
                const isHoursModified = catalogTask !== undefined && task.hours !== catalogTask.defaultHours;
                const taskCost = hasRate ? task.hours * effectiveRate : null;

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
                      {isHoursModified && catalogTask && (
                        <button
                          className={styles.resetHoursBtn}
                          onClick={() => updateEstimationHours(task.id, catalogTask.defaultHours)}
                          title={`Revenir aux heures par défaut (${catalogTask.defaultHours}h)`}
                        >
                          ↺ {catalogTask.defaultHours}h
                        </button>
                      )}
                      <div className={styles.hoursWrapper}>
                        <input
                          className={`${styles.hoursInput} ${isHoursModified ? styles.hoursModified : ''}`}
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
