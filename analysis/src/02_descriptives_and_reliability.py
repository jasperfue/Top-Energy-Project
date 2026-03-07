# %%
from pathlib import Path

import matplotlib.pyplot as plt
import pandas as pd
import pingouin as pg
import seaborn as sns

# Paths
PROCESSED_DATA_PATH = Path("./data/processed/cleaned_data.csv")
OUTPUT_PATH = Path("./output")
OUTPUT_PATH.mkdir(parents=True, exist_ok=True)
PLOTS_PATH = OUTPUT_PATH / "plots"
PLOTS_PATH.mkdir(parents=True, exist_ok=True)

# Plot style (academic & consistent with hypothesis testing)
sns.set_theme(style="whitegrid", context="paper", font_scale=1.2)
plt.rcParams.update({"figure.dpi": 150, "savefig.dpi": 300, "savefig.bbox": "tight"})

# %%
# --- 1. Load Data ---
df = pd.read_csv(PROCESSED_DATA_PATH)
print(
    f"Loaded {len(df)} participants | Conditions: {df['Studienvariante'].unique().tolist()}"
)
print(df.shape)

# %%
# --- 2. Reliability Check: Cronbach's Alpha ---

# Map each construct to its raw item columns
RELIABILITY_CONSTRUCTS = {
    "ATI": [f"afftech_q{i}" for i in range(1, 10)],
    "Trust_Competence": [
        "trust_comp_1",
        "trust_comp_2",
        "trust_comp_3",
        "trust_comp_4",
    ],
    "Trust_Benevolence": ["trust_ben_1", "trust_ben_2", "trust_ben_3"],
    "Trust_Integrity": ["trust_int_1", "trust_int_2", "trust_int_3", "trust_int_4"],
    "Understanding_Subjective": ["understanding_q1", "understanding_q2"],
    "Intention": ["intention_q1", "intention_q2", "intention_q3"],
    "UEQ_Pragmatic": ["ueq_1", "ueq_2_swapped", "ueq_3", "ueq_4_swapped"],
    "UEQ_Hedonic": ["ueq_5", "ueq_6_swapped", "ueq_7", "ueq_8_swapped"],
}

reliability_rows = []
for construct, items in RELIABILITY_CONSTRUCTS.items():
    alpha, ci = pg.cronbach_alpha(data=df[items])
    reliability_rows.append(
        {
            "Construct": construct,
            "n_items": len(items),
            "Cronbach_Alpha": round(alpha, 3),
            "CI_lower": round(ci[0], 3),
            "CI_upper": round(ci[1], 3),
        }
    )

reliability_df = pd.DataFrame(reliability_rows)
print("\n=== Cronbach's Alpha Summary ===")
print(reliability_df.to_string(index=False))

# %%
# --- 3. Descriptive Statistics by Condition ---

CONSTRUCT_SCORES = [
    "ATI_Score",
    "Trust_Competence",
    "Trust_Benevolence",
    "Trust_Integrity",
    "Trust_Overall",
    "Understanding_Subjective",
    "Understanding_Objective",
    "Intention",
    "UEQ_Pragmatic",
    "UEQ_Hedonic",
    "Duration_Minutes",
]

descriptive_stats = (
    df.groupby("Studienvariante")[CONSTRUCT_SCORES]
    .agg(["mean", "std", "min", "max"])
    .round(3)
)

# Flatten multi-level columns: e.g. ("ATI_Score", "mean") -> "ATI_Score_mean"
descriptive_stats.columns = ["_".join(col) for col in descriptive_stats.columns]
descriptive_stats = descriptive_stats.reset_index()

print("\n=== Descriptive Statistics by Condition ===")
print(descriptive_stats.to_string(index=False))

# %%
# --- 4. Demographics Check & Sample Characteristics ---

print("\n=== OVERALL SAMPLE CHARACTERISTICS ===")

# 4.1 Overall Age
if "age" in df.columns:
    age_mean = df["age"].mean()
    age_std = df["age"].std()
    age_min = df["age"].min()
    age_max = df["age"].max()
    print(f"Age: M = {age_mean:.2f}, SD = {age_std:.2f}, Range = {age_min} - {age_max}")

# 4.2 Overall Percentages for Categorical Variables
DEMOGRAPHIC_VARS = [
    "gender",
    "occupation_role",
    "investment_experience",
    "energy_knowledge",
]

for var in DEMOGRAPHIC_VARS:
    if var in df.columns:
        print(f"\n-- Overall: {var} --")
        counts = df[var].value_counts()
        pcts = df[var].value_counts(normalize=True) * 100
        summary_df = pd.DataFrame({"Count": counts, "Percent (%)": pcts.round(1)})
        print(summary_df.to_string())

print("\n=== DEMOGRAPHICS DISTRIBUTION BY CONDITION (COUNTS) ===")
# 4.3 Group Balance (Counts per Condition)
for var in DEMOGRAPHIC_VARS:
    if var in df.columns:
        print(f"\n-- {var} by Condition --")
        counts = df.groupby(["Studienvariante", var]).size().unstack(fill_value=0)
        print(counts.to_string())

# %%
# --- 5. Export Descriptive Summary ---

out_file = OUTPUT_PATH / "descriptive_stats.csv"
descriptive_stats.to_csv(out_file, index=False)
print(f"\nDescriptive statistics saved to: {out_file}")

# %%
# --- 6. Demographic Visualizations ---
print("\n=== Generating Demographic Plots ===")

CONDITION_PALETTE = {"Chat": "#4C72B0", "Dashboard": "#DD8452"}

# 6.1 Age Distribution
if "age" in df.columns:
    fig, ax = plt.subplots(figsize=(6, 4))
    sns.histplot(data=df, x="age", bins=10, kde=True, color="gray", ax=ax)
    ax.set_title("Age Distribution of Participants", fontweight="bold")
    ax.set_xlabel("Age (Years)")
    ax.set_ylabel("Frequency")
    fig.tight_layout()
    fig.savefig(PLOTS_PATH / "demo_age_distribution.png")
    plt.close(fig)

# 6.2 Domain Knowledge & Experience by Condition
# We plot Energy Knowledge and Investment Experience side-by-side
if "energy_knowledge" in df.columns and "investment_experience" in df.columns:
    fig, axes = plt.subplots(1, 2, figsize=(12, 5))
    
    # Plot 1: Energy Knowledge
    sns.countplot(
        data=df, 
        x="energy_knowledge", 
        hue="Studienvariante", 
        palette=CONDITION_PALETTE, 
        ax=axes[0]
    )
    axes[0].set_title("Self-Reported Energy Knowledge", fontweight="bold")
    axes[0].set_xlabel("Knowledge Level")
    axes[0].set_ylabel("Number of Participants")
    axes[0].legend(title="Condition")

    # Plot 2: Investment Experience
    sns.countplot(
        data=df, 
        x="investment_experience", 
        hue="Studienvariante", 
        palette=CONDITION_PALETTE, 
        ax=axes[1]
    )
    axes[1].set_title("Prior Investment Experience", fontweight="bold")
    axes[1].set_xlabel("Experience Level")
    axes[1].set_ylabel("Number of Participants")
    axes[1].legend(title="Condition")

    # Clean up x-axis labels if they are too long
    for ax in axes:
        ax.tick_params(axis='x', rotation=15)

    fig.tight_layout()
    fig.savefig(PLOTS_PATH / "demo_background_by_condition.png")
    plt.close(fig)

print(f"Demographic plots saved to: {PLOTS_PATH}")