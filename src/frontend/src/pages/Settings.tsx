import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { AlertTriangle, Coins, Layers, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { CURRENCIES, useCurrency } from "../context/CurrencyContext";
import { useData } from "../context/DataContext";
import { SEGMENT_TIERS, SEGMENT_TIER_COLORS } from "../utils/clusterStats";

const SEGMENT_TIER_META: Record<string, { description: string; icon: string }> =
  {
    Premium: {
      description:
        "Very high score, high balance, frequent transactions. Top-value customers requiring premium service.",
      icon: "👑",
    },
    Standard: {
      description:
        "Medium-high score with consistent activity. Engaged customers with growth potential.",
      icon: "⭐",
    },
    Basic: {
      description:
        "Moderate score with low to average activity. Customers needing engagement campaigns.",
      icon: "🔹",
    },
    "At-Risk": {
      description:
        "Low score with declining or irregular activity. High churn probability requiring intervention.",
      icon: "⚠️",
    },
    Dormant: {
      description:
        "Very low score or no recent activity. Inactive customers needing reactivation outreach.",
      icon: "💤",
    },
  };

export default function Settings() {
  const { clearDataset, isReady } = useData();
  const { currency, setCurrencyCode } = useCurrency();

  const handleClearDataset = () => {
    clearDataset();
    toast.success("Dataset cleared successfully", {
      description: "All cached data has been removed.",
    });
  };

  return (
    <div className="p-6 space-y-8 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-gray-400 text-sm mt-1">
          Configure segment tiers, currency, and manage data
        </p>
      </div>

      {/* Segment Tiers */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Layers className="w-4 h-4 text-indigo-400" />
          <h2 className="text-white font-semibold text-base">Segment Tiers</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {SEGMENT_TIERS.map((tier) => {
            const meta = SEGMENT_TIER_META[tier];
            const color = SEGMENT_TIER_COLORS[tier];
            return (
              <div
                key={tier}
                className="rounded-xl bg-gray-900 border border-gray-800 p-4 flex items-start gap-3"
                data-ocid={`settings.${tier.toLowerCase().replace("-", "_")}.card`}
              >
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                  style={{
                    background: `${color}22`,
                    border: `1.5px solid ${color}55`,
                  }}
                >
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ background: color }}
                  />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-white text-sm">
                      {tier}
                    </span>
                    <span
                      className="text-xs px-2 py-0.5 rounded-full font-medium"
                      style={{ background: `${color}22`, color }}
                    >
                      {meta.icon}
                    </span>
                  </div>
                  <p className="text-gray-400 text-xs leading-relaxed">
                    {meta.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <Separator className="bg-gray-800" />

      {/* Currency Selection */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Coins className="w-4 h-4 text-emerald-400" />
          <h2 className="text-white font-semibold text-base">Currency</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {CURRENCIES.map((c) => {
            const isSelected = currency.code === c.code;
            return (
              <button
                type="button"
                key={c.code}
                onClick={() => {
                  setCurrencyCode(c.code);
                  toast.success(`Currency set to ${c.label}`);
                }}
                className={`rounded-xl border p-3 flex flex-col items-start gap-1 text-left transition-all ${
                  isSelected
                    ? "border-emerald-500 bg-emerald-950/50"
                    : "border-gray-800 bg-gray-900 hover:border-gray-600"
                }`}
                data-ocid={`settings.currency.${c.code.toLowerCase()}`}
              >
                <div className="flex items-center gap-2 w-full">
                  <span
                    className="text-lg font-bold"
                    style={{ color: isSelected ? "#34d399" : "#9ca3af" }}
                  >
                    {c.symbol}
                  </span>
                  <span
                    className={`text-sm font-semibold ${
                      isSelected ? "text-emerald-300" : "text-white"
                    }`}
                  >
                    {c.code}
                  </span>
                  {isSelected && (
                    <span className="ml-auto w-2 h-2 rounded-full bg-emerald-400" />
                  )}
                </div>
                <span className="text-xs text-gray-400 truncate w-full">
                  {c.label}
                </span>
                <span className="text-xs text-gray-600">{c.notation}</span>
              </button>
            );
          })}
        </div>
      </section>

      <Separator className="bg-gray-800" />

      {/* Dataset Management */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="w-4 h-4 text-amber-400" />
          <h2 className="text-white font-semibold text-base">
            Dataset Management
          </h2>
        </div>
        <div className="rounded-xl bg-gray-900 border border-gray-800 p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-white font-medium text-sm mb-1">
                Clear Cached Dataset
              </h3>
              <p className="text-gray-400 text-xs leading-relaxed max-w-md">
                Removes the currently cached dataset from local storage. You
                will need to re-upload your CSV to use any analytics features.
              </p>
              {!isReady && (
                <p className="text-gray-600 text-xs mt-2">
                  No dataset currently loaded.
                </p>
              )}
            </div>
            <Button
              variant="outline"
              className="border-rose-800 text-rose-400 hover:bg-rose-950 hover:text-rose-300 shrink-0"
              onClick={handleClearDataset}
              disabled={!isReady}
              data-ocid="settings.delete_button"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clear Dataset
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
