export interface KMeansResult {
  assignments: number[];
  centroids: number[][];
  iterations: number;
}

export interface NormParams {
  means: number[];
  stds: number[];
}

export function euclidean(a: number[], b: number[]): number {
  let sum = 0;
  for (let i = 0; i < a.length; i++) {
    const d = a[i] - b[i];
    sum += d * d;
  }
  return Math.sqrt(sum);
}

export function computeNormParams(data: number[][]): NormParams {
  if (data.length === 0) return { means: [], stds: [] };
  const cols = data[0].length;
  const means: number[] = Array(cols).fill(0);
  const stds: number[] = Array(cols).fill(1);

  for (let j = 0; j < cols; j++) {
    let sum = 0;
    for (const row of data) sum += row[j];
    means[j] = sum / data.length;
  }
  for (let j = 0; j < cols; j++) {
    let sq = 0;
    for (const row of data) sq += (row[j] - means[j]) ** 2;
    stds[j] = Math.sqrt(sq / data.length) || 1;
  }
  return { means, stds };
}

export function normalizeWithParams(
  data: number[][],
  params: NormParams,
): number[][] {
  return data.map((row) =>
    row.map((v, j) => (v - params.means[j]) / params.stds[j]),
  );
}

export function assignAll(
  normalizedData: number[][],
  centroids: number[][],
): number[] {
  return normalizedData.map((row) => {
    let best = 0;
    let bestDist = Number.POSITIVE_INFINITY;
    for (let c = 0; c < centroids.length; c++) {
      const d = euclidean(row, centroids[c]);
      if (d < bestDist) {
        bestDist = d;
        best = c;
      }
    }
    return best;
  });
}

export function kmeansNormalized(
  normalizedData: number[][],
  k: number,
  maxIter = 50,
): KMeansResult {
  if (normalizedData.length === 0)
    return { assignments: [], centroids: [], iterations: 0 };
  const normalized = normalizedData;
  const n = normalized.length;
  const dims = normalized[0].length;

  // Random init
  const indices = Array.from({ length: n }, (_, i) => i);
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }
  let centroids: number[][] = indices
    .slice(0, k)
    .map((i) => [...normalized[i]]);

  let assignments: number[] = new Array(n).fill(0);
  let iter = 0;

  for (; iter < maxIter; iter++) {
    const newAssignments = assignAll(normalized, centroids);

    let changed = false;
    for (let i = 0; i < n; i++) {
      if (newAssignments[i] !== assignments[i]) {
        changed = true;
        break;
      }
    }
    assignments = newAssignments;
    if (!changed) break;

    const sums: number[][] = Array.from({ length: k }, () =>
      Array(dims).fill(0),
    );
    const counts: number[] = Array(k).fill(0);
    for (let i = 0; i < n; i++) {
      const c = assignments[i];
      counts[c]++;
      for (let j = 0; j < dims; j++) sums[c][j] += normalized[i][j];
    }
    for (let c = 0; c < k; c++) {
      if (counts[c] > 0) centroids[c] = sums[c].map((v) => v / counts[c]);
    }
  }

  return { assignments, centroids, iterations: iter };
}

export function kmeans(
  data: number[][],
  k: number,
  maxIter = 100,
): KMeansResult {
  if (data.length === 0)
    return { assignments: [], centroids: [], iterations: 0 };
  const params = computeNormParams(data);
  const normalized = normalizeWithParams(data, params);
  return kmeansNormalized(normalized, k, maxIter);
}

export function computeDistanceToCentroid(
  data: number[][],
  assignments: number[],
  centroids: number[][],
): number[] {
  const params = computeNormParams(data);
  const normalized = normalizeWithParams(data, params);
  return normalized.map((row, i) => euclidean(row, centroids[assignments[i]]));
}
