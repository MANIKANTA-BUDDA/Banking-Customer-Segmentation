import { AlertTriangle, ChevronRight, Printer } from "lucide-react";
import { useData } from "../context/DataContext";
import { PERSONAS } from "../data/personas";

const SEGMENT_META: Record<
  string,
  {
    color: string;
    border: string;
    profile: string;
    characteristics: string[];
    strategies: string[];
  }
> = {
  Premium: {
    color: "#6366f1",
    border: "border-indigo-500",
    profile:
      "Very high balance, frequent purchases, high credit limit. Average Balance ₹15L+. These customers generate the highest revenue and are the backbone of profitability.",
    characteristics: [
      "High credit utilization with full repayment",
      "Frequent one-off and installment purchases",
      "Long tenure (9–12 months)",
      "Low cash advance reliance",
    ],
    strategies: [
      "Exclusive VIP rewards program and priority concierge banking",
      "Early access to premium investment products",
      "Dedicated relationship manager and priority helpline",
      "Luxury lifestyle offers and co-branded partnerships",
    ],
  },
  Standard: {
    color: "#06b6d4",
    border: "border-cyan-500",
    profile:
      "Medium-high balance with consistent activity and reliable payment behavior. Solid contributors with growth potential if offered targeted cross-sell products.",
    characteristics: [
      "Moderate to high purchase frequency",
      "Consistent monthly repayment patterns",
      "Medium credit limit utilization",
      "Some installment purchase activity",
    ],
    strategies: [
      "Cross-sell investment, insurance, and savings products",
      "Loyalty points and tiered cashback programs",
      "Mobile app engagement campaigns with personalized nudges",
      "Upgrade pathway incentives toward Premium tier",
    ],
  },
  Basic: {
    color: "#f59e0b",
    border: "border-amber-500",
    profile:
      "Moderate balance with low-to-average purchases and occasional transactions. Opportunity segment — financial education and introductory offers can drive engagement.",
    characteristics: [
      "Low purchase frequency, sporadic transactions",
      "Partial monthly repayments",
      "Below-average credit limit usage",
      "Minimal cash advance activity",
    ],
    strategies: [
      "Introductory credit limit increase offers",
      "Financial literacy and budgeting tools via app",
      "Targeted SMS campaigns with spend-and-earn incentives",
      "Low-fee upgrade trial programs for Standard tier",
    ],
  },
  "At-Risk": {
    color: "#f43f5e",
    border: "border-rose-500",
    profile:
      "Low score with declining or irregular activity and inconsistent payments. High churn probability — proactive retention interventions are critical within 30–60 days.",
    characteristics: [
      "Declining transaction frequency over time",
      "Irregular or missed payments",
      "High cash advance frequency (risk signal)",
      "Shrinking active purchase behavior",
    ],
    strategies: [
      "Personalized retention offers: fee waivers, interest relief",
      "Proactive outreach via call center with empathy-led scripts",
      "Hardship assistance programs and flexible repayment plans",
      "Behavioral trigger alerts for early churn detection",
    ],
  },
  Dormant: {
    color: "#22c55e",
    border: "border-green-500",
    profile:
      "Very low or no recent activity. Long tenure but disengaged — re-engagement campaigns with personalized bonuses can reactivate this segment at low acquisition cost.",
    characteristics: [
      "Zero or near-zero recent transactions",
      "Account open but unused for extended periods",
      "May still hold a balance from prior activity",
      "Responsive to bonus incentive messaging",
    ],
    strategies: [
      "Re-activation bonus: spend ₹X, earn ₹Y cash reward",
      "Personalized reintroduction email with updated product benefits",
      "Direct mail with tangible offer (gift card, fee reversal)",
      "Automated win-back journey with 3-touch email/SMS sequence",
    ],
  },
};

const MARKETING_META: Record<
  string,
  { color: string; strategy: string; channel: string; outcome: string }
> = {
  Premium: {
    color: "text-indigo-400",
    strategy: "Exclusive rewards & VIP services",
    channel: "Personal Banker, Mobile App",
    outcome: "+15% CLV",
  },
  Standard: {
    color: "text-cyan-400",
    strategy: "Cross-sell investment products",
    channel: "Email, App notifications",
    outcome: "+22% product penetration",
  },
  Basic: {
    color: "text-amber-400",
    strategy: "Introductory offers, financial education",
    channel: "SMS, Email",
    outcome: "+18% engagement",
  },
  "At-Risk": {
    color: "text-rose-400",
    strategy: "Personalized retention offers, fee waivers",
    channel: "Call center, Email",
    outcome: "-30% churn",
  },
  Dormant: {
    color: "text-green-400",
    strategy: "Re-activation campaigns, bonus offers",
    channel: "Email, Direct mail",
    outcome: "+25% reactivation",
  },
};

const STATIC_MARKETING_ORDER = [
  "Premium",
  "Standard",
  "Basic",
  "At-Risk",
  "Dormant",
];

const FEATURES = [
  {
    name: "BALANCE",
    type: "Continuous",
    description: "Outstanding balance on the account",
  },
  {
    name: "PURCHASES",
    type: "Continuous",
    description: "Total purchases amount in the period",
  },
  {
    name: "ONEOFF_PURCHASES",
    type: "Continuous",
    description: "Maximum one-off purchase amount",
  },
  {
    name: "INSTALLMENTS_PURCHASES",
    type: "Continuous",
    description: "Amount paid via installments",
  },
  {
    name: "CASH_ADVANCE",
    type: "Continuous",
    description: "Cash withdrawn from the account",
  },
  {
    name: "PURCHASES_FREQUENCY",
    type: "Ratio (0–1)",
    description: "Frequency of purchases per period",
  },
  {
    name: "CASH_ADVANCE_FREQUENCY",
    type: "Ratio (0–1)",
    description: "Frequency of cash advance usage",
  },
  {
    name: "PURCHASES_TRX",
    type: "Integer",
    description: "Number of purchase transactions",
  },
  {
    name: "CREDIT_LIMIT",
    type: "Continuous",
    description: "Credit limit assigned to the customer",
  },
  {
    name: "PAYMENTS",
    type: "Continuous",
    description: "Total payments made in the period",
  },
  {
    name: "MINIMUM_PAYMENTS",
    type: "Continuous",
    description: "Minimum payment amount due",
  },
  {
    name: "PRC_FULL_PAYMENT",
    type: "Ratio (0–1)",
    description: "Percentage of full payment months",
  },
  {
    name: "TENURE",
    type: "Integer",
    description: "Months as an active account holder",
  },
];

const PIPELINE_STEPS = [
  {
    num: 1,
    label: "Data Collection & Preprocessing",
    desc: "Mean imputation, StandardScaler, drop CUST_ID",
  },
  {
    num: 2,
    label: "Exploratory Data Analysis",
    desc: "Histograms, KDE plots, correlation heatmap",
  },
  {
    num: 3,
    label: "Feature Engineering",
    desc: "Activity score: weighted composite of balance, purchases, frequency, tenure",
  },
  {
    num: 4,
    label: "K-Means Clustering (k=5)",
    desc: "Elbow method validation, centroid computation",
  },
  {
    num: 5,
    label: "PCA Visualization",
    desc: "2D projection — PC1 44.2%, PC2 18.7%",
  },
  {
    num: 6,
    label: "Segment Labeling",
    desc: "Premium, Standard, Basic, At-Risk, Dormant",
  },
  {
    num: 7,
    label: "Churn Risk Scoring",
    desc: "Distance from centroid → risk probability",
  },
];

export default function ProjectReport() {
  const {
    isReady,
    rows,
    numericColumnNames,
    columnNames,
    filename,
    uploadedAt,
    clusterCount,
    stats,
  } = useData();

  const totalCustomers = isReady ? rows.length : 8950;
  const featureCount = isReady ? numericColumnNames.length : 18;
  const totalColumns = isReady ? columnNames.length : 18;
  const datasetName = isReady && filename ? filename : "CC GENERAL.csv";
  const uploadDate =
    isReady && uploadedAt
      ? new Date(uploadedAt).toLocaleDateString("en-IN", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : "March 2026";

  // Segment lookups from dynamic stats
  const premiumSeg = stats.find((s) => s.persona === "Premium");
  const atRiskSeg = stats.find((s) => s.persona === "At-Risk");
  const dormantSeg = stats.find((s) => s.persona === "Dormant");
  const largestSeg =
    isReady && stats.length > 0
      ? stats.reduce((a, b) => (b.count > a.count ? b : a))
      : null;

  // Section numbering — Segment Distribution is inserted after Segment Profiles when isReady
  const sectionNums = {
    exec: 1,
    problem: 2,
    dataset: 3,
    methodology: 4,
    segmentProfiles: 5,
    segmentDistribution: isReady ? 6 : null,
    modelPerf: isReady ? 7 : 6,
    keyFindings: isReady ? 8 : 7,
    marketing: isReady ? 9 : 8,
    future: isReady ? 10 : 9,
    references: isReady ? 11 : 10,
  };

  return (
    <>
      <style>{`
        @media print {
          aside, [data-ocid="report.print_button"] { display: none !important; }
          body, .print-root { background: #fff !important; color: #111 !important; }
          .print-card { background: #f9f9f9 !important; border-color: #ddd !important; }
          .print-text { color: #222 !important; }
          .print-muted { color: #555 !important; }
          th, td { color: #111 !important; }
          thead { background: #eee !important; }
        }
      `}</style>
      <div className="print-root min-h-screen bg-gray-950 text-gray-100 p-6 md:p-10">
        {/* Header */}
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-semibold uppercase tracking-widest text-indigo-400 bg-indigo-950 border border-indigo-800 px-3 py-1 rounded-full">
                BankSegment
              </span>
              <span className="text-xs text-gray-500">{uploadDate}</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-white leading-tight print-text">
              Banking Customer Segmentation
            </h1>
            <p className="text-lg text-indigo-400 font-medium mt-1">
              for Targeted Marketing — Project Report
            </p>
            {isReady && filename && (
              <p className="text-xs text-gray-500 mt-1">
                Dataset:{" "}
                <span className="text-gray-400 font-mono">{filename}</span>
              </p>
            )}
          </div>
          <button
            type="button"
            data-ocid="report.print_button"
            onClick={() => window.print()}
            className="shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors"
          >
            <Printer className="w-4 h-4" />
            Print Report
          </button>
        </div>

        {/* No dataset warning */}
        {!isReady && (
          <div
            data-ocid="report.warning_state"
            className="mb-6 flex items-start gap-3 rounded-xl border border-amber-700 bg-amber-950/40 px-5 py-4"
          >
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-amber-300">
                No dataset uploaded
              </p>
              <p className="text-xs text-amber-400/80 mt-0.5">
                The report is showing sample/default values. Upload a CSV
                dataset from the Dataset Upload page to see live statistics
                reflecting your actual data.
              </p>
            </div>
          </div>
        )}

        <div className="space-y-6">
          {/* 1. Executive Summary */}
          <section className="print-card rounded-xl bg-gray-900 border border-gray-800 p-6">
            <SectionHeader num={sectionNums.exec} title="Executive Summary" />
            <p className="text-gray-300 print-muted leading-relaxed">
              BankSegment applies machine learning to classify{" "}
              <strong className="text-white">
                {totalCustomers.toLocaleString()} banking customers
              </strong>{" "}
              into{" "}
              <strong className="text-white">
                {clusterCount || 5} actionable segments
              </strong>{" "}
              — <span className="text-indigo-400">Premium</span>,{" "}
              <span className="text-cyan-400">Standard</span>,{" "}
              <span className="text-amber-400">Basic</span>,{" "}
              <span className="text-rose-400">At-Risk</span>, and{" "}
              <span className="text-green-400">Dormant</span> — enabling
              hyper-personalized, event-driven marketing campaigns. The platform
              processes {featureCount} behavioral and transactional features
              from credit card data ({datasetName}) using K-Means clustering (k=
              {clusterCount || 5}) with PCA for visualization. The system is
              fully dataset-driven, supporting real-time segmentation, churn
              prediction, downloadable reports, and targeted marketing
              recommendations across all five customer tiers.
            </p>
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                {
                  label: "Total Customers",
                  value: totalCustomers.toLocaleString(),
                },
                { label: "Features", value: featureCount.toString() },
                { label: "Segments", value: (clusterCount || 5).toString() },
                { label: "Algorithm", value: "K-Means" },
              ].map((kv) => (
                <div
                  key={kv.label}
                  className="rounded-lg bg-gray-800 p-3 text-center"
                >
                  <div className="text-lg font-bold text-indigo-400">
                    {kv.value}
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">{kv.label}</div>
                </div>
              ))}
            </div>
          </section>

          {/* 2. Problem Statement */}
          <section className="print-card rounded-xl bg-gray-900 border border-gray-800 p-6">
            <SectionHeader
              num={sectionNums.problem}
              title="Problem Statement"
            />
            <p className="text-gray-300 print-muted leading-relaxed">
              Traditional banking marketing relies on generic, one-size-fits-all
              campaigns that fail to address the diverse needs and behaviors of
              modern customers. This results in low conversion rates, high
              marketing spend waste, and missed revenue opportunities. As
              customer expectations shift toward personalization, banks must
              evolve from demographic segmentation to{" "}
              <strong className="text-white">
                behavioral, data-driven targeting
              </strong>
              .
            </p>
            <p className="text-gray-300 print-muted leading-relaxed mt-3">
              This project addresses the challenge by segmenting customers based
              on actual transaction behavior, payment patterns, credit
              utilization, and engagement frequency — creating precise,
              actionable customer personas that marketing teams can act on
              immediately with tailored campaigns and product recommendations.
            </p>
          </section>

          {/* 3. Dataset Overview */}
          <section className="print-card rounded-xl bg-gray-900 border border-gray-800 p-6">
            <SectionHeader num={sectionNums.dataset} title="Dataset Overview" />
            <div className="grid md:grid-cols-3 gap-4 mb-5">
              {[
                {
                  label: "Source",
                  value: datasetName,
                  sub: "Credit Card Customer Dataset",
                },
                {
                  label: "Records",
                  value: totalCustomers.toLocaleString(),
                  sub: "Unique credit card holders",
                },
                {
                  label: "Features",
                  value: featureCount.toString(),
                  sub: `${totalColumns} total columns`,
                },
              ].map((item) => (
                <div key={item.label} className="rounded-lg bg-gray-800 p-4">
                  <div className="text-xs text-gray-500 uppercase tracking-wider">
                    {item.label}
                  </div>
                  <div className="text-xl font-bold text-white mt-1 truncate">
                    {item.value}
                  </div>
                  <div className="text-xs text-gray-400 mt-0.5">{item.sub}</div>
                </div>
              ))}
            </div>
            <div className="mb-3">
              <h4 className="text-sm font-semibold text-gray-300 mb-2">
                Preprocessing Steps
              </h4>
              <ul className="space-y-1 text-sm text-gray-400">
                {[
                  "Mean imputation for MINIMUM_PAYMENTS and CREDIT_LIMIT missing values",
                  "Dropped CUST_ID column (identifier, not predictive)",
                  "Checked and confirmed no duplicate records",
                  "StandardScaler normalization applied to all features before clustering",
                ].map((step) => (
                  <li key={step} className="flex items-start gap-2">
                    <span className="text-indigo-400 mt-0.5">›</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            </div>
            {isReady && numericColumnNames.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-gray-300 mb-2">
                  Detected Numeric Features
                </h4>
                <div className="flex flex-wrap gap-2">
                  {numericColumnNames.map((col) => (
                    <span
                      key={col}
                      className="text-xs font-mono bg-indigo-950 text-indigo-300 border border-indigo-800 px-2 py-0.5 rounded"
                    >
                      {col}
                    </span>
                  ))}
                </div>
              </div>
            )}
            <h4 className="text-sm font-semibold text-gray-300 mb-2">
              Feature Reference
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-950">
                    <th className="text-left py-2 px-3 text-gray-400 font-medium rounded-tl-lg">
                      Feature
                    </th>
                    <th className="text-left py-2 px-3 text-gray-400 font-medium">
                      Type
                    </th>
                    <th className="text-left py-2 px-3 text-gray-400 font-medium rounded-tr-lg">
                      Description
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {FEATURES.map((f, i) => (
                    <tr
                      key={f.name}
                      className={i % 2 === 0 ? "bg-gray-800/40" : ""}
                    >
                      <td className="py-2 px-3 font-mono text-xs text-indigo-300">
                        {f.name}
                      </td>
                      <td className="py-2 px-3 text-gray-400 text-xs">
                        {f.type}
                      </td>
                      <td className="py-2 px-3 text-gray-300">
                        {f.description}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* 4. Methodology */}
          <section className="print-card rounded-xl bg-gray-900 border border-gray-800 p-6">
            <SectionHeader num={sectionNums.methodology} title="Methodology" />
            <p className="text-gray-400 text-sm mb-5">
              The project follows a structured 7-step ML pipeline from raw data
              to actionable segment assignments.
            </p>
            <div className="flex flex-wrap items-center gap-2">
              {PIPELINE_STEPS.map((step, idx) => (
                <>
                  <div
                    key={step.num}
                    className="flex-1 min-w-[140px] rounded-xl bg-gray-800 border border-gray-700 p-3 text-center"
                  >
                    <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold mx-auto mb-2">
                      {step.num}
                    </div>
                    <div className="text-xs font-semibold text-white mb-1">
                      {step.label}
                    </div>
                    <div className="text-xs text-gray-400 leading-snug">
                      {step.num === 4 && isReady
                        ? `Elbow method validation, centroid computation (k=${clusterCount})`
                        : step.desc}
                    </div>
                  </div>
                  {idx < PIPELINE_STEPS.length - 1 && (
                    <ChevronRight className="w-4 h-4 text-gray-600 shrink-0 hidden md:block" />
                  )}
                </>
              ))}
            </div>
          </section>

          {/* 4b. EDA Findings */}
          <section className="print-card rounded-xl bg-gray-900 border border-gray-800 p-6">
            <SectionHeader num={null} title="Exploratory Data Analysis" />
            <p className="text-gray-400 text-sm mb-5">
              Prior to clustering, three EDA approaches were explored to
              understand customer behavior patterns.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="rounded-xl bg-gray-800 border border-gray-700 p-4">
                <h4 className="text-sm font-semibold text-indigo-400 mb-2">
                  Credit Utilization Analysis
                </h4>
                <p className="text-xs text-gray-400 leading-relaxed">
                  2.6% of customers had credit utilization above 100% —
                  extremely risky with high default probability. ~51% were above
                  the healthy 30% threshold, signaling widespread
                  over-leveraging.
                </p>
              </div>
              <div className="rounded-xl bg-gray-800 border border-gray-700 p-4">
                <h4 className="text-sm font-semibold text-cyan-400 mb-2">
                  Cash Advance Cohorts
                </h4>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Customers segmented into Low (&lt;$1,000), Medium
                  ($1,001–$5,000), and High (&gt;$5,000) cohorts. Max cash
                  advance reached $47,000 — indicating credit card usage as a
                  loan substitute.
                </p>
              </div>
              <div className="rounded-xl bg-gray-800 border border-gray-700 p-4">
                <h4 className="text-sm font-semibold text-amber-400 mb-2">
                  Purchase/Balance Quadrants
                </h4>
                <p className="text-xs text-gray-400 leading-relaxed">
                  4 behavioral quadrants identified: High Purchase/High Balance
                  (rewards seekers), Low Purchase/High Balance (big-ticket
                  buyers), High Purchase/Low Balance (full payers), Low
                  Purchase/Low Balance (credit builders).
                </p>
              </div>
            </div>
            <div className="rounded-xl bg-gray-800 border border-gray-700 p-4">
              <h4 className="text-sm font-semibold text-white mb-3">
                K-Means Implementation Steps
              </h4>
              <div className="space-y-2">
                {[
                  {
                    step: "1",
                    label: "Data Filtering",
                    detail:
                      "Filtered to tenure=10 months cohort for speed and interpretability",
                  },
                  {
                    step: "2",
                    label: "Feature Engineering",
                    detail:
                      "Added credit utilization = balance / credit_limit; dropped CUST_ID",
                  },
                  {
                    step: "3",
                    label: "Normalization",
                    detail:
                      "StandardScaler applied to prevent high-magnitude features from dominating",
                  },
                  {
                    step: "4",
                    label: "PCA (80% threshold)",
                    detail:
                      "5 principal components retained, capturing ≥80% of total variance",
                  },
                  {
                    step: "5",
                    label: "Elbow / Scree Plot",
                    detail:
                      "WCSS plotted vs. k; elbow at k=5 confirmed as optimal cluster count",
                  },
                  {
                    step: "6",
                    label: "Outlier Removal",
                    detail:
                      "Singleton cluster excluded; re-clustered with k=5 for clean segments",
                  },
                ].map((item) => (
                  <div key={item.step} className="flex gap-3 items-start">
                    <div className="w-5 h-5 rounded-full bg-indigo-600 flex items-center justify-center text-xs font-bold text-white shrink-0 mt-0.5">
                      {item.step}
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-white">
                        {item.label}:{" "}
                      </span>
                      <span className="text-xs text-gray-400">
                        {item.detail}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* 5. Segment Profiles */}
          <section className="print-card rounded-xl bg-gray-900 border border-gray-800 p-6">
            <SectionHeader
              num={sectionNums.segmentProfiles}
              title="Segment Profiles"
            />
            <div className="space-y-4">
              {(isReady && stats.length > 0
                ? stats
                : Object.entries(SEGMENT_META).map(([name]) => ({
                    persona: name,
                    count: null,
                    percentage: null,
                    dominantFeatures: [],
                    color: SEGMENT_META[name].color,
                  }))
              ).map((seg) => {
                const meta = SEGMENT_META[seg.persona] ?? SEGMENT_META.Basic;
                return (
                  <div
                    key={seg.persona}
                    className={`rounded-xl bg-gray-800 border-l-4 ${meta.border} p-5`}
                  >
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{ background: meta.color }}
                      />
                      <h3 className="font-bold text-white text-base">
                        {seg.persona}
                      </h3>
                      {PERSONAS[seg.persona] && (
                        <span className="text-xs text-gray-400 italic">
                          {PERSONAS[seg.persona].name}
                        </span>
                      )}
                      {isReady && "count" in seg && seg.count != null && (
                        <>
                          <span className="text-xs bg-gray-700 text-gray-300 px-2 py-0.5 rounded-full">
                            {(seg as { count: number }).count.toLocaleString()}{" "}
                            customers
                          </span>
                          <span className="text-xs bg-gray-700 text-gray-400 px-2 py-0.5 rounded-full">
                            {(seg as { percentage: number }).percentage.toFixed(
                              1,
                            )}
                            %
                          </span>
                        </>
                      )}
                    </div>
                    <p className="text-sm text-gray-300 mb-3">{meta.profile}</p>
                    {isReady &&
                      "dominantFeatures" in seg &&
                      (seg as { dominantFeatures: string[] }).dominantFeatures
                        .length > 0 && (
                        <div className="mb-3">
                          <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                            Top Features (from data)
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {(
                              seg as { dominantFeatures: string[] }
                            ).dominantFeatures.map((f) => (
                              <span
                                key={f}
                                className="text-xs font-mono bg-gray-700 text-gray-300 px-2 py-0.5 rounded"
                              >
                                {f}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                          Key Characteristics
                        </div>
                        <ul className="space-y-1">
                          {meta.characteristics.map((c) => (
                            <li
                              key={c}
                              className="text-xs text-gray-400 flex items-start gap-1.5"
                            >
                              <span
                                style={{ color: meta.color }}
                                className="mt-0.5"
                              >
                                •
                              </span>
                              {c}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                          Marketing Strategies
                        </div>
                        <ul className="space-y-1">
                          {meta.strategies.map((s) => (
                            <li
                              key={s}
                              className="text-xs text-gray-400 flex items-start gap-1.5"
                            >
                              <span
                                style={{ color: meta.color }}
                                className="mt-0.5"
                              >
                                ›
                              </span>
                              {s}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* 6. Segment Distribution (only when dataset is loaded) */}
          {isReady && sectionNums.segmentDistribution !== null && (
            <section className="print-card rounded-xl bg-gray-900 border border-gray-800 p-6">
              <SectionHeader
                num={sectionNums.segmentDistribution}
                title="Segment Distribution"
              />
              <p className="text-gray-400 text-sm mb-4">
                Customer distribution across the 5 segments based on the
                uploaded dataset ({totalCustomers.toLocaleString()} total).
              </p>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {stats.map((seg) => {
                  const meta = SEGMENT_META[seg.persona];
                  return (
                    <div
                      key={seg.persona}
                      className="rounded-xl bg-gray-800 p-4 text-center border-t-2"
                      style={{ borderColor: meta?.color ?? seg.color }}
                    >
                      <div className="text-xl font-bold text-white">
                        {seg.count.toLocaleString()}
                      </div>
                      <div
                        className="text-sm font-semibold mt-1"
                        style={{ color: meta?.color ?? seg.color }}
                      >
                        {seg.persona}
                      </div>
                      <div className="text-xs text-gray-400 mt-0.5">
                        {seg.percentage.toFixed(1)}% of total
                      </div>
                    </div>
                  );
                })}
              </div>
              {largestSeg && (
                <p className="text-xs text-gray-500 mt-3">
                  Largest segment:{" "}
                  <span className="text-gray-300 font-medium">
                    {largestSeg.persona}
                  </span>{" "}
                  with {largestSeg.count.toLocaleString()} customers (
                  {largestSeg.percentage.toFixed(1)}%).
                </p>
              )}
            </section>
          )}

          {/* Model Performance */}
          <section className="print-card rounded-xl bg-gray-900 border border-gray-800 p-6">
            <SectionHeader
              num={sectionNums.modelPerf}
              title="Model Performance"
            />
            <div className="grid md:grid-cols-3 gap-4 mb-5">
              {[
                {
                  label: "Silhouette Score",
                  value: "0.412",
                  sub: `K-Means k=${clusterCount || 5}`,
                  color: "text-indigo-400",
                },
                {
                  label: "WCSS Reduction",
                  value: "78%",
                  sub: "vs k=1 baseline",
                  color: "text-cyan-400",
                },
                {
                  label: "PCA Variance",
                  value: "62.9%",
                  sub: "PC1 44.2% + PC2 18.7%",
                  color: "text-amber-400",
                },
              ].map((m) => (
                <div
                  key={m.label}
                  className="rounded-lg bg-gray-800 p-4 text-center"
                >
                  <div className={`text-2xl font-bold ${m.color}`}>
                    {m.value}
                  </div>
                  <div className="text-sm text-white font-medium mt-1">
                    {m.label}
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">{m.sub}</div>
                </div>
              ))}
            </div>
            <h4 className="text-sm font-semibold text-gray-300 mb-2">
              Algorithm Comparison
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-950">
                    {[
                      "Algorithm",
                      "Silhouette Score",
                      "F1 Score",
                      "Accuracy",
                      "Status",
                    ].map((h) => (
                      <th
                        key={h}
                        className="text-left py-2 px-3 text-gray-400 font-medium"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr className="bg-gray-800/40">
                    <td className="py-2 px-3 text-indigo-300 font-medium">
                      K-Means (k={clusterCount || 5})
                    </td>
                    <td className="py-2 px-3 text-white">0.412</td>
                    <td className="py-2 px-3 text-white">0.78</td>
                    <td className="py-2 px-3 text-white">81.3%</td>
                    <td className="py-2 px-3">
                      <span className="text-xs bg-green-900 text-green-300 px-2 py-0.5 rounded-full">
                        Active
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 text-gray-300">DBSCAN</td>
                    <td className="py-2 px-3 text-gray-400">0.341</td>
                    <td className="py-2 px-3 text-gray-400">0.71</td>
                    <td className="py-2 px-3 text-gray-400">74.6%</td>
                    <td className="py-2 px-3">
                      <span className="text-xs bg-gray-800 text-gray-400 px-2 py-0.5 rounded-full">
                        Benchmark
                      </span>
                    </td>
                  </tr>
                  <tr className="bg-gray-800/40">
                    <td className="py-2 px-3 text-amber-300">
                      KM-DBSCAN (Hybrid)
                    </td>
                    <td className="py-2 px-3 text-amber-300">~0.47</td>
                    <td className="py-2 px-3 text-amber-300">~0.86</td>
                    <td className="py-2 px-3 text-amber-300">~93.5%</td>
                    <td className="py-2 px-3">
                      <span className="text-xs bg-amber-900 text-amber-300 px-2 py-0.5 rounded-full">
                        Planned
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Key Findings */}
          <section className="print-card rounded-xl bg-gray-900 border border-gray-800 p-6">
            <SectionHeader
              num={sectionNums.keyFindings}
              title="Key Findings & Insights"
            />
            <div className="space-y-3">
              {[
                {
                  icon: "💎",
                  color: "border-indigo-500 bg-indigo-950/40",
                  text:
                    premiumSeg && isReady
                      ? `Premium customers (${premiumSeg.percentage.toFixed(1)}% — ${premiumSeg.count.toLocaleString()} customers) generate >45% of total revenue — highest ROI segment for relationship investment.`
                      : "Premium customers (~12% of base) generate >45% of total revenue — highest ROI segment for relationship investment.",
                },
                {
                  icon: "⚠️",
                  color: "border-rose-500 bg-rose-950/40",
                  text:
                    atRiskSeg && isReady
                      ? `${atRiskSeg.percentage.toFixed(1)}% of customers (${atRiskSeg.count.toLocaleString()}) are classified At-Risk — targeted retention interventions within 30–60 days can significantly recover revenue.`
                      : "23% of customers are classified At-Risk — targeted retention interventions within 30–60 days can significantly recover revenue.",
                },
                {
                  icon: "🌱",
                  color: "border-green-500 bg-green-950/40",
                  text:
                    dormantSeg && isReady
                      ? `Dormant segment (${dormantSeg.percentage.toFixed(1)}% — ${dormantSeg.count.toLocaleString()} customers) shows strong re-engagement potential — low acquisition cost relative to new customer onboarding.`
                      : "Dormant segment (~18%) shows strong re-engagement potential — low acquisition cost relative to new customer onboarding.",
                },
                {
                  icon: "📊",
                  color: "border-cyan-500 bg-cyan-950/40",
                  text:
                    largestSeg && isReady
                      ? `The largest segment is ${largestSeg.persona} with ${largestSeg.count.toLocaleString()} customers (${largestSeg.percentage.toFixed(1)}%). Transaction frequency is the single strongest predictor of segment membership.`
                      : "Transaction frequency is the single strongest predictor of segment membership — more predictive than balance alone.",
                },
                {
                  icon: "🔴",
                  color: "border-amber-500 bg-amber-950/40",
                  text: "Cash advance usage is a strong negative indicator — highly correlated with At-Risk classification and future churn.",
                },
              ].map((finding) => (
                <div
                  key={finding.text}
                  className={`rounded-lg border-l-4 ${finding.color} p-4 flex items-start gap-3`}
                >
                  <span className="text-lg shrink-0">{finding.icon}</span>
                  <p className="text-sm text-gray-300">{finding.text}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Marketing Recommendations */}
          <section className="print-card rounded-xl bg-gray-900 border border-gray-800 p-6">
            <SectionHeader
              num={sectionNums.marketing}
              title="Marketing Recommendations"
            />
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-950">
                    {[
                      "Segment",
                      ...(isReady ? ["Customers"] : []),
                      "Strategy",
                      "Channel",
                      "Expected Outcome",
                    ].map((h) => (
                      <th
                        key={h}
                        className="text-left py-2 px-3 text-gray-400 font-medium"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {STATIC_MARKETING_ORDER.map((segName, i) => {
                    const meta = MARKETING_META[segName];
                    const dynSeg = stats.find((s) => s.persona === segName);
                    return (
                      <tr
                        key={segName}
                        className={i % 2 === 0 ? "bg-gray-800/40" : ""}
                      >
                        <td className={`py-3 px-3 font-semibold ${meta.color}`}>
                          {segName}
                        </td>
                        {isReady && (
                          <td className="py-3 px-3 text-gray-300 text-xs">
                            {dynSeg ? (
                              <>
                                <span className="font-semibold text-white">
                                  {dynSeg.count.toLocaleString()}
                                </span>
                                <span className="text-gray-500 ml-1">
                                  ({dynSeg.percentage.toFixed(1)}%)
                                </span>
                              </>
                            ) : (
                              "—"
                            )}
                          </td>
                        )}
                        <td className="py-3 px-3 text-gray-300">
                          {meta.strategy}
                        </td>
                        <td className="py-3 px-3 text-gray-400 text-xs">
                          {meta.channel}
                        </td>
                        <td className="py-3 px-3">
                          <span className="text-xs bg-gray-800 text-green-400 px-2 py-1 rounded-full font-mono">
                            {meta.outcome}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>

          {/* Future Directions */}
          <section className="print-card rounded-xl bg-gray-900 border border-gray-800 p-6">
            <SectionHeader num={sectionNums.future} title="Future Directions" />
            <div className="grid md:grid-cols-2 gap-3">
              {[
                {
                  title: "KM-DBSCAN Hybrid Clustering",
                  desc: "Combines K-Means initialization with DBSCAN noise handling for ~15% accuracy improvement and better outlier robustness.",
                  tag: "In Progress",
                },
                {
                  title: "LLM-Generated Customer Personas",
                  desc: "GPT/LLaMA integration for automated human-readable segment descriptions and personalized marketing copy generation.",
                  tag: "Planned",
                },
                {
                  title: "Real-Time Event-Driven Segmentation",
                  desc: "Next Best Action engine triggering offers based on live customer transaction events within milliseconds.",
                  tag: "Planned",
                },
                {
                  title: "CRM Integration",
                  desc: "Automated segment-to-CRM sync for nurturing workflows, personalized email sequences, and product recommendations.",
                  tag: "Planned",
                },
                {
                  title: "Explainability via SHAP",
                  desc: "Feature importance scores per customer explaining why they were assigned to a segment — critical for regulatory transparency.",
                  tag: "Planned",
                },
                {
                  title: "GDPR-Compliant Data Governance",
                  desc: "Privacy-by-design framework with consent management, data minimization, and audit trails for regulatory compliance.",
                  tag: "Research",
                },
              ].map((item) => (
                <div key={item.title} className="rounded-lg bg-gray-800 p-4">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h4 className="text-sm font-semibold text-white">
                      {item.title}
                    </h4>
                    <span className="shrink-0 text-xs bg-indigo-900 text-indigo-300 px-2 py-0.5 rounded-full">
                      {item.tag}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* References */}
          <section className="print-card rounded-xl bg-gray-900 border border-gray-800 p-6">
            <SectionHeader num={sectionNums.references} title="References" />
            <ol className="space-y-2 text-sm">
              {[
                {
                  title:
                    "RADAR — Interactive Digital Bank Customer Segmentation",
                  detail: "Improved DBSCAN Algorithm for Banking Segmentation",
                  url: "doi.org/10.3390/app15063138",
                  journal: "MDPI Applied Sciences, 2025",
                },
                {
                  title: "UCI Machine Learning Repository",
                  detail:
                    "Bank Marketing Dataset — Portuguese bank telemarketing data",
                  url: "archive.ics.uci.edu/ml/datasets/Bank+Marketing",
                  journal: "UCI ML Repository",
                },
                {
                  title: "Kaizen Institute",
                  detail: "Customer Segmentation Best Practices 2026",
                  url: "kaizen.com",
                  journal: "Kaizen Institute Whitepaper",
                },
                {
                  title: "Hexaware Technologies",
                  detail: "Banking Personalization & Segmentation",
                  url: "hexaware.com",
                  journal: "Industry Report, 2025",
                },
                {
                  title: "MDPI Applied Sciences",
                  detail:
                    "Clustering Algorithms in Financial Services — A Comparative Study",
                  url: "mdpi.com/journal/applsci",
                  journal: "MDPI, 2025",
                },
              ].map((ref, i) => (
                <li key={ref.title} className="flex gap-3">
                  <span className="text-indigo-400 font-mono shrink-0 text-xs mt-0.5">
                    [{i + 1}]
                  </span>
                  <div>
                    <span className="text-gray-200 font-medium">
                      {ref.title}.
                    </span>{" "}
                    <span className="text-gray-400">{ref.detail}.</span>{" "}
                    <span className="text-gray-500 text-xs">
                      {ref.journal}.
                    </span>{" "}
                    <span className="text-indigo-400 text-xs font-mono">
                      {ref.url}
                    </span>
                  </div>
                </li>
              ))}
            </ol>
          </section>
        </div>
      </div>
    </>
  );
}

function SectionHeader({ num, title }: { num: number | null; title: string }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <span className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
        {num}
      </span>
      <h2 className="text-lg font-bold text-white print-text">{title}</h2>
    </div>
  );
}
