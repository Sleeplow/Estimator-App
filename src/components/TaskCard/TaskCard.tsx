import { useState, useEffect } from 'react';
import { TaskCategory } from '../../types';
import { formatCurrency, calculateTaskCost } from '../../utils/calculations';
import styles from './TaskCard.module.css';

interface TaskCardReadonlyProps {
  task: TaskCategory;
  hourlyRate: number;
  mode: 'readonly';
}

interface TaskCardEditableProps {
  task: TaskCategory;
  hourlyRate: number;
  mode: 'editable';
  onHoursChange: (taskId: string, hours: number) => void;
  onReset: (taskId: string) => void;
  onToggle: (taskId: string) => void;
}

type TaskCardProps = TaskCardReadonlyProps | TaskCardEditableProps;

export function TaskCard(props: TaskCardProps) {
  const { task, hourlyRate, mode } = props;
  const [inputValue, setInputValue] = useState(String(task.currentHours));

  useEffect(() => {
    setInputValue(String(task.currentHours));
  }, [task.currentHours]);

  const cost = calculateTaskCost(task, hourlyRate);
  const isModified = task.currentHours !== task.defaultHours;

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setInputValue(val);
    const parsed = parseFloat(val);
    if (!isNaN(parsed) && parsed >= 0 && mode === 'editable') {
      (props as TaskCardEditableProps).onHoursChange(task.id, parsed);
    }
  }

  function handleBlur() {
    const parsed = parseFloat(inputValue);
    if (isNaN(parsed) || parsed < 0) {
      setInputValue(String(task.currentHours));
    }
  }

  return (
    <div className={`${styles.card} ${!task.enabled ? styles.disabled : ''}`}>
      <div className={styles.left}>
        {mode === 'editable' && (
          <button
            className={styles.toggle}
            onClick={() => (props as TaskCardEditableProps).onToggle(task.id)}
            title={task.enabled ? 'Désactiver cette tâche' : 'Activer cette tâche'}
            aria-label={task.enabled ? 'Désactiver' : 'Activer'}
          >
            <span className={`${styles.toggleDot} ${task.enabled ? styles.on : ''}`} />
          </button>
        )}
        <div className={styles.info}>
          <span className={styles.name}>{task.name}</span>
          {mode === 'editable' && (
            <span className={styles.default}>défaut: {task.defaultHours}h</span>
          )}
        </div>
      </div>

      <div className={styles.right}>
        {mode === 'editable' ? (
          <div className={styles.controls}>
            <div className={styles.inputWrapper}>
              <input
                className={`${styles.hoursInput} ${isModified ? styles.modified : ''}`}
                type="number"
                min="0"
                step="0.5"
                value={inputValue}
                onChange={handleChange}
                onBlur={handleBlur}
                disabled={!task.enabled}
                aria-label={`Heures pour ${task.name}`}
              />
              <span className={styles.unit}>h</span>
            </div>
            {isModified && (
              <button
                className={styles.resetBtn}
                onClick={() => (props as TaskCardEditableProps).onReset(task.id)}
                title="Remettre à la valeur par défaut"
                disabled={!task.enabled}
              >
                ↺
              </button>
            )}
          </div>
        ) : (
          <span className={styles.hours}>{task.currentHours}h</span>
        )}

        {hourlyRate > 0 && (
          <span className={`${styles.cost} ${!task.enabled ? styles.costDisabled : ''}`}>
            {task.enabled ? formatCurrency(cost) : '—'}
          </span>
        )}
      </div>
    </div>
  );
}
