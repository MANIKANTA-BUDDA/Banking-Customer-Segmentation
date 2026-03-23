export interface ClusterStats {
  id: number;
  label: string;
  persona: string;
  count: number;
  percentage: number;
  featureMeans: Record<string, number>;
  dominantFeatures: string[];
  color: string;
}

// 5 segments: Premium, Standard, Basic, At-Risk, Dormant
export const SEGMENT_TIERS = [
  "Premium",
  "Standard",
  "Basic",
  "At-Risk",
  "Dormant",
] as const;
export type SegmentTier = (typeof SEGMENT_TIERS)[number];

export const SEGMENT_TIER_COLORS: Record<SegmentTier, string> = {
  Premium: "#6366f1", // indigo
  Standard: "#22d3ee", // cyan
  Basic: "#f59e0b", // amber
  "At-Risk": "#f43f5e", // rose
  Dormant: "#22c55e", // green
};

const SEGMENT_DESCRIPTIONS: Record<SegmentTier, string> = {
  Premium: "Very high score, high balance, frequent transactions",
  Standard: "Medium-high score with consistent activity",
  Basic: "Moderate score with low to average activity",
  "At-Risk": "Low score with declining or irregular activity",
  Dormant: "Very low score or no recent activity",
};

export { SEGMENT_DESCRIPTIONS };

function computeScore(
  means: Record<string, number>,
  overallMeans: Record<string, number>,
): number {
  const norm = (key: string) => {
    const avg = overallMeans[key] || 1;
    return (means[key] ?? 0) / avg;
  };

  const balanceScore = norm("BALANCE");
  const creditScore = norm("CREDIT_LIMIT");
  const purchaseScore = norm("PURCHASES");
  const txnFreqScore =
    norm("PURCHASES_FREQUENCY") + norm("PURCHASES_TRX") * 0.5;
  const tenureScore = norm("TENURE") * 0.3;

  const cashAdvance = means.CASH_ADVANCE ?? 0;
  const purchases = means.PURCHASES || 1;
  const riskPenalty = (cashAdvance / purchases) * 0.5;

  return (
    balanceScore +
    creditScore +
    purchaseScore +
    txnFreqScore +
    tenureScore -
    riskPenalty
  );
}

export function computeClusterStats(
  numericRows: number[][],
  columnNames: string[],
  assignments: number[],
  k: number,
): ClusterStats[] {
  const n = numericRows.length;
  const sums: Record<string, number>[] = Array.from({ length: k }, () => ({}));
  const counts: number[] = Array(k).fill(0);

  // Pre-compute column index map to avoid O(n) indexOf in nested loops
  const colIdxMap: Record<string, number> = {};
  for (let j = 0; j < columnNames.length; j++) colIdxMap[columnNames[j]] = j;

  for (let i = 0; i < n; i++) {
    const c = assignments[i];
    counts[c]++;
    for (let j = 0; j < columnNames.length; j++) {
      const col = columnNames[j];
      sums[c][col] = (sums[c][col] ?? 0) + numericRows[i][j];
    }
  }

  // Use colIdxMap instead of indexOf for overallMeans
  const overallMeans: Record<string, number> = {};
  for (const col of columnNames) {
    const idx = colIdxMap[col];
    let total = 0;
    for (let i = 0; i < n; i++) total += numericRows[i][idx];
    overallMeans[col] = total / n;
  }

  const clusterMeans: Record<string, number>[] = Array.from(
    { length: k },
    (_, c) => {
      const cnt = counts[c] || 1;
      const means: Record<string, number> = {};
      for (const col of columnNames) {
        means[col] = (sums[c][col] ?? 0) / cnt;
      }
      return means;
    },
  );

  const scores = clusterMeans.map((means) => computeScore(means, overallMeans));

  const sortedClusters = Array.from({ length: k }, (_, i) => i).sort(
    (a, b) => scores[b] - scores[a],
  );

  const tierMap: number[] = Array(k).fill(0);
  sortedClusters.forEach((clusterId, rank) => {
    const tierIdx = Math.min(
      Math.floor((rank / k) * SEGMENT_TIERS.length),
      SEGMENT_TIERS.length - 1,
    );
    tierMap[clusterId] = tierIdx;
  });

  return Array.from({ length: k }, (_, c) => {
    const featureMeans = clusterMeans[c];

    const dominantFeatures = columnNames
      .map((col) => ({
        col,
        ratio: featureMeans[col] / (overallMeans[col] || 1),
      }))
      .sort((a, b) => b.ratio - a.ratio)
      .slice(0, 3)
      .map((x) => x.col);

    const tierIdx = tierMap[c];
    const persona = SEGMENT_TIERS[tierIdx];
    const color = SEGMENT_TIER_COLORS[persona];

    return {
      id: c,
      label: persona,
      persona,
      count: counts[c],
      percentage: (counts[c] / n) * 100,
      featureMeans,
      dominantFeatures,
      color,
    };
  });
}
