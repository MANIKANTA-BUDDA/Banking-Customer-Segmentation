import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle,
  FileText,
  UploadCloud,
} from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { read, utils } from "xlsx";
import type { Page } from "../App";
import { useData } from "../context/DataContext";
import { SEGMENT_TIERS, SEGMENT_TIER_COLORS } from "../utils/clusterStats";

function parseCSV(text: string): {
  columns: string[];
  rows: Record<string, string>[];
} {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return { columns: [], rows: [] };
  const parseRow = (line: string): string[] => {
    const result: string[] = [];
    let current = "";
    let inQuote = false;
    for (const ch of line) {
      if (ch === '"') {
        inQuote = !inQuote;
        continue;
      }
      if (ch === "," && !inQuote) {
        result.push(current.trim());
        current = "";
        continue;
      }
      current += ch;
    }
    result.push(current.trim());
    return result;
  };
  const columns = parseRow(lines[0]);
  const rows = lines
    .slice(1)
    .filter((l) => l.trim())
    .map((line) => {
      const vals = parseRow(line);
      const obj: Record<string, string> = {};
      columns.forEach((col, i) => {
        obj[col] = vals[i] ?? "";
      });
      return obj;
    });
  return { columns, rows };
}

function parseExcel(arrayBuffer: ArrayBuffer): {
  columns: string[];
  rows: Record<string, string>[];
} {
  const workbook = read(arrayBuffer, { type: "array" });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const jsonData = utils.sheet_to_json<Record<string, unknown>>(sheet, {
    defval: "",
  });
  if (jsonData.length === 0) return { columns: [], rows: [] };
  const columns = Object.keys(jsonData[0]);
  const rows = jsonData.map((row) => {
    const obj: Record<string, string> = {};
    for (const col of columns) {
      obj[col] = String(row[col] ?? "");
    }
    return obj;
  });
  return { columns, rows };
}

interface Props {
  onReady: () => void;
}

export default function DatasetUpload({ onReady }: Props) {
  const {
    processDataset,
    isProcessing,
    filename: activeFile,
    rows: activeRows,
    clearDataset,
  } = useData();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [k, setK] = useState(5);
  const [status, setStatus] = useState<"idle" | "parsed" | "done" | "error">(
    "idle",
  );
  const [preview, setPreview] = useState<{
    columns: string[];
    rows: Record<string, string>[];
    filename: string;
  } | null>(null);
  const [error, setError] = useState("");

  const handleFile = useCallback((file: File) => {
    const name = file.name.toLowerCase();
    const isCSV = name.endsWith(".csv");
    const isExcel = name.endsWith(".xlsx") || name.endsWith(".xls");

    if (!isCSV && !isExcel) {
      setError("Only CSV or Excel files are supported.");
      return;
    }

    const reader = new FileReader();

    if (isCSV) {
      reader.onload = (e) => {
        const text = e.target?.result as string;
        const { columns, rows } = parseCSV(text);
        if (rows.length === 0) {
          setError("CSV appears empty.");
          return;
        }
        setPreview({ columns, rows, filename: file.name });
        setStatus("parsed");
        setError("");
      };
      reader.readAsText(file);
    } else {
      reader.onload = (e) => {
        const ab = e.target?.result as ArrayBuffer;
        const { columns, rows } = parseExcel(ab);
        if (rows.length === 0) {
          setError("Excel file appears empty.");
          return;
        }
        setPreview({ columns, rows, filename: file.name });
        setStatus("parsed");
        setError("");
      };
      reader.readAsArrayBuffer(file);
    }
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile],
  );

  const runSegmentation = async () => {
    if (!preview) return;
    await processDataset(preview.rows, preview.columns, preview.filename, k);
    setStatus("done");
  };

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Upload Dataset</h1>
        <p className="text-gray-400 mt-1">
          Upload a CSV or Excel file to power all sections of the app
        </p>
      </div>

      {/* Segment legend */}
      <div className="mb-6 p-4 rounded-xl bg-gray-900 border border-gray-800">
        <div className="text-xs text-gray-400 font-medium mb-3 uppercase tracking-wide">
          Segment Classification
        </div>
        <div className="grid grid-cols-5 gap-2">
          {SEGMENT_TIERS.map((tier) => (
            <div key={tier} className="flex flex-col items-center gap-1">
              <div
                className="w-3 h-3 rounded-full"
                style={{ background: SEGMENT_TIER_COLORS[tier] }}
              />
              <span className="text-xs text-gray-300 font-medium">{tier}</span>
            </div>
          ))}
        </div>
      </div>

      {activeFile && (
        <div className="mb-6 p-4 rounded-xl bg-indigo-950 border border-indigo-700 flex items-center justify-between">
          <div>
            <div className="text-indigo-300 font-medium text-sm">
              Currently Active: {activeFile}
            </div>
            <div className="text-gray-400 text-xs">
              {activeRows.length.toLocaleString()} rows loaded
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={onReady}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              Go to Dashboard <ArrowRight className="w-3 h-3 ml-1" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={clearDataset}
              className="text-red-400 hover:text-red-300"
            >
              Clear
            </Button>
          </div>
        </div>
      )}

      {status === "idle" && (
        <div
          role="presentation"
          className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors cursor-pointer ${
            dragging
              ? "border-indigo-500 bg-indigo-950/30"
              : "border-gray-700 hover:border-gray-500"
          }`}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          onClick={() => fileInputRef.current?.click()}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ")
              fileInputRef.current?.click();
          }}
          data-ocid="upload.dropzone"
        >
          <UploadCloud className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <p className="text-white font-medium">Drop your file here</p>
          <p className="text-gray-500 text-sm mt-1">or click to browse</p>
          <p className="text-gray-600 text-xs mt-4">
            Supports CSV and Excel (.xlsx/.xls) files
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.xlsx,.xls"
            className="hidden"
            onChange={(e) =>
              e.target.files?.[0] && handleFile(e.target.files[0])
            }
          />
        </div>
      )}

      {error && (
        <div className="mt-4 p-3 rounded-lg bg-red-950 border border-red-700 flex items-center gap-2 text-red-400">
          <AlertCircle className="w-4 h-4" /> {error}
        </div>
      )}

      {status === "parsed" && preview && (
        <div className="space-y-6">
          <div className="p-4 rounded-xl bg-gray-900 border border-gray-700">
            <div className="flex items-center gap-3 mb-4">
              <FileText className="w-5 h-5 text-indigo-400" />
              <div>
                <div className="text-white font-medium">{preview.filename}</div>
                <div className="text-gray-400 text-sm">
                  {preview.rows.length.toLocaleString()} rows ·{" "}
                  {preview.columns.length} columns
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {preview.columns.map((col) => (
                <span
                  key={col}
                  className="px-2 py-0.5 text-xs rounded bg-gray-800 text-gray-300"
                >
                  {col}
                </span>
              ))}
            </div>
          </div>

          <div className="overflow-auto rounded-xl border border-gray-700">
            <table className="w-full text-xs">
              <thead className="bg-gray-900">
                <tr>
                  {preview.columns.slice(0, 6).map((col) => (
                    <th
                      key={col}
                      className="px-3 py-2 text-left text-gray-400 whitespace-nowrap"
                    >
                      {col}
                    </th>
                  ))}
                  {preview.columns.length > 6 && (
                    <th className="px-3 py-2 text-gray-600">
                      +{preview.columns.length - 6} more
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {preview.rows.slice(0, 5).map((row) => {
                  const rk = [preview.columns[0], preview.columns[1]]
                    .map((c) => row[c])
                    .join("-");
                  return (
                    <tr key={rk} className="border-t border-gray-800">
                      {preview.columns.slice(0, 6).map((col) => (
                        <td
                          key={col}
                          className="px-3 py-1.5 text-gray-300 whitespace-nowrap"
                        >
                          {row[col] || "-"}
                        </td>
                      ))}
                      {preview.columns.length > 6 && (
                        <td className="px-3 py-1.5 text-gray-600">…</td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="p-4 rounded-xl bg-gray-900 border border-gray-700">
            <div className="flex items-center justify-between mb-3">
              <span className="text-white font-medium">
                Number of Segments (k)
              </span>
              <span className="text-indigo-400 font-bold text-lg">{k}</span>
            </div>
            <Slider
              min={3}
              max={7}
              step={1}
              value={[k]}
              onValueChange={([v]) => setK(v)}
              className="mb-2"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>3 (simpler)</span>
              <span>7 (detailed)</span>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Default is 5 to match: Premium, Standard, Basic, At-Risk, Dormant
            </p>
          </div>

          {isProcessing ? (
            <div className="p-6 text-center">
              <div className="text-indigo-400 font-medium mb-2">
                Running Segmentation…
              </div>
              <Progress value={66} className="mb-2" />
              <div className="text-gray-500 text-sm">
                Classifying {preview.rows.length.toLocaleString()} customers
                into {k} segments
              </div>
            </div>
          ) : (
            <div className="flex gap-3">
              <Button
                onClick={runSegmentation}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white"
                data-ocid="upload.submit_button"
              >
                Run Segmentation
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setStatus("idle");
                  setPreview(null);
                }}
                className="border-gray-700 text-gray-400"
              >
                Change File
              </Button>
            </div>
          )}
        </div>
      )}

      {status === "done" && (
        <div className="p-8 text-center rounded-xl bg-gray-900 border border-green-700">
          <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
          <h2 className="text-white text-xl font-bold mb-1">
            Segmentation Complete!
          </h2>
          <p className="text-gray-400 mb-6">
            Dataset processed and ready. All sections are now powered by your
            data.
          </p>
          <Button
            onClick={onReady}
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            Go to Dashboard <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      )}
    </div>
  );
}
