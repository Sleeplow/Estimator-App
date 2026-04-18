import { useState, useRef, useEffect } from 'react';
import { CatalogTask } from '../../types';
import styles from './AddTaskMenu.module.css';

interface AddTaskMenuProps {
  catalog: CatalogTask[];
  onAddFromCatalog: (task: CatalogTask) => void;
  onAddAdHoc: (name: string, hours: number) => void;
}

export function AddTaskMenu({ catalog, onAddFromCatalog, onAddAdHoc }: AddTaskMenuProps) {
  const [open, setOpen] = useState(false);
  const [adHocMode, setAdHocMode] = useState(false);
  const [adHocName, setAdHocName] = useState('');
  const [adHocHours, setAdHocHours] = useState('1');
  const [search, setSearch] = useState('');
  const menuRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open && !adHocMode) searchRef.current?.focus();
    if (adHocMode) nameRef.current?.focus();
  }, [open, adHocMode]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        closeMenu();
      }
    }
    if (open) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  function closeMenu() {
    setOpen(false);
    setAdHocMode(false);
    setAdHocName('');
    setAdHocHours('1');
    setSearch('');
  }

  function handleCatalogSelect(task: CatalogTask) {
    onAddFromCatalog(task);
    closeMenu();
  }

  function handleAdHocSubmit() {
    const name = adHocName.trim();
    const hours = parseFloat(adHocHours);
    if (!name || isNaN(hours) || hours < 0) return;
    onAddAdHoc(name, hours);
    closeMenu();
  }

  function handleAdHocKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') handleAdHocSubmit();
    if (e.key === 'Escape') closeMenu();
  }

  const filtered = catalog.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className={styles.wrapper} ref={menuRef}>
      <button
        className={styles.trigger}
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <span className={styles.plus}>+</span>
        Ajouter une tâche
      </button>

      {open && (
        <div className={styles.menu} role="dialog" aria-label="Ajouter une tâche">
          {!adHocMode ? (
            <>
              <div className={styles.searchWrapper}>
                <input
                  ref={searchRef}
                  className={styles.search}
                  type="text"
                  placeholder="Rechercher..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  onKeyDown={e => e.key === 'Escape' && closeMenu()}
                />
              </div>

              <ul className={styles.list} role="listbox">
                {filtered.length > 0 ? (
                  filtered.map(task => (
                    <li key={task.id}>
                      <button
                        className={styles.item}
                        role="option"
                        onClick={() => handleCatalogSelect(task)}
                      >
                        <span className={styles.itemName}>{task.name}</span>
                        <span className={styles.itemHours}>{task.defaultHours}h</span>
                      </button>
                    </li>
                  ))
                ) : (
                  <li className={styles.empty}>Aucune tâche trouvée</li>
                )}
              </ul>

              <div className={styles.divider} />

              <button
                className={styles.adHocTrigger}
                onClick={() => setAdHocMode(true)}
              >
                <span className={styles.editIcon}>✏️</span>
                Tâche personnalisée…
              </button>
            </>
          ) : (
            <div className={styles.adHocForm}>
              <p className={styles.adHocTitle}>Tâche personnalisée</p>
              <input
                ref={nameRef}
                className={styles.adHocInput}
                type="text"
                placeholder="Description de la tâche"
                value={adHocName}
                onChange={e => setAdHocName(e.target.value)}
                onKeyDown={handleAdHocKeyDown}
              />
              <div className={styles.adHocRow}>
                <div className={styles.hoursWrapper}>
                  <input
                    className={styles.adHocHours}
                    type="number"
                    min="0"
                    step="0.5"
                    value={adHocHours}
                    onChange={e => setAdHocHours(e.target.value)}
                    onKeyDown={handleAdHocKeyDown}
                    aria-label="Nombre d'heures"
                  />
                  <span className={styles.hoursUnit}>h</span>
                </div>
                <div className={styles.adHocActions}>
                  <button
                    className={styles.cancelBtn}
                    onClick={() => setAdHocMode(false)}
                  >
                    ←
                  </button>
                  <button
                    className={styles.confirmBtn}
                    onClick={handleAdHocSubmit}
                    disabled={!adHocName.trim()}
                  >
                    Ajouter
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
