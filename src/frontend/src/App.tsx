import { Toaster } from "@/components/ui/sonner";
import {
  Activity,
  BarChart2,
  BookOpen,
  Code2,
  Database,
  FileText,
  Filter,
  LayoutDashboard,
  LogOut,
  Moon,
  PinIcon,
  Settings as SettingsIcon,
  Sun,
  TrendingUp,
  UploadCloud,
  Users,
} from "lucide-react";
import { useState } from "react";
import { AuthContextProvider, useAuth } from "./context/AuthContext";
import { CurrencyProvider } from "./context/CurrencyContext";
import { DataContextProvider, useData } from "./context/DataContext";
import { ThemeProvider, useTheme } from "./context/ThemeContext";
import APIReference from "./pages/APIReference";
import Analysis from "./pages/Analysis";
import CustomerPersonas from "./pages/CustomerPersonas";
import Dashboard from "./pages/Dashboard";
import DatasetUpload from "./pages/DatasetUpload";
import Filters from "./pages/Filters";
import LoginPage from "./pages/LoginPage";
import Prediction from "./pages/Prediction";
import ProjectReport from "./pages/ProjectReport";
import RFMAnalysis from "./pages/RFMAnalysis";
import Reports from "./pages/Reports";
import SegmentPins from "./pages/SegmentPins";
import Settings from "./pages/Settings";

export type Page =
  | "upload"
  | "dashboard"
  | "segments"
  | "analysis"
  | "rfm"
  | "prediction"
  | "reports"
  | "api"
  | "filters"
  | "settings"
  | "report"
  | "personas";

const NAV_ITEMS: {
  page: Page;
  label: string;
  icon: React.ElementType;
  requiresData?: boolean;
}[] = [
  { page: "upload", label: "Upload Dataset", icon: UploadCloud },
  {
    page: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    requiresData: true,
  },
  {
    page: "segments",
    label: "Segment Pins",
    icon: PinIcon,
    requiresData: true,
  },
  { page: "analysis", label: "Analysis", icon: BarChart2, requiresData: true },
  { page: "rfm", label: "RFM Analysis", icon: Activity, requiresData: true },
  {
    page: "prediction",
    label: "Prediction",
    icon: TrendingUp,
    requiresData: true,
  },
  { page: "reports", label: "Reports", icon: FileText, requiresData: true },
  { page: "api", label: "API Reference", icon: Code2 },
  { page: "filters", label: "Filters", icon: Filter, requiresData: true },
  { page: "settings", label: "Settings", icon: SettingsIcon },
  { page: "report", label: "Project Report", icon: BookOpen },
  {
    page: "personas",
    label: "Customer Personas",
    icon: Users,
    requiresData: true,
  },
];

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  return (
    <button
      type="button"
      onClick={toggleTheme}
      title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-800 dark:hover:bg-gray-800 transition-colors"
      data-ocid="nav.theme.toggle"
    >
      {theme === "dark" ? (
        <Sun className="w-4 h-4" />
      ) : (
        <Moon className="w-4 h-4" />
      )}
    </button>
  );
}

function UserSection() {
  const { user, logout } = useAuth();
  if (!user) return null;

  const initials = user.name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="p-4 border-t border-gray-800 dark:border-gray-800 space-y-3">
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center shrink-0">
          <span className="text-white text-xs font-bold">{initials}</span>
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-xs text-gray-900 dark:text-white font-medium truncate">
            {user.name}
          </div>
          <div className="text-xs text-gray-500 truncate" title={user.email}>
            {user.email}
          </div>
        </div>
      </div>
      <button
        type="button"
        onClick={logout}
        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-rose-500 dark:text-rose-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-rose-600 dark:hover:text-rose-300 transition-colors"
        data-ocid="auth.logout_button"
      >
        <LogOut className="w-4 h-4 shrink-0" />
        <span>Logout</span>
      </button>
    </div>
  );
}

function Sidebar({
  current,
  navigate,
}: { current: Page; navigate: (p: Page) => void }) {
  const { isReady, filename, rows } = useData();
  return (
    <aside className="w-60 min-h-screen bg-white dark:bg-gray-950 border-r border-gray-200 dark:border-gray-800 flex flex-col shrink-0 transition-colors">
      {/* Header */}
      <div className="p-5 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shrink-0">
            <Database className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-bold text-gray-900 dark:text-white text-sm leading-tight">
              Banking Customer Segmentation
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
              for Targeted Marketing
            </div>
          </div>
          <ThemeToggle />
        </div>
      </div>

      {isReady && (
        <div className="mx-3 mt-3 p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950 border border-indigo-200 dark:border-indigo-800">
          <div className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">
            Active Dataset
          </div>
          <div className="text-xs text-gray-800 dark:text-white truncate mt-0.5">
            {filename}
          </div>
          <div className="text-xs text-gray-500">
            {rows.length.toLocaleString()} rows
          </div>
        </div>
      )}

      <nav className="flex-1 px-2 py-4 space-y-0.5">
        {NAV_ITEMS.map(({ page, label, icon: Icon, requiresData }) => {
          const disabled = requiresData && !isReady;
          const active = current === page;
          return (
            <button
              type="button"
              key={page}
              disabled={disabled}
              onClick={() => !disabled && navigate(page)}
              data-ocid={`nav.${page}.link`}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors text-left ${
                active
                  ? "bg-indigo-600 text-white font-medium"
                  : disabled
                    ? "text-gray-400 dark:text-gray-600 cursor-not-allowed"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="flex-1">{label}</span>
              {disabled && (
                <span className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 px-1 rounded">
                  upload
                </span>
              )}
            </button>
          );
        })}
      </nav>
      <UserSection />
    </aside>
  );
}

function Layout() {
  const [page, setPage] = useState<Page>("upload");

  const navigate = (p: Page) => setPage(p);
  const handleDataReady = () => setPage("dashboard");

  const pageEl = (() => {
    switch (page) {
      case "upload":
        return <DatasetUpload onReady={handleDataReady} />;
      case "dashboard":
        return <Dashboard navigate={navigate} />;
      case "segments":
        return <SegmentPins navigate={navigate} />;
      case "analysis":
        return <Analysis navigate={navigate} />;
      case "rfm":
        return <RFMAnalysis navigate={navigate} />;
      case "prediction":
        return <Prediction navigate={navigate} />;
      case "reports":
        return <Reports navigate={navigate} />;
      case "api":
        return <APIReference />;
      case "filters":
        return <Filters navigate={navigate} />;
      case "settings":
        return <Settings />;
      case "report":
        return <ProjectReport />;
      case "personas":
        return <CustomerPersonas navigate={navigate} />;
    }
  })();

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors">
      <Sidebar current={page} navigate={navigate} />
      <main className="flex-1 overflow-auto">{pageEl}</main>
    </div>
  );
}

function AppContent() {
  const { isLoggedIn } = useAuth();

  if (!isLoggedIn) {
    return <LoginPage onAuth={() => {}} />;
  }

  return (
    <DataContextProvider>
      <Layout />
    </DataContextProvider>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthContextProvider>
        <CurrencyProvider>
          <AppContent />
          <Toaster />
        </CurrencyProvider>
      </AuthContextProvider>
    </ThemeProvider>
  );
}
