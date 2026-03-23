import { Button } from "@/components/ui/button";
import {
  CreditCard,
  Layers,
  TrendingUp,
  UploadCloud,
  Users,
} from "lucide-react";
import {
  Bar,
  BarChart,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { Page } from "../App";
import { useCurrency } from "../context/CurrencyContext";
import { useData } from "../context/DataContext";

const COLORS = [
  "#6366f1",
  "#22d3ee",
  "#f59e0b",
  "#10b981",
  "#f43f5e",
  "#a78bfa",
  "#34d399",
];

interface Props {
  navigate: (p: Page) => void;
}

export default function Dashboard({ navigate }: Props) {
  const { formatAmount } = useCurrency();
  const {
    isReady,
    stats,
    rows,
    clusterCount,
    numericColumnNames,
    numericRows,
    filteredIndices,
  } = useData();

  if (!isReady) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-24">
        <UploadCloud className="w-16 h-16 text-gray-700 mb-4" />
        <h2 className="text-white text-xl font-bold mb-2">No Dataset Loaded</h2>
        <p className="text-gray-500 text-sm mb-6">
          Upload a CSV dataset to power the dashboard
        </p>
        <Button
          onClick={() => navigate("upload")}
          className="bg-indigo-600 hover:bg-indigo-700"
        >
          Upload Dataset
        </Button>
      </div>
    );
  }

  const activeIndices =
    filteredIndices.length > 0 ? filteredIndices : rows.map((_, i) => i);
  const isFiltered =
    filteredIndices.length > 0 && filteredIndices.length < rows.length;
  const totalCustomers = activeIndices.length;
  const balIdx = numericColumnNames.indexOf("BALANCE");
  const purIdx = numericColumnNames.indexOf("PURCHASES");
  const avgBalance =
    balIdx >= 0
      ? activeIndices.reduce((s, i) => s + numericRows[i][balIdx], 0) /
        totalCustomers
      : 0;
  const avgPurchases =
    purIdx >= 0
      ? activeIndices.reduce((s, i) => s + numericRows[i][purIdx], 0) /
        totalCustomers
      : 0;

  const donutData = stats.map((s) => ({
    name: s.persona,
    value: s.count,
    color: s.color,
  }));
  const barData = stats.map((s) => ({
    name: s.persona,
    Purchases: s.featureMeans.PURCHASES ?? 0,
    Balance: s.featureMeans.BALANCE ?? 0,
    CreditLimit: s.featureMeans.CREDIT_LIMIT ?? 0,
  }));

  const kpis = [
    {
      label: "Total Customers",
      value: totalCustomers.toLocaleString(),
      icon: Users,
      cls: "bg-indigo-950 border-indigo-800 text-indigo-400",
    },
    {
      label: "Active Segments",
      value: clusterCount.toString(),
      icon: Layers,
      cls: "bg-cyan-950 border-cyan-800 text-cyan-400",
    },
    {
      label: "Avg Balance",
      value: formatAmount(avgBalance),
      icon: CreditCard,
      cls: "bg-amber-950 border-amber-800 text-amber-400",
    },
    {
      label: "Avg Purchases",
      value: formatAmount(avgPurchases),
      icon: TrendingUp,
      cls: "bg-emerald-950 border-emerald-800 text-emerald-400",
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-gray-400 text-sm">
            {isFiltered
              ? `Filtered view · ${totalCustomers.toLocaleString()} of ${rows.length.toLocaleString()} customers`
              : `${rows.length.toLocaleString()} customers · ${clusterCount} segments`}
          </p>
        </div>
        {isFiltered && (
          <span className="px-3 py-1 rounded-full bg-amber-900 border border-amber-700 text-amber-300 text-xs">
            Filtered View
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map(({ label, value, icon: Icon, cls }) => (
          <div key={label} className={`p-4 rounded-xl border ${cls}`}>
            <div className="flex items-center gap-2 mb-2">
              <Icon className="w-4 h-4" />
              <span className="text-xs text-gray-400">{label}</span>
            </div>
            <div className="text-xl font-bold text-white">{value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-5 rounded-xl bg-gray-900 border border-gray-800">
          <h3 className="text-white font-medium mb-4">
            Customer Distribution by Segment
          </h3>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie
                data={donutData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                dataKey="value"
                label={({ name, percent }) =>
                  `${name} ${(percent * 100).toFixed(0)}%`
                }
                labelLine={false}
              >
                {donutData.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(v: number) => v.toLocaleString()} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="p-5 rounded-xl bg-gray-900 border border-gray-800">
          <h3 className="text-white font-medium mb-4">
            Avg Purchases by Segment
          </h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart
              data={barData}
              margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
            >
              <XAxis dataKey="name" tick={{ fill: "#6b7280", fontSize: 11 }} />
              <YAxis
                tick={{ fill: "#6b7280", fontSize: 11 }}
                tickFormatter={(v) => formatAmount(v)}
              />
              <Tooltip formatter={(v: number) => formatAmount(v)} />
              <Bar dataKey="Purchases" radius={[4, 4, 0, 0]}>
                {barData.map((entry, i) => (
                  <Cell key={entry.name} fill={COLORS[i % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="p-5 rounded-xl bg-gray-900 border border-gray-800">
        <h3 className="text-white font-medium mb-4">
          Avg Balance vs Credit Limit by Segment
        </h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart
            data={barData}
            margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
          >
            <XAxis dataKey="name" tick={{ fill: "#6b7280", fontSize: 11 }} />
            <YAxis
              tick={{ fill: "#6b7280", fontSize: 11 }}
              tickFormatter={(v) => formatAmount(v)}
            />
            <Tooltip formatter={(v: number) => formatAmount(v)} />
            <Legend />
            <Bar dataKey="Balance" fill="#22d3ee" radius={[4, 4, 0, 0]} />
            <Bar dataKey="CreditLimit" fill="#f59e0b" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="rounded-xl bg-gray-900 border border-gray-800 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-800">
          <h3 className="text-white font-medium">Segment Summary</h3>
        </div>
        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-950">
              <tr>
                {[
                  "Segment",
                  "Persona",
                  "Customers",
                  "Share",
                  "Avg Balance",
                  "Avg Purchases",
                  "Avg Credit Limit",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-gray-400 text-xs whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {stats.map((s) => (
                <tr
                  key={s.id}
                  className="border-t border-gray-800 hover:bg-gray-800/50"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ background: s.color }}
                      />
                      <span className="text-white">{s.label}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className="px-2 py-0.5 rounded text-xs font-medium"
                      style={{ background: `${s.color}22`, color: s.color }}
                    >
                      {s.persona}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-300">
                    {s.count.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-gray-300">
                    {s.percentage.toFixed(1)}%
                  </td>
                  <td className="px-4 py-3 text-gray-300 tabular-nums">
                    {formatAmount(s.featureMeans.BALANCE ?? 0)}
                  </td>
                  <td className="px-4 py-3 text-gray-300 tabular-nums">
                    {formatAmount(s.featureMeans.PURCHASES ?? 0)}
                  </td>
                  <td className="px-4 py-3 text-gray-300 tabular-nums">
                    {formatAmount(s.featureMeans.CREDIT_LIMIT ?? 0)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
