import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import {
  getProperties, upsertProperty as storageUpsert, deleteProperty as storageDelete,
  getSettings, saveSettings,
  getCompareIds, saveCompareIds,
  getFilters, saveFilters,
  getSort, saveSort,
  DEFAULT_SETTINGS, DEFAULT_FILTERS,
} from '../lib/storage';
import { calcMatchScore } from '../lib/matchScore';
import { getDriveTimeMinutes, hasTravelTimeApiKey } from '../lib/travelTime';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [properties, setProperties]       = useState([]);
  const [settings, setSettings]           = useState(DEFAULT_SETTINGS);
  const [compareIds, setCompareIdsState]  = useState([]);
  const [filters, setFiltersState]        = useState(DEFAULT_FILTERS);
  const [sort, setSortState]              = useState('match_score_desc');
  const [toast, setToast]                 = useState(null);

  // Load from storage on first render
  useEffect(() => {
    setProperties(getProperties());
    setSettings(getSettings());
    setCompareIdsState(getCompareIds());
    setFiltersState(getFilters());
    setSortState(getSort());
  }, []);

  // ── Toast ─────────────────────────────────────────────────────────────────
  const showToast = useCallback((message, type = 'info') => {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => setToast(null), 3500);
  }, []);

  // ── Properties ────────────────────────────────────────────────────────────
  const refreshProperties = useCallback(() => {
    setProperties(getProperties());
  }, []);

  const upsertProperty = useCallback(async (data) => {
    const stgs = getSettings();
    const now  = new Date().toISOString();
    const isNew = !data.id;

    const property = {
      status: 'active',
      ...data,
      id:         data.id || uuidv4(),
      created_at: data.created_at || now,
      updated_at: now,
    };

    // Derive heating_score from heating_source
    const { getHeatingScore, getConditionScore } = await import('../lib/matchScore');
    property.heating_score = getHeatingScore(property.heating_source);
    property.condition_score = getConditionScore(property.condition);

    // Calculate match score
    property.match_score = calcMatchScore(property, stgs).total;

    storageUpsert(property);
    refreshProperties();

    // Async travel time – fire and forget, update when done
    const addressChanged = isNew || data._addressChanged;
    if (addressChanged && property.address && hasTravelTimeApiKey() && stgs.home_address) {
      getDriveTimeMinutes(stgs.home_address, property.address)
        .then(minutes => {
          const updated = { ...property, drive_time_minutes: minutes };
          updated.match_score = calcMatchScore(updated, stgs).total;
          storageUpsert(updated);
          refreshProperties();
        })
        .catch(err => console.warn('Rejsetid fejlede:', err.message));
    }

    return property;
  }, [refreshProperties]);

  const removeProperty = useCallback((id) => {
    storageDelete(id);
    // Also remove from compare
    const next = getCompareIds().filter(cid => cid !== id);
    saveCompareIds(next);
    setCompareIdsState(next);
    refreshProperties();
  }, [refreshProperties]);

  const updatePropertyField = useCallback((id, field, value) => {
    const stgs = getSettings();
    const all  = getProperties();
    const idx  = all.findIndex(p => p.id === id);
    if (idx < 0) return;
    const updated = { ...all[idx], [field]: value };
    updated.match_score = calcMatchScore(updated, stgs).total;
    storageUpsert(updated);
    refreshProperties();
  }, [refreshProperties]);

  // ── Settings ──────────────────────────────────────────────────────────────
  const updateSettings = useCallback((newSettings) => {
    saveSettings(newSettings);
    setSettings(newSettings);
    // Recalculate all match scores after weight/budget change
    const all = getProperties();
    all.forEach(p => {
      const updated = { ...p, match_score: calcMatchScore(p, newSettings).total };
      storageUpsert(updated);
    });
    refreshProperties();
  }, [refreshProperties]);

  // ── Compare ───────────────────────────────────────────────────────────────
  const toggleCompare = useCallback((id) => {
    const current = getCompareIds();
    if (current.includes(id)) {
      const next = current.filter(cid => cid !== id);
      saveCompareIds(next);
      setCompareIdsState(next);
    } else if (current.length >= 3) {
      showToast('Maksimalt 3 boliger kan sammenlignes ad gangen.', 'warning');
    } else {
      const next = [...current, id];
      saveCompareIds(next);
      setCompareIdsState(next);
    }
  }, [showToast]);

  const clearCompare = useCallback(() => {
    saveCompareIds([]);
    setCompareIdsState([]);
  }, []);

  // ── Filters ───────────────────────────────────────────────────────────────
  const setFilters = useCallback((f) => {
    saveFilters(f);
    setFiltersState(f);
  }, []);

  const resetFilters = useCallback(() => {
    saveFilters(DEFAULT_FILTERS);
    setFiltersState({ ...DEFAULT_FILTERS });
  }, []);

  // ── Sort ──────────────────────────────────────────────────────────────────
  const setSort = useCallback((s) => {
    saveSort(s);
    setSortState(s);
  }, []);

  return (
    <AppContext.Provider value={{
      properties,
      settings,
      compareIds,
      filters,
      sort,
      toast,
      upsertProperty,
      removeProperty,
      updatePropertyField,
      updateSettings,
      toggleCompare,
      clearCompare,
      setFilters,
      resetFilters,
      setSort,
      showToast,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
