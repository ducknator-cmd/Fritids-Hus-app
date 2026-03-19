// localStorage persistence layer

const PROPERTIES_KEY = 'fritidshus_properties';
const SETTINGS_KEY   = 'fritidshus_settings';
const COMPARE_KEY    = 'fritidshus_compare_ids';
const FILTERS_KEY    = 'fritidshus_filters';
const SORT_KEY       = 'fritidshus_sort';

export const DEFAULT_SETTINGS = {
  id: 1,
  home_address: '',
  max_drive_minutes: 60,
  weight_quiet: 0.40,
  weight_distance: 0.30,
  weight_condition: 0.20,
  weight_price: 0.10,
  max_budget: null,
};

export const DEFAULT_FILTERS = {
  maxDriveMinutes: null,
  maxPrice: null,
  minPlotArea: null,
  heatingSources: [],
  flexbolig: 'all',      // 'all' | 'yes' | 'possible'
  conditions: [],
  categories: [],
  showArchived: false,
};

// ── Properties ──────────────────────────────────────────────────────────────

function parse(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function getProperties() {
  return parse(PROPERTIES_KEY, []);
}

export function saveProperties(list) {
  localStorage.setItem(PROPERTIES_KEY, JSON.stringify(list));
}

export function getPropertyById(id) {
  return getProperties().find(p => p.id === id) ?? null;
}

export function upsertProperty(property) {
  const all = getProperties();
  const idx = all.findIndex(p => p.id === property.id);
  if (idx >= 0) {
    all[idx] = property;
  } else {
    all.unshift(property); // newest first
  }
  saveProperties(all);
  return property;
}

export function deleteProperty(id) {
  saveProperties(getProperties().filter(p => p.id !== id));
}

// ── Settings ─────────────────────────────────────────────────────────────────

export function getSettings() {
  return { ...DEFAULT_SETTINGS, ...parse(SETTINGS_KEY, {}) };
}

export function saveSettings(settings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

// ── Compare IDs ───────────────────────────────────────────────────────────────

export function getCompareIds() {
  return parse(COMPARE_KEY, []);
}

export function saveCompareIds(ids) {
  localStorage.setItem(COMPARE_KEY, JSON.stringify(ids));
}

// ── Filters ───────────────────────────────────────────────────────────────────

export function getFilters() {
  return { ...DEFAULT_FILTERS, ...parse(FILTERS_KEY, {}) };
}

export function saveFilters(f) {
  localStorage.setItem(FILTERS_KEY, JSON.stringify(f));
}

// ── Sort ──────────────────────────────────────────────────────────────────────

export function getSort() {
  return localStorage.getItem(SORT_KEY) ?? 'match_score_desc';
}

export function saveSort(sort) {
  localStorage.setItem(SORT_KEY, sort);
}
