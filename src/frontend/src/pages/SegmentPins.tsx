import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, Pin, PinOff, UploadCloud } from "lucide-react";
import { useEffect, useState } from "react";
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
import { PERSONAS } from "../data/personas";

const COLORS = [
  "#6366f1",
  "#22d3ee",
  "#f59e0b",
  "#10b981",
  "#f43f5e",
  "#a78bfa",
  "#34d399",
];

export default function SegmentPins({
  navigate,
}: { navigate: (p: Page) => void }) {
  const { formatAmount } = useCurrency();
  const { isReady, stats, rows } = useData();
  const [pinned, setPinned] = useState<Set<number>>(() => {
    try {
      return new Set(
        JSON.parse(localStorage.getItem("pinned_segments") || "[]"),
      );
    } catch {
      return new Set();
    }
  });
  const [expanded, setExpanded] = useState<Set<number>>(new Set());
  const [recExpanded, setRecExpanded] = useState<Set<number>>(new Set());

  useEffect(() => {
    localStorage.setItem("pinned_segments", JSON.stringify([...pinned]));
  }, [pinned]);

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

  const sorted = [...stats].sort(
    (a, b) => (pinned.has(a.id) ? 0 : 1) - (pinned.has(b.id) ? 0 : 1),
  );

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Segment Pins</h1>
        <p className="text-gray-400 text-sm">
          {stats.length} segments from {rows.length.toLocaleString()} customers
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {sorted.map((s) => {
          const isExpanded = expanded.has(s.id);
          const isPinned = pinned.has(s.id);
          const isRecExpanded = recExpanded.has(s.id);
          const persona = PERSONAS[s.label];
          const chartData = Object.entries(s.featureMeans)
            .filter(([, v]) => v > 0)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 6)
            .map(([k, v]) => ({ name: k, value: v }));
          return (
            <div
              key={s.id}
              className={`rounded-xl border p-4 bg-gray-900 transition-all ${
                isPinned ? "border-indigo-600" : "border-gray-800"
              }`}
            >
              <div className="flex items-start justify-between mb-1">
                <div className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ background: s.color }}
                  />
                  <span
                    className="text-white font-semibold"
                    style={{ color: s.color }}
                  >
                    {s.label}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setPinned((prev) => {
                      const n = new Set(prev);
                      n.has(s.id) ? n.delete(s.id) : n.add(s.id);
                      return n;
                    })
                  }
                  className={`p-1.5 rounded-lg transition-colors ${
                    isPinned
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-800 text-gray-500 hover:text-gray-300"
                  }`}
                >
                  {isPinned ? (
                    <Pin className="w-3.5 h-3.5" />
                  ) : (
                    <PinOff className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>

              {/* Persona name + description */}
              {persona && (
                <div className="mb-3">
                  <p className="text-xs text-gray-400 italic mb-1">
                    {persona.name}
                  </p>
                  <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">
                    {persona.description}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 mb-3">
                <div className="p-2 rounded-lg bg-gray-800">
                  <div className="text-xs text-gray-500">Customers</div>
                  <div className="text-white font-bold">
                    {s.count.toLocaleString()}
                  </div>
                  <div className="text-gray-500 text-xs">
                    {s.percentage.toFixed(1)}%
                  </div>
                </div>
                <div className="p-2 rounded-lg bg-gray-800">
                  <div className="text-xs text-gray-500">Avg Balance</div>
                  <div className="text-white font-bold">
                    {formatAmount(s.featureMeans.BALANCE ?? 0)}
                  </div>
                  <div className="text-gray-500 text-xs">
                    Credit: {formatAmount(s.featureMeans.CREDIT_LIMIT ?? 0)}
                  </div>
                </div>
              </div>
              <div className="mb-3">
                <div className="text-xs text-gray-500 mb-1">Top Features</div>
                <div className="flex flex-wrap gap-1">
                  {s.dominantFeatures.map((f) => (
                    <span
                      key={f}
                      className="px-2 py-0.5 text-xs rounded bg-gray-800 text-gray-300"
                    >
                      {f}
                    </span>
                  ))}
                </div>
              </div>

              {/* Feature chart toggle */}
              <button
                type="button"
                onClick={() =>
                  setExpanded((prev) => {
                    const n = new Set(prev);
                    n.has(s.id) ? n.delete(s.id) : n.add(s.id);
                    return n;
                  })
                }
                className="w-full flex items-center justify-center gap-1 text-xs text-gray-500 hover:text-gray-300 py-1"
              >
                {isExpanded ? (
                  <>
                    <ChevronUp className="w-3 h-3" /> Collapse
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-3 h-3" /> Show Feature Chart
                  </>
                )}
              </button>
              {isExpanded && (
                <div className="mt-3">
                  <ResponsiveContainer width="100%" height={160}>
                    <BarChart
                      data={chartData}
                      layout="vertical"
                      margin={{ left: 40, right: 10 }}
                    >
                      <XAxis type="number" hide />
                      <YAxis
                        type="category"
                        dataKey="name"
                        tick={{ fill: "#9ca3af", fontSize: 10 }}
                        width={60}
                      />
                      <Tooltip formatter={(v: number) => formatAmount(v)} />
                      <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                        {chartData.map((entry, i) => (
                          <Cell
                            key={entry.name}
                            fill={COLORS[i % COLORS.length]}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Recommendations toggle */}
              {persona && (
                <>
                  <div className="border-t border-gray-800 mt-2 pt-2">
                    <button
                      type="button"
                      onClick={() =>
                        setRecExpanded((prev) => {
                          const n = new Set(prev);
                          n.has(s.id) ? n.delete(s.id) : n.add(s.id);
                          return n;
                        })
                      }
                      className="w-full flex items-center justify-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 py-1"
                    >
                      {isRecExpanded ? (
                        <>
                          <ChevronUp className="w-3 h-3" /> Hide Recommendations
                        </>
                      ) : (
                        <>
                          <ChevronDown className="w-3 h-3" /> Show
                          Recommendations
                        </>
                      )}
                    </button>
                  </div>
                  {isRecExpanded && (
                    <div className="mt-2 space-y-2">
                      {persona.recommendations.map((rec, i) => (
                        <div
                          key={rec.title}
                          className="flex gap-2 p-2.5 rounded-lg bg-gray-800 border border-gray-700"
                        >
                          <div
                            className="w-4 h-4 rounded-full shrink-0 flex items-center justify-center text-xs font-bold text-white mt-0.5"
                            style={{ background: s.color }}
                          >
                            {i + 1}
                          </div>
                          <div>
                            <div className="text-xs font-semibold text-white">
                              {rec.title}
                            </div>
                            <div className="text-xs text-gray-400 mt-0.5 leading-relaxed">
                              {rec.desc}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
