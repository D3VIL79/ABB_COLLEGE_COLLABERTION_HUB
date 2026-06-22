/**
 * High-Precision Telemetry Math Engines
 * Implements Ordinary Least Squares (OLS) Linear Regression and Time-Delta Calculators
 */

export interface ProgressCheckpoint {
  date: string;
  progress: number;
  note?: string;
}

/**
 * Parses checkpoint dates and returns the OLS linear regression slope representing velocity in progress percentage per day.
 * Slope formula:
 * m = (N*sum(xy) - sum(x)*sum(y)) / (N*sum(x^2) - (sum(x))^2)
 */
export function calculatePrecisionVelocity(history: ProgressCheckpoint[]): number {
  if (!history || history.length < 2) return 0;

  const N = history.length;
  const t0 = new Date(history[0].date).getTime();

  // Convert checkpoint dates to days elapsed since the first checkpoint
  const x = history.map(h => (new Date(h.date).getTime() - t0) / (1000 * 60 * 60 * 24));
  const y = history.map(h => h.progress);

  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumX2 = 0;

  for (let i = 0; i < N; i++) {
    sumX += x[i];
    sumY += y[i];
    sumXY += x[i] * y[i];
    sumX2 += x[i] * x[i];
  }

  const denominator = N * sumX2 - sumX * sumX;
  if (denominator === 0) {
    // Fallback to simple first-to-last delta if all checkpoints are at the same millisecond
    const lastIdx = N - 1;
    const timeDeltaDays = x[lastIdx];
    if (timeDeltaDays === 0) return 0;
    const progressDelta = y[lastIdx] - y[0];
    return Math.round((progressDelta / timeDeltaDays) * 1000) / 1000;
  }

  const slope = (N * sumXY - sumX * sumY) / denominator;
  
  // Return the precision slope rounded to 3 decimal places
  return Math.round(slope * 1000) / 1000;
}

/**
 * Calculates instantaneous velocity between the last two checkpoints in progress percentage per day.
 */
export function getInstantaneousVelocity(history: ProgressCheckpoint[]): number {
  if (!history || history.length < 2) return 0;

  const last = history[history.length - 1];
  const prev = history[history.length - 2];

  const tLast = new Date(last.date).getTime();
  const tPrev = new Date(prev.date).getTime();
  const timeDeltaDays = (tLast - tPrev) / (1000 * 60 * 60 * 24);

  if (timeDeltaDays <= 0) return 0;

  const progressDelta = last.progress - prev.progress;
  return Math.round((progressDelta / timeDeltaDays) * 1000) / 1000;
}

/**
 * Converts a velocity value into a descriptive badge label with emojis.
 */
export function getVelocityLabelFromVal(val: number): string {
  if (val > 15) return '🔥 Fast';
  if (val > 5) return '✅ Steady';
  if (val > 0) return '⚠️ Stalled';
  return '🔴 Stuck';
}
