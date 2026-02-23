# %%
from pathlib import Path

import pandas as pd
import pingouin as pg

# Paths
PROCESSED_DATA_PATH = Path("./data/processed/cleaned_data.csv")
OUTPUT_PATH = Path("./output")
OUTPUT_PATH.mkdir(parents=True, exist_ok=True)

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
# --- 4. Demographics Check: Group Balance ---

DEMOGRAPHIC_VARS = [
    "gender",
    "occupation_role",
    "investment_experience",
    "energy_knowledge",
]

print("\n=== Demographics Distribution by Condition ===")
for var in DEMOGRAPHIC_VARS:
    print(f"\n-- {var} --")
    counts = df.groupby(["Studienvariante", var]).size().unstack(fill_value=0)
    print(counts.to_string())

# %%
# --- 5. Export Descriptive Summary ---

out_file = OUTPUT_PATH / "descriptive_stats.csv"
descriptive_stats.to_csv(out_file, index=False)
print(f"\nDescriptive statistics saved to: {out_file}")
