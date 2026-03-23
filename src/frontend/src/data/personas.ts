export type Recommendation = { title: string; desc: string };

export type Persona = {
  name: string;
  description: string;
  eda: string;
  edaDetails: string[];
  keyMetrics: { label: string; value: string }[];
  recommendations: Recommendation[];
};

export const PERSONAS: Record<string, Persona> = {
  Premium: {
    name: "The Purchasing Customer",
    description:
      "Uses credit cards frequently for purchases. High credit utilization, high purchases, tends to pay off balance regularly. Motivated by convenience and rewards. These customers use their credit cards strictly for making purchases and tend to pay off the balance frequently.",
    eda: "High credit utilization, high purchase frequency, slightly high balance. Uses credit strictly for purchases.",
    edaDetails: [
      "High PURCHASES and PURCHASES_FREQUENCY — frequent card use for everyday spending",
      "Moderate-to-high balance maintained, suggesting some revolving credit",
      "Purchase/Balance quadrant: High Purchase / High Balance or High Purchase / Low Balance",
      "Uses credit for convenience and to accumulate rewards points",
    ],
    keyMetrics: [
      { label: "Purchase Frequency", value: "Very High" },
      { label: "Credit Utilization", value: "High" },
      { label: "Cash Advance", value: "Very Low" },
      { label: "Avg Credit Limit", value: "~5,000" },
    ],
    recommendations: [
      {
        title: "Rewards Programs",
        desc: "Earn points, cash back, or airline miles based on spending. Encourages card use and provides loyalty incentives.",
      },
      {
        title: "Premium Cards",
        desc: "Enhanced benefits for frequent users: airport lounge access, concierge services, travel insurance. Higher annual fees, more perks.",
      },
      {
        title: "Installment Plans",
        desc: "Convert larger purchases into smaller monthly payments to manage cash flow.",
      },
    ],
  },
  Standard: {
    name: "The Selective Customer",
    description:
      "Careful and deliberate approach to credit card usage, primarily for low/medium value infrequent purchases. Selective in spending choices, prioritizing low/medium value purchases rather than frequent small transactions.",
    eda: "Moderate credit utilization. Lower credit limit (median ~1,350). Infrequent but deliberate purchases.",
    edaDetails: [
      "Infrequent but deliberate purchases — selective spending choices",
      "Lower credit limit compared to Premium and Basic segments",
      "Purchase/Balance quadrant: Low Purchase / High Balance — high-value, infrequent transactions",
      "Tends to pay off balance over time rather than immediately",
    ],
    keyMetrics: [
      { label: "Purchase Frequency", value: "Low-Medium" },
      { label: "Credit Utilization", value: "Moderate" },
      { label: "Cash Advance", value: "Low" },
      { label: "Avg Credit Limit", value: "~1,350" },
    ],
    recommendations: [
      {
        title: "Value Purchase Financing",
        desc: "Specialized financing for infrequent purchases: pay over time with low or 0% interest rates. Affordable installment plans and cash flow flexibility.",
      },
      {
        title: "Extended Warranty Protection",
        desc: "Extended manufacturer warranty on high-value purchases. Coverage against unexpected repairs or replacements.",
      },
      {
        title: "Personalized Spending Insights",
        desc: "Detailed transaction categorization, spending trends, and tailored recommendations for informed financial decisions.",
      },
    ],
  },
  Basic: {
    name: "The Prudent Customer",
    description:
      "Takes a cautious and thoughtful approach to credit card usage. Responsible financial behavior, considers spending decisions carefully. Long account tenure indicates established customers with conservative habits.",
    eda: "Lower values across balance, cash advance, purchases. Long tenure (10+ months). Cautious card usage with some low-value purchases.",
    edaDetails: [
      "Low values for balance, cash advance, and purchases across the board",
      "Long tenure (10 months) — established but conservative customers",
      "Purchase/Balance quadrant: Low Purchase / Low Balance — minimal activity",
      "Could include young customers building their credit history",
    ],
    keyMetrics: [
      { label: "Purchase Frequency", value: "Low" },
      { label: "Credit Utilization", value: "Low-Moderate" },
      { label: "Cash Advance", value: "Minimal" },
      { label: "Avg Credit Limit", value: "~3,500" },
    ],
    recommendations: [
      {
        title: "Low Interest Cards",
        desc: "Credit cards with low APRs for managing balances with minimal interest charges. Maintains cautious approach without excessive fees.",
      },
      {
        title: "Secured Credit Cards",
        desc: "Build or rebuild credit with a security deposit as collateral. Establishes positive credit history.",
      },
      {
        title: "Fraud Protection & Monitoring",
        desc: "Enhanced fraud protection: real-time alerts, identity theft protection, and advanced security features for peace of mind.",
      },
    ],
  },
  "At-Risk": {
    name: "The Loanee Customer",
    description:
      "Uses credit cards as a means for taking out loans. Bridges financial gaps with high cash advances, resulting in high balance and high credit utilization. Cash advances are considered bad financial practice due to high fees, high interest rates, and negative credit score impact.",
    eda: "High balance, high cash advance, high credit utilization, very low purchases. Using credit card as a loan vehicle. Max cash advance observed: $47,000.",
    edaDetails: [
      "High CASH_ADVANCE — using credit card as a substitute for loans",
      "High BALANCE and high credit utilization (potentially above 100%)",
      "Very low purchases — card is not used for spending, only cash withdrawal",
      "2.6% of customers have credit utilization above 100% — extremely high default risk",
    ],
    keyMetrics: [
      { label: "Cash Advance", value: "Very High" },
      { label: "Credit Utilization", value: "Very High (>100%" },
      { label: "Purchase Frequency", value: "Very Low" },
      { label: "Default Risk", value: "High" },
    ],
    recommendations: [
      {
        title: "Balance Transfer Card Options",
        desc: "Transfer balance to 0% APR cards to save on interest rates and reduce financial burden.",
      },
      {
        title: "Debt Consolidation / Personal Loans",
        desc: "Consolidation loans with lower interest rates. Combine high-interest debts into single manageable payment.",
      },
      {
        title: "Credit Counseling",
        desc: "Guidance on managing debt, creating budgets, and making financial improvements.",
      },
    ],
  },
  Dormant: {
    name: "The Inactive Customer",
    description:
      "Very low or no recent credit card activity. Long account tenure but minimal engagement. May have abandoned card usage entirely. Reactivation strategies are key to unlocking revenue from this latent segment.",
    eda: "Very low score across all activity metrics. No recent purchases or transactions. Account exists but is unused.",
    edaDetails: [
      "Near-zero PURCHASES_FREQUENCY and PURCHASES_TRX",
      "Very low or zero balance — no revolving credit",
      "Account tenure may be long, but activity has ceased",
      "Purchase/Balance quadrant: Low Purchase / Low Balance — no meaningful engagement",
    ],
    keyMetrics: [
      { label: "Activity Level", value: "Minimal / None" },
      { label: "Purchase Frequency", value: "Near Zero" },
      { label: "Balance", value: "Very Low" },
      { label: "Re-engagement Potential", value: "High" },
    ],
    recommendations: [
      {
        title: "Re-engagement Campaigns",
        desc: "Targeted offers, cashback bonuses, and personalized incentives to motivate renewed card activity.",
      },
      {
        title: "Account Review Outreach",
        desc: "Proactive contact to understand reasons for inactivity and offer tailored solutions.",
      },
      {
        title: "Simplified Low-Fee Products",
        desc: "Offer no-annual-fee cards or simplified products to reduce barriers to re-engagement.",
      },
    ],
  },
};

export const CASE_STUDY = {
  problemStatement:
    "The banking industry struggles with understanding and meeting the diverse needs of customers, resulting in generic marketing approaches to financial product offerings that fall short of creating personalized experiences. A data-driven solution is required to effectively segment customers and create targeted personas for improved customer engagement and satisfaction, thus leading to increased revenue.",
  solution:
    "Customer segmentation divides a customer base into distinct groups based on shared characteristics, behaviors, preferences, or needs. By leveraging the k-means algorithm, financial institutions gain valuable insights into customer behavior, enabling the identification of distinct segments and development of personalized offerings.",
  implementationSteps: [
    {
      step: 1,
      title: "Data Collection & Integration",
      desc: "Gather customer data from transaction records, demographic information, and customer interactions.",
    },
    {
      step: 2,
      title: "Preprocessing & Feature Selection",
      desc: "Cleanse and preprocess data, selecting relevant features: transaction frequency, average balance, age, and customer preferences.",
    },
    {
      step: 3,
      title: "K-Means Clustering",
      desc: "Apply the k-means algorithm to segment customers based on similar behavioral patterns.",
    },
    {
      step: 4,
      title: "Persona Creation",
      desc: "Develop personas for each segment, incorporating demographic information, behaviors, preferences, and goals.",
    },
    {
      step: 5,
      title: "Implementation & Iteration",
      desc: "Implement personalized campaigns and track performance. Continuously refine segments based on feedback and evolving market dynamics.",
    },
  ],
  edaInsights: [
    {
      title: "Credit Utilization",
      icon: "📊",
      observations: [
        "2.6% of customers have credit utilization above 100% — extremely risky, high default probability.",
        "Healthy threshold is 30% or below. ~51% of customers are above this threshold.",
      ],
    },
    {
      title: "Cash Advance Cohorts",
      icon: "💳",
      observations: [
        "Low: < $1,000 | Medium: $1,001–$5,000 | High: > $5,000",
        "Max cash advance observed: $47,000. These customers use cards as loan vehicles.",
        "High fees, high interest rates, and negative credit score impact make this a risky behavior.",
      ],
    },
    {
      title: "Purchase/Balance Quadrant",
      icon: "🔢",
      observations: [
        "High Purchase / High Balance: Using card for all purchases to accumulate points, maintaining high balance.",
        "Low Purchase / High Balance: High-value purchases, taking time to pay off.",
        "High Purchase / Low Balance: Frequent purchases, paying off balance immediately.",
        "Low Purchase / Low Balance: Very few purchases — possibly young customers building credit.",
      ],
    },
  ],
  dataPrep: [
    "Filter to customers with tenure = 10 months.",
    "Add credit utilization feature (BALANCE / CREDIT_LIMIT).",
    "Remove CUST_ID, check for duplicates.",
    "Normalize with StandardScaler.",
    "PCA at 80% variance threshold → 5 principal components.",
  ],
  kmeansNote:
    "Elbow point on scree plot appears at 5 clusters. After first iteration, 1 outlier customer was excluded and re-clustering was performed with 4 clusters. The algorithm does a decent job of segmenting customers into distinct groups.",
  conclusion:
    "Customer segmentation and persona creation using the k-means algorithm have emerged as powerful tools in the banking industry. By leveraging data analytics and machine learning, banks can gain a deeper understanding of their customers, tailor offerings to specific segments, and deliver personalized experiences — leading to increased revenue and improved customer satisfaction.",
};
