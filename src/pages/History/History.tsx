import { useNavigate } from 'react-router-dom';
import { useAppData } from '../../hooks/useLocalStorage';
import { calculateTotalHours, calculateTotalCost, formatCurrency } from '../../utils/calculations';
import styles from './History.module.css';

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('fr-CA', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function History() {
  const { data, isLoading, loadEstimation, deleteEstimation } = useAppData();
  const navigate = useNavigate();

  if (isLoading) return <div className={styles.loading}>Chargement…</div>;

  function handleLoad(id: string) {
    loadEstimation(id);
    navigate('/');
  }

  function handleDelete(id: string, title: string) {
    if (!confirm(`Supprimer l'estimation "${title}" ?`)) return;
    deleteEstimation(id);
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.pageTitle}>Historique des estimations</h1>
          <span className={styles.count}>{data.estimationHistory.length}</span>
        </div>

        {data.estimationHistory.length === 0 ? (
          <div className={styles.empty}>
            <p>Aucune estimation sauvegardée.</p>
            <p>Créez une estimation sur le tableau de bord et cliquez sur « Sauvegarder ».</p>
          </div>
        ) : (
          <ul className={styles.list}>
            {data.estimationHistory.map(est => {
              const totalHours = calculateTotalHours(est.tasks);
              const totalCost = est.hourlyRate > 0 ? calculateTotalCost(totalHours, est.hourlyRate) : null;
              const isActive = data.currentEstimation.id === est.id;

              return (
                <li key={est.id} className={`${styles.card} ${isActive ? styles.active : ''}`}>
                  <div className={styles.cardMain}>
                    <div className={styles.cardLeft}>
                      <div className={styles.cardTitleRow}>
                        <span className={styles.cardTitle}>{est.title || 'Sans titre'}</span>
                        {isActive && <span className={styles.activeBadge}>En cours</span>}
                      </div>
                      {est.client && (
                        <span className={styles.cardClient}>{est.client}</span>
                      )}
                      {est.description && (
                        <span className={styles.cardDesc}>{est.description}</span>
                      )}
                    </div>
                    <div className={styles.cardRight}>
                      <div className={styles.cardStat}>
                        <span className={styles.statLabel}>Heures</span>
                        <span className={styles.statValue}>{totalHours}h</span>
                      </div>
                      {totalCost !== null && (
                        <div className={styles.cardStat}>
                          <span className={styles.statLabel}>Total</span>
                          <span className={`${styles.statValue} ${styles.statTotal}`}>{formatCurrency(totalCost)}</span>
                        </div>
                      )}
                      <div className={styles.cardStat}>
                        <span className={styles.statLabel}>Tâches</span>
                        <span className={styles.statValue}>{est.tasks.length}</span>
                      </div>
                    </div>
                  </div>
                  <div className={styles.cardFooter}>
                    <div className={styles.cardDates}>
                      <span className={styles.cardDate}>Créé le {formatDate(est.createdAt)}</span>
                      {est.updatedAt !== est.createdAt && (
                        <span className={styles.cardDate}>Modifié le {formatDate(est.updatedAt)}</span>
                      )}
                    </div>
                    <div className={styles.cardActions}>
                      <button
                        className={styles.loadBtn}
                        onClick={() => handleLoad(est.id)}
                      >
                        Charger
                      </button>
                      <button
                        className={styles.deleteBtn}
                        onClick={() => handleDelete(est.id, est.title || 'Sans titre')}
                        aria-label={`Supprimer ${est.title || 'Sans titre'}`}
                      >
                        Supprimer
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
