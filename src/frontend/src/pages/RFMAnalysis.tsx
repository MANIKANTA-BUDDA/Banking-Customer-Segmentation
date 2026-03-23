import { Button } from "@/components/ui/button";
import { Activity, UploadCloud } from "lucide-react";
import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { Page } from "../App";
import { useData } from "../context/DataContext";

type RFMLabel = "High Value" | "Medium Value" | "Low Value" | "Inactive";

const RFM_COLORS: Record<RFMLabel, string> = {
  "High Value": "#6366f1",
  "Medium Value": "#22d3ee",
  "Low Value": "#f59e0b",
  Inactive: "#22c55e",
};

function arrayMin(arr: number[]): number {
  let min = arr[0];
  for (let i = 1; i < arr.length; i++) if (arr[i] < min) min = arr[i];
  return min;
}
function arrayMax(arr: number[]): number {
  let max = arr[0];
  for (let i = 1; i < arr.length; i++) if (arr[i] > max) max = arr[i];
  return max;
}

function normalize(values: number[]): number[] {
  const min = arrayMin(values);
  const max = arrayMax(values);
  const range = max - min || 1;
  return values.map((v) => ((v - min) / range) * 100);
}

export default function RFMAnalysis({
  navigate,
}: { navigate: (p: Page) => void }) {
  const { isReady, numericRows, numericColumnNames, assignments, stats } =
    useData();

  const rfmData = useMemo(() => {
    if (!isReady || numericRows.length === 0) return null;

    const freqIdx = numericColumnNames.indexOf("PURCHASES_FREQUENCY");
    const trxIdx = numericColumnNames.indexOf("PURCHASES_TRX");
    const purIdx = numericColumnNames.indexOf("PURCHASES");
    const balIdx = numericColumnNames.indexOf("BALANCE");
    const tenureIdx = numericColumnNames.indexOf("TENURE");

    const fIdx = freqIdx >= 0 ? freqIdx : trxIdx >= 0 ? trxIdx : 0;
    const mIdx = purIdx >= 0 ? purIdx : balIdx >= 0 ? balIdx : 1;
    const rIdx = tenureIdx >= 0 ? tenureIdx : 2;

    const freqVals = numericRows.map((r) => r[fIdx] ?? 0);
    const monVals = numericRows.map((r) => r[mIdx] ?? 0);
    // Recency: invert tenure (lower tenure = more recent = higher score)
    const rawTenure = numericRows.map((r) => r[rIdx] ?? 0);
    let maxTenure = 1;
    for (const t of rawTenure) if (t > maxTenure) maxTenure = t;
    const recencyVals = rawTenure.map((t) => maxTenure - t);

    const normR = normalize(recencyVals);
    const normF = normalize(freqVals);
    const normM = normalize(monVals);

    const rfmScores = normR.map(
      (r, i) => r * 0.3 + normF[i] * 0.4 + normM[i] * 0.3,
    );

    const rfmLabels: RFMLabel[] = rfmScores.map((s) => {
      if (s >= 70) return "High Value";
      if (s >= 50) return "Medium Value";
      if (s >= 30) return "Low Value";
      return "Inactive";
    });

    const avgScore = rfmScores.reduce((a, b) => a + b, 0) / rfmScores.length;
    const highValueCount = rfmLabels.filter((l) => l === "High Value").length;
    const atRiskCount = rfmLabels.filter((l) => l === "Inactive").length;

    // Distribution counts
    const distMap: Record<RFMLabel, number> = {
      "High Value": 0,
      "Medium Value": 0,
      "Low Value": 0,
      Inactive: 0,
    };
    for (const l of rfmLabels) distMap[l]++;
    const distData = (Object.keys(distMap) as RFMLabel[]).map((label) => ({
      name: label,
      count: distMap[label],
      color: RFM_COLORS[label],
    }));

    // K-Means vs RFM Overlap: for each K-Means segment, % that are "High Value"
    const overlapData = stats.map((s) => {
      const indices = assignments
        .map((a, i) => (a === s.id ? i : -1))
        .filter((i) => i >= 0);
      const hvCount = indices.filter(
        (i) => rfmLabels[i] === "High Value",
      ).length;
      return {
        name: s.persona,
        highValuePct:
          indices.length > 0
            ? Number.parseFloat(((hvCount / indices.length) * 100).toFixed(1))
            : 0,
        color: s.color,
      };
    });

    // Table: first 50 rows
    const tableRows = numericRows.slice(0, 50).map((row, i) => {
      const seg = stats[assignments[i]];
      return {
        idx: i,
        kmeans: seg?.persona ?? "-",
        kmeanColor: seg?.color ?? "#6366f1",
        rfmScore: rfmScores[i].toFixed(1),
        rfmLabel: rfmLabels[i],
        balance: row[balIdx] ?? 0,
        purchases: row[purIdx] ?? 0,
      };
    });

    return {
      avgScore,
      highValueCount,
      atRiskCount,
      distData,
      overlapData,
      tableRows,
      total: numericRows.length,
    };
  }, [isReady, numericRows, numericColumnNames, assignments, stats]);

  if (!isReady) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-24">
        <UploadCloud className="w-16 h-16 text-gray-700 mb-4" />
        <h2 className="text-white text-xl font-bold mb-2">No Dataset Loaded</h2>
        <p className="text-gray-500 text-sm mb-6">
          Upload a dataset to run RFM analysis
        </p>
        <Button
          onClick={() => navigate("upload")}
          className="bg-indigo-600 hover:bg-indigo-700"
          data-ocid="rfm.upload_button"
        >
          Upload Dataset
        </Button>
      </div>
    );
  }

  if (!rfmData) return null;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Activity className="w-6 h-6 text-indigo-400" />
        <div>
          <h1 className="text-2xl font-bold text-white">RFM Analysis</h1>
          <p className="text-gray-400 text-sm">
            Recency, Frequency, Monetary comparison with K-Means segments
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-gray-900 border border-gray-800">
          <div className="text-gray-400 text-xs mb-1">Total Customers</div>
          <div className="text-2xl font-bold text-white">
            {rfmData.total.toLocaleString()}
          </div>
        </div>
        <div className="p-4 rounded-xl bg-gray-900 border border-gray-800">
          <div className="text-gray-400 text-xs mb-1">Avg RFM Score</div>
          <div className="text-2xl font-bold text-indigo-400">
            {rfmData.avgScore.toFixed(1)}
          </div>
        </div>
        <div className="p-4 rounded-xl bg-gray-900 border border-gray-800">
          <div className="text-gray-400 text-xs mb-1">High Value %</div>
          <div className="text-2xl font-bold text-emerald-400">
            {((rfmData.highValueCount / rfmData.total) * 100).toFixed(1)}%
          </div>
        </div>
        <div className="p-4 rounded-xl bg-gray-900 border border-gray-800">
          <div className="text-gray-400 text-xs mb-1">Inactive %</div>
          <div className="text-2xl font-bold text-rose-400">
            {((rfmData.atRiskCount / rfmData.total) * 100).toFixed(1)}%
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* RFM Segment Distribution */}
        <div className="p-5 rounded-xl bg-gray-900 border border-gray-800">
          <h3 className="text-white font-medium mb-1">
            RFM Segment Distribution
          </h3>
          <p className="text-gray-500 text-xs mb-4">
            Customer count per RFM tier
          </p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart
              data={rfmData.distData}
              margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="name" tick={{ fill: "#6b7280", fontSize: 10 }} />
              <YAxis tick={{ fill: "#6b7280", fontSize: 11 }} />
              <Tooltip
                contentStyle={{
                  background: "#111827",
                  border: "1px solid #374151",
                  borderRadius: 8,
                  color: "#fff",
                }}
              />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {rfmData.distData.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* K-Means vs RFM Overlap */}
        <div className="p-5 rounded-xl bg-gray-900 border border-gray-800">
          <h3 className="text-white font-medium mb-1">
            K-Means vs RFM Overlap
          </h3>
          <p className="text-gray-500 text-xs mb-4">
            % of each K-Means segment that are RFM "High Value"
          </p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart
              data={rfmData.overlapData}
              margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="name" tick={{ fill: "#6b7280", fontSize: 10 }} />
              <YAxis
                tick={{ fill: "#6b7280", fontSize: 11 }}
                domain={[0, 100]}
                tickFormatter={(v) => `${v}%`}
              />
              <Tooltip
                formatter={(v: number) => `${v}%`}
                contentStyle={{
                  background: "#111827",
                  border: "1px solid #374151",
                  borderRadius: 8,
                  color: "#fff",
                }}
              />
              <Bar dataKey="highValuePct" radius={[4, 4, 0, 0]}>
                {rfmData.overlapData.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="rounded-xl bg-gray-900 border border-gray-800 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-800">
          <h3 className="text-white font-medium">Customer Comparison Table</h3>
          <p className="text-gray-500 text-xs">
            First 50 rows — K-Means segment vs RFM classification
          </p>
        </div>
        <div className="overflow-auto">
          <table className="w-full text-sm" data-ocid="rfm.table">
            <thead className="bg-gray-950">
              <tr>
                {[
                  "Row #",
                  "K-Means Segment",
                  "RFM Score",
                  "RFM Label",
                  "Balance",
                  "Purchases",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-gray-400 text-xs"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rfmData.tableRows.map(
                (
                  {
                    idx,
                    kmeans,
                    kmeanColor,
                    rfmScore,
                    rfmLabel,
                    balance,
                    purchases,
                  },
                  rowNum,
                ) => (
                  <tr
                    key={idx}
                    className="border-t border-gray-800 hover:bg-gray-800/40"
                    data-ocid={`rfm.item.${rowNum + 1}`}
                  >
                    <td className="px-4 py-2.5 text-gray-500 tabular-nums text-xs">
                      {idx + 1}
                    </td>
                    <td className="px-4 py-2.5">
                      <span
                        className="px-2 py-0.5 text-xs rounded font-medium"
                        style={{
                          background: `${kmeanColor}22`,
                          color: kmeanColor,
                        }}
                      >
                        {kmeans}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-gray-300 tabular-nums text-xs">
                      {rfmScore}
                    </td>
                    <td className="px-4 py-2.5">
                      <span
                        className="px-2 py-0.5 text-xs rounded font-medium"
                        style={{
                          background: `${RFM_COLORS[rfmLabel]}22`,
                          color: RFM_COLORS[rfmLabel],
                        }}
                      >
                        {rfmLabel}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-gray-300 tabular-nums text-xs">
                      {balance.toFixed(0)}
                    </td>
                    <td className="px-4 py-2.5 text-gray-300 tabular-nums text-xs">
                      {purchases.toFixed(0)}
                    </td>
                  </tr>
                ),
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
