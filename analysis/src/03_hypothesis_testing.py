# %%
# =============================================================================
# 03_hypothesis_testing.py
# Hypothesis testing for Master's Thesis RCT
# H1: Explanation type → Understanding
# H2: Explanation type → Trust
# H3: Explanation type → Trust/Understanding → Intention (Mediation)
# =============================================================================

from pathlib import Path

import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
import pingouin as pg
import seaborn as sns
from statsmodels.formula.api import ols
from statsmodels.stats.anova import anova_lm

# --- Paths ---
PROCESSED_DATA_PATH = Path("./data/processed/cleaned_data.csv")
PLOTS_PATH = Path("./output/plots")
PLOTS_PATH.mkdir(parents=True, exist_ok=True)

# --- Plot style (academic) ---
sns.set_theme(style="whitegrid", context="paper", font_scale=1.2)
plt.rcParams.update({"figure.dpi": 150, "savefig.dpi": 300, "savefig.bbox": "tight"})

# %%
# --- Load Data ---
df = pd.read_csv(PROCESSED_DATA_PATH)
print(
    f"Loaded {len(df)} participants | Conditions: {df['Studienvariante'].unique().tolist()}"
)
print(f"Note: Small N={len(df)} — interpret p-values alongside effect sizes (η²p).\n")

# Binary encoding for mediation (Dashboard=1, Chat=0)
df["Studienvariante_Num"] = (df["Studienvariante"] == "Dashboard").astype(int)

# --- Variable definitions ---
COVARIATES = [
    "ATI_Score",
    "Energy_Knowledge_Num",
    "Investment_Experience_Num",
]  # Extend with "Energy_Knowledge_Num", "Investment_Experience_Num" if needed
CONDITION = "Studienvariante"
CONDITION_NUM = "Studienvariante_Num"

UNDERSTANDING_DVS = ["Understanding_Subjective", "Understanding_Objective"]
TRUST_DVS = ["Trust_Competence", "Trust_Benevolence", "Trust_Integrity"]
INTENTION_DV = "Intention"
TRUST_OVERALL = "Trust_Overall"

# %%
# =============================================================================
# SECTION 1: Covariate Selection Check
# Pearson correlations between potential covariates and main DVs
# =============================================================================
POTENTIAL_COVARIATES = [
    "ATI_Score",
    "Energy_Knowledge_Num",
    "Investment_Experience_Num",
]
MAIN_DVS = [
    "Understanding_Subjective",
    "Understanding_Objective",
    "Trust_Overall",
    "Intention",
]

print("=" * 65)
print("COVARIATE SELECTION CHECK — Pearson Correlations (r) with DVs")
print("=" * 65)

corr_rows = []
for cov in POTENTIAL_COVARIATES:
    row = {"Covariate": cov}
    for dv in MAIN_DVS:
        result = pg.corr(df[cov], df[dv], method="pearson")
        r = result["r"].values[0]
        p = result["p-val"].values[0]
        sig = "*" if p < 0.05 else ""
        row[dv] = f"{r:.3f}{sig}"
    corr_rows.append(row)

corr_table = pd.DataFrame(corr_rows).set_index("Covariate")
print(corr_table.to_string())
print("\n* p < .05 | Values are Pearson r")
print(f"\nSelected covariate(s) for ANCOVAs: {COVARIATES}")

# %%
# =============================================================================
# ANCOVA helper using statsmodels OLS + Type III SS
# (pingouin 0.5.5 has a numpy 2.x incompatibility in its ancova function;
#  statsmodels OLS produces identical ANCOVA results)
# =============================================================================


def run_ancova(
    data: pd.DataFrame, dv: str, between: str, covariates: list[str]
) -> None:
    """
    Run a one-way ANCOVA via OLS (Type III SS) and print the ANOVA table
    with partial eta-squared (η²p = SS_effect / (SS_effect + SS_residual)).
    """
    covar_terms = " + ".join(covariates)
    formula = f"Q('{dv}') ~ C(Q('{between}')) + {covar_terms}"
    model = ols(formula, data=data).fit()
    # Type III SS so marginal effects are independent of covariate
    aov_table = anova_lm(model, typ=3)

    # Rename index for readability
    label_map = {
        f"C(Q('{between}'))": between,
        "Residual": "Residual",
        "Intercept": "Intercept",
    }
    for cov in covariates:
        label_map[cov] = cov
    aov_table.index = [label_map.get(i, i) for i in aov_table.index]

    ss_residual = aov_table.loc["Residual", "sum_sq"]
    aov_table["η²p"] = aov_table["sum_sq"].apply(
        lambda ss: round(ss / (ss + ss_residual), 3)
    )
    aov_table.loc["Residual", "η²p"] = np.nan

    # Print tidy table (drop Intercept row for brevity)
    display_cols = ["sum_sq", "df", "F", "PR(>F)", "η²p"]
    print(
        aov_table.loc[aov_table.index != "Intercept", display_cols]
        .rename(columns={"sum_sq": "SS", "df": "DF", "PR(>F)": "p"})
        .to_string()
    )

    # Descriptive means per condition
    desc = data.groupby(between)[dv].agg(["mean", "std", "count"]).round(3)
    print(f"\n  Group means:\n{desc.to_string()}")


# %%
# =============================================================================
# SECTION 2: H1 — Effect of Explanation Type on Understanding (ANCOVA)
# =============================================================================
print("\n" + "=" * 65)
print("H1: ANCOVA — Understanding")
print("Between-factor: Studienvariante | Covariate(s):", COVARIATES)
print("=" * 65)

for dv in UNDERSTANDING_DVS:
    print(f"\n--- DV: {dv} ---")
    run_ancova(df, dv, CONDITION, COVARIATES)

# %%
# =============================================================================
# SECTION 3: H2 — Effect of Explanation Type on Trust (ANCOVA)
# =============================================================================
print("\n" + "=" * 65)
print("H2: ANCOVA — Trust Dimensions")
print("Between-factor: Studienvariante | Covariate(s):", COVARIATES)
print("=" * 65)

for dv in TRUST_DVS:
    print(f"\n--- DV: {dv} ---")
    run_ancova(df, dv, CONDITION, COVARIATES)

# %%
# =============================================================================
# SECTION 4: H3 — Mediation Analysis (pingouin)
# IV: Studienvariante_Num (Dashboard=1, Chat=0)
# DV: Intention
# Mediation 1: Trust_Overall (H3b/H3c)
# Mediation 2: Understanding_Objective (H3a)
# =============================================================================
print("\n" + "=" * 65)
print("H3: MEDIATION ANALYSIS")
print(f"IV: {CONDITION_NUM} (Dashboard=1, Chat=0) | DV: {INTENTION_DV}")
print("=" * 65)

MEDIATIONS = [
    (TRUST_OVERALL, "H3b/H3c — Mediator: Trust_Overall"),
    ("Understanding_Objective", "H3a — Mediator: Understanding_Objective"),
]

for mediator, label in MEDIATIONS:
    print(f"\n--- {label} ---")
    med = pg.mediation_analysis(
        data=df,
        x=CONDITION_NUM,
        m=mediator,
        y=INTENTION_DV,
        alpha=0.05,
        n_boot=5000,
        seed=42,
    )
    print(
        med[["path", "coef", "se", "pval", "CI[2.5%]", "CI[97.5%]"]].to_string(
            index=False
        )
    )

    # Highlight indirect effect
    indirect = med[med["path"] == "Indirect"]
    if not indirect.empty:
        row = indirect.iloc[0]
        sig_note = (
            "SIGNIFICANT"
            if row["CI[2.5%]"] * row["CI[97.5%]"] > 0
            else "not significant"
        )
        print(
            f"\n  Indirect effect (a×b): coef={row['coef']:.3f}, "
            f"95% CI [{row['CI[2.5%]']:.3f}, {row['CI[97.5%]']:.3f}] — {sig_note}"
        )

# %%
# =============================================================================
# SECTION 5: Visualizations
# Bar charts with 95% CI error bars, grouped by Studienvariante
# =============================================================================

CONDITION_ORDER = ["Chat", "Dashboard"]
CONDITION_PALETTE = {"Chat": "#4C72B0", "Dashboard": "#DD8452"}


# Helper: compute 95% CI half-width
def ci95(series: pd.Series) -> float:
    """Return the 95% CI half-width (±) for a series."""
    n = series.count()
    se = series.std(ddof=1) / np.sqrt(n)
    return 1.96 * se


def plot_bar_ci(
    ax: plt.Axes,
    variables: list[str],
    labels: list[str],
    title: str,
    ylabel: str = "Mean Score (1–7)",
    ylim: tuple = (1, 7.5),
) -> None:
    """
    Plot grouped bar chart (Condition × Variables) with 95% CI error bars.
    """
    x = np.arange(len(variables))
    width = 0.35
    offsets = {"Chat": -width / 2, "Dashboard": width / 2}

    for cond, offset in offsets.items():
        means = [df[df[CONDITION] == cond][v].mean() for v in variables]
        errors = [ci95(df[df[CONDITION] == cond][v]) for v in variables]
        ax.bar(
            x + offset,
            means,
            width,
            label=cond,
            color=CONDITION_PALETTE[cond],
            yerr=errors,
            capsize=5,
            error_kw={"elinewidth": 1.5, "ecolor": "black"},
            alpha=0.88,
        )

    ax.set_xticks(x)
    ax.set_xticklabels(labels, fontsize=11)
    ax.set_ylabel(ylabel, fontsize=11)
    ax.set_title(title, fontsize=12, fontweight="bold")
    ax.set_ylim(ylim)
    ax.legend(title="Condition", frameon=True)
    ax.yaxis.grid(True, linestyle="--", alpha=0.7)
    ax.set_axisbelow(True)


# --- Figure A: Understanding (Split into two subplots) ---
fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(10, 5))

# Left: Subjective Understanding
plot_bar_ci(
    ax1,
    variables=["Understanding_Subjective"],
    labels=["Subjective"],
    title="Subjective Understanding",
    ylabel="Mean Score (1–7)",
    ylim=(1, 7.5),
)

# Right: Objective Understanding
plot_bar_ci(
    ax2,
    variables=["Understanding_Objective"],
    labels=["Objective"],
    title="Objective Understanding",
    ylabel="Correct Answers (0–2)",
    ylim=(0, 2.5),  # Adjusted for the 0-2 scale plus error bars
)

fig.suptitle(
    "H1: Understanding by Explanation Type\n(Mean ± 95% CI)",
    fontsize=14,
    fontweight="bold",
)
fig.tight_layout()
fig.savefig(PLOTS_PATH / "H1_understanding.png")
print(f"Saved: {PLOTS_PATH / 'H1_understanding.png'}")
plt.close(fig)

# --- Figure B: Trust Dimensions ---
fig, ax = plt.subplots(figsize=(7, 5))
plot_bar_ci(
    ax,
    variables=["Trust_Competence", "Trust_Benevolence", "Trust_Integrity"],
    labels=["Competence", "Benevolence", "Integrity"],
    title="H2: Trust Dimensions by Explanation Type\n(Mean ± 95% CI)",
    ylim=(1, 7.5),
)
fig.tight_layout()
fig.savefig(PLOTS_PATH / "H2_trust_dimensions.png")
print(f"Saved: {PLOTS_PATH / 'H2_trust_dimensions.png'}")
plt.close(fig)

# --- Figure C: Intention ---
fig, ax = plt.subplots(figsize=(4.5, 5))
plot_bar_ci(
    ax,
    variables=["Intention"],
    labels=["Implementation\nIntention"],
    title="H3: Intention by Explanation Type\n(Mean ± 95% CI)",
    ylim=(1, 7.5),
)
fig.tight_layout()
fig.savefig(PLOTS_PATH / "H3_intention.png")
print(f"Saved: {PLOTS_PATH / 'H3_intention.png'}")
plt.close(fig)

print("\nAll plots saved to:", PLOTS_PATH)
