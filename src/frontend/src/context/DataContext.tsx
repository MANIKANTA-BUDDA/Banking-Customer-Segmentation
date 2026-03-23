import type React from "react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { type ClusterStats, computeClusterStats } from "../utils/clusterStats";
import {
  assignAll,
  computeNormParams,
  euclidean,
  kmeansNormalized,
  normalizeWithParams,
} from "../utils/kmeans";

export interface FilterState {
  balanceMin: number;
  balanceMax: number;
  purchasesMin: number;
  purchasesMax: number;
  creditLimitMin: number;
  creditLimitMax: number;
  tenureMin: number;
  tenureMax: number;
  selectedClusters: number[];
}

interface DataState {
  rows: Record<string, string>[];
  numericRows: number[][];
  columnNames: string[];
  numericColumnNames: string[];
  assignments: number[];
  centroids: number[][];
  clusterCount: number;
  stats: ClusterStats[];
  distanceToCentroid: number[];
  filename: string;
  uploadedAt: string;
  isReady: boolean;
}

interface DataContextType extends DataState {
  isProcessing: boolean;
  filters: FilterState;
  filteredIndices: number[];
  processDataset: (
    rows: Record<string, string>[],
    columns: string[],
    filename: string,
    k?: number,
  ) => Promise<void>;
  setFilters: (f: Partial<FilterState>) => void;
  resetFilters: () => void;
  clearDataset: () => void;
}

const defaultFilters: FilterState = {
  balanceMin: 0,
  balanceMax: Number.POSITIVE_INFINITY,
  purchasesMin: 0,
  purchasesMax: Number.POSITIVE_INFINITY,
  creditLimitMin: 0,
  creditLimitMax: Number.POSITIVE_INFINITY,
  tenureMin: 0,
  tenureMax: Number.POSITIVE_INFINITY,
  selectedClusters: [],
};

const emptyState: DataState = {
  rows: [],
  numericRows: [],
  columnNames: [],
  numericColumnNames: [],
  assignments: [],
  centroids: [],
  clusterCount: 0,
  stats: [],
  distanceToCentroid: [],
  filename: "",
  uploadedAt: "",
  isReady: false,
};

const DataContext = createContext<DataContextType>({
  ...emptyState,
  isProcessing: false,
  filters: defaultFilters,
  filteredIndices: [],
  processDataset: async () => {},
  setFilters: () => {},
  resetFilters: () => {},
  clearDataset: () => {},
});

const STORAGE_KEY = "banksegment_data";
const SAMPLE_SIZE = 2000;

export function DataContextProvider({
  children,
}: { children: React.ReactNode }) {
  const [state, setState] = useState<DataState>(emptyState);
  const [isProcessing, setIsProcessing] = useState(false);
  const [filters, setFiltersState] = useState<FilterState>(defaultFilters);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setState(parsed);
      }
    } catch {}
  }, []);

  const processDataset = useCallback(
    async (
      rows: Record<string, string>[],
      columns: string[],
      filename: string,
      k = 5,
    ) => {
      setIsProcessing(true);
      await new Promise((r) => setTimeout(r, 50)); // let UI update

      try {
        // Extract numeric columns
        const numericCols = columns.filter((col) => {
          const vals = rows.slice(0, 50).map((r) => Number.parseFloat(r[col]));
          return (
            vals.filter((v) => !Number.isNaN(v)).length > vals.length * 0.7
          );
        });

        const numericRows = rows.map((row) =>
          numericCols.map((col) => {
            const v = Number.parseFloat(row[col]);
            return Number.isNaN(v) ? 0 : v;
          }),
        );

        await new Promise((r) => setTimeout(r, 0)); // yield before heavy computation

        const n = numericRows.length;
        const actualK = Math.min(k, n);

        // Reservoir sampling for large datasets
        let sampleRows = numericRows;
        if (n > SAMPLE_SIZE) {
          const idx: number[] = Array.from(
            { length: SAMPLE_SIZE },
            (_, i) => i,
          );
          for (let i = SAMPLE_SIZE; i < n; i++) {
            const j = Math.floor(Math.random() * (i + 1));
            if (j < SAMPLE_SIZE) idx[j] = i;
          }
          sampleRows = idx.map((i) => numericRows[i]);
        }

        await new Promise((r) => setTimeout(r, 0)); // yield before kmeans

        // Compute norm params from sample, then normalize all rows
        const normParams = computeNormParams(sampleRows);
        const normalizedSample = normalizeWithParams(sampleRows, normParams);
        const { centroids } = kmeansNormalized(
          normalizedSample,
          Math.min(actualK, normalizedSample.length),
          50,
        );

        await new Promise((r) => setTimeout(r, 0)); // yield after kmeans

        // Assign ALL rows to nearest centroid
        const normalizedAll = normalizeWithParams(numericRows, normParams);
        const assignments = assignAll(normalizedAll, centroids);
        const distanceToCentroid = normalizedAll.map((row, i) =>
          euclidean(row, centroids[assignments[i]]),
        );

        await new Promise((r) => setTimeout(r, 0)); // yield before stats

        const stats = computeClusterStats(
          numericRows,
          numericCols,
          assignments,
          actualK,
        );

        const newState: DataState = {
          rows,
          numericRows,
          columnNames: columns,
          numericColumnNames: numericCols,
          assignments,
          centroids,
          clusterCount: actualK,
          stats,
          distanceToCentroid,
          filename,
          uploadedAt: new Date().toISOString(),
          isReady: true,
        };

        setState(newState);
        // Store a compact version (exclude full rows for large datasets)
        try {
          const compact = {
            ...newState,
            rows: newState.rows.slice(0, 200),
          };
          localStorage.setItem(STORAGE_KEY, JSON.stringify(compact));
        } catch {}
      } finally {
        setIsProcessing(false);
      }
    },
    [],
  );

  const setFilters = useCallback((f: Partial<FilterState>) => {
    setFiltersState((prev) => ({ ...prev, ...f }));
  }, []);

  const resetFilters = useCallback(() => setFiltersState(defaultFilters), []);

  const clearDataset = useCallback(() => {
    setState(emptyState);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const filteredIndices = useMemo(() => {
    if (!state.isReady) return [];
    const balCol = state.numericColumnNames.indexOf("BALANCE");
    const purCol = state.numericColumnNames.indexOf("PURCHASES");
    const clCol = state.numericColumnNames.indexOf("CREDIT_LIMIT");
    const tenCol = state.numericColumnNames.indexOf("TENURE");

    return state.numericRows.reduce<number[]>((acc, row, i) => {
      if (
        filters.selectedClusters.length > 0 &&
        !filters.selectedClusters.includes(state.assignments[i])
      )
        return acc;
      if (
        balCol >= 0 &&
        (row[balCol] < filters.balanceMin || row[balCol] > filters.balanceMax)
      )
        return acc;
      if (
        purCol >= 0 &&
        (row[purCol] < filters.purchasesMin ||
          row[purCol] > filters.purchasesMax)
      )
        return acc;
      if (
        clCol >= 0 &&
        (row[clCol] < filters.creditLimitMin ||
          row[clCol] > filters.creditLimitMax)
      )
        return acc;
      if (
        tenCol >= 0 &&
        (row[tenCol] < filters.tenureMin || row[tenCol] > filters.tenureMax)
      )
        return acc;
      acc.push(i);
      return acc;
    }, []);
  }, [state, filters]);

  return (
    <DataContext.Provider
      value={{
        ...state,
        isProcessing,
        filters,
        filteredIndices,
        processDataset,
        setFilters,
        resetFilters,
        clearDataset,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  return useContext(DataContext);
}
