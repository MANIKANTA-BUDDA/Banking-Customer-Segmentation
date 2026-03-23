import { Button } from "@/components/ui/button";
import { UploadCloud } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { Page } from "../App";
import { useCurrency } from "../context/CurrencyContext";
import { useData } from "../context/DataContext";
import { kmeans } from "../utils/kmeans";

function histogram(
  formatter: (v: number) => string,
  values: number[],
  bins = 10,
): { label: string; count: number }[] {
  if (values.length === 0) return [];
  let min = values[0];
  let max = values[0];
  for (const v of values) {
    if (v < min) min = v;
    if (v > max) max = v;
  }
  const step = (max - min) / bins || 1;
  const buckets = Array.from({ length: bins }, (_, i) => ({
    label: formatter(min + i * step),
    count: 0,
  }));
  for (const v of values) {
    const i = Math.min(Math.floor((v - min) / step), bins - 1);
    buckets[i].count++;
  }
  return buckets;
}

function pearson(a: number[], b: number[]): number {
  const n = a.length;
  const ma = a.reduce((s, v) => s + v, 0) / n;
  const mb = b.reduce((s, v) => s + v, 0) / n;
  let num = 0;
  let da = 0;
  let db = 0;
  for (let i = 0; i < n; i++) {
    num += (a[i] - ma) * (b[i] - mb);
    da += (a[i] - ma) ** 2;
    db += (b[i] - mb) ** 2;
  }
  return num / (Math.sqrt(da * db) || 1);
}

export default function Analysis({
  navigate,
}: { navigate: (p: Page) => void }) {
  const { isReady, numericRows, numericColumnNames, assignments, stats } =
    useData();
  const { formatAmount } = useCurrency();
  const [selectedCol, setSelectedCol] = useState(0);

  const [elbowData, setElbowData] = useState<{ k: number; wcss: number }[]>([]);
  const [elbowLoading, setElbowLoading] = useState(false);

  useEffect(() => {
    if (!isReady || numericRows.length === 0) {
      setElbowData([]);
      return;
    }
    setElbowLoading(true);
    const compute = async () => {
      const sample = numericRows.slice(0, 300);
      const results: { k: number; wcss: number }[] = [];
      for (let k = 1; k <= 8; k++) {
        await new Promise((r) => setTimeout(r, 0));
        try {
          const { assignments: asgn, centroids } = kmeans(sample, k, 30);
          let wcss = 0;
          for (let i = 0; i < sample.length; i++) {
            const c = centroids[asgn[i]];
            for (let j = 0; j < sample[i].length; j++) {
              wcss += (sample[i][j] - (c?.[j] ?? 0)) ** 2;
            }
          }
          results.push({ k, wcss: Math.round(wcss) });
        } catch {
          results.push({ k, wcss: 0 });
        }
      }
      setElbowData(results);
      setElbowLoading(false);
    };
    compute();
  }, [isReady, numericRows]);

  const featureImportanceData = useMemo(() => {
    if (!isReady || numericRows.length === 0 || stats.length === 0) return [];
    const overall: Record<string, number> = {};
    for (let j = 0; j < numericColumnNames.length; j++) {
      let sum = 0;
      for (const row of numericRows) sum += row[j];
      overall[numericColumnNames[j]] = sum / numericRows.length || 1;
    }

    // Find top 8 most-varying columns
    const variances = numericColumnNames.map((_, j) => {
      const mean = overall[numericColumnNames[j]];
      let v = 0;
      for (const row of numericRows) v += (row[j] - mean) ** 2;
      return { col: numericColumnNames[j], variance: v / numericRows.length };
    });
    const top8 = [...variances]
      .sort((a, b) => b.variance - a.variance)
      .slice(0, 8)
      .map((x) => x.col);

    return top8.map((col) => {
      const entry: Record<string, number | string> = { feature: col };
      for (const s of stats) {
        const mean = s.featureMeans[col] ?? 0;
        const ovMean = overall[col] || 1;
        entry[s.persona] = Number.parseFloat(
          (((mean - ovMean) / ovMean) * 100).toFixed(1),
        );
      }
      return entry;
    });
  }, [isReady, numericRows, numericColumnNames, stats]);

  if (!isReady) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-24">
        <UploadCloud className="w-16 h-16 text-gray-700 mb-4" />
        <h2 className="text-white text-xl font-bold mb-2">No Dataset Loaded</h2>
        <Button
          onClick={() => navigate("upload")}
          className="bg-indigo-600 hover:bg-indigo-700"
        >
          Upload Dataset
        </Button>
      </div>
    );
  }

  const histData = histogram(
    formatAmount,
    numericRows.map((r) => r[selectedCol]),
  );
  const variances = numericColumnNames.map((_, j) => {
    const vals = numericRows.map((r) => r[j]);
    const mean = vals.reduce((s, v) => s + v, 0) / vals.length;
    return vals.reduce((s, v) => s + (v - mean) ** 2, 0) / vals.length;
  });
  const top2 = [...variances.map((v, i) => ({ v, i }))]
    .sort((a, b) => b.v - a.v)
    .slice(0, 2)
    .map((x) => x.i);
  const [xIdx, yIdx] = [top2[0] ?? 0, top2[1] ?? 1];
  const scatterBySegment = stats.map((s) => ({
    ...s,
    points: numericRows
      .filter((_, i) => assignments[i] === s.id)
      .slice(0, 150)
      .map((r) => ({ x: r[xIdx], y: r[yIdx] })),
  }));
  const top6 = [...variances.map((v, i) => ({ v, i }))]
    .sort((a, b) => b.v - a.v)
    .slice(0, 6)
    .map((x) => x.i);
  const corrData: { col1: string; col2: string; value: number }[] = [];
  for (let a = 0; a < top6.length; a++) {
    for (let b = a + 1; b < top6.length; b++) {
      corrData.push({
        col1: numericColumnNames[top6[a]],
        col2: numericColumnNames[top6[b]],
        value: pearson(
          numericRows.map((r) => r[top6[a]]),
          numericRows.map((r) => r[top6[b]]),
        ),
      });
    }
  }
  const sortedCorr = [...corrData]
    .sort((a, b) => Math.abs(b.value) - Math.abs(a.value))
    .slice(0, 10);

  const segmentColors = stats.map((s) => s.color);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Analysis</h1>
        <p className="text-gray-400 text-sm">
          Explore feature distributions and segment patterns
        </p>
      </div>

      <div className="p-5 rounded-xl bg-gray-900 border border-gray-800">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-medium">Feature Distribution</h3>
          <select
            value={selectedCol}
            onChange={(e) => setSelectedCol(Number(e.target.value))}
            className="bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-3 py-1.5"
          >
            {numericColumnNames.map((col, i) => (
              <option key={col} value={i}>
                {col}
              </option>
            ))}
          </select>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart
            data={histData}
            margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
          >
            <XAxis dataKey="label" tick={{ fill: "#6b7280", fontSize: 10 }} />
            <YAxis tick={{ fill: "#6b7280", fontSize: 11 }} />
            <Tooltip />
            <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="p-5 rounded-xl bg-gray-900 border border-gray-800">
        <h3 className="text-white font-medium mb-1">Segment Scatter Plot</h3>
        <p className="text-gray-500 text-xs mb-4">
          {numericColumnNames[xIdx]} vs {numericColumnNames[yIdx]}
        </p>
        <ResponsiveContainer width="100%" height={300}>
          <ScatterChart margin={{ top: 10, right: 20, left: 10, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis
              dataKey="x"
              name={numericColumnNames[xIdx]}
              tick={{ fill: "#6b7280", fontSize: 10 }}
              tickFormatter={(v) => formatAmount(v)}
            />
            <YAxis
              dataKey="y"
              name={numericColumnNames[yIdx]}
              tick={{ fill: "#6b7280", fontSize: 10 }}
              tickFormatter={(v) => formatAmount(v)}
            />
            <Tooltip formatter={(v: number) => formatAmount(v)} />
            <Legend />
            {scatterBySegment.map((s) => (
              <Scatter
                key={s.id}
                name={s.label}
                data={s.points}
                fill={s.color}
                opacity={0.7}
                r={3}
              />
            ))}
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      <div className="p-5 rounded-xl bg-gray-900 border border-gray-800">
        <h3 className="text-white font-medium mb-4">
          Top Feature Correlations
        </h3>
        <div className="space-y-2">
          {sortedCorr.map(({ col1, col2, value }) => (
            <div key={`${col1}-${col2}`} className="flex items-center gap-3">
              <div className="text-xs text-gray-400 w-48 truncate">
                {col1} × {col2}
              </div>
              <div className="flex-1 h-4 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${Math.abs(value) * 100}%`,
                    background: value > 0 ? "#6366f1" : "#f43f5e",
                  }}
                />
              </div>
              <div
                className={`text-xs tabular-nums w-12 text-right ${value > 0.5 ? "text-indigo-400" : value < -0.3 ? "text-rose-400" : "text-gray-400"}`}
              >
                {value.toFixed(2)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Elbow Method */}
      <div className="p-5 rounded-xl bg-gray-900 border border-gray-800">
        <h3 className="text-white font-medium mb-1">
          Elbow Method — Optimal Cluster Count
        </h3>
        <p className="text-gray-500 text-xs mb-4">
          Within-Cluster Sum of Squares (WCSS) for k=1..8
        </p>
        {elbowLoading && (
          <div className="flex items-center gap-2 text-gray-400 text-sm py-8 justify-center">
            <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            Computing elbow curve...
          </div>
        )}
        {!elbowLoading && elbowData.length > 0 && (
          <ResponsiveContainer width="100%" height={240}>
            <LineChart
              data={elbowData}
              margin={{ top: 10, right: 20, left: 10, bottom: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis
                dataKey="k"
                tick={{ fill: "#6b7280", fontSize: 11 }}
                label={{
                  value: "Number of Clusters (k)",
                  position: "insideBottom",
                  offset: -5,
                  fill: "#6b7280",
                  fontSize: 11,
                }}
              />
              <YAxis
                tick={{ fill: "#6b7280", fontSize: 11 }}
                tickFormatter={(v) =>
                  v >= 1_000_000
                    ? `${(v / 1_000_000).toFixed(1)}M`
                    : v >= 1000
                      ? `${(v / 1000).toFixed(0)}K`
                      : String(v)
                }
              />
              <Tooltip
                contentStyle={{
                  background: "#111827",
                  border: "1px solid #374151",
                  borderRadius: 8,
                  color: "#fff",
                }}
              />
              <ReferenceLine
                x={5}
                stroke="#6366f1"
                strokeDasharray="4 4"
                label={{ value: "Optimal k=5", fill: "#818cf8", fontSize: 11 }}
              />
              <Line
                type="monotone"
                dataKey="wcss"
                stroke="#22d3ee"
                strokeWidth={2}
                dot={{ fill: "#22d3ee", r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Feature Importance */}
      {featureImportanceData.length > 0 && (
        <div className="p-5 rounded-xl bg-gray-900 border border-gray-800">
          <h3 className="text-white font-medium mb-1">
            Feature Importance by Segment
          </h3>
          <p className="text-gray-500 text-xs mb-4">
            % deviation from overall mean for top 8 features
          </p>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={featureImportanceData}
              margin={{ top: 10, right: 20, left: 10, bottom: 60 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis
                dataKey="feature"
                tick={{ fill: "#6b7280", fontSize: 9 }}
                angle={-35}
                textAnchor="end"
                interval={0}
              />
              <YAxis
                tick={{ fill: "#6b7280", fontSize: 11 }}
                tickFormatter={(v) => `${v}%`}
              />
              <Tooltip
                formatter={(v: number) => `${v > 0 ? "+" : ""}${v}%`}
                contentStyle={{
                  background: "#111827",
                  border: "1px solid #374151",
                  borderRadius: 8,
                  color: "#fff",
                }}
              />
              <Legend />
              {stats.map((s, i) => (
                <Bar
                  key={s.id}
                  dataKey={s.persona}
                  fill={segmentColors[i]}
                  radius={[2, 2, 0, 0]}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
