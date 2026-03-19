// Match Score calculation - based on PRD_MatchScore.md

export const HEATING_SCORES = {
  'Varmepumpe': 5,
  'Jordvarme': 5,
  'Fjernvarme': 5,
  'Naturgas': 3,
  'Elvarme': 3,
  'Pillefyr': 2,
  'Oliefyr': 1,
  'Andet': 2,
};

export const CONDITION_SCORES = {
  'Indflytningsklar': 5,
  'Let renovering': 3,
  'Større renovering': 1,
};

export const HEATING_SOURCES = Object.keys(HEATING_SCORES);
export const CONDITIONS = Object.keys(CONDITION_SCORES);

export function getHeatingScore(heatingSource) {
  return HEATING_SCORES[heatingSource] ?? 2;
}

export function getConditionScore(condition) {
  return CONDITION_SCORES[condition] ?? 3;
}

// Dimension 1: Quiet score (noise + rural combined)
export function calcQuietScore(noiseScore, ruralScore) {
  const n = noiseScore ?? 3;
  const r = ruralScore ?? 3;
  const component = n * 0.6 + r * 0.4;
  return Math.min(100, Math.max(0, ((component - 1) / 4) * 100));
}

// Dimension 2: Distance score from drive time in minutes
export function calcDistanceScore(driveTimeMinutes) {
  if (driveTimeMinutes === null || driveTimeMinutes === undefined) return 50;
  if (driveTimeMinutes <= 20) return 100;
  if (driveTimeMinutes <= 30) return 85;
  if (driveTimeMinutes <= 45) return 60;
  if (driveTimeMinutes <= 60) return 35;
  if (driveTimeMinutes <= 90) return 15;
  return 0;
}

// Dimension 3: Condition score (physical condition + heating source)
export function calcConditionNorm(condition, heatingSource) {
  const cs = getConditionScore(condition);
  const hs = getHeatingScore(heatingSource);
  const component = cs * 0.6 + hs * 0.4;
  return Math.min(100, Math.max(0, ((component - 1) / 4) * 100));
}

// Dimension 4: Price score vs budget
export function calcPriceScore(price, maxBudget) {
  if (!maxBudget || !price) return null;
  if (price <= maxBudget * 0.75) return 100;
  if (price <= maxBudget * 0.90) return 80;
  if (price <= maxBudget) return 60;
  if (price <= maxBudget * 1.10) return 30;
  return 0;
}

export function calcMatchScore(property, settings) {
  const wq = settings.weight_quiet ?? 0.40;
  const wd = settings.weight_distance ?? 0.30;
  const wc = settings.weight_condition ?? 0.20;
  const wp = settings.weight_price ?? 0.10;
  const maxBudget = settings.max_budget;

  const quietScore = calcQuietScore(property.noise_score, property.rural_score);
  const distanceScore = calcDistanceScore(property.drive_time_minutes);
  const conditionNorm = calcConditionNorm(property.condition, property.heating_source);
  const priceScore = calcPriceScore(property.price, maxBudget);

  let weights = { quiet: wq, distance: wd, condition: wc, price: wp };

  // If no budget or no price, redistribute price weight across remaining dimensions
  if (priceScore === null) {
    const total = wq + wd + wc;
    if (total > 0) {
      weights = {
        quiet: wq / total,
        distance: wd / total,
        condition: wc / total,
        price: 0,
      };
    }
  }

  const total = Math.round(
    quietScore * weights.quiet +
    distanceScore * weights.distance +
    conditionNorm * weights.condition +
    (priceScore !== null ? priceScore * weights.price : 0)
  );

  const components = {
    quiet: {
      score: Math.round(quietScore),
      weight: weights.quiet,
      contribution: Math.round(quietScore * weights.quiet),
    },
    distance: {
      score: Math.round(distanceScore),
      weight: weights.distance,
      contribution: Math.round(distanceScore * weights.distance),
    },
    condition: {
      score: Math.round(conditionNorm),
      weight: weights.condition,
      contribution: Math.round(conditionNorm * weights.condition),
    },
    price: priceScore !== null ? {
      score: Math.round(priceScore),
      weight: weights.price,
      contribution: Math.round(priceScore * weights.price),
    } : null,
  };

  return { total: Math.min(100, Math.max(0, total)), components };
}

export function getScoreColorClass(score) {
  if (score >= 80) return { bg: 'bg-green-500', text: 'text-green-700', light: 'bg-green-50 text-green-700', badge: 'bg-green-100 text-green-800' };
  if (score >= 60) return { bg: 'bg-amber-400', text: 'text-amber-700', light: 'bg-amber-50 text-amber-700', badge: 'bg-amber-100 text-amber-800' };
  if (score >= 40) return { bg: 'bg-orange-500', text: 'text-orange-700', light: 'bg-orange-50 text-orange-700', badge: 'bg-orange-100 text-orange-800' };
  return { bg: 'bg-red-500', text: 'text-red-700', light: 'bg-red-50 text-red-700', badge: 'bg-red-100 text-red-800' };
}

export function getScoreLabel(score) {
  if (score >= 80) return 'Stærkt match';
  if (score >= 60) return 'Godt match';
  if (score >= 40) return 'Delvist match';
  return 'Svagt match';
}

export function getWeakestDimensionTip(components) {
  const entries = Object.entries(components).filter(([, v]) => v !== null);
  if (entries.length === 0) return null;
  const [key, val] = entries.reduce((a, b) => (a[1].score < b[1].score ? a : b));
  if (val.score >= 50) return null;
  const tips = {
    quiet: 'Støj eller trafik omkring ejendommen trækker scoren ned.',
    distance: 'Køretiden trækker afstandsscoren ned.',
    condition: 'Varmekilde eller renoveringsbehov reducerer denne score.',
    price: 'Prisen er over budget, hvilket reducerer scoren.',
  };
  return tips[key] ?? null;
}
