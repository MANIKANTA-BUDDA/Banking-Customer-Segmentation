import { Code2, Database } from "lucide-react";
import { useData } from "../context/DataContext";

const endpoints = [
  {
    name: "saveDatasetMetadata",
    type: "update",
    description: "Save metadata for an uploaded dataset",
    params: "filename: Text, rowCount: Nat, columns: [Text], blobId: Text",
    returns: "Nat (dataset ID)",
  },
  {
    name: "getDatasetHistory",
    type: "query",
    description: "Get all previously uploaded dataset records",
    params: "(none)",
    returns: "[DatasetMetadata]",
  },
  {
    name: "deleteDataset",
    type: "update",
    description: "Delete a dataset metadata record by ID",
    params: "id: Nat",
    returns: "()",
  },
  {
    name: "createSegment",
    type: "update",
    description: "Create a new named segment",
    params: "segment: Segment",
    returns: "Nat (segment ID)",
  },
  {
    name: "getAllSegments",
    type: "query",
    description: "Get all segments sorted by ID",
    params: "(none)",
    returns: "[Segment]",
  },
  {
    name: "getSegmentById",
    type: "query",
    description: "Get a single segment by ID",
    params: "id: Nat",
    returns: "Segment",
  },
  {
    name: "updateSegment",
    type: "update",
    description: "Update an existing segment",
    params: "id: Nat, segment: Segment",
    returns: "()",
  },
  {
    name: "deleteSegment",
    type: "update",
    description: "Delete a segment by ID",
    params: "id: Nat",
    returns: "()",
  },
  {
    name: "getDashboardStats",
    type: "query",
    description: "Get aggregated KPIs across all segments",
    params: "(none)",
    returns: "DashboardStats",
  },
  {
    name: "seedSegments",
    type: "update",
    description: "Seed default segments (idempotent)",
    params: "(none)",
    returns: "()",
  },
];

export default function APIReference() {
  const { isReady, stats, rows, clusterCount } = useData();

  const liveResponse = isReady
    ? JSON.stringify(
        {
          totalCustomers: rows.length,
          totalSegments: clusterCount,
          topRevenueSegment: stats[0]?.persona ?? "N/A",
          averageCustomerValue: stats[0]?.featureMeans.BALANCE ?? 0,
        },
        null,
        2,
      )
    : null;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center">
          <Code2 className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">API Reference</h1>
          <p className="text-gray-400 text-sm">
            Backend canister endpoints (Motoko on ICP)
          </p>
        </div>
      </div>
      {liveResponse && (
        <div className="p-4 rounded-xl bg-gray-900 border border-emerald-700">
          <div className="flex items-center gap-2 mb-2">
            <Database className="w-4 h-4 text-emerald-400" />
            <span className="text-emerald-400 font-medium text-sm">
              Live Response — getDashboardStats
            </span>
          </div>
          <pre className="text-emerald-300 text-xs overflow-auto">
            {liveResponse}
          </pre>
        </div>
      )}
      <div className="space-y-3">
        {endpoints.map((ep) => (
          <div
            key={ep.name}
            className="p-4 rounded-xl bg-gray-900 border border-gray-800"
          >
            <div className="flex items-center gap-3 mb-2">
              <span
                className={`px-2 py-0.5 text-xs font-bold rounded ${ep.type === "query" ? "bg-cyan-900 text-cyan-300" : "bg-amber-900 text-amber-300"}`}
              >
                {ep.type.toUpperCase()}
              </span>
              <code className="text-indigo-400 font-mono font-semibold">
                {ep.name}
              </code>
            </div>
            <p className="text-gray-400 text-sm mb-2">{ep.description}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-2 rounded bg-gray-800">
                <div className="text-xs text-gray-500 mb-1">Parameters</div>
                <code className="text-gray-300 text-xs">{ep.params}</code>
              </div>
              <div className="p-2 rounded bg-gray-800">
                <div className="text-xs text-gray-500 mb-1">Returns</div>
                <code className="text-gray-300 text-xs">{ep.returns}</code>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
