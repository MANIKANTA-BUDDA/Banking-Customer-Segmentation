import { Button } from "@/components/ui/button";
import { Download, UploadCloud } from "lucide-react";
import type { Page } from "../App";
import { useCurrency } from "../context/CurrencyContext";
import { useData } from "../context/DataContext";

function downloadCSV(content: string, filename: string) {
  const blob = new Blob([content], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function Reports({ navigate }: { navigate: (p: Page) => void }) {
  const { formatAmount } = useCurrency();
  const {
    isReady,
    stats,
    rows,
    numericRows,
    numericColumnNames,
    assignments,
    filename,
    uploadedAt,
    columnNames,
  } = useData();

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

  const downloadAssignments = () => {
    const headers = [
      "Row",
      "Segment",
      "Persona",
      ...numericColumnNames.slice(0, 5),
    ];
    const lines = [
      headers.join(","),
      ...numericRows.map((row, i) => {
        const s = stats[assignments[i]];
        return [
          i + 1,
          s?.label,
          s?.persona,
          ...row.slice(0, 5).map((v) => v.toFixed(2)),
        ].join(",");
      }),
    ];
    downloadCSV(lines.join("\n"), "segment_assignments.csv");
  };

  const downloadSegmentReport = () => {
    const headers = [
      "Segment",
      "Persona",
      "Count",
      "Percentage",
      ...numericColumnNames,
    ];
    const lines = [
      headers.join(","),
      ...stats.map((s) =>
        [
          s.label,
          s.persona,
          s.count,
          `${s.percentage.toFixed(1)}%`,
          ...numericColumnNames.map((col) =>
            (s.featureMeans[col] ?? 0).toFixed(2),
          ),
        ].join(","),
      ),
    ];
    downloadCSV(lines.join("\n"), "segment_report.csv");
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Reports</h1>
          <p className="text-gray-400 text-sm">
            Export and review segmentation results
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={downloadAssignments}
            variant="outline"
            className="border-gray-700 text-gray-300 hover:bg-gray-800"
            data-ocid="reports.segment_assignments.button"
          >
            <Download className="w-4 h-4 mr-2" /> Segment Assignments
          </Button>
          <Button
            onClick={downloadSegmentReport}
            className="bg-indigo-600 hover:bg-indigo-700"
            data-ocid="reports.segment_report.button"
          >
            <Download className="w-4 h-4 mr-2" /> Segment Report
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Filename", value: filename },
          { label: "Total Rows", value: rows.length.toLocaleString() },
          { label: "Columns", value: columnNames.length.toString() },
          {
            label: "Processed",
            value: uploadedAt ? new Date(uploadedAt).toLocaleString() : "-",
          },
        ].map(({ label, value }) => (
          <div
            key={label}
            className="p-4 rounded-xl bg-gray-900 border border-gray-800"
          >
            <div className="text-xs text-gray-500 mb-1">{label}</div>
            <div className="text-white font-medium text-sm truncate">
              {value}
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-xl bg-gray-900 border border-gray-800 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-800">
          <h3 className="text-white font-medium">Segment Summary Report</h3>
        </div>
        <div className="overflow-auto">
          <table className="w-full text-xs">
            <thead className="bg-gray-950">
              <tr>
                <th className="px-4 py-3 text-left text-gray-400">Segment</th>
                <th className="px-4 py-3 text-left text-gray-400">Persona</th>
                <th className="px-4 py-3 text-left text-gray-400">Count</th>
                <th className="px-4 py-3 text-left text-gray-400">%</th>
                {numericColumnNames.map((col) => (
                  <th
                    key={col}
                    className="px-4 py-3 text-left text-gray-400 whitespace-nowrap"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {stats.map((s) => (
                <tr
                  key={s.id}
                  className="border-t border-gray-800 hover:bg-gray-800/40"
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
                      className="px-2 py-0.5 rounded text-xs"
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
                  {numericColumnNames.map((col) => (
                    <td
                      key={col}
                      className="px-4 py-3 text-gray-300 tabular-nums whitespace-nowrap"
                    >
                      {formatAmount(s.featureMeans[col] ?? 0)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
