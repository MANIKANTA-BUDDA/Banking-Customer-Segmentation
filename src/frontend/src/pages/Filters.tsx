import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RotateCcw, SlidersHorizontal, UploadCloud } from "lucide-react";
import { useState } from "react";
import type { Page } from "../App";
import { useCurrency } from "../context/CurrencyContext";
import { useData } from "../context/DataContext";

type RangeOption = { label: string; min: number; max: number };

const BALANCE_OPTIONS: RangeOption[] = [
  { label: "All", min: 0, max: Number.MAX_SAFE_INTEGER },
  { label: "< \u20b910K", min: 0, max: 10000 },
  { label: "\u20b910K\u2013\u20b950K", min: 10000, max: 50000 },
  { label: "\u20b950K\u2013\u20b91L", min: 50000, max: 100000 },
  { label: "> \u20b91L", min: 100000, max: Number.MAX_SAFE_INTEGER },
];

const PURCHASES_OPTIONS: RangeOption[] = [
  { label: "All", min: 0, max: Number.MAX_SAFE_INTEGER },
  { label: "< \u20b95K", min: 0, max: 5000 },
  { label: "\u20b95K\u2013\u20b925K", min: 5000, max: 25000 },
  { label: "\u20b925K\u2013\u20b975K", min: 25000, max: 75000 },
  { label: "> \u20b975K", min: 75000, max: Number.MAX_SAFE_INTEGER },
];

const CREDIT_LIMIT_OPTIONS: RangeOption[] = [
  { label: "All", min: 0, max: Number.MAX_SAFE_INTEGER },
  { label: "< \u20b925K", min: 0, max: 25000 },
  { label: "\u20b925K\u2013\u20b91L", min: 25000, max: 100000 },
  { label: "\u20b91L\u2013\u20b95L", min: 100000, max: 500000 },
  { label: "> \u20b95L", min: 500000, max: Number.MAX_SAFE_INTEGER },
];

const TENURE_OPTIONS: RangeOption[] = [
  { label: "All", min: 0, max: 99 },
  { label: "1\u20134 months", min: 1, max: 4 },
  { label: "5\u20138 months", min: 5, max: 8 },
  { label: "9\u201312 months", min: 9, max: 12 },
];

type FilterKey = "balance" | "purchases" | "creditLimit" | "tenure";

const FILTER_CONFIGS: {
  key: FilterKey;
  label: string;
  options: RangeOption[];
}[] = [
  { key: "balance", label: "Balance", options: BALANCE_OPTIONS },
  { key: "purchases", label: "Purchases", options: PURCHASES_OPTIONS },
  { key: "creditLimit", label: "Credit Limit", options: CREDIT_LIMIT_OPTIONS },
  { key: "tenure", label: "Tenure", options: TENURE_OPTIONS },
];

type SelectionMap = Record<FilterKey, string>;

const DEFAULT_SELECTIONS: SelectionMap = {
  balance: "All",
  purchases: "All",
  creditLimit: "All",
  tenure: "All",
};

type CustomRangeMap = Record<FilterKey, { min: string; max: string }>;

const DEFAULT_CUSTOM_RANGES: CustomRangeMap = {
  balance: { min: "", max: "" },
  purchases: { min: "", max: "" },
  creditLimit: { min: "", max: "" },
  tenure: { min: "", max: "" },
};

type CategoricalKey =
  | "month"
  | "year"
  | "accountType"
  | "transactionType"
  | "branch";

const CATEGORICAL_CONFIGS: {
  key: CategoricalKey;
  label: string;
  options: string[];
}[] = [
  {
    key: "month",
    label: "Month",
    options: [
      "All",
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ],
  },
  {
    key: "year",
    label: "Year",
    options: ["All", "2020", "2021", "2022", "2023", "2024", "2025", "2026"],
  },
  {
    key: "accountType",
    label: "Account Type",
    options: [
      "All",
      "Savings",
      "Current",
      "Credit Card",
      "Loan",
      "Fixed Deposit",
    ],
  },
  {
    key: "transactionType",
    label: "Transaction Type",
    options: [
      "All",
      "Purchase",
      "Cash Advance",
      "Payment",
      "Refund",
      "Transfer",
    ],
  },
  {
    key: "branch",
    label: "Branch",
    options: [
      "All",
      "Mumbai",
      "Delhi",
      "Bangalore",
      "Chennai",
      "Hyderabad",
      "Kolkata",
      "Pune",
      "Ahmedabad",
    ],
  },
];

type CategoricalMap = Record<CategoricalKey, string>;

const DEFAULT_CATEGORICAL: CategoricalMap = {
  month: "All",
  year: "All",
  accountType: "All",
  transactionType: "All",
  branch: "All",
};

export default function Filters({ navigate }: { navigate: (p: Page) => void }) {
  const {
    isReady,
    numericRows,
    numericColumnNames,
    assignments,
    stats,
    setFilters,
    resetFilters,
    filteredIndices,
    rows,
  } = useData();

  const { formatAmount } = useCurrency();
  const [selections, setSelections] =
    useState<SelectionMap>(DEFAULT_SELECTIONS);
  const [customRanges, setCustomRanges] = useState<CustomRangeMap>(
    DEFAULT_CUSTOM_RANGES,
  );
  const [categoricalSelections, setCategoricalSelections] =
    useState<CategoricalMap>(DEFAULT_CATEGORICAL);
  const [selectedClusters, setSelectedClusters] = useState<number[]>([]);

  if (!isReady) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-24">
        <UploadCloud className="w-16 h-16 text-gray-300 dark:text-gray-700 mb-4" />
        <h2 className="text-gray-900 dark:text-white text-xl font-bold mb-2">
          No Dataset Loaded
        </h2>
        <Button
          onClick={() => navigate("upload")}
          className="bg-indigo-600 hover:bg-indigo-700"
        >
          Upload Dataset
        </Button>
      </div>
    );
  }

  const getOptionRange = (key: FilterKey, label: string): RangeOption => {
    const config = FILTER_CONFIGS.find((c) => c.key === key)!;
    return config.options.find((o) => o.label === label) ?? config.options[0];
  };

  const resolveRange = (key: FilterKey): { min: number; max: number } => {
    const custom = customRanges[key];
    const dropdown = getOptionRange(key, selections[key]);
    const min =
      custom.min !== "" ? Number.parseFloat(custom.min) : dropdown.min;
    const max =
      custom.max !== "" ? Number.parseFloat(custom.max) : dropdown.max;
    return {
      min: Number.isNaN(min) ? dropdown.min : min,
      max: Number.isNaN(max) ? dropdown.max : max,
    };
  };

  const applyFilters = () => {
    const bal = resolveRange("balance");
    const pur = resolveRange("purchases");
    const cl = resolveRange("creditLimit");
    const ten = resolveRange("tenure");
    setFilters({
      balanceMin: bal.min,
      balanceMax: bal.max,
      purchasesMin: pur.min,
      purchasesMax: pur.max,
      creditLimitMin: cl.min,
      creditLimitMax: cl.max,
      tenureMin: ten.min,
      tenureMax: ten.max,
      selectedClusters,
    });
  };

  const handleReset = () => {
    resetFilters();
    setSelections(DEFAULT_SELECTIONS);
    setCustomRanges(DEFAULT_CUSTOM_RANGES);
    setCategoricalSelections(DEFAULT_CATEGORICAL);
    setSelectedClusters([]);
  };

  const toggleCluster = (id: number) => {
    setSelectedClusters((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id],
    );
  };

  const baseIndices =
    filteredIndices.length > 0 ? filteredIndices : rows.map((_, i) => i);

  const matchCount =
    filteredIndices.length > 0 ? filteredIndices.length : rows.length;
  const previewIndices = baseIndices.slice(0, 20);

  const hasCustomRange = (key: FilterKey) =>
    customRanges[key].min !== "" || customRanges[key].max !== "";

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Filters
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Filter dataset to focus on specific customer groups
          </p>
        </div>
        <span
          className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
            filteredIndices.length > 0 && filteredIndices.length < rows.length
              ? "bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-700"
              : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
          }`}
        >
          {matchCount.toLocaleString()} / {rows.length.toLocaleString()}{" "}
          customers
        </span>
      </div>

      {/* Numeric Filter Dropdowns + Custom Range Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {FILTER_CONFIGS.map(({ key, label, options }) => (
          <div
            key={key}
            className="p-4 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm"
          >
            <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
              {label}
            </div>
            <Select
              value={selections[key]}
              onValueChange={(val) => {
                setSelections((prev) => ({ ...prev, [key]: val }));
                setCustomRanges((prev) => ({
                  ...prev,
                  [key]: { min: "", max: "" },
                }));
              }}
            >
              <SelectTrigger
                className="w-full bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white"
                data-ocid={`filters.${key}.select`}
              >
                <SelectValue placeholder="Select range" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
                {options.map((opt) => (
                  <SelectItem
                    key={opt.label}
                    value={opt.label}
                    className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex gap-2 mt-2">
              <Input
                type="number"
                value={customRanges[key].min}
                onChange={(e) =>
                  setCustomRanges((prev) => ({
                    ...prev,
                    [key]: { ...prev[key], min: e.target.value },
                  }))
                }
                placeholder="Min"
                className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 text-xs h-8"
                data-ocid={`filters.${key}.min.input`}
              />
              <Input
                type="number"
                value={customRanges[key].max}
                onChange={(e) =>
                  setCustomRanges((prev) => ({
                    ...prev,
                    [key]: { ...prev[key], max: e.target.value },
                  }))
                }
                placeholder="Max"
                className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 text-xs h-8"
                data-ocid={`filters.${key}.max.input`}
              />
            </div>
            {(selections[key] !== "All" || hasCustomRange(key)) && (
              <p className="text-xs text-indigo-500 dark:text-indigo-400 mt-1.5">
                {hasCustomRange(key) ? "Custom range active" : "Active filter"}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Categorical Filter Dropdowns */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {CATEGORICAL_CONFIGS.map(({ key, label, options }) => (
          <div
            key={key}
            className="p-4 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm"
          >
            <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
              {label}
            </div>
            <Select
              value={categoricalSelections[key]}
              onValueChange={(val) =>
                setCategoricalSelections((prev) => ({ ...prev, [key]: val }))
              }
            >
              <SelectTrigger
                className="w-full bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white"
                data-ocid={`filters.${key}.select`}
              >
                <SelectValue placeholder={`Select ${label}`} />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
                {options.map((opt) => (
                  <SelectItem
                    key={opt}
                    value={opt}
                    className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    {opt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {categoricalSelections[key] !== "All" && (
              <p className="text-xs text-indigo-500 dark:text-indigo-400 mt-1.5">
                Active filter
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Segment Checkboxes */}
      <div className="p-4 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
          Segments
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {stats.map((s, idx) => {
            const checked = selectedClusters.includes(s.id);
            return (
              <label
                key={s.id}
                htmlFor={`segment-cb-${s.id}`}
                className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                  checked
                    ? "border-indigo-400 dark:border-indigo-500 bg-indigo-50 dark:bg-indigo-950/50"
                    : "border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600"
                }`}
                data-ocid={`filters.segment.checkbox.${idx + 1}`}
              >
                <Checkbox
                  id={`segment-cb-${s.id}`}
                  checked={checked}
                  onCheckedChange={() => toggleCluster(s.id)}
                  className="mt-0.5 border-gray-400 dark:border-gray-600 data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600"
                />
                <div className="min-w-0">
                  <div
                    className="text-sm font-semibold truncate"
                    style={{ color: s.color }}
                  >
                    {s.persona}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {s.count.toLocaleString()} customers
                  </div>
                </div>
              </label>
            );
          })}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Button
          onClick={applyFilters}
          className="bg-indigo-600 hover:bg-indigo-700 text-white"
          data-ocid="filters.apply.primary_button"
        >
          <SlidersHorizontal className="w-4 h-4 mr-2" /> Apply Filters
        </Button>
        <Button
          variant="outline"
          onClick={handleReset}
          className="border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-400"
          data-ocid="filters.reset.secondary_button"
        >
          <RotateCcw className="w-4 h-4 mr-2" /> Reset
        </Button>
      </div>

      {/* Preview Table */}
      <div className="rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
        <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
          <h3 className="text-gray-900 dark:text-white font-medium">Preview</h3>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            first 20 of {matchCount.toLocaleString()} rows
          </span>
        </div>
        <div className="overflow-auto">
          <table className="w-full text-xs">
            <thead className="bg-gray-50 dark:bg-gray-950">
              <tr>
                <th className="px-3 py-2 text-left text-gray-500 dark:text-gray-400">
                  Row
                </th>
                <th className="px-3 py-2 text-left text-gray-500 dark:text-gray-400">
                  Segment
                </th>
                {numericColumnNames.slice(0, 5).map((col) => (
                  <th
                    key={col}
                    className="px-3 py-2 text-left text-gray-500 dark:text-gray-400 whitespace-nowrap"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {previewIndices.map((i) => {
                const s = stats[assignments[i]];
                return (
                  <tr
                    key={i}
                    className="border-t border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/40"
                  >
                    <td className="px-3 py-2 text-gray-400">{i + 1}</td>
                    <td className="px-3 py-2">
                      <span
                        className="text-xs px-1.5 py-0.5 rounded"
                        style={{ background: `${s?.color}22`, color: s?.color }}
                      >
                        {s?.persona}
                      </span>
                    </td>
                    {numericColumnNames.slice(0, 5).map((col, j) => (
                      <td
                        key={col}
                        className="px-3 py-2 text-gray-700 dark:text-gray-300 tabular-nums"
                      >
                        {formatAmount(numericRows[i][j])}
                      </td>
                    ))}
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
