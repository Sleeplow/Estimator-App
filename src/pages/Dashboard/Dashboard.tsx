import { Link } from 'react-router-dom';
import { useAppData } from '../../hooks/useLocalStorage';
import { TaskCard } from '../../components/TaskCard/TaskCard';
import {
  calculateTotalHours,
  calculateTotalCost,
  formatCurrency,
} from '../../utils/calculations';
import styles from './Dashboard.module.css';

export function Dashboard() {
  const { data, isLoading } = useAppData();

  if (isLoading) {
    return <div className={styles.loading}>Chargement…</div>;
  }

  const enabledTasks = data.taskCategories.filter(t => t.enabled);
  const totalHours = calculateTotalHours(data.taskCategories);
  const totalCost = calculateTotalCost(totalHours, data.hourlyRate);
  const hasRate = data.hourlyRate > 0;

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* Summary card */}
        <div className={styles.summary}>
          <div className={styles.summaryItem}>
            <span className={styles.summaryLabel}>Taux horaire</span>
            <span className={styles.summaryValue}>
              {hasRate ? formatCurrency(data.hourlyRate) + '/h' : (
                <Link to="/config" className={styles.configLink}>Configurer →</Link>
              )}
            </span>
          </div>
          <div className={styles.divider} />
          <div className={styles.summaryItem}>
            <span className={styles.summaryLabel}>Total heures</span>
            <span className={styles.summaryValue}>{totalHours}h</span>
          </div>
          {hasRate && (
            <>
              <div className={styles.divider} />
              <div className={styles.summaryItem}>
                <span className={styles.summaryLabel}>Estimation totale</span>
                <span className={`${styles.summaryValue} ${styles.totalCost}`}>
                  {formatCurrency(totalCost)}
                </span>
              </div>
            </>
          )}
        </div>

        {/* Task list */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Tâches incluses</h2>
            <span className={styles.badge}>{enabledTasks.length} / {data.taskCategories.length}</span>
          </div>

          {enabledTasks.length === 0 ? (
            <div className={styles.empty}>
              Aucune tâche active.{' '}
              <Link to="/config" className={styles.configLink}>Configurer →</Link>
            </div>
          ) : (
            <ul className={styles.taskList}>
              {data.taskCategories.filter(t => t.enabled).map(task => (
                <li key={task.id}>
                  <TaskCard
                    task={task}
                    hourlyRate={data.hourlyRate}
                    mode="readonly"
                  />
                </li>
              ))}
            </ul>
          )}
        </section>

        {!hasRate && (
          <div className={styles.hint}>
            Configurez votre taux horaire pour voir le coût estimé de chaque tâche.
          </div>
        )}
      </div>
    </div>
  );
}
