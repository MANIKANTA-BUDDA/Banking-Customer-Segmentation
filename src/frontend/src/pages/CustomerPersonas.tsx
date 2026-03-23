import { Button } from "@/components/ui/button";
import { UploadCloud } from "lucide-react";
import type { Page } from "../App";
import { useData } from "../context/DataContext";
import { CASE_STUDY, PERSONAS } from "../data/personas";

const SEGMENT_COLORS: Record<string, string> = {
  Premium: "#6366f1",
  Standard: "#06b6d4",
  Basic: "#f59e0b",
  "At-Risk": "#f43f5e",
  Dormant: "#22c55e",
};

const SEGMENT_BG: Record<string, string> = {
  Premium: "rgba(99,102,241,0.08)",
  Standard: "rgba(6,182,212,0.08)",
  Basic: "rgba(245,158,11,0.08)",
  "At-Risk": "rgba(244,63,94,0.08)",
  Dormant: "rgba(34,197,94,0.08)",
};

const SEGMENT_BORDER: Record<string, string> = {
  Premium: "border-indigo-500",
  Standard: "border-cyan-500",
  Basic: "border-amber-500",
  "At-Risk": "border-rose-500",
  Dormant: "border-green-500",
};

const SEGMENT_ORDER = ["Premium", "Standard", "Basic", "At-Risk", "Dormant"];

export default function CustomerPersonas({
  navigate,
}: { navigate: (p: Page) => void }) {
  const { isReady } = useData();

  return (
    <div className="p-6 space-y-10">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Customer Personas</h1>
        <p className="text-gray-400 text-sm mt-1">
          Based on:{" "}
          <span className="text-indigo-400 italic">
            "Using Customer Segmentation to Create Customer Personas" — Lucas O,
            Jul 2023
          </span>
        </p>
      </div>

      {/* Problem Statement */}
      <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
        <h2 className="text-lg font-bold text-white mb-2">Problem Statement</h2>
        <p className="text-gray-300 text-sm leading-relaxed">
          {CASE_STUDY.problemStatement}
        </p>
      </div>

      {/* Solution */}
      <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
        <h2 className="text-lg font-bold text-white mb-2">
          Solution: Customer Segmentation
        </h2>
        <p className="text-gray-300 text-sm leading-relaxed">
          {CASE_STUDY.solution}
        </p>
      </div>

      {/* Implementation Strategy */}
      <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
        <h2 className="text-lg font-bold text-white mb-4">
          Implementation Strategy
        </h2>
        <div className="space-y-3">
          {CASE_STUDY.implementationSteps.map((s) => (
            <div key={s.step} className="flex gap-4 items-start">
              <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
                {s.step}
              </div>
              <div>
                <div className="text-white font-semibold text-sm">
                  {s.title}
                </div>
                <div className="text-gray-400 text-sm mt-0.5">{s.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* EDA Insights */}
      <div>
        <h2 className="text-lg font-bold text-white mb-4">
          Data Understanding / EDA
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {CASE_STUDY.edaInsights.map((e) => (
            <div
              key={e.title}
              className="rounded-xl border border-gray-800 bg-gray-900 p-5"
            >
              <div className="text-2xl mb-2">{e.icon}</div>
              <h3 className="text-white font-semibold text-sm mb-3">
                {e.title}
              </h3>
              <ul className="space-y-2">
                {e.observations.map((obs) => (
                  <li key={obs} className="flex gap-2 text-xs text-gray-400">
                    <span className="text-indigo-400 mt-0.5">•</span>
                    {obs}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Data Prep */}
      <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
        <h2 className="text-lg font-bold text-white mb-3">
          Data Preparation for K-Means
        </h2>
        <ul className="space-y-2">
          {CASE_STUDY.dataPrep.map((d, i) => (
            <li
              key={d + String(i)}
              className="flex gap-2 text-sm text-gray-300"
            >
              <span className="text-indigo-400 font-bold">{i + 1}.</span>
              {d}
            </li>
          ))}
        </ul>
        <p className="text-gray-400 text-xs mt-4 italic border-t border-gray-800 pt-3">
          {CASE_STUDY.kmeansNote}
        </p>
      </div>

      {/* Personas */}
      <div>
        <h2 className="text-lg font-bold text-white mb-4">
          Customer Personas & Product Recommendations
        </h2>
        {!isReady && (
          <div className="flex items-center gap-3 p-4 rounded-xl border border-gray-700 bg-gray-900 mb-4">
            <UploadCloud className="w-5 h-5 text-gray-500" />
            <span className="text-sm text-gray-400">
              Upload a dataset to see segment distribution alongside personas.
            </span>
            <Button
              size="sm"
              onClick={() => navigate("upload")}
              className="ml-auto bg-indigo-600 hover:bg-indigo-700"
            >
              Upload
            </Button>
          </div>
        )}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {SEGMENT_ORDER.map((segName, idx) => {
            const persona = PERSONAS[segName];
            const color = SEGMENT_COLORS[segName] ?? "#6366f1";
            const borderClass = SEGMENT_BORDER[segName] ?? "border-indigo-500";
            const bgStyle = SEGMENT_BG[segName] ?? "rgba(99,102,241,0.08)";
            return (
              <div
                key={segName}
                className={`rounded-xl border-l-4 ${borderClass} bg-gray-900 border border-gray-800 overflow-hidden`}
                data-ocid={`personas.item.${idx + 1}`}
              >
                <div className="p-5 pb-4" style={{ background: bgStyle }}>
                  <div className="flex items-center gap-3 mb-1">
                    <div
                      className="w-3.5 h-3.5 rounded-full shrink-0"
                      style={{ background: color }}
                    />
                    <span className="text-base font-bold" style={{ color }}>
                      {segName}
                    </span>
                  </div>
                  <p className="text-white font-semibold text-lg">
                    {persona.name}
                  </p>
                </div>
                <div className="p-5 space-y-5">
                  {/* Behavioral Profile */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <div
                        className="w-1 h-4 rounded-full"
                        style={{ background: color }}
                      />
                      <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-400">
                        Behavioral Profile
                      </h3>
                    </div>
                    <p className="text-gray-300 text-sm leading-relaxed">
                      {persona.description}
                    </p>
                  </div>

                  {/* Key Metrics */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-1 h-4 rounded-full bg-gray-600" />
                      <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-400">
                        Key Metrics
                      </h3>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {persona.keyMetrics.map((m) => (
                        <div
                          key={m.label}
                          className="p-2 rounded-lg bg-gray-800 border border-gray-700"
                        >
                          <div className="text-xs text-gray-500">{m.label}</div>
                          <div className="text-sm font-semibold text-white mt-0.5">
                            {m.value}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* EDA Details */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-1 h-4 rounded-full bg-gray-600" />
                      <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-400">
                        EDA Insights
                      </h3>
                    </div>
                    <ul className="space-y-1">
                      {persona.edaDetails.map((d) => (
                        <li
                          key={d}
                          className="flex gap-2 text-xs text-gray-400"
                        >
                          <span style={{ color }} className="mt-0.5">
                            •
                          </span>
                          {d}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Product Recommendations */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <div
                        className="w-1 h-4 rounded-full"
                        style={{ background: color }}
                      />
                      <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-400">
                        Product Recommendations
                      </h3>
                    </div>
                    <div className="space-y-2">
                      {persona.recommendations.map((rec, i) => (
                        <div
                          key={rec.title}
                          className="flex gap-3 p-3 rounded-lg bg-gray-800 border border-gray-700"
                        >
                          <div
                            className="w-5 h-5 rounded-full shrink-0 flex items-center justify-center text-xs font-bold text-white mt-0.5"
                            style={{ background: color }}
                          >
                            {i + 1}
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-white">
                              {rec.title}
                            </div>
                            <div className="text-xs text-gray-400 mt-0.5 leading-relaxed">
                              {rec.desc}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Conclusion */}
      <div className="rounded-xl border border-indigo-800 bg-indigo-950/30 p-6">
        <h2 className="text-lg font-bold text-white mb-2">Conclusion</h2>
        <p className="text-gray-300 text-sm leading-relaxed">
          {CASE_STUDY.conclusion}
        </p>
        <p className="text-gray-500 text-xs mt-3">
          Source: Lucas O, "Using Customer Segmentation to Create Customer
          Personas", Medium, Jul 1, 2023
        </p>
      </div>
    </div>
  );
}
