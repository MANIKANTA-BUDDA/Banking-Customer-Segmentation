import { Button } from "@/components/ui/button";
import { AlertTriangle, CheckCircle, UploadCloud } from "lucide-react";
import { useMemo } from "react";
import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { Page } from "../App";
import { useCurrency } from "../context/CurrencyContext";
import { useData } from "../context/DataContext";

function ChurnBadge({ risk }: { risk: number }) {
  if (risk >= 70) {
    return (
      <span className="px-2 py-0.5 text-xs rounded-full font-semibold bg-rose-500/20 text-rose-400 border border-rose-500/30">
        High
      </span>
    );
  }
  if (risk >= 40) {
    return (
      <span className="px-2 py-0.5 text-xs rounded-full font-semibold bg-amber-500/20 text-amber-400 border border-amber-500/30">
        Medium
      </span>
    );
  }
  return (
    <span className="px-2 py-0.5 text-xs rounded-full font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
      Low
    </span>
  );
}

export default function Prediction({
  navigate,
}: { navigate: (p: Page) => void }) {
  const { formatAmount } = useCurrency();
  const {
    isReady,
    numericRows,
    numericColumnNames,
    assignments,
    distanceToCentroid,
    stats,
  } = useData();

  const { atRiskTable, riskByCluster, highRisk, mediumRisk, lowRisk } =
    useMemo(() => {
      if (!isReady || numericRows.length === 0)
        return {
          atRiskTable: [],
          riskByCluster: [],
          highRisk: 0,
          mediumRisk: 0,
          lowRisk: 0,
        };
      let maxDist = 1;
      for (const d of distanceToCentroid) if (d > maxDist) maxDist = d;
      const balIdx = numericColumnNames.indexOf("BALANCE");
      const purIdx = numericColumnNames.indexOf("PURCHASES");
      const clIdx = numericColumnNames.indexOf("CREDIT_LIMIT");
      let maxBal = 1;
      for (const r of numericRows) {
        const v = r[balIdx] ?? 0;
        if (v > maxBal) maxBal = v;
      }
      let maxPur = 1;
      for (const r of numericRows) {
        const v = r[purIdx] ?? 0;
        if (v > maxPur) maxPur = v;
      }
      let maxCl = 1;
      for (const r of numericRows) {
        const v = r[clIdx] ?? 0;
        if (v > maxCl) maxCl = v;
      }

      const items = numericRows.map((row, i) => ({
        idx: i,
        risk: (distanceToCentroid[i] / maxDist) * 100,
        value:
          ((balIdx >= 0 ? row[balIdx] / maxBal : 0) * 40 +
            (purIdx >= 0 ? row[purIdx] / maxPur : 0) * 35 +
            (clIdx >= 0 ? row[clIdx] / maxCl : 0) * 25) *
          100,
        cluster: assignments[i],
      }));

      const highRisk = items.filter((x) => x.risk >= 70).length;
      const mediumRisk = items.filter(
        (x) => x.risk >= 40 && x.risk < 70,
      ).length;
      const lowRisk = items.filter((x) => x.risk < 40).length;

      const atRiskTable = [...items]
        .sort((a, b) => b.risk - a.risk)
        .slice(0, 20);
      const riskByCluster = stats.map((s) => {
        const ci = items.filter((x) => x.cluster === s.id);
        return {
          name: s.persona,
          avgRisk: Number.parseFloat(
            (ci.reduce((sum, x) => sum + x.risk, 0) / (ci.length || 1)).toFixed(
              1,
            ),
          ),
          color: s.color,
        };
      });
      return { atRiskTable, riskByCluster, highRisk, mediumRisk, lowRisk };
    }, [
      isReady,
      numericRows,
      numericColumnNames,
      assignments,
      distanceToCentroid,
      stats,
    ]);

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

  const balIdx = numericColumnNames.indexOf("BALANCE");
  const purIdx = numericColumnNames.indexOf("PURCHASES");
  const clIdx = numericColumnNames.indexOf("CREDIT_LIMIT");

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Prediction</h1>
        <p className="text-gray-400 text-sm">
          Churn risk scores and customer value predictions
        </p>
      </div>

      {/* Churn KPI Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-gray-900 border border-rose-800/50 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-rose-500/20 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5 text-rose-400" />
          </div>
          <div>
            <div className="text-gray-400 text-xs">High Risk</div>
            <div className="text-2xl font-bold text-rose-400">
              {highRisk.toLocaleString()}
            </div>
          </div>
        </div>
        <div className="p-4 rounded-xl bg-gray-900 border border-amber-700/50 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <div className="text-gray-400 text-xs">Medium Risk</div>
            <div className="text-2xl font-bold text-amber-400">
              {mediumRisk.toLocaleString()}
            </div>
          </div>
        </div>
        <div className="p-4 rounded-xl bg-gray-900 border border-emerald-800/50 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
            <CheckCircle className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <div className="text-gray-400 text-xs">Low Risk</div>
            <div className="text-2xl font-bold text-emerald-400">
              {lowRisk.toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      <div className="p-5 rounded-xl bg-gray-900 border border-gray-800">
        <h3 className="text-white font-medium mb-4">
          Average Churn Risk by Segment
        </h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart
            data={riskByCluster}
            margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
          >
            <XAxis dataKey="name" tick={{ fill: "#6b7280", fontSize: 11 }} />
            <YAxis
              tick={{ fill: "#6b7280", fontSize: 11 }}
              domain={[0, 100]}
              tickFormatter={(v) => `${v}%`}
            />
            <Tooltip formatter={(v: number) => `${v.toFixed(1)}%`} />
            <Bar dataKey="avgRisk" radius={[4, 4, 0, 0]}>
              {riskByCluster.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="rounded-xl bg-gray-900 border border-gray-800 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-800">
          <h3 className="text-white font-medium">Top 20 At-Risk Customers</h3>
          <p className="text-gray-500 text-xs">
            Ranked by distance from segment centroid
          </p>
        </div>
        <div className="overflow-auto">
          <table className="w-full text-sm" data-ocid="prediction.table">
            <thead className="bg-gray-950">
              <tr>
                {[
                  "Row #",
                  "Segment",
                  "Balance",
                  "Purchases",
                  "Credit Limit",
                  "Churn Risk",
                  "Churn Prob.",
                  "Value Score",
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
              {atRiskTable.map(({ idx, risk, value, cluster }, rowNum) => {
                const s = stats[cluster];
                const row = numericRows[idx];
                return (
                  <tr
                    key={idx}
                    className="border-t border-gray-800 hover:bg-gray-800/40"
                    data-ocid={`prediction.item.${rowNum + 1}`}
                  >
                    <td className="px-4 py-3 text-gray-400 tabular-nums">
                      {idx + 1}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="px-2 py-0.5 text-xs rounded font-medium"
                        style={{ background: `${s?.color}22`, color: s?.color }}
                      >
                        {s?.persona}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-300 tabular-nums">
                      {formatAmount(row[balIdx] ?? 0)}
                    </td>
                    <td className="px-4 py-3 text-gray-300 tabular-nums">
                      {formatAmount(row[purIdx] ?? 0)}
                    </td>
                    <td className="px-4 py-3 text-gray-300 tabular-nums">
                      {formatAmount(row[clIdx] ?? 0)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-gray-800 rounded-full">
                          <div
                            className="h-full rounded-full bg-rose-500"
                            style={{ width: `${risk}%` }}
                          />
                        </div>
                        <span className="text-xs text-rose-400 tabular-nums w-10">
                          {risk.toFixed(0)}%
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <ChurnBadge risk={risk} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-gray-800 rounded-full">
                          <div
                            className="h-full rounded-full bg-emerald-500"
                            style={{ width: `${value}%` }}
                          />
                        </div>
                        <span className="text-xs text-emerald-400 tabular-nums w-10">
                          {value.toFixed(0)}%
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
